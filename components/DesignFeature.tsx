
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { useNavigate } from 'react-router-dom';
import { LOCAITH_SYSTEM_PROMPT } from '../services/geminiService';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

type ViewMode = 'selection' | 'project-setup' | 'mode-selection' | 'creation' | 'editor';
type DesignType = 'fashion' | 'interior' | null;
type DesignOrigin = 'upload' | 'generated';

// Helper to convert Blob URL to Base64 string for Gemini API
const blobToBase64 = async (blobUrl: string): Promise<string> => {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            const base64Data = base64String.split(',')[1];
            resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

// --- Components ---

const SelectionView: React.FC<{ onSelect: (type: DesignType) => void }> = ({ onSelect }) => (
    <div className="flex flex-col h-full animate-fade-in-up neu-bg">
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-50 neu-bg border-b border-border pt-[env(safe-area-inset-top)] h-[calc(3.5rem+env(safe-area-inset-top))] flex items-center justify-center shadow-sm">
            <span className="font-bold text-lg text-foreground">Thiết kế AI</span>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 md:mb-8 text-center">Bạn muốn thiết kế gì hôm nay?</h2>
        <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-8 w-full max-w-5xl">
            <button
                onClick={() => onSelect('fashion')}
                className="group relative h-64 md:h-96 w-full max-w-md neu-flat rounded-2xl overflow-hidden transition-all hover:scale-[1.02]"
            >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10"></div>
                <img src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80" alt="Fashion" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute bottom-0 left-0 p-6 md:p-8 z-20 text-left">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">Thời Trang & Style</h3>
                    <p className="text-gray-200 text-xs md:text-sm">Thiết kế trang phục, phụ kiện trên người mẫu thật.</p>
                </div>
            </button>

            <button
                onClick={() => onSelect('interior')}
                className="group relative h-64 md:h-96 w-full max-w-md neu-flat rounded-2xl overflow-hidden transition-all hover:scale-[1.02]"
            >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10"></div>
                <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Interior" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute bottom-0 left-0 p-6 md:p-8 z-20 text-left">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">Nội Thất & Kiến Trúc</h3>
                    <p className="text-gray-200 text-xs md:text-sm">Biến đổi không gian, sắp xếp nội thất phòng ốc.</p>
                </div>
            </button>
        </div>
    </div>
    </div>
);

const SetupView: React.FC<{
    projectName: string;
    setProjectName: (name: string) => void;
    userRole: string;
    setUserRole: (role: string) => void;
    onBack: () => void;
    onCreate: () => void;
    showBackButton?: boolean;
}> = ({ projectName, setProjectName, userRole, setUserRole, onBack, onCreate, showBackButton = true }) => {
    const ROLES = [
        { id: 'artist', label: 'Chuyên gia nghệ thuật', icon: '🎨' },
        { id: 'designer', label: 'Nhà thiết kế', icon: '✨' },
        { id: 'film', label: 'Chuyên viên ngành điện ảnh và truyền hình', icon: '🎬' },
        { id: 'marketing', label: 'Chuyên gia tiếp thị kỹ thuật số', icon: '📢' },
        { id: 'creator', label: 'Nhà sáng tạo nội dung', icon: '✏️' },
        { id: 'tech', label: 'Chuyên gia công nghệ', icon: '💻' },
        { id: 'other', label: 'Khác (vui lòng nêu rõ)', icon: '😉' },
    ];

    return (
        <div className="flex flex-col items-center justify-center h-full p-4 animate-fade-in-up">
            <div className="neu-bg text-foreground p-5 md:p-8 rounded-2xl shadow-2xl border border-border max-w-3xl w-full overflow-y-auto max-h-[90vh] relative">
                 {showBackButton && (
                    <button onClick={onBack} className="absolute top-4 right-4 md:top-6 md:right-6 text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-black/5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                )}
                
                <div className="text-center mb-6 md:mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight text-foreground">Vai trò nào đúng với bạn nhất?</h2>
                    <p className="text-muted-foreground text-xs md:text-sm">Chúng tôi sẽ cá nhân hóa trải nghiệm dựa trên lựa chọn của bạn.</p>
                </div>

                <div className="mb-6 md:mb-8 max-w-lg mx-auto">
                    <label className="block text-xs md:text-sm font-medium text-muted-foreground mb-2 ml-1">Tên dự án của bạn</label>
                    <div className="relative group">
                        <input
                            type="text"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            placeholder="Ví dụ: Nội thất văn phòng, Bộ sưu tập Hè 2025..."
                            className="w-full p-3.5 neu-pressed rounded-xl outline-none text-foreground placeholder-muted-foreground transition-all text-sm md:text-base"
                            autoFocus
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 mb-6 md:mb-8">
                    {ROLES.map((role) => (
                        <button
                            key={role.id}
                            onClick={() => setUserRole(role.id)}
                            className={`flex items-center gap-3 p-2.5 md:p-4 rounded-xl text-left transition-all group
                                ${userRole === role.id 
                                    ? 'neu-pressed border-brand-500 text-brand-600' 
                                    : 'neu-flat hover:scale-[1.02]'}`}
                        >
                            <span className="text-lg md:text-2xl group-hover:scale-110 transition-transform duration-300 filter drop-shadow-md">{role.icon}</span>
                            <span className={`text-sm md:text-base font-medium transition-colors ${userRole === role.id ? 'text-brand-600' : 'text-foreground group-hover:text-brand-600'}`}>
                                {role.label}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="flex justify-center w-full">
                    <button
                        onClick={onCreate}
                        disabled={!projectName.trim()}
                        className="w-full md:w-auto px-10 py-3 neu-flat hover:neu-pressed text-brand-600 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        Tiếp tục
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

const ModeSelectionView: React.FC<{
    type: DesignType;
    onSelectMode: (mode: DesignOrigin) => void;
    onBack: () => void;
}> = ({ type, onSelectMode, onBack }) => (
    <div className="flex flex-col items-center justify-center h-full p-4 md:p-8 animate-fade-in-up neu-bg">
        <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-2 md:mb-4 tracking-tight">
                {type === 'fashion' ? 'Studio Thời Trang AI' : 'Studio Nội Thất AI'}
            </h2>
            <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto">
                Biến ý tưởng thành hiện thực với sức mạnh của trí tuệ nhân tạo. Chọn phương thức bắt đầu của bạn.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-5xl w-full px-4">
            <button
                onClick={() => onSelectMode('upload')}
                className="group relative h-64 md:h-[400px] w-full neu-flat rounded-3xl overflow-hidden transition-all hover:scale-[1.02]"
            >
                <div className="absolute inset-0">
                    <img 
                        src={type === 'fashion' 
                            ? "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80" 
                            : "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80"
                        }
                        alt="Upload" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                </div>
                
                <div className="absolute bottom-0 left-0 p-5 md:p-8 text-left w-full">
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-3 md:mb-6 border border-white/30 text-white group-hover:bg-white group-hover:text-brand-600 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 md:w-7 md:h-7"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    </div>
                    <h3 className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-3">Tải ảnh hiện trạng</h3>
                    <p className="text-gray-300 text-[10px] md:text-sm leading-relaxed">
                        {type === 'fashion' 
                            ? 'Tải lên ảnh người mẫu hoặc trang phục có sẵn. AI sẽ giúp bạn thay đổi trang phục, kiểu dáng và phong cách.' 
                            : 'Tải lên ảnh phòng ốc hiện tại của bạn. AI sẽ giữ nguyên cấu trúc và "hô biến" thành không gian mới.'}
                    </p>
                </div>
            </button>

            <button
                onClick={() => onSelectMode('generated')}
                className="group relative h-64 md:h-[400px] w-full neu-flat rounded-3xl overflow-hidden transition-all hover:scale-[1.02]"
            >
                <div className="absolute inset-0">
                     <img 
                        src={type === 'fashion' 
                            ? "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=800&q=80" 
                            : "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80"
                        }
                        alt="Generate" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                </div>

                <div className="absolute bottom-0 left-0 p-5 md:p-8 text-left w-full">
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-3 md:mb-6 border border-white/30 text-white group-hover:bg-white group-hover:text-brand-600 transition-all">
                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 md:w-7 md:h-7"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    </div>
                    <h3 className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-3">Sáng tạo từ ý tưởng (AI)</h3>
                    <p className="text-gray-300 text-[10px] md:text-sm leading-relaxed">
                         Chưa có hình ảnh? Đừng lo. Hãy mô tả ý tưởng của bạn, và AI sẽ vẽ nên bản thiết kế hoàn chỉnh từ con số 0.
                    </p>
                </div>
            </button>
        </div>
    </div>
);

const CreationView: React.FC<{
    type: DesignType;
    onSuccess: (imageUrl: string) => void;
    onBack: () => void;
}> = ({ type, onSuccess, onBack }) => {
    const [prompt, setPrompt] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async () => {
        if (!prompt.trim()) return;
        setIsCreating(true);
        try {
            const systemPrompt = type === 'fashion'
                ? `Tạo một hình ảnh thiết kế thời trang chất lượng cao, người mẫu mặc trang phục theo mô tả: ${prompt}. Phong cách chuyên nghiệp, ánh sáng studio, full body shot.`
                : `Tạo một hình ảnh nội thất thực tế, chất lượng cao với mô tả: ${prompt}. Đảm bảo ánh sáng tốt và góc nhìn rộng.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash-exp',
                contents: {
                    parts: [{ text: systemPrompt }],
                },
                config: {
                    responseModalities: [Modality.IMAGE],
                    systemInstruction: LOCAITH_SYSTEM_PROMPT
                }
            });

            const parts = response.candidates?.[0]?.content?.parts;
            if (parts && parts.length > 0 && parts[0].inlineData) {
                const base64ImageBytes = parts[0].inlineData.data;
                const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                onSuccess(imageUrl);
            } else {
                alert("Không thể tạo ảnh. Vui lòng thử lại.");
            }
        } catch (e) {
            console.error(e);
            alert("Lỗi kết nối AI.");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full p-4 md:p-8 animate-fade-in-up neu-bg">
            <button onClick={onBack} className="absolute top-4 left-4 md:top-8 md:left-8 text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm md:text-base">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                Quay lại
            </button>
            <div className="neu-flat p-5 md:p-8 rounded-2xl shadow-sm max-w-2xl w-full mt-8 md:mt-0">
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-zinc-500 to-zinc-600 rounded-lg flex items-center justify-center text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 2a10 10 0 0 1 10 10"></path><path d="M2.05 10.99A10 10 0 0 1 12 2"></path></svg>
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground">
                        {type === 'fashion' ? 'Khởi tạo mẫu thiết kế' : 'Khởi tạo không gian'}
                    </h2>
                </div>

                <p className="text-muted-foreground mb-4 text-xs md:text-sm">
                    {type === 'fashion' 
                        ? 'Mô tả trang phục, phong cách và người mẫu bạn muốn AI tạo ra.' 
                        : 'Mô tả căn phòng mơ ước của bạn để AI tạo bản phác thảo đầu tiên.'}
                </p>

                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={type === 'fashion' 
                        ? "Ví dụ: Váy dạ hội màu đỏ, xẻ tà cao, chất liệu lụa, phong cách sang trọng..." 
                        : "Ví dụ: Một phòng khách hiện đại với cửa sổ lớn nhìn ra biển, sofa màu kem, sàn gỗ sáng màu..."}
                    className="w-full h-24 md:h-32 p-3 md:p-4 neu-pressed rounded-xl outline-none resize-none mb-4 md:mb-6 text-sm md:text-base text-foreground placeholder-muted-foreground"
                />

                <button
                    onClick={handleCreate}
                    disabled={isCreating || !prompt.trim()}
                    className="w-full py-2.5 md:py-3 bg-zinc-600 hover:bg-zinc-500 text-white rounded-xl font-bold text-base md:text-lg shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isCreating ? (
                        <>
                            <span className="animate-spin w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full"></span>
                            Đang vẽ...
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                            Tạo bản thiết kế
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

interface EditorViewProps {
    type: DesignType;
    origin: DesignOrigin;
    projectName: string;
    onBack: () => void;
    originalImage: string | null;
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    generatedImage: string | null;
    isGenerating: boolean;
    handleGenerate: () => void;
    expandedStep: number;
    setExpandedStep: (step: number) => void;
    description: string;
    setDescription: (desc: string) => void;
    styleOption: string;
    setStyleOption: (style: string) => void;
    contextDescription: string;
    setContextDescription: (desc: string) => void;
    secondaryImage: string | null;
    handleSecondaryImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    aspectRatio: string;
    setAspectRatio: (ratio: string) => void;
}

const EditorView: React.FC<EditorViewProps> = ({
    type, origin, projectName, onBack, originalImage, handleImageUpload, generatedImage,
    isGenerating, handleGenerate, expandedStep, setExpandedStep,
    description, setDescription, styleOption, setStyleOption,
    contextDescription, setContextDescription,
    secondaryImage, handleSecondaryImageUpload, aspectRatio, setAspectRatio
}) => {
    const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);

    const [showImageModal, setShowImageModal] = useState(false);
    return (
        <div className="flex h-full neu-bg flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden sticky top-0 z-50 neu-bg border-b border-border h-14 flex items-center justify-between px-3 shadow-sm">
                 <div className="flex items-center gap-2">
                    <button 
                        onClick={onBack} 
                        className="neu-icon-btn h-9 w-9 flex items-center justify-center rounded-full text-foreground"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    </button>
                    <span className="text-sm font-bold text-foreground truncate max-w-[150px]">{projectName}</span>
                 </div>
                 <button className="neu-icon-btn h-9 px-3 rounded-full text-xs font-bold text-brand-600">
                    Lưu
                 </button>
            </div>

            {/* Desktop Header Navigation */}
            <div className="hidden md:flex absolute top-0 left-0 right-0 h-14 neu-bg border-b border-border items-center justify-between px-4 md:px-6 z-20">
                <div className="flex items-center gap-3 md:gap-4">
                    <button onClick={onBack} className="text-muted-foreground hover:text-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    </button>
                    <div className="flex flex-col">
                        <span className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wider">{type === 'fashion' ? 'Thiết kế Thời trang' : 'Thiết kế Nội thất'}</span>
                        <span className="text-xs md:text-sm font-bold text-foreground truncate max-w-[150px] md:max-w-none">{projectName}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 md:px-4 md:py-1.5 neu-flat hover:neu-pressed rounded-lg text-xs md:text-sm font-medium text-foreground">Lưu dự án</button>
                </div>
            </div>

            <div className="pt-0 md:pt-14 flex flex-col md:flex-row w-full h-auto md:h-full overflow-y-auto md:overflow-hidden">
                {/* LEFT: Upload & Preview */}
                <div className="w-full md:w-1/4 neu-bg border-b md:border-b-0 md:border-r border-border p-4 md:p-6 flex flex-col shrink-0 h-auto md:h-full min-h-[200px] md:min-h-[300px]">
                    <div className="text-sm font-bold text-foreground mb-3 md:mb-4 border-b border-border pb-2">
                        {origin === 'generated' ? 'Ảnh nguồn (AI Generated)' : 'Ảnh gốc (Input)'}
                    </div>
                    <div className="flex-1 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center relative overflow-hidden hover:border-brand-500 transition-colors group bg-transparent min-h-[150px] md:min-h-[200px]">
                        {originalImage ? (
                            <>
                                <img src={originalImage} alt="Original" className="w-full h-full object-contain p-2" />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <label className="cursor-pointer px-4 py-2 neu-flat text-foreground rounded-lg font-medium text-sm hover:scale-105 transition-transform">
                                        {origin === 'generated' ? 'Thay bằng ảnh khác' : 'Tải ảnh khác'}
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                    </label>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3 md:mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-6 md:h-6"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                </div>
                                <div className="text-center px-4">
                                    <p className="text-green-600 font-bold mb-1 cursor-pointer text-sm md:text-base">Tải ảnh lên</p>
                                    <p className="text-muted-foreground text-[10px] md:text-xs">hoặc kéo thả vào đây</p>
                                    <p className="text-muted-foreground text-[10px] mt-2 hidden md:block">Hỗ trợ mọi định dạng ảnh phổ biến.</p>
                                </div>
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleImageUpload} />
                            </>
                        )}
                    </div>
                </div>

                {/* CENTER: Result Preview */}
                <div className="w-full md:flex-1 neu-pressed p-4 md:p-8 flex items-center justify-center relative shrink-0 min-h-[300px] md:min-h-[400px]">
                    <div className="neu-flat w-full max-w-2xl aspect-square rounded-2xl shadow-sm border border-transparent flex items-center justify-center overflow-hidden relative">
                        {generatedImage ? (
                            <button onClick={() => setShowImageModal(true)} className="w-full h-full">
                                <img
                                    src={generatedImage}
                                    alt="Generated"
                                    className="w-full h-full object-contain animate-fade-in-up"
                                    style={{ filter: `brightness(${brightness}%) contrast(${contrast}%)` }}
                                />
                            </button>
                        ) : (
                            <div className="text-center p-4 md:p-8">
                                {isGenerating ? (
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                        <p className="text-muted-foreground font-medium animate-pulse text-sm md:text-base">AI đang thiết kế...</p>
                                        <p className="text-xs text-muted-foreground mt-2">Quá trình này có thể mất vài giây</p>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground flex items-center gap-2 text-sm md:text-base">
                                        <span>💫</span> Đừng quên bấm "Tạo Thiết Kế" để xem phép màu tại đây!
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Floating Tools */}
                    {generatedImage && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 neu-flat rounded-xl p-1 flex flex-col gap-1 animate-fade-in-up z-10">
                            <a href={generatedImage} download={`design-${projectName}.png`} className="p-3 text-muted-foreground hover:text-brand-600 hover:bg-black/5 rounded-lg flex flex-col items-center gap-1" title="Tải xuống">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            </a>
                            <div className="w-full h-px bg-border my-1"></div>
                            <button className="p-3 text-muted-foreground hover:text-brand-600 hover:bg-black/5 rounded-lg" title="Undo"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path></svg></button>
                            <button className="p-3 text-muted-foreground hover:text-brand-600 hover:bg-black/5 rounded-lg" title="Redo"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"></path><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"></path></svg></button>
                        </div>
                    )}
                </div>

                {/* RIGHT: Editor Tools */}
                <div className="w-full md:w-1/3 neu-bg border-t md:border-t-0 md:border-l border-border flex flex-col shrink-0 h-auto md:h-full">
                    {/* Tabs */}
                    <div className="flex border-b border-border">
                        <button
                            onClick={() => setActiveTab('ai')}
                            className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition-colors ${activeTab === 'ai' ? 'border-emerald-500 text-emerald-600 bg-emerald-500/10' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                        >
                            AI Biến Hóa
                        </button>
                        <button
                            onClick={() => setActiveTab('manual')}
                            className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition-colors ${activeTab === 'manual' ? 'border-blue-500 text-blue-600 bg-blue-500/10' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                        >
                            Thủ Công
                        </button>
                    </div>

                    {/* Tab Content: AI */}
                    {activeTab === 'ai' && (
                        <>
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
                                <div className="text-xs text-muted-foreground mb-2">Sử dụng AI để thay đổi thiết kế dựa trên mô tả.</div>

                                {/* Step 1 */}
                                <div className="relative pb-6 md:pb-8 border-l-2 border-border pl-6 md:pl-8">
                                    <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${expandedStep >= 1 ? 'bg-neu-bg border-green-500 text-green-500' : 'bg-muted border-muted-foreground'}`}>
                                        {expandedStep > 1 && <div className="w-full h-full bg-green-500 rounded-full scale-50"></div>}
                                    </div>
                                    <div className="cursor-pointer" onClick={() => setExpandedStep(1)}>
                                        <h3 className={`text-sm font-bold mb-1 ${expandedStep === 1 ? 'text-green-600' : 'text-muted-foreground'}`}>
                                            {type === 'fashion' ? '1. Chi tiết sản phẩm' : '1. Đồ nội thất chính'}
                                        </h3>
                                        <p className="text-xs text-muted-foreground mb-3 md:mb-4">Mô tả vật thể chính bạn muốn thêm vào ảnh.</p>
                                    </div>

                                    {expandedStep === 1 && (
                                        <div className="space-y-3 md:space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-foreground mb-1">
                                                    {type === 'fashion' ? 'Mô tả Kính / Quần áo' : 'Mô tả Đồ nội thất'} <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                    placeholder={type === 'fashion' ? "ví dụ: kính râm đen gọng vuông" : "ví dụ: ghế sofa da màu nâu"}
                                                    className="w-full p-2.5 md:p-3 neu-pressed rounded-lg text-sm outline-none text-foreground placeholder-muted-foreground"
                                                    autoFocus
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-foreground mb-1">
                                                    Ảnh tham khảo (Tùy chọn)
                                                </label>
                                                <div className="flex items-center gap-3">
                                                    {secondaryImage && (
                                                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden border border-border relative group">
                                                            <img src={secondaryImage} alt="Secondary" className="w-full h-full object-cover" />
                                                        </div>
                                                    )}
                                                    <label className="flex-1 cursor-pointer">
                                                        <div className="w-full p-2.5 md:p-3 border-2 border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-brand-500 hover:text-brand-600 transition-colors flex items-center justify-center gap-2">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                                            {secondaryImage ? 'Thay đổi ảnh' : 'Tải ảnh tham khảo'}
                                                        </div>
                                                        <input type="file" className="hidden" accept="image/*" onChange={handleSecondaryImageUpload} />
                                                    </label>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-foreground mb-1">
                                                    {type === 'fashion' ? "Kiểu dáng / Form" : "Phong cách thiết kế"}
                                                </label>
                                                <select
                                                    value={styleOption}
                                                    onChange={(e) => setStyleOption(e.target.value)}
                                                    className="w-full p-2.5 md:p-3 neu-pressed rounded-lg text-sm outline-none text-foreground"
                                                >
                                                    <option value="">-- Chọn phong cách --</option>
                                                    {type === 'fashion' ? (
                                                        <>
                                                            <option value="Hiện đại, sang trọng">Hiện đại, sang trọng</option>
                                                            <option value="Cổ điển, vintage">Cổ điển, vintage</option>
                                                            <option value="Thể thao, năng động">Thể thao, năng động</option>
                                                            <option value="Đường phố (Streetwear)">Đường phố (Streetwear)</option>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <option value="Hiện đại (Modern)">Hiện đại (Modern)</option>
                                                            <option value="Tối giản (Minimalist)">Tối giản (Minimalist)</option>
                                                            <option value="Bắc Âu (Scandinavian)">Bắc Âu (Scandinavian)</option>
                                                            <option value="Công nghiệp (Industrial)">Công nghiệp (Industrial)</option>
                                                        </>
                                                    )}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-foreground mb-1">
                                                    Tỉ lệ khung hình
                                                </label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {['1:1', '4:3', '16:9'].map((ratio) => (
                                                        <button
                                                            key={ratio}
                                                            onClick={() => setAspectRatio(ratio)}
                                                            className={`py-2 text-xs font-medium rounded ${aspectRatio === ratio ? 'neu-pressed text-brand-600' : 'neu-flat text-muted-foreground hover:text-foreground'}`}
                                                        >
                                                            {ratio}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <button onClick={() => setExpandedStep(2)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-green-500/20">
                                                Lưu & Tiếp tục
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Step 2 */}
                                <div className="relative pb-6 md:pb-8 border-l-2 border-border pl-6 md:pl-8">
                                    <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${expandedStep >= 2 ? 'bg-neu-bg border-green-500 text-green-500' : 'bg-muted border-muted-foreground'}`}></div>
                                    <div className="cursor-pointer" onClick={() => setExpandedStep(2)}>
                                        <h3 className={`text-sm font-bold mb-1 ${expandedStep === 2 ? 'text-green-600' : 'text-muted-foreground'}`}>
                                            {type === 'fashion' ? '2. Bối cảnh & Người mẫu' : '2. Chi tiết không gian'}
                                        </h3>
                                    </div>
                                    {expandedStep === 2 && (
                                        <div className="mt-3 md:mt-4 space-y-3">
                                            <label className="block text-xs font-bold text-foreground mb-1">
                                                {type === 'fashion' ? 'Mô tả người mẫu / Trang phục khác' : 'Mô tả tường / sàn / ánh sáng'}
                                            </label>
                                            <textarea
                                                rows={3}
                                                value={contextDescription}
                                                onChange={(e) => setContextDescription(e.target.value)}
                                                placeholder={type === 'fashion' ? "ví dụ: người mẫu nữ tóc vàng, mặc áo khoác denim" : "ví dụ: tường màu trắng kem, sàn gỗ sồi, ánh sáng tự nhiên"}
                                                className="w-full p-2.5 md:p-3 neu-pressed rounded-lg text-sm outline-none resize-none text-foreground placeholder-muted-foreground"
                                            ></textarea>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 md:p-6 neu-bg border-t border-border">
                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2.5 md:p-3 mb-3 md:mb-4 flex items-start gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 mt-0.5"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 2a10 10 0 0 1 10 10"></path><path d="M2.05 10.99A10 10 0 0 1 12 2"></path></svg>
                                    <p className="text-xs text-blue-600">Hoàn tất các bước trên để mở khóa tính năng tạo ảnh.</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={handleGenerate}
                                        disabled={isGenerating}
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 md:py-3 rounded-lg font-bold text-base md:text-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isGenerating ? (
                                            <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                                        )}
                                        {isGenerating ? 'Đang xử lý...' : 'Tạo Thiết Kế'}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Tab Content: Manual Tools */}
                    {activeTab === 'manual' && (
                        <div className="flex-1 overflow-y-auto p-4 md:p-6">
                            <div className="space-y-6 md:space-y-8">
                                {/* Basic Tools */}
                                <div>
                                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Công cụ cơ bản</h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        <button className="p-2.5 md:p-3 neu-flat rounded-lg flex flex-col items-center gap-2 hover:scale-105 transition-all">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground"><path d="M6.13 1L6 16a2 2 0 0 0 2 2h15"></path><path d="M1 8.5a2 2 0 0 0 2 2h15"></path></svg>
                                            <span className="text-[10px] md:text-xs font-medium text-foreground">Cắt (Crop)</span>
                                        </button>
                                        <button className="p-2.5 md:p-3 neu-flat rounded-lg flex flex-col items-center gap-2 hover:scale-105 transition-all">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                            <span className="text-[10px] md:text-xs font-medium text-foreground">Vẽ</span>
                                        </button>
                                        <button className="p-2.5 md:p-3 neu-flat rounded-lg flex flex-col items-center gap-2 hover:scale-105 transition-all">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground"><path d="m2.3 2.3 7.1 7.1 7.1-7.1 5.2 5.2-7.1 7.1 7.1 7.1-5.2 5.2-7.1-7.1-7.1 7.1-5.2-5.2 7.1-7.1-7.1-7.1 5.2-5.2z"></path></svg>
                                            <span className="text-[10px] md:text-xs font-medium text-foreground">Tẩy</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Adjustments */}
                                <div>
                                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Màu sắc & Ánh sáng</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-xs text-muted-foreground">Độ sáng</span>
                                                <span className="text-xs font-mono text-muted-foreground">{brightness}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="50"
                                                max="150"
                                                value={brightness}
                                                onChange={(e) => setBrightness(parseInt(e.target.value))}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-xs text-muted-foreground">Độ tương phản</span>
                                                <span className="text-xs font-mono text-muted-foreground">{contrast}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="50"
                                                max="150"
                                                value={contrast}
                                                onChange={(e) => setContrast(parseInt(e.target.value))}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Filters Mock */}
                                <div>
                                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Bộ lọc màu</h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['Vivid', 'Soft', 'B&W', 'Warm', 'Cool', 'Vintage'].map((f) => (
                                            <button key={f} className="h-12 neu-flat rounded text-xs font-medium text-foreground hover:neu-pressed">
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                    <p className="text-xs text-yellow-600">
                                        <strong>Mẹo:</strong> Dùng tab "AI Biến Hóa" để thay đổi cấu trúc vật thể. Dùng tab này để chỉnh màu sắc cuối cùng.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showImageModal && generatedImage && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="relative w-full h-full md:h-[90vh] md:w-[90vw] md:max-w-5xl bg-white md:rounded-2xl overflow-hidden">
                        <button
                            onClick={() => setShowImageModal(false)}
                            className="absolute top-4 right-4 z-20 p-2 bg-white/80 border border-gray-200 rounded-full text-gray-700 hover:bg-white md:shadow"
                            title="Đóng"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                        <img src={generatedImage} alt="Preview" className="w-full h-full object-contain" />
                    </div>
                </div>
            )}
        </div>
    );
};

export const DesignFeature: React.FC<{ initialType?: DesignType }> = ({ initialType = null }) => {
    const navigate = useNavigate();
    const [view, setView] = useState<ViewMode>(initialType ? 'project-setup' : 'selection');
    const [type, setType] = useState<DesignType>(initialType);
    const [projectName, setProjectName] = useState('');
    const [userRole, setUserRole] = useState('');
    const [designOrigin, setDesignOrigin] = useState<DesignOrigin>('upload');

    // Editor State
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Form Steps
    const [expandedStep, setExpandedStep] = useState<number>(1);

    // Form Inputs
    const [description, setDescription] = useState('');
    const [styleOption, setStyleOption] = useState('');
    const [contextDescription, setContextDescription] = useState('');
    const [secondaryImage, setSecondaryImage] = useState<string | null>(null);
    const [aspectRatio, setAspectRatio] = useState<string>("1:1");

    // --- Handlers ---

    const handleSecondaryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const url = URL.createObjectURL(e.target.files[0]);
            setSecondaryImage(url);
        }
    };

    const handleTypeSelect = (selectedType: DesignType) => {
        setType(selectedType);
        setView('project-setup');
    };

    const handleCreateProject = () => {
        if (projectName.trim()) {
            setView('mode-selection');
        }
    };

    const handleModeSelect = (mode: DesignOrigin) => {
        setDesignOrigin(mode);
        if (mode === 'generated') {
            setView('creation');
        } else {
            setView('editor');
        }
    };

    const handleCreationSuccess = (imageUrl: string) => {
        setOriginalImage(imageUrl);
        setGeneratedImage(null); // Prepare for editing
        setView('editor');
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const url = URL.createObjectURL(e.target.files[0]);
            setOriginalImage(url);
            // Reset generated image when new original is uploaded
            setGeneratedImage(null);
        }
    };

    const handleGenerate = async () => {
        if (!originalImage) {
            alert("Vui lòng tải lên hoặc tạo ảnh gốc trước.");
            return;
        }
        if (!description && !contextDescription) {
            alert("Vui lòng nhập mô tả yêu cầu thiết kế.");
            return;
        }

        setIsGenerating(true);
        setGeneratedImage(null);

        try {
            const base64Data = await blobToBase64(originalImage);
            const parts: any[] = [
                {
                    inlineData: {
                        mimeType: 'image/jpeg',
                        data: base64Data
                    }
                }
            ];

            if (secondaryImage) {
                const secondaryBase64 = await blobToBase64(secondaryImage);
                parts.push({
                    inlineData: {
                        mimeType: 'image/jpeg',
                        data: secondaryBase64
                    }
                });
            }

            // Construct a specific prompt for the model
            let promptText = "";
            if (type === 'fashion') {
                promptText = `Đây là ảnh gốc của một người mẫu. Hãy TẠO RA MỘT HÌNH ẢNH MỚI dựa trên dáng người này. Người mẫu đang mặc/đeo sản phẩm: ${description}. Phong cách: ${styleOption}. Bối cảnh: ${contextDescription}. Tỉ lệ khung hình: ${aspectRatio}. Giữ nguyên tư thế, nhưng hãy render lại trang phục và ánh sáng thật tự nhiên, không cắt ghép.`;
            } else {
                promptText = `Hãy phân tích bố cục không gian, góc nhìn và cấu trúc tường/cửa của ảnh gốc. Dựa trên cấu trúc đó, hãy **TẠO RA MỘT HÌNH ẢNH MỚI HOÀN TOÀN** (Render lại từ đầu) cho căn phòng này.
                
                Yêu cầu thiết kế:
                - Phong cách: ${styleOption}
                - Nội thất chính: ${description}
                - Chi tiết không gian: ${contextDescription}
                - Tỉ lệ khung hình: ${aspectRatio}

                QUAN TRỌNG:
                1. Giữ nguyên góc nhìn và cấu trúc không gian của ảnh gốc.
                2. KHÔNG được cắt ghép đè lên ảnh cũ. Hãy vẽ lại toàn bộ không gian sao cho ánh sáng, bóng đổ và vật liệu trông thật nhất (photorealistic).`;
            }

            if (secondaryImage) {
                promptText += " Sử dụng ảnh thứ hai làm tham khảo cho phong cách hoặc chi tiết sản phẩm.";
            }

            parts.push({ text: promptText });

            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash-exp',
                contents: {
                    parts: parts
                },
                config: {
                    responseModalities: [Modality.IMAGE],
                    systemInstruction: LOCAITH_SYSTEM_PROMPT
                }
            });

            // Extract image
            const resParts = response.candidates?.[0]?.content?.parts;
            if (resParts && resParts.length > 0) {
                for (const part of resParts) {
                    if (part.inlineData) {
                        const base64ImageBytes = part.inlineData.data;
                        const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                        setGeneratedImage(imageUrl);
                        break;
                    }
                }
            } else {
                alert("Không thể tạo ảnh. Vui lòng thử lại với mô tả khác.");
            }

        } catch (error) {
            console.error("Generation error:", error);
            alert("Đã xảy ra lỗi khi kết nối với AI. Vui lòng thử lại.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="h-full neu-bg relative animate-fade-in-up">
            {view === 'selection' && <SelectionView onSelect={handleTypeSelect} />}

            {view === 'project-setup' && (
                <SetupView
                    projectName={projectName}
                    setProjectName={setProjectName}
                    userRole={userRole}
                    setUserRole={setUserRole}
                    onBack={() => initialType ? navigate(-1) : setView('selection')}
                    onCreate={handleCreateProject}
                    showBackButton={!initialType}
                />
            )}

            {view === 'mode-selection' && type && (
                <ModeSelectionView
                    type={type}
                    onSelectMode={handleModeSelect}
                    onBack={() => setView('project-setup')}
                />
            )}

            {view === 'creation' && type && (
                <CreationView
                    type={type}
                    onSuccess={handleCreationSuccess}
                    onBack={() => setView('mode-selection')}
                />
            )}

            {view === 'editor' && type && (
                <EditorView
                    type={type}
                    origin={designOrigin}
                    projectName={projectName}
                    onBack={() => designOrigin === 'generated' ? setView('creation') : setView('mode-selection')}
                    originalImage={originalImage}
                    handleImageUpload={handleImageUpload}
                    generatedImage={generatedImage}
                    isGenerating={isGenerating}
                    handleGenerate={handleGenerate}
                    expandedStep={expandedStep}
                    setExpandedStep={setExpandedStep}
                    description={description}
                    setDescription={setDescription}
                    styleOption={styleOption}
                    setStyleOption={setStyleOption}
                    contextDescription={contextDescription}
                    setContextDescription={setContextDescription}
                    secondaryImage={secondaryImage}
                    handleSecondaryImageUpload={handleSecondaryImageUpload}
                    aspectRatio={aspectRatio}
                    setAspectRatio={setAspectRatio}
                />
            )}
        </div>
    );
};
