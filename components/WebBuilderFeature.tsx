import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Message, TabOption } from '../types';
import { Sidebar } from './Sidebar';
import { ChatInput } from './ChatInput';
import { PreviewPane } from './PreviewPane';
import { ProjectThumbnail } from './ProjectThumbnail';
import { streamWebsiteCode } from '../services/geminiService';
import { useUserActivity } from '../src/hooks/useUserActivity';
import { supabase } from '../src/lib/supabase';
import { vi } from '../src/locales/vi';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Rocket,
  Smartphone,
  Monitor,
  Tablet,
  LayoutTemplate,
  Type,
  Image as ImageIcon,
  Box,
  Grid,
  Layers,
  Palette,
  Settings,
  Undo,
  Redo,
  Eye,
  Code,
  Plus,
  MessageSquare,
  Check,
  Copy,
  ChevronLeft
} from "lucide-react";

// --- Helper Functions ---

const cleanGeneratedCode = (code: string) => {
    return code.replace(/^```html\s*/, '').replace(/^```\s*/, '').replace(/```$/, '');
};

const generateProjectName = () => {
    const adj = ['cosmic', 'neon', 'hyper', 'stellar', 'quantum', 'pixel', 'rapid', 'sonic'];
    const noun = ['dashboard', 'shop', 'portfolio', 'stream', 'hub', 'canvas', 'forge', 'labs'];
    const randomAdj = adj[Math.floor(Math.random() * adj.length)];
    const randomNoun = noun[Math.floor(Math.random() * noun.length)];
    const num = Math.floor(Math.random() * 100);
    return `${randomAdj}-${randomNoun}-${num}`;
};

// --- Mock Data for Tools ---

const TOOL_CATEGORIES = [
    {
        id: 'structure',
        label: 'Cấu trúc',
        icon: <LayoutTemplate className="w-4 h-4" />,
        tools: [
            { label: 'Hero Section', prompt: 'Thêm một Hero section ấn tượng vào đầu trang với tiêu đề lớn, mô tả ngắn và nút kêu gọi hành động.' },
            { label: 'Footer', prompt: 'Thêm phần Footer chuyên nghiệp ở cuối trang với các liên kết, thông tin bản quyền và mạng xã hội.' },
            { label: 'Grid 2 Cột', prompt: 'Thêm một section chia thành 2 cột cân đối, phù hợp để giới thiệu tính năng hoặc hình ảnh bên cạnh văn bản.' },
            { label: 'Grid 3 Cột', prompt: 'Thêm một section chia thành 3 cột, thích hợp để hiển thị danh sách dịch vụ hoặc tính năng.' },
        ]
    },
    {
        id: 'content',
        label: 'Nội dung',
        icon: <Type className="w-4 h-4" />,
        tools: [
            { label: 'Giới thiệu', prompt: 'Thêm section giới thiệu về chúng tôi với hình ảnh bên trái và văn bản bên phải.' },
            { label: 'Tính năng', prompt: 'Thêm section danh sách tính năng nổi bật với icon và mô tả ngắn gọn.' },
            { label: 'Bảng giá', prompt: 'Thêm bảng giá dịch vụ với 3 gói: Cơ bản, Tiêu chuẩn và Cao cấp.' },
            { label: 'FAQ', prompt: 'Thêm phần Câu hỏi thường gặp (FAQ) dạng accordion.' },
            { label: 'Testimonials', prompt: 'Thêm phần Đánh giá khách hàng (Testimonials) dạng slider hoặc grid.' },
        ]
    },
    {
        id: 'media',
        label: 'Media',
        icon: <ImageIcon className="w-4 h-4" />,
        tools: [
            { label: 'Thư viện ảnh', prompt: 'Thêm một thư viện hình ảnh (Image Gallery) đẹp mắt dạng lưới.' },
            { label: 'Video Player', prompt: 'Thêm một trình phát video nhúng (Youtube/Vimeo) với khung viền đẹp.' },
        ]
    },
    {
        id: 'form',
        label: 'Form',
        icon: <Box className="w-4 h-4" />,
        tools: [
            { label: 'Liên hệ', prompt: 'Thêm form liên hệ chuyên nghiệp gồm các trường: Họ tên, Email, Số điện thoại và Nội dung.' },
            { label: 'Đăng ký Newsletter', prompt: 'Thêm form đăng ký nhận tin (Newsletter) đơn giản với trường Email.' },
        ]
    }
];

interface WebBuilderFeatureProps {
    initialPrompt?: string;
    trigger?: number;
    currentProject?: any;
    onProjectChange?: (project: any) => void;
}

export const WebBuilderFeature: React.FC<WebBuilderFeatureProps> = ({
    initialPrompt,
    trigger,
    currentProject,
    onProjectChange
}) => {
    // --- State ---
    const [messages, setMessages] = useState<Message[]>([]);
    const [generatedCode, setGeneratedCode] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<TabOption>(TabOption.PREVIEW);
    const [hasStarted, setHasStarted] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [projectId, setProjectId] = useState<string | null>(null);
    const [progress, setProgress] = useState<number>(0);
    const [isHoldPlaying, setIsHoldPlaying] = useState<boolean>(false);
    const [copied, setCopied] = useState(false);
    
    // UI State
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [rightPanelOpen, setRightPanelOpen] = useState(true);
    const [deployedUrl, setDeployedUrl] = useState<string | null>(null);
    const [isDeploying, setIsDeploying] = useState(false);
    const [showDeploySuccess, setShowDeploySuccess] = useState(false);
    const [savedProjects, setSavedProjects] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 12;

    // Refs
    const holdAudioRef = useRef<HTMLAudioElement | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const lastTriggerRef = useRef<number | null>(null);
    const ignoreNextTriggerRef = useRef<boolean>(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastUserPromptRef = useRef<{ text: string; time: number } | null>(null);

    const { trackActivity } = useUserActivity();

    // --- Effects ---

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'PREVIEW_ERROR') {
                const errorMessage = event.data.message || 'Unknown error';
                const errorMsg: Message = {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: `${vi.messages.errorDetected}\n\n\`\`\`\n${errorMessage}\n\`\`\``,
                    action: {
                        label: vi.errors.fixButton,
                        type: 'fix',
                        payload: { error: errorMessage }
                    }
                };
                setMessages(prev => [...prev, errorMsg]);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    useEffect(() => {
        if (currentProject) {
            setProjectId(currentProject.id);
            setProjectName(currentProject.project_name || currentProject.name);
            setGeneratedCode(currentProject.html_content || '');
            setMessages(currentProject.messages || []);
            setHasStarted(true);
            setProgress(100);
            if (currentProject.subdomain) {
                const url = currentProject.subdomain.startsWith('http')
                    ? currentProject.subdomain
                    : `https://${currentProject.subdomain}`;
                setDeployedUrl(url);
                setShowDeploySuccess(true);
            }
            if (currentProject.html_content) {
                setActiveTab(TabOption.PREVIEW);
            }
        } else {
            // Load saved projects
            fetchSavedProjects();
        }
    }, [currentProject]);

    const fetchSavedProjects = async () => {
        try {
            const user_id = 'local-dev-user'; // Mock user ID
            const res = await fetch(`http://localhost:3001/api/websites/${user_id}`);
            if (res.ok) {
                const projects = await res.json();
                setSavedProjects(projects);
            }
        } catch (err) {
            console.error("Failed to load projects", err);
        }
    };

    const loadProject = (project: any) => {
        setProjectId(project.id);
        setProjectName(project.name);
        setGeneratedCode(project.html_content || '');
        setMessages(project.messages || []);
        setHasStarted(true);
        setProgress(100);
        if (project.subdomain) {
             // Check if it's a full URL or just subdomain
             const url = project.subdomain.startsWith('http') 
                ? project.subdomain 
                : `http://localhost:3000/preview/${project.id}`; // Use local preview URL
             setDeployedUrl(url);
             setShowDeploySuccess(true);
        }
        setActiveTab(TabOption.PREVIEW);
    };

    useEffect(() => {
        if (!initialPrompt) return;
        if (!hasStarted && messages.length === 0 && !projectId) {
            ignoreNextTriggerRef.current = true;
            handleStart(initialPrompt);
            return;
        }
        if (typeof trigger === 'number') {
            if (ignoreNextTriggerRef.current) {
                ignoreNextTriggerRef.current = false;
                lastTriggerRef.current = trigger;
                return;
            }
            if (trigger !== lastTriggerRef.current) {
                lastTriggerRef.current = trigger;
                handleSend(initialPrompt);
            }
        }
    }, [initialPrompt, trigger, hasStarted, messages.length, projectId]);

    // --- Actions ---

    const saveProject = async (code: string, msgs: Message[]) => {
        try {
            // Use local mock user for Docker mode
            const user = { id: 'local-dev-user' };

            const currentProjectName = projectName || generateProjectName();
            if (!projectName) setProjectName(currentProjectName);

            const timestamp = Date.now().toString(36);
            const sanitizedName = currentProjectName.toLowerCase().replace(/[^a-z0-9-]/g, '-').substring(0, 50);
            const uniqueSubdomain = `${sanitizedName}-${timestamp}`;

            const projectData = {
                id: projectId,
                user_id: user.id,
                name: currentProjectName,
                subdomain: projectId ? undefined : uniqueSubdomain,
                html_content: code,
                messages: msgs
            };

            const response = await fetch('http://localhost:3001/api/websites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectData)
            });

            if (!response.ok) throw new Error('Failed to save to local server');
            const data = await response.json();

            if (data) {
                setProjectId(data.id);
                setProjectName(data.name);
                if (onProjectChange) onProjectChange(data);
            }
        } catch (err) {
            console.error('Error saving project:', err);
        }
    };

    const triggerSave = useCallback((code: string, msgs: Message[]) => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
            saveProject(code, msgs);
        }, 2000);
    }, [projectId, projectName]);

    const handleSend = useCallback(async (content: string) => {
        const normalized = String(content || '').trim();
        const now = Date.now();
        const last = lastUserPromptRef.current;
        if (last && last.text === normalized && (now - last.time) < 5000) return;
        lastUserPromptRef.current = { text: normalized, time: now };

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: normalized };
        const assistantMsgId = (Date.now() + 1).toString();
        const assistantMsg: Message = { id: assistantMsgId, role: 'assistant', content: '', isStreaming: true };

        setMessages(prev => {
            const last = prev[prev.length - 1];
            const shouldAddUser = !(last && last.role === 'user' && last.content.trim() === normalized);
            const next = [...prev];
            if (shouldAddUser) next.push(userMsg);
            next.push(assistantMsg);
            return next;
        });

        setIsLoading(true);
        setProgress(10);
        // Sound logic removed for brevity but can be re-added
        
        setActiveTab(TabOption.PREVIEW); // Always show Preview as per user request

        if (abortControllerRef.current) abortControllerRef.current.abort();
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        try {
            const stream = streamWebsiteCode(normalized, generatedCode);
            let fullResponse = '';
            let codePart = '';
            let logPart = '';
            let currentGeneratedCode = generatedCode;

            for await (const chunk of stream) {
                if (abortController.signal.aborted) break;
                fullResponse += chunk;
                const codeStartIndex = fullResponse.indexOf('<!DOCTYPE html>');

                if (codeStartIndex !== -1) {
                    logPart = fullResponse.substring(0, codeStartIndex);
                    codePart = fullResponse.substring(codeStartIndex);
                    currentGeneratedCode = cleanGeneratedCode(codePart);
                    setGeneratedCode(currentGeneratedCode);
                    setProgress((p) => (p < 90 ? 90 : p));
                    setMessages(prev => prev.map(msg => msg.id === assistantMsgId ? { ...msg, content: logPart } : msg));
                } else {
                    logPart = fullResponse;
                    setMessages(prev => prev.map(msg => msg.id === assistantMsgId ? { ...msg, content: logPart } : msg));
                    const buildMatches = logPart.match(/\[BUILD\]/g);
                    const count = buildMatches ? buildMatches.length : 0;
                    setProgress(Math.min(85, 10 + count * 6));
                }
            }

            setMessages(prev => {
                const newMsgs = prev.map(msg => msg.id === assistantMsgId ? { ...msg, isStreaming: false } : msg);
                triggerSave(currentGeneratedCode, newMsgs);
                return newMsgs;
            });

            if (!abortController.signal.aborted) {
                setActiveTab(TabOption.PREVIEW);
            }

            setMessages(prev => [...prev, {
                id: (Date.now() + 2).toString(),
                role: 'assistant',
                content: vi.generation.complete,
                isStreaming: false
            }]);

            setProgress(100);
        } catch (error) {
            console.error(error);
            setMessages(prev => prev.map(msg => msg.id === assistantMsgId ? { ...msg, content: "Error processing request.", isStreaming: false } : msg));
        } finally {
            setIsLoading(false);
        }
    }, [generatedCode, triggerSave]);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(generatedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleStart = (prompt: string) => {
        const newName = generateProjectName();
        setProjectName(newName);
        setHasStarted(true);
        trackActivity({
            feature_type: 'web-builder',
            action_type: 'create',
            action_details: { project_name: newName, prompt: prompt.substring(0, 100) }
        });
        handleSend(prompt);
    };

    const handleDeploy = async () => {
        setIsDeploying(true);
        try {
            // Save first
            await saveProject(generatedCode, messages);
            
            // Mock deployment for local docker mode
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const mockUrl = `http://localhost:3000/preview/${projectId || 'demo'}`;
            setDeployedUrl(mockUrl);
            setShowDeploySuccess(true);
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: `${vi.deployment.success} (Local Mode)` }]);
        } catch (err: any) {
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: `Deploy failed: ${err.message}` }]);
        } finally {
            setIsDeploying(false);
        }
    };

    // --- Render ---

    if (!hasStarted) {
        return (
            <div className="h-full w-full flex flex-col items-center relative overflow-y-auto font-sans neu-bg text-foreground">
                <div className="w-full max-w-5xl mx-auto px-6 py-12 flex flex-col items-center min-h-full">
                    
                    {/* Header Section */}
                    <div className="flex flex-col items-center text-center mb-10 animate-fade-in-up shrink-0">
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 text-foreground">
                            Locaith <span className="text-primary">Builder</span>
                        </h1>
                        <p className="text-muted-foreground max-w-lg mx-auto text-base md:text-lg leading-relaxed">
                            Xây dựng website chuyên nghiệp với sự hỗ trợ của AI. Chỉ cần mô tả ý tưởng của bạn.
                        </p>
                    </div>

                    {/* Input Section */}
                    <div className="w-full max-w-3xl shrink-0 mb-10 z-20">
                         <ChatInput
                            onSend={handleStart}
                            isLoading={false}
                            placeholder="Mô tả website bạn muốn xây dựng..."
                            isLandingPage={true}
                        />
                        
                        {/* Suggestion Chips */}
                        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                             {['Portfolio cá nhân', 'Landing Page sản phẩm', 'Blog tin tức', 'Cửa hàng trực tuyến'].map((suggestion) => (
                                 <Button 
                                    key={suggestion} 
                                    variant="ghost"
                                    className="h-auto py-3 px-4 text-xs md:text-sm whitespace-normal rounded-xl neu-flat hover:neu-pressed text-muted-foreground hover:text-primary transition-all duration-300"
                                    onClick={() => handleStart(`Tạo một ${suggestion} chuyên nghiệp và hiện đại.`)}
                                 >
                                    {suggestion}
                                 </Button>
                             ))}
                        </div>
                    </div>

                    {/* Recent Projects Section */}
                    {savedProjects.length > 0 && (
                        <div className="w-full max-w-5xl flex flex-col animate-fade-in mt-4">
                            <div className="flex items-center justify-between mb-4 shrink-0 px-1">
                                <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                                    <LayoutTemplate className="w-5 h-5 text-primary" />
                                    Dự án gần đây
                                </h2>
                                <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
                                    {savedProjects.length} dự án
                                </span>
                            </div>
                            
                            <div className="w-full rounded-2xl neu-pressed p-6 border border-border/50">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {savedProjects
                                        .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                                        .map((project) => (
                                        <div 
                                            key={project.id}
                                            onClick={() => loadProject(project)}
                                            className="group relative neu-flat rounded-xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-all duration-300 border border-transparent hover:border-primary/30"
                                        >
                                            <div className="aspect-video bg-muted/30 relative flex items-center justify-center overflow-hidden group-hover:opacity-90 transition-opacity">
                                                {project.html_content ? (
                                                    <ProjectThumbnail htmlContent={project.html_content} />
                                                ) : (
                                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
                                                )}
                                                
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[2px]">
                                                    <Button size="sm" className="bg-primary text-primary-foreground shadow-lg rounded-full">
                                                        Mở dự án
                                                    </Button>
                                                </div>
                                            </div>
                                            
                                            <div className="p-4">
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <h3 className="font-semibold text-foreground truncate flex-1" title={project.name || project.project_name}>
                                                        {project.name || project.project_name}
                                                    </h3>
                                                    <span className={`w-2 h-2 rounded-full shrink-0 mt-2 ${project.subdomain ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-yellow-500'}`} />
                                                </div>
                                                <p className="text-xs text-muted-foreground line-clamp-2 h-8 mb-3">
                                                    {project.description || "Dự án web được tạo bởi AI Builder"}
                                                </p>
                                                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                                                    <span className="flex items-center gap-1">
                                                        <LayoutTemplate className="w-3 h-3" /> Website
                                                    </span>
                                                    <span>{new Date(project.created_at || Date.now()).toLocaleDateString('vi-VN')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {Math.ceil(savedProjects.length / ITEMS_PER_PAGE) > 1 && (
                                    <div className="flex justify-center gap-2 mt-6">
                                        {Array.from({ length: Math.ceil(savedProjects.length / ITEMS_PER_PAGE) }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={cn(
                                                    "w-8 h-8 rounded-full text-xs font-medium transition-all",
                                                    currentPage === page
                                                        ? "bg-primary text-primary-foreground shadow-md scale-110"
                                                        : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                                                )}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full neu-bg overflow-hidden animate-fade-in text-gray-700">
            {/* Top Bar */}
            <div className="h-14 flex items-center justify-between px-4 neu-bg z-50 shadow-sm">
                <div className="flex items-center gap-4">
                    <Button 
                        variant="ghost" 
                        size="sm"
                        className="neu-btn flex items-center gap-1 px-3 h-9 text-gray-600 hover:text-[#3b82f6] mr-1"
                        onClick={() => setHasStarted(false)}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Trở lại</span>
                    </Button>
                    <div className="font-bold text-lg flex items-center gap-2">
                        <Rocket className="w-5 h-5 neu-text-primary" />
                        <span className="hidden md:inline text-gray-700">Locaith Builder</span>
                    </div>
                    <Separator orientation="vertical" className="h-6 bg-gray-300 hidden md:block" />
                    <div className="hidden md:flex items-center gap-2 p-1">
                        <Button 
                            className={cn("h-8 w-8 rounded-full", previewDevice === 'desktop' ? 'neu-pressed text-[#3b82f6]' : 'neu-btn')}
                            size="icon" 
                            onClick={() => setPreviewDevice('desktop')}
                        >
                            <Monitor className="w-4 h-4" />
                        </Button>
                        <Button 
                            className={cn("h-8 w-8 rounded-full", previewDevice === 'tablet' ? 'neu-pressed text-[#3b82f6]' : 'neu-btn')}
                            size="icon" 
                            onClick={() => setPreviewDevice('tablet')}
                        >
                            <Tablet className="w-4 h-4" />
                        </Button>
                        <Button 
                            className={cn("h-8 w-8 rounded-full", previewDevice === 'mobile' ? 'neu-pressed text-[#3b82f6]' : 'neu-btn')}
                            size="icon" 
                            onClick={() => setPreviewDevice('mobile')}
                        >
                            <Smartphone className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabOption)} className="hidden md:block">
                        <TabsList className="h-9 bg-transparent p-0 gap-2">
                            <TabsTrigger value={TabOption.PREVIEW} className="h-9 px-4 rounded-full data-[state=active]:neu-pressed data-[state=active]:text-[#3b82f6] data-[state=inactive]:neu-btn text-xs">Preview</TabsTrigger>
                            <TabsTrigger value={TabOption.CODE} className="h-9 px-4 rounded-full data-[state=active]:neu-pressed data-[state=active]:text-[#3b82f6] data-[state=inactive]:neu-btn text-xs">Code</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <Button 
                        onClick={() => setRightPanelOpen(!rightPanelOpen)} 
                        className={cn("h-9 px-3 md:hidden flex", rightPanelOpen ? "neu-pressed text-[#3b82f6]" : "neu-btn")}
                        size="icon"
                    >
                        <MessageSquare className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => setRightPanelOpen(!rightPanelOpen)} className={cn("h-9 px-3 hidden md:flex", rightPanelOpen ? "neu-pressed text-[#3b82f6]" : "neu-btn")}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        AI Assistant
                    </Button>
                    <Button onClick={handleDeploy} disabled={isDeploying} size="sm" className="neu-btn-primary h-9">
                        {isDeploying ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Rocket className="w-4 h-4 mr-2" />}
                        Xuất bản
                    </Button>
                </div>
            </div>

            {/* Mobile Tabs Sub-header */}
            <div className="md:hidden px-4 pb-2 neu-bg z-40 flex items-center justify-center gap-3 transition-all">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabOption)} className="flex-1 max-w-xs transition-all">
                    <TabsList className="w-full h-9 bg-transparent p-0 grid grid-cols-2 gap-4">
                        <TabsTrigger 
                            value={TabOption.PREVIEW} 
                            className="h-9 rounded-full data-[state=active]:neu-pressed data-[state=active]:text-[#3b82f6] data-[state=inactive]:neu-btn text-xs flex items-center justify-center gap-2 transition-all"
                        >
                            <Eye className="w-3 h-3" /> Xem trước
                        </TabsTrigger>
                        <TabsTrigger 
                            value={TabOption.CODE} 
                            className="h-9 rounded-full data-[state=active]:neu-pressed data-[state=active]:text-[#3b82f6] data-[state=inactive]:neu-btn text-xs flex items-center justify-center gap-2 transition-all"
                        >
                            <Code className="w-3 h-3" /> Code
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                {activeTab === TabOption.CODE && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopy}
                        className="h-9 w-9 neu-btn text-gray-500 flex-shrink-0 animate-fade-in"
                    >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                )}
            </div>

            <div className="flex-1 flex overflow-hidden relative pb-0">
                {/* Main Canvas Area */}
                <div className="flex-1 bg-[#e0e5ec] relative flex flex-col overflow-hidden shadow-inner">
                    {isLoading && (
                        <div className="absolute top-0 left-0 w-full h-1 z-50">
                            <Progress value={progress} className="h-full rounded-none bg-gray-200" indicatorClassName="bg-[#3b82f6]" />
                        </div>
                    )}
                    
                    <div className="flex-1 flex items-center justify-center p-2 md:p-3 overflow-auto">
                        <div 
                            className={cn(
                                "transition-all duration-300 neu-flat overflow-hidden shadow-xl bg-gray-900",
                                previewDevice === 'mobile' ? 'w-full h-full md:w-[375px] md:h-[667px] border-[8px] border-gray-800 rounded-[2.5rem]' : 
                                previewDevice === 'tablet' ? 'w-[768px] h-[1024px] border-[12px] border-gray-800 rounded-[2rem]' : 
                                'w-[99%] h-[99%] max-w-full rounded-none border-0'
                            )}
                        >
                            <PreviewPane 
                                code={generatedCode} 
                                activeTab={activeTab} 
                                showHeader={previewDevice === 'desktop'}
                                onTabChange={(tab) => {
                                    // Prevent switching tabs while building
                                    if (isLoading) return;
                                    setActiveTab(tab);
                                }} 
                            />
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - AI Chat */}
                {rightPanelOpen && (
                    <div className={cn(
                        "neu-bg flex flex-col shadow-[-5px_0_15px_rgba(0,0,0,0.05)] z-40 transition-all",
                        "fixed inset-0 top-14 bottom-16 md:static md:w-80 md:h-full md:inset-auto"
                    )}>
                        <div className="p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_#22c55e]" />
                                <span className="font-semibold text-sm text-gray-700">Trợ lý AI</span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 neu-btn md:hidden" onClick={() => setRightPanelOpen(false)}>
                                <Undo className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="flex-1 overflow-hidden flex flex-col">
                            <Sidebar messages={messages} />
                        </div>
                        <div className="p-4 neu-bg">
                            <ChatInput 
                                onSend={handleSend} 
                                isLoading={isLoading} 
                                placeholder="Yêu cầu chỉnh sửa..."
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Bottom Navigation Removed - Replaced by Top Controls */}
            {/* <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 neu-bg z-50 flex items-center justify-around px-2 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">...</div> */}

            {/* Deploy Dialog */}
            <Dialog open={isDeploying} onOpenChange={() => {}}>
                <DialogContent className="sm:max-w-md neu-flat border-none">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-gray-700">
                            <Loader2 className="w-5 h-5 text-[#3b82f6] animate-spin" />
                            Đang xuất bản...
                        </DialogTitle>
                        <DialogDescription className="text-gray-500">
                            Vui lòng đợi trong khi chúng tôi đưa website của bạn lên internet.
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>

             {/* Deployment Success Banner */}
             {showDeploySuccess && deployedUrl && (
                <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-lg px-4">
                    <div className="neu-flat p-4 relative animate-fade-in flex items-center gap-4 border border-[#3b82f6]/20">
                         <div className="bg-[#3b82f6]/10 p-2 rounded-full">
                            <Rocket className="w-5 h-5 text-[#3b82f6]" />
                         </div>
                         <div className="flex-1">
                             <h4 className="font-bold text-sm">Xuất bản thành công!</h4>
                             <a href={deployedUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate block max-w-[250px]">
                                {deployedUrl}
                             </a>
                         </div>
                         <Button variant="ghost" size="icon" onClick={() => setShowDeploySuccess(false)} className="h-6 w-6">
                             <Undo className="w-4 h-4" />
                         </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
