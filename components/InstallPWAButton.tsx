import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Download, Share, PlusSquare, ArrowUpFromLine } from 'lucide-react';

export const InstallPWAButton = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);

    useEffect(() => {
        // Check if already installed
        const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        setIsStandalone(isStandaloneMode);

        // Detect iOS
        const ua = window.navigator.userAgent;
        const isIPad = ua.match(/iPad/i);
        const isIPhone = ua.match(/iPhone/i);
        setIsIOS(!!(isIPad || isIPhone));

        // Capture Android prompt
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    if (isStandalone) return null;

    // Show button if we have a prompt (Android) OR it's iOS (manual instructions)
    // For Desktop without PWA support, we generally hide it, but here we focus on mobile as requested.
    // If neither, return null (e.g. desktop non-chrome, or already installed)
    if (!deferredPrompt && !isIOS) return null;

    const handleInstallClick = () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult: any) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                }
                setDeferredPrompt(null);
            });
        } else if (isIOS) {
            setShowIOSInstructions(true);
        }
    };

    return (
        <>
            <Button 
                size="sm" 
                className="gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 h-8 rounded-full px-3 shadow-md border-0 shrink-0"
                onClick={handleInstallClick}
            >
                <Download className="w-3.5 h-3.5" />
                <span className="font-bold text-[10px] md:text-xs">Download</span>
            </Button>

            <Dialog open={showIOSInstructions} onOpenChange={setShowIOSInstructions}>
                <DialogContent className="max-w-[90%] w-[350px] rounded-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-center text-xl font-bold">Cài đặt ứng dụng</DialogTitle>
                        <DialogDescription className="text-center text-sm mt-2">
                            Cài đặt Locaith AI Studio để truy cập nhanh hơn và có trải nghiệm tốt nhất.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 mt-4 text-sm bg-secondary/30 p-4 rounded-xl">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-background rounded-lg shadow-sm shrink-0">
                                <Share className="w-5 h-5 text-blue-500" />
                                {/* iOS often uses a square with arrow up, let's use Share or ArrowUpFromLine if Share is ambiguous, but Share is standard icon name in lucide for the generic share action usually. Actually iOS share icon is a box with arrow up. Lucide 'Share' is a curve arrow. 'Share2' is dots. 'ArrowUpFromLine' looks more like it or 'Upload'. Let's stick to Share as generic or maybe create a custom SVG if needed. But for now Lucide Share is fine, or maybe 'SquareArrowUp' if it exists? 'Share' in lucide is the curved arrow. 'Share2' is the node graph. 'ArrowUpSquare' might be close. 'Share' is commonly understood. */}
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-foreground">Bước 1</p>
                                <p className="text-muted-foreground text-xs">Nhấn vào nút <span className="font-bold text-foreground">Chia sẻ</span> ở thanh công cụ phía dưới trình duyệt.</p>
                            </div>
                        </div>
                        <div className="w-full h-px bg-border/50"></div>
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-background rounded-lg shadow-sm shrink-0">
                                <PlusSquare className="w-5 h-5 text-foreground" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-foreground">Bước 2</p>
                                <p className="text-muted-foreground text-xs">Chọn <span className="font-bold text-foreground">Thêm vào MH chính</span> (Add to Home Screen) từ menu.</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center mt-2">
                        <Button variant="ghost" size="sm" onClick={() => setShowIOSInstructions(false)}>Đã hiểu</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};
