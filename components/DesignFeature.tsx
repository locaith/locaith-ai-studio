
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

type ViewMode = 'selection' | 'project-setup' | 'interior-mode-selection' | 'interior-creation' | 'editor';
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
    <div className="flex flex-col items-center justify-center h-full p-8 animate-fade-in-up">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Bạn muốn thiết kế gì hôm nay?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
            <button 
            onClick={() => onSelect('fashion')}
            className="group relative h-80 bg-white rounded-2xl border border-gray-200 hover:border-brand-500 shadow-lg overflow-hidden transition-all hover:-translate-y-1"
            >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10"></div>
                <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Fashion" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute bottom-0 left-0 p-8 z-20 text-left">
                    <h3 className="text-2xl font-bold text-white mb-2">Thời Trang & Phụ Kiện</h3>
                    <p className="text-gray-200 text-sm">Thiết kế quần áo, mắt kính trên người mẫu thật.</p>
                </div>
            </button>
            
            <button 
            onClick={() => onSelect('interior')}
            className="group relative h-80 bg-white rounded-2xl border border-gray-200 hover:border-brand-500 shadow-lg overflow-hidden transition-all hover:-translate-y-1"
            >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10"></div>
                <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Interior" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute bottom-0 left-0 p-8 z-20 text-left">
                    <h3 className="text-2xl font-bold text-white mb-2">Nội Thất & Kiến Trúc</h3>
                    <p className="text-gray-200 text-sm">Biến đổi không gian, sắp xếp nội thất phòng ốc.</p>
                </div>
            </button>
        </div>
    </div>
);

const SetupView: React.FC<{ 
    projectName: string; 
    setProjectName: (name: string) => void; 
    onBack: () => void; 
    onCreate: () => void 
}> = ({ projectName, setProjectName, onBack, onCreate }) => (
    <div className="flex flex-col items-center justify-center h-full p-8 animate-fade-in-up">
        <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full">
            <button onClick={onBack} className="text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-2 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                Quay lại
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Đặt tên dự án mới</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên dự án</label>
                    <input 
                    type="text" 
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Ví dụ: Bộ sưu tập Hè 2025, Phòng khách Vinhome..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    autoFocus
                    />
                </div>
                <button 
                onClick={onCreate}
                disabled={!projectName.trim()}
                className="w-full py-3 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-500 disabled:opacity-50 transition-colors"
                >
                    Tiếp theo
                </button>
            </div>
        </div>
    </div>
);

const InteriorModeSelectionView: React.FC<{ 
    onSelectMode: (mode: DesignOrigin) => void;
    onBack: () => void;
}> = ({ onSelectMode, onBack }) => (
    <div className="flex flex-col items-center justify-center h-full p-8 animate-fade-in-up">
        <button onClick={onBack} className="absolute top-8 left-8 text-gray-500 hover:text-gray-900 flex items-center gap-2">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
             Quay lại
        </button>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Bắt đầu thiết kế nội thất</h2>
        <p className="text-gray-500 mb-10">Bạn muốn bắt đầu như thế nào?</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full">
             <button 
                onClick={() => onSelectMode('upload')}
                className="p-8 bg-white border border-gray-200 rounded-2xl hover:border-brand-500 hover:shadow-xl transition-all text-left group"
             >
                 <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 mb-2">Tải ảnh hiện trạng</h3>
                 <p className="text-gray-500 text-sm">Sử dụng ảnh chụp phòng ốc thật của bạn để chỉnh sửa, thay đổi nội thất.</p>
             </button>

             <button 
                onClick={() => onSelectMode('generated')}
                className="p-8 bg-white border border-gray-200 rounded-2xl hover:border-brand-500 hover:shadow-xl transition-all text-left group"
             >
                 <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 mb-2">Tạo thiết kế mới (AI)</h3>
                 <p className="text-gray-500 text-sm">Chưa có ảnh? Hãy mô tả ý tưởng để AI tạo ra không gian mẫu cho bạn.</p>
             </button>
        </div>
    </div>
);

const InteriorCreationView: React.FC<{
    onSuccess: (imageUrl: string) => void;
    onBack: () => void;
}> = ({ onSuccess, onBack }) => {
    const [prompt, setPrompt] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async () => {
        if (!prompt.trim()) return;
        setIsCreating(true);
        try {
            // Use Gemini to generate the initial base image
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                  parts: [{ text: `Tạo một hình ảnh nội thất thực tế, chất lượng cao với mô tả: ${prompt}. Đảm bảo ánh sáng tốt và góc nhìn rộng.` }],
                },
                config: {
                    responseModalities: [Modality.IMAGE],
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
        <div className="flex flex-col items-center justify-center h-full p-8 animate-fade-in-up">
             <button onClick={onBack} className="absolute top-8 left-8 text-gray-500 hover:text-gray-900 flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                 Quay lại
            </button>
            <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-200 max-w-2xl w-full">
                <div className="flex items-center gap-3 mb-6">
                     <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 2a10 10 0 0 1 10 10"></path><path d="M2.05 10.99A10 10 0 0 1 12 2"></path></svg>
                     </div>
                     <h2 className="text-2xl font-bold text-gray-900">Khởi tạo không gian</h2>
                </div>
                
                <p className="text-gray-600 mb-4 text-sm">Mô tả căn phòng mơ ước của bạn để AI tạo bản phác thảo đầu tiên.</p>
                
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ví dụ: Một phòng khách hiện đại với cửa sổ lớn nhìn ra biển, sofa màu kem, sàn gỗ sáng màu..."
                    className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none resize-none mb-6 text-base"
                />

                <button 
                    onClick={handleCreate}
                    disabled={isCreating || !prompt.trim()}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isCreating ? (
                        <>
                            <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
                            Đang vẽ...
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
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
}

const EditorView: React.FC<EditorViewProps> = ({
    type, origin, projectName, onBack, originalImage, handleImageUpload, generatedImage,
    isGenerating, handleGenerate, expandedStep, setExpandedStep,
    description, setDescription, styleOption, setStyleOption,
    contextDescription, setContextDescription
}) => {
    const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);

    const [showImageModal, setShowImageModal] = useState(false);
    return (
    <div className="flex h-full bg-gray-50 flex-col md:flex-row">
        {/* Header Navigation */}
        <div className="absolute top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-20">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="text-gray-500 hover:text-gray-900">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                </button>
                <div className="flex flex-col">
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">{type === 'fashion' ? 'Thiết kế Thời trang' : 'Thiết kế Nội thất'}</span>
                        <span className="text-sm font-bold text-gray-900">{projectName}</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button className="px-4 py-1.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Lưu dự án</button>
                <button className="p-2 text-gray-500 hover:text-gray-900"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg></button>
            </div>
        </div>

        <div className="pt-14 flex w-full h-full">
            {/* LEFT: Upload & Preview */}
            <div className="w-1/4 bg-white border-r border-gray-200 p-6 flex flex-col">
                    <div className="text-sm font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">
                        {origin === 'generated' ? 'Ảnh nguồn (AI Generated)' : 'Ảnh gốc (Input)'}
                    </div>
                    <div className="flex-1 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden hover:border-brand-500 transition-colors group bg-gray-50">
                        {originalImage ? (
                            <>
                                <img src={originalImage} alt="Original" className="w-full h-full object-contain p-2" />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <label className="cursor-pointer px-4 py-2 bg-white text-gray-900 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors">
                                        {origin === 'generated' ? 'Thay bằng ảnh khác' : 'Tải ảnh khác'}
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                    </label>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                </div>
                                <div className="text-center px-4">
                                    <p className="text-green-600 font-bold mb-1 cursor-pointer">Tải ảnh lên</p>
                                    <p className="text-gray-500 text-xs">hoặc kéo thả vào đây</p>
                                    <p className="text-gray-400 text-[10px] mt-2">Hỗ trợ mọi định dạng ảnh phổ biến.</p>
                                </div>
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleImageUpload} />
                            </>
                        )}
                    </div>
            </div>

            {/* CENTER: Result Preview */}
            <div className="flex-1 bg-gray-100 p-8 flex items-center justify-center relative">
                    <div className="bg-white w-full max-w-2xl aspect-square rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center overflow-hidden relative">
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
                                <div className="text-center p-8">
                                    {isGenerating ? (
                                        <div className="flex flex-col items-center">
                                            <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                            <p className="text-gray-500 font-medium animate-pulse">AI đang thiết kế...</p>
                                            <p className="text-xs text-gray-400 mt-2">Quá trình này có thể mất vài giây</p>
                                        </div>
                                    ) : (
                                        <p className="text-gray-400 flex items-center gap-2">
                                            <span>💫</span> Đừng quên bấm "Tạo Thiết Kế" để xem phép màu tại đây!
                                        </p>
                                    )}
                                </div>
                        )}
                    </div>
                    
                    {/* Floating Tools */}
                    {generatedImage && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg border border-gray-200 p-1 flex flex-col gap-1 animate-fade-in-up z-10">
                            <a href={generatedImage} download={`design-${projectName}.png`} className="p-3 text-gray-500 hover:text-brand-600 hover:bg-gray-50 rounded-lg flex flex-col items-center gap-1" title="Tải xuống">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            </a>
                            <div className="w-full h-px bg-gray-200 my-1"></div>
                            <button className="p-3 text-gray-500 hover:text-brand-600 hover:bg-gray-50 rounded-lg" title="Undo"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path></svg></button>
                            <button className="p-3 text-gray-500 hover:text-brand-600 hover:bg-gray-50 rounded-lg" title="Redo"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"></path><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"></path></svg></button>
                        </div>
                    )}
            </div>

            {/* RIGHT: Editor Tools */}
            <div className="w-full md:w-1/3 bg-white border-t md:border-t-0 md:border-l border-gray-200 flex flex-col">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-200">
                        <button 
                            onClick={() => setActiveTab('ai')}
                            className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition-colors ${activeTab === 'ai' ? 'border-emerald-500 text-emerald-600 bg-emerald-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            AI Biến Hóa
                        </button>
                        <button 
                            onClick={() => setActiveTab('manual')}
                            className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition-colors ${activeTab === 'manual' ? 'border-blue-500 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Thủ Công
                        </button>
                    </div>
                    
                    {/* Tab Content: AI */}
                    {activeTab === 'ai' && (
                    <>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="text-xs text-gray-400 mb-2">Sử dụng AI để thay đổi thiết kế dựa trên mô tả.</div>
                            
                            {/* Step 1 */}
                            <div className="relative pb-8 border-l-2 border-gray-200 pl-8">
                                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${expandedStep >= 1 ? 'bg-white border-green-500 text-green-500' : 'bg-gray-200 border-gray-300'}`}>
                                    {expandedStep > 1 && <div className="w-full h-full bg-green-500 rounded-full scale-50"></div>}
                                </div>
                                <div className="cursor-pointer" onClick={() => setExpandedStep(1)}>
                                    <h3 className={`text-sm font-bold mb-1 ${expandedStep === 1 ? 'text-green-600' : 'text-gray-500'}`}>
                                        {type === 'fashion' ? '1. Chi tiết sản phẩm' : '1. Đồ nội thất chính'}
                                    </h3>
                                    <p className="text-xs text-gray-500 mb-4">Mô tả vật thể chính bạn muốn thêm vào ảnh.</p>
                                </div>
                                
                                {expandedStep === 1 && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">
                                                {type === 'fashion' ? 'Mô tả Kính / Quần áo' : 'Mô tả Đồ nội thất'} <span className="text-red-500">*</span>
                                            </label>
                                            <input 
                                                type="text" 
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                placeholder={type === 'fashion' ? "ví dụ: kính râm đen gọng vuông" : "ví dụ: ghế sofa da màu nâu"} 
                                                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-brand-500 outline-none" 
                                                autoFocus
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">
                                                {type === 'fashion' ? "Kiểu dáng / Form" : "Phong cách thiết kế"}
                                            </label>
                                            <select 
                                                value={styleOption}
                                                onChange={(e) => setStyleOption(e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white outline-none"
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

                                        <button onClick={() => setExpandedStep(2)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                                            Lưu & Tiếp tục
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Step 2 */}
                            <div className="relative pb-8 border-l-2 border-gray-200 pl-8">
                                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${expandedStep >= 2 ? 'bg-white border-green-500 text-green-500' : 'bg-gray-200 border-gray-300'}`}></div>
                                <div className="cursor-pointer" onClick={() => setExpandedStep(2)}>
                                    <h3 className={`text-sm font-bold mb-1 ${expandedStep === 2 ? 'text-green-600' : 'text-gray-500'}`}>
                                        {type === 'fashion' ? '2. Bối cảnh & Người mẫu' : '2. Chi tiết không gian'}
                                    </h3>
                                </div>
                                {expandedStep === 2 && (
                                    <div className="mt-4 space-y-3">
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            {type === 'fashion' ? 'Mô tả người mẫu / Trang phục khác' : 'Mô tả tường / sàn / ánh sáng'}
                                        </label>
                                        <textarea 
                                            rows={3} 
                                            value={contextDescription}
                                            onChange={(e) => setContextDescription(e.target.value)}
                                            placeholder={type === 'fashion' ? "ví dụ: người mẫu nữ tóc vàng, mặc áo khoác denim" : "ví dụ: tường màu trắng kem, sàn gỗ sồi, ánh sáng tự nhiên"}
                                            className="w-full p-3 border border-gray-300 rounded-lg text-sm outline-none resize-none"
                                        ></textarea>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 bg-white border-t border-gray-200">
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 flex items-start gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 mt-0.5"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 2a10 10 0 0 1 10 10"></path><path d="M2.05 10.99A10 10 0 0 1 12 2"></path></svg>
                                <p className="text-xs text-blue-800">Hoàn tất các bước trên để mở khóa tính năng tạo ảnh.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="space-y-8">
                                {/* Basic Tools */}
                                <div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Công cụ cơ bản</h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        <button className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex flex-col items-center gap-2 hover:bg-gray-100 hover:border-brand-500 transition-all">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6.13 1L6 16a2 2 0 0 0 2 2h15"></path><path d="M1 8.5a2 2 0 0 0 2 2h15"></path></svg>
                                            <span className="text-xs font-medium text-gray-700">Cắt (Crop)</span>
                                        </button>
                                        <button className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex flex-col items-center gap-2 hover:bg-gray-100 hover:border-brand-500 transition-all">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                            <span className="text-xs font-medium text-gray-700">Vẽ</span>
                                        </button>
                                        <button className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex flex-col items-center gap-2 hover:bg-gray-100 hover:border-brand-500 transition-all">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2.3 2.3 7.1 7.1 7.1-7.1 5.2 5.2-7.1 7.1 7.1 7.1-5.2 5.2-7.1-7.1-7.1 7.1-5.2-5.2 7.1-7.1-7.1-7.1 5.2-5.2z"></path></svg>
                                            <span className="text-xs font-medium text-gray-700">Tẩy</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Adjustments */}
                                <div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Màu sắc & Ánh sáng</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-xs text-gray-600">Độ sáng</span>
                                                <span className="text-xs font-mono text-gray-500">{brightness}%</span>
                                            </div>
                                            <input 
                                                type="range" 
                                                min="50" 
                                                max="150" 
                                                value={brightness} 
                                                onChange={(e) => setBrightness(parseInt(e.target.value))}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-xs text-gray-600">Độ tương phản</span>
                                                <span className="text-xs font-mono text-gray-500">{contrast}%</span>
                                            </div>
                                            <input 
                                                type="range" 
                                                min="50" 
                                                max="150" 
                                                value={contrast} 
                                                onChange={(e) => setContrast(parseInt(e.target.value))}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Filters Mock */}
                                <div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Bộ lọc màu</h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['Vivid', 'Soft', 'B&W', 'Warm', 'Cool', 'Vintage'].map((f) => (
                                            <button key={f} className="h-12 bg-gray-100 rounded border border-transparent hover:border-brand-500 text-xs font-medium text-gray-600">
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
                                    <p className="text-xs text-yellow-700">
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

export const DesignFeature: React.FC = () => {
  const [view, setView] = useState<ViewMode>('selection');
  const [type, setType] = useState<DesignType>(null);
  const [projectName, setProjectName] = useState('');
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

  // --- Handlers ---

  const handleTypeSelect = (selectedType: DesignType) => {
      setType(selectedType);
      setView('project-setup');
  };

  const handleCreateProject = () => {
      if (projectName.trim()) {
          if (type === 'interior') {
              setView('interior-mode-selection');
          } else {
              setDesignOrigin('upload');
              setView('editor');
          }
      }
  };

  const handleInteriorModeSelect = (mode: DesignOrigin) => {
      setDesignOrigin(mode);
      if (mode === 'generated') {
          setView('interior-creation');
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
          
          // Construct a specific prompt for the model
          let promptText = "";
          if (type === 'fashion') {
              promptText = `Đây là ảnh gốc của một người mẫu. Hãy chỉnh sửa ảnh này để người mẫu mặc/đeo sản phẩm sau: ${description}. Phong cách: ${styleOption}. Bối cảnh/Môi trường: ${contextDescription}. Giữ nguyên tư thế và khuôn mặt người mẫu, chỉ thay đổi trang phục/phụ kiện và nền nếu được yêu cầu. Đảm bảo ảnh trông thật và chất lượng cao.`;
          } else {
              promptText = `Đây là ảnh gốc của một căn phòng. Hãy thiết kế lại nội thất căn phòng này theo phong cách: ${styleOption}. Chi tiết đồ nội thất: ${description}. Chi tiết không gian: ${contextDescription}. Giữ nguyên cấu trúc tường và cửa sổ, chỉ thay đổi nội thất và trang trí. Đảm bảo ảnh trông thật và chất lượng cao.`;
          }

          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash-image',
              contents: {
                  parts: [
                      {
                          inlineData: {
                              mimeType: 'image/jpeg', // Assuming JPEG for simplicity, ideally detect mime
                              data: base64Data
                          }
                      },
                      { text: promptText }
                  ]
              },
              config: {
                  responseModalities: [Modality.IMAGE],
              }
          });

          // Extract image
          const parts = response.candidates?.[0]?.content?.parts;
          if (parts && parts.length > 0) {
              for (const part of parts) {
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
      <div className="h-full bg-white/90 backdrop-blur-sm relative animate-fade-in-up">
          {view === 'selection' && <SelectionView onSelect={handleTypeSelect} />}
          
          {view === 'project-setup' && (
            <SetupView 
                projectName={projectName}
                setProjectName={setProjectName}
                onBack={() => setView('selection')}
                onCreate={handleCreateProject}
            />
          )}
          
          {view === 'interior-mode-selection' && (
              <InteriorModeSelectionView 
                onSelectMode={handleInteriorModeSelect}
                onBack={() => setView('project-setup')}
              />
          )}

          {view === 'interior-creation' && (
              <InteriorCreationView 
                onSuccess={handleCreationSuccess}
                onBack={() => setView('interior-mode-selection')}
              />
          )}

          {view === 'editor' && (
            <EditorView 
                type={type}
                origin={designOrigin}
                projectName={projectName}
                onBack={() => setView('selection')}
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
            />
          )}
      </div>
  );
};
