import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Image, Mic, Square, ArrowUp } from "lucide-react";
import { useLayoutContext } from "../src/context/LayoutContext";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  isLoading: boolean;
  placeholder?: string;
  isLandingPage?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, onStop, isLoading, placeholder, isLandingPage }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { setIsCollapsed } = useLayoutContext();

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSend(input);
      setInput('');
    }
  };

  const handleStop = () => {
    if (onStop) {
      onStop();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFocus = () => {
    if (!isLandingPage) {
       setIsCollapsed(true);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  return (
    <div className={cn("relative w-full mx-auto", isLandingPage ? "max-w-3xl" : "max-w-4xl")}>
      <div className="relative flex flex-col neu-pressed rounded-3xl transition-all duration-300 overflow-hidden p-1">
        <Label htmlFor="chat-input" className="sr-only">Chat Input</Label>
        <Textarea
          id="chat-input"
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder || "Mô tả website bạn muốn xây dựng..."}
          className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-base resize-none border-none shadow-none ring-0 outline-none focus-visible:ring-0 focus-visible:ring-offset-0 max-h-64 py-4 px-5 min-h-[3.5rem]"
          style={{ border: 'none', boxShadow: 'none', outline: 'none' }}
          rows={1}
          disabled={isLoading && !onStop}
        />

        {/* Input Actions Toolbar */}
        <div className="flex justify-between items-center px-3 pb-3 pt-0">
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-transparent rounded-full transition-colors"
                  >
                    <Image className="h-5 w-5" />
                    <span className="sr-only">Upload Image</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Tải ảnh lên</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-transparent rounded-full transition-colors"
                  >
                    <Mic className="h-5 w-5" />
                    <span className="sr-only">Voice Input</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Nhập bằng giọng nói</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={isLoading ? handleStop : handleSend}
                  disabled={(!input.trim() && !isLoading)}
                  size="icon"
                  className={cn(
                    "h-9 w-9 transition-all duration-200 rounded-full flex items-center justify-center",
                    (input.trim() || isLoading)
                      ? 'bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:scale-105 active:scale-95'
                      : 'neu-flat text-muted-foreground/50 cursor-not-allowed shadow-none'
                  )}
                >
                  {isLoading ? (
                    <Square className="h-4 w-4 fill-current" />
                  ) : (
                    <ArrowUp className="h-5 w-5" />
                  )}
                  <span className="sr-only">{isLoading ? "Dừng" : "Gửi"}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isLoading ? "Dừng tạo" : "Gửi yêu cầu"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};