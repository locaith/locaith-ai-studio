import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Crown, Star, Shield, Zap, 
  Gift, History, FileText, ChevronRight, Gem,
  CheckCircle2, Sparkles
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export const MembershipTierFeature = () => {
  const navigate = useNavigate();
  const [activeTier, setActiveTier] = useState("gold");

  // Mock user current status
  const currentStatus = {
    tier: "Gold",
    points: 1250,
    nextTier: "Platinum",
    pointsNeeded: 750
  };

  const tiers = {
    silver: {
      id: "silver",
      name: "Silver",
      color: "from-slate-300 to-slate-400",
      textColor: "text-slate-300",
      icon: <Shield className="w-6 h-6" />,
      benefits: [
        "Tích lũy 1% giá trị giao dịch thành Credits",
        "Truy cập các công cụ AI cơ bản",
        "Hỗ trợ kỹ thuật qua Email trong 24h",
        "Tham gia cộng đồng Locaith Basic"
      ]
    },
    gold: {
      id: "gold",
      name: "Gold",
      color: "from-yellow-400 to-yellow-600",
      textColor: "text-yellow-400",
      icon: <Crown className="w-6 h-6" />,
      benefits: [
        "Tích lũy 2% giá trị giao dịch thành Credits",
        "Giảm 5% khi mua gói Credits bổ sung",
        "Truy cập sớm các tính năng Beta (Voice/Design)",
        "Hỗ trợ ưu tiên qua Chat trực tuyến",
        "Quà tặng sinh nhật 500 Credits"
      ]
    },
    platinum: {
      id: "platinum",
      name: "Platinum",
      color: "from-cyan-400 to-blue-600",
      textColor: "text-cyan-400",
      icon: <Gem className="w-6 h-6" />,
      benefits: [
        "Tích lũy 4% giá trị giao dịch thành Credits",
        "Giảm 10% trọn đời các dịch vụ Locaith",
        "Quyền truy cập API riêng biệt (Rate limit x2)",
        "Chuyên viên hỗ trợ 1-1 (Account Manager)",
        "Vé mời sự kiện Locaith Tech Summit hàng năm"
      ]
    },
    diamond: {
      id: "diamond",
      name: "Diamond",
      color: "from-slate-900 via-purple-900 to-slate-900 border-purple-500/50",
      textColor: "text-purple-400",
      icon: <Sparkles className="w-6 h-6" />,
      benefits: [
        "Tích lũy 6% giá trị giao dịch thành Credits",
        "Miễn phí 1 gói dịch vụ Enterprise bất kỳ",
        "Quyền lợi cổ đông danh dự (nếu đủ điều kiện)",
        "Đặc quyền yêu cầu tính năng riêng (Custom Feature)",
        "Mọi quyền lợi của hạng Platinum"
      ]
    }
  };

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
            <h1 className="text-lg font-bold leading-none">Hạng thành viên</h1>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="pb-20">
            {/* Hero Section - Current Status */}
            <div className="bg-[#1a1a1a] text-white pt-6 pb-12 px-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 text-center space-y-2">
                    <h2 className={cn("text-3xl font-black tracking-tight", tiers[currentStatus.tier.toLowerCase() as keyof typeof tiers].textColor)}>
                        {currentStatus.tier}
                    </h2>
                    <div className="flex flex-col items-center">
                        <span className="text-sm text-gray-400 font-medium">Credits khả dụng</span>
                        <div className="flex items-center gap-2 mt-1">
                             <div className="bg-yellow-500/20 p-1 rounded-full">
                                <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                             </div>
                             <span className="text-2xl font-bold">{currentStatus.points}</span>
                        </div>
                    </div>
                </div>

                {/* Card Visualization */}
                <div className="mt-8 mx-auto max-w-sm relative group perspective-1000">
                    <div className={cn(
                        "relative h-56 rounded-2xl p-6 shadow-2xl transition-transform duration-500 preserve-3d group-hover:rotate-y-6",
                        "bg-gradient-to-br border border-white/10",
                        tiers[activeTier as keyof typeof tiers].color
                    )}>
                        {/* Card Content */}
                        <div className="flex flex-col justify-between h-full relative z-10">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center">
                                        {tiers[activeTier as keyof typeof tiers].icon}
                                    </div>
                                    <span className="font-bold text-lg text-white tracking-widest uppercase">Locaith</span>
                                </div>
                                <span className="font-mono text-white/80 text-sm">No. 8839 1029</span>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="w-full h-12 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 opacity-50"></div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <div className="text-[10px] text-white/60 uppercase tracking-wider mb-1">Thành viên</div>
                                        <div className="text-xl font-bold text-white tracking-wide uppercase">{activeTier} MEMBER</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] text-white/60 uppercase tracking-wider mb-1">Ngày tham gia</div>
                                        <div className="text-sm font-medium text-white">12/2023</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card Texture/Pattern */}
                        <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay rounded-2xl"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-2xl"></div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="-mt-6 relative z-20 bg-background rounded-t-[2rem] px-4 pt-8 min-h-[500px]">
                <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6"></div>
                
                <h3 className="font-bold text-lg mb-4 px-2">Ưu đãi hạng thành viên</h3>

                {/* Tabs */}
                <Tabs defaultValue="gold" value={activeTier} onValueChange={setActiveTier} className="w-full">
                    <TabsList className="w-full h-auto p-1 bg-secondary/50 rounded-xl mb-6 grid grid-cols-4">
                        {Object.values(tiers).map((tier) => (
                            <TabsTrigger 
                                key={tier.id} 
                                value={tier.id}
                                className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg py-2 text-[10px] sm:text-xs font-bold uppercase"
                            >
                                {tier.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {Object.values(tiers).map((tier) => (
                        <TabsContent key={tier.id} value={tier.id} className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="space-y-4">
                                {tier.benefits.map((benefit, index) => (
                                    <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-secondary/20 border border-border/50">
                                        <div className={cn("p-2 rounded-full shrink-0 bg-gradient-to-br opacity-90", tier.color)}>
                                            {index === 0 ? <Gift className="w-4 h-4 text-white" /> : 
                                             index === 1 ? <Zap className="w-4 h-4 text-white" /> :
                                             <CheckCircle2 className="w-4 h-4 text-white" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-foreground leading-relaxed font-medium">
                                                {benefit}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {tier.id === currentStatus.tier.toLowerCase() ? (
                                    <div className="mt-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 text-center">
                                        <p className="text-sm font-bold text-green-600 dark:text-green-400">Bạn đang ở hạng này</p>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-3 mb-1">
                                            <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '70%' }}></div>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Cần thêm {currentStatus.pointsNeeded} điểm để lên hạng tiếp theo</p>
                                    </div>
                                ) : (
                                    <div className="mt-6 text-center">
                                        <Button className="w-full bg-foreground text-background hover:bg-foreground/90 font-bold">
                                            Xem điều kiện thăng hạng
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>

                {/* Additional Links */}
                <div className="mt-8 border-t border-border pt-2">
                    <button className="flex items-center justify-between w-full p-4 hover:bg-secondary/40 rounded-xl transition-colors">
                        <span className="font-bold text-sm">Lịch sử điểm của tôi</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button className="flex items-center justify-between w-full p-4 hover:bg-secondary/40 rounded-xl transition-colors">
                        <span className="font-bold text-sm">Chi tiết chương trình Locaith Club</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                </div>

                {/* CTA */}
                <div className="mt-6 mb-8">
                    <Button className="w-full h-12 text-base font-bold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-lg shadow-red-500/20">
                        Mở khóa quyền lợi Locaith Club
                    </Button>
                </div>
            </div>
        </div>
      </ScrollArea>
    </div>
  );
};
