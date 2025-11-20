import React, { useRef, useEffect, useState } from 'react';
import { Message } from '../types';

interface SidebarProps {
  messages: Message[];
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

export const Sidebar: React.FC<SidebarProps> = ({ messages }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-60 mt-10">
             <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 border border-gray-200 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
             </div>
             <h3 className="text-lg font-medium text-gray-900">Locaith Architect</h3>
             <p className="text-sm text-gray-600 max-w-xs mt-2">
               Ask me to build a Next.js-style React app. "A dashboard for analytics", "A social media feed", "A crypto landing page".
             </p>
          </div>
        )}

        {messages.map((msg) => {
           const isAssistant = msg.role === 'assistant';
           const { steps, otherContent } = isAssistant ? parseBuildSteps(msg.content) : { steps: [], otherContent: msg.content };
           
           return (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[95%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
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
              </div>
              <span className="text-[10px] text-gray-600 mt-1 px-1 uppercase tracking-wider font-medium">
                  {msg.role === 'assistant' ? 'Locaith AI' : 'You'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};