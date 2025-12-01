import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, MessageCircle, AlertCircle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { LOCAITH_SYSTEM_PROMPT } from '../services/geminiService';

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Chat instruction combining the persona and the formal system prompt
const LOCAITH_CHAT_INSTRUCTION = `
Bạn là Locaith, trợ lý AI thông minh. Trả lời ngắn gọn, hữu ích bằng tiếng Việt. 
Hỗ trợ tra cứu, giải đáp thắc mắc và tuân thủ nghiêm ngặt các quy chuẩn sau.

### CORE SYSTEM COMPLIANCE (LOCAITH GLOBAL STANDARD)
${LOCAITH_SYSTEM_PROMPT}
`;

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  isError?: boolean;
}

export const DirectChatFeature = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      content: 'Xin chào! Tôi là Locaith, trợ lý AI của bạn. Tôi có thể giúp gì cho bạn hôm nay?',
      timestamp: Date.now()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize chat session
  useEffect(() => {
    const initChat = async () => {
      try {
        chatSessionRef.current = ai.chats.create({
          model: 'gemini-2.0-flash-exp',
          config: {
            systemInstruction: LOCAITH_CHAT_INSTRUCTION,
            temperature: 0.7,
          }
        });
      } catch (err) {
        console.error("Failed to initialize chat session:", err);
        setError("Không thể khởi tạo phiên chat. Vui lòng kiểm tra kết nối hoặc API Key.");
      }
    };

    initChat();
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      if (!chatSessionRef.current) {
        throw new Error("Chat session not initialized");
      }

      // Send message to Gemini
      const result = await chatSessionRef.current.sendMessage({ 
        message: userMessage.content 
      });
      
      // Handle response (using property access as per SDK v1.30.0+)
      const responseText = result.text || "Không có phản hồi từ AI.";

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseText,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (err: any) {
      console.error("Chat error:", err);
      
      // Detailed error handling
      let errorMessage = "Đã xảy ra lỗi khi xử lý yêu cầu.";
      if (err.message?.includes('404')) {
        errorMessage = "Lỗi: Model không tìm thấy (404). Vui lòng kiểm tra tên model.";
      } else if (err.message) {
        errorMessage = `Lỗi: ${err.message}`;
      }

      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: errorMessage,
        timestamp: Date.now(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-transparent text-foreground animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <div className="p-2 rounded-xl neu-flat mr-3 text-brand-600">
          <MessageCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Locaith AI Assistant</h2>
          <p className="text-xs text-muted-foreground font-medium">Powered by Gemini 2.0 Flash</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                msg.role === 'user' ? 'neu-pressed bg-brand-50 text-brand-600' : 'neu-flat bg-background text-foreground'
              }`}>
                {msg.role === 'user' ? <User size={16} /> : <img src="/logo-locaith.png" alt="AI" className="w-5 h-5" />}
              </div>

              {/* Message Bubble */}
              <div className={`p-4 rounded-2xl shadow-sm ${
                msg.role === 'user' 
                  ? 'neu-flat bg-background text-foreground rounded-tr-none border border-border' 
                  : msg.isError 
                    ? 'bg-red-50 text-red-600 border border-red-100 rounded-tl-none'
                    : 'neu-bg text-foreground rounded-tl-none border border-border'
              }`}>
                <div className="whitespace-pre-wrap text-sm md:text-base leading-relaxed font-medium">
                  {msg.content}
                </div>
                <span className="text-[10px] text-muted-foreground mt-2 block font-medium">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-3 ml-11">
              <div className="p-2 neu-flat rounded-full">
                  <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
              </div>
              <span className="text-xs text-muted-foreground font-medium animate-pulse">Locaith đang suy nghĩ...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-background/80 backdrop-blur-md">
        {error && (
            <div className="mb-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
                <AlertCircle size={16} />
                {error}
            </div>
        )}
        <div className="neu-bg p-1.5 rounded-2xl border border-border flex items-end gap-2 relative transition-shadow hover:shadow-md">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tin nhắn..."
            className="flex-1 bg-transparent border-none outline-none p-3 min-h-[44px] max-h-[150px] resize-none text-foreground placeholder:text-muted-foreground text-sm md:text-base font-medium rounded-xl focus:neu-pressed transition-all"
            rows={1}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className={`p-2.5 mb-0.5 mr-0.5 rounded-xl transition-all duration-200 flex items-center justify-center ${
                inputValue.trim() && !isLoading
                    ? 'neu-flat text-brand-600 hover:neu-pressed hover:scale-105 active:scale-95'
                    : 'bg-muted/20 text-muted-foreground cursor-not-allowed'
            }`}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
        <div className="text-center mt-3">
           <span className="text-[10px] text-muted-foreground font-medium">Locaith AI tuân thủ bộ quy tắc chuẩn mực toàn cầu.</span>
        </div>
      </div>
    </div>
  );
};
