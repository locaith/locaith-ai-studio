import React, { useRef, useEffect, useState } from 'react';
import { Message } from '../types';
import { vi } from '../src/locales/vi';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Download, Wrench, ArrowDown, Bot, User } from "lucide-react";

interface SidebarProps {
  messages: Message[];
  onAction?: (action: any) => void;
}

// Helper to parse logs from the message content
const parseBuildSteps = (content: string) => {
  const lines = content.split('\n');
  const steps: string[] = [];
  let otherContent = '';

  lines.forEach(line => {
    if (line.trim().startsWith('[BUILD]')) {
      steps.push(line.replace('[BUILD]', '').trim());
    } else if (!line.trim().startsWith('<!DOCTYPE html>')) {
      // Keep reasoning text that isn't code or build logs
      otherContent += line + '\n';
    }
  });

  return { steps, otherContent };
};

const BuildStepsRenderer = ({ steps, isStreaming }: { steps: string[], isStreaming: boolean }) => {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (!isStreaming) {
        setVisibleCount(steps.length);
        return;
    }
    if (visibleCount < steps.length) {
      const timeout = setTimeout(() => {
        setVisibleCount(prev => prev + 1);
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [steps.length, visibleCount, isStreaming]);

  return (
    <div className="space-y-2 my-2 font-mono text-xs">
      {steps.slice(0, visibleCount).map((step, idx) => {
        const isActive = (idx === visibleCount - 1) && isStreaming;
        return (
           <div key={idx} className="flex items-center gap-2 animate-fade-in-up">
             {isActive ? (
               <span className="w-4 h-4 flex items-center justify-center">
                 <span className="w-2 h-2 bg-brand-500 rounded-full animate-ping"></span>
               </span>
             ) : (
               <span className="text-green-600 w-4 h-4 flex items-center justify-center">✓</span>
             )}
             <span className={isActive ? 'text-brand-600' : 'text-gray-700'}>
               {step}
             </span>
           </div>
        );
      })}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ messages, onAction }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const threshold = 50;
    const atBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - threshold;
    setIsAtBottom(atBottom);
    if (atBottom) setHasNewMessage(false);
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    
    if (isAtBottom) {
      viewport.scrollTop = viewport.scrollHeight;
    } else {
      setHasNewMessage(true);
    }
  }, [messages, isAtBottom]);

  const scrollToLatest = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    
    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: 'smooth'
    });
    setIsAtBottom(true);
    setHasNewMessage(false);
  };

  return (
    <div className="flex flex-col h-full relative">
      <ScrollArea 
        className="flex-1 p-4" 
        onViewportScroll={handleScroll}
        viewportRef={viewportRef}
        ref={scrollRef}
      >
        {/* Content inside ScrollArea Viewport */}
        <div className="space-y-6 pb-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center opacity-60 mt-10">
              <div className="w-16 h-16 neu-flat flex items-center justify-center mb-4 text-[#3b82f6]">
                <Bot className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium text-gray-700">{vi.sidebar.emptyTitle}</h3>
              <p className="text-sm text-gray-500 max-w-xs mt-2">
                {vi.sidebar.emptyDescription}
              </p>
            </div>
          )}

          {messages.map((msg) => {
            const isAssistant = msg.role === 'assistant';
            const { steps, otherContent } = isAssistant ? parseBuildSteps(msg.content) : { steps: [], otherContent: msg.content };

            return (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col gap-1",
                  msg.role === 'user' ? 'items-end' : 'items-start'
                )}
              >
                 <div className="flex items-end gap-2 max-w-[95%]">
                    {isAssistant && (
                       <Avatar className="h-8 w-8 mb-1 hidden sm:block neu-flat p-1">
                          <AvatarFallback className="bg-transparent text-[#3b82f6] text-xs font-bold">AI</AvatarFallback>
                       </Avatar>
                    )}
                    
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                        msg.role === 'user'
                          ? 'bg-[#3b82f6] text-white rounded-br-none shadow-md'
                          : 'neu-flat text-gray-700 rounded-bl-none w-full'
                      )}
                    >
                      {/* Thinking/Reasoning Text */}
                      {isAssistant && otherContent.trim() && (
                        <div className="mb-3 text-gray-500 italic text-xs border-l-2 border-gray-300 pl-2">
                          {otherContent.split('\n').slice(0, 3).join('\n')}
                          {otherContent.split('\n').length > 3 && '...'}
                        </div>
                      )}

                      {/* Build Steps Visualization */}
                      {isAssistant && steps.length > 0 && (
                        <BuildStepsRenderer steps={steps} isStreaming={msg.isStreaming || false} />
                      )}

                      {/* User Message */}
                      {!isAssistant && msg.content}

                      {/* Loading Indicator for empty Assistant message */}
                      {isAssistant && msg.content === '' && (
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                        </span>
                      )}

                      {/* Action Button */}
                      {msg.action && (
                        <div className="mt-3 pt-3 border-t border-gray-200/50">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onAction && onAction(msg.action)}
                            className={cn(
                              "w-full gap-2 text-xs font-bold neu-btn h-8",
                               msg.action.type === 'download' ? 'text-[#3b82f6]' : 'text-red-500'
                            )}
                          >
                            {msg.action.type === 'download' ? (
                              <Download className="w-3 h-3" />
                            ) : (
                              <Wrench className="w-3 h-3" />
                            )}
                            {msg.action.label}
                          </Button>
                        </div>
                      )}
                    </div>
                 </div>
                
                <span className="text-[10px] text-gray-400 mt-1 px-1 uppercase tracking-wider font-medium self-end sm:self-auto sm:ml-10">
                  {msg.role === 'assistant' ? vi.sidebar.ai : vi.sidebar.you}
                </span>
              </div>
            );
          })}
          {/* Invisible element to scroll to */}
          <div className="h-1" /> 
        </div>
      </ScrollArea>
      
      {/* We handle scrolling programmatically via ref to the inner div now, 
          but ScrollArea component wraps content. 
          Actually, let's revert to native div for the scrolling container to ensure behavior consistency 
          with the previous implementation, but keep using shadcn/ui components inside.
          The ScrollArea component is great but custom scroll logic with "stick to bottom" can be tricky 
          without direct access to the viewport ref.
      */}
    </div>
  );
};
