import React, { useState, useCallback, useRef, useEffect, Suspense } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInput } from './components/ChatInput';
import { PreviewPane } from './components/PreviewPane';
import { streamWebsiteCode } from './services/geminiService';
import { Message, TabOption } from './types';
import { GlobalSidebar, FeatureType, ThemeType } from './components/GlobalSidebar';
const ComposeFeature = React.lazy(() => import('./components/ComposeFeature').then(m => ({ default: m.ComposeFeature })));
const SearchFeature = React.lazy(() => import('./components/SearchFeature').then(m => ({ default: m.SearchFeature })));
const ContentAutomationFeature = React.lazy(() => import('./components/ContentAutomationFeature').then(m => ({ default: m.ContentAutomationFeature })));
const DesignFeature = React.lazy(() => import('./components/DesignFeature').then(m => ({ default: m.DesignFeature })));
import { AuthModal } from './components/AuthModal';
import { useAuth } from './src/hooks/useAuth';
import { RecentHistorySidebar } from './components/RecentHistorySidebar';
import { useUserActivity } from './src/hooks/useUserActivity';
import { supabase } from './src/lib/supabase';
import { GoogleGenAI } from '@google/genai';
import VoiceChat from './components/VoiceChat';
import { VoiceMode } from './src/types/voice';

// Extend Navigator interface for Web Bluetooth API
declare global {
  interface Navigator {
    bluetooth: any;
  }
}

// --- Shared Components ---
const Logo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <img
    src="/logo-locaith.png"
    alt="Locaith Studio"
    className={className}
  />
);

// --- Helper Functions ---
const generateProjectName = () => {
  const adj = ['cosmic', 'neon', 'hyper', 'stellar', 'quantum', 'pixel', 'rapid', 'sonic'];
  const noun = ['dashboard', 'shop', 'portfolio', 'stream', 'hub', 'canvas', 'forge', 'labs'];
  const randomAdj = adj[Math.floor(Math.random() * adj.length)];
  const randomNoun = noun[Math.floor(Math.random() * noun.length)];
  const num = Math.floor(Math.random() * 100);
  return `${randomAdj}-${randomNoun}-${num}`;
};

const cleanGeneratedCode = (code: string) => {
  // Remove markdown code blocks if present
  return code.replace(/^```html\s*/, '').replace(/^```\s*/, '').replace(/```$/, '');
};

// --- Website Builder Component (Encapsulated) ---

const LandingPage: React.FC<{ onStart: (prompt: string) => void }> = ({ onStart }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (input.trim()) {
      onStart(input);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const suggestions = [
    "A modern SaaS landing page with pricing",
    "Interactive Kanban board with drag & drop",
    "Personal portfolio with dark mode",
    "E-commerce dashboard with charts"
  ];

  return (
    <div className="h-full w-full flex flex-col items-center justify-center relative overflow-hidden font-sans text-gray-900 selection:bg-brand-500/30">
      {/* Landing page now uses the global background set in App */}

      <div className="z-10 w-full max-w-3xl px-6 flex flex-col items-center text-center">
        <div className="mb-8 animate-fade-in-up flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-4 drop-shadow-sm">
            Locaith <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-accent-500">Builder</span>
          </h1>
          <p className="text-base text-gray-600 max-w-lg mx-auto leading-relaxed backdrop-blur-sm bg-white/30 p-2 rounded-lg">
            Describe your dream app, watch the AI code it step-by-step, and get a production-ready React website instantly.
          </p>
        </div>

        <div className="w-full relative group animate-fade-in-up delay-100">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-500 to-accent-500 rounded-2xl opacity-30 group-hover:opacity-50 transition duration-500 blur"></div>
          <div className="relative bg-white backdrop-blur-md border border-gray-200 rounded-xl shadow-2xl overflow-hidden focus-within:ring-1 focus-within:ring-brand-500/50 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Build a dashboard for a crypto app..."
              className="w-full bg-transparent text-gray-900 placeholder-gray-400 text-lg p-6 resize-none focus:outline-none min-h-[80px] max-h-[300px]"
              rows={1}
              autoFocus
            />
            <div className="flex justify-between items-center px-4 pb-4 bg-transparent">
              <div className="flex gap-2 ml-1">
                <button className="p-2 text-gray-400 hover:text-brand-500 hover:bg-gray-100 rounded-lg transition-colors" title="Upload Image"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg></button>
                <button className="p-2 text-gray-400 hover:text-brand-500 hover:bg-gray-100 rounded-lg transition-colors" title="Voice Input"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg></button>
              </div>
              <button
                onClick={handleSubmit}
                disabled={!input.trim()}
                className={`px-5 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2 font-medium ${input.trim()
                  ? 'bg-black text-white hover:opacity-80 shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
              >
                <span>Generate</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3 animate-fade-in-up delay-200 opacity-0" style={{ animationFillMode: 'forwards' }}>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => onStart(suggestion)}
              className="px-4 py-2 bg-white/50 hover:bg-white border border-gray-200 hover:border-brand-500/50 rounded-full text-xs text-gray-600 hover:text-brand-600 transition-all backdrop-blur-md shadow-sm"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const WebBuilderFeature: React.FC<{ initialPrompt?: string; trigger?: number }> = ({ initialPrompt, trigger }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabOption>(TabOption.PREVIEW);
  const [isPreviewModalOpen, setPreviewModalOpen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [progress, setProgress] = useState<number>(0);
  const [isHoldPlaying, setIsHoldPlaying] = useState<boolean>(false);
  const holdAudioRef = useRef<HTMLAudioElement | null>(null);

  // Integration State
  const [activePopover, setActivePopover] = useState<'github' | 'supabase' | null>(null);
  const [githubStatus, setGithubStatus] = useState<'disconnected' | 'connected' | 'syncing'>('disconnected');
  const [supabaseStatus, setSupabaseStatus] = useState<'disconnected' | 'connected'>('disconnected');
  const githubClientId = ((import.meta as any).env?.VITE_GITHUB_CLIENT_ID as string) || '';
  const [githubToken, setGithubToken] = useState<string | null>(null);
  const [githubUser, setGithubUser] = useState<any>(null);
  const [githubRepoName, setGithubRepoName] = useState('');
  const [githubRepoPrivate, setGithubRepoPrivate] = useState(true);
  const [githubAuthData, setGithubAuthData] = useState<{ user_code: string; verification_uri: string; device_code: string; interval: number } | null>(null);
  const pollingRef = useRef<number | null>(null);

  // Auth Waiting States
  const [isGithubAuthing, setIsGithubAuthing] = useState(false);
  const [isSupabaseAuthing, setIsSupabaseAuthing] = useState(false);

  // Deployment State
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);

  // Activity tracking
  const { trackActivity } = useUserActivity();

  const handleSend = useCallback(async (content: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content
    };

    const assistantMsgId = (Date.now() + 1).toString();
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      isStreaming: true
    };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
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
    setActiveTab(TabOption.PREVIEW);

    try {
      const stream = streamWebsiteCode(content, generatedCode);

      let fullResponse = '';
      let codePart = '';
      let logPart = '';
      let lastBuildCount = 0;

      for await (const chunk of stream) {
        fullResponse += chunk;
        const codeStartIndex = fullResponse.indexOf('<!DOCTYPE html>');

        if (codeStartIndex !== -1) {
          logPart = fullResponse.substring(0, codeStartIndex);
          codePart = fullResponse.substring(codeStartIndex);
          // Sanitize code immediately
          setGeneratedCode(cleanGeneratedCode(codePart));
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
          // Update progress based on build steps count
          const buildMatches = logPart.match(/\[BUILD\]/g);
          const count = buildMatches ? buildMatches.length : 0;
          if (count !== lastBuildCount) {
            lastBuildCount = count;
            const next = Math.min(85, 10 + count * 6);
            setProgress(next);
          }
        }
      }

      setMessages(prev => prev.map(msg =>
        msg.id === assistantMsgId ? { ...msg, isStreaming: false } : msg
      ));

      const successMsg: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: "Tuyệt vời! Website của bạn đã hoàn tất. Bạn có thể xem bản xem trước ngay bây giờ. Bạn có cần mình chỉnh gì cho website không? Hãy nói yêu cầu bằng giọng nói hoặc nhập lại prompt.",
        isStreaming: false
      };
      setMessages(prev => [...prev, successMsg]);
      setProgress(100);
      // Fade out hold music
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
  }, [generatedCode]);

  const handleStart = (prompt: string) => {
    const projectName = generateProjectName();
    setProjectName(projectName);
    setHasStarted(true);

    // Track activity
    trackActivity({
      feature_type: 'web-builder',
      action_type: 'create',
      action_details: {
        project_name: projectName,
        prompt: prompt.substring(0, 100),
        description: `Started new web project: ${projectName}`
      }
    });

    handleSend(prompt);
  };

  useEffect(() => {
    if (initialPrompt && (!hasStarted || messages.length === 0)) {
      handleStart(initialPrompt);
    } else if (initialPrompt && typeof trigger === 'number') {
      handleSend(initialPrompt);
    }
  }, [initialPrompt, trigger]);

  useEffect(() => {
    if (projectName) setGithubRepoName(projectName);
  }, [projectName]);

  // --- Auth Handlers ---

  const handleGithubLogin = async () => {
    if (!githubClientId) {
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      window.open('https://github.com/login', 'GithubAuth', `width=${width},height=${height},top=${top},left=${left}`);
      return;
    }
    setIsGithubAuthing(true);
    try {
      const res = await fetch('https://github.com/login/device/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ client_id: githubClientId, scope: 'repo' })
      });
      if (!res.ok) {
        setIsGithubAuthing(false);
        return;
      }
      const data = await res.json();
      setGithubAuthData({ user_code: data.user_code, verification_uri: data.verification_uri, device_code: data.device_code, interval: data.interval });
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      window.open(data.verification_uri, 'GithubAuth', `width=${width},height=${height},top=${top},left=${left}`);
      if (pollingRef.current) window.clearInterval(pollingRef.current);
      pollingRef.current = window.setInterval(async () => {
        try {
          const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ client_id: githubClientId, device_code: data.device_code, grant_type: 'urn:ietf:params:oauth:grant-type:device_code' })
          });
          if (!tokenRes.ok) return;
          const tokenData = await tokenRes.json();
          if (tokenData.access_token) {
            if (pollingRef.current) window.clearInterval(pollingRef.current);
            setGithubToken(tokenData.access_token);
            setIsGithubAuthing(false);
            setGithubStatus('connected');
            const uRes = await fetch('https://api.github.com/user', { headers: { Authorization: `Bearer ${tokenData.access_token}`, Accept: 'application/vnd.github+json' } });
            if (uRes.ok) {
              const u = await uRes.json();
              setGithubUser(u);
            }
            trackActivity({
              feature_type: 'web-builder',
              action_type: 'update',
              action_details: { description: 'Connected GitHub account' }
            });
          }
        } catch { }
      }, (data.interval || 5) * 1000);
    } catch {
      setIsGithubAuthing(false);
    }
  };

  const handleGithubSync = async () => {
    if (!githubToken) return;
    setGithubStatus('syncing');
    try {
      let u = githubUser;
      if (!u) {
        const uRes = await fetch('https://api.github.com/user', { headers: { Authorization: `Bearer ${githubToken}`, Accept: 'application/vnd.github+json' } });
        if (!uRes.ok) throw new Error('user');
        u = await uRes.json();
        setGithubUser(u);
      }
      const owner = u.login;
      let repoExists = false;
      const repoRes = await fetch(`https://api.github.com/repos/${owner}/${githubRepoName}`, { headers: { Authorization: `Bearer ${githubToken}`, Accept: 'application/vnd.github+json' } });
      if (repoRes.status === 200) repoExists = true;
      if (!repoExists) {
        const createRes = await fetch('https://api.github.com/user/repos', {
          method: 'POST',
          headers: { Authorization: `Bearer ${githubToken}`, 'Content-Type': 'application/json', Accept: 'application/vnd.github+json' },
          body: JSON.stringify({ name: githubRepoName, private: githubRepoPrivate })
        });
        if (!createRes.ok) throw new Error('create');
      }
      const content = btoa(unescape(encodeURIComponent(generatedCode || '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Locaith Project</title></head><body></body></html>')));
      let sha: string | undefined;
      const fileRes = await fetch(`https://api.github.com/repos/${owner}/${githubRepoName}/contents/index.html`, { headers: { Authorization: `Bearer ${githubToken}`, Accept: 'application/vnd.github+json' } });
      if (fileRes.status === 200) {
        const fileData = await fileRes.json();
        sha = fileData.sha;
      }
      const putRes = await fetch(`https://api.github.com/repos/${owner}/${githubRepoName}/contents/index.html`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${githubToken}`, 'Content-Type': 'application/json', Accept: 'application/vnd.github+json' },
        body: JSON.stringify({ message: `Sync ${projectName}`, content, sha })
      });
      if (!putRes.ok) throw new Error('push');
      setGithubStatus('connected');
      trackActivity({ feature_type: 'web-builder', action_type: 'export', action_details: { description: `Synced to GitHub: ${githubRepoName}` } });
    } catch {
      setGithubStatus('connected');
    }
  };

  const handleSupabaseLogin = () => {
    setIsSupabaseAuthing(true);
    // Simulate opening Supabase Auth window
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const win = window.open(
      'https://supabase.com/dashboard',
      'SupabaseAuth',
      `width=${width},height=${height},top=${top},left=${left}`
    );

    setTimeout(() => {
      if (win) win.close();
      setIsSupabaseAuthing(false);
      setSupabaseStatus('connected');
    }, 3000);
  }

  const handleDeploy = () => {
    setIsDeploying(true);

    // Track deployment activity
    trackActivity({
      feature_type: 'web-builder',
      action_type: 'deploy',
      action_details: {
        project_name: projectName,
        url: `https://${projectName.toLowerCase()}.locaith.app`,
        description: `Deployed project: ${projectName}`
      }
    });

    // Simulate deployment process
    setTimeout(() => {
      setDeployedUrl(`https://${projectName.toLowerCase()}.locaith.app`);
      setIsDeploying(false);
    }, 3000);
  };

  if (!hasStarted) {
    return <LandingPage onStart={handleStart} />;
  }

  return (
    <div className="flex h-full bg-transparent text-gray-900 overflow-hidden font-sans selection:bg-brand-500/30 animate-fade-in-up relative">

      {/* Progress Overlay */}
      {(isLoading || progress < 100) && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-white/80 backdrop-blur-md border border-gray-200 rounded-full px-4 py-2 shadow-lg flex items-center gap-3">
          <div className="w-4 h-4 rounded-full border-2 border-brand-600 border-t-transparent animate-spin"></div>
          <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-brand-600" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}></div>
          </div>
          <span className="text-xs text-gray-700">Đang tạo website...</span>
        </div>
      )}

      {/* Deployment Modal Overlay */}
      {isDeploying && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-5 rounded-full border-2 border-brand-500 border-t-transparent animate-spin"></div>
              <h3 className="text-lg font-mono text-gray-900">Deploying to Edge...</h3>
            </div>
            <div className="space-y-2 font-mono text-xs text-gray-600 bg-gray-50 p-4 rounded-lg h-48 overflow-hidden">
              <div className="text-green-500">→ Initializing build environment...</div>
              <div className="delay-75 animate-pulse">→ Optimization: Static assets...</div>
              <div className="delay-150 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>→ Minifying JS/CSS bundles...</div>
              <div className="delay-300 opacity-0 animate-fade-in-up" style={{ animationDelay: '1.5s' }}>→ Uploading to global CDN region [sin1]...</div>
              <div className="delay-500 opacity-0 animate-fade-in-up" style={{ animationDelay: '2s' }}>→ Verifying DNS records...</div>
              <div className="delay-700 opacity-0 animate-fade-in-up" style={{ animationDelay: '2.5s' }}>→ Build Completed. Assigning domain...</div>
            </div>
          </div>
        </div>
      )}

      {/* Deployment Success Overlay */}
      {deployedUrl && !isDeploying && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-xl w-full max-w-lg p-8 shadow-2xl text-center relative">
            <button onClick={() => setDeployedUrl(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Deployment Successful!</h2>
            <p className="text-gray-600 mb-6">Your project is now live on the global edge network.</p>

            <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-between mb-6 border border-gray-200 group">
              <a href="#" className="text-brand-600 hover:underline font-mono text-sm truncate mr-2">{deployedUrl}</a>
              <button className="text-gray-400 hover:text-gray-900" title="Copy URL">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
            </div>

            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeployedUrl(null)} className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-brand-900/20">
                View Live Site
              </button>
              <button onClick={() => setDeployedUrl(null)} className="px-5 py-2.5 bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                Back to Editor
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Builder Sidebar (Chat) */}
      <div className="w-full md:w-[400px] lg:w-[450px] flex flex-col border-r border-gray-200 bg-white/90 backdrop-blur-sm z-10 shadow-xl flex-shrink-0 transition-all relative">
        <div className="p-4 border-b border-gray-200 flex items-center gap-3 select-none">
          <div className="w-8 h-8 text-brand-500 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setHasStarted(false)}>
            <Logo />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wide text-gray-900 cursor-pointer" onClick={() => setHasStarted(false)}>Locaith Builder</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              <span className="text-[10px] text-gray-500 font-mono">ACTIVE SESSION</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative bg-gray-50/50">
          <Sidebar messages={messages} />
        </div>

        <div className="p-4 bg-white/50 border-t border-gray-200">
          <ChatInput onSend={handleSend} isLoading={isLoading} />
        </div>

        {/* Mobile FAB: Open Preview Fullscreen */}
        <button
          onClick={() => setPreviewModalOpen(true)}
          className="md:hidden absolute bottom-24 right-4 bg-brand-600 hover:bg-brand-500 text-white shadow-lg rounded-full p-3 flex items-center justify-center"
          title="Xem kết quả"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
        </button>
      </div>

      {/* Builder Preview Area (hidden on mobile) */}
      <div className="hidden md:flex flex-1 flex-col h-full overflow-hidden bg-gray-100/50 relative backdrop-blur-sm">
        <div className="h-14 border-b border-gray-200 bg-white/80 backdrop-blur flex items-center justify-between px-4 z-20 transition-colors">
          <div className="flex items-center gap-2">
            <div className="bg-gray-100/80 px-3 py-1 rounded-md border border-gray-200 text-sm text-gray-600 font-mono">
              {projectName}
            </div>
          </div>

          <div className="flex items-center gap-3 relative">
            {/* GitHub Button & Popover */}
            <div className="relative">
              <button
                onClick={() => setActivePopover(activePopover === 'github' ? null : 'github')}
                className={`p-2 rounded-lg transition-colors ${githubStatus === 'connected'
                  ? 'text-white bg-gray-900'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-black'
                  }`}
                title="Sync to GitHub"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
              </button>
              {activePopover === 'github' && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 z-50">
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                    <span className="font-semibold text-sm text-gray-900">GitHub Integration</span>
                  </div>

                  {githubStatus === 'disconnected' ? (
                    <div className="space-y-4">
                      <div className="text-xs text-gray-500">
                        Connect your GitHub account to push code for this project.
                      </div>
                      {githubClientId === '' && (
                        <div className="text-[10px] text-red-500">Missing client id</div>
                      )}
                      {!isGithubAuthing && (
                        <button onClick={handleGithubLogin} className="w-full py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
                          <span>Connect GitHub Account</span>
                        </button>
                      )}
                      {isGithubAuthing && githubAuthData && (
                        <div className="space-y-2 bg-gray-50 rounded-lg border border-dashed border-gray-300 p-3">
                          <div className="text-xs font-semibold text-gray-900">Enter code</div>
                          <div className="flex items-center gap-2">
                            <div className="px-3 py-1.5 bg-white border border-gray-200 rounded font-mono text-xs text-gray-900">{githubAuthData.user_code}</div>
                            <button onClick={() => navigator.clipboard.writeText(githubAuthData.user_code)} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">Copy</button>
                          </div>
                          <a href={githubAuthData.verification_uri} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-600 hover:underline flex items-center gap-1">
                            Verify on GitHub
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                          </a>
                          <div className="text-[10px] text-gray-400">Waiting for approval...</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Connected State */}
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden"></div>
                        <div className="flex-1 overflow-hidden">
                          <div className="text-sm font-bold text-gray-900 truncate">{githubUser?.login || 'user'}</div>
                          <div className="text-xs text-gray-500 truncate">Logged in via GitHub</div>
                        </div>
                        <button onClick={() => setGithubStatus('disconnected')} className="text-xs text-red-500 hover:underline">Logout</button>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Repository</label>
                        <input value={githubRepoName} onChange={(e) => setGithubRepoName(e.target.value)} className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-xs font-mono text-gray-900" placeholder="repo-name" />
                        <label className="flex items-center gap-2 text-xs text-gray-600"><input type="checkbox" checked={githubRepoPrivate} onChange={(e) => setGithubRepoPrivate(e.target.checked)} />Private</label>
                      </div>

                      <button
                        onClick={handleGithubSync}
                        disabled={githubStatus === 'syncing'}
                        className="w-full py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        {githubStatus === 'syncing' ? (
                          <>
                            <span className="animate-spin w-3 h-3 border-2 border-current border-t-transparent rounded-full"></span>
                            Syncing Project...
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path><line x1="16" y1="5" x2="22" y2="5"></line><line x1="19" y1="2" x2="19" y2="8"></line></svg>
                            Create & Sync Repo
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Supabase Button & Popover */}
            <div className="relative">
              <button
                onClick={() => setActivePopover(activePopover === 'supabase' ? null : 'supabase')}
                className={`p-2 rounded-lg transition-colors ${supabaseStatus === 'connected'
                  ? 'text-green-500 bg-green-100'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-green-500'
                  }`}
                title="Connect Supabase"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
              </button>
              {activePopover === 'supabase' && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 z-50">
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                    <span className="font-semibold text-sm text-gray-900">Supabase Database</span>
                  </div>

                  {supabaseStatus === 'disconnected' ? (
                    <div className="space-y-4">
                      <div className="text-xs text-gray-500">
                        Connect to a Supabase project to enable backend features (Auth, Database, Storage).
                      </div>
                      {isSupabaseAuthing ? (
                        <div className="flex flex-col items-center justify-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                          <div className="animate-spin w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full mb-2"></div>
                          <p className="text-xs font-medium">Authenticating...</p>
                          <p className="text-[10px] text-gray-400">Please login in the popup window</p>
                        </div>
                      ) : (
                        <button onClick={handleSupabaseLogin} className="w-full py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
                          <span>Connect Supabase Project</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-lg">
                        <div>
                          <div className="text-sm font-bold text-green-800">Project Connected</div>
                          <div className="text-xs text-green-700">Reference ID: xkq-zya-mlp</div>
                        </div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button className="p-2 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 text-xs font-medium text-gray-700 flex flex-col items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                          Open SQL Editor
                        </button>
                        <button className="p-2 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 text-xs font-medium text-gray-700 flex flex-col items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                          Auth Rules
                        </button>
                      </div>

                      <button onClick={() => setSupabaseStatus('disconnected')} className="w-full py-2 text-xs text-red-500 hover:bg-red-50 rounded transition-colors">
                        Disconnect Project
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleDeploy}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-brand-900/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
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
              title="Đóng"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div className="absolute top-0 left-0 right-0 h-12 bg-white border-b border-gray-200 flex items-center px-4 text-sm text-gray-600 md:hidden">
              Xem trước website
            </div>
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

// --- Feature Placeholders ---

// DesignFeature is now imported from components/DesignFeature.tsx

// --- Voice Feature Data ---
const GOOGLE_VOICES = [
  { id: 'en-US-Journey-D', name: 'Journey D', type: 'Expressive', gender: 'Male' },
  { id: 'en-US-Journey-F', name: 'Journey F', type: 'Expressive', gender: 'Female' },
  { id: 'en-US-Neural2-A', name: 'Neural2 A', type: 'Pro', gender: 'Male' },
  { id: 'en-US-Neural2-C', name: 'Neural2 C', type: 'Pro', gender: 'Female' },
  { id: 'en-US-Neural2-F', name: 'Neural2 F', type: 'Pro', gender: 'Female' },
  { id: 'en-US-Studio-M', name: 'Studio M', type: 'Studio', gender: 'Male' },
  { id: 'en-US-Studio-O', name: 'Studio O', type: 'Studio', gender: 'Female' },
  { id: 'en-US-Wavenet-A', name: 'WaveNet A', type: 'Standard', gender: 'Male' },
  { id: 'en-US-Wavenet-D', name: 'WaveNet D', type: 'Standard', gender: 'Male' },
  { id: 'vi-VN-Standard-A', name: 'Vietnamese A', type: 'Standard', gender: 'Female' },
  { id: 'vi-VN-Standard-B', name: 'Vietnamese B', type: 'Standard', gender: 'Male' },
];

const VoiceChatFeature: React.FC = () => {
  const [selectedVoice, setSelectedVoice] = useState("en-US-Journey-D");
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [testText, setTestText] = useState("Hello! This is a test of the Locaith TTS system.");
  const [isPlayingTest, setIsPlayingTest] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [voiceMessages, setVoiceMessages] = useState<{ role: 'user' | 'assistant', text: string }[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recRef = useRef<any>(null);
  const { trackActivity } = useUserActivity();
  const aiRef = useRef<any>(null);
  if (!aiRef.current) aiRef.current = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

  const browserLang = (typeof navigator !== 'undefined' && navigator.language) ? navigator.language : 'en-US';
  const autoLang = browserLang.toLowerCase().startsWith('vi') ? 'vi-VN' : 'en-US';
  const [conversationLang, setConversationLang] = useState<'auto' | 'en-US' | 'vi-VN'>('auto');
  const effectiveLang = conversationLang === 'auto' ? autoLang : conversationLang;
  const getLang = (_v: string) => effectiveLang;

  const handleAssistantReply = async (userText: string) => {
    try {
      trackActivity({ feature_type: 'voice', action_type: 'create', action_details: { transcript: userText } });
      const result = await aiRef.current.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [{ role: 'user', parts: [{ text: userText }] }]
      });
      const replyText = result?.response?.text?.() || '';
      if (replyText) {
        setVoiceMessages(prev => [...prev, { role: 'assistant', text: replyText }]);
        trackActivity({ feature_type: 'voice', action_type: 'generate', action_details: { reply: replyText } });
        const voiceForLang = effectiveLang === 'vi-VN' ? 'vi-VN-Standard-A' : selectedVoice;
        const { data, error } = await supabase.functions.invoke('tts', {
          body: { text: replyText, voiceName: voiceForLang, speakingRate: voiceSpeed }
        });
        if (!error && data?.audioContent) {
          setIsSpeaking(true);
          const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
          audio.onended = () => setIsSpeaking(false);
          audio.onerror = () => setIsSpeaking(false);
          await audio.play();
        }
      }
    } catch (_e) { }
  };

  const startRecognition = () => {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setStatus('Speech unavailable');
      return;
    }
    const rec = new SR();
    rec.lang = getLang(selectedVoice);
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = async (e: any) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) {
          const text = r[0]?.transcript?.trim();
          if (text) {
            setVoiceMessages(prev => [...prev, { role: 'user', text }]);
            await handleAssistantReply(text);
          }
        }
      }
    };
    rec.onend = () => { if (isListening) rec.start(); };
    recRef.current = rec;
    rec.start();
  };

  const toggleListen = async () => {
    if (isListening) {
      setIsListening(false);
      setStatus("Ready");
      if (audioStream) {
        audioStream.getTracks().forEach(t => t.stop());
        setAudioStream(null);
      }
      try { recRef.current && recRef.current.stop(); } catch { }
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      setIsListening(true);
      setStatus("Listening...");
      startRecognition();
    } catch (e) {
      setStatus("Mic permission denied");
    }
  };

  const handleTestVoice = async () => {
    if (!testText.trim()) return;
    setIsPlayingTest(true);
    try {
      const { data, error } = await supabase.functions.invoke('tts', {
        body: { text: testText.trim(), voiceName: selectedVoice, speakingRate: voiceSpeed }
      });
      if (error) throw error;
      if (!data?.audioContent) throw new Error('No audio');
      const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
      audio.onended = () => setIsPlayingTest(false);
      audio.onerror = () => setIsPlayingTest(false);
      await audio.play();
    } catch (e) {
      const duration = Math.min(5000, testText.length * 50);
      setTimeout(() => setIsPlayingTest(false), duration);
    }
  };

  return (
    <div className="flex h-full bg-transparent text-gray-900 animate-fade-in-up overflow-hidden">
      {/* Main Visualizer Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative">

        {/* Visualization Circle */}
        <div className="relative z-10 mb-12">
          {(isListening || isPlayingTest) && (
            <>
              <div className="absolute inset-0 bg-brand-500/30 rounded-full animate-ping"></div>
              <div className="absolute inset-0 bg-brand-500/20 rounded-full animate-pulse delay-75 transform scale-150"></div>
            </>
          )}
          <div className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 backdrop-blur-md ${isListening || isPlayingTest ? 'bg-gradient-to-br from-brand-500 to-accent-600 scale-110' : 'bg-gray-100/80 border border-gray-200'}`}>
            {isPlayingTest ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`${isListening ? 'text-white' : 'text-gray-400'}`}>
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            )}
          </div>
        </div>

        <h2 className="text-3xl font-bold tracking-tight mb-2 drop-shadow-sm">{isPlayingTest || isSpeaking ? 'Speaking...' : status}</h2>
        <p className="text-gray-500 mb-8 max-w-md text-center bg-white/20 p-2 rounded-lg backdrop-blur-sm">
          {isPlayingTest ? 'Testing voice configuration...' : 'Start a natural conversation. The AI will respond with human-like intonation.'}
        </p>

        <button
          onClick={toggleListen}
          disabled={isPlayingTest}
          className={`px-8 py-4 rounded-full font-medium text-lg transition-all shadow-lg flex items-center gap-3 ${isListening
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-gray-900 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
        >
          {isListening ? (
            <>
              <span className="animate-pulse w-3 h-3 bg-white rounded-full"></span>
              Turn Off
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
              Voice On
            </>
          )}
        </button>
        <div className="mt-8 w-full max-w-xl space-y-3 px-6">
          {voiceMessages.slice(-8).map((m, i) => (
            <div key={i} className={`text-sm rounded-lg px-3 py-2 border ${m.role === 'assistant' ? 'bg-brand-50 border-brand-200 text-brand-900' : 'bg-gray-50 border-gray-200 text-gray-900'}`}>
              <span className="font-mono text-[10px] mr-2 uppercase tracking-wide">{m.role}</span>
              <span>{m.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Settings Panel */}
      <div className="w-96 border-l border-gray-200 bg-white/50 backdrop-blur-md flex flex-col overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
          <h3 className="font-semibold text-gray-900">Voice Configuration</h3>
        </div>

        <div className="p-6 space-y-8">
          {/* Model Selection */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Google Cloud TTS Model</label>
            <div className="relative">
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {['Expressive', 'Pro', 'Studio', 'Standard'].map(type => (
                  <optgroup key={type} label={`${type} Voices`}>
                    {GOOGLE_VOICES.filter(v => v.type === type).map(v => (
                      <option key={v.id} value={v.id}>{v.name} ({v.gender})</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"></path></svg>
              </div>
            </div>
          </div>

          {/* Speed Control */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Speaking Rate</label>
              <span className="text-xs font-mono text-brand-600">{voiceSpeed}x</span>
            </div>
            <input
              type="range"
              min="0.25"
              max="4.0"
              step="0.25"
              value={voiceSpeed}
              onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
            <div className="flex justify-between mt-1 text-[10px] text-gray-400">
              <span>Slow</span>
              <span>Normal</span>
              <span>Fast</span>
            </div>
          </div>

          {/* Test Area */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Test Voice</label>
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value.slice(0, 1000))}
              placeholder="Enter text to test the voice..."
              className="w-full h-24 bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-900 resize-none focus:outline-none focus:border-brand-500 transition-colors"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-[10px] text-gray-500">{testText.length}/1000 chars</span>
              <button
                onClick={handleTestVoice}
                disabled={isPlayingTest || !testText.trim()}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:hover:bg-brand-600 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                {isPlayingTest ? (
                  <>
                    <span className="animate-spin w-3 h-3 border-2 border-current border-t-transparent rounded-full"></span>
                    Playing...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                    Play Test
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 mt-auto">
          <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-xs text-yellow-800">
            <strong>System Note:</strong> Voice synthesis runs on Google Cloud. Ensure credentials are active in the Settings panel before use.
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsFeature: React.FC = () => {
  const { user, signOut, signInWithGoogle, isAuthenticated } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState<any[]>([]);

  const scanDevices = async () => {
    setScanning(true);
    try {
      // Simulate scanning or actually try to access bluetooth if available
      if (navigator.bluetooth) {
        try {
          const device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: ['battery_service']
          });
          setDevices(prev => [...prev, { name: device.name || 'Unknown Device', id: device.id, type: 'Bluetooth' }]);
        } catch (err) {
          console.log("Bluetooth cancelled or failed", err);
        }
      } else {
        // Simulation for UI demo
        await new Promise(resolve => setTimeout(resolve, 1500));
        setDevices(prev => [...prev,
        { name: 'ESP32-S3-Box', id: 'dev_01', type: 'WiFi/Matter' },
        { name: 'HC-05 Module', id: 'dev_02', type: 'Bluetooth' }
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="p-10 max-w-5xl mx-auto text-gray-900 animate-fade-in-up overflow-y-auto h-full bg-white/80 backdrop-blur-md shadow-sm">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 drop-shadow-md">Settings</h2>
      <div className="bg-white/50 backdrop-blur-md rounded-xl border border-gray-200 p-6 space-y-8 shadow-sm">

        {/* Account Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Account</h3>
          <div className="flex items-center justify-between p-4 bg-gray-50/80 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <div>
                <div className="font-medium">
                  {user?.user_metadata?.full_name || 'User'}
                </div>
                <div className="text-sm text-gray-500">
                  {user?.email || 'user@example.com'}
                </div>
              </div>
            </div>
            {isAuthenticated ? (
              <button
                onClick={signOut}
                className="text-sm text-red-600 hover:text-red-700 hover:underline"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="text-sm text-brand-600 hover:text-brand-700 hover:underline"
              >
                Sign In with Google
              </button>
            )}
          </div>
        </div>

        {/* Device Management */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Connected Devices</h3>
              <p className="text-sm text-gray-500">Manage physical AI hardware (ESP32, Bluetooth speakers, IoT).</p>
            </div>
            <button
              onClick={scanDevices}
              disabled={scanning}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all flex items-center gap-2"
            >
              {scanning ? (
                <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path><path d="M5 12a7 7 0 0 1 14 0"></path></svg>
              )}
              {scanning ? 'Scanning...' : 'Add Device'}
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {devices.length === 0 ? (
              <div className="p-8 text-center text-gray-500 bg-gray-50/50">
                No devices connected. Click "Add Device" to scan for Bluetooth or WiFi hardware.
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {devices.map((dev, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                        {dev.type === 'Bluetooth' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 7 10 10-5 5V2l5 5L7 17"></path></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{dev.name}</div>
                        <div className="text-xs text-gray-500">ID: {dev.id} • {dev.type}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase">Connected</span>
                      <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* API Keys */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">API Configuration</h3>
          <div className="p-4 bg-gray-50/80 rounded-lg border border-gray-200">
            <label className="text-sm text-gray-500 block mb-2">Gemini API Key</label>
            <div className="flex gap-2">
              <input type="password" value="************************" disabled className="flex-1 bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-500" />
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50">Update</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import { LoginPage } from './components/LoginPage';

// ... (keep existing imports)

// --- Main App Shell ---

const App: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<FeatureType>('voice');
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('default');
  const [customBg, setCustomBg] = useState<string | null>(null);
  // const [showAuthModal, setShowAuthModal] = useState(false); // Removed in favor of full page login
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'signup'>('login');
  const [voicePrompt, setVoicePrompt] = useState<string>('');
  const [voiceTrigger, setVoiceTrigger] = useState<number>(0);
  const [voiceMode, setVoiceMode] = useState<VoiceMode>('HIDDEN');

  // View State for Login Page
  const [view, setView] = useState<'app' | 'login'>('app');

  // Auth
  const { user, signOut, isAuthenticated } = useAuth();

  // Sidebar State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(256); // Default 64 * 4 = 256px

  const handleThemeChange = (theme: ThemeType, customImage?: string) => {
    setCurrentTheme(theme);
    if (customImage) {
      setCustomBg(customImage);
    }
  };

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarCollapsed(true);
      setSidebarWidth(80);
    }
  }, []);



  const getBackgroundClass = () => {
    if (currentTheme === 'custom' && customBg) return '';
    switch (currentTheme) {
      case 'universe': return 'bg-[url("https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")] bg-cover bg-center';
      case 'ocean': return 'bg-[url("https://images.unsplash.com/photo-1473773508845-188df298d2d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")] bg-cover bg-center';
      case 'sky': return 'bg-[url("https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")] bg-cover bg-center';
      case 'matrix': return 'bg-[url("https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")] bg-cover bg-center';
      case 'pink': return 'bg-gradient-to-br from-pink-400 via-rose-300 to-indigo-300';
      case 'coffee': return 'bg-[#2c1b18]'; // Simple solid color for vintage feel, or could use a texture
      default: return 'bg-gray-50';
    }
  };

  // Sidebar Resizing Logic
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);

  const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
    isResizingRef.current = true;
  }, []);

  const stopResizing = useCallback(() => {
    isResizingRef.current = false;
  }, []);

  const resize = useCallback((mouseMoveEvent: MouseEvent) => {
    if (isResizingRef.current) {
      const newWidth = mouseMoveEvent.clientX;
      if (newWidth > 60 && newWidth < 400) {
        setSidebarWidth(newWidth);
        if (newWidth < 80) setIsSidebarCollapsed(true);
        else setIsSidebarCollapsed(false);
      }
    }
  }, []);

  const handleNavigate = (view: any) => {
    const map: Record<string, FeatureType> = {
      BUILDER: 'web-builder',
      INTERIOR: 'design',
      COMPOSE: 'text',
      SEARCH: 'search',
      MARKETING: 'automation',
    };
    const target = map[String(view).toUpperCase()] || 'web-builder';
    setActiveFeature(target);
  };

  const handleFillAndGenerate = (text: string) => {
    setActiveFeature('web-builder');
    setVoicePrompt(text);
    setVoiceTrigger((t) => t + 1);
  };

  useEffect(() => {
    if (activeFeature === 'voice') {
      setVoiceMode('FULL');
    }
  }, [activeFeature]);

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // If view is login, render LoginPage
  if (view === 'login') {
    return (
      <LoginPage
        onLoginSuccess={() => setView('app')}
        onBack={() => setView('app')}
      />
    );
  }

  // Close mobile menu when selecting a feature
  const handleMobileSelect = (feature: FeatureType) => {
    setActiveFeature(feature);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="h-screen w-screen overflow-hidden transition-colors duration-300 relative">
      {/* Auth Modal - Removed/Commented out as we use LoginPage now */}
      {/* <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialMode={authInitialMode} /> */}

      <div className="flex h-full bg-white text-gray-900 font-sans overflow-hidden transition-colors duration-300">

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Resizable Global Sidebar */}
        <div
          className={`
            fixed inset-y-0 left-0 z-50 bg-white shadow-2xl md:shadow-none transition-transform duration-300 ease-out md:relative md:translate-x-0 flex-shrink-0
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
          style={{ width: isMobile ? '280px' : (isSidebarCollapsed ? 80 : sidebarWidth) }}
        >
          <GlobalSidebar
            activeFeature={activeFeature}
            onSelect={handleMobileSelect}
            currentTheme={currentTheme}
            onThemeChange={handleThemeChange}
            isCollapsed={isMobile ? false : isSidebarCollapsed}
            onToggleCollapse={isMobile ? undefined : () => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
          {/* Resize Handle (Desktop Only) */}
          <div
            className="hidden md:block absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-brand-500/50 transition-colors z-50"
            onMouseDown={startResizing}
          />
        </div>

        {/* Main Content Area - Features now use transparent backgrounds */}
        <div
          className={`flex-1 relative overflow-hidden transition-colors duration-300 ${getBackgroundClass()}`}
          style={currentTheme === 'custom' && customBg ? { backgroundImage: `url(${customBg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        >
          {/* Reduced overlay opacity for clearer themes (bg-white/30 instead of /80) */}
          {currentTheme !== 'default' && <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px] z-0"></div>}

          <div className="relative z-10 h-full flex flex-col">
            <div className="shrink-0 h-10 md:h-12 bg-white/80 backdrop-blur flex items-center justify-between md:justify-end px-3 md:px-4 border-b border-gray-200">
              {/* Mobile Menu Trigger */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
              </button>
              {!isAuthenticated && (
                <div className="flex items-center gap-2">
                  <button onClick={() => { setAuthInitialMode('login'); setView('login'); }} className="px-3 py-1.5 bg-white/80 border border-gray-200 rounded-full text-xs text-gray-700 hover:bg-white transition-colors">Đăng nhập</button>
                  <button onClick={() => { setAuthInitialMode('signup'); setView('login'); }} className="px-3 py-1.5 bg-white/80 border border-gray-200 rounded-full text-xs text-gray-700 hover:bg-white transition-colors">Đăng ký</button>
                </div>
              )}
            </div>

            <div className="flex-1 relative overflow-hidden">
              <Suspense fallback={<div className="h-full w-full flex items-center justify-center"><div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div></div>}>
                {activeFeature === 'web-builder' && <WebBuilderFeature initialPrompt={voicePrompt} trigger={voiceTrigger} />}
                {activeFeature === 'design' && <DesignFeature />}
                {activeFeature === 'text' && <ComposeFeature />}
                {activeFeature === 'search' && <SearchFeature />}
                {activeFeature === 'automation' && <ContentAutomationFeature />}
                {activeFeature === 'settings' && <SettingsFeature />}
              </Suspense>
            </div>

            {voiceMode !== 'HIDDEN' && (
              <VoiceChat
                mode={voiceMode}
                setMode={setVoiceMode}
                onNavigate={handleNavigate}
                onFillAndGenerate={handleFillAndGenerate}
                lastUserInteraction={null}
              />
            )}


          </div>
        </div>

        {/* Recent History Sidebar */}
        {isAuthenticated && (
          <div className="hidden lg:block">
            <RecentHistorySidebar
              currentFeature={activeFeature}
              isCollapsed={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
