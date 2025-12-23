import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Search, Plus, Zap, Globe, MessageSquare, PenTool, BookOpen, Code, User, Briefcase, TrendingUp, MoreHorizontal, Star, Bell, Building2, Users, Layers, GraduationCap, Newspaper, HelpCircle, Heart, Share2, Lightbulb, Activity, ArrowLeft, MessageCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { LoginPage } from './LoginPage';

// --- Mock Data ---

const categories = [
  "Nổi bật", 
  "Doanh nghiệp", 
  "Cá nhân", 
  "Ngành nghề & Lĩnh vực", 
  "Nghiên cứu & Giáo dục", 
  "Cộng đồng", 
  "Tin tức", 
  "Hướng dẫn"
];

const featuredItems = [
  {
    id: 'f1',
    title: "Locaith Enterprise Suite",
    description: "Giải pháp toàn diện cho doanh nghiệp: Tự động hóa quy trình, phân tích dữ liệu lớn và quản trị thông minh.",
    author: "Locaith Official",
    rating: "5.0",
    views: "2.5M",
    icon: <Building2 className="h-8 w-8 text-primary" />,
    color: "from-brand-500/20 to-brand-600/20"
  },
  {
    id: 'f2',
    title: "Personal Growth Assistant",
    description: "Người bạn đồng hành phát triển bản thân: Lập kế hoạch, theo dõi thói quen và tối ưu hóa hiệu suất cá nhân.",
    author: "Life Coach Team",
    rating: "4.9",
    views: "1.8M",
    icon: <User className="h-8 w-8 text-secondary" />,
    color: "from-zinc-500/20 to-zinc-600/20"
  }
];

const businessItems = [
  { id: 'b1', title: "Quản trị Nhân sự AI", description: "Tự động hóa tuyển dụng, chấm công và đánh giá hiệu suất nhân viên.", author: "HR Tech", icon: <Users className="h-6 w-6 text-blue-500" /> },
  { id: 'b2', title: "Marketing Automation", description: "Lên chiến dịch, tối ưu quảng cáo và chăm sóc khách hàng tự động.", author: "MarTech Pro", icon: <Zap className="h-6 w-6 text-orange-500" /> },
  { id: 'b3', title: "Phân tích Tài chính", description: "Dự báo dòng tiền, phân tích báo cáo và rủi ro tài chính.", author: "FinExpert", icon: <TrendingUp className="h-6 w-6 text-green-500" /> },
  { id: 'b4', title: "Trợ lý Họp & Biên bản", description: "Ghi âm, tóm tắt và trích xuất nhiệm vụ từ cuộc họp.", author: "Office AI", icon: <MessageSquare className="h-6 w-6 text-purple-500" /> },
];

const personalItems = [
  { id: 'p1', title: "Trợ lý Lịch trình", description: "Sắp xếp cuộc hẹn và nhắc nhở thông minh.", author: "Time Master", icon: <Activity className="h-6 w-6 text-red-400" /> },
  { id: 'p2', title: "Huấn luyện viên Sức khỏe", description: "Theo dõi dinh dưỡng và chế độ tập luyện cá nhân hóa.", author: "Health AI", icon: <Heart className="h-6 w-6 text-rose-500" /> },
  { id: 'p3', title: "Quản lý Tài chính Cá nhân", description: "Theo dõi chi tiêu và lập kế hoạch tiết kiệm.", author: "Money Saver", icon: <Briefcase className="h-6 w-6 text-emerald-500" /> },
  { id: 'p4', title: "Sáng tạo Nội dung", description: "Hỗ trợ viết blog, caption mạng xã hội và kịch bản video.", author: "Content Creator", icon: <PenTool className="h-6 w-6 text-pink-500" /> },
];

const industryItems = [
  { id: 'i1', title: "Trợ lý Y khoa", description: "Hỗ trợ chẩn đoán sơ bộ và tra cứu thông tin thuốc.", author: "MedTech", icon: <Activity className="h-6 w-6 text-cyan-500" /> },
  { id: 'i2', title: "Tư vấn Pháp lý", description: "Soạn thảo hợp đồng và tra cứu văn bản pháp luật.", author: "Legal AI", icon: <BookOpen className="h-6 w-6 text-slate-500" /> },
  { id: 'i3', title: "Bất động sản Thông minh", description: "Định giá nhà đất và phân tích xu hướng thị trường.", author: "PropTech", icon: <Building2 className="h-6 w-6 text-amber-500" /> },
  { id: 'i4', title: "Thương mại Điện tử", description: "Tối ưu hóa gian hàng và phân tích hành vi người mua.", author: "Ecom Wizard", icon: <Globe className="h-6 w-6 text-indigo-500" /> },
];

const educationItems = [
  { id: 'e1', title: "Tổng hợp Tài liệu", description: "Tóm tắt sách, báo cáo khoa học và bài nghiên cứu.", author: "Scholar", icon: <GraduationCap className="h-6 w-6 text-blue-600" /> },
  { id: 'e2', title: "Gia sư STEM", description: "Hỗ trợ giải bài tập Toán, Lý, Hóa chi tiết.", author: "EduBot", icon: <Lightbulb className="h-6 w-6 text-yellow-500" /> },
  { id: 'e3', title: "Học Ngoại ngữ", description: "Luyện giao tiếp và sửa lỗi ngữ pháp thời gian thực.", author: "Lingua", icon: <Globe className="h-6 w-6 text-teal-500" /> },
  { id: 'e4', title: "Phân tích Dữ liệu", description: "Hỗ trợ xử lý số liệu thống kê cho bài nghiên cứu.", author: "Data Lab", icon: <TrendingUp className="h-6 w-6 text-violet-500" /> },
];

const communityItems = [
  { id: 'c1', title: "Thư viện Prompt", description: "Kho tàng các câu lệnh mẫu được cộng đồng bình chọn.", author: "Prompt Engineering", icon: <Share2 className="h-6 w-6 text-orange-400" /> },
  { id: 'c2', title: "Diễn đàn Thảo luận", description: "Nơi trao đổi kiến thức và kinh nghiệm về AI.", author: "AI Community", icon: <Users className="h-6 w-6 text-blue-400" /> },
  { id: 'c3', title: "Góc Sáng tạo", description: "Trưng bày các tác phẩm nghệ thuật tạo bởi AI.", author: "Art Gallery", icon: <Heart className="h-6 w-6 text-pink-400" /> },
];

const newsItems = [
  { id: 'n1', title: "Tin Công nghệ Hàng ngày", description: "Cập nhật mới nhất về thế giới công nghệ và AI.", author: "Tech News", icon: <Newspaper className="h-6 w-6 text-zinc-500" />, date: "1h ago" },
  { id: 'n2', title: "Xu hướng Thị trường AI", description: "Phân tích chuyên sâu về các chuyển động của ngành.", author: "Market Watch", icon: <TrendingUp className="h-6 w-6 text-green-600" />, date: "4h ago" },
];

const guideItems = [
  { id: 'g1', title: "Bắt đầu với Locaith", description: "Hướng dẫn cơ bản cho người mới bắt đầu.", author: "Locaith Support", icon: <HelpCircle className="h-6 w-6 text-primary" /> },
  { id: 'g2', title: "Kỹ thuật Prompt Nâng cao", description: "Tối ưu hóa câu lệnh để đạt kết quả tốt nhất.", author: "Locaith Academy", icon: <Code className="h-6 w-6 text-indigo-500" /> },
];

// --- Components ---

const ItemList = ({ items, showRank = false, onItemClick }: { items: any[], showRank?: boolean, onItemClick?: (item: any) => void }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
    {items.map((item, index) => (
      <div key={item.id} onClick={() => onItemClick && onItemClick(item)} className="group flex items-start gap-3 p-2 md:p-3 rounded-xl hover:bg-accent/50 transition-colors cursor-pointer border border-transparent hover:border-border">
        {showRank && (
          <span className="text-lg md:text-xl font-bold text-muted-foreground w-5 md:w-6 text-right group-hover:text-primary transition-colors">
            {index + 1}
          </span>
        )}
        <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-secondary/50 flex items-center justify-center flex-shrink-0 group-hover:shadow-[0_0_15px_hsla(var(--primary)/0.3)] transition-all duration-300 relative">
          {item.icon}
          {item.premium && (
             <div className="absolute -top-1 -right-1 h-3 w-3 md:h-4 md:w-4 bg-yellow-500 rounded-full border-2 border-background flex items-center justify-center" title="Premium">
                 <Star className="h-1.5 w-1.5 md:h-2 md:w-2 fill-black text-black" />
             </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground group-hover:text-primary truncate pr-2 text-sm md:text-base">{item.title}</h3>
              {item.date && <Badge variant="outline" className="text-[10px] h-4 md:h-5 px-1 border-primary/30 text-primary">{item.date}</Badge>}
          </div>
          <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{item.description}</p>
          <div className="flex items-center gap-2 mt-1 text-[10px] md:text-xs text-muted-foreground">
            <span>Bởi {item.author}</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary h-8 w-8 hover:bg-accent">
           <MessageSquare className="h-4 w-4" />
        </Button>
      </div>
    ))}
  </div>
);

export const ExploreFeature: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Nổi bật");
  const [searchQuery, setSearchQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [activeIframeUrl, setActiveIframeUrl] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleSearch = () => {
      if (!inputValue.trim()) {
          setSearchQuery("");
          return;
      }
      if (!isAuthenticated) {
          setShowLogin(true);
          return;
      }
      setSearchQuery(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          handleSearch();
      }
  };

  const handleItemClick = (item: any) => {
    if (!isAuthenticated) {
        setShowLogin(true);
        return;
    }
    if (item.title === "Trợ lý Lịch trình") {
      setActiveIframeUrl("https://dantri.com.vn/");
    }
  };

  const allItems = [
    ...featuredItems,
    ...businessItems,
    ...personalItems,
    ...industryItems,
    ...educationItems,
    ...communityItems,
    ...newsItems,
    ...guideItems
  ];

  const filteredItems = allItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const shouldShowSection = (categoryName: string) => {
      return activeTab === "Nổi bật" || activeTab === categoryName;
  };

  if (activeIframeUrl) {
      return (
          <div className="h-full w-full bg-background flex flex-col">
              <div className="flex items-center gap-2 p-4 border-b border-border neu-bg">
                  <Button variant="ghost" size="icon" onClick={() => setActiveIframeUrl(null)} className="neu-icon-btn h-9 w-9">
                      <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <span className="font-bold text-lg">Trợ lý Lịch trình</span>
              </div>
              <div className="flex-1 w-full h-full relative">
                   <iframe 
                       src={activeIframeUrl} 
                       className="absolute inset-0 w-full h-full border-none"
                       title="External Content"
                   />
              </div>
          </div>
      );
  }

  return (
    <>
      {showLogin && (
          <div className="fixed inset-0 z-[100] bg-background animate-in fade-in zoom-in duration-300">
              <LoginPage 
                  onLoginSuccess={() => setShowLogin(false)} 
                  onBack={() => setShowLogin(false)} 
              />
          </div>
      )}
    <div className="h-full w-full bg-background text-foreground overflow-y-auto relative selection:bg-primary/30 font-sans">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] opacity-40 animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] opacity-40 animate-pulse" style={{ animationDuration: '10s' }} />
          <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay dark:mix-blend-overlay"></div>
      </div>

      {/* Header Section - Mobile */}
      <div className="md:hidden sticky top-0 z-10 neu-bg border-b border-sidebar-border px-3 pt-[env(safe-area-inset-top)] h-[calc(3.5rem+env(safe-area-inset-top))] flex items-center gap-2 shadow-sm">
          <Button 
              size="icon" 
              className="neu-icon-btn shrink-0 h-9 w-9 hover:text-primary"
              onClick={() => navigate('/search')}
          >
              <Search className="h-4 w-4" />
          </Button>
          <div className="flex-1">
              <Input 
                  className="h-9 neu-input text-xs text-foreground placeholder:text-muted-foreground px-4 focus:ring-0" 
                  placeholder="Tìm kiếm trong khám phá..." 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
              />
          </div>
          <Button size="icon" className="neu-icon-btn shrink-0 relative h-9 w-9 hover:text-primary">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 bg-red-500 rounded-full border border-background"></span>
          </Button>
      </div>

      {/* Header Section - Desktop */}
      <div className="hidden md:block sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="font-bold text-lg tracking-tight text-foreground">Khám phá Locaith AI</div>
            <div className="flex items-center gap-3">
                <Button variant="ghost" className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent">
                    Locaith của tôi
                </Button>
            </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 md:px-6 pb-32 space-y-4 md:space-y-10 relative z-0">
        
        {/* Hero Search Section */}
        <div className="hidden md:block pt-8 text-center space-y-6">
            <div className="max-w-2xl mx-auto relative group">
                <div className="absolute inset-0 bg-primary/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                    <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors cursor-pointer" onClick={handleSearch} />
                    <Input 
                        className="h-12 pl-12 bg-secondary/50 border-border hover:bg-accent hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/50 text-lg text-foreground placeholder:text-muted-foreground shadow-inner transition-all duration-300" 
                        placeholder="Tìm kiếm trong khám phá..." 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>
            </div>
        </div>

        {/* Categories Tabs */}
        <div className="relative">
             <ScrollArea className="w-full whitespace-nowrap pb-2">
                <div className="flex w-max space-x-2">
                    {categories.map((cat) => (
                        <Button
                            key={cat}
                            variant="ghost"
                            onClick={() => setActiveTab(cat)}
                            className={cn(
                                "rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-300 h-auto border",
                                activeTab === cat 
                                    ? "bg-foreground text-background border-foreground hover:bg-foreground/90 shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(255,255,255,0.3)]" 
                                    : "bg-secondary/50 text-muted-foreground border-transparent hover:text-foreground hover:bg-accent hover:border-border"
                            )}
                        >
                            {cat}
                        </Button>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>
        </div>

        {searchQuery ? (
            /* Search Results */
            <section className="space-y-4">
                <div className="flex items-end justify-between border-b border-border pb-2">
                    <div>
                        <h2 className="text-lg md:text-2xl font-bold text-foreground">Kết quả tìm kiếm</h2>
                        <p className="text-xs md:text-base text-muted-foreground mt-1">
                            Tìm thấy {filteredItems.length} kết quả cho "{searchQuery}"
                        </p>
                    </div>
                </div>
                
                {filteredItems.length > 0 ? (
                    <ItemList items={filteredItems} onItemClick={handleItemClick} />
                ) : (
                    <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl bg-secondary/50">
                        <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-lg font-medium text-foreground">Không tìm thấy nội dung nào</p>
                        <p className="text-sm">Hãy thử tìm kiếm với từ khóa khác</p>
                    </div>
                )}
            </section>
        ) : (
            <>
                {/* Featured Section */}
                {shouldShowSection("Nổi bật") && (
                  <section className="space-y-4">
                      <h2 className="text-lg md:text-2xl font-bold text-foreground flex items-center gap-2">
                          Nổi bật
                          <Badge variant="secondary" className="text-xs font-normal bg-primary/10 text-primary border-primary/20">Lựa chọn hàng đầu</Badge>
                      </h2>
                      <p className="text-xs md:text-base text-muted-foreground">Lựa chọn hàng đầu được tuyển chọn tuần này</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                          {featuredItems.map((item) => (
                              <div key={item.id} onClick={() => handleItemClick(item)} className={`group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${item.color} p-4 md:p-6 transition-all duration-300 hover:border-primary/50 box-glow cursor-pointer`}>
                                  <div className="relative z-10 flex items-start gap-3 md:gap-4">
                                      <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-background/40 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 border border-border/20">
                                          {React.cloneElement(item.icon as React.ReactElement, { className: "h-6 w-6 md:h-8 md:w-8" })}
                                      </div>
                                      <div className="flex-1 space-y-1 md:space-y-2">
                                          <div className="flex items-center justify-between">
                                              <h3 className="text-lg md:text-xl font-bold text-foreground group-hover:text-primary transition-colors">{item.title}</h3>
                                              <Badge className="bg-background/40 backdrop-blur text-foreground border-border text-[10px] md:text-xs">Nổi bật</Badge>
                                          </div>
                                          <p className="text-xs md:text-sm text-foreground/80 line-clamp-2 font-medium leading-relaxed">{item.description}</p>
                                          <div className="flex items-center gap-3 md:gap-4 pt-2 text-[10px] md:text-xs text-foreground/60 font-medium">
                                              <span>Bởi {item.author}</span>
                                              <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-current" /> {item.rating}</span>
                                              <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {item.views}</span>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </section>
                )}

                {/* Business Section */}
                {shouldShowSection("Doanh nghiệp") && (
                  <section className="space-y-4">
                      <div className="flex items-end justify-between border-b border-border pb-2">
                          <div>
                              <h2 className="text-lg md:text-2xl font-bold text-foreground">Doanh nghiệp</h2>
                              <p className="text-xs md:text-base text-muted-foreground mt-1">Giải pháp chuyên nghiệp cho tổ chức và công ty</p>
                          </div>
                          <Button variant="link" className="text-primary p-0 h-auto font-medium hover:text-primary/80 text-xs md:text-sm">Xem thêm</Button>
                      </div>
                      <ItemList items={businessItems} />
                  </section>
                )}

                {/* Personal Section */}
                {shouldShowSection("Cá nhân") && (
                  <section className="space-y-4">
                      <div className="flex items-end justify-between border-b border-border pb-2">
                          <div>
                              <h2 className="text-lg md:text-2xl font-bold text-foreground">Cá nhân</h2>
                              <p className="text-xs md:text-base text-muted-foreground mt-1">Nâng cao chất lượng cuộc sống và hiệu suất cá nhân</p>
                          </div>
                          <Button variant="link" className="text-primary p-0 h-auto font-medium hover:text-primary/80 text-xs md:text-sm">Xem thêm</Button>
                      </div>
                      <ItemList items={personalItems} onItemClick={handleItemClick} />
                  </section>
                )}

                {/* Industry Section */}
                {shouldShowSection("Ngành nghề & Lĩnh vực") && (
                  <section className="space-y-4">
                      <div className="flex items-end justify-between border-b border-border pb-2">
                          <div>
                              <h2 className="text-lg md:text-2xl font-bold text-foreground">Ngành nghề & Lĩnh vực</h2>
                              <p className="text-xs md:text-base text-muted-foreground mt-1">Ứng dụng chuyên sâu cho từng lĩnh vực cụ thể</p>
                          </div>
                          <Button variant="link" className="text-primary p-0 h-auto font-medium hover:text-primary/80 text-xs md:text-sm">Xem thêm</Button>
                      </div>
                      <ItemList items={industryItems} />
                  </section>
                )}

                {/* Research & Education Section */}
                {shouldShowSection("Nghiên cứu & Giáo dục") && (
                  <section className="space-y-4">
                      <div className="flex items-end justify-between border-b border-border pb-2">
                          <div>
                              <h2 className="text-lg md:text-2xl font-bold text-foreground">Nghiên cứu & Giáo dục</h2>
                              <p className="text-xs md:text-base text-muted-foreground mt-1">Hỗ trợ học tập, giảng dạy và nghiên cứu khoa học</p>
                          </div>
                          <Button variant="link" className="text-primary p-0 h-auto font-medium hover:text-primary/80 text-xs md:text-sm">Xem thêm</Button>
                      </div>
                      <ItemList items={educationItems} />
                  </section>
                )}

                {/* Community Section */}
                {shouldShowSection("Cộng đồng") && (
                  <section className="space-y-4">
                      <div className="flex items-end justify-between border-b border-border pb-2">
                          <div>
                              <h2 className="text-lg md:text-2xl font-bold text-foreground">Cộng đồng</h2>
                              <p className="text-xs md:text-base text-muted-foreground mt-1">Kết nối, chia sẻ và lấy cảm hứng từ cộng đồng</p>
                          </div>
                          <Button variant="link" className="text-primary p-0 h-auto font-medium hover:text-primary/80 text-xs md:text-sm">Xem thêm</Button>
                      </div>
                      <ItemList items={communityItems} />
                  </section>
                )}

                {/* News Section */}
                {shouldShowSection("Tin tức") && (
                  <section className="space-y-4">
                      <div className="flex items-end justify-between border-b border-border pb-2">
                          <div>
                              <h2 className="text-lg md:text-2xl font-bold text-foreground">Tin tức</h2>
                              <p className="text-xs md:text-base text-muted-foreground mt-1">Cập nhật thông tin mới nhất về công nghệ và thị trường</p>
                          </div>
                          <Button variant="link" className="text-primary p-0 h-auto font-medium hover:text-primary/80 text-xs md:text-sm">Xem thêm</Button>
                      </div>
                      <ItemList items={newsItems} />
                  </section>
                )}

                {/* Guide Section */}
                {shouldShowSection("Hướng dẫn") && (
                  <section className="space-y-4">
                      <div className="flex items-end justify-between border-b border-border pb-2">
                          <div>
                              <h2 className="text-lg md:text-2xl font-bold text-foreground">Hướng dẫn</h2>
                              <p className="text-xs md:text-base text-muted-foreground mt-1">Tài liệu và hướng dẫn sử dụng chi tiết</p>
                          </div>
                          <Button variant="link" className="text-primary p-0 h-auto font-medium hover:text-primary/80 text-xs md:text-sm">Xem thêm</Button>
                      </div>
                      <ItemList items={guideItems} />
                  </section>
                )}
            </>
        )}
      </div>
    </div>
    </>
  );
};
