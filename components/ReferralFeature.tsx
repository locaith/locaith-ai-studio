import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Copy, Share2, QrCode, 
  Users, Gift, CheckCircle2, ArrowRight,
  Sparkles, Wallet, History
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export const ReferralFeature = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const referralCode = "LCT-8839";
  const referralLink = `https://locaith.com/ref/${referralCode}`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stepsForReferrer = [
    {
      step: 1,
      title: "Gửi lời mời",
      desc: "Chia sẻ mã giới thiệu hoặc đường link cho bạn bè qua mạng xã hội."
    },
    {
      step: 2,
      title: "Bạn bè đăng ký",
      desc: "Bạn bè tạo tài khoản Locaith và nhập mã giới thiệu của bạn."
    },
    {
      step: 3,
      title: "Nhận thưởng ngay",
      desc: "Nhận 500 Credits khi bạn bè hoàn thành xác minh tài khoản."
    }
  ];

  const stepsForReferee = [
    {
      step: 1,
      title: "Tải & Đăng ký",
      desc: "Truy cập Locaith Studio và tạo tài khoản mới."
    },
    {
      step: 2,
      title: "Nhập mã giới thiệu",
      desc: `Nhập mã "${referralCode}" tại bước đăng ký hoặc trong mục Cài đặt.`
    },
    {
      step: 3,
      title: "Nhận quà chào mừng",
      desc: "Nhận ngay gói Starter Pack trị giá 150.000đ và 200 Credits."
    }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between p-4 h-14">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 -ml-2" 
              onClick={() => navigate(-1)}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-lg font-bold leading-none">Giới thiệu bạn bè</h1>
          </div>
          <Button variant="ghost" size="sm" className="text-xs font-medium text-primary">
            Lịch sử giới thiệu
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="pb-20">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 pb-12 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
                
                <div className="relative z-10 text-center space-y-2">
                    <div className="bg-white/20 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center backdrop-blur-sm mb-4 shadow-lg border border-white/20">
                        <Gift className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold">Mời bạn thêm vui</h2>
                    <p className="text-white/90 text-sm max-w-[280px] mx-auto leading-relaxed">
                        Nhận ngay <span className="font-bold text-yellow-300">500 Credits</span> cho mỗi lượt giới thiệu thành công. Không giới hạn số lượng!
                    </p>
                </div>
            </div>

            <div className="-mt-8 px-4 relative z-20 space-y-6">
                {/* Stats Card */}
                <Card className="p-4 grid grid-cols-2 divide-x divide-border shadow-lg border-0">
                    <div className="text-center px-2">
                        <div className="text-xs text-muted-foreground font-medium mb-1">Đã chia sẻ</div>
                        <div className="text-xl font-bold text-foreground">12 <span className="text-xs font-normal text-muted-foreground">lần</span></div>
                    </div>
                    <div className="text-center px-2">
                        <div className="text-xs text-muted-foreground font-medium mb-1">Đã giới thiệu</div>
                        <div className="text-xl font-bold text-emerald-600">3 <span className="text-xs font-normal text-muted-foreground">bạn</span></div>
                    </div>
                </Card>

                {/* Referral Code Action Area */}
                <div className="space-y-4">
                    <div className="bg-background rounded-2xl p-6 border border-dashed border-primary/30 shadow-sm text-center space-y-4 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-primary/5 pattern-grid-lg opacity-50"></div>
                        
                        <div className="relative">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">Mã giới thiệu của bạn</p>
                            <div className="flex items-center justify-center gap-3">
                                <span className="text-3xl font-black tracking-widest text-primary font-mono">{referralCode}</span>
                                <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                                    onClick={() => handleCopy(referralCode)}
                                >
                                    {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 relative z-10 pt-2">
                            <Button 
                                className="w-full bg-primary hover:bg-primary/90 font-bold shadow-md shadow-primary/20"
                                onClick={() => handleCopy(referralLink)}
                            >
                                <Share2 className="w-4 h-4 mr-2" />
                                Chia sẻ Link
                            </Button>
                            
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="w-full border-primary/20 hover:bg-primary/5 hover:text-primary font-bold">
                                        <QrCode className="w-4 h-4 mr-2" />
                                        Mã QR
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md flex flex-col items-center p-8">
                                    <h3 className="text-lg font-bold mb-4">Quét mã để tải App</h3>
                                    <div className="bg-white p-4 rounded-xl shadow-inner border">
                                        {/* Mock QR Code */}
                                        <div className="w-48 h-48 bg-slate-900 pattern-dots flex items-center justify-center text-white/50 text-xs">
                                            [QR Code Placeholder]
                                        </div>
                                    </div>
                                    <p className="text-sm text-center text-muted-foreground mt-4 max-w-[200px]">
                                        Người được giới thiệu quét mã này để tải ứng dụng và nhận quà.
                                    </p>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>

                {/* Instructions Tabs */}
                <div className="space-y-4">
                    <h3 className="font-bold text-lg">Cách nhận phần thưởng</h3>
                    <Tabs defaultValue="referrer" className="w-full">
                        <TabsList className="w-full h-12 p-1 bg-secondary/50 rounded-xl grid grid-cols-2 mb-4">
                            <TabsTrigger 
                                value="referrer" 
                                className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg h-full font-bold text-xs uppercase"
                            >
                                Dành cho bạn
                            </TabsTrigger>
                            <TabsTrigger 
                                value="referee"
                                className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg h-full font-bold text-xs uppercase"
                            >
                                Người được giới thiệu
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="referrer" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                            {stepsForReferrer.map((step, index) => (
                                <div key={index} className="flex gap-4 p-4 rounded-xl bg-background border border-border/50 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/20"></div>
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                                        {step.step}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm mb-1">{step.title}</h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </TabsContent>

                        <TabsContent value="referee" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                            {stepsForReferee.map((step, index) => (
                                <div key={index} className="flex gap-4 p-4 rounded-xl bg-background border border-border/50 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/20"></div>
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                                        {step.step}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm mb-1">{step.title}</h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Footer Policy Link */}
                <div className="text-center pb-4">
                    <Button variant="link" className="text-xs text-muted-foreground h-auto p-0 hover:text-primary">
                        Điều khoản và điều kiện chương trình
                    </Button>
                </div>
            </div>
        </div>
      </ScrollArea>
    </div>
  );
};
