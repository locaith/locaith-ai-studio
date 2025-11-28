import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Message, TabOption } from '../types';
import { Sidebar } from './Sidebar';
import { ChatInput } from './ChatInput';
import { PreviewPane } from './PreviewPane';
import { streamWebsiteCode } from '../services/geminiService';
import { useUserActivity } from '../src/hooks/useUserActivity';
import { useActivity } from '../src/hooks/useActivity';
import { supabase } from '../src/lib/supabase';
import { Logo } from '../App';
import { vi } from '../src/locales/vi';
import { downloadWebsiteZip } from '../src/utils/zipExport';

// Helper to clean code
const cleanGeneratedCode = (code: string) => {
    return code.replace(/^```html\s*/, '').replace(/^```\s*/, '').replace(/```$/, '');
};

// Helper to generate name
const generateProjectName = () => {
    const adj = ['cosmic', 'neon', 'hyper', 'stellar', 'quantum', 'pixel', 'rapid', 'sonic'];
    const noun = ['dashboard', 'shop', 'portfolio', 'stream', 'hub', 'canvas', 'forge', 'labs'];
    const randomAdj = adj[Math.floor(Math.random() * adj.length)];
    const randomNoun = noun[Math.floor(Math.random() * noun.length)];
    const num = Math.floor(Math.random() * 100);
    return `${randomAdj}-${randomNoun}-${num}`;
};

interface WebBuilderFeatureProps {
    initialPrompt?: string;
    trigger?: number;
    currentProject?: any; // The project object from DB
    onProjectChange?: (project: any) => void; // Callback when project is created/updated
}

export const WebBuilderFeature: React.FC<WebBuilderFeatureProps> = ({
    initialPrompt,
    trigger,
    currentProject,
    onProjectChange
}) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [generatedCode, setGeneratedCode] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<TabOption>(TabOption.PREVIEW);
    const [isPreviewModalOpen, setPreviewModalOpen] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [projectId, setProjectId] = useState<string | null>(null);
    const [progress, setProgress] = useState<number>(0);
    const [isHoldPlaying, setIsHoldPlaying] = useState<boolean>(false);

    const holdAudioRef = useRef<HTMLAudioElement | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const lastTriggerRef = useRef<number | null>(null);
    const ignoreNextTriggerRef = useRef<boolean>(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Integration State
    const [activePopover, setActivePopover] = useState<'github' | 'supabase' | null>(null);
    const [githubStatus, setGithubStatus] = useState<'disconnected' | 'connected' | 'syncing'>('disconnected');
    const [supabaseStatus, setSupabaseStatus] = useState<'disconnected' | 'connected'>('disconnected');
    const [isDeploying, setIsDeploying] = useState(false);
    const [deployedUrl, setDeployedUrl] = useState<string | null>(null);
    const [showDeploySuccess, setShowDeploySuccess] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [previewError, setPreviewError] = useState<string | null>(null);

    const { trackActivity } = useUserActivity();

    // Listen for preview errors from iframe
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'PREVIEW_ERROR') {
                const errorMessage = event.data.message || 'Unknown error';
                setPreviewError(errorMessage);

                // Add error message to chat with fix button
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

    // Load project state if currentProject is provided
    useEffect(() => {
        if (currentProject) {
            setProjectId(currentProject.id);
            setProjectName(currentProject.project_name);
            setGeneratedCode(currentProject.html_content || '');
            setMessages(currentProject.messages || []);
            setHasStarted(true);
            setProgress(100);

            // Load deployed URL if exists
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
        }
    }, [currentProject]);

    // Save project state to DB
    const saveProject = async (code: string, msgs: Message[]) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.warn('Cannot save: user not authenticated');
                return;
            }

            // Ensure we have a project name
            const currentProjectName = projectName || generateProjectName();
            if (!projectName) {
                setProjectName(currentProjectName);
            }

            // Generate unique subdomain
            const timestamp = Date.now().toString(36);
            const sanitizedName = currentProjectName
                .toLowerCase()
                .replace(/[^a-z0-9-]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '')
                .substring(0, 50);
            const uniqueSubdomain = `${sanitizedName}-${timestamp}`;

            const projectData = {
                user_id: user.id,
                project_name: currentProjectName,
                subdomain: uniqueSubdomain,
                html_content: code,
                messages: msgs,
                updated_at: new Date().toISOString(),
                last_edited_at: new Date().toISOString()
            };

            let data, error;

            if (projectId) {
                // Update existing - don't change subdomain
                const updateData = { ...projectData };
                delete (updateData as any).subdomain; // Keep original subdomain

                ({ data, error } = await supabase
                    .from('websites')
                    .update(updateData)
                    .eq('id', projectId)
                    .select()
                    .single());
            } else {
                // Create new
                ({ data, error } = await supabase
                    .from('websites')
                    .insert([projectData])
                    .select()
                    .single());
            }

            if (error) {
                console.error('Save error:', error);
                // Don't throw - just log and continue
                return;
            }

            if (data) {
                setProjectId(data.id);
                setProjectName(data.project_name);
                if (onProjectChange) onProjectChange(data);
                console.log('Project saved:', data.id);
            }
        } catch (err) {
            console.error('Error saving project:', err);
            // Silently fail - don't disrupt user experience
        }
    };

    // Debounced save
    const triggerSave = useCallback((code: string, msgs: Message[]) => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
            saveProject(code, msgs);
        }, 2000); // Save after 2 seconds of inactivity
    }, [projectId, projectName]);

    const handleStop = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setIsLoading(false);
            setMessages(prev => {
                const newMsgs = prev.map(msg =>
                    msg.isStreaming ? { ...msg, isStreaming: false, content: msg.content + "\n\n[Stopped by user]" } : msg
                );
                triggerSave(generatedCode, newMsgs);
                return newMsgs;
            });
        }
    }, [generatedCode, triggerSave]);

    const lastUserPromptRef = useRef<{ text: string; time: number } | null>(null);

    const handleSend = useCallback(async (content: string) => {
        const normalized = String(content || '').trim();
        const now = Date.now();
        const last = lastUserPromptRef.current;
        if (last && last.text === normalized && (now - last.time) < 5000) {
            return;
        }
        lastUserPromptRef.current = { text: normalized, time: now };

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: normalized
        };

        const assistantMsgId = (Date.now() + 1).toString();
        const assistantMsg: Message = {
            id: assistantMsgId,
            role: 'assistant',
            content: '',
            isStreaming: true
        };

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

        // Start hold music
        try {
            if (!holdAudioRef.current) {
                const audio = new Audio('/voice-sound/loading.mp3');
                audio.loop = true;
                audio.volume = 0.6;
                holdAudioRef.current = audio;
            }
            await holdAudioRef.current.play();
            setIsHoldPlaying(true);
        } catch { }

        setActiveTab(TabOption.CODE);

        if (abortControllerRef.current) abortControllerRef.current.abort();
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        try {
            const stream = streamWebsiteCode(normalized, generatedCode);

            let fullResponse = '';
            let codePart = '';
            let logPart = '';
            let lastBuildCount = 0;
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

                    setMessages(prev => prev.map(msg =>
                        msg.id === assistantMsgId
                            ? { ...msg, content: logPart }
                            : msg
                    ));
                } else {
                    logPart = fullResponse;
                    setMessages(prev => prev.map(msg =>
                        msg.id === assistantMsgId
                            ? { ...msg, content: logPart }
                            : msg
                    ));
                    const buildMatches = logPart.match(/\[BUILD\]/g);
                    const count = buildMatches ? buildMatches.length : 0;
                    if (count !== lastBuildCount) {
                        lastBuildCount = count;
                        const next = Math.min(85, 10 + count * 6);
                        setProgress(next);
                    }
                }
            }

            setMessages(prev => {
                const newMsgs = prev.map(msg =>
                    msg.id === assistantMsgId ? { ...msg, isStreaming: false } : msg
                );

                // Save state after generation
                triggerSave(currentGeneratedCode, newMsgs);
                return newMsgs;
            });

            if (!abortController.signal.aborted) {
                setActiveTab(TabOption.PREVIEW);
            }

            const successMsg: Message = {
                id: (Date.now() + 2).toString(),
                role: 'assistant',
                content: vi.generation.complete,
                isStreaming: false,
                action: {
                    label: vi.actions.downloadZip,
                    type: 'download',
                    payload: { code: currentGeneratedCode, projectName }
                }
            };

            setMessages(prev => {
                const newMsgs = [...prev, successMsg];
                triggerSave(currentGeneratedCode, newMsgs);
                return newMsgs;
            });

            setProgress(100);

            // Fade out music
            try {
                if (holdAudioRef.current && isHoldPlaying) {
                    const target = holdAudioRef.current;
                    const startVol = target.volume;
                    const steps = 10;
                    let i = 0;
                    const interval = setInterval(() => {
                        i++;
                        target.volume = Math.max(0, startVol * (1 - i / steps));
                        if (i >= steps) {
                            clearInterval(interval);
                            target.pause();
                            target.currentTime = 0;
                            setIsHoldPlaying(false);
                        }
                    }, 120);
                }
            } catch { }

        } catch (error) {
            console.error(error);
            setMessages(prev => prev.map(msg =>
                msg.id === assistantMsgId
                    ? { ...msg, content: "I encountered an error while processing your request.", isStreaming: false }
                    : msg
            ));
        } finally {
            setIsLoading(false);
        }
    }, [generatedCode, triggerSave, isHoldPlaying]);

    const handleStart = (prompt: string) => {
        const newName = generateProjectName();
        setProjectName(newName);
        setHasStarted(true);

        trackActivity({
            feature_type: 'web-builder',
            action_type: 'create',
            action_details: {
                project_name: newName,
                prompt: prompt.substring(0, 100),
                description: `Started new web project: ${newName}`
            }
        });

        handleSend(prompt);
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

    // Handle Deploy
    const handleDeploy = async () => {
        setIsDeploying(true);
        setShowDeploySuccess(false);

        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                // Show error in chat instead of alert
                const errorMsg: Message = {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: vi.errors.auth,
                };
                setMessages(prev => [...prev, errorMsg]);
                setIsDeploying(false);
                return;
            }

            // Save first to ensure latest version
            await saveProject(generatedCode, messages);

            // Get current session for auth token
            const { data: { session } } = await supabase.auth.getSession();
            console.log('Deploy Session Check:', session ? '✅ Valid' : '❌ Missing');

            if (!session) {
                const errorMsg: Message = {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: vi.messages.sessionExpired,
                };
                setMessages(prev => [...prev, errorMsg]);
                setIsDeploying(false);
                return;
            }

            console.log('🚀 Deploying to Vercel...');

            // Deploy to Vercel via Edge Function
            const { data, error } = await supabase.functions.invoke('deploy-vercel', {
                headers: {
                    Authorization: `Bearer ${session.access_token}`
                },
                body: {
                    project_name: projectName || generateProjectName(),
                    html_content: generatedCode,
                    website_id: projectId
                }
            });

            if (error) {
                console.error('Deployment error:', error);
                throw new Error(error.message || 'Deployment failed');
            }

            if (!data?.success) {
                throw new Error(data?.error || 'Deployment failed');
            }

            console.log('✅ Deployment successful!', data);

            // Show success banner instead of alert
            setDeployedUrl(data.url);
            setShowDeploySuccess(true);

            // Add success message to chat
            const successMsg: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: vi.deployment.success,
            };
            setMessages(prev => [...prev, successMsg]);

        } catch (err: any) {
            console.error('Deploy failed:', err);

            // Show error in chat
            const errorMsg: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: vi.errors.generic.replace('{error}', err.message),
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsDeploying(false);
        }
    };

    if (!hasStarted) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center relative overflow-hidden font-sans text-gray-900 selection:bg-brand-500/30">
                <div className="z-10 w-full max-w-3xl px-6 flex flex-col items-center text-center">
                    <div className="mb-8 animate-fade-in-up flex flex-col items-center">
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-4 drop-shadow-sm">
                            Locaith <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-accent-500">Builder</span>
                        </h1>
                        <p className="text-base text-gray-600 max-w-lg mx-auto leading-relaxed backdrop-blur-sm bg-white/30 p-2 rounded-lg">
                            {vi.ui.subtitle}
                        </p>
                    </div>

                    <ChatInput
                        onSend={handleStart}
                        onStop={() => { }}
                        isLoading={false}
                        placeholder={vi.ui.placeholder}
                        isLandingPage={true}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full bg-transparent text-gray-900 overflow-hidden font-sans selection:bg-brand-500/30 animate-fade-in-up relative">

            {/* Mobile Action Buttons */}
            {generatedCode && (
                <div className="md:hidden fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                    <button
                        onClick={() => setPreviewModalOpen(true)}
                        className="px-4 py-2 bg-white/95 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-lg backdrop-blur-sm"
                    >
                        {vi.ui.preview}
                    </button>
                    <button
                        onClick={handleDeploy}
                        className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium shadow-lg"
                    >
                        {vi.ui.publish}
                    </button>
                </div>
            )}

            {/* Progress Overlay - Only show when actively loading */}
            {isLoading && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-white/80 backdrop-blur-md border border-gray-200 rounded-full px-4 py-2 shadow-lg flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border-2 border-brand-600 border-t-transparent animate-spin"></div>
                    <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-600" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}></div>
                    </div>
                    <span className="text-xs text-gray-700">{vi.ui.generating}</span>
                </div>
            )}

            {/* Deployment Modal */}
            {isDeploying && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white border border-gray-200 rounded-xl w-full max-w-md p-6 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-5 h-5 rounded-full border-2 border-brand-500 border-t-transparent animate-spin"></div>
                            <h3 className="text-lg font-mono text-gray-900">{vi.ui.deploying}</h3>
                        </div>
                        <p className="text-sm text-gray-500">{vi.deployment.processing}</p>
                    </div>
                </div>
            )}

            {/* Deployment Success */}
            {/* Deployment Success Banner */}
            {showDeploySuccess && deployedUrl && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-lg px-4">
                    <div className="bg-white border-2 border-green-500 rounded-lg shadow-xl p-4 relative animate-fade-in">
                        {/* Close button */}
                        <button
                            onClick={() => setShowDeploySuccess(false)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Header */}
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-lg text-gray-900">{vi.deployment.success}</h3>
                        </div>

                        {/* URL Display */}
                        <label className="text-sm text-gray-600 mb-1 block">{vi.deployment.urlLabel}</label>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                            <div className="flex items-center justify-between gap-2">
                                <a
                                    href={deployedUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-brand-600 hover:text-brand-700 hover:underline font-mono text-sm truncate flex-1"
                                >
                                    {deployedUrl}
                                </a>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(deployedUrl);
                                        setCopySuccess(true);
                                        setTimeout(() => setCopySuccess(false), 2000);
                                    }}
                                    className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs rounded font-medium transition-colors flex-shrink-0"
                                >
                                    {copySuccess ? vi.deployment.copied : vi.deployment.copyButton}
                                </button>
                            </div>
                        </div>

                        {/* Action Button */}
                        <a
                            href={deployedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full py-2 bg-green-600 hover:bg-green-700 text-white text-center rounded-lg font-medium transition-colors"
                        >
                            {vi.deployment.openButton}
                        </a>
                    </div>
                </div>
            )}

            {/* Sidebar */}
            <div className="w-full md:w-[400px] lg:w-[450px] flex flex-col border-r border-gray-200 bg-white/90 backdrop-blur-sm z-10 shadow-xl flex-shrink-0 transition-all relative">
                <div className="p-4 border-b border-gray-200 flex items-center gap-3 select-none">
                    <div className="w-8 h-8 text-brand-500 cursor-pointer" onClick={() => { setHasStarted(false); setProjectId(null); setMessages([]); }}>
                        <Logo />
                    </div>
                    <div>
                        <h1 className="font-bold text-sm tracking-wide text-gray-900">{projectName || vi.ui.newProject}</h1>
                        <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${projectId ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                            <span className="text-[10px] text-gray-500 font-mono">{projectId ? vi.ui.saved : vi.ui.unsaved}</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden relative bg-gray-50/50">
                    <Sidebar messages={messages} onAction={async (action) => {
                        if (action.type === 'download') {
                            // Handle ZIP download
                            try {
                                await downloadWebsiteZip(
                                    action.payload.code || generatedCode,
                                    action.payload.projectName || projectName || 'website'
                                );
                            } catch (error) {
                                console.error('Download failed:', error);
                            }
                        } else if (action.type === 'fix') {
                            // Handle auto-fix for errors
                            const fixPrompt = `Có lỗi xảy ra trong website. Vui lòng sửa lỗi sau:\n\n${action.payload.error}\n\nHãy tạo lại code hoàn chỉnh đã được sửa lỗi.`;
                            handleSend(fixPrompt);
                        }
                    }} />
                </div>

                <div className="p-4 bg-white/50 border-t border-gray-200">
                    <ChatInput onSend={handleSend} onStop={handleStop} isLoading={isLoading} />
                </div>
            </div>

            {/* Preview Area */}
            <div className="hidden md:flex flex-1 flex-col h-full overflow-hidden bg-gray-100/50 relative backdrop-blur-sm">
                <div className="h-14 border-b border-gray-200 bg-white/80 backdrop-blur flex items-center justify-between px-4 z-20 transition-colors">
                    <div className="flex items-center gap-2">
                        <div className="bg-gray-100/80 px-3 py-1 rounded-md border border-gray-200 text-sm text-gray-600 font-mono">
                            {projectName}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 relative">
                        {/* New Project Button */}
                        <button
                            onClick={() => {
                                setHasStarted(false);
                                setProjectId(null);
                                setMessages([]);
                                setProjectName('');
                                setGeneratedCode('');
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm"
                            title={vi.ui.newProject}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="hidden lg:inline">{vi.ui.newProject}</span>
                        </button>

                        {/* Download ZIP Button */}
                        <button
                            onClick={async () => {
                                try {
                                    await downloadWebsiteZip(generatedCode, projectName || 'website');
                                } catch (error) {
                                    console.error('Download failed:', error);
                                }
                            }}
                            disabled={!generatedCode}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${generatedCode
                                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                }`}
                            title={vi.actions.downloadZip}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                            </svg>
                            <span className="hidden lg:inline">{vi.actions.downloadZip}</span>
                        </button>

                        {/* Publish Button */}
                        <button
                            onClick={handleDeploy}
                            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-brand-900/20"
                        >
                            {vi.ui.publish}
                        </button>
                    </div>
                </div>

                <div className="relative flex-1">
                    <div className="p-2 md:p-4 h-full z-10 relative">
                        <PreviewPane
                            code={generatedCode}
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                        />
                    </div>
                </div>
            </div>

            {/* Mobile Preview Modal */}
            {isPreviewModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center animate-fade-in-up">
                    <div className="relative w-full h-full md:h-[90vh] md:w-[90vw] md:max-w-5xl bg-white md:rounded-2xl overflow-hidden">
                        <button
                            onClick={() => setPreviewModalOpen(false)}
                            className="absolute top-4 right-4 z-20 p-2 bg-white/80 border border-gray-200 rounded-full text-gray-700 hover:bg-white md:shadow"
                        >
                            {vi.ui.close}
                        </button>
                        <div className="w-full h-full pt-12 md:pt-0">
                            <PreviewPane
                                code={generatedCode}
                                activeTab={activeTab}
                                onTabChange={setActiveTab}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
