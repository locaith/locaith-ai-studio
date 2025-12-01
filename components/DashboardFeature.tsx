import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShaderGradientCanvas, ShaderGradient } from 'shadergradient';
import { useAuth } from '../src/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
    MessageSquare,
    Image as ImageIcon,
    Mic,
    ArrowUp,
    Sparkles,
    Search,
    Paperclip
} from 'lucide-react';
import VoiceChat from './VoiceChat';
import { DirectChatFeature } from './DirectChatFeature';
import { VoiceMode, ViewState } from '../src/types/voice';

interface Website {
    id: string;
    project_name: string;
    subdomain: string;
    created_at: string;
    github_repo?: string;
    status: string;
    updated_at?: string;
    html_content?: string;
    messages?: any[];
}

export const DashboardFeature: React.FC<{ onOpenProject: (website: Website) => void, onNewProject: () => void }> = ({ onOpenProject, onNewProject }) => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [voiceMode, setVoiceMode] = useState<VoiceMode>('HIDDEN');
    const [chatStarted, setChatStarted] = useState(false);
    const [initialMessage, setInitialMessage] = useState("");

    const handleVoiceNavigate = (view: ViewState) => {
        console.log("Voice requested navigation to:", view);
        if (view === 'BUILDER') {
            onNewProject();
        }
    };

    const handleVoiceFill = (text: string) => {
        setInputValue(text);
        handleSendMessage(text);
    };

    const handleSendMessage = (message: string) => {
        if (!message.trim()) return;
        setInitialMessage(message);
        setChatStarted(true);
    };

    const suggestions = [
        { text: "Tôi muốn tổ chức hội nghị cần những gì?" },
        { text: "Cần chuẩn bị gì cho sự kiện ra mắt sản phẩm?" },
        { text: "Tư vấn tổ chức workshop về marketing" },
        { text: "Hướng dẫn setup không gian coworking" },
    ];

    return (
        <div className="h-full w-full overflow-hidden bg-transparent flex flex-col relative animate-fade-in-up" style={{ background: 'transparent' }}>
            {/* Background Shader */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
                <ShaderGradientCanvas
                    pointerEvents="none"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                    }}
                >
                    <ShaderGradient
                        control="query"
                        urlString="https://www.shadergradient.co/customize?animate=on&axesHelper=off&bgColor1=%23000000&bgColor2=%23000000&brightness=1.2&cAzimuthAngle=180&cDistance=3.6&cPolarAngle=90&cameraZoom=1&color1=%23454bff&color2=%2358c1db&color3=%23965ce1&destination=onCanvas&embedMode=off&envPreset=city&format=gif&fov=45&frameRate=10&gizmoHelper=hide&grain=off&lightType=3d&pixelDensity=1&positionX=-1.4&positionY=0&positionZ=0&range=enabled&rangeEnd=40&rangeStart=0&reflection=0.1&rotationX=0&rotationY=10&rotationZ=50&shader=defaults&type=plane&uDensity=1.3&uFrequency=5.5&uSpeed=0.2&uStrength=4&uTime=0&wireframe=false"
                    />
                </ShaderGradientCanvas>
            </div>
            {/* Blur Overlay */}
            <div className="absolute inset-0 z-0 pointer-events-none backdrop-blur-[2px] bg-background/30" />

            {/* Content Wrapper */}
            <div className="relative z-10 h-full w-full overflow-y-auto flex flex-col">
                {chatStarted ? (
                <DirectChatFeature initialMessageProp={initialMessage} />
            ) : (
                <>
            {/* Mobile Header - Only visible on mobile */}
            <div className="flex md:hidden items-center gap-3 h-14 px-3 border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-20">
                <img src="/logo-locaith.png" alt="Locaith" className="h-8 w-auto shrink-0" />
                <div className="flex-1">
                    <div className="h-9 neu-input flex items-center px-4 rounded-full">
                        <Search className="w-4 h-4 text-muted-foreground mr-2" />
                        <input 
                            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground" 
                            placeholder="Tìm kiếm..." 
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-4 pb-24 md:pb-4 relative overflow-hidden">
                
                <div className="w-full max-w-3xl z-10 flex flex-col items-center text-center space-y-10 animate-in fade-in zoom-in duration-700">
                    
                    {/* Hero Section */}
                    <div className="flex flex-col items-center space-y-6 mt-4 md:mt-0">
                        <div className="space-y-2">
                            <div className="mb-6 flex justify-center">
                                <div className="neu-flat p-6 rounded-[2rem]">
                                    <img src="/logo-locaith.png" alt="Locaith Logo" className="w-20 h-20 object-contain" />
                                </div>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-foreground">
                                Locaith <span className="text-brand-600">AI Studio</span>
                            </h1>
                            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto font-medium leading-relaxed">
                                Trợ lý thông minh toàn năng. Giúp bạn lập kế hoạch, tư vấn giải pháp và hiện thực hóa ý tưởng.
                            </p>
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="w-full relative group max-w-2xl mx-auto">
                        <div className="neu-bg rounded-[2rem] p-2 flex flex-col gap-2 border border-border transition-all duration-300 hover:shadow-lg">
                            <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage(inputValue);
                                    }
                                }}
                                placeholder="Bạn đang nghĩ gì? Hãy để tôi giúp..."
                                className="w-full bg-transparent border-none outline-none text-lg placeholder:text-muted-foreground/50 resize-none min-h-[60px] max-h-[200px] p-4 text-foreground font-medium rounded-xl focus:neu-pressed transition-all"
                            />
                            
                            <div className="flex items-center justify-between px-2 pb-1">
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl h-10 w-10 transition-all">
                                        <ImageIcon className="w-5 h-5" />
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl h-10 w-10 transition-all"
                                        onClick={() => setVoiceMode('FULL')}
                                    >
                                        <Mic className="w-5 h-5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl h-10 w-10 transition-all">
                                        <Paperclip className="w-5 h-5" />
                                    </Button>
                                </div>
                                
                                <Button 
                                    size="icon" 
                                    className={`rounded-xl h-10 w-10 transition-all duration-300 ${
                                        inputValue.trim() 
                                            ? 'neu-flat text-brand-600 hover:neu-pressed' 
                                            : 'bg-muted/20 text-muted-foreground cursor-not-allowed'
                                    }`}
                                    onClick={() => handleSendMessage(inputValue)}
                                    disabled={!inputValue.trim() || isLoading}
                                >
                                    <ArrowUp className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Suggestions Grid */}
                    <div className="w-full max-w-2xl space-y-4">
                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground tracking-widest uppercase">
                            Khám phá khả năng
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => setInputValue(suggestion.text)}
                                    className="group flex items-center justify-center p-4 rounded-2xl neu-flat hover:neu-pressed transition-all duration-300 text-center border border-transparent hover:border-border"
                                >
                                    <div>
                                        <p className="text-sm text-foreground font-medium group-hover:text-brand-600 transition-colors line-clamp-2">
                                            {suggestion.text}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
                </>
            )}
            
            {voiceMode !== 'HIDDEN' && (
                <VoiceChat
                    mode={voiceMode}
                    setMode={setVoiceMode}
                    onNavigate={handleVoiceNavigate}
                    onFillAndGenerate={handleVoiceFill}
                    lastUserInteraction={null}
                />
            )}
            </div>
        </div>
    );
};
