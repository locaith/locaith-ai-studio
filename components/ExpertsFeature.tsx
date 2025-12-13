import React, { useState } from 'react';
import { Search, Plus, Filter, Star, CheckCircle2, MapPin, Building2, Trophy, DollarSign, Clock, Shield, Award, Briefcase, GraduationCap, ChevronRight, ChevronLeft, User, Info, Calendar, Mail, Phone, Globe } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { HireExpertModal } from './HireExpertModal';
import { RegisterExpertModal } from './RegisterExpertModal';
import { GlobalSidebar, FeatureType } from './GlobalSidebar';
import { useNavigate } from 'react-router-dom';
import { useLayoutContext } from '../src/context/LayoutContext';

// --- Mock Data ---

const expertCategories = [
  { id: "all", label: "Tất cả" },
  { id: "dev", label: "Lập trình & IT" },
  { id: "ai", label: "Chuyên gia AI" },
  { id: "design", label: "Thiết kế & Sáng tạo" },
  { id: "marketing", label: "Marketing & SEO" },
  { id: "finance", label: "Tài chính & Đầu tư" },
  { id: "legal", label: "Pháp lý" },
  { id: "education", label: "Giáo dục & Đào tạo" },
];

const mockExperts = [
  {
    id: "EXP-001",
    name: "Tiến sĩ Trần Minh Tuấn",
    role: "AI Research Scientist",
    company: "Locaith AI Lab",
    avatar: "MT",
    image: "",
    rating: 5.0,
    reviews: 142,
    price: "2.500.000 VNĐ/giờ",
    deposit: "1.000.000 VNĐ",
    location: "Hà Nội",
    verified: true,
    achievements: ["Locaith Top Expert", "100+ Dự án thành công", "PhD Computer Science"],
    skills: ["Machine Learning", "Deep Learning", "NLP", "Python"],
    category: "ai",
    bio: "Chuyên gia hàng đầu về AI với hơn 10 năm nghiên cứu và phát triển các mô hình ngôn ngữ lớn. Tư vấn giải pháp chuyển đổi số cho doanh nghiệp.",
    requirements: "Chỉ nhận dự án có quy mô doanh nghiệp hoặc tư vấn chiến lược dài hạn.",
    education: [
      { degree: "Tiến sĩ Khoa học Máy tính", school: "Đại học Stanford", year: "2015" },
      { degree: "Thạc sĩ Trí tuệ Nhân tạo", school: "Đại học Bách Khoa Hà Nội", year: "2010" }
    ],
    experience: [
      { role: "AI Research Lead", company: "Google AI", period: "2015-2020", description: "Dẫn dắt đội ngũ nghiên cứu NLP và Machine Translation." },
      { role: "Senior Data Scientist", company: "FPT Software", period: "2010-2015", description: "Phát triển các giải pháp AI cho khách hàng doanh nghiệp." }
    ],
    stats: {
      projectsCompleted: 156,
      hoursWorked: 12000,
      responseTime: "30 phút"
    }
  },
  {
    id: "EXP-002",
    name: "Nguyễn Thu Hà",
    role: "Senior UI/UX Designer",
    company: "Freelance",
    avatar: "TH",
    image: "",
    rating: 4.9,
    reviews: 89,
    price: "1.200.000 VNĐ/giờ",
    deposit: "500.000 VNĐ",
    location: "TP. Hồ Chí Minh",
    verified: true,
    achievements: ["Best Design Award 2023", "Top Rated Seller"],
    skills: ["Figma", "Adobe XD", "User Research", "Prototyping"],
    category: "design",
    bio: "Nhà thiết kế trải nghiệm người dùng đam mê tạo ra các sản phẩm kỹ thuật số trực quan và dễ sử dụng. Phong cách hiện đại, tối giản.",
    requirements: "Cần brief rõ ràng trước khi bắt đầu. Có thể làm việc onsite tại HCM.",
    education: [
      { degree: "Cử nhân Thiết kế Đồ họa", school: "Đại học Mỹ thuật TP.HCM", year: "2018" }
    ],
    experience: [
      { role: "Senior Designer", company: "VNG Corporation", period: "2018-2022", description: "Thiết kế UI cho ZaloPay và Zalo." },
      { role: "Freelancer", company: "Tự do", period: "2022-Nay", description: "Hợp tác với các studio thiết kế quốc tế." }
    ],
    stats: {
      projectsCompleted: 89,
      hoursWorked: 5000,
      responseTime: "1 giờ"
    }
  },
  {
    id: "EXP-003",
    name: "Lê Văn Hùng",
    role: "Fullstack Developer",
    company: "Tech Corp",
    avatar: "LH",
    image: "",
    rating: 4.8,
    reviews: 215,
    price: "800.000 VNĐ/giờ",
    deposit: "Không yêu cầu",
    location: "Đà Nẵng",
    verified: true,
    achievements: ["Top 1% Developer", "Fast Delivery"],
    skills: ["React", "Node.js", "AWS", "TypeScript"],
    category: "dev",
    bio: "Lập trình viên Fullstack với kinh nghiệm xây dựng các hệ thống web quy mô lớn. Cam kết code sạch, tối ưu hiệu năng.",
    requirements: "Nhận dự án outsource hoặc maintain hệ thống.",
    education: [
      { degree: "Kỹ sư Công nghệ Thông tin", school: "Đại học Bách Khoa Đà Nẵng", year: "2016" }
    ],
    experience: [
      { role: "Backend Developer", company: "FPT Software", period: "2016-2019", description: "Tham gia dự án Migration hệ thống ngân hàng." },
      { role: "Fullstack Lead", company: "Smart Dev", period: "2019-2023", description: "Xây dựng nền tảng E-commerce cho thị trường Nhật." }
    ],
    stats: {
      projectsCompleted: 200,
      hoursWorked: 15000,
      responseTime: "15 phút"
    }
  },
  {
    id: "EXP-004",
    name: "Phạm Thị Mai",
    role: "Digital Marketing Manager",
    company: "Global Agency",
    avatar: "PM",
    image: "",
    rating: 4.7,
    reviews: 56,
    price: "1.500.000 VNĐ/giờ",
    deposit: "500.000 VNĐ",
    location: "Remote",
    verified: true,
    achievements: ["Google Certified", "Meta Blueprint"],
    skills: ["SEO", "Google Ads", "Social Media", "Content Strategy"],
    category: "marketing",
    bio: "Chuyên gia Marketing giúp doanh nghiệp tăng trưởng doanh thu qua các kênh số. Tư vấn chiến lược tổng thể.",
    requirements: "Cần quyền truy cập vào các tài khoản quảng cáo để audit.",
    education: [
      { degree: "Cử nhân Quản trị Kinh doanh", school: "Đại học Ngoại Thương", year: "2014" }
    ],
    experience: [
      { role: "Marketing Executive", company: "VinGroup", period: "2014-2017", description: "Quản lý chiến dịch branding cho VinHomes." },
      { role: "Digital Manager", company: "Global Agency", period: "2017-Nay", description: "Tư vấn cho hơn 50 thương hiệu lớn." }
    ],
    stats: {
      projectsCompleted: 56,
      hoursWorked: 8000,
      responseTime: "2 giờ"
    }
  },
  {
    id: "EXP-005",
    name: "Luật sư Nguyễn An",
    role: "Luật sư Kinh tế",
    company: "Văn phòng Luật An & Partners",
    avatar: "NA",
    rating: 5.0,
    reviews: 34,
    price: "3.000.000 VNĐ/giờ",
    deposit: "1.500.000 VNĐ",
    location: "Hà Nội",
    verified: true,
    achievements: ["15 năm kinh nghiệm", "Luật sư giỏi"],
    skills: ["Luật Doanh nghiệp", "Hợp đồng", "Sở hữu trí tuệ"],
    category: "legal",
    bio: "Tư vấn pháp lý cho doanh nghiệp start-up và tập đoàn đa quốc gia. Soạn thảo và rà soát hợp đồng thương mại.",
    requirements: "Đặt lịch trước ít nhất 3 ngày.",
    education: [
      { degree: "Thạc sĩ Luật Kinh tế", school: "Đại học Luật Hà Nội", year: "2008" }
    ],
    experience: [
      { role: "Senior Associate", company: "Baker McKenzie", period: "2008-2015", description: "Tư vấn M&A và đầu tư nước ngoài." },
      { role: "Partner", company: "Luật An & Partners", period: "2015-Nay", description: "Điều hành văn phòng luật sư riêng." }
    ],
    stats: {
      projectsCompleted: 500,
      hoursWorked: 25000,
      responseTime: "24 giờ"
    }
  },
  {
    id: "EXP-006",
    name: "Hoàng Minh",
    role: "Chuyên gia Tài chính",
    company: "Invest Group",
    avatar: "HM",
    rating: 4.6,
    reviews: 28,
    price: "2.000.000 VNĐ/giờ",
    deposit: "1.000.000 VNĐ",
    location: "TP. Hồ Chí Minh",
    verified: false,
    achievements: ["CFA Level 3"],
    skills: ["Phân tích tài chính", "Đầu tư", "Quản lý rủi ro"],
    category: "finance",
    bio: "Hỗ trợ cá nhân và doanh nghiệp quản lý tài chính hiệu quả, tối ưu hóa dòng tiền và danh mục đầu tư.",
    requirements: "Cung cấp báo cáo tài chính 3 tháng gần nhất.",
    education: [
      { degree: "Thạc sĩ Tài chính", school: "Đại học Kinh tế Quốc dân", year: "2012" }
    ],
    experience: [
      { role: "Investment Analyst", company: "Dragon Capital", period: "2012-2016", description: "Phân tích cơ hội đầu tư trên thị trường chứng khoán." },
      { role: "Financial Advisor", company: "Invest Group", period: "2016-Nay", description: "Tư vấn tài chính cá nhân cho khách hàng VIP." }
    ],
    stats: {
      projectsCompleted: 120,
      hoursWorked: 6000,
      responseTime: "4 giờ"
    }
  },
];



export const ExpertsFeature = () => {
  const navigate = useNavigate();
  const { setIsCollapsed } = useLayoutContext();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [hiringExpert, setHiringExpert] = useState<typeof mockExperts[0] | null>(null);
  const [selectedExpert, setSelectedExpert] = useState<typeof mockExperts[0] | null>(null);

  const handleNavigate = (feature: FeatureType) => {
    setSelectedExpert(null);
    
    if (feature === 'chat') {
      setIsCollapsed(true);
    } else {
      setIsCollapsed(false);
    }

    if (feature === 'dashboard') navigate('/');
     else if (feature === 'web-builder') navigate('/builder');
     else if (feature === 'design') navigate('/design');
     else if (feature === 'fashion') navigate('/fashion');
     else if (feature === 'text') navigate('/compose');
     else if (feature === 'search') navigate('/search');
     else if (feature === 'apps') navigate('/apps');
     else if (feature === 'explore') navigate('/explore');
     else if (feature === 'jobs') navigate('/giao-viec-lam');
     else if (feature === 'experts') navigate('/chuyen-gia');
     else if (feature === 'automation') navigate('/automation');
     else if (feature === 'voice') navigate('/voice');
     else if (feature === 'chat') navigate('/chat');
     else if (feature === 'check') navigate('/check');
     else if (feature === 'profile') navigate('/profile');
     else if (feature === 'projects') navigate('/projects');
     else if (feature === 'settings') navigate('/settings');
  };

  const filteredExperts = mockExperts.filter(expert => {
    const matchesCategory = selectedCategory === "all" || expert.category === selectedCategory;
    const matchesSearch = expert.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          expert.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          expert.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="h-full w-full bg-slate-50/50 dark:bg-background text-foreground overflow-y-auto relative font-sans animate-fade-in-up">
      
      {/* Header - Compact & Sticky */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50 pt-[env(safe-area-inset-top)] h-[calc(4rem+env(safe-area-inset-top))]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-w-fit">
                <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
                    <Award className="h-5 w-5" />
                </div>
                <span className="font-bold text-lg hidden md:block">Chuyên gia</span>
            </div>

            <div className="flex-1 max-w-2xl relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    className="pl-9 bg-secondary/50 border-transparent focus:bg-background focus:border-primary/20 transition-all rounded-full h-10" 
                    placeholder="Tìm kiếm chuyên gia theo tên, kỹ năng..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="flex items-center gap-3 min-w-fit">
                <Button 
                    className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 border-0"
                    onClick={() => setIsRegisterOpen(true)}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Đăng ký
                </Button>
                <RegisterExpertModal open={isRegisterOpen} onOpenChange={setIsRegisterOpen} />
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8 pb-32">
        
        {/* Filters - Sticky below header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 sticky top-[calc(4rem+env(safe-area-inset-top))] z-30 py-2 bg-slate-50/50 dark:bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <ScrollArea className="w-full max-w-[calc(100vw-32px)]">
                <div className="flex items-center gap-2">
                    {expertCategories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                                selectedCategory === cat.id
                                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                    : "bg-background border border-border hover:bg-secondary hover:text-foreground"
                            )}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>
        </div>

        {/* Experts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredExperts.map((expert) => (
              <div 
            key={expert.id}
            className="group relative bg-white dark:bg-secondary/20 border border-transparent hover:border-primary/20 rounded-xl p-3 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 flex flex-col gap-3 cursor-pointer"
            onClick={() => setSelectedExpert(expert)}
          >
                {/* Header: Avatar, Info, Badge */}
                <div className="flex gap-3">
                    <div className="relative shrink-0">
                      <Avatar className="h-10 w-10 rounded-lg border border-border/50">
                        <AvatarImage src={expert.image} alt={expert.name} className="object-cover" />
                        <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold text-xs">
                          {expert.avatar}
                        </AvatarFallback>
                      </Avatar>
                      {expert.verified && (
                        <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 border border-background">
                          <CheckCircle2 className="w-3 h-3 text-blue-500 fill-blue-500/10" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <span className="text-[10px] font-mono text-muted-foreground mb-0.5 block">{expert.id}</span>
                                <h3 className="font-bold text-sm group-hover:text-primary transition-colors truncate" title={expert.name}>{expert.name}</h3>
                                <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
                                    <Briefcase className="w-3 h-3" />
                                    {expert.role}
                                </p>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-yellow-600 bg-yellow-500/10 px-1.5 py-0.5 rounded-full shrink-0">
                                <Star className="w-2.5 h-2.5 fill-yellow-500" />
                                <span className="font-medium">{expert.rating}</span>
                                <span className="text-muted-foreground/70">({expert.reviews})</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground truncate">
                            <Building2 className="w-3 h-3 shrink-0" />
                            <span className="truncate">{expert.company}</span>
                        </div>
                    </div>
                </div>

                {/* Body: Bio & Requirements */}
                <div className="flex-1 min-w-0 space-y-2">
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-snug">
                        {expert.bio}
                    </p>
                    
                    <div className="bg-secondary/30 p-2 rounded-lg border border-border/50">
                         <div className="flex items-start gap-1.5">
                            <span className="text-[10px] font-semibold text-primary shrink-0 whitespace-nowrap">Yêu cầu:</span>
                            <p className="text-[10px] text-foreground/80 line-clamp-2 leading-relaxed">{expert.requirements}</p>
                         </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        {expert.skills.slice(0, 3).map((skill, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-secondary/50 text-foreground/70 border border-border/50 whitespace-nowrap">
                            {skill}
                        </span>
                        ))}
                        {expert.skills.length > 3 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-secondary/50 text-muted-foreground border border-border/50">
                            +{expert.skills.length - 3}
                        </span>
                        )}
                    </div>
                </div>

                {/* Footer: Price & Action */}
                <div className="pt-3 border-t border-border/50 flex items-end justify-between gap-2">
                    <div className="flex flex-col min-w-0 gap-1 mb-0.5">
                        <div className="flex items-center gap-1.5 text-sm font-bold text-green-600 dark:text-green-400">
                            {expert.price}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                            <span>Cọc:</span>
                            <span className="text-orange-600 dark:text-orange-400">{expert.deposit}</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-1.5 shrink-0 min-w-[90px] md:min-w-[100px]">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 w-full justify-center rounded-md text-[11px] md:text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/5"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedExpert(expert);
                          }}
                        >
                            <Info className="w-3.5 h-3.5 mr-1.5" />
                            Thông tin
                        </Button>
                        <Button 
                          size="sm" 
                          className="h-8 w-full justify-center rounded-md text-[11px] md:text-xs font-bold bg-primary/10 text-primary hover:bg-primary hover:text-white shadow-none hover:shadow-md transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            setHiringExpert(expert);
                          }}
                        >
                            Thuê ngay
                        </Button>
                    </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Expert Detail Dialog */}
    <Dialog open={!!selectedExpert} onOpenChange={(open) => !open && setSelectedExpert(null)}>
        <DialogContent hideClose={true} className="!fixed !inset-0 !left-0 !top-0 !translate-x-0 !translate-y-0 !max-w-[100vw] !w-screen !h-screen !p-0 !gap-0 !border-none !shadow-none !bg-background !rounded-none !overflow-hidden !flex !flex-col !z-[100] focus:outline-none data-[state=open]:!slide-in-from-bottom-0 data-[state=open]:!slide-in-from-top-0 data-[state=open]:!zoom-in-100">
            {selectedExpert && (
                <div className="flex w-full h-full bg-slate-50/30 dark:bg-background relative overflow-hidden">
                    {/* Global Sidebar - Desktop */}
                    <div className="hidden lg:block h-full border-r border-border shrink-0 z-50 bg-background w-[240px] xl:w-[260px]">
                        <GlobalSidebar 
                            activeFeature="experts" 
                            onSelect={handleNavigate} 
                            currentTheme="default" 
                            onThemeChange={() => {}} 
                            isCollapsed={false}
                        />
                    </div>

                    <div className="flex flex-col flex-1 h-full min-w-0 relative">
                        {/* Top Navigation Bar */}
                        <div className="h-14 border-b border-border/40 bg-background/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 shrink-0 z-40 sticky top-0">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="gap-2 -ml-2 text-muted-foreground hover:text-foreground"
                                onClick={() => setSelectedExpert(null)}
                            >
                                <ChevronLeft className="w-5 h-5" />
                                <span className="font-medium">Quay lại</span>
                            </Button>
                            <div className="text-sm font-semibold text-foreground/80 hidden md:block">
                                Hồ sơ chuyên gia
                            </div>
                            <div className="w-20" /> {/* Spacer for centering if needed */}
                        </div>

                        <ScrollArea className="flex-1 w-full h-full">
                            <div className="max-w-7xl mx-auto w-full p-4 md:p-8">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                    
                                    {/* MAIN CONTENT (Bio, Exp, etc.) - LEFT/CENTER */}
                                    <div className="lg:col-span-8 xl:col-span-9 space-y-4 order-2 lg:order-1">
                                        {/* Bio */}
                                        <section className="bg-background rounded-xl border border-border/50 shadow-sm p-4 md:p-5">
                                            <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2 flex items-center gap-2">
                                                <User className="w-3.5 h-3.5" /> Giới thiệu
                                            </h3>
                                            <p className="text-sm text-foreground/80 leading-relaxed text-justify">
                                                {selectedExpert.bio}
                                            </p>
                                        </section>

                                        {/* Experience */}
                                        {selectedExpert.experience && (
                                        <section className="bg-background rounded-xl border border-border/50 shadow-sm p-4 md:p-5">
                                            <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-4 flex items-center gap-2">
                                                <Briefcase className="w-3.5 h-3.5" /> Kinh nghiệm làm việc
                                            </h3>
                                            <div className="space-y-5 relative pl-2">
                                                <div className="absolute left-[7px] top-2 bottom-2 w-[1px] bg-border" />
                                                {selectedExpert.experience.map((exp: any, i: number) => (
                                                    <div key={i} className="relative pl-6 group">
                                                        <div className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-[3px] border-background bg-primary/50 group-hover:bg-primary transition-colors shadow-sm z-10" />
                                                        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-1">
                                                            <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{exp.role}</h4>
                                                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                                                                {exp.period}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                                                            <Building2 className="w-3 h-3" /> {exp.company}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                                            {exp.description}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Education */}
                                            {selectedExpert.education && (
                                            <section className="bg-background rounded-xl border border-border/50 shadow-sm p-4 h-full">
                                                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-3 flex items-center gap-2">
                                                    <GraduationCap className="w-3.5 h-3.5" /> Học vấn
                                                </h3>
                                                <div className="space-y-3">
                                                    {selectedExpert.education.map((edu: any, i: number) => (
                                                        <div key={i} className="flex gap-3 items-start">
                                                            <div className="mt-0.5 p-1.5 bg-secondary/30 rounded-md text-primary shrink-0">
                                                                <Award className="w-3.5 h-3.5" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-xs text-foreground">{edu.degree}</h4>
                                                                <div className="text-xs text-muted-foreground mt-0.5">{edu.school}</div>
                                                                <div className="text-[10px] text-muted-foreground/70 mt-0.5 font-mono">{edu.year}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </section>
                                            )}

                                            {/* Achievements */}
                                            <section className="bg-background rounded-xl border border-border/50 shadow-sm p-4 h-full">
                                                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-3 flex items-center gap-2">
                                                    <Trophy className="w-3.5 h-3.5" /> Thành tích
                                                </h3>
                                                <div className="space-y-2.5">
                                                    {selectedExpert.achievements.map((ach: string, i: number) => (
                                                        <div key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                                                            <div className="mt-0.5 text-yellow-500 shrink-0">
                                                                <Star className="w-3 h-3 fill-yellow-500" />
                                                            </div>
                                                            <span className="leading-snug">{ach}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </section>
                                        </div>
                                        
                                        {/* Requirements */}
                                        <section className="bg-secondary/20 rounded-xl border border-border/50 p-4">
                                            <div className="flex gap-3">
                                                <div className="p-1.5 bg-secondary rounded-md text-muted-foreground h-fit shrink-0">
                                                    <Shield className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-bold text-foreground mb-1">Yêu cầu hợp tác</h4>
                                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                                        {selectedExpert.requirements}
                                                    </p>
                                                </div>
                                            </div>
                                        </section>
                                    </div>

                                    {/* RIGHT SIDEBAR (Profile Card) */}
                                    <div className="lg:col-span-4 xl:col-span-3 space-y-4 lg:sticky lg:top-4 order-1 lg:order-2">
                                        {/* Main Profile Card */}
                                        <div className="bg-background rounded-xl border border-border/50 shadow-sm overflow-hidden group">
                                            {/* Cover - Compact */}
                                            <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                                                <div className="absolute inset-0 bg-grid-white/[0.1] bg-[size:20px_20px] opacity-30"/>
                                            </div>
                                            
                                            <div className="px-5 pb-5 relative">
                                                {/* Avatar */}
                                                <div className="-mt-10 mb-3 flex justify-between items-end">
                                                    <Avatar className="h-20 w-20 rounded-2xl border-[4px] border-background shadow-md bg-background">
                                                        <AvatarImage src={selectedExpert.image} alt={selectedExpert.name} className="object-cover" />
                                                        <AvatarFallback className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 text-xl font-bold">{selectedExpert.avatar}</AvatarFallback>
                                                    </Avatar>
                                                    {selectedExpert.verified && (
                                                        <div className="mb-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md text-[10px] font-bold border border-blue-100 flex items-center gap-1">
                                                            <CheckCircle2 className="w-3 h-3" /> VERIFIED
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Identity */}
                                                <div className="space-y-1 mb-4">
                                                    <h2 className="text-lg font-bold text-foreground leading-tight">{selectedExpert.name}</h2>
                                                    <p className="text-sm font-medium text-primary">{selectedExpert.role}</p>
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                                                        <Building2 className="w-3.5 h-3.5" />
                                                        <span className="truncate">{selectedExpert.company}</span>
                                                    </div>
                                                </div>

                                                {/* Meta Info */}
                                                <div className="space-y-2.5 py-4 border-t border-border/50">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <MapPin className="w-4 h-4" />
                                                            <span className="text-xs">Địa điểm</span>
                                                        </div>
                                                        <span className="text-xs font-medium">{selectedExpert.location}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <Star className="w-4 h-4" />
                                                            <span className="text-xs">Đánh giá</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-xs font-bold">{selectedExpert.rating}</span>
                                                            <span className="text-[10px] text-muted-foreground">({selectedExpert.reviews})</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <Clock className="w-4 h-4" />
                                                            <span className="text-xs">Kinh nghiệm</span>
                                                        </div>
                                                        <span className="text-xs font-medium">{selectedExpert.experience ? `${selectedExpert.experience.length} vị trí` : 'N/A'}</span>
                                                    </div>
                                                </div>

                                                {/* Price & Actions */}
                                                <div className="pt-4 border-t border-border/50 space-y-3">
                                                    <div className="flex items-end justify-between mb-1">
                                                        <div className="text-xs text-muted-foreground font-medium">Chi phí thuê</div>
                                                        <div className="text-lg font-bold text-primary">{selectedExpert.price}</div>
                                                    </div>
                                                    
                                                    <div className="grid gap-2">
                                                        <Button 
                                                            onClick={() => setHiringExpert(selectedExpert)} 
                                                            className="w-full h-9 text-sm font-bold bg-primary hover:bg-primary/90 shadow-sm"
                                                        >
                                                            Thuê ngay
                                                        </Button>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <Button variant="outline" className="h-8 text-xs font-medium">
                                                                <Mail className="w-3.5 h-3.5 mr-1.5" /> Nhắn tin
                                                            </Button>
                                                            <Button variant="outline" className="h-8 text-xs font-medium">
                                                                <Star className="w-3.5 h-3.5 mr-1.5" /> Lưu
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Skills Card */}
                                        <div className="bg-background rounded-xl border border-border/50 shadow-sm p-4 space-y-3">
                                            <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                                                <Trophy className="w-3.5 h-3.5" /> Kỹ năng
                                            </h3>
                                            <div className="flex flex-wrap gap-1.5">
                                                {selectedExpert.skills.map((skill: string, i: number) => (
                                                    <Badge key={i} variant="secondary" className="px-2 py-0.5 text-[11px] font-normal bg-secondary/50 border border-border/50 text-foreground">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Stats Card */}
                                        {selectedExpert.stats && (
                                            <div className="bg-background rounded-xl border border-border/50 shadow-sm p-4 space-y-3">
                                                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                                                    <Info className="w-3.5 h-3.5" /> Hoạt động
                                                </h3>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div className="text-center p-2 bg-secondary/20 rounded-lg">
                                                        <div className="text-xs font-bold text-foreground">{selectedExpert.stats.projectsCompleted}</div>
                                                        <div className="text-[9px] text-muted-foreground uppercase mt-0.5">Dự án</div>
                                                    </div>
                                                    <div className="text-center p-2 bg-secondary/20 rounded-lg">
                                                        <div className="text-xs font-bold text-foreground">{Math.floor(selectedExpert.stats.hoursWorked / 1000)}k+</div>
                                                        <div className="text-[9px] text-muted-foreground uppercase mt-0.5">Giờ</div>
                                                    </div>
                                                    <div className="text-center p-2 bg-secondary/20 rounded-lg">
                                                        <div className="text-xs font-bold text-foreground">{selectedExpert.stats.responseTime}</div>
                                                        <div className="text-[9px] text-muted-foreground uppercase mt-0.5">Phản hồi</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            )}
        </DialogContent>
      </Dialog>

      {hiringExpert && (
        <HireExpertModal 
            expert={hiringExpert} 
            open={!!hiringExpert} 
            onOpenChange={(open) => !open && setHiringExpert(null)} 
        />
      )}
    </div>
  );
};
