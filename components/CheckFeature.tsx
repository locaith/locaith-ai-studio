import React, { useState, useRef, useEffect } from 'react';
import { Search, Sparkles, X, User, Briefcase, Star, CheckCircle2, MapPin, DollarSign, Clock, Shield, Award, GraduationCap, Building2, Zap, ArrowRight, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// --- Mock Data for Verification ---
const MOCK_EXPERTS = [
  {
    id: "EXP-001",
    name: "Tiến sĩ Trần Minh Tuấn",
    role: "AI Research Scientist",
    company: "Locaith AI Lab",
    avatar: "MT",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop",
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
    image: "https://images.unsplash.com/photo-1573496359-7014228112f5?w=400&h=400&fit=crop",
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
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    rating: 4.8,
    reviews: 215,
    price: "800.000 VNĐ/giờ",
    deposit: "30%",
    location: "Đà Nẵng",
    verified: true,
    achievements: ["Top 1% Freelancer", "AWS Certified Solutions Architect"],
    skills: ["React", "Node.js", "AWS", "MongoDB"],
    category: "dev",
    bio: "Lập trình viên Fullstack với 8 năm kinh nghiệm xây dựng các ứng dụng web quy mô lớn. Chuyên về hệ sinh thái JavaScript và Cloud Computing.",
    requirements: "Làm việc remote, họp qua Google Meet.",
    education: [
        { degree: "Kỹ sư Công nghệ thông tin", school: "Đại học Bách Khoa Đà Nẵng", year: "2016" }
    ],
    experience: [
        { role: "Senior Developer", company: "FPT Software", period: "2016-2020", description: "Phát triển hệ thống quản lý bệnh viện." }
    ],
    stats: {
        projectsCompleted: 120,
        hoursWorked: 8000,
        responseTime: "15 phút"
    }
  }
];

const MOCK_JOBS = [
  {
    id: 1,
    title: "Tuyển dụng AI Engineer (NLP/CV)",
    type: "Toàn thời gian",
    category: "ai",
    budget: "25.000.000 - 40.000.000 VNĐ/tháng",
    deposit: "Không yêu cầu",
    deadline: "Tuyển gấp",
    location: "Hà Nội",
    poster: { name: "Locaith AI Solutions", avatar: "LA", rating: 5.0, verified: true, commentCount: 856 },
    requirements: ["Hiểu biết AI", "Tiếng Anh tốt", "Giao tiếp xuất sắc"],
    postedAt: "Vừa xong",
    status: "urgent",
    description: "Locaith AI Solutions cần tuyển chuyên viên tư vấn giải pháp AI. Nhiệm vụ bao gồm: Tư vấn giải pháp cho khách hàng doanh nghiệp, xây dựng tài liệu giới thiệu sản phẩm, phối hợp với team kỹ thuật để demo giải pháp."
  },
  {
    id: 3,
    title: "Phát triển Website giới thiệu công ty (Next.js)",
    type: "Dự án ngắn hạn",
    category: "dev",
    budget: "10.000.000 VNĐ",
    deposit: "1.000.000 VNĐ",
    deadline: "1 tuần",
    location: "Remote",
    poster: { name: "Nguyễn Văn A", avatar: "NA", rating: 4.5, verified: true, commentCount: 12 },
    requirements: ["Next.js", "Tailwind CSS", "SEO cơ bản"],
    postedAt: "5 giờ trước",
    status: "open",
    description: "Cần tìm Freelancer phát triển website giới thiệu công ty gồm 5 trang: Trang chủ, Về chúng tôi, Dịch vụ, Dự án, Liên hệ. Design đã có sẵn trên Figma."
  },
  {
    id: 4,
    title: "Tuyển CTV Content Marketing (Mảng công nghệ)",
    type: "Dài hạn",
    category: "content",
    budget: "100.000 - 200.000 VNĐ / bài",
    deposit: "Không yêu cầu",
    deadline: "Liên tục",
    location: "Online",
    poster: { name: "DigiMarketing", avatar: "DM", rating: 4.9, verified: true, commentCount: 342 },
    requirements: ["Viết chuẩn SEO", "Am hiểu Tech", "Đúng deadline"],
    postedAt: "1 ngày trước",
    status: "open",
    description: "Tuyển cộng tác viên viết bài Content Marketing mảng công nghệ. Yêu cầu viết chuẩn SEO, am hiểu về các xu hướng công nghệ mới. Thanh toán theo bài viết."
  },
  {
    id: 5,
    title: "Dịch thuật tài liệu kỹ thuật Anh - Việt",
    type: "Dự án ngắn hạn",
    category: "content",
    budget: "500.000 VNĐ / 1000 từ",
    deposit: "500.000 VNĐ",
    deadline: "3 ngày",
    location: "Remote",
    poster: { name: "Global Trans", avatar: "GT", rating: 4.2, verified: false, commentCount: 45 },
    requirements: ["IELTS 7.0+", "Thuật ngữ kỹ thuật", "Tỉ mỉ"],
    postedAt: "3 ngày trước",
    status: "open",
    description: "Cần dịch thuật tài liệu kỹ thuật chuyên ngành cơ khí từ tiếng Anh sang tiếng Việt. Yêu cầu độ chính xác cao, sử dụng đúng thuật ngữ chuyên ngành."
  },
  {
    id: 6,
    title: "Senior React Native Developer",
    type: "Toàn thời gian",
    category: "dev",
    budget: "2000$ - 3000$",
    deposit: "Không yêu cầu",
    deadline: "1 tháng",
    location: "TP.HCM",
    poster: { name: "Fintech Asia", avatar: "FA", rating: 4.7, verified: true, commentCount: 92 },
    requirements: ["React Native", "Redux", "3 năm kinh nghiệm"],
    postedAt: "30 phút trước",
    status: "urgent",
    description: "Fintech Asia đang tìm kiếm Senior React Native Developer tham gia phát triển ứng dụng ví điện tử. Môi trường làm việc quốc tế, package hấp dẫn."
  },
  {
      id: 7,
      title: "Thiết kế Logo & Brand Identity",
      type: "Dự án",
      category: "design",
      budget: "5.000.000 VNĐ",
      deposit: "50%",
      deadline: "5 ngày",
      location: "Remote",
      poster: { name: "StartUp Coffee", avatar: "SC", rating: 0, verified: false, commentCount: 2 },
      requirements: ["Sáng tạo", "Minimalism", "Giao file Vector"],
      postedAt: "4 giờ trước",
      status: "open",
      description: "Cần thiết kế Logo và bộ nhận diện thương hiệu cho quán cà phê khởi nghiệp. Phong cách tối giản, hiện đại, phù hợp với giới trẻ."
    },
    {
      id: 8,
      title: "Trợ lý ảo Admin Online",
      type: "Part-time",
      category: "admin",
      budget: "3.000.000 VNĐ/tháng",
      deposit: "Không",
      deadline: "Tuyển gấp",
      location: "Online",
      poster: { name: "Shop Mẹ & Bé", avatar: "MB", rating: 4.0, verified: true, commentCount: 156 },
      requirements: ["Chăm chỉ", "Online thường xuyên", "Rep inbox nhanh"],
      postedAt: "10 phút trước",
      status: "urgent",
      description: "Cần tuyển trợ lý ảo trực page, trả lời tin nhắn khách hàng cho shop online mẹ và bé. Yêu cầu online thường xuyên, trung thực, nhiệt tình."
    }
];

export const CheckFeature: React.FC = () => {
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resultType, setResultType] = useState<'expert' | 'job' | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [query]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setHasSearched(true);
    setIsLoading(true);
    setResult(null);
    setError(null);
    setResultType(null);

    // Simulate network delay
    setTimeout(() => {
        const q = query.trim().toUpperCase().replace('#', '');
        let found = null;
        let type: 'expert' | 'job' | null = null;

        // Try to find expert
        if (q.startsWith('EXP')) {
            found = MOCK_EXPERTS.find(e => e.id === q || e.id === query.trim()); // Case sensitive check might be needed or not, let's try exact match or case insensitive on prefix
            if (!found) {
                 // Try loose match
                 found = MOCK_EXPERTS.find(e => e.id.toUpperCase() === q);
            }
            if (found) type = 'expert';
        } 
        // Try to find job
        else if (q.startsWith('JOB')) {
             // Extract number if possible
             const num = parseInt(q.replace('JOB', '').replace('-', '').trim());
             if (!isNaN(num)) {
                 found = MOCK_JOBS.find(j => j.id === num);
             }
             if (found) type = 'job';
        }
        // Try direct number (assume Job ID)
        else if (!isNaN(parseInt(q))) {
             const num = parseInt(q);
             found = MOCK_JOBS.find(j => j.id === num);
             if (found) type = 'job';
        }
        // Fallback: search by name/title
        else {
             // Try expert name
             found = MOCK_EXPERTS.find(e => e.name.toUpperCase().includes(q));
             if (found) {
                 type = 'expert';
             } else {
                 // Try job title
                 found = MOCK_JOBS.find(j => j.title.toUpperCase().includes(q));
                 if (found) type = 'job';
             }
        }

        if (found) {
            setResult(found);
            setResultType(type);
        } else {
            setError("Không tìm thấy thông tin phù hợp với mã hoặc từ khóa bạn nhập. Vui lòng kiểm tra lại.");
        }
        setIsLoading(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="flex h-full w-full text-foreground overflow-hidden font-sans animate-fade-in-up transition-colors duration-300 flex-col relative" style={{ background: 'transparent' }}>
      
      {/* Main Content Area */}
      <div className={`${hasSearched ? 'w-full max-w-[1920px] mx-auto px-4 md:px-4' : 'w-full max-w-4xl mx-auto mt-[10vh] md:mt-[15vh] px-4 md:px-6'} flex flex-col transition-all duration-700 h-full relative z-10`}>
        
        {/* Search Header */}
        <div className={`${hasSearched ? 'py-2 md:py-4 border-b border-border sticky top-0 z-30 bg-background/95 backdrop-blur-md' : 'p-0 flex flex-col items-center'} transition-all duration-500`}>
           
           {!hasSearched && (
             <div className="mb-4 md:mb-12 flex flex-col items-center animate-fade-in-down">
                <div className="flex items-center justify-center gap-3 md:gap-4 mb-3 md:mb-4">
                    <div className="p-3 md:p-6 rounded-[1.25rem] md:rounded-[2rem]">
                        <img src="/logo-locaith.png" alt="Locaith" className="w-12 h-12 md:w-20 md:h-20 object-contain" />
                    </div>
                    <h1 className="text-2xl md:text-6xl font-bold text-foreground tracking-tight">
                        Check Thông Tin
                    </h1>
                </div>
                <p className="text-sm md:text-lg text-muted-foreground font-medium tracking-wide text-center max-w-lg px-2">
                  Tra cứu và xác thực nhanh thông tin Chuyên gia & Công việc <br/>
                  <span className="text-xs md:text-sm opacity-80">(Nhập mã: EXP-001, JOB-123 hoặc Tên/Tiêu đề)</span>
                </p>
             </div>
           )}

           <div className={`relative transition-all duration-500 ${hasSearched ? 'w-full max-w-3xl mx-auto' : 'w-full max-w-2xl'}`}>
              <div className={`relative flex flex-col neu-bg rounded-xl md:rounded-3xl border border-border transition-all duration-300 overflow-hidden group p-1 md:p-2 ${hasSearched ? 'shadow-sm' : 'shadow-lg'}`}>
                  
                  {/* Text Area */}
                  <textarea
                      ref={textareaRef}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Nhập mã chuyên gia, mã công việc hoặc từ khóa tìm kiếm..."
                      className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-base md:text-lg resize-none border-none outline-none p-3 md:p-4 min-h-[48px] md:min-h-[56px] max-h-[150px] md:max-h-[200px] font-medium"
                      rows={1}
                  />

                  {/* Toolbar */}
                  <div className="flex items-center justify-end px-2 pb-1">
                      <button 
                          onClick={handleSearch}
                          disabled={!query.trim() && !isLoading}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                              query.trim() 
                                ? 'neu-flat text-yellow-600 hover:neu-pressed bg-yellow-50 dark:bg-yellow-900/20' 
                                : 'bg-muted/20 text-muted-foreground cursor-not-allowed'
                          }`}
                      >
                          <Search className="w-4 h-4" />
                          <span>Kiểm tra</span>
                      </button>
                  </div>
              </div>
           </div>
        </div>

        {/* Results Area */}
        {hasSearched && (
            <div className="flex-1 flex overflow-hidden relative w-full h-full pt-4 justify-center">
                <div className="w-full max-w-3xl flex flex-col overflow-y-auto pb-20 custom-scrollbar transition-all duration-300">
                {isLoading ? (
                    <div className="neu-bg p-4 md:p-8 rounded-xl md:rounded-3xl animate-pulse">
                        <div className="flex items-center gap-4 mb-8 border-b border-border pb-6">
                             <div className="h-16 w-16 rounded-full bg-muted animate-pulse"></div>
                             <div className="space-y-2 flex-1">
                                <div className="h-6 w-1/3 bg-muted rounded"></div>
                                <div className="h-4 w-1/4 bg-muted/60 rounded"></div>
                             </div>
                        </div>
                        <div className="space-y-4">
                            <div className="h-4 bg-muted rounded w-full"></div>
                            <div className="h-4 bg-muted rounded w-5/6"></div>
                            <div className="h-4 bg-muted rounded w-4/6"></div>
                            <div className="h-32 bg-muted/30 rounded-xl mt-6 border border-border"></div>
                        </div>
                    </div>
                ) : error ? (
                    <div className="neu-bg p-4 md:p-8 rounded-xl md:rounded-3xl border border-red-200 bg-red-50/50 dark:bg-red-900/10 dark:border-red-900/30 text-center animate-fade-in-up">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 text-red-500">
                            <X className="w-6 h-6 md:w-8 md:h-8" />
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-red-600 dark:text-red-400 mb-2">Không tìm thấy kết quả</h3>
                        <p className="text-muted-foreground">{error}</p>
                        <Button 
                            variant="outline" 
                            className="mt-6"
                            onClick={() => {
                                setHasSearched(false);
                                setQuery('');
                            }}
                        >
                            Thử lại
                        </Button>
                    </div>
                ) : result && resultType === 'expert' ? (
                    // EXPERT RESULT CARD
                    <div className="neu-bg rounded-xl md:rounded-3xl border border-border overflow-hidden animate-fade-in-up">
                        <div className="h-20 md:h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                             <div className="absolute top-3 right-3 md:top-4 md:right-4 bg-white/20 backdrop-blur-md px-2 md:px-3 py-0.5 md:py-1 rounded-full text-white text-[10px] md:text-xs font-medium border border-white/30">
                                Mã: {result.id}
                             </div>
                        </div>
                        <div className="px-3 md:px-8 pb-4 md:pb-8 -mt-10 md:-mt-16 relative">
                             <div className="flex flex-col md:flex-row gap-3 md:gap-6 items-start">
                                 <div className="relative">
                                     <Avatar className="w-20 h-20 md:w-32 md:h-32 border-4 border-background shadow-xl rounded-xl md:rounded-2xl">
                                         <AvatarImage src={result.image} alt={result.name} className="object-cover" />
                                         <AvatarFallback className="text-xl md:text-3xl font-bold">{result.avatar}</AvatarFallback>
                                     </Avatar>
                                     {result.verified && (
                                         <div className="absolute -bottom-1.5 -right-1.5 md:-bottom-2 md:-right-2 bg-blue-500 text-white p-1 md:p-1.5 rounded-full border-[3px] md:border-4 border-background shadow-sm" title="Đã xác thực">
                                             <CheckCircle2 className="w-3.5 h-3.5 md:w-5 md:h-5" />
                                         </div>
                                     )}
                                 </div>
                                 <div className="pt-2 md:pt-20 flex-1 space-y-1.5 md:space-y-2">
                                     <div>
                                         <h2 className="text-lg md:text-2xl font-bold flex items-center gap-2">
                                             {result.name}
                                         </h2>
                                         <p className="text-sm md:text-base text-muted-foreground font-medium flex items-center gap-2">
                                             <Briefcase className="w-3.5 h-3.5 md:w-4 md:h-4" /> {result.role}
                                             {result.company && <span className="text-muted-foreground/60 hidden sm:inline">• {result.company}</span>}
                                         </p>
                                         {result.company && <p className="text-xs text-muted-foreground/60 sm:hidden mt-0.5">{result.company}</p>}
                                     </div>
                                     <div className="flex flex-wrap gap-2 mt-2 md:mt-3">
                                         <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-yellow-200 text-xs px-2 py-0.5">
                                             <Star className="w-3 h-3 mr-1 fill-yellow-500" /> {result.rating} ({result.reviews})
                                         </Badge>
                                         <Badge variant="outline" className="text-muted-foreground text-xs px-2 py-0.5">
                                             <MapPin className="w-3 h-3 mr-1" /> {result.location}
                                         </Badge>
                                         <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 text-xs px-2 py-0.5">
                                             <DollarSign className="w-3 h-3 mr-1" /> {result.price}
                                         </Badge>
                                     </div>
                                 </div>
                             </div>

                             <div className="grid grid-cols-3 gap-2 md:gap-4 mt-4 md:mt-8">
                                 <div className="bg-muted/30 p-2 md:p-4 rounded-lg md:rounded-2xl border border-border/50 text-center">
                                     <div className="text-base md:text-2xl font-bold text-primary mb-0.5 md:mb-1">{result.stats?.projectsCompleted || 0}+</div>
                                     <div className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wider">Dự án</div>
                                 </div>
                                 <div className="bg-muted/30 p-2 md:p-4 rounded-lg md:rounded-2xl border border-border/50 text-center">
                                     <div className="text-base md:text-2xl font-bold text-primary mb-0.5 md:mb-1">{result.stats?.hoursWorked || 0}+</div>
                                     <div className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wider">Giờ làm</div>
                                 </div>
                                 <div className="bg-muted/30 p-2 md:p-4 rounded-lg md:rounded-2xl border border-border/50 text-center">
                                     <div className="text-base md:text-2xl font-bold text-primary mb-0.5 md:mb-1">{result.stats?.responseTime || 'N/A'}</div>
                                     <div className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wider">Phản hồi</div>
                                 </div>
                             </div>

                             <div className="mt-4 md:mt-8 space-y-4 md:space-y-6">
                                 <div>
                                     <h3 className="font-bold text-sm md:text-lg mb-2 md:mb-3 flex items-center gap-2">
                                         <User className="w-4 h-4 md:w-5 md:h-5 text-primary" /> Giới thiệu
                                     </h3>
                                     <p className="text-sm md:text-base text-muted-foreground leading-relaxed bg-muted/20 p-3 md:p-4 rounded-lg md:rounded-xl border border-border/50">
                                         {result.bio}
                                     </p>
                                 </div>

                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                     <div>
                                         <h3 className="font-bold text-sm md:text-lg mb-2 md:mb-3 flex items-center gap-2">
                                             <Award className="w-4 h-4 md:w-5 md:h-5 text-primary" /> Kỹ năng
                                         </h3>
                                         <div className="flex flex-wrap gap-1.5 md:gap-2">
                                             {result.skills?.map((skill: string, idx: number) => (
                                                 <Badge key={idx} variant="secondary" className="px-2 md:px-3 py-0.5 md:py-1 text-xs md:text-sm">
                                                     {skill}
                                                 </Badge>
                                             ))}
                                         </div>
                                     </div>
                                     <div>
                                          <h3 className="font-bold text-sm md:text-lg mb-2 md:mb-3 flex items-center gap-2">
                                             <Shield className="w-4 h-4 md:w-5 md:h-5 text-primary" /> Thành tựu
                                         </h3>
                                         <ul className="space-y-1.5 md:space-y-2">
                                             {result.achievements?.map((item: string, idx: number) => (
                                                 <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                     <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-500 mt-0.5 shrink-0" />
                                                     <span>{item}</span>
                                                 </li>
                                             ))}
                                         </ul>
                                     </div>
                                 </div>
                                 
                                 {result.education && (
                                     <div>
                                         <h3 className="font-bold text-sm md:text-lg mb-2 md:mb-3 flex items-center gap-2">
                                             <GraduationCap className="w-4 h-4 md:w-5 md:h-5 text-primary" /> Học vấn
                                         </h3>
                                         <div className="space-y-2 md:space-y-3">
                                             {result.education.map((edu: any, idx: number) => (
                                                 <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between bg-muted/20 p-3 rounded-lg md:rounded-xl border border-border/50 gap-1 md:gap-2">
                                                     <div>
                                                         <div className="font-semibold text-sm md:text-base">{edu.degree}</div>
                                                         <div className="text-xs md:text-sm text-muted-foreground">{edu.school}</div>
                                                     </div>
                                                     <Badge variant="outline" className="w-fit text-[10px] md:text-xs">{edu.year}</Badge>
                                                 </div>
                                             ))}
                                         </div>
                                     </div>
                                 )}
                             </div>
                             
                             <div className="mt-4 md:mt-8 pt-4 md:pt-6 border-t border-border flex gap-2 md:gap-3">
                                 <Button variant="outline" size="sm" className="gap-2 flex-1 md:flex-none h-9 md:h-10 text-xs md:text-sm">
                                     <Info className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span className="md:inline">Chi tiết</span>
                                 </Button>
                                 <Button size="sm" className="gap-2 flex-1 md:flex-none h-9 md:h-10 text-xs md:text-sm">
                                     <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" /> Thuê ngay
                                 </Button>
                             </div>
                        </div>
                    </div>
                ) : result && resultType === 'job' ? (
                    // JOB RESULT CARD
                    <div className="neu-bg rounded-xl md:rounded-3xl border border-border overflow-hidden animate-fade-in-up">
                         <div className="h-16 md:h-24 bg-gradient-to-r from-orange-500 to-red-600 relative">
                             <div className="absolute top-3 right-3 md:top-4 md:right-4 bg-white/20 backdrop-blur-md px-2 md:px-3 py-0.5 md:py-1 rounded-full text-white text-[10px] md:text-xs font-medium border border-white/30">
                                Mã: JOB-{result.id}
                             </div>
                        </div>
                        <div className="px-3 md:px-8 pb-4 md:pb-8 pt-3 md:pt-6 relative">
                             <div className="flex flex-col gap-1 mb-4 md:mb-6">
                                 <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2 flex-wrap">
                                     <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 text-[10px] md:text-xs px-2 py-0.5">
                                         {result.category === 'dev' ? 'Lập trình' : result.category === 'design' ? 'Thiết kế' : result.category === 'content' ? 'Viết lách' : result.category}
                                     </Badge>
                                     <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 text-[10px] md:text-xs px-2 py-0.5">
                                         {result.type}
                                     </Badge>
                                     {result.status === 'urgent' && (
                                         <Badge variant="destructive" className="animate-pulse text-[10px] md:text-xs px-2 py-0.5">Gấp</Badge>
                                     )}
                                 </div>
                                 <h2 className="text-lg md:text-2xl font-bold text-foreground leading-tight">
                                     {result.title}
                                 </h2>
                                 <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 md:gap-x-4 md:gap-y-2 text-xs md:text-sm text-muted-foreground mt-1 md:mt-2">
                                     <div className="flex items-center gap-1">
                                         <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" /> {result.deadline}
                                     </div>
                                     <div className="flex items-center gap-1">
                                         <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4" /> {result.location}
                                     </div>
                                     <div className="flex items-center gap-1 text-green-600 font-medium">
                                         <DollarSign className="w-3.5 h-3.5 md:w-4 md:h-4" /> {result.budget}
                                     </div>
                                 </div>
                             </div>

                             <div className="bg-muted/30 p-3 md:p-5 rounded-lg md:rounded-2xl border border-border/50 mb-4 md:mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                                 <div className="flex items-center gap-3">
                                     <Avatar className="h-9 w-9 md:h-12 md:w-12 border border-border">
                                         <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs md:text-base">{result.poster.avatar}</AvatarFallback>
                                     </Avatar>
                                     <div>
                                         <div className="font-bold text-foreground flex items-center gap-1 text-sm md:text-base">
                                             {result.poster.name}
                                             {result.poster.verified && <CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5 text-blue-500" />}
                                         </div>
                                         <div className="text-[10px] md:text-xs text-muted-foreground flex items-center gap-2">
                                             <span className="flex items-center gap-0.5 text-yellow-600"><Star className="w-3 h-3 fill-yellow-500" /> {result.poster.rating}</span>
                                             <span>•</span>
                                             <span>{result.poster.commentCount} đánh giá</span>
                                         </div>
                                     </div>
                                 </div>
                                 <Button variant="outline" size="sm" className="w-full md:w-auto h-8 md:h-9 text-xs md:text-sm">Xem hồ sơ</Button>
                             </div>

                             <div className="space-y-4 md:space-y-6">
                                 <div>
                                     <h3 className="font-bold text-sm md:text-lg mb-2 md:mb-3 flex items-center gap-2">
                                         <Briefcase className="w-4 h-4 md:w-5 md:h-5 text-primary" /> Mô tả công việc
                                     </h3>
                                     <div className="text-sm md:text-base text-muted-foreground leading-relaxed bg-muted/20 p-3 md:p-4 rounded-lg md:rounded-xl border border-border/50 whitespace-pre-line">
                                         {result.description}
                                     </div>
                                 </div>

                                 <div>
                                     <h3 className="font-bold text-sm md:text-lg mb-2 md:mb-3 flex items-center gap-2">
                                         <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-primary" /> Yêu cầu
                                     </h3>
                                     <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                         {result.requirements?.map((req: string, idx: number) => (
                                             <li key={idx} className="flex items-center gap-2 bg-muted/20 px-3 py-2 rounded-lg text-xs md:text-sm font-medium">
                                                 <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></div>
                                                 {req}
                                             </li>
                                         ))}
                                     </ul>
                                 </div>
                             </div>

                             <div className="mt-4 md:mt-8 pt-4 md:pt-6 border-t border-border flex gap-2 md:gap-3">
                                 <Button variant="outline" size="sm" className="gap-2 flex-1 md:flex-none h-9 md:h-10 text-xs md:text-sm">
                                     <Info className="w-3.5 h-3.5 md:w-4 md:h-4" /> Chi tiết
                                 </Button>
                                 <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 flex-1 md:flex-none h-9 md:h-10 text-xs md:text-sm">
                                     <Zap className="w-3.5 h-3.5 md:w-4 md:h-4" /> Ứng tuyển ngay
                                 </Button>
                             </div>
                        </div>
                    </div>
                ) : null}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
