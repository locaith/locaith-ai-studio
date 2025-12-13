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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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



const RegisterExpertPage = ({ onBack }: { onBack: () => void }) => {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoading(false);
        toast.success("Đăng ký thành công! Hồ sơ của bạn đang được xét duyệt.", {
            description: "Chúng tôi sẽ liên hệ lại trong vòng 24h làm việc."
        });
        onBack();
    };

    return (
        <div className="flex flex-col flex-1 h-full min-w-0 bg-background relative z-10">
            {/* Header */}
            <div className="h-[calc(3.5rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] border-b border-border/40 bg-background/80 backdrop-blur-md flex items-center px-4 md:px-8 shrink-0 z-40 sticky top-0 gap-4">
                 <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2 -ml-2 text-muted-foreground hover:text-foreground"
                    onClick={onBack}
                >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="font-medium">Quay lại</span>
                </Button>
                <div className="text-sm font-semibold text-foreground/80 hidden md:block">
                    Đăng ký trở thành Chuyên gia
                </div>
            </div>

            <ScrollArea className="flex-1 w-full">
                <div className="max-w-6xl mx-auto w-full p-4 md:p-8 pb-32">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Main Form (8 cols) */}
                        <div className="lg:col-span-8 space-y-8">
                             {/* Intro Section */}
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold tracking-tight">Hồ sơ chuyên gia</h1>
                                <p className="text-muted-foreground text-lg">
                                    Hoàn tất thông tin để tham gia mạng lưới chuyên gia hàng đầu tại Locaith.
                                </p>
                            </div>

                            <form id="register-form" onSubmit={handleSubmit} className="space-y-8">
                                {/* Section 1: Personal Info */}
                                <div className="bg-background rounded-2xl border border-border/50 shadow-sm p-6 md:p-8 space-y-6">
                                    <div className="flex items-center gap-3 pb-4 border-b border-border/40">
                                        <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl">Thông tin cá nhân</h3>
                                            <p className="text-sm text-muted-foreground">Thông tin cơ bản để chúng tôi liên hệ với bạn.</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="fullname" className="text-base font-semibold">Họ và tên <span className="text-red-500">*</span></Label>
                                            <Input id="fullname" placeholder="Nguyễn Văn A" required className="h-11 rounded-xl bg-secondary/10" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="text-base font-semibold">Số điện thoại <span className="text-red-500">*</span></Label>
                                            <Input id="phone" placeholder="0912..." required className="h-11 rounded-xl bg-secondary/10" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-base font-semibold">Email liên hệ <span className="text-red-500">*</span></Label>
                                            <Input id="email" type="email" placeholder="contact@example.com" required className="h-11 rounded-xl bg-secondary/10" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="linkedin" className="text-base font-semibold flex items-center gap-1">
                                                 LinkedIn / Portfolio
                                            </Label>
                                            <Input id="linkedin" placeholder="linkedin.com/in/..." className="h-11 rounded-xl bg-secondary/10" />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Professional Profile */}
                                <div className="bg-background rounded-2xl border border-border/50 shadow-sm p-6 md:p-8 space-y-6">
                                    <div className="flex items-center gap-3 pb-4 border-b border-border/40">
                                        <div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400">
                                            <Briefcase className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl">Hồ sơ chuyên môn</h3>
                                            <p className="text-sm text-muted-foreground">Kinh nghiệm và kỹ năng của bạn.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="role" className="text-base font-semibold">Chức danh hiển thị <span className="text-red-500">*</span></Label>
                                            <Input id="role" placeholder="VD: Senior AI Engineer" required className="h-11 rounded-xl bg-secondary/10" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="category" className="text-base font-semibold">Lĩnh vực chuyên môn <span className="text-red-500">*</span></Label>
                                            <Select>
                                                <SelectTrigger className="h-11 rounded-xl bg-secondary/10">
                                                    <SelectValue placeholder="Chọn lĩnh vực" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {expertCategories.filter(c => c.id !== 'all').map(cat => (
                                                        <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="company" className="text-base font-semibold">Công ty hiện tại</Label>
                                            <div className="relative">
                                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                                <Input id="company" placeholder="VD: Google, Microsoft..." className="pl-10 h-11 rounded-xl bg-secondary/10" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="exp" className="text-base font-semibold">Số năm kinh nghiệm</Label>
                                            <Input id="exp" type="number" min="0" placeholder="5" className="h-11 rounded-xl bg-secondary/10" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="bio" className="text-base font-semibold">Giới thiệu bản thân & Thành tích <span className="text-red-500">*</span></Label>
                                        <Textarea 
                                            id="bio" 
                                            placeholder="Mô tả kinh nghiệm, dự án đã thực hiện và thế mạnh của bạn..." 
                                            className="min-h-[150px] rounded-xl bg-secondary/10 resize-y p-4 text-base leading-relaxed" 
                                            required
                                        />
                                        <p className="text-xs text-muted-foreground text-right">Tối thiểu 100 ký tự</p>
                                    </div>
                                </div>

                                {/* Section 3: Services & Rates */}
                                <div className="bg-background rounded-2xl border border-border/50 shadow-sm p-6 md:p-8 space-y-6">
                                    <div className="flex items-center gap-3 pb-4 border-b border-border/40">
                                        <div className="p-2.5 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400">
                                            <DollarSign className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl">Dịch vụ & Chi phí</h3>
                                            <p className="text-sm text-muted-foreground">Định giá dịch vụ của bạn.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="price" className="text-base font-semibold">Mức giá tham khảo (VNĐ/giờ)</Label>
                                            <Input id="price" placeholder="1.000.000" className="h-11 rounded-xl bg-secondary/10" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="deposit" className="text-base font-semibold">Yêu cầu đặt cọc (VNĐ)</Label>
                                            <Input id="deposit" placeholder="500.000" className="h-11 rounded-xl bg-secondary/10" />
                                        </div>
                                    </div>
                                    
                                    <div className="p-5 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 rounded-xl flex gap-4">
                                        <Award className="w-6 h-6 text-orange-500 shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-base text-orange-800 dark:text-orange-300">Chứng nhận & Xác minh</h4>
                                            <p className="text-sm text-orange-700/80 dark:text-orange-400/80 leading-relaxed">
                                                Để tăng độ uy tín và được gắn huy hiệu <span className="font-semibold">Verified</span>, vui lòng chuẩn bị sẵn CV, Bằng cấp và các chứng chỉ liên quan. Chúng tôi sẽ yêu cầu bổ sung ở bước xác minh sau khi bạn gửi hồ sơ.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-4 pt-4">
                                     <div className="flex items-start space-x-3 p-4 bg-secondary/20 rounded-xl">
                                        <Checkbox id="terms" required className="mt-1" />
                                        <Label
                                            htmlFor="terms"
                                            className="text-sm font-normal leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Tôi cam kết thông tin cung cấp là chính xác và đồng ý với <span className="text-primary hover:underline cursor-pointer font-medium">Điều khoản dịch vụ</span> cũng như <span className="text-primary hover:underline cursor-pointer font-medium">Quy tắc ứng xử</span> dành cho chuyên gia trên Locaith.
                                        </Label>
                                    </div>

                                    <div className="flex gap-4">
                                        <Button variant="outline" className="flex-1 h-12 rounded-xl text-base" onClick={onBack} type="button">Hủy bỏ</Button>
                                        <Button 
                                            type="submit" 
                                            className="flex-[2] h-12 rounded-xl text-base bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.01] transition-transform"
                                            disabled={loading}
                                        >
                                            {loading ? "Đang xử lý..." : "Gửi hồ sơ đăng ký"}
                                        </Button>
                                    </div>
                                </div>

                            </form>
                        </div>

                        {/* Sidebar Info (4 cols) */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="sticky top-24 space-y-6">
                                {/* Benefits Card */}
                                <div className="bg-slate-900 text-slate-50 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                                     <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 z-0" />
                                     <div className="relative z-10">
                                         <div className="flex items-center gap-3 mb-6 text-blue-400">
                                            <Shield className="w-8 h-8" />
                                            <span className="font-bold text-lg tracking-wide">Locaith Expert</span>
                                        </div>
                                        <h3 className="text-2xl font-bold mb-2">Quyền lợi thành viên</h3>
                                        <p className="text-slate-400 text-sm mb-6">Gia nhập mạng lưới chuyên gia hàng đầu và mở rộng cơ hội nghề nghiệp.</p>
                                        
                                        <ul className="space-y-4">
                                            {[
                                                "Tiếp cận hàng ngàn dự án hấp dẫn mỗi tháng",
                                                "Thanh toán đảm bảo, minh bạch 100%",
                                                "Xây dựng thương hiệu cá nhân chuyên nghiệp",
                                                "Hỗ trợ pháp lý và giải quyết tranh chấp",
                                                "Tham gia cộng đồng Elite Experts"
                                            ].map((item, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm">
                                                    <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                                    <span className="text-slate-200">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                     </div>
                                </div>

                                {/* Support Card */}
                                <div className="bg-background rounded-2xl border border-border/50 shadow-sm p-6">
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                        <Info className="w-5 h-5 text-primary" /> Hỗ trợ
                                    </h3>
                                    <div className="space-y-4 text-sm">
                                        <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                                            <Mail className="w-5 h-5 text-muted-foreground" />
                                            <div>
                                                <div className="font-medium">Email hỗ trợ</div>
                                                <div className="text-muted-foreground">experts@locaith.com</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                                            <Phone className="w-5 h-5 text-muted-foreground" />
                                            <div>
                                                <div className="font-medium">Hotline</div>
                                                <div className="text-muted-foreground">1900 6868 (8:00 - 18:00)</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
};

const HireExpertPage = ({ expert, onBack }: { expert: typeof mockExperts[0]; onBack: () => void }) => {
    const [loading, setLoading] = useState(false);
    const [budget, setBudget] = useState("");
    const [duration, setDuration] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoading(false);
        toast.success("Đã gửi lời mời thuê thành công! Chuyên gia sẽ phản hồi sớm.");
        onBack();
    };

    return (
        <div className="flex flex-col flex-1 h-full min-w-0 bg-background relative z-10 animate-fade-in-up">
            {/* Header */}
            <div className="h-[calc(3.5rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] border-b border-border/40 bg-background/80 backdrop-blur-md flex items-center px-4 md:px-8 shrink-0 z-40 sticky top-0 gap-4">
                 <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2 -ml-2 text-muted-foreground hover:text-foreground"
                    onClick={onBack}
                >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="font-medium">Quay lại</span>
                </Button>
                <div className="text-sm font-semibold text-foreground/80 hidden md:block">
                    Thuê chuyên gia: {expert.name}
                </div>
            </div>

            <ScrollArea className="flex-1 w-full">
                <div className="max-w-5xl mx-auto w-full p-4 md:p-8 pb-32">
                     <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left: Project Form */}
                        <div className="lg:col-span-8 space-y-8">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold tracking-tight">Thông tin dự án</h1>
                                <p className="text-muted-foreground text-lg">
                                    Mô tả chi tiết yêu cầu của bạn để chuyên gia có thể nắm bắt và phản hồi chính xác nhất.
                                </p>
                            </div>

                            <form id="hire-form" onSubmit={handleSubmit} className="space-y-8">
                                <div className="bg-background rounded-2xl border border-border/50 shadow-sm p-6 md:p-8 space-y-6">
                                    <div className="flex items-center gap-3 pb-4 border-b border-border/40">
                                        <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                                            <Briefcase className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl">Chi tiết công việc</h3>
                                            <p className="text-sm text-muted-foreground">Thông tin cơ bản về dự án cần thuê.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="project-name" className="text-base font-semibold">Tên dự án <span className="text-red-500">*</span></Label>
                                            <Input id="project-name" placeholder="Ví dụ: Xây dựng hệ thống CRM, Thiết kế Logo..." required className="h-12 rounded-xl bg-secondary/10 text-base" />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="description" className="text-base font-semibold">Mô tả yêu cầu <span className="text-red-500">*</span></Label>
                                            <Textarea 
                                                id="description" 
                                                className="min-h-[200px] rounded-xl border-muted-foreground/20 focus:border-primary resize-y bg-secondary/10 text-base leading-relaxed p-4 shadow-sm"
                                                placeholder="Mô tả chi tiết về phạm vi công việc, mục tiêu, và các yêu cầu kỹ thuật cụ thể..."
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-base font-semibold">Tài liệu đính kèm</Label>
                                            <div className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-8 flex flex-col items-center justify-center gap-4 bg-secondary/5 hover:bg-secondary/10 transition-colors cursor-pointer group">
                                                <div className="bg-secondary p-3 rounded-full group-hover:scale-110 transition-transform">
                                                    <Briefcase className="w-6 h-6 text-muted-foreground" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm font-medium text-foreground">
                                                        <span className="text-primary hover:underline">Tải lên</span> tài liệu mô tả chi tiết
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">Hỗ trợ PDF, DOCX, JPG, PNG (Tối đa 20MB)</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Right: Expert & Budget */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* Expert Card */}
                            <div className="bg-background rounded-2xl border border-border/50 shadow-sm p-6 space-y-4">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <User className="w-5 h-5 text-primary" />
                                    Chuyên gia được chọn
                                </h3>
                                <div className="flex items-start gap-4 p-4 bg-secondary/10 rounded-xl border border-border/50">
                                    <Avatar className="h-12 w-12 rounded-xl border-2 border-background shadow-sm">
                                        <AvatarImage src={expert.image} alt={expert.name} className="object-cover" />
                                        <AvatarFallback>{expert.avatar}</AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <div className="font-bold text-sm truncate">{expert.name}</div>
                                        <div className="text-xs text-muted-foreground truncate">{expert.role}</div>
                                        <div className="mt-1 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md w-fit">
                                            {expert.price}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Budget & Timeline */}
                            <div className="bg-background rounded-2xl border border-border/50 shadow-sm p-6 space-y-6">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-green-600" />
                                    Ngân sách & Thời gian
                                </h3>
                                
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-muted-foreground uppercase">Ngân sách dự kiến (VNĐ)</Label>
                                        <div className="relative">
                                            <Input 
                                                value={budget}
                                                onChange={(e) => setBudget(e.target.value)}
                                                className="pl-9 h-12 text-lg font-bold bg-secondary/20 border-transparent focus:bg-background focus:border-primary transition-all rounded-xl"
                                                placeholder="0"
                                                type="number" 
                                            />
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₫</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-muted-foreground uppercase">Thời gian dự kiến</Label>
                                        <div className="relative">
                                            <Input 
                                                value={duration}
                                                onChange={(e) => setDuration(e.target.value)}
                                                className="pl-9 h-11 bg-secondary/20 border-transparent focus:bg-background rounded-xl" 
                                                placeholder="VD: 2 tuần, 1 tháng..." 
                                            />
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-muted-foreground uppercase">Đặt cọc (nếu có)</Label>
                                        <div className="relative">
                                            <Input 
                                                className="pl-9 h-11 bg-secondary/20 border-transparent focus:bg-background rounded-xl" 
                                                placeholder={expert.deposit || "Thỏa thuận"} 
                                                readOnly={!!expert.deposit}
                                            />
                                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        </div>
                                        {expert.deposit && <p className="text-xs text-muted-foreground">Chuyên gia yêu cầu đặt cọc tối thiểu {expert.deposit}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3 pt-2">
                                <Button 
                                    className="w-full h-12 rounded-xl text-base bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                >
                                    {loading ? "Đang gửi..." : "Gửi lời mời hợp tác"}
                                </Button>
                                <Button variant="ghost" className="w-full rounded-xl text-muted-foreground" onClick={onBack}>
                                    Hủy bỏ
                                </Button>
                            </div>
                        </div>
                     </div>
                </div>
            </ScrollArea>
        </div>
    );
};

export const ExpertsFeature = () => {
  const navigate = useNavigate();
  const { setIsCollapsed } = useLayoutContext();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [hiringExpert, setHiringExpert] = useState<typeof mockExperts[0] | null>(null);
  const [selectedExpert, setSelectedExpert] = useState<typeof mockExperts[0] | null>(null);

  // --- Render Register Page ---
  if (isRegistering) {
      return <RegisterExpertPage onBack={() => setIsRegistering(false)} />;
  }

  // --- Render Hire Expert Page ---
  if (hiringExpert) {
      return <HireExpertPage expert={hiringExpert} onBack={() => setHiringExpert(null)} />;
  }

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
                    onClick={() => setIsRegistering(true)}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Đăng ký
                </Button>
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
                        <div className="h-[calc(3.5rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] border-b border-border/40 bg-background/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 shrink-0 z-40 sticky top-0">
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

    </div>
  );
};
