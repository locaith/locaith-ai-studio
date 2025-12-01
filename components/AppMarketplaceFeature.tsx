import React, { useState } from 'react';
import { Search, Plus, Zap, Globe, MessageSquare, PenTool, BookOpen, Code, User, Briefcase, TrendingUp, MoreHorizontal, Star, LayoutGrid, Download, Database, Cpu, Box, Layers, Server, Shield, Check, FileText, Palette, Languages, Image as ImageIcon, Monitor, Home, Feather, Telescope, ArrowRight, Workflow, AppWindow, Sofa, Mic, Sparkles, Headphones, Flame, Clock, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

// --- Mock Data ---

const categories = [
  { id: "all", label: "Tất cả", icon: <LayoutGrid className="w-4 h-4" /> },
  { id: "featured", label: "Nổi bật", icon: <Star className="w-4 h-4" /> },
  { id: "productivity", label: "Năng suất", icon: <Zap className="w-4 h-4" /> },
  { id: "creative", label: "Sáng tạo", icon: <Palette className="w-4 h-4" /> },
  { id: "dev", label: "Lập trình", icon: <Code className="w-4 h-4" /> },
  { id: "business", label: "Kinh doanh", icon: <Briefcase className="w-4 h-4" /> },
  { id: "education", label: "Giáo dục", icon: <BookOpen className="w-4 h-4" /> },
];

const byLocaithApps: any[] = [
  {
    id: 'bl0',
    title: "Tổng quan",
    description: "Trợ lý ảo thông minh giúp bạn lập kế hoạch, tra cứu thông tin và giải quyết mọi vấn đề.",
    author: "Locaith",
    rating: "5.0",
    users: "1M+",
    price: "Miễn phí",
    route: "/",
    category: "productivity",
    icon: <img src="/logo-locaith.png" alt="Locaith" className="h-full w-full rounded-2xl object-cover shadow-lg shadow-blue-400/20" />,
    featured: true,
    bannerColor: "from-blue-500/10 to-cyan-500/10"
  },
  {
    id: 'bl1',
    title: "Xây dựng Website",
    description: "Thiết kế và xây dựng website chuyên nghiệp chỉ trong vài phút với sự hỗ trợ của AI.",
    author: "Locaith",
    rating: "4.9",
    users: "500k+",
    price: "Miễn phí",
    route: "/builder",
    category: "creative",
    icon: (
      <div className="h-full w-full rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-3 shadow-lg shadow-indigo-500/20 flex items-center justify-center overflow-hidden relative group-hover:shadow-indigo-500/40 transition-shadow">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <svg viewBox="0 0 100 100" className="w-full h-full text-white drop-shadow-md">
           <rect x="20" y="20" width="60" height="45" rx="4" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="3" />
           <rect x="20" y="20" width="60" height="12" rx="4" fill="white" fillOpacity="0.3" />
           <circle cx="28" cy="26" r="2" fill="white" />
           <circle cx="35" cy="26" r="2" fill="white" />
           <rect x="30" y="42" width="25" height="4" rx="2" fill="white" />
           <rect x="30" y="52" width="40" height="4" rx="2" fill="white" />
           <path d="M55 55 L90 90" stroke="white" strokeWidth="6" strokeLinecap="round" />
           <path d="M55 90 L90 55" stroke="white" strokeWidth="6" strokeLinecap="round" />
        </svg>
      </div>
    ),
    featured: true,
    bannerColor: "from-indigo-500/10 to-purple-500/10"
  },
  {
    id: 'bl7',
    title: "Thời trang AI",
    description: "Thiết kế quần áo, phụ kiện và thử đồ ảo trên người mẫu thật.",
    author: "Locaith",
    rating: "4.8",
    users: "300k+",
    price: "Miễn phí",
    route: "/fashion",
    category: "creative",
    icon: (
      <div className="h-full w-full rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 p-3 shadow-lg shadow-pink-500/20 flex items-center justify-center overflow-hidden relative group-hover:shadow-pink-500/40 transition-shadow">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
         <svg viewBox="0 0 100 100" className="w-full h-full text-white drop-shadow-md">
            <path d="M50 15 C30 15 25 35 20 40 L30 85 L70 85 L80 40 C75 35 70 15 50 15 Z" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="3" />
            <path d="M50 15 Q60 25 50 35 Q40 25 50 15" fill="white" />
            <path d="M35 85 L35 45" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M65 85 L65 45" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="75" cy="25" r="8" fill="white" fillOpacity="0.9" />
            <path d="M75 20 L75 30 M70 25 L80 25" stroke="rgb(244, 63, 94)" strokeWidth="3" />
         </svg>
      </div>
    ),
  },
  {
    id: 'bl2',
    title: "Thiết kế Nội thất",
    description: "Tư vấn thiết kế nội thất, phối màu và tạo không gian sống mơ ước.",
    author: "Locaith",
    rating: "4.8",
    users: "250k+",
    price: "Miễn phí",
    route: "/design",
    category: "creative",
    icon: (
      <div className="h-full w-full rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 p-3 shadow-lg shadow-orange-500/20 flex items-center justify-center overflow-hidden relative group-hover:shadow-orange-500/40 transition-shadow">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <svg viewBox="0 0 100 100" className="w-full h-full text-white drop-shadow-md">
           <path d="M20 40 L50 25 L80 40 L80 75 L50 90 L20 75 Z" fill="none" stroke="white" strokeWidth="3" />
           <path d="M20 40 L50 55 L80 40" fill="none" stroke="white" strokeWidth="3" />
           <path d="M50 55 L50 90" fill="none" stroke="white" strokeWidth="3" />
           <path d="M50 25 L50 55 L20 75" fill="rgba(255,255,255,0.1)" />
           <path d="M50 55 L80 75 L80 40" fill="rgba(255,255,255,0.3)" />
           <circle cx="50" cy="45" r="5" fill="white" />
        </svg>
      </div>
    ),
  },
  {
    id: 'bl3',
    title: "Soạn thảo Pro",
    description: "Trợ lý viết lách thông minh, hỗ trợ soạn email, báo cáo và blog.",
    author: "Locaith",
    rating: "4.7",
    users: "800k+",
    price: "Miễn phí",
    route: "/compose",
    category: "productivity",
    icon: (
       <div className="h-full w-full rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 p-3 shadow-lg shadow-emerald-500/20 flex items-center justify-center overflow-hidden relative group-hover:shadow-emerald-500/40 transition-shadow">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
         <svg viewBox="0 0 100 100" className="w-full h-full text-white drop-shadow-md">
            <path d="M30 80 L20 90 L30 80 L60 30 C65 20 75 20 80 30 C85 35 85 45 75 50 L45 80 L30 80" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20 90 L35 85" stroke="white" strokeWidth="3" />
            <path d="M55 35 L70 50" stroke="white" strokeWidth="3" />
            <rect x="25" y="20" width="30" height="40" rx="2" fill="rgba(255,255,255,0.2)" transform="rotate(-15 40 40)" />
         </svg>
       </div>
    ),
  },
  {
    id: 'bl4',
    title: "Tìm kiếm Sâu",
    description: "Công cụ tìm kiếm và phân tích thông tin chuyên sâu từ nhiều nguồn.",
    author: "Locaith",
    rating: "4.9",
    users: "600k+",
    price: "Miễn phí",
    route: "/search",
    category: "productivity",
    icon: (
      <div className="h-full w-full rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 p-3 shadow-lg shadow-cyan-500/20 flex items-center justify-center overflow-hidden relative group-hover:shadow-cyan-500/40 transition-shadow">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <svg viewBox="0 0 100 100" className="w-full h-full text-white drop-shadow-md">
          <circle cx="45" cy="45" r="25" stroke="white" strokeWidth="4" fill="rgba(255,255,255,0.1)" />
          <path d="M65 65 L85 85" stroke="white" strokeWidth="6" strokeLinecap="round" />
          <path d="M35 45 H55 M45 35 V55" stroke="white" strokeWidth="3" opacity="0.7" />
          <circle cx="75" cy="25" r="3" fill="white" opacity="0.8" />
          <circle cx="85" cy="35" r="2" fill="white" opacity="0.6" />
        </svg>
      </div>
    ),
  },
  {
    id: 'bl5',
    title: "Chat Giọng nói",
    description: "Trò chuyện tự nhiên với AI bằng giọng nói đa ngôn ngữ.",
    author: "Locaith",
    rating: "4.8",
    users: "450k+",
    price: "Miễn phí",
    route: "/voice",
    category: "productivity",
    icon: (
       <div className="h-full w-full rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 p-3 shadow-lg shadow-violet-500/20 flex items-center justify-center overflow-hidden relative group-hover:shadow-violet-500/40 transition-shadow">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
         <svg viewBox="0 0 100 100" className="w-full h-full text-white drop-shadow-md">
            <rect x="25" y="35" width="10" height="30" rx="5" fill="white" />
            <rect x="45" y="25" width="10" height="50" rx="5" fill="white" />
            <rect x="65" y="35" width="10" height="30" rx="5" fill="white" />
            <path d="M15 50 Q15 75 50 75 Q85 75 85 50" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
         </svg>
       </div>
    ),
  },
  {
    id: 'bl6',
    title: "Tự động hóa",
    description: "Tối ưu quy trình làm việc với các công cụ tự động hóa mạnh mẽ.",
    author: "Locaith",
    rating: "4.6",
    users: "150k+",
    price: "Miễn phí",
    route: "/automation",
    category: "business",
    icon: (
       <div className="h-full w-full rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 p-3 shadow-lg shadow-slate-600/20 flex items-center justify-center overflow-hidden relative group-hover:shadow-slate-600/40 transition-shadow">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
         <svg viewBox="0 0 100 100" className="w-full h-full text-white drop-shadow-md">
            <circle cx="50" cy="50" r="20" stroke="white" strokeWidth="8" fill="none" strokeDasharray="10 5" />
            <circle cx="50" cy="50" r="8" fill="white" />
            <path d="M50 10 V25 M50 75 V90 M10 50 H25 M75 50 H90" stroke="white" strokeWidth="4" strokeLinecap="round" />
            <path d="M22 22 L32 32 M68 68 L78 78 M22 78 L32 68 M68 32 L78 22" stroke="white" strokeWidth="4" strokeLinecap="round" />
         </svg>
       </div>
    ),
  }
];

const communityApps = [
  { 
    id: 'c1', 
    title: "Data Insight 360", 
    description: "Phân tích dữ liệu lớn và dự báo xu hướng.", 
    author: "Data Corp", 
    category: "business", 
    rating: "4.9", 
    users: "10k+", 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
        <path d="M18 20V10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 20V4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 20V14" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 4H20" strokeOpacity="0.2" strokeLinecap="round" />
      </svg>
    ), 
    color: "bg-blue-100 text-blue-600" 
  },
  { 
    id: 'c2', 
    title: "Code Scanner", 
    description: "Quét lỗ hổng bảo mật trong mã nguồn.", 
    author: "SecuTech", 
    category: "dev", 
    rating: "4.8", 
    users: "8k+", 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ), 
    color: "bg-green-100 text-green-600" 
  },
  { 
    id: 'c3', 
    title: "Cloud Manager", 
    description: "Tối ưu hóa chi phí hạ tầng đám mây.", 
    author: "Cloud Ops", 
    category: "dev", 
    rating: "4.7", 
    users: "12k+", 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
        <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
        <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
        <line x1="6" y1="6" x2="6.01" y2="6" />
        <line x1="6" y1="18" x2="6.01" y2="18" />
      </svg>
    ), 
    color: "bg-yellow-100 text-yellow-600" 
  },
  { 
    id: 'c4', 
    title: "Marketing AI", 
    description: "Tạo nội dung quảng cáo tự động.", 
    author: "AdTech", 
    category: "business", 
    rating: "4.6", 
    users: "15k+", 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ), 
    color: "bg-red-100 text-red-600" 
  },
];

// --- Components ---

const AppCard = ({ item, onClick, isLarge = false }: { item: any, onClick: () => void, isLarge?: boolean }) => (
  <div 
    onClick={onClick}
    className={cn(
      "group relative flex flex-col p-5 rounded-3xl transition-all duration-300 cursor-pointer border border-transparent hover:border-primary/20",
      "bg-white dark:bg-secondary/20 hover:shadow-xl hover:-translate-y-1",
      isLarge ? "md:col-span-2 md:flex-row md:items-center gap-6" : "gap-4"
    )}
  >
    <div className={cn(
      "shrink-0 transition-transform duration-500 group-hover:scale-110",
      isLarge ? "w-24 h-24 md:w-32 md:h-32" : "w-16 h-16"
    )}>
      {item.icon}
    </div>
    
    <div className="flex-1 min-w-0 flex flex-col justify-center">
      <div className="flex items-start justify-between mb-1">
        <div>
            <h3 className={cn("font-bold text-foreground group-hover:text-primary transition-colors", isLarge ? "text-2xl" : "text-lg")}>
                {item.title}
            </h3>
            <p className="text-xs text-muted-foreground font-medium mb-2">by {item.author}</p>
        </div>
        {item.price === "Miễn phí" ? (
            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">FREE</Badge>
        ) : (
            <Badge variant="outline">{item.price}</Badge>
        )}
      </div>
      
      <p className={cn("text-muted-foreground line-clamp-2 leading-relaxed", isLarge ? "text-base mb-4" : "text-sm mb-3")}>
        {item.description}
      </p>
      
      <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium mt-auto">
        <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-600 px-2 py-0.5 rounded-full">
            <Star className="w-3 h-3 fill-yellow-500" />
            <span>{item.rating}</span>
        </div>
        <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>{item.users} dùng</span>
        </div>
      </div>

      {isLarge && (
        <div className="mt-4 hidden md:block">
            <Button className="rounded-full px-6">Mở ứng dụng</Button>
        </div>
      )}
    </div>
  </div>
);

const SectionHeader = ({ title, icon, action }: { title: string, icon?: React.ReactNode, action?: string }) => (
  <div className="flex items-end justify-between mb-6 px-1">
    <div className="flex items-center gap-2">
        {icon && <div className="p-1.5 rounded-lg bg-primary/10 text-primary">{icon}</div>}
        <h2 className="text-xl font-bold text-foreground tracking-tight">{title}</h2>
    </div>
    {action && (
        <Button variant="ghost" className="text-sm font-medium text-primary hover:bg-primary/10 h-8 rounded-full px-3">
            {action} <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
    )}
  </div>
);

export const AppMarketplaceFeature: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [balance, setBalance] = useState(1250);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Filter logic
  const filteredApps = byLocaithApps.filter(app => {
    const matchesSearch = app.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          app.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || app.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredApp = byLocaithApps.find(app => app.id === 'bl0');

  const handleOpenApp = (app: any) => {
    if (app.route) {
        navigate(app.route);
        toast.info(`Đang mở ${app.title}...`);
    } else {
        toast.success("Đã thêm vào thư viện của bạn");
    }
  };

  return (
    <div className="h-full w-full bg-slate-50/50 dark:bg-background text-foreground overflow-y-auto relative font-sans">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-w-fit">
                <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
                    <LayoutGrid className="h-5 w-5" />
                </div>
                <span className="font-bold text-lg hidden md:block">Kho Ứng Dụng</span>
            </div>

            <div className="flex-1 max-w-2xl relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    className="pl-9 bg-secondary/50 border-transparent focus:bg-background focus:border-primary/20 transition-all rounded-full h-10" 
                    placeholder="Tìm kiếm ứng dụng, công cụ AI..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="flex items-center gap-3 min-w-fit">
                {isAuthenticated && (
                    <div className="hidden md:flex flex-col items-end mr-2">
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Số dư</span>
                        <span className="text-sm font-bold text-primary">{balance.toLocaleString()} Credits</span>
                    </div>
                )}
                <Button variant="outline" className="rounded-full hidden sm:flex">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Đã cài đặt
                </Button>
            </div>
        </div>
        
        {/* Categories Bar */}
        <div className="border-t border-border/50 bg-background/50">
            <div className="max-w-7xl mx-auto">
                <ScrollArea className="w-full whitespace-nowrap">
                    <div className="flex px-4 md:px-6 py-2 space-x-2">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                                    activeCategory === cat.id
                                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                )}
                            >
                                {cat.icon}
                                {cat.label}
                            </button>
                        ))}
                    </div>
                    <ScrollBar orientation="horizontal" className="invisible" />
                </ScrollArea>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-12 pb-24">
        
        {/* Hero Banner (Only show when not searching) */}
        {!searchQuery && activeCategory === 'all' && (
            <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white shadow-2xl shadow-purple-500/20">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <Sparkles className="w-64 h-64" />
                </div>
                
                <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                    <div className="flex-1 text-center md:text-left space-y-6">
                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm px-4 py-1 text-sm">
                            <Star className="w-3 h-3 mr-2 fill-white" /> Nổi bật tuần này
                        </Badge>
                        <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">
                            Locaith <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">Assistant</span>
                        </h1>
                        <p className="text-lg text-white/90 leading-relaxed max-w-xl">
                            Trợ lý AI toàn năng giúp bạn giải quyết mọi vấn đề. Từ lập kế hoạch, tìm kiếm thông tin đến sáng tạo nội dung.
                        </p>
                        <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
                            <Button size="lg" className="rounded-full bg-white text-purple-600 hover:bg-blue-50 font-bold px-8 h-12 shadow-lg" onClick={() => navigate('/')}>
                                Khám phá ngay
                            </Button>
                            <Button size="lg" className="rounded-full bg-white/20 border border-white/50 text-white hover:bg-white/30 backdrop-blur-sm h-12 px-6 shadow-sm">
                                Tìm hiểu thêm
                            </Button>
                        </div>
                    </div>
                    <div className="w-full max-w-xs md:max-w-sm relative aspect-square flex items-center justify-center">
                        <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                        <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                             <div className="bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl p-4 shadow-inner">
                                <img src="/logo-locaith.png" alt="Locaith Logo" className="w-32 h-32 object-contain rounded-xl" />
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Main Grid Section */}
        <section>
            <SectionHeader 
                title={searchQuery ? "Kết quả tìm kiếm" : "Ứng dụng Locaith"} 
                icon={<Monitor className="w-5 h-5" />}
                action={!searchQuery ? "Xem tất cả" : undefined}
            />
            
            {filteredApps.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredApps.map((app, index) => (
                        <AppCard 
                            key={app.id} 
                            item={app} 
                            onClick={() => handleOpenApp(app)} 
                            isLarge={index === 0 && !searchQuery && activeCategory === 'all'} // First item is large if standard view
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-secondary/30 rounded-3xl border border-dashed border-border">
                    <Search className="w-16 h-16 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-bold text-foreground">Không tìm thấy kết quả</h3>
                    <p className="text-muted-foreground">Thử tìm kiếm với từ khóa khác</p>
                </div>
            )}
        </section>

        {/* Community/Trending Section (Only on main view) */}
        {!searchQuery && activeCategory === 'all' && (
            <section>
                 <SectionHeader 
                    title="Cộng đồng phát triển" 
                    icon={<Flame className="w-5 h-5" />}
                    action="Khám phá thêm"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {communityApps.map((app) => (
                        <div key={app.id} className="group bg-background border border-border/50 p-4 rounded-2xl hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer">
                            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", app.color)}>
                                {app.icon}
                            </div>
                            <h4 className="font-bold text-foreground truncate mb-1">{app.title}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-3 h-8">{app.description}</p>
                            <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground bg-secondary/50 p-2 rounded-lg">
                                <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" /> {app.users}
                                </span>
                                <span className="flex items-center gap-1 text-yellow-600">
                                    <Star className="w-3 h-3 fill-yellow-500" /> {app.rating}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        )}

        {/* Features Footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-border/50">
             <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl flex items-start gap-4">
                <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400 shrink-0" />
                <div>
                    <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-1">An toàn & Bảo mật</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Mọi ứng dụng đều được kiểm duyệt kỹ lưỡng.</p>
                </div>
             </div>
             <div className="bg-purple-50 dark:bg-purple-900/10 p-6 rounded-2xl flex items-start gap-4">
                <Zap className="w-8 h-8 text-purple-600 dark:text-purple-400 shrink-0" />
                <div>
                    <h3 className="font-bold text-purple-900 dark:text-purple-100 mb-1">Cập nhật liên tục</h3>
                    <p className="text-sm text-purple-700 dark:text-purple-300">Tính năng mới được bổ sung hàng tuần.</p>
                </div>
             </div>
             <div className="bg-green-50 dark:bg-green-900/10 p-6 rounded-2xl flex items-start gap-4">
                <Headphones className="w-8 h-8 text-green-600 dark:text-green-400 shrink-0" />
                <div>
                    <h3 className="font-bold text-green-900 dark:text-green-100 mb-1">Hỗ trợ 24/7</h3>
                    <p className="text-sm text-green-700 dark:text-green-300">Đội ngũ kỹ thuật luôn sẵn sàng giúp đỡ.</p>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
};
