import React, { useRef, useEffect, useState } from 'react';
import { Message } from '../types';
import { vi } from '../src/locales/vi';

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

export const Sidebar: React.FC<SidebarProps> = ({ messages, onAction }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const threshold = 50;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - threshold;
    setIsAtBottom(atBottom);
    if (atBottom) setHasNewMessage(false);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (isAtBottom) {
      el.scrollTop = el.scrollHeight;
    } else {
      setHasNewMessage(true);
    }
  }, [messages, isAtBottom]);

  const scrollToLatest = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    setIsAtBottom(true);
    setHasNewMessage(false);
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef} onScroll={handleScroll}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-60 mt-10">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 border border-gray-200 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">{vi.sidebar.emptyTitle}</h3>
            <p className="text-sm text-gray-600 max-w-xs mt-2">
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
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
            >
              <div
                className={`max-w-[95%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user'
                  ? 'bg-brand-600 text-white rounded-br-none shadow-sm'
                  : 'bg-white/90 text-gray-900 border border-gray-200 rounded-bl-none w-full shadow-sm'
                  }`}
              >
                {/* Thinking/Reasoning Text */}
                {isAssistant && otherContent.trim() && (
                  <div className="mb-3 text-gray-500 italic text-xs border-l-2 border-gray-200 pl-2">
                    {otherContent.split('\n').slice(0, 3).join('\n')}
                    {otherContent.split('\n').length > 3 && '...'}
                  </div>
                )}

                {/* Build Steps Visualization */}
                {isAssistant && steps.length > 0 && (
                  <div className="space-y-2 my-2 font-mono text-xs">
                    {steps.map((step, idx) => {
                      // If it's the last step and streaming, it's "active"
                      const isActive = msg.isStreaming && idx === steps.length - 1;
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
                      )
                    })}
                  </div>
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
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => onAction && onAction(msg.action)}
                      className={`w-full py-2 px-4 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 ${msg.action.type === 'download'
                        ? 'bg-brand-50 hover:bg-brand-100 text-brand-600'
                        : 'bg-red-50 hover:bg-red-100 text-red-600'
                        }`}
                    >
                      {msg.action.type === 'download' ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                      )}
                      {msg.action.label}
                    </button>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-gray-600 mt-1 px-1 uppercase tracking-wider font-medium">
                {msg.role === 'assistant' ? vi.sidebar.ai : vi.sidebar.you}
              </span>
            </div>
          );
        })}
      </div>
      {hasNewMessage && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <button
            onClick={scrollToLatest}
            className="px-3 py-1.5 bg-white/90 border border-gray-200 rounded-full text-xs text-gray-700 shadow-sm hover:bg-white"
          >
            {vi.sidebar.newMessages}
          </button>
        </div>
      )}
    </div>
  );
};
