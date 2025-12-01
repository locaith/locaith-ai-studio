import React from 'react';
import { FileCode, Terminal, Database, Layers, Zap, Code2 } from 'lucide-react';

export const CodeCarousel: React.FC = () => {
  const cards = [
    {
      title: "Locaith AI",
      icon: <Zap className="w-6 h-6 text-yellow-400" />,
      lang: "System",
      content: "Initializing Neural Engine...\nLoading Context: 100%\nOptimizing Parameters...",
      color: "from-purple-500 to-indigo-500"
    },
    {
      title: "React Component",
      icon: <Code2 className="w-6 h-6 text-blue-400" />,
      lang: "TSX",
      content: "export const Future = () => {\n  return <AI>\n    <LocaithPower />\n  </AI>;\n}",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Smart Styling",
      icon: <Layers className="w-6 h-6 text-pink-400" />,
      lang: "CSS",
      content: ".future {\n  display: flex;\n  perspective: 1000px;\n  transform-style: preserve-3d;\n}",
      color: "from-pink-500 to-rose-500"
    },
    {
      title: "Backend Logic",
      icon: <Terminal className="w-6 h-6 text-green-400" />,
      lang: "Node.js",
      content: "async function build() {\n  await locaith.generate();\n  return 'Masterpiece';\n}",
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Data Structure",
      icon: <Database className="w-6 h-6 text-orange-400" />,
      lang: "JSON",
      content: "{\n  \"platform\": \"Locaith\",\n  \"status\": \"Evolution\",\n  \"version\": \"2.0.0\"\n}",
      color: "from-orange-500 to-red-500"
    },
    {
        title: "Locaith Studio",
        icon: <FileCode className="w-6 h-6 text-violet-400" />,
        lang: "Config",
        content: "const config = {\n  theme: 'dark',\n  mode: 'pro',\n  ai: true\n};",
        color: "from-violet-500 to-purple-500"
      }
  ];

  return (
    <div className="w-full h-full bg-[#050505] flex flex-col items-center justify-center overflow-hidden relative perspective-container">
      <style>
        {`
          .perspective-container {
            perspective: 1000px;
          }
          .carousel-spinner {
            transform-style: preserve-3d;
            animation: spin 20s infinite linear;
          }
          @keyframes spin {
            from { transform: rotateY(0deg); }
            to { transform: rotateY(-360deg); }
          }
          .carousel-card {
            position: absolute;
            left: 50%;
            top: 50%;
            margin-left: -140px; /* Half of width */
            margin-top: -100px;  /* Half of height */
            backface-visibility: visible; 
            /* reflection effect */
            -webkit-box-reflect: below 10px linear-gradient(transparent, transparent, rgba(0,0,0,0.4));
          }
          /* Glowing text animation */
          @keyframes pulse-glow {
            0%, 100% { text-shadow: 0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3); }
            50% { text-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(168, 85, 247, 0.6); }
          }
          .animate-glow {
            animation: pulse-glow 3s infinite;
          }
        `}
      </style>

      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(50,50,50,0.2)_0%,_rgba(0,0,0,1)_100%)] pointer-events-none" />
      
      {/* Title Section */}
      <div className="absolute top-10 z-20 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
            <img src="/logo-locaith.png" alt="Locaith Logo" className="h-12 w-auto object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-glow font-sans tracking-tight">
            Locaith AI
            </h1>
        </div>
        <p className="text-blue-200/60 text-sm md:text-base font-light tracking-widest uppercase">
            Generative Code Engine
        </p>
      </div>

      {/* 3D Carousel */}
      <div className="relative w-full max-w-[1000px] h-[400px] flex items-center justify-center" style={{ transform: 'scale(0.9)' }}>
        <div className="carousel-spinner w-0 h-0 relative">
          {cards.map((card, index) => {
            const count = cards.length;
            const rotateY = (360 / count) * index;
            const translateZ = 350; // Distance from center

            return (
              <div
                key={index}
                className="carousel-card w-[280px] h-[200px] rounded-xl border border-white/10 bg-black/80 backdrop-blur-md p-5 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden group hover:border-white/30 transition-colors duration-300"
                style={{
                  transform: `rotateY(${rotateY}deg) translateZ(${translateZ}px)`,
                }}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    {card.icon}
                    <span className={`text-xs font-bold uppercase tracking-wider bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>
                      {card.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">{card.lang}</span>
                </div>

                {/* Card Content (Code Snippet) */}
                <div className="flex-1 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 pointer-events-none" />
                  <pre className="font-mono text-[11px] leading-relaxed text-gray-300 opacity-90">
                    <code>{card.content}</code>
                  </pre>
                </div>

                {/* Decorative corner */}
                <div className={`absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r ${card.color} opacity-50`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Loading Text */}
      <div className="absolute bottom-12 z-20 flex flex-col items-center gap-3">
         <div className="flex items-center gap-1">
             <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]"></div>
             <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:-0.15s]"></div>
             <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce"></div>
         </div>
         <p className="text-gray-400 text-sm font-light tracking-widest animate-pulse">
            BUILDING YOUR EXPERIENCE
         </p>
      </div>
    </div>
  );
};
