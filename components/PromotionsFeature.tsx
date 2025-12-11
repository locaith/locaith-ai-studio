import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Ticket, Clock, CheckCircle2, 
  Zap, Mic, Image, Box, ArrowRight, History, Gift
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export const PromotionsFeature = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  const promotions = [
    {
      id: "p1",
      title: "Giảm 15% gói VIP",
      description: "Áp dụng cho tất cả các gói đăng ký VIP từ 6 tháng trở lên",
      discount: "15%",
      maxDiscount: "50k",
      expiry: "Hết hạn trong 1 ngày",
      count: 1,
      type: "vip",
      image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=200&auto=format&fit=crop",
      color: "from-purple-500 to-indigo-500"
    },
    {
      id: "p2",
      title: "Tặng 100 Credits AI",
      description: "Dùng để tạo ảnh, viết content hoặc chat với AI chuyên gia",
      discount: "100 Credits",
      expiry: "Hết hạn: 31/12/2024",
      count: 3,
      type: "ai",
      image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=200&auto=format&fit=crop",
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: "p3",
      title: "Giảm 50% Gói Voice Studio",
      description: "Trải nghiệm giọng đọc AI cao cấp với giá ưu đãi",
      discount: "50%",
      maxDiscount: "100k",
      expiry: "Hết hạn trong 3 ngày",
      count: 1,
      type: "voice",
      image: "https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?q=80&w=200&auto=format&fit=crop",
      color: "from-pink-500 to-rose-500"
    },
    {
      id: "p4",
      title: "Thiết kế Logo AI Miễn Phí",
      description: "Tạo 5 logo đầu tiên hoàn toàn miễn phí với AI Designer",
      discount: "Free",
      expiry: "Hết hạn: 15/01/2025",
      count: 5,
      type: "design",
      image: "https://images.unsplash.com/photo-1626785774573-4b799314346d?q=80&w=200&auto=format&fit=crop",
      color: "from-orange-400 to-amber-500"
    },
    {
      id: "p5",
      title: "Giảm 20% Automation",
      description: "Tối ưu quy trình làm việc với các công cụ tự động hóa",
      discount: "20%",
      maxDiscount: "200k",
      expiry: "Hết hạn: 20/01/2025",
      count: 1,
      type: "auto",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=200&auto=format&fit=crop",
      color: "from-emerald-500 to-teal-500"
    }
  ];

  const categories = [
    { id: 'all', label: 'Tất cả' },
    { id: 'vip', label: 'Gói VIP' },
    { id: 'ai', label: 'AI Chat' },
    { id: 'voice', label: 'Voice' },
    { id: 'design', label: 'Design' },
    { id: 'auto', label: 'Auto' },
  ];

  const filteredPromotions = activeTab === "all" 
    ? promotions 
    : promotions.filter(p => p.type === activeTab);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-background">
      {/* Header - Fixed & Clean */}
      <div className="bg-background border-b z-20 sticky top-0">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="-ml-2"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Ưu đãi của tôi</h1>
          </div>
          <Button variant="ghost" size="sm" className="text-xs font-medium text-primary">
            Quy định
          </Button>
        </div>
        
        {/* Wallet Summary */}
        <div className="px-4 pb-4">
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden">
             {/* Decorative Background */}
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
             
             <div className="relative z-10 flex items-center justify-between">
               <div>
                 <p className="text-xs text-white/80 mb-1 font-medium">Số dư ưu đãi</p>
                 <h2 className="text-2xl font-bold flex items-center gap-2">
                   15 <span className="text-sm font-normal text-white/80">mã khả dụng</span>
                 </h2>
               </div>
               <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm border border-white/20">
                 <Ticket className="w-6 h-6 text-white" />
               </div>
             </div>
          </div>
        </div>

        {/* Categories Filter - Scrollable */}
        <div className="px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border",
                  activeTab === cat.id
                    ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                    : "bg-background text-muted-foreground border-border hover:bg-secondary"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <ScrollArea className="flex-1 bg-slate-50/50 dark:bg-background">
        <div className="p-4 space-y-4 max-w-2xl mx-auto pb-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Danh sách mã ưu đãi</h3>
            </div>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs text-muted-foreground hover:text-primary">
              Lịch sử dùng mã
            </Button>
          </div>

          <div className="grid gap-3">
            {filteredPromotions.map((promo) => (
              <div 
                key={promo.id} 
                className="group bg-background rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col sm:flex-row"
              >
                {/* Image Section */}
                <div className="relative h-24 sm:h-auto sm:w-32 shrink-0 overflow-hidden">
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-90", promo.color)}></div>
                  <img 
                    src={promo.image} 
                    alt="" 
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60 transition-transform group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full border border-white/30 shadow-sm">
                      <Ticket className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  
                  {/* Perforated Line Effect */}
                  <div className="absolute bottom-0 left-0 right-0 h-[4px] sm:h-full sm:w-[4px] sm:top-0 sm:right-0 sm:left-auto bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOCIgaGVpZ2h0PSI4IiB2aWV3Qm94PSIwIDAgOCA4IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxjaXJjbGUgY3g9IjQiIGN5PSI0IiByPSIyIiBmaWxsPSIjZmZmIi8+PC9zdmc+')] bg-repeat-x sm:bg-repeat-y opacity-50"></div>
                </div>

                {/* Content Section */}
                <div className="flex-1 p-3 flex flex-col justify-between gap-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-foreground">
                          {promo.title}
                        </h4>
                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-medium bg-secondary text-secondary-foreground">
                          x{promo.count}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {promo.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-dashed border-border/60">
                    <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-medium">{promo.expiry}</span>
                    </div>
                    <Button size="sm" className="h-7 text-xs font-medium px-4 rounded-full shadow-sm">
                      Dùng ngay
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredPromotions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-secondary/50 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                <Ticket className="w-10 h-10 text-muted-foreground/40" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Chưa có mã ưu đãi nào</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Hiện tại bạn chưa có mã ưu đãi nào trong mục này. Hãy quay lại sau nhé!
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
