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
import { Image, Mic, Square, ArrowUp, X } from "lucide-react";
import { useLayoutContext } from "../src/context/LayoutContext";

interface ChatInputProps {
  onSend: (message: string, images?: string[]) => void;
  onStop?: () => void;
  isLoading: boolean;
  placeholder?: string;
  isLandingPage?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, onStop, isLoading, placeholder, isLandingPage }) => {
  const [input, setInput] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showToast, setShowToast] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setIsCollapsed } = useLayoutContext();

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleSend = () => {
    if ((input.trim() || selectedImages.length > 0) && !isLoading) {
      onSend(input, selectedImages.length > 0 ? selectedImages : undefined);
      setInput('');
      setSelectedImages([]);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Limit total images to 5
      if (selectedImages.length + files.length > 5) {
        setShowToast(true);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      const newImages: string[] = [];
      let processedCount = 0;

      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            newImages.push(reader.result as string);
          }
          processedCount++;
          if (processedCount === files.length) {
            setSelectedImages(prev => [...prev, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
    // Reset input value to allow selecting same files again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    const newImages: string[] = [];
    let hasImage = false;
    let imageCount = 0;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        imageCount++;
        if (selectedImages.length + imageCount > 5) {
          setShowToast(true);
          e.preventDefault();
          return;
        }

        hasImage = true;
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (reader.result) {
              setSelectedImages(prev => [...prev, reader.result as string]);
            }
          };
          reader.readAsDataURL(blob);
        }
      }
    }
    if (hasImage) e.preventDefault();
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
        
        {/* Toast Notification */}
        {showToast && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg text-xs font-medium animate-fade-in-up z-50 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            Bạn chỉ có thể tải lên tối đa 5 ảnh
          </div>
        )}

        {/* Image Preview */}
        {selectedImages.length > 0 && (
          <div className="px-4 pt-4 pb-0 flex gap-2 overflow-x-auto scrollbar-hide">
            {selectedImages.map((img, idx) => (
              <div key={idx} className="relative inline-block flex-shrink-0">
                <img src={img} alt={`Preview ${idx}`} className="h-20 w-auto rounded-lg border border-gray-200 object-cover" />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute -top-2 -right-2 bg-gray-900 text-white rounded-full p-1 hover:bg-gray-700 transition-colors shadow-md"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <Label htmlFor="chat-input" className="sr-only">Chat Input</Label>
        <Textarea
          id="chat-input"
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onPaste={handlePaste}
          placeholder={placeholder || "Mô tả website bạn muốn xây dựng..."}
          className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-base resize-none border-none shadow-none ring-0 outline-none focus-visible:ring-0 focus-visible:ring-offset-0 max-h-64 py-4 px-5 min-h-[3.5rem]"
          style={{ border: 'none', boxShadow: 'none', outline: 'none' }}
          rows={1}
          disabled={isLoading && !onStop}
        />

        {/* Input Actions Toolbar */}
        <div className="flex justify-between items-center px-3 pb-3 pt-0">
          <div className="flex items-center gap-2">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              multiple
              className="hidden"
            />
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
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
                  disabled={(!input.trim() && selectedImages.length === 0 && !isLoading)}
                  size="icon"
                  className={cn(
                    "h-9 w-9 transition-all duration-200 rounded-full flex items-center justify-center",
                    (input.trim() || selectedImages.length > 0 || isLoading)
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
