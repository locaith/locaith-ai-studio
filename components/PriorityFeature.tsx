import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Briefcase, UserCheck, Hammer, Calendar, ArrowRight, LayoutGrid, ChevronRight, ShoppingBag, Search, Plane, Heart, Scale, Wallet, Home } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

const priorityModules = [
  {
    id: 'jobs',
    title: "Sàn việc làm",
    subtitle: "Cơ hội nghề nghiệp & Freelance",
    description: "Tìm kiếm việc làm, dự án freelance và cơ hội phát triển sự nghiệp.",
    icon: <Briefcase className="w-6 h-6 text-white" />,
    route: "/jobs",
    gradient: "from-blue-500 to-indigo-600",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=80&auto=format&fit=crop",
    category: "Việc làm",
    rating: 4.8
  },
  {
    id: 'shopping',
    title: "Mua Sắm",
    subtitle: "Thời trang & Phong cách sống",
    description: "Trải nghiệm mua sắm thông minh với hàng ngàn sản phẩm ưu đãi.",
    icon: <ShoppingBag className="w-6 h-6 text-white" />,
    route: "/shopping",
    gradient: "from-emerald-500 to-teal-600",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80&auto=format&fit=crop",
    category: "Thương mại",
    rating: 4.5
  },
  {
    id: 'experts',
    title: "Chuyên gia",
    subtitle: "Kết nối chuyên gia hàng đầu",
    description: "Tham vấn ý kiến từ các chuyên gia trong nhiều lĩnh vực.",
    icon: <UserCheck className="w-6 h-6 text-white" />,
    route: "/experts",
    gradient: "from-violet-500 to-purple-600",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80&auto=format&fit=crop",
    category: "Tư vấn",
    rating: 4.9
  },
  {
    id: 'handyman',
    title: "Gọi thợ",
    subtitle: "Dịch vụ sửa chữa & Bảo trì",
    description: "Đặt lịch thợ sửa chữa điện nước, điện lạnh nhanh chóng.",
    icon: <Hammer className="w-6 h-6 text-white" />,
    route: "/goi-tho",
    gradient: "from-orange-500 to-red-600",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80&auto=format&fit=crop",
    category: "Dịch vụ",
    rating: 4.7
  },
  {
    id: 'events',
    title: "Event Hub",
    subtitle: "Sự kiện & Hội thảo nổi bật",
    description: "Khám phá và tham gia các sự kiện công nghệ, workshop.",
    icon: <Calendar className="w-6 h-6 text-white" />,
    route: "/events",
    gradient: "from-pink-500 to-rose-600",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80&auto=format&fit=crop",
    category: "Sự kiện",
    rating: 4.6
  },
  {
    id: 'we2go',
    title: "We2go",
    subtitle: "AI Du lịch & Khám phá",
    description: "Lên lịch trình, đặt phòng và khám phá điểm đến với trợ lý AI.",
    icon: <Plane className="w-6 h-6 text-white" />,
    route: "/we2go",
    gradient: "from-sky-500 to-blue-600",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80&auto=format&fit=crop",
    category: "Du lịch",
    rating: 4.8
  },
  {
    id: 'helpi',
    title: "Helpi",
    subtitle: "Trợ lý AI Y tế",
    description: "Tư vấn sức khỏe, đặt lịch khám và theo dõi chỉ số cơ thể.",
    icon: <Heart className="w-6 h-6 text-white" />,
    route: "/helpi",
    gradient: "from-rose-500 to-pink-600",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80&auto=format&fit=crop",
    category: "Sức khỏe",
    rating: 4.9
  },
  {
    id: 'law',
    title: "Luật",
    subtitle: "AI Tư vấn Pháp lý",
    description: "Giải đáp thắc mắc pháp luật và soạn thảo văn bản tự động.",
    icon: <Scale className="w-6 h-6 text-white" />,
    route: "/law",
    gradient: "from-slate-600 to-slate-800",
    image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80&auto=format&fit=crop",
    category: "Pháp luật",
    rating: 4.7
  },
  {
    id: 'lcpay',
    title: "LcPay",
    subtitle: "Cổng thanh toán & Ví điện tử",
    description: "Thanh toán một chạm, chuyển tiền nhanh và quản lý tài chính.",
    icon: <Wallet className="w-6 h-6 text-white" />,
    route: "/lcpay",
    gradient: "from-emerald-600 to-teal-700",
    image: "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=800&q=80&auto=format&fit=crop",
    category: "Tài chính",
    rating: 4.8
  },
  {
    id: 'real-estate',
    title: "Bất động sản",
    subtitle: "Mua bán & Cho thuê nhà đất",
    description: "Tìm kiếm ngôi nhà mơ ước và cơ hội đầu tư sinh lời.",
    icon: <Home className="w-6 h-6 text-white" />,
    route: "/real-estate",
    gradient: "from-indigo-600 to-violet-700",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80&auto=format&fit=crop",
    category: "Bất động sản",
    rating: 4.7
  }
];

const categories = [
  { id: "all", label: "Tất cả", icon: <LayoutGrid className="w-4 h-4" /> },
  { id: "Việc làm", label: "Việc làm", icon: <Briefcase className="w-4 h-4" /> },
  { id: "Thương mại", label: "Mua sắm", icon: <ShoppingBag className="w-4 h-4" /> },
  { id: "Tài chính", label: "Tài chính", icon: <Wallet className="w-4 h-4" /> },
  { id: "Bất động sản", label: "Bất động sản", icon: <Home className="w-4 h-4" /> },
  { id: "Tư vấn", label: "Chuyên gia", icon: <UserCheck className="w-4 h-4" /> },
  { id: "Dịch vụ", label: "Dịch vụ", icon: <Hammer className="w-4 h-4" /> },
  { id: "Sự kiện", label: "Sự kiện", icon: <Calendar className="w-4 h-4" /> },
  { id: "Du lịch", label: "Du lịch", icon: <Plane className="w-4 h-4" /> },
  { id: "Sức khỏe", label: "Y tế", icon: <Heart className="w-4 h-4" /> },
  { id: "Pháp luật", label: "Luật", icon: <Scale className="w-4 h-4" /> },
];

export const PriorityFeature = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter modules based on category and search
  const filteredModules = priorityModules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          module.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || module.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Featured app (using the first one from filtered list or null if empty)
  const featuredApp = filteredModules.length > 0 ? filteredModules[0] : null;

  return (
    <div className="min-h-full w-full bg-background animate-fade-in pb-4 md:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50 pt-[env(safe-area-inset-top)]">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-w-fit">
                <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
                    <LayoutGrid className="h-5 w-5" />
                </div>
                <h1 className="text-lg font-bold tracking-tight hidden md:block">Ứng dụng</h1>
            </div>

            <div className="flex-1 max-w-xl relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    className="pl-9 bg-secondary/50 border-transparent focus:bg-background focus:border-primary/20 transition-all rounded-full h-10" 
                    placeholder="Tìm kiếm ứng dụng, dịch vụ..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="flex items-center gap-3 min-w-fit">
               <div className="bg-secondary/50 p-2 rounded-full">
                  <Avatar className="h-8 w-8">
                     <AvatarImage src="https://github.com/shadcn.png" />
                     <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
               </div>
            </div>
        </div>
      </div>

      <div className="">
        <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-8">
          
          {/* Featured Section (Carousel style) - Only show if we have results */}
          {featuredApp && (
            <section>
              <div className="flex items-center justify-between mb-4">
                 <h2 className="text-xl font-bold text-blue-500">
                    {activeCategory === 'all' && !searchQuery ? 'Nổi bật' : 'Kết quả hàng đầu'}
                 </h2>
                 <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600 p-0 h-auto font-medium">
                    Xem tất cả <ChevronRight className="w-4 h-4 ml-1" />
                 </Button>
              </div>
              
              <div 
                className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-xl overflow-hidden cursor-pointer group shadow-lg"
                onClick={() => navigate(featuredApp.route)}
              >
                <img 
                  src={featuredApp.image} 
                  alt={featuredApp.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 flex items-end justify-between">
                   <div className="flex items-center gap-4">
                      <div className={cn("w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center shadow-lg", "bg-gradient-to-br", featuredApp.gradient)}>
                         {featuredApp.icon}
                      </div>
                      <div className="text-white">
                         <p className="text-xs font-semibold uppercase tracking-wider text-blue-300 mb-1">{featuredApp.category}</p>
                         <h3 className="text-lg md:text-2xl font-bold leading-none mb-1">{featuredApp.title}</h3>
                         <p className="text-sm text-gray-300 line-clamp-1">{featuredApp.subtitle}</p>
                      </div>
                   </div>
                   <Button className="rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border-0 font-semibold px-6">
                      Mở
                   </Button>
                </div>
              </div>
            </section>
          )}

          <div className="w-full h-px bg-border/50" />

          {/* Top Apps List - Grid Layout */}
          <section>
             <div className="flex items-center justify-between mb-4">
               <h2 className="text-xl font-bold">
                  {searchQuery ? 'Kết quả tìm kiếm' : 'Ứng dụng Miễn phí'}
               </h2>
               <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600 p-0 h-auto font-medium">
                  Xem tất cả <ChevronRight className="w-4 h-4 ml-1" />
               </Button>
            </div>

            <div className="grid grid-cols-4 md:grid-cols-5 gap-4 md:gap-8">
               {filteredModules.length > 0 ? (
                 filteredModules.map((module) => (
                    <div 
                       key={module.id}
                       className="flex flex-col items-center gap-2 group cursor-pointer"
                       onClick={() => navigate(module.route)}
                    >
                       <div className={cn("w-16 h-16 md:w-20 md:h-20 rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:shadow-md flex items-center justify-center", "bg-gradient-to-br", module.gradient)}>
                          {React.cloneElement(module.icon as React.ReactElement, { className: "w-8 h-8 text-white" })}
                       </div>
                       <span className="text-xs md:text-sm font-medium text-center text-foreground/80 group-hover:text-primary transition-colors line-clamp-2 max-w-[80px] md:max-w-[100px]">
                          {module.title}
                       </span>
                    </div>
                 ))
               ) : (
                  <div className="col-span-full text-center py-10 text-muted-foreground">
                    Không tìm thấy kết quả phù hợp
                  </div>
               )}
            </div>
          </section>

          <div className="w-full h-px bg-border/50" />

          {/* Suggested For You (Horizontal Scroll) - Keep original list for suggestions unless heavily filtered? 
              Actually, usually suggestions are independent of search. Let's keep them as original 'priorityModules' 
              BUT if we are searching, maybe we should hide this section? 
              For simplicity and "pair programming" robustness, I'll keep it always visible as "Suggested"
          */}
          {!searchQuery && activeCategory === 'all' && (
            <section>
               <div className="flex items-center justify-between mb-4">
                 <h2 className="text-xl font-bold">Được đề xuất cho bạn</h2>
                 <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600 p-0 h-auto font-medium">
                    Xem tất cả <ChevronRight className="w-4 h-4 ml-1" />
                 </Button>
              </div>
              
              <ScrollArea className="w-full whitespace-nowrap pb-4">
                 <div className="flex w-max space-x-4">
                    {priorityModules.map((module) => (
                       <div 
                          key={`suggest-${module.id}`} 
                          className="w-[280px] md:w-[320px] space-y-3 cursor-pointer group"
                          onClick={() => navigate(module.route)}
                       >
                          <div className="relative aspect-[16/9] rounded-xl overflow-hidden">
                             <img 
                                src={module.image} 
                                alt={module.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                             />
                             <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                          </div>
                          <div className="flex items-start gap-3">
                             <div className={cn("shrink-0 w-10 h-10 rounded-lg flex items-center justify-center", "bg-gradient-to-br", module.gradient)}>
                                {React.cloneElement(module.icon as React.ReactElement, { className: "w-5 h-5 text-white" })}
                             </div>
                             <div className="flex-1 min-w-0 whitespace-normal">
                                <h3 className="font-semibold text-sm leading-tight">{module.title}</h3>
                                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{module.description}</p>
                             </div>
                             <div className="flex flex-col items-center">
                                <Button variant="secondary" size="sm" className="rounded-full font-semibold h-7 text-xs bg-secondary hover:bg-secondary/80 text-blue-500 px-3">
                                   NHẬN
                                </Button>
                                <span className="text-[10px] text-muted-foreground mt-1">Trong ứng dụng</span>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
                 <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </section>
          )}

        </div>
      </div>
    </div>
  );
};
