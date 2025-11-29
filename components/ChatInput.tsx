import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSend: (message: string, images?: string[]) => void;
  onStop?: () => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, onStop, isLoading }) => {
  const [input, setInput] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showToast, setShowToast] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="relative flex flex-col bg-white/90 border border-gray-200 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-brand-500 transition-all">
        {/* Toast Notification */}
        {showToast && (
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg text-xs font-medium animate-fade-in-up z-50 flex items-center gap-2">
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            ))}
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="Describe the website you want to build..."
          className="w-full bg-transparent text-gray-900 placeholder-gray-400 text-sm resize-none focus:outline-none max-h-48 py-3 px-4 scrollbar-hide"
          rows={1}
          // Allow typing while loading, but disable if loading and no onStop
          disabled={isLoading && !onStop}
        />

        {/* Input Actions Toolbar */}
        <div className="flex justify-between items-center px-2 pb-2 mt-1">
          <div className="flex items-center gap-1 ml-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              multiple
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`p-2 rounded-lg transition-colors ${selectedImages.length > 0 ? 'text-brand-600 bg-brand-50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
              title="Upload Image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            </button>
            <button
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Voice Input (Simulated)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
            </button>
          </div>

          <button
            onClick={isLoading ? handleStop : handleSend}
            disabled={(!input.trim() && selectedImages.length === 0 && !isLoading)}
            className={`p-2 rounded-xl flex-shrink-0 transition-colors ${(input.trim() || selectedImages.length > 0 || isLoading)
                ? 'bg-brand-600 text-white hover:bg-brand-500 shadow-md'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            title={isLoading ? "Stop Generation" : "Send"}
          >
            {isLoading ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <rect x="6" y="6" width="12" height="12" rx="2" ry="2"></rect>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};