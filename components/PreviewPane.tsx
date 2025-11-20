import React, { useEffect, useRef, useState } from 'react';
import { TabOption } from '../types';

interface PreviewPaneProps {
  code: string;
  activeTab: TabOption;
  onTabChange: (tab: TabOption) => void;
}

declare global {
  interface Window {
    Prism: any;
  }
}

export const PreviewPane: React.FC<PreviewPaneProps> = ({ code, activeTab, onTabChange }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update iframe content when code changes
  useEffect(() => {
    if (iframeRef.current && activeTab === TabOption.PREVIEW) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        try {
            if (!code || code.trim().length < 10) {
                // Show a "waiting" state instead of white screen if code is empty
                doc.open();
                doc.write(`
                    <html style="height: 100%;">
                        <body style="background-color: #0a0a0a; color: #666; display: flex; align-items: center; justify-content: center; height: 100%; margin: 0; font-family: sans-serif;">
                            <div style="text-align: center;">
                                <div style="margin-bottom: 10px; font-size: 24px; opacity: 0.3;">Waiting for code generation...</div>
                            </div>
                        </body>
                    </html>
                `);
                doc.close();
                setError(null);
                return;
            }

            doc.open();
            // Inject a small script to catch runtime errors inside the iframe
            const errorScript = `
                <script>
                    window.onerror = function(message, source, lineno, colno, error) {
                        document.body.innerHTML = '<div style="padding: 20px; color: #ef4444; font-family: monospace; background: #1a1a1a; height: 100vh;"><h3>Preview Runtime Error</h3><p>' + message + '</p></div>';
                    };
                </script>
            `;
            doc.write(code + errorScript);
            doc.close();
            setError(null);
        } catch (err: any) {
            console.error("Preview render error:", err);
            setError("Failed to render preview. The code might be incomplete.");
            
            // Attempt to render an error message in the iframe
            try {
                doc.open();
                doc.write(`<div style="color: red; padding: 20px;">Failed to render: ${err.message}</div>`);
                doc.close();
            } catch(e) { /* ignore */ }
        }
      }
    }
  }, [code, activeTab]);

  // Handle Syntax Highlighting
  useEffect(() => {
    if (activeTab === TabOption.CODE && codeRef.current && window.Prism) {
        window.Prism.highlightElement(codeRef.current);
    }
  }, [code, activeTab]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-dark-900 md:rounded-xl border border-dark-700 overflow-hidden shadow-2xl">
      {/* Header / Tabs */}
      <div className="flex items-center justify-between px-4 py-2 bg-dark-800 border-b border-dark-700 flex-wrap gap-2">
        <div className="flex flex-wrap gap-1 bg-dark-700 p-1 rounded-lg">
          <button
            onClick={() => onTabChange(TabOption.PREVIEW)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === TabOption.PREVIEW
                ? 'bg-dark-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-dark-600/50'
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => onTabChange(TabOption.CODE)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === TabOption.CODE
                ? 'bg-dark-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-dark-600/50'
            }`}
          >
            Code
          </button>
        </div>
        
        <div className="flex items-center gap-3">
            {activeTab === TabOption.CODE && (
                <button 
                    onClick={handleCopy}
                    className="text-xs flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
                >
                    {copied ? (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            <span className="text-green-500">Copied!</span>
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            <span>Copy</span>
                        </>
                    )}
                </button>
            )}
            <div className="hidden md:flex text-xs text-gray-500 items-center gap-2 border-l border-dark-600 pl-3">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Live Environment
            </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative bg-white">
        {/* Preview Iframe */}
        <div className={`absolute inset-0 w-full h-full ${activeTab === TabOption.PREVIEW ? 'z-10 opacity-100' : 'z-0 opacity-0 pointer-events-none'}`}>
            {error && (
                <div className="absolute inset-0 z-20 bg-dark-900/90 flex items-center justify-center">
                    <div className="text-red-400 bg-dark-800 p-4 rounded border border-red-900/50 max-w-md text-center">
                        <svg className="w-8 h-8 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        <p>{error}</p>
                    </div>
                </div>
            )}
            <iframe
                ref={iframeRef}
                title="Preview"
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-forms"
            />
        </div>

        {/* Code View */}
        <div className={`absolute inset-0 w-full h-full bg-[#2d2d2d] overflow-auto ${activeTab === TabOption.CODE ? 'z-10 opacity-100' : 'z-0 opacity-0 pointer-events-none'}`}>
          <pre className="p-4 m-0 text-xs md:text-sm font-mono text-gray-300 min-h-full">
            <code ref={codeRef} className="language-jsx">{code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};