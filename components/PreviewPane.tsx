import React, { useEffect, useRef, useState } from 'react';
import { TabOption } from '../types';
import { vi } from '../src/locales/vi';
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check, Copy, Code, Eye, AlertTriangle } from "lucide-react";
import { CodeCarousel } from './CodeCarousel';

interface PreviewPaneProps {
  code: string;
  activeTab: TabOption;
  onTabChange: (tab: TabOption) => void;
  showHeader?: boolean;
}

declare global {
  interface Window {
    Prism: any;
  }
}

export const PreviewPane: React.FC<PreviewPaneProps> = ({ code, activeTab, onTabChange, showHeader = true }) => {
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
          // Only write to iframe if we have valid code
          if (!code || code.trim().length < 10) {
             return;
          }

          doc.open();
          
          // Script to suppress warnings
          const suppressionScript = `
            <script>
                (function() {
                    const originalWarn = console.warn;
                    console.warn = function(...args) {
                        const msg = args[0];
                        if (typeof msg === 'string' && (
                            msg.includes('cdn.tailwindcss.com') || 
                            msg.includes('babel-standalone') ||
                            msg.includes('in-browser Babel transformer') ||
                            msg.includes('dampingFactor')
                        )) {
                            return;
                        }
                        originalWarn.apply(console, args);
                    };
                })();
            </script>
          `;

          // Script to catch runtime errors
          const errorScript = `
            <script>
                window.onerror = function(message, source, lineno, colno, error) {
                    const errorMsg = message || "Unknown Runtime Error";
                    document.body.innerHTML = '<div style="padding: 20px; color: #ef4444; font-family: monospace; background: #1a1a1a; height: 100vh;"><h3>Preview Runtime Error</h3><p>' + errorMsg + '</p></div>';
                    window.parent.postMessage({ type: 'PREVIEW_ERROR', message: errorMsg }, '*');
                };
            </script>
          `;

          // Remove CDN links if they exist in the code
          let finalCode = code.replace(/<script\s+src=["']https:\/\/cdn\.tailwindcss\.com["']><\/script>/g, '');

          // Insert suppression script at the beginning of head (or body if no head)
          if (finalCode.includes('<head>')) {
            finalCode = finalCode.replace('<head>', '<head>' + suppressionScript);
          } else if (finalCode.includes('<html>')) {
             finalCode = finalCode.replace('<html>', '<html><head>' + suppressionScript + '</head>');
          } else {
             finalCode = suppressionScript + finalCode;
          }

          // Append error handling script
          finalCode += errorScript;

          doc.write(finalCode);
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
          } catch (e) { /* ignore */ }
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
    <div className="flex flex-col h-full bg-white md:rounded-xl overflow-hidden">
      {/* Header / Tabs */}
      {showHeader && (
      <div className="hidden md:flex items-center justify-between px-4 py-2 neu-bg flex-wrap gap-2">
        <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as TabOption)} className="w-auto">
          <TabsList className="bg-transparent p-0 gap-2">
            <TabsTrigger 
              value={TabOption.PREVIEW} 
              className="h-8 px-4 rounded-full text-xs font-medium data-[state=active]:neu-pressed data-[state=active]:text-[#3b82f6] text-gray-500 hover:text-gray-700 bg-transparent shadow-none"
            >
              <Eye className="w-3 h-3 mr-2" />
              {vi.ui.preview}
            </TabsTrigger>
            <TabsTrigger 
              value={TabOption.CODE} 
              className="h-8 px-4 rounded-full text-xs font-medium data-[state=active]:neu-pressed data-[state=active]:text-[#3b82f6] text-gray-500 hover:text-gray-700 bg-transparent shadow-none"
            >
              <Code className="w-3 h-3 mr-2" />
              Code
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-3">
          {activeTab === TabOption.CODE && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 text-xs flex items-center gap-1.5 text-gray-500 hover:text-[#3b82f6] transition-colors hover:bg-transparent"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-green-500" />
                  <span className="text-green-500">{vi.deployment.copied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>{vi.deployment.copyButton}</span>
                </>
              )}
            </Button>
          )}
          <div className="hidden md:flex items-center border-l border-gray-300 pl-3">
            <Badge variant="outline" className="bg-transparent border-0 text-gray-500 font-normal gap-2 hover:bg-transparent px-0">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Live Environment
            </Badge>
          </div>
        </div>
      </div>
      )}

      {/* Content Area */}
      <div className="flex-1 relative bg-white">
        {/* Preview Iframe */}
        <div className={cn("absolute inset-0 w-full h-full", activeTab === TabOption.PREVIEW ? 'z-10 opacity-100' : 'z-0 opacity-0 pointer-events-none')}>
          {(!code || code.trim().length < 10) ? (
            <CodeCarousel />
          ) : (
            <>
              {error && (
                <div className="absolute inset-0 z-20 bg-dark-900/90 flex items-center justify-center">
                  <div className="text-red-400 bg-dark-800 p-4 rounded border border-red-900/50 max-w-md text-center">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
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
            </>
          )}
        </div>

        {/* Code View */}
        <div className={cn("absolute inset-0 w-full h-full bg-[#2d2d2d]", activeTab === TabOption.CODE ? 'z-10 opacity-100' : 'z-0 opacity-0 pointer-events-none')}>
          <ScrollArea className="h-full w-full">
            <pre className="p-4 m-0 text-xs md:text-sm font-mono text-gray-300 min-h-full">
              <code ref={codeRef} className="language-jsx">{code}</code>
            </pre>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};