import React, { useState, useRef, useEffect } from 'react';
import { Image, Send, Check, X, Code, Palette, FileText, Globe, Megaphone } from 'lucide-react';
import { generateAppPlan } from '../services/geminiService';
import { SuggestionChip, GenerationStatus, ViewState } from '../types';
import WebsiteBuilder from './WebsiteBuilder';

interface MainContentProps {
  currentView: ViewState;
  inputText: string;
  setInputText: (text: string) => void;
  autoTrigger: number;
  onUserInteraction: (description: string) => void;
}

const suggestions: SuggestionChip[] = [
  { id: '1', label: 'A modern SaaS landing page with pricing' },
  { id: '2', label: 'Interactive Kanban board with drag & drop' },
  { id: '3', label: 'Personal portfolio with dark mode' },
  { id: '4', label: 'E-commerce dashboard with charts' },
];

const MainContent: React.FC<MainContentProps> = ({ 
  currentView, 
  inputText, 
  setInputText, 
  autoTrigger,
  onUserInteraction 
}) => {
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [result, setResult] = useState<string | null>(null);
  const [showBuilder, setShowBuilder] = useState(false); // New state for switching to full builder
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputText]);

  // Handle Auto Trigger from AI
  useEffect(() => {
    if (autoTrigger > 0) {
      handleGenerate();
    }
  }, [autoTrigger]);

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    
    onUserInteraction(`User triggered generation for prompt: "${inputText.substring(0, 30)}..."`);

    // If we are in Builder mode, switch to the full WebsiteBuilder component immediately
    if (currentView === 'BUILDER') {
      setShowBuilder(true);
      return;
    }

    setStatus(GenerationStatus.LOADING);
    setResult(null);
    
    try {
      const plan = await generateAppPlan(inputText);
      setResult(plan);
      setStatus(GenerationStatus.SUCCESS);
    } catch (e) {
      setStatus(GenerationStatus.ERROR);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  // RENDER FULL BUILDER IF ACTIVE
  if (showBuilder && currentView === 'BUILDER') {
    return <WebsiteBuilder initialPrompt={inputText} onClose={() => setShowBuilder(false)} />;
  }

  const getHeaderContent = () => {
    switch (currentView) {
      case 'INTERIOR':
        return {
          title: 'Interior & Design',
          subtitle: 'AI-powered interior design generation and visualization.',
          icon: Palette,
          placeholder: 'Describe the room you want to design (e.g., Scandinavian living room)...',
          color: 'text-pink-600'
        };
      case 'COMPOSE':
        return {
          title: 'Smart Compose',
          subtitle: 'Draft Decree 30 compliant documents in seconds.',
          icon: FileText,
          placeholder: 'Describe the document you need to draft...',
          color: 'text-green-600'
        };
      case 'SEARCH':
        return {
          title: 'Deep Web Search',
          subtitle: 'Complex information retrieval and analysis.',
          icon: Globe,
          placeholder: 'What do you want to research today?',
          color: 'text-purple-600'
        };
      case 'MARKETING':
        return {
          title: 'Marketing Automation',
          subtitle: 'Generate viral content for Facebook, TikTok, and Zalo.',
          icon: Megaphone,
          placeholder: 'Describe your marketing campaign...',
          color: 'text-orange-600'
        };
      default:
        return {
          title: 'Locaith Code Assistant',
          subtitle: 'Describe your dream app, watch the AI code it step-by-step.',
          icon: Code,
          placeholder: 'Build a dashboard for a crypto app...',
          color: 'text-blue-600'
        };
    }
  };

  const header = getHeaderContent();
  const Icon = header.icon;

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-gray-50/50 relative flex flex-col" onClick={() => onUserInteraction("User clicked on main content background")}>
      {/* Header */}
      <header className="w-full p-6 flex justify-end items-center space-x-4">
         <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Đăng nhập
         </button>
         <button className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors">
            Đăng ký
         </button>
      </header>

      {/* Centered Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 -mt-20 max-w-4xl mx-auto w-full">
        
        {/* Branding */}
        <div className="mb-8 text-center flex flex-col items-center animate-fade-in" onClick={(e) => { e.stopPropagation(); onUserInteraction(`User clicked on header ${header.title}`); }}>
          <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-6">
             <Icon className={`w-8 h-8 ${header.color}`} />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            {header.title}
          </h1>
          
          <p className="text-center text-gray-500 max-w-xl text-sm md:text-base leading-relaxed">
            {header.subtitle}
          </p>
        </div>

        {/* Input Area */}
        <div className="w-full max-w-2xl relative group z-10">
          <div className={`
            relative bg-white rounded-2xl shadow-xl shadow-blue-900/5 border transition-all duration-300 overflow-hidden
            ${status === GenerationStatus.LOADING ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-200 focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-50'}
          `}
          onClick={(e) => e.stopPropagation()}
          >
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => onUserInteraction("User focused on input field")}
              placeholder={header.placeholder}
              className="w-full p-6 pb-16 bg-transparent text-gray-700 placeholder-gray-400 text-lg outline-none resize-none min-h-[120px]"
              rows={1}
            />
            
            <div className="absolute bottom-3 left-4 flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors" title="Upload Image" onClick={() => onUserInteraction("User clicked Upload Image button")}>
                   <Image className="w-5 h-5" />
                </button>
            </div>

            <div className="absolute bottom-3 right-4">
              <button 
                onClick={handleGenerate}
                disabled={status === GenerationStatus.LOADING || !inputText.trim()}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all
                  ${inputText.trim() ? 'bg-gray-900 text-white hover:bg-black' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                `}
              >
                <span>{status === GenerationStatus.LOADING ? 'Processing...' : 'Generate'}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          
          {/* Result Modal / Tooltip (Simulated output display) */}
          {status === GenerationStatus.SUCCESS && result && (
             <div className="absolute top-full left-0 w-full mt-4 bg-white rounded-xl border border-gray-200 shadow-lg p-4 animate-in fade-in slide-in-from-top-2 z-20" onClick={(e) => { e.stopPropagation(); onUserInteraction("User is viewing results"); }}>
                <div className="flex items-start justify-between">
                   <div className="flex items-center space-x-2 text-green-600 mb-2">
                      <Check className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase">Task Completed</span>
                   </div>
                   <button onClick={() => setStatus(GenerationStatus.IDLE)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                   </button>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{result}</p>
             </div>
          )}

           {status === GenerationStatus.ERROR && (
             <div className="absolute top-full left-0 w-full mt-4 bg-red-50 rounded-xl border border-red-100 p-4 animate-in fade-in slide-in-from-top-2">
                <p className="text-red-600 text-sm">Oops! Something went wrong. Please check your connection.</p>
             </div>
          )}
        </div>

        {/* Suggestion Chips (Only show on Builder view for now) */}
        {currentView === 'BUILDER' && (
          <div className="mt-8 flex flex-wrap justify-center gap-3 max-w-3xl">
            {suggestions.map((chip) => (
              <button
                key={chip.id}
                onClick={(e) => { 
                    e.stopPropagation();
                    setInputText(chip.label);
                    onUserInteraction(`User clicked suggestion chip: ${chip.label}`);
                }}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}

      </main>
    </div>
  );
};

export default MainContent;