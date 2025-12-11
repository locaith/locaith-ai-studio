import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Crown, Star, Shield, Zap, 
  CheckCircle2, Bike, Car, Gift, Gem, 
  Users, ArrowRight, Clock
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export const MembershipFeature = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  const packages = [
    {
      id: "personal-unlimited",
      title: "[Gói cá nhân] Locaith Không Giới Hạn",
      description: "80 mã AI/Design/Voice/Auto, tiết kiệm tới 2 triệu đồng",
      price: "Từ 35.000đ/tháng",
      trial: "1 tháng dùng thử",
      action: "Dùng thử",
      type: "personal",
      highlight: true,
      image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop",
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: "locaith-tools",
      title: "Locaith Tools | 29K (mới)",
      description: "Tiết kiệm lên tới 971.000 VNĐ cho bộ công cụ cơ bản",
      price: "29.000đ",
      action: "Đăng ký",
      type: "others",
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop",
      color: "from-emerald-500 to-green-500"
    },
    {
      id: "vip-flexi",
      title: "Locaith VIP Flexi",
      description: "Linh hoạt lộ trình, tiết kiệm lên đến 1.135.000 đ",
      price: "2.200.000đ",
      action: "Đăng ký",
      type: "vip",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1000&auto=format&fit=crop",
      color: "from-slate-900 to-slate-800"
    }
  ];

  const filteredPackages = activeTab === "all" 
    ? packages 
    : packages.filter(pkg => pkg.type === activeTab || (activeTab === "others" && pkg.type === "personal")); // Simplified filtering for demo

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
            <div>
              <h1 className="text-lg font-bold leading-none">Gói hội viên</h1>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">Đăng ký để nhận nhiều ưu đãi!</p>
            </div>
          </div>
          
          <div className="relative group cursor-pointer">
             <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-200"></div>
             <div className="relative bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 p-2 rounded-xl border border-yellow-200 dark:border-yellow-700 shadow-sm">
                <Crown className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
             </div>
             <div className="absolute -top-1 -right-1">
                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 animate-pulse" />
             </div>
          </div>
        </div>

        {/* Categories */}
        <div className="px-4 pb-2">
           <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {['all', 'family', 'others', 'vip'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all",
                    activeTab === tab 
                      ? "bg-foreground text-background shadow-md" 
                      : "bg-background border border-border text-muted-foreground hover:bg-secondary"
                  )}
                >
                  {tab === 'all' ? 'Tất cả' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
           </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6 pb-20">
            {/* Banner */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg group cursor-pointer">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-400/20 rounded-full translate-y-1/3 -translate-x-1/3 blur-xl"></div>
                
                <div className="relative p-6 flex flex-col justify-between min-h-[160px]">
                    <div>
                        <div className="flex items-center gap-2 mb-2 opacity-90">
                            <Users className="h-5 w-5" />
                            <span className="font-bold tracking-wide text-sm uppercase">Locaith Unlimited</span>
                        </div>
                        <h2 className="text-3xl font-black mb-1 text-yellow-300">Family</h2>
                        <p className="text-sm font-medium text-blue-50 max-w-[200px] leading-relaxed">
                            Ưu đãi cho <span className="font-bold text-white underline decoration-yellow-400 decoration-2 underline-offset-2">mọi thành viên</span> trong gia đình
                        </p>
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                        <Button className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold rounded-full shadow-lg border-2 border-white/20">
                            Dùng thử miễn phí 30 ngày
                        </Button>
                    </div>
                </div>
            </div>

            {/* Package List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h3 className="font-bold text-lg">Khám phá</h3>
                    <div className="flex items-center gap-1 text-xs text-blue-600 font-medium cursor-pointer hover:underline">
                        Gói của tôi <Clock className="h-3 w-3" />
                    </div>
                </div>

                {filteredPackages.map((pkg) => (
                    <Card key={pkg.id} className="overflow-hidden border-border/60 shadow-sm hover:shadow-md transition-all duration-300 group">
                        <div className="p-4">
                            <div className="flex gap-4">
                                <div className={cn("w-16 h-16 rounded-xl shrink-0 flex items-center justify-center bg-gradient-to-br shadow-inner text-white", pkg.color)}>
                                    {pkg.type === 'vip' ? <Crown className="h-8 w-8" /> : 
                                     pkg.type === 'others' ? <Bike className="h-8 w-8" /> : 
                                     <Gem className="h-8 w-8" />}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-xs text-emerald-600 font-medium line-clamp-1">{pkg.description.split(',')[0]}</p>
                                    <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{pkg.title}</h4>
                                    {pkg.trial && (
                                        <div className="text-[10px] text-muted-foreground">{pkg.trial}</div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                                <div className="font-bold text-lg">{pkg.price}</div>
                                <Button 
                                    className={cn(
                                        "rounded-full px-6 font-bold shadow-sm transition-transform active:scale-95",
                                        pkg.action === "Dùng thử" ? "bg-cyan-500 hover:bg-cyan-600 text-white" : "bg-primary hover:bg-primary/90"
                                    )}
                                >
                                    {pkg.action}
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Footer / Helper */}
            <div className="text-center space-y-2 py-4">
                <p className="text-xs text-muted-foreground">Bạn cần hỗ trợ chọn gói?</p>
                <Button variant="link" className="text-primary text-xs h-auto p-0">Liên hệ tư vấn viên</Button>
            </div>
        </div>
      </ScrollArea>
    </div>
  );
};
