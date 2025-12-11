import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ShaderGradientCanvas, ShaderGradient } from 'shadergradient';
import { LOCAITH_SYSTEM_PROMPT } from "../services/geminiService";
import { Image as ImageIcon, Mic, Search, X, ExternalLink, ArrowLeft, Maximize2, Minimize2, Sparkles } from 'lucide-react';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface SearchResult {
  title: string;
  uri: string;
  snippet?: string;
}

export const SearchFeature: React.FC = () => {
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<SearchResult[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [query]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setHasSearched(true);
    setIsLoading(true);
    setAnswer('');
    setSources([]);

    try {
      // Request HTML format specifically for better presentation
      const prompt = `
        You are a professional AI Research Assistant named Locaith.
        User Query: "${query}"
        
        Instructions:
        1. Use the Google Search tool to find the most relevant and up-to-date information.
        2. **Output Format:** Return a clean, well-structured HTML snippet.
           - Do NOT use Markdown.
           - Do NOT include html, head, or body tags.
           - Start directly with block elements like h3, p, etc.
        3. **Design System Compatibility:**
           - Use standard Tailwind CSS classes that adapt to both light and dark modes.
           - **Text:** Use 'text-foreground' for main text, 'text-muted-foreground' for secondary text.
           - **Headings:** Use 'text-foreground font-bold'.
           - **Backgrounds:** Use 'bg-muted/50' or 'bg-card' for blocks.
           - **Borders:** Use 'border-border'.
           - **Highlights:** Use 'text-brand-600' or 'text-blue-500'.
        4. **Structure:**
           - Use <h3 class="text-xl font-bold text-foreground mt-4 mb-2 flex items-center gap-2">Title</h3>
           - Use <p class="mb-3 text-foreground/90 leading-relaxed">Content</p>
           - Use <ul class="list-disc list-outside ml-5 mb-4 space-y-1 text-foreground/90"> for lists.
           - Use <div class="bg-muted/30 p-4 rounded-xl border border-border my-4 text-sm"> for summaries/key takeaways.
        5. **Tone:** Professional, concise, objective, and elegant.
        6. **Content:** Synthesize the information into a coherent overview.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          systemInstruction: LOCAITH_SYSTEM_PROMPT,
        },
      });

      // Clean up any potential markdown code blocks
      let htmlText = response.text;
      htmlText = htmlText.replace(/```html/gi, '').replace(/```/g, '');

      setAnswer(htmlText);

      // Extract sources from grounding chunks
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const extractedSources: SearchResult[] = groundingChunks
        .map((chunk: any) => chunk.web ? { title: chunk.web.title, uri: chunk.web.uri, snippet: chunk.web.title } : null)
        .filter(Boolean)
        // Remove duplicates based on URI
        .filter((v, i, a) => a.findIndex(t => (t?.uri === v?.uri)) === i) as SearchResult[];

      setSources(extractedSources);

    } catch (error) {
      console.error("Search error:", error);
      setAnswer(`<p class="text-red-500">Xin lỗi, tôi gặp sự cố khi tìm kiếm. Vui lòng thử lại.</p>`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="flex h-full w-full text-foreground overflow-hidden font-sans animate-fade-in-up transition-colors duration-300 flex-col relative" style={{ background: 'transparent' }}>
      
      {/* Main Content Area */}
      <div className={`${hasSearched ? 'w-full max-w-[1920px] mx-auto px-4' : 'w-full max-w-4xl mx-auto mt-[10vh] md:mt-[15vh] px-6'} flex flex-col transition-all duration-700 h-full relative z-10`}>
        
        {/* Search Header */}
        <div className={`${hasSearched ? 'py-4 border-b border-border sticky top-0 z-30 bg-background/80 backdrop-blur-md' : 'p-0 flex flex-col items-center'} transition-all duration-500`}>
           
           {!hasSearched && (
             <div className="mb-8 md:mb-12 flex flex-col items-center animate-fade-in-down">
                <div className="flex items-center justify-center gap-3 md:gap-4 mb-4">
                    <div className="p-4 rounded-2xl">
                        <img 
                            src="/logo-locaith.png" 
                            alt="Locaith Logo" 
                            className="w-10 h-10 md:w-14 md:h-14 object-contain"
                        />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight">
                        Locaith Search
                    </h1>
                </div>
                <p className="text-base md:text-lg text-muted-foreground font-medium tracking-wide">
                    Hệ thống tìm kiếm AI thông minh
                </p>
             </div>
           )}

           <div className={`relative transition-all duration-500 ${hasSearched ? 'w-full max-w-3xl mx-auto' : 'w-full max-w-2xl'}`}>
              <div className={`relative flex flex-col neu-bg rounded-3xl border border-border transition-all duration-300 overflow-hidden group p-2 ${hasSearched ? 'shadow-sm' : 'shadow-lg'}`}>
                  
                  {/* Text Area */}
                  <textarea
                      ref={textareaRef}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Hỏi bất cứ điều gì..."
                      className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-lg resize-none border-none outline-none p-4 min-h-[56px] max-h-[200px] font-medium"
                      rows={1}
                  />

                  {/* Toolbar */}
                  <div className="flex items-center justify-between px-2 pb-1">
                      <div className="flex items-center gap-1">
                          <button 
                            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                            title="Hình ảnh"
                          >
                            <ImageIcon className="w-5 h-5" />
                          </button>
                          <button 
                            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                            title="Giọng nói"
                          >
                            <Mic className="w-5 h-5" />
                          </button>
                      </div>

                      <button 
                          onClick={handleSearch}
                          disabled={!query.trim() && !isLoading}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                              query.trim() 
                                ? 'neu-flat text-brand-600 hover:neu-pressed' 
                                : 'bg-muted/20 text-muted-foreground cursor-not-allowed'
                          }`}
                      >
                          <Sparkles className="w-4 h-4" />
                          <span>Tìm kiếm</span>
                      </button>
                  </div>
              </div>
           </div>
        </div>

        {/* Results Area */}
        {hasSearched && (
            <div className="flex-1 flex overflow-hidden relative w-full h-full pt-4">
                {/* Left Column: Results */}
                <div className={`${previewUrl ? 'hidden md:flex md:w-[45%] lg:w-[40%] border-r border-border pr-4' : 'w-full max-w-4xl mx-auto'} flex flex-col overflow-y-auto pb-20 custom-scrollbar transition-all duration-300`}>
                {isLoading ? (
                    <div className="neu-bg p-6 md:p-8 rounded-3xl animate-pulse">
                        <div className="flex items-center gap-4 mb-8 border-b border-border pb-6">
                             <div className="h-10 w-10 rounded-full bg-muted animate-pulse"></div>
                             <div className="space-y-2 flex-1">
                                <div className="h-5 w-1/3 bg-muted rounded"></div>
                                <div className="h-4 w-1/4 bg-muted/60 rounded"></div>
                             </div>
                        </div>
                        <div className="space-y-4">
                            <div className="h-4 bg-muted rounded w-full"></div>
                            <div className="h-4 bg-muted rounded w-5/6"></div>
                            <div className="h-4 bg-muted rounded w-4/6"></div>
                            <div className="h-32 bg-muted/30 rounded-xl mt-6 border border-border"></div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* AI Answer Card */}
                        <div className="neu-bg p-6 md:p-8 rounded-3xl border border-border transition-all duration-500 animate-fade-in-up">
                            <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-brand-50 text-brand-600 neu-pressed">
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xl text-foreground tracking-tight">
                                            Kết quả tổng hợp
                                        </h3>
                                        <p className="text-sm text-muted-foreground">Từ {sources.length} nguồn tin cậy</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Content */}
                            <div 
                                dangerouslySetInnerHTML={{ __html: answer }}
                                className="prose prose-lg max-w-none text-foreground
                                    prose-headings:text-foreground prose-headings:font-bold
                                    prose-p:text-foreground/90 prose-p:leading-relaxed
                                    prose-strong:text-brand-600
                                    prose-a:text-blue-500 hover:prose-a:text-blue-600
                                    prose-ul:text-foreground/90
                                    prose-li:marker:text-muted-foreground
                                    dark:prose-invert"
                            />
                            
                            {/* Actions */}
                            <div className="mt-8 pt-6 border-t border-border flex justify-between items-center">
                                <span className="text-xs font-medium text-muted-foreground">
                                    Được tạo bởi Locaith AI
                                </span>
                                <div className="flex gap-2">
                                    <button className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors" title="Sao chép">
                                        <span className="text-xs font-bold">COPY</span>
                                    </button>
                                    <button className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors" title="Tạo lại">
                                        <span className="text-xs font-bold">REGENERATE</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Sources Grid */}
                        <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 px-1">
                                Nguồn tham khảo
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {sources.map((source, idx) => (
                                    <div 
                                        key={idx} 
                                        onClick={() => setPreviewUrl(source.uri)}
                                        className="group flex flex-col p-4 rounded-2xl neu-flat hover:neu-pressed transition-all duration-300 cursor-pointer border border-transparent hover:border-border"
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                                                 <img 
                                                    src={`https://www.google.com/s2/favicons?domain=${new URL(source.uri).hostname}&sz=64`} 
                                                    alt="" 
                                                    className="w-5 h-5 object-contain"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        e.currentTarget.parentElement!.innerHTML = `<span class="text-xs font-bold text-muted-foreground">${idx + 1}</span>`;
                                                    }}
                                                 />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs text-muted-foreground truncate font-medium group-hover:text-foreground transition-colors">
                                                     {new URL(source.uri).hostname}
                                                </div>
                                                <div className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-brand-600 transition-colors">
                                                    {source.title}
                                                </div>
                                            </div>
                                            <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                </div>

                {/* Right Column: Preview */}
                {previewUrl && (
                   <div className="absolute inset-0 z-50 md:static md:flex md:flex-1 bg-background flex flex-col h-full animate-in slide-in-from-right duration-300 border-l border-border shadow-2xl md:shadow-none">
                       {/* Toolbar */}
                       <div className="flex items-center justify-between p-3 border-b border-border bg-background/95 backdrop-blur-md">
                           <div className="flex items-center gap-3 overflow-hidden">
                               <button onClick={() => setPreviewUrl(null)} className="md:hidden p-2 hover:bg-muted rounded-full text-foreground">
                                   <ArrowLeft className="w-5 h-5" />
                               </button>
                               <div className="flex flex-col overflow-hidden">
                                   <span className="text-sm font-medium text-foreground truncate max-w-[200px] md:max-w-[300px]">{previewUrl}</span>
                               </div>
                           </div>
                           <div className="flex items-center gap-1">
                               <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors" title="Mở tab mới">
                                   <ExternalLink className="w-4 h-4" />
                               </a>
                               <button onClick={() => setPreviewUrl(null)} className="hidden md:block p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors" title="Đóng xem trước">
                                   <X className="w-4 h-4" />
                               </button>
                           </div>
                       </div>
                       <div className="flex-1 bg-white relative">
                           <iframe 
                               src={previewUrl} 
                               className="w-full h-full border-none"
                               sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                               title="Preview"
                           />
                           <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/5 to-transparent h-4"></div>
                       </div>
                   </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};
