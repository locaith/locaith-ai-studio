import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

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
  const [selectedSource, setSelectedSource] = useState<SearchResult | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setHasSearched(true);
    setIsLoading(true);
    setAnswer('');
    setSources([]);
    setSelectedSource(null);

    try {
      // Request HTML format specifically for better presentation
      const prompt = `
        You are a professional AI Research Assistant.
        User Query: "${query}"
        
        Instructions:
        1. Use the Google Search tool to find the most relevant and up-to-date information.
        2. **Output Format:** Return a clean, well-structured HTML snippet.
           - Do NOT use Markdown (no \`**\`, no \`#\`, no \`\`\`).
           - Do NOT include \`<html>\`, \`<head>\`, or \`<body>\` tags.
           - Start directly with block elements like \`<h3>\`, \`<p>\`, etc.
        3. **Structure:**
           - Use \`<h3 class="text-lg font-bold text-gray-900 mt-4 mb-2">\` for section headings.
           - Use \`<p class="mb-3 text-gray-700 leading-relaxed">\` for paragraphs.
           - Use \`<ul class="list-disc list-outside ml-5 mb-4 space-y-1 text-gray-700">\` for lists.
           - Use \`<strong class="font-semibold text-brand-600">\` for key terms/highlights.
           - Use \`<div class="bg-gray-50 p-3 rounded-lg border-l-4 border-brand-500 my-4">\` for summary or key takeaways.
        4. **Tone:** Professional, concise, objective, and elegant.
        5. **Content:** Synthesize the information into a coherent overview.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      // Clean up any potential markdown code blocks if the model slips up
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
      if (extractedSources.length > 0) {
          setSelectedSource(extractedSources[0]);
      }

    } catch (error) {
      console.error("Search error:", error);
      setAnswer(`<p class="text-red-500">Sorry, I encountered an error while searching the web. Please try again.</p>`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex h-full bg-white/50 backdrop-blur-sm overflow-hidden font-sans animate-fade-in-up transition-colors duration-300 flex-col md:flex-row">
      {/* Left Column: Search & AI Answer */}
      <div className={`${hasSearched ? 'md:w-3/5 w-full' : 'w-full max-w-2xl mx-auto mt-20'} flex flex-col transition-all duration-500 md:border-r border-gray-200 bg-white/90 backdrop-blur-md`}>
        
        {/* Search Header */}
        <div className={`${hasSearched ? 'p-4 border-b border-gray-200 bg-white/90' : 'p-0'} z-20 transition-colors duration-300`}>
           <div className={`relative ${hasSearched ? 'w-full' : 'w-full'}`}>
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                className={`w-full pl-10 pr-4 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm text-gray-900 transition-all ${hasSearched ? 'py-2 text-sm' : 'py-4 text-lg'}`}
              />
           </div>
           {!hasSearched && (
               <div className="mt-8 flex justify-center gap-4">
                   <button onClick={handleSearch} className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors">Google Search</button>
               </div>
           )}
        </div>

        {/* Results Area */}
        {hasSearched && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6 space-y-8 custom-scrollbar">
                {isLoading ? (
                    <div className="space-y-6 animate-pulse p-2">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 bg-brand-500/20 rounded-full flex items-center justify-center">
                                <div className="w-4 h-4 bg-brand-500 rounded-full animate-ping"></div>
                            </div>
                            <span className="text-base text-brand-600 font-medium">Analyzing search results...</span>
                        </div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-40 bg-gray-100 rounded-xl mt-6"></div>
                    </div>
                ) : (
                    <>
                        {/* AI Answer - Styled as HTML */}
                        <div className="bg-white p-6 sm:p-7 md:p-8 rounded-2xl border border-gray-200 shadow-sm transition-colors duration-300">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                <div className="p-2 bg-brand-100 rounded-lg text-brand-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a8 8 0 0 1 8 8c0 3.866-3.582 7-8 7s-8-3.134-8-7a8 8 0 0 1 8-8z"></path><path d="m16 10-4 4-4-4"></path></svg>
                                </div>
                                <h3 className="font-bold text-xl text-gray-900 tracking-tight">AI Overview</h3>
                            </div>
                            
                            {/* Render the HTML directly */}
                            <div 
                                dangerouslySetInnerHTML={{ __html: answer }}
                                className="prose max-w-none"
                            />
                        </div>

                        {/* Sources List */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span>Sources</span>
                                <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-[10px]">{sources.length}</span>
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {sources.map((source, idx) => (
                                    <div 
                                        key={idx} 
                                        onClick={() => setSelectedSource(source)}
                                        className={`p-3 rounded-xl border cursor-pointer transition-all group ${
                                            selectedSource?.uri === source.uri 
                                            ? 'bg-brand-50 border-brand-500 ring-1 ring-brand-500' 
                                            : 'bg-white border-gray-200 hover:border-brand-300'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-500 group-hover:text-brand-500 group-hover:bg-brand-100 transition-colors">
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[10px] text-gray-500 truncate mb-0.5 flex items-center gap-1">
                                                     <img src={`https://www.google.com/s2/favicons?domain=${new URL(source.uri).hostname}&sz=16`} alt="" className="w-3 h-3 opacity-60"/>
                                                     {new URL(source.uri).hostname}
                                                </div>
                                                <div className="text-sm font-medium text-gray-900 truncate mb-1 group-hover:text-brand-600 transition-colors">{source.title}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {selectedSource && (
                          <div className="md:hidden mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm animate-fade-in-up">
                            <div className="h-12 border-b border-gray-200 flex items-center justify-between px-4 bg-white/90 rounded-t-2xl">
                              <div className="flex items-center gap-2 text-sm text-gray-600 truncate max-w-[60%]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                                <span className="truncate font-mono text-xs">{selectedSource.uri}</span>
                              </div>
                              <a 
                                href={selectedSource.uri} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                              >
                                Open
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                              </a>
                            </div>
                            <div className="p-4 text-sm text-gray-700">
                              <div className="font-semibold mb-1 truncate">{selectedSource.title}</div>
                              {selectedSource.snippet && (
                                <div className="text-gray-600 line-clamp-3">{selectedSource.snippet}</div>
                              )}
                            </div>
                          </div>
                        )}
                    </>
                )}
            </div>
        )}
      </div>

      {/* Right Column: Preview Pane */}
      {hasSearched && (
        <div className="hidden md:flex flex-1 bg-white/80 backdrop-blur flex-col relative z-10 transition-colors duration-300">
            {selectedSource ? (
                <>
                    <div className="h-12 border-b border-gray-200 flex items-center justify-between px-4 bg-white/90">
                        <div className="flex items-center gap-2 text-sm text-gray-600 truncate max-w-md">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                            <span className="truncate font-mono text-xs">{selectedSource.uri}</span>
                        </div>
                        <a 
                            href={selectedSource.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                        >
                            Open in new tab
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                        </a>
                    </div>
                    <div className="flex-1 relative bg-gray-100">
                         <iframe 
                            src={selectedSource.uri} 
                            className="w-full h-full border-none bg-white"
                            sandbox="allow-scripts allow-same-origin"
                            title="Preview"
                            onError={(e) => console.log("Iframe load error", e)}
                         />
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Source Selected</h3>
                    <p className="text-sm text-gray-500 max-w-xs">Select a search result from the list to preview the website content directly in this pane.</p>
                </div>
            )}
        </div>
      )}
    </div>
  );
};