import React, { useState } from 'react';
import { Search, Plus, Filter, Star, CheckCircle2, MapPin, Building2, Trophy, DollarSign, Clock, Shield, Award, Briefcase, GraduationCap, ChevronRight, ChevronLeft, User, Info, Calendar, Mail, Phone, Globe, ThermometerSnowflake, Droplets, Cpu, Zap, Plug, Grid, Wrench, Bike, Sparkles, Key, ArrowDownToLine, Brush, HardHat, Coffee, Waves, Scissors, Video, Palette, Heart, Hammer } from 'lucide-react';
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
import { useNavigate } from 'react-router-dom';
import { useLayoutContext } from '../src/context/LayoutContext';
import { useAuth } from '../src/hooks/useAuth';
import { LoginPage } from './LoginPage';

// --- Mock Data ---

const expertCategories = [
  { id: "all", label: "Tất cả", icon: Filter },
  { id: "dien-lanh", label: "Điện lạnh", icon: ThermometerSnowflake },
  { id: "nuoc", label: "Nước", icon: Droplets },
  { id: "dien-tu", label: "Sửa chữa thiết bị điện tử", icon: Cpu },
  { id: "dien", label: "Điện", icon: Zap },
  { id: "dien-gia-dung", label: "Điện gia dụng", icon: Plug },
  { id: "nhom-kinh", label: "Nhôm kính", icon: Grid },
  { id: "co-khi", label: "Cơ khí", icon: Wrench },
  { id: "sua-xe", label: "Sửa xe", icon: Bike },
  { id: "giup-viec", label: "Giúp việc nhà", icon: Sparkles },
  { id: "sua-khoa", label: "Sửa khóa", icon: Key },
  { id: "cua-cuon", label: "Cửa cuốn", icon: ArrowDownToLine },
  { id: "makeup", label: "Makeup", icon: Brush },
  { id: "xay-dung", label: "Xây dựng", icon: HardHat },
  { id: "fnb", label: "F&B", icon: Coffee },
  { id: "sua-may-bom", label: "Sửa máy bơm", icon: Waves },
  { id: "nails", label: "Nails", icon: Scissors },
  { id: "camera", label: "Lắp đặt camera", icon: Video },
  { id: "thiet-ke", label: "Thiết kế", icon: Palette },
  { id: "cham-soc-da", label: "Chăm sóc da - làm đẹp", icon: Heart },
];

const mockExperts = [
  {
    id: "HM-001",
    name: "Nguyễn Văn Hùng",
    role: "Thợ điện lạnh",
    company: "Điện lạnh Hùng Cường",
    avatar: "VH",
    image: "",
    rating: 4.8,
    reviews: 156,
    price: "200.000 VNĐ/lần",
    deposit: "Không yêu cầu",
    location: "Hà Nội",
    verified: true,
    achievements: ["Thợ giỏi 2023", "Phản hồi nhanh"],
    skills: ["Lắp đặt điều hòa", "Sửa tủ lạnh", "Vệ sinh máy giặt"],
    category: "dien-lanh",
    bio: "Hơn 10 năm kinh nghiệm trong lĩnh vực điện lạnh. Chuyên sửa chữa, bảo dưỡng điều hòa, tủ lạnh, máy giặt các hãng.",
    requirements: "Đặt lịch trước 2 tiếng.",
    experience: [
      { role: "Thợ chính", company: "Điện máy Xanh", period: "2015-2020", description: "Lắp đặt và bảo hành điện lạnh." }
    ],
    stats: {
      projectsCompleted: 1200,
      hoursWorked: 5000,
      responseTime: "30 phút"
    }
  },
  {
    id: "HM-002",
    name: "Trần Thị Mai",
    role: "Giúp việc theo giờ",
    company: "Tự do",
    avatar: "TM",
    image: "",
    rating: 4.9,
    reviews: 89,
    price: "80.000 VNĐ/giờ",
    deposit: "Không yêu cầu",
    location: "TP. Hồ Chí Minh",
    verified: true,
    achievements: ["Chu đáo", "Sạch sẽ"],
    skills: ["Dọn dẹp nhà cửa", "Nấu ăn", "Giặt ủi"],
    category: "giup-viec",
    bio: "Chăm chỉ, thật thà, có kinh nghiệm giúp việc nhà và nấu ăn ngon.",
    requirements: "Đặt tối thiểu 2 giờ.",
    experience: [
        { role: "Giúp việc", company: "Gia đình", period: "2018-Nay", description: "Giúp việc cho các hộ gia đình chung cư." }
    ],
    stats: {
      projectsCompleted: 450,
      hoursWorked: 1200,
      responseTime: "1 giờ"
    }
  },
  {
    id: "HM-003",
    name: "Lê Văn Tám",
    role: "Thợ sửa khóa",
    company: "Sửa khóa Tám",
    avatar: "LT",
    image: "",
    rating: 5.0,
    reviews: 42,
    price: "150.000 VNĐ/lần",
    deposit: "Không yêu cầu",
    location: "Đà Nẵng",
    verified: true,
    achievements: ["Cứu hộ 24/7"],
    skills: ["Mở khóa cửa", "Sửa khóa xe máy", "Sao chép chìa"],
    category: "sua-khoa",
    bio: "Chuyên sửa khóa tại nhà, mở khóa cửa, khóa xe máy, két sắt. Phục vụ 24/7.",
    requirements: "Gọi là có mặt sau 15 phút.",
    experience: [
        { role: "Thợ khóa", company: "Tự do", period: "2010-Nay", description: "Kinh nghiệm 15 năm nghề khóa." }
    ],
    stats: {
      projectsCompleted: 3000,
      hoursWorked: 0,
      responseTime: "10 phút"
    }
  },
   {
    id: "HM-004",
    name: "Phạm Văn Minh",
    role: "Thợ sửa ống nước",
    company: "Dịch vụ Nước Minh",
    avatar: "PM",
    image: "",
    rating: 4.7,
    reviews: 65,
    price: "150.000 VNĐ/lần",
    deposit: "Không yêu cầu",
    location: "Hà Nội",
    verified: true,
    achievements: ["Xử lý rò rỉ nhanh"],
    skills: ["Sửa đường ống", "Thông tắc cống", "Lắp đặt thiết bị vệ sinh"],
    category: "nuoc",
    bio: "Chuyên xử lý các sự cố về nước: rò rỉ, tắc nghẽn, hỏng van vòi. Thi công lắp đặt đường nước dân dụng.",
    requirements: "Khảo sát trước khi báo giá chi tiết.",
    experience: [
        { role: "Thợ nước", company: "Công ty Cấp thoát nước", period: "2012-2018", description: "Bảo trì hệ thống nước thành phố." }
    ],
    stats: {
      projectsCompleted: 800,
      hoursWorked: 2000,
      responseTime: "45 phút"
    }
  }
];

const RegisterHandymanPage = ({ onBack, isAuthenticated, onRequireLogin }: { onBack: () => void; isAuthenticated: boolean; onRequireLogin: () => void }) => {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!isAuthenticated) {
            onRequireLogin();
            return;
        }

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
                    Đăng ký trở thành Thợ
                </div>
            </div>

            <ScrollArea className="flex-1 w-full">
                <div className="max-w-6xl mx-auto w-full p-4 md:p-8 pb-32">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Main Form (8 cols) */}
                        <div className="lg:col-span-8 space-y-8">
                             {/* Intro Section */}
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold tracking-tight">Hồ sơ thợ</h1>
                                <p className="text-muted-foreground text-lg">
                                    Hoàn tất thông tin để tham gia mạng lưới thợ lành nghề tại Locaith.
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
                                            <p className="text-sm text-muted-foreground">Thông tin cơ bản để khách hàng liên hệ với bạn.</p>
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
                                            <Label htmlFor="address" className="text-base font-semibold">
                                                 Địa chỉ / Khu vực hoạt động
                                            </Label>
                                            <Input id="address" placeholder="Quận 1, TP.HCM" className="h-11 rounded-xl bg-secondary/10" />
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
                                            <h3 className="font-bold text-xl">Hồ sơ tay nghề</h3>
                                            <p className="text-sm text-muted-foreground">Kinh nghiệm và kỹ năng của bạn.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="role" className="text-base font-semibold">Nghề nghiệp <span className="text-red-500">*</span></Label>
                                            <Input id="role" placeholder="VD: Thợ sửa điện" required className="h-11 rounded-xl bg-secondary/10" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="category" className="text-base font-semibold">Lĩnh vực <span className="text-red-500">*</span></Label>
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
                                            <Label htmlFor="exp" className="text-base font-semibold">Số năm kinh nghiệm</Label>
                                            <Input id="exp" type="number" min="0" placeholder="5" className="h-11 rounded-xl bg-secondary/10" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="bio" className="text-base font-semibold">Giới thiệu bản thân & Kỹ năng <span className="text-red-500">*</span></Label>
                                        <Textarea 
                                            id="bio" 
                                            placeholder="Mô tả kinh nghiệm, các công việc đã làm..." 
                                            className="min-h-[150px] rounded-xl bg-secondary/10 resize-y p-4 text-base leading-relaxed" 
                                            required
                                        />
                                        <p className="text-xs text-muted-foreground text-right">Tối thiểu 50 ký tự</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-4">
                                     <Button type="button" variant="outline" size="lg" className="flex-1 h-12 rounded-xl" onClick={onBack}>
                                        Hủy bỏ
                                    </Button>
                                    <Button type="submit" size="lg" className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20" disabled={loading}>
                                        {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : "Gửi hồ sơ đăng ký"}
                                    </Button>
                                </div>
                            </form>
                        </div>

                         {/* Sidebar Info (4 cols) */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-secondary/20 rounded-2xl p-6 space-y-4 sticky top-24">
                                <h3 className="font-bold text-lg">Quyền lợi khi tham gia</h3>
                                <ul className="space-y-3">
                                    <li className="flex gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                        <span className="text-sm">Tiếp cận hàng ngàn khách hàng tiềm năng mỗi ngày</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                        <span className="text-sm">Tự do sắp xếp lịch làm việc và nhận việc</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                        <span className="text-sm">Được hỗ trợ marketing và xây dựng thương hiệu cá nhân</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                        <span className="text-sm">Thanh toán an toàn, minh bạch qua nền tảng</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
};


export const HandymanFeature: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<any>(null);
  const { isAuthenticated } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  // Filter logic
  const filteredExperts = mockExperts.filter(expert => {
    const matchesSearch = expert.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          expert.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = activeCategory === "all" || expert.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleHire = (expert: any) => {
    if (!isAuthenticated) {
        setShowLogin(true);
        return;
    }
    // TODO: Implement hire logic
    toast.success(`Đã gửi yêu cầu gọi thợ đến ${expert.name}`);
  };

  const handleRegister = () => {
    setShowRegister(true);
  };

  if (showRegister) {
      return <RegisterHandymanPage onBack={() => setShowRegister(false)} isAuthenticated={isAuthenticated} onRequireLogin={() => setShowLogin(true)} />;
  }

  return (
    <div className="flex flex-col flex-1 h-full min-w-0 bg-background relative z-10">
      <Dialog open={showLogin} onOpenChange={setShowLogin}>
          <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-4xl w-full">
               <DialogTitle className="hidden">Đăng nhập</DialogTitle>
              <LoginPage onLoginSuccess={() => setShowLogin(false)} onBack={() => setShowLogin(false)} isModal={true} />
          </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="h-[calc(3.5rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] border-b border-border/40 bg-background/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 shrink-0 z-40 sticky top-0">
         <div className="flex items-center gap-2 min-w-fit">
             <Button variant="ghost" size="icon" onClick={() => navigate('/giao-viec-lam')}>
                <ChevronLeft className="w-5 h-5" />
             </Button>
            <div className="bg-primary/10 p-2 rounded-xl">
                <Hammer className="w-6 h-6 text-primary" />
            </div>
            <div>
                <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 truncate">
                    Gọi Thợ
                </h1>
            </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 flex-1 justify-end max-w-2xl ml-4">
            <div className="relative max-w-md w-full hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                    placeholder="Tìm thợ, dịch vụ..." 
                    className="pl-9 h-10 rounded-xl bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/50 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <Button className="rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 shrink-0" onClick={handleRegister}>
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Đăng ký Thợ</span>
                <span className="md:hidden">Đăng ký</span>
            </Button>
        </div>
      </div>

      {/* Categories Bar */}
      <div className="border-b border-border/40 bg-background/50 backdrop-blur-sm sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-30">
          <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-2 p-3 px-4 md:px-8 w-max">
                  {expertCategories.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <Button
                            key={cat.id}
                            variant={activeCategory === cat.id ? "default" : "outline"}
                            size="sm"
                            className={cn(
                                "rounded-full border shadow-sm transition-all duration-300",
                                activeCategory === cat.id 
                                    ? "bg-primary hover:bg-primary/90 border-primary" 
                                    : "bg-background/50 hover:bg-secondary border-border/50 hover:border-border"
                            )}
                            onClick={() => setActiveCategory(cat.id)}
                        >
                            <Icon className="w-3.5 h-3.5 mr-1.5" />
                            {cat.label}
                        </Button>
                      );
                  })}
              </div>
              <ScrollBar orientation="horizontal" className="hidden" />
          </ScrollArea>
      </div>

      {/* Main Content */}
      <ScrollArea className="flex-1 w-full bg-secondary/5">
        <div className="max-w-[1600px] mx-auto w-full p-4 md:p-8 pb-32">
            
            {/* Mobile Search */}
            <div className="md:hidden mb-6 relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                    placeholder="Tìm thợ, dịch vụ..." 
                    className="pl-9 h-11 rounded-xl bg-background border shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredExperts.map((expert) => (
                    <div 
                        key={expert.id} 
                        className="group bg-background border border-border/50 hover:border-primary/50 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col relative overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4 relative z-10">
                             <div className="flex gap-3">
                                <Avatar className="w-12 h-12 border-2 border-background shadow-md">
                                    <AvatarImage src={expert.image} />
                                    <AvatarFallback className={cn("text-white font-bold", 
                                        expert.category === 'dien-lanh' ? 'bg-blue-500' :
                                        expert.category === 'nuoc' ? 'bg-cyan-500' :
                                        expert.category === 'dien' ? 'bg-yellow-500' :
                                        expert.category === 'xay-dung' ? 'bg-orange-500' : 'bg-primary'
                                    )}>
                                        {expert.avatar}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-bold text-base group-hover:text-primary transition-colors line-clamp-1">{expert.name}</h3>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                                        <Briefcase className="w-3 h-3" />
                                        <span className="truncate max-w-[120px]">{expert.role}</span>
                                    </div>
                                </div>
                             </div>
                             {expert.verified && (
                                 <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-1.5 rounded-full" title="Đã xác thực">
                                     <CheckCircle2 className="w-4 h-4" />
                                 </div>
                             )}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                             <div className="bg-secondary/30 rounded-lg p-2 flex items-center gap-2">
                                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                <span className="font-semibold">{expert.rating}</span>
                                <span className="text-muted-foreground">({expert.reviews})</span>
                             </div>
                             <div className="bg-secondary/30 rounded-lg p-2 flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="truncate">{expert.location}</span>
                             </div>
                        </div>

                        {/* Bio */}
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[40px]">
                            {expert.bio}
                        </p>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-1.5 mb-4 flex-1">
                            {expert.skills.slice(0, 3).map(skill => (
                                <Badge key={skill} variant="secondary" className="bg-secondary/50 hover:bg-secondary font-normal text-xs">
                                    {skill}
                                </Badge>
                            ))}
                            {expert.skills.length > 3 && (
                                <Badge variant="secondary" className="bg-secondary/50 font-normal text-xs">+{expert.skills.length - 3}</Badge>
                            )}
                        </div>

                        <div className="mt-auto pt-4 border-t border-border/40 flex items-center justify-between gap-3">
                            <div>
                                <div className="text-xs text-muted-foreground">Giá từ</div>
                                <div className="font-bold text-primary">{expert.price}</div>
                            </div>
                            <Button size="sm" className="rounded-xl shadow-lg shadow-primary/20" onClick={() => handleHire(expert)}>
                                Liên hệ
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredExperts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-secondary/30 rounded-full flex items-center justify-center mb-4">
                        <Search className="w-10 h-10 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Không tìm thấy thợ phù hợp</h3>
                    <p className="text-muted-foreground max-w-md mt-2">
                        Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.
                    </p>
                    <Button variant="outline" className="mt-6" onClick={() => { setActiveCategory("all"); setSearchQuery(""); }}>
                        Xóa bộ lọc
                    </Button>
                </div>
            )}

        </div>
      </ScrollArea>
    </div>
  );
};
