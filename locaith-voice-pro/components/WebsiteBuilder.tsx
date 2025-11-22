
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, Code, Eye, Download, Upload, Github, Globe, 
  File, Check, Terminal, Loader2, RefreshCw, X, 
  MessageSquare, Edit2, ChevronRight, Box, Layers,
  LogOut, Lock, GitBranch, Key, UserCircle, Wrench,
  History, RotateCcw, AlertTriangle, Square
} from 'lucide-react';
import JSZip from 'jszip';
import { ProjectFile, BuildStep } from '../types';
import { streamWebsiteGeneration } from '../services/geminiService';

interface WebsiteBuilderProps {
  initialPrompt?: string;
  onClose: () => void;
}

interface ChatMessage {
  id: number;
  role: 'user' | 'ai' | 'system';
  content: string;
  detail?: string; // For system logs
}

interface GithubUser {
  name: string;
  avatar_url: string;
  login: string;
  html_url: string;
}

// Snapshot structure for checkpoints
interface Checkpoint {
  id: number;
  timestamp: Date;
  label: string;
  files: Record<string, ProjectFile>;
}

declare global {
  interface Window {
    Prism: any;
  }
}

const WebsiteBuilder: React.FC<WebsiteBuilderProps> = ({ initialPrompt, onClose }) => {
  // --- State: Project Data ---
  const [projectName, setProjectName] = useState(initialPrompt ? initialPrompt.slice(0, 30) : 'Untitled Project');
  const [isEditingName, setIsEditingName] = useState(false);
  const [files, setFiles] = useState<Record<string, ProjectFile>>({});
  
  // --- State: Checkpoints / History ---
  const [history, setHistory] = useState<Checkpoint[]>([]);
  const [showHistoryMenu, setShowHistoryMenu] = useState(false);

  // --- State: UI Layout ---
  const [leftPanelWidth, setLeftPanelWidth] = useState(400);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('preview');
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);

  // --- State: Chat & Logic ---
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAutoFixing, setIsAutoFixing] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  
  // --- State: GitHub Integration ---
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [githubStep, setGithubStep] = useState<'token' | 'verifying' | 'config' | 'pushing' | 'success'>('token');
  const [githubUser, setGithubUser] = useState<GithubUser | null>(null);
  const [githubToken, setGithubToken] = useState('');
  const [repoName, setRepoName] = useState('');
  const [isPrivateRepo, setIsPrivateRepo] = useState(false);
  const [githubError, setGithubError] = useState<string | null>(null);

  // --- Refs ---
  const chatEndRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize
  useEffect(() => {
    if (initialPrompt) {
      handleGenerate(initialPrompt);
    } else {
      addChatMessage('ai', 'Hello! Describe the website you want to build, and I will write the code for you.');
    }
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Syntax Highlighting Effect
  useEffect(() => {
    if (activeTab === 'code' && activeFile && files[activeFile] && codeRef.current && window.Prism) {
       window.Prism.highlightElement(codeRef.current);
    }
  }, [activeTab, activeFile, files]); 

  // --- Auto-Healing Listener ---
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'PREVIEW_ERROR') {
        const { message, source, lineno } = event.data.error;
        // Debounce auto-fix to prevent loops
        if (!isGenerating && !isAutoFixing) {
           handleAutoFix(message, source, lineno);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [files, isGenerating, isAutoFixing]);

  // --- Helpers ---

  const addChatMessage = (role: 'user' | 'ai' | 'system', content: string, detail?: string) => {
    setChatHistory(prev => [...prev, { id: Date.now(), role, content, detail }]);
  };

  const restoreCheckpoint = (checkpoint: Checkpoint) => {
    setFiles(checkpoint.files);
    addChatMessage('system', `Restored checkpoint: "${checkpoint.label}"`);
    setPreviewKey(prev => prev + 1);
    setShowHistoryMenu(false);
  };

  const getLanguageFromExt = (filename: string | null | undefined) => {
    if (!filename) return 'javascript';
    if (filename.endsWith('.tsx') || filename.endsWith('.ts')) return 'typescript';
    if (filename.endsWith('.html')) return 'html';
    if (filename.endsWith('.css')) return 'css';
    if (filename.endsWith('.json')) return 'json';
    return 'javascript';
  };

  // --- Download Zip Function ---
  const handleDownloadZip = async () => {
    const zip = new JSZip();
    
    // Add files to zip
    Object.values(files).forEach(file => {
      zip.file(file.name, file.content);
    });
    
    // Add a readme
    zip.file("README.md", `# ${projectName}\n\nGenerated by Locaith Studio Builder.\n\n## How to run\n\n1. Install dependencies: \`npm install\`\n2. Run dev server: \`npm run dev\``);

    // Generate blob
    const blob = await zip.generateAsync({ type: "blob" });
    
    // Trigger download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '-').toLowerCase()}.zip`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // --- Core Logic ---

  const handleStop = () => {
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
    }
    setIsGenerating(false);
    setIsAutoFixing(false);
    addChatMessage('system', '🛑 Generation stopped by user.');
  };

  const handleGenerate = async (inputPrompt: string = prompt, isFixRequest: boolean = false) => {
    if ((!inputPrompt.trim() && !isFixRequest) || isGenerating) return;
    
    // 1. Add user message only if it's a fresh prompt and NOT a duplicate of the last one
    if (!isFixRequest) {
        const lastMsg = chatHistory[chatHistory.length - 1];
        // Only add message if chat is empty OR last message wasn't from user OR content is different
        if (!lastMsg || lastMsg.role !== 'user' || lastMsg.content !== inputPrompt) {
             addChatMessage('user', inputPrompt);
        }
        setPrompt('');
    }

    setIsGenerating(true);
    // Reset AbortController
    abortControllerRef.current = new AbortController();

    if (isFixRequest) {
      setIsAutoFixing(true);
    } else {
      setActiveTab('code');
    }

    if (!isFixRequest) {
        addChatMessage('ai', 'On it! Updating your project...');
    }

    try {
      const stream = streamWebsiteGeneration(inputPrompt, files, abortControllerRef.current.signal);
      
      for await (const event of stream) {
        if (event.type === 'log') {
          addChatMessage('system', event.data.message, event.data.detail);
        } else if (event.type === 'file') {
          const fileData = event.data as ProjectFile;
          
          if (!fileData.name) continue;

          setFiles(prev => ({
            ...prev,
            [fileData.name]: {
              ...fileData,
              language: getLanguageFromExt(fileData.name)
            }
          }));
          
          if (fileData.status === 'creating') {
             setActiveFile(fileData.name);
          }
        }
      }
      
      addChatMessage('ai', isFixRequest ? 'I have applied a fix. Reloading...' : 'Changes applied! Checking preview...');
      setActiveTab('preview');
      setPreviewKey(k => k + 1);
      
      // SAVE CHECKPOINT HERE (After success)
      // We need to capture the state *after* the stream finishes.
      // Since setFiles is async, we schedule this on the next tick or just rely on the final state update chain.
      if (!isFixRequest) {
          setTimeout(() => {
              setFiles((currentFiles) => {
                  // Check if we have files to save
                  if (Object.keys(currentFiles).length > 0) {
                      const label = inputPrompt.length > 30 ? `Task: ${inputPrompt.slice(0, 30)}...` : `Task: ${inputPrompt}`;
                      const newCheckpoint: Checkpoint = {
                          id: Date.now(),
                          timestamp: new Date(),
                          label,
                          files: JSON.parse(JSON.stringify(currentFiles))
                      };
                      setHistory(prev => [newCheckpoint, ...prev].slice(0, 20));
                  }
                  return currentFiles;
              });
          }, 100);
      }

    } catch (e) {
      // console.error(e); // Handled in service
    } finally {
      setIsGenerating(false);
      setIsAutoFixing(false);
      abortControllerRef.current = null;
    }
  };

  const handleAutoFix = (errorMessage: string, source: string, line: number) => {
    if (isGenerating || isAutoFixing) return;

    console.log("Auto-fixing error:", errorMessage, "in", source);
    
    const fileName = source ? source.split('/').pop() : '';
    
    addChatMessage('system', `Runtime Error Detected: ${errorMessage}`, `File: ${fileName || 'unknown'}`);
    addChatMessage('ai', 'Detecting crash. Auto-healing...');

    const fixPrompt = `
      CRITICAL RUNTIME ERROR DETECTED in the browser.
      Error: "${errorMessage}"
      
      TASK: Fix the code.
      RULES: 
      1. Remember: DO NOT use imports or exports.
      2. Define components as consts/functions in global scope.
      3. Fix the specific error in ${fileName || 'the code'}.
    `;

    handleGenerate(fixPrompt, true);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startWidth = leftPanelWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = startWidth + (moveEvent.clientX - startX);
      if (newWidth > 250 && newWidth < 800) {
        setLeftPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // --- GitHub Logic (Real Verification) ---
  
  const handleGithubVerify = async () => {
    setGithubError(null);
    setGithubStep('verifying');
    
    try {
      // Real API call to check token
      const res = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: 'application/vnd.github.v3+json'
        }
      });

      if (!res.ok) {
        throw new Error('Invalid token or insufficient permissions.');
      }

      const data = await res.json();
      setGithubUser({
        name: data.name || data.login,
        login: data.login,
        avatar_url: data.avatar_url,
        html_url: data.html_url
      });
      
      setGithubStep('config');
      setRepoName(projectName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
      
    } catch (err: any) {
      setGithubError(err.message || "Failed to verify token");
      setGithubStep('token');
    }
  };

  const handleGithubPush = () => {
    setGithubStep('pushing');
    setTimeout(() => {
      setGithubStep('success');
    }, 2000);
  };

  // --- Preview Engine (The Virtual Bundler) ---

  const generatePreviewHtml = () => {
    const projectFiles = Object.values(files) as ProjectFile[];
    
    // 1. CSS Extraction
    const cssFiles = projectFiles.filter((f) => f?.name?.endsWith('.css'));
    const styles = cssFiles.map(f => f.content).join('\n');

    // 2. File Sorting (Dependencies first)
    // We want utils/hooks first, then sub-components, then App.
    const tsxFiles = projectFiles.filter((f) => f?.name && (f.name.endsWith('.tsx') || f.name.endsWith('.ts') || f.name.endsWith('.js') || f.name.endsWith('.jsx')));
    const sortedFiles = tsxFiles.sort((a, b) => {
      const getScore = (name: string) => {
        const lower = name.toLowerCase();
        if (lower.includes('types') || lower.includes('interface')) return 0;
        if (lower.includes('utils') || lower.includes('helper') || lower.includes('hook')) return 1;
        if (lower.includes('component')) return 2;
        if (lower.includes('page')) return 3;
        if (lower.includes('app')) return 10; // App comes last
        return 5;
      };
      return getScore(a.name) - getScore(b.name);
    });

    // 3. Cleanup & Concatenation
    const bundledScript = sortedFiles.map(file => {
        let content = file.content;
        // Basic cleanup: remove lines starting with import
        content = content.replace(/^import\s+.*$/gm, '// import removed');
        // Remove export keywords to avoid syntax errors in non-module script
        content = content.replace(/export\s+default\s+function/g, 'function');
        content = content.replace(/export\s+default\s+class/g, 'class');
        content = content.replace(/export\s+default\s+/g, ''); // for variables
        content = content.replace(/export\s+const/g, 'const');
        content = content.replace(/export\s+function/g, 'function');
        content = content.replace(/export\s+interface/g, 'interface');
        content = content.replace(/export\s+type/g, 'type');
        
        // Remove explicit ReactDOM mounts if the AI included them (we do it manually)
        if (file.name.includes('index')) {
             content = content.replace(/ReactDOM\.createRoot.*/s, '');
             content = content.replace(/root\.render.*/s, '');
        }

        return `/* --- ${file.name} --- */\n${content}`;
    }).join('\n\n');

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://cdn.tailwindcss.com"></script>
        
        <!-- Fonts: Professional Selection -->
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&family=Poppins:wght@300;400;500;600&family=Space+Grotesk:wght@400;600&display=swap" rel="stylesheet">

        <!-- React & ReactDOM (UMD) -->
        <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
        <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
        
        <!-- Babel (Standalone) -->
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        
        <!-- Lucide (Vanilla for icons) -->
        <script src="https://unpkg.com/lucide@latest"></script>
        
        <style>
          body { background-color: #ffffff; margin: 0; font-family: 'Inter', sans-serif; }
          ${styles}
          /* Loading spinner for preview */
          #root:empty::before {
            content: 'Initializing...';
            display: block;
            padding: 20px;
            text-align: center;
            color: #888;
            font-size: 12px;
          }
          #preview-error {
            display: none;
            background: #fee2e2; color: #b91c1c; padding: 12px;
            font-family: monospace; font-size: 12px; border-bottom: 2px solid #ef4444;
          }
        </style>
      </head>
      <body>
        <div id="preview-error"></div>
        <div id="root"></div>
        
        <script type="text/babel" data-presets="react,typescript">
          // --- ERROR HANDLING ---
          window.onerror = function(message, source, lineno, colno, error) {
            const el = document.getElementById('preview-error');
            if (el) {
              el.style.display = 'block';
              el.textContent = 'Runtime Error: ' + message + ' (Line ' + lineno + ')';
            }
            // Post to parent
            window.parent.postMessage({
              type: 'PREVIEW_ERROR',
              error: { message, source, lineno }
            }, '*');
          };

          // --- ENVIRONMENT SETUP ---
          const { useState, useEffect, useRef, useMemo, useCallback } = React;
          
          // Generic Icon Component (Using vanilla Lucide to avoid React version conflicts)
          const Icon = ({ name, size = 24, className = "", ...props }) => {
             const iconRef = useRef(null);
             useEffect(() => {
               if (iconRef.current && window.lucide) {
                 window.lucide.createIcons({
                   root: iconRef.current.parentNode,
                   name: name,
                   attrs: {
                     width: size,
                     height: size,
                     class: className,
                     ...props
                   }
                 });
               }
             }, [name, size, className]);
             return <i data-lucide={name} ref={iconRef} className={className}></i>;
          };

          // --- USER CODE ---
          ${bundledScript}

          // --- MOUNTING ---
          setTimeout(() => {
             const rootElement = document.getElementById('root');
             if (typeof App !== 'undefined') {
                 const root = ReactDOM.createRoot(rootElement);
                 root.render(<App />);
             } else {
                 console.warn("App component not found. Waiting...");
                 // Retry once
                 setTimeout(() => {
                    if (typeof App !== 'undefined') {
                        const root = ReactDOM.createRoot(rootElement);
                        root.render(<App />);
                    } else {
                        rootElement.innerHTML = '<div style="padding:20px;color:red">Error: <App /> component not defined. Please ask AI to fix the entry point.</div>';
                    }
                 }, 500);
             }
          }, 100);
        </script>
      </body>
      </html>
    `;
  };

  // --- Render ---

  return (
    <div className="flex h-full w-full bg-white overflow-hidden font-sans">
      
      {/* --- LEFT COLUMN: Chat --- */}
      <div 
        ref={sidebarRef}
        style={{ width: leftPanelWidth }} 
        className="flex flex-col border-r border-gray-200 bg-gray-50 h-full relative flex-shrink-0"
      >
         <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
            <div className="flex items-center space-x-2 text-gray-700 font-semibold">
               <MessageSquare className="w-5 h-5 text-blue-600" />
               <span>Assistant</span>
            </div>
            <div className="flex items-center space-x-2">
                {isAutoFixing && (
                    <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-1 rounded-full animate-pulse flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Auto-Healing
                    </span>
                )}
                <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
                   <X className="w-5 h-5" />
                </button>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.map((msg) => (
               <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {msg.role === 'system' ? (
                     <div className={`w-full rounded-lg p-3 text-xs font-mono border mt-1 mb-1 ${msg.content.includes('Error') ? 'bg-red-50 border-red-100 text-red-700' : 'bg-gray-200/50 border-gray-200 text-gray-600'}`}>
                         <div className="flex items-center gap-2 mb-1">
                            {msg.content.includes('Error') ? <Wrench className="w-3 h-3" /> : <Terminal className="w-3 h-3" />}
                            <span className="font-bold uppercase">{msg.content}</span>
                         </div>
                         {/* Render detail as HTML (for thoughts) */}
                         {msg.detail && (
                           <div 
                             className="pl-5 opacity-75 whitespace-pre-wrap prose prose-sm prose-gray max-w-none [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4 [&>li]:mb-1"
                             dangerouslySetInnerHTML={{ __html: msg.detail }}
                           />
                         )}
                     </div>
                  ) : (
                     <div 
                        className={`max-w-[90%] px-4 py-3 rounded-2xl text-sm shadow-sm ${
                           msg.role === 'user' 
                           ? 'bg-blue-600 text-white rounded-br-sm' 
                           : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
                        }`}
                     >
                        {msg.content}
                     </div>
                  )}
               </div>
            ))}
            {isGenerating && (
               <div className="flex items-center space-x-2 text-gray-500 text-xs px-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>{isAutoFixing ? 'Fixing code...' : 'Generating Website...'}</span>
               </div>
            )}
            <div ref={chatEndRef} />
         </div>

         <div className="p-4 bg-white border-t border-gray-200">
            <div className="relative flex items-center gap-2">
               <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                     if(e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleGenerate();
                     }
                  }}
                  placeholder={isAutoFixing ? "Auto-healing in progress..." : "Describe changes or new features..."}
                  disabled={isGenerating || isAutoFixing}
                  className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none h-12 min-h-[48px] max-h-32 disabled:opacity-70"
               />
               {isGenerating ? (
                   <button 
                     onClick={handleStop}
                     className="absolute right-2 top-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 animate-pulse"
                     title="Stop Generation"
                   >
                      <Square className="w-4 h-4 fill-current" />
                   </button>
               ) : (
                   <button 
                      onClick={() => handleGenerate()}
                      disabled={isAutoFixing}
                      className="absolute right-2 top-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                      <ChevronRight className="w-4 h-4" />
                   </button>
               )}
            </div>
         </div>

         <div 
            className={`absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 transition-colors z-10 ${isResizing ? 'bg-blue-600' : 'bg-transparent'}`}
            onMouseDown={handleMouseDown}
         />
      </div>

      {/* --- RIGHT COLUMN: Workspace --- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white relative">
         
         <div className="h-14 border-b border-gray-200 flex items-center justify-between px-4 bg-white">
            <div className="flex items-center space-x-3 group">
               <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                  <Box className="w-5 h-5" />
               </div>
               {isEditingName ? (
                  <input 
                     type="text" 
                     value={projectName}
                     onChange={(e) => setProjectName(e.target.value)}
                     onBlur={() => setIsEditingName(false)}
                     onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                     autoFocus
                     className="text-sm font-semibold text-gray-900 border-b-2 border-blue-500 outline-none px-1 py-0.5"
                  />
               ) : (
                  <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setIsEditingName(true)}>
                     <span className="text-sm font-semibold text-gray-900">{projectName}</span>
                     <Edit2 className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
               )}
            </div>

            <div className="flex items-center space-x-4">
               {/* CHECKPOINT HISTORY BUTTON */}
               <div className="relative">
                   <button 
                      onClick={() => setShowHistoryMenu(!showHistoryMenu)}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${history.length > 0 ? 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-100' : 'text-gray-300 cursor-not-allowed'}`}
                      disabled={history.length === 0}
                      title="Restore previous version"
                   >
                      <History className="w-3.5 h-3.5" />
                      <span>Restore</span>
                   </button>
                   
                   {showHistoryMenu && (
                       <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 overflow-hidden">
                           <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                               <span className="text-xs font-bold text-gray-500 uppercase">Version History</span>
                               <button onClick={() => setShowHistoryMenu(false)}><X className="w-3 h-3 text-gray-400" /></button>
                           </div>
                           <div className="max-h-64 overflow-y-auto">
                               {history.map((ckpt) => (
                                   <button
                                      key={ckpt.id}
                                      onClick={() => restoreCheckpoint(ckpt)}
                                      className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-50 flex items-start space-x-3 group transition-colors"
                                   >
                                      <div className="mt-1">
                                          <RotateCcw className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600" />
                                      </div>
                                      <div className="flex flex-col flex-1">
                                          <span className="text-xs font-medium text-gray-800 group-hover:text-blue-700 line-clamp-2">{ckpt.label}</span>
                                          <span className="text-[10px] text-gray-400 mt-1">{ckpt.timestamp.toLocaleTimeString()}</span>
                                      </div>
                                   </button>
                               ))}
                           </div>
                       </div>
                   )}
               </div>

               <div className="h-5 w-px bg-gray-200" />

               <div className="flex bg-gray-100 p-1 rounded-lg">
                  <button 
                     onClick={() => setActiveTab('code')}
                     className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'code' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                     <Code className="w-3.5 h-3.5" />
                     <span>Code</span>
                  </button>
                  <button 
                     onClick={() => setActiveTab('preview')}
                     className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'preview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                     <Eye className="w-3.5 h-3.5" />
                     <span>Preview</span>
                  </button>
               </div>

               <div className="h-5 w-px bg-gray-200" />

               <div className="flex items-center space-x-2">
                  <button onClick={handleDownloadZip} className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors" title="Download Source Code (ZIP)">
                     <Download className="w-4 h-4" />
                  </button>
                  <button onClick={() => setShowGithubModal(true)} className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors" title="Sync to GitHub">
                     <Github className="w-4 h-4" />
                  </button>
                  <button onClick={() => setPublishedUrl('https://demo-app.locaith.app')} className="flex items-center space-x-2 px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors text-xs font-medium">
                     <Upload className="w-3.5 h-3.5" />
                     <span>Publish</span>
                  </button>
               </div>
            </div>
         </div>

         <div className="flex-1 relative overflow-hidden">
            
            {/* CODE VIEW */}
            <div className={`absolute inset-0 flex ${activeTab === 'code' ? 'z-10' : 'z-0 opacity-0 pointer-events-none'}`}>
               <div className="w-56 border-r border-gray-200 bg-gray-50 flex flex-col">
                  <div className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                     <Layers className="w-3.5 h-3.5" />
                     Files
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                     {(Object.values(files) as ProjectFile[]).map((file) => (
                        <div 
                           key={file.name}
                           onClick={() => setActiveFile(file.name)}
                           className={`
                              flex items-center space-x-2 px-2 py-1.5 rounded-md cursor-pointer text-xs transition-colors
                              ${activeFile === file.name ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-200'}
                           `}
                        >
                           {file.name.endsWith('json') ? <File className="w-3.5 h-3.5 text-yellow-600" /> : <File className="w-3.5 h-3.5 text-blue-500" />}
                           <span className="truncate">{file.name}</span>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="flex-1 bg-white flex flex-col overflow-hidden">
                  {activeFile ? (
                     <>
                        <div className="h-8 border-b border-gray-100 flex items-center px-4 text-xs text-gray-500 bg-white flex-shrink-0">
                           {activeFile}
                        </div>
                        <div className="flex-1 overflow-auto relative">
                           <pre className="m-0 p-4 min-h-full text-sm">
                              <code 
                                ref={codeRef}
                                key={activeFile + files[activeFile]?.content?.length} 
                                className={`language-${files[activeFile]?.language === 'typescript' ? 'tsx' : files[activeFile]?.language}`}
                              >
                                 {files[activeFile]?.content || ''}
                              </code>
                           </pre>
                        </div>
                     </>
                  ) : (
                     <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                        Select a file to view code
                     </div>
                  )}
               </div>
            </div>

            {/* PREVIEW VIEW */}
            <div className={`absolute inset-0 bg-gray-100 flex flex-col ${activeTab === 'preview' ? 'z-10' : 'z-0 opacity-0 pointer-events-none'}`}>
               <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-sm">
                  <div className="flex items-center space-x-2 bg-gray-100 rounded-md px-3 py-1 text-xs text-gray-500 w-full max-w-md">
                     <Globe className="w-3 h-3" />
                     <span className="truncate">localhost:3000/preview</span>
                  </div>
                  <button onClick={() => setPreviewKey(k => k + 1)} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors">
                     <RefreshCw className="w-4 h-4 text-gray-500" />
                  </button>
               </div>
               <div className="flex-1 p-4 overflow-hidden">
                  <div className="w-full h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                     {Object.keys(files).length > 0 ? (
                        <iframe 
                           key={previewKey}
                           ref={iframeRef}
                           srcDoc={generatePreviewHtml()}
                           title="Preview"
                           className="w-full h-full border-none"
                           sandbox="allow-scripts allow-modals allow-same-origin"
                        />
                     ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                           <Loader2 className="w-8 h-8 animate-spin mb-2" />
                           <span className="text-sm">Building your app...</span>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </div>

      </div>

      {/* GitHub Modal */}
      {showGithubModal && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-96 shadow-2xl animate-in fade-in zoom-in-95 overflow-hidden">
               <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <div className="flex items-center space-x-2">
                     <Github className="w-5 h-5 text-gray-900" />
                     <h3 className="text-sm font-bold text-gray-900">GitHub Sync</h3>
                  </div>
                  <button onClick={() => setShowGithubModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
               </div>
               <div className="p-6">
                  {(githubStep === 'token' || githubStep === 'verifying') && (
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Key className="w-6 h-6 text-gray-500" />
                      </div>
                      <h4 className="text-lg font-semibold mb-2">Enter Access Token</h4>
                      <p className="text-xs text-gray-500 mb-4 text-left w-full leading-relaxed">
                        Generate a <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium">Personal Access Token (Classic)</a> with <b>repo</b> scope and paste it here.
                      </p>
                      <input 
                         type="password" 
                         value={githubToken}
                         onChange={(e) => setGithubToken(e.target.value)}
                         placeholder="ghp_xxxxxxxxxxxx"
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none mb-2"
                      />
                      {githubError && <p className="text-xs text-red-500 mb-2 text-left w-full">{githubError}</p>}
                      <button 
                        onClick={handleGithubVerify}
                        disabled={githubToken.length < 10 || githubStep === 'verifying'}
                        className="w-full py-2.5 bg-[#24292e] text-white rounded-lg font-medium hover:bg-black transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                      >
                        {githubStep === 'verifying' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Github className="w-4 h-4" />}
                        <span>{githubStep === 'verifying' ? 'Verifying...' : 'Verify & Connect'}</span>
                      </button>
                    </div>
                  )}
                  {githubStep === 'config' && githubUser && (
                    <div className="flex flex-col">
                       <div className="flex items-center space-x-3 mb-6 p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <img src={githubUser.avatar_url} alt="avatar" className="w-10 h-10 rounded-full border border-gray-200" />
                          <div className="flex flex-col flex-1 min-w-0">
                             <span className="text-sm font-semibold text-gray-900 truncate">{githubUser.name}</span>
                             <span className="text-xs text-gray-500 truncate">@{githubUser.login}</span>
                          </div>
                          <button onClick={() => setGithubStep('token')} className="text-xs text-blue-600 hover:underline">Change</button>
                       </div>
                       <div className="space-y-4">
                          <div>
                             <label className="block text-xs font-medium text-gray-700 mb-1">Repository Name</label>
                             <input 
                               type="text" 
                               value={repoName}
                               onChange={(e) => setRepoName(e.target.value)}
                               className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                             />
                          </div>
                          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50" onClick={() => setIsPrivateRepo(!isPrivateRepo)}>
                             <div className="flex items-center space-x-2">
                                {isPrivateRepo ? <Lock className="w-4 h-4 text-orange-500" /> : <Globe className="w-4 h-4 text-green-500" />}
                                <span className="text-sm font-medium text-gray-700">{isPrivateRepo ? 'Private Repository' : 'Public Repository'}</span>
                             </div>
                             <div className={`w-8 h-4 rounded-full relative transition-colors ${isPrivateRepo ? 'bg-blue-600' : 'bg-gray-300'}`}>
                                <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${isPrivateRepo ? 'translate-x-4' : 'translate-x-0'}`} />
                             </div>
                          </div>
                          <button 
                            onClick={handleGithubPush}
                            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all flex items-center justify-center space-x-2 mt-2"
                          >
                            <GitBranch className="w-4 h-4" />
                            <span>Create & Push</span>
                          </button>
                       </div>
                    </div>
                  )}
                  {githubStep === 'pushing' && (
                     <div className="flex flex-col items-center text-center py-4">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                        <h4 className="text-sm font-medium text-gray-900">Pushing code...</h4>
                        <p className="text-xs text-gray-500 mt-1">Creating repository {githubUser?.login}/{repoName}</p>
                     </div>
                  )}
                  {githubStep === 'success' && (
                     <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                           <Check className="w-6 h-6 text-green-600" />
                        </div>
                        <h4 className="text-lg font-semibold mb-2">Successfully Deployed!</h4>
                        <p className="text-sm text-gray-500 mb-6">Your project is now live on GitHub.</p>
                        <a 
                          href={`https://github.com/${githubUser?.login}/${repoName}`} 
                          target="_blank"
                          rel="noreferrer"
                          className="w-full py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-black transition-all flex items-center justify-center space-x-2 mb-3"
                        >
                           <Github className="w-4 h-4" />
                           <span>Open Repository</span>
                        </a>
                        <button onClick={() => setShowGithubModal(false)} className="text-sm text-gray-500 hover:text-gray-800">Close</button>
                     </div>
                  )}
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default WebsiteBuilder;
