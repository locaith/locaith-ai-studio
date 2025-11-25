import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Message, TabOption } from '../types';
import { Sidebar } from './Sidebar';
import { ChatInput } from './ChatInput';
import { PreviewPane } from './PreviewPane';
import { streamWebsiteCode } from '../services/geminiService';
import { useUserActivity } from '../src/hooks/useUserActivity';
import { supabase } from '../src/lib/supabase';
import { Logo } from '../App'; // We might need to move Logo or duplicate it

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

    const { trackActivity } = useUserActivity();

    // Load project state if currentProject is provided
    useEffect(() => {
        if (currentProject) {
            setProjectId(currentProject.id);
            setProjectName(currentProject.project_name);
            setGeneratedCode(currentProject.html_content || '');
            setMessages(currentProject.messages || []);
            setHasStarted(true);
            setProgress(100); // Set to 100 to prevent progress bar from showing

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
                content: "Tuyệt vời! Website của bạn đã hoàn tất. Bạn có thể xem bản xem trước ngay bây giờ.",
                isStreaming: false
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
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                alert('Please sign in to deploy!');
                setIsDeploying(false);
                return;
            }

            // Save first to ensure latest version
            await saveProject(generatedCode, messages);

            // Get current session for auth token
            const { data: { session } } = await supabase.auth.getSession();
            console.log('Deploy Session Check:', session ? '✅ Valid' : '❌ Missing');

            if (!session) {
                alert('Session expired. Please sign in again.');
                setIsDeploying(false);
                return;
            }

            console.log('🚀 Invoking Edge Function with token:', session.access_token.substring(0, 10) + '...');

            // Deploy to Freestyle.sh with proper auth headers
            const { data, error } = await supabase.functions.invoke('deploy-freestyle', {
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
                const status = (error as any)?.context?.status;
                const ctxBody = (error as any)?.context?.body;
                const bodyText = typeof ctxBody === 'string' ? ctxBody : (ctxBody ? JSON.stringify(ctxBody) : '');
                console.error('Deployment error:', { message: error.message, status, body: bodyText });
                throw new Error(`${error.message}${status ? ` (HTTP ${status})` : ''}${bodyText ? `\n${bodyText}` : ''}`);
            }

            if (!data || !data.url) {
                throw new Error('Deployment succeeded but no URL returned');
            }

            setDeployedUrl(data.custom_url || data.url);

            // Update project ID if new website was created
            if (data.website_id && !projectId) {
                setProjectId(data.website_id);
            }

            trackActivity({
                feature_type: 'web-builder',
                action_type: 'deploy',
                action_details: {
                    project_name: projectName,
                    url: data.custom_url || data.url,
                    provider: 'freestyle',
                    sandbox_id: data.sandbox_id,
                    description: `Deployed project: ${projectName}`
                }
            });
        } catch (err: any) {
            console.error('Deploy failed:', err);
            const msg = err?.message || 'Unknown error';
            alert(`Deployment failed: ${msg}. Please try again or check function logs.`);
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
                            Describe your dream app, watch the AI code it step-by-step, and get a production-ready React website instantly.
                        </p>
                    </div>

                    <ChatInput
                        onSend={handleStart}
                        onStop={() => { }}
                        isLoading={false}
                        placeholder="Build a dashboard for a crypto app..."
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
                        Preview
                    </button>
                    <button
                        onClick={handleDeploy}
                        className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium shadow-lg"
                    >
                        Publish
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
                    <span className="text-xs text-gray-700">Generating website...</span>
                </div>
            )}

            {/* Deployment Modal */}
            {isDeploying && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white border border-gray-200 rounded-xl w-full max-w-md p-6 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-5 h-5 rounded-full border-2 border-brand-500 border-t-transparent animate-spin"></div>
                            <h3 className="text-lg font-mono text-gray-900">Deploying to Edge...</h3>
                        </div>
                        <p className="text-sm text-gray-500">Please wait while we publish your site.</p>
                    </div>
                </div>
            )}

            {/* Deployment Success */}
            {deployedUrl && !isDeploying && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white border border-gray-200 rounded-xl w-full max-w-lg p-8 shadow-2xl text-center relative">
                        <button onClick={() => setDeployedUrl(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                        <h2 className="text-2xl font-bold mb-2 text-gray-900">Deployment Successful!</h2>
                        <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-between mb-6 border border-gray-200 group">
                            <a href="#" className="text-brand-600 hover:underline font-mono text-sm truncate mr-2">{deployedUrl}</a>
                        </div>
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
                        <h1 className="font-bold text-sm tracking-wide text-gray-900">{projectName || 'New Project'}</h1>
                        <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${projectId ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                            <span className="text-[10px] text-gray-500 font-mono">{projectId ? 'SAVED' : 'UNSAVED'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden relative bg-gray-50/50">
                    <Sidebar messages={messages} onAction={() => { }} />
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
                        <button
                            onClick={handleDeploy}
                            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-brand-900/20"
                        >
                            Publish
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
                            Close
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
