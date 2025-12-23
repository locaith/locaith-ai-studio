import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, HardHat, MapPin, DollarSign, Clock, Briefcase, Star, Shield, CheckCircle2, ChevronRight, User, Users, UserPlus, Building2, Globe, GraduationCap, LayoutGrid, List, ChevronLeft, MessageCircle, Info, Calendar, FileText, Paperclip, Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { GlobalSidebar, FeatureType } from './GlobalSidebar';
import { useLayoutContext } from '../src/context/LayoutContext';
import { useAuth } from '../src/hooks/useAuth';
import { LoginPage } from './LoginPage';

// --- Mock Data ---

const jobCategories = [
  { 
    label: "Chuyên gia & Văn phòng",
    items: [
      { id: "dev", label: "Lập trình & IT" },
      { id: "design", label: "Thiết kế & Sáng tạo" },
      { id: "marketing", label: "Marketing & Sales" },
      { id: "content", label: "Viết lách & Dịch thuật" },
      { id: "admin", label: "Hành chính & Nhân sự" },
      { id: "service", label: "Dịch vụ & CSKH" },
      { id: "finance", label: "Tài chính & Kế toán" },
      { id: "legal", label: "Pháp lý" },
    ]
  },
  {
    label: "Thợ & Dịch vụ kỹ thuật",
    items: [
      { id: "dien-lanh", label: "Điện lạnh" },
      { id: "nuoc", label: "Nước & Vệ sinh" },
      { id: "dien", label: "Điện dân dụng" },
      { id: "dien-tu", label: "Điện tử & Công nghệ" },
      { id: "xay-dung", label: "Xây dựng & Kiến trúc" },
      { id: "noi-that", label: "Nhôm kính & Nội thất" },
      { id: "co-khi", label: "Cơ khí & Hàn xì" },
      { id: "sua-xe", label: "Sửa xe & Cứu hộ" },
      { id: "khoa", label: "Sửa khóa & Cửa cuốn" },
      { id: "camera", label: "Camera & An ninh" },
    ]
  },
  {
    label: "Dịch vụ đời sống",
    items: [
      { id: "giup-viec", label: "Giúp việc & Tạp vụ" },
      { id: "fnb", label: "F&B & Nấu ăn" },
      { id: "lam-dep", label: "Làm đẹp (Makeup, Nails, Spa)" },
      { id: "van-chuyen", label: "Vận chuyển & Giao hàng" },
    ]
  }
];

const allCategoriesFlat = jobCategories.flatMap(g => g.items);

const generateMockJobs = () => {
  const baseJobs = [
    {
      id: 1,
      title: "Thiết kế UI/UX cho App Thương mại điện tử",
      type: "Dự án ngắn hạn",
      category: "design",
      budget: "15.000.000 - 25.000.000 VNĐ",
      deposit: "2.000.000 VNĐ",
      deadline: "2 tuần",
      location: "Remote",
      poster: { name: "TechStart Corp", avatar: "TC", rating: 4.8, verified: true, commentCount: 128 },
      requirements: ["Kinh nghiệm Mobile App", "Figma", "Portfolio E-commerce"],
      postedAt: "2 giờ trước",
      timestamp: Date.now() - 7200000,
      status: "open",
      description: "Chúng tôi đang tìm kiếm một UI/UX Designer tài năng để thiết kế giao diện cho ứng dụng thương mại điện tử mới. Bạn sẽ làm việc trực tiếp với Product Owner và Developer team để tạo ra trải nghiệm người dùng tốt nhất."
    },
    {
      id: 2,
      title: "Chuyên viên tư vấn giải pháp AI cho doanh nghiệp",
      type: "Toàn thời gian",
      category: "marketing",
      budget: "25.000.000 - 40.000.000 VNĐ/tháng",
      deposit: "Không yêu cầu",
      deadline: "Tuyển gấp",
      location: "Hà Nội",
      poster: { name: "Locaith AI Solutions", avatar: "LA", rating: 5.0, verified: true, commentCount: 856 },
      requirements: ["Hiểu biết AI", "Tiếng Anh tốt", "Giao tiếp xuất sắc"],
      postedAt: "Vừa xong",
      timestamp: Date.now(),
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
      timestamp: Date.now() - 18000000,
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
      timestamp: Date.now() - 86400000,
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
      timestamp: Date.now() - 259200000,
      status: "open",
      description: "Cần dịch thuật tài liệu kỹ thuật chuyên ngành cơ khí từ tiếng Anh sang tiếng Việt. Yêu cầu độ chính xác cao, sử dụng đúng thuật ngữ chuyên ngành."
    },
    // Adding more mock data for pagination
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
      timestamp: Date.now() - 1800000,
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
      timestamp: Date.now() - 14400000,
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
      timestamp: Date.now() - 600000,
      status: "urgent",
      description: "Tuyển trợ lý ảo trực page, trả lời tin nhắn khách hàng và chốt đơn cho Shop Mẹ & Bé. Làm việc online, thời gian linh hoạt."
    },
    {
      id: 9,
      title: "Video Editor cho kênh TikTok",
      type: "Freelance",
      category: "design",
      budget: "200.000 VNĐ/video",
      deposit: "Không",
      deadline: "Dài hạn",
      location: "Remote",
      poster: { name: "KOL Life", avatar: "KL", rating: 4.6, verified: true, commentCount: 38 },
      requirements: ["CapCut/Premiere", "Bắt trend", "Hài hước"],
      postedAt: "6 giờ trước",
      timestamp: Date.now() - 21600000,
      status: "open",
      description: "Tìm Video Editor edit video TikTok chủ đề lifestyle/vlog. Yêu cầu biết bắt trend, edit hài hước, có gu thẩm mỹ tốt."
    },
    {
      id: 10,
      title: "Viết bài PR báo chí",
      type: "Dự án",
      category: "content",
      budget: "1.000.000 VNĐ/bài",
      deposit: "Không",
      deadline: "2 ngày",
      location: "Remote",
      poster: { name: "Media Corp", avatar: "MC", rating: 4.8, verified: true, commentCount: 77 },
      requirements: ["Văn phong báo chí", "Quan hệ báo chí là lợi thế"],
      postedAt: "1 ngày trước",
      timestamp: Date.now() - 90000000,
      status: "open"
    },
    {
      id: 11,
      title: "Tuyển dụng HR Executive",
      type: "Full-time",
      category: "admin",
      budget: "10.000.000 - 15.000.000 VNĐ",
      deposit: "Không",
      deadline: "15/12",
      location: "Đà Nẵng",
      poster: { name: "Resort Blue", avatar: "RB", rating: 4.3, verified: true, commentCount: 19 },
      requirements: ["Kinh nghiệm tuyển dụng", "Luật lao động"],
      postedAt: "2 ngày trước",
      timestamp: Date.now() - 172800000,
      status: "open"
    },
    {
      id: 12,
      title: "Chạy quảng cáo Facebook Ads",
      type: "Dự án",
      category: "marketing",
      budget: "Thỏa thuận",
      deposit: "Không",
      deadline: "Gấp",
      location: "Remote",
      poster: { name: "Fashion Store", avatar: "FS", rating: 4.1, verified: false, commentCount: 5 },
      requirements: ["Kinh nghiệm chạy ngành thời trang", "Cam kết ra đơn"],
      postedAt: "1 giờ trước",
      timestamp: Date.now() - 3600000,
      status: "urgent"
    },
    {
      id: 13,
      title: "Sửa chữa điều hòa không mát",
      type: "Dự án ngắn hạn",
      category: "dien-lanh",
      budget: "500.000 - 1.000.000 VNĐ",
      deposit: "Không yêu cầu",
      deadline: "Gấp",
      location: "Hà Nội",
      poster: { name: "Nguyễn Thị B", avatar: "NB", rating: 5.0, verified: true, commentCount: 3 },
      requirements: ["Có mặt trong 1h", "Bảo hành 3 tháng"],
      postedAt: "15 phút trước",
      timestamp: Date.now() - 900000,
      status: "urgent",
      description: "Điều hòa Daikin 12000BTU bật không mát, cần thợ kiểm tra và nạp ga nếu cần. Địa chỉ: Cầu Giấy, Hà Nội."
    },
    {
      id: 14,
      title: "Xử lý đường ống nước bị rò rỉ",
      type: "Dự án ngắn hạn",
      category: "nuoc",
      budget: "300.000 - 500.000 VNĐ",
      deposit: "Không yêu cầu",
      deadline: "Trong ngày",
      location: "TP.HCM",
      poster: { name: "Trần Văn C", avatar: "TC", rating: 4.8, verified: true, commentCount: 12 },
      requirements: ["Mang theo đồ nghề", "Kinh nghiệm điện nước"],
      postedAt: "1 giờ trước",
      timestamp: Date.now() - 3600000,
      status: "open",
      description: "Đường ống nước dưới bồn rửa bát bị rò rỉ nước, cần thợ đến kiểm tra và thay thế đoạn ống hỏng."
    },
    {
      id: 15,
      title: "Thi công sơn lại phòng ngủ",
      type: "Dự án",
      category: "xay-dung",
      budget: "2.000.000 - 3.000.000 VNĐ",
      deposit: "500.000 VNĐ",
      deadline: "Cuối tuần này",
      location: "Đà Nẵng",
      poster: { name: "Lê Văn D", avatar: "LD", rating: 4.5, verified: false, commentCount: 0 },
      requirements: ["Sơn nước", "Tỉ mỉ", "Dọn dẹp sau thi công"],
      postedAt: "3 giờ trước",
      timestamp: Date.now() - 10800000,
      status: "open",
      description: "Cần tìm thợ sơn lại phòng ngủ diện tích 20m2. Đã có sẵn sơn, chỉ cần nhân công và dụng cụ."
    }
  ];
  return baseJobs;
};

// --- Components ---

const JobCard = ({ job, onClick, onApply }: { job: any, onClick: () => void, onApply: () => void }) => (
  <div 
    className="group relative bg-white dark:bg-secondary/20 border border-transparent hover:border-primary/20 rounded-xl p-3 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer flex flex-col md:flex-row gap-4 items-start md:items-center w-full"
    onClick={onClick}
  >
    
    {/* Section 1: Poster Info (Compact & Responsive) */}
    <div className="flex flex-row md:flex-col items-center md:items-center md:justify-center gap-3 md:gap-2 shrink-0 w-full md:w-40">
        <div className="relative shrink-0">
            <Avatar className="h-12 w-12 md:h-14 md:w-14 rounded-lg border border-border/50">
                <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold text-xs md:text-sm">{job.poster.avatar}</AvatarFallback>
            </Avatar>
            {job.poster.verified && (
                <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                    <CheckCircle2 className="w-3 h-3 text-blue-500 fill-blue-500/10" />
                </div>
            )}
        </div>
        <div className="flex flex-col gap-1.5 min-w-0 flex-1 md:items-center md:text-center">
            <h4 className="font-semibold text-sm text-foreground leading-tight line-clamp-2 md:line-clamp-2 break-words" title={job.poster.name}>
                {job.poster.name}
            </h4>
            <div className="flex items-center flex-wrap gap-2 md:justify-center">
                <div className="flex items-center gap-1 text-[10px] text-yellow-600 bg-yellow-500/10 px-1.5 py-0.5 rounded-full shrink-0">
                    <Star className="w-2.5 h-2.5 fill-yellow-500" />
                    <span className="font-medium">{job.poster.rating}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-blue-600 bg-blue-500/10 px-1.5 py-0.5 rounded-full shrink-0">
                    <MessageCircle className="w-2.5 h-2.5" />
                    <span className="font-medium">{job.poster.commentCount || 0}</span>
                </div>
                {job.status === 'urgent' && (
                    <Badge variant="destructive" className="h-4 px-1 text-[9px] animate-pulse shrink-0">
                        HOT
                    </Badge>
                )}
            </div>
        </div>
    </div>

    {/* Section 2: Main Content (Expanded) */}
    <div className="flex-1 min-w-0 w-full flex flex-col gap-2">
        {/* Title Area */}
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-medium text-muted-foreground bg-secondary px-1.5 py-0.5 rounded border border-border/50">
                    #{job.id}
                </span>
            </div>
            <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight w-full" title={job.title}>
                {job.title}
            </h3>
        </div>

        {/* Requirements Tags */}
        <div className="flex flex-wrap gap-1.5">
            {job.requirements.slice(0, 3).map((req: string, idx: number) => (
                <span key={idx} className="text-[10px] bg-secondary/30 px-2 py-1 rounded-md text-foreground/80 border border-border/50 whitespace-nowrap max-w-[120px] truncate">
                    {req}
                </span>
            ))}
            {job.requirements.length > 3 && (
                <span className="text-[10px] px-1.5 py-1 text-muted-foreground bg-secondary/20 rounded-md">+{job.requirements.length - 3}</span>
            )}
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{job.location}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
                <Clock className="w-3 h-3 shrink-0" />
                <span>{job.postedAt}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
                <Briefcase className="w-3 h-3 shrink-0" />
                <span>{job.deadline}</span>
            </div>
        </div>
    </div>

    {/* Section 3: Action & Price */}
    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center w-full md:w-auto gap-4 md:gap-2 pl-0 md:pl-4 md:border-l border-border/50 shrink-0">
        <div className="text-left md:text-right flex-1 min-w-0 md:w-full">
            <div className="font-bold text-sm text-green-600 dark:text-green-400">
                {job.budget.includes(" - ") ? (
                    <div className="flex flex-col leading-tight">
                        <span className="whitespace-nowrap truncate">Từ {job.budget.split(" - ")[0]}</span>
                        <span className="whitespace-nowrap truncate">đến {job.budget.split(" - ")[1]}</span>
                    </div>
                ) : (
                    <div className="truncate">{job.budget}</div>
                )}
            </div>
            <div className="text-[10px] text-muted-foreground truncate mt-0.5">
                Cọc: <span className="font-medium text-orange-600 dark:text-orange-400">{job.deposit}</span>
            </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-end md:items-center gap-2 shrink-0">
             <Badge variant="outline" className="h-8 px-2 text-[10px] border-primary/20 text-primary bg-primary/5 shrink-0 whitespace-nowrap hidden sm:flex">
                {job.type}
            </Badge>
            <Button 
                size="sm" 
                variant="outline"
                className="shrink-0 rounded-lg px-3 h-8 text-xs font-medium hover:text-primary hover:bg-primary/5"
                onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
            >
                <Info className="w-3.5 h-3.5 mr-1.5" />
                Thông tin
            </Button>
            <Button 
                size="sm" 
                className="shrink-0 rounded-lg px-3 h-8 text-xs font-medium group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-lg shadow-primary/10"
                onClick={(e) => {
                    e.stopPropagation();
                    onApply();
                }}
            >
                Ứng tuyển
            </Button>
        </div>
    </div>
  </div>
);

const PostJobModal = () => (
  <DialogContent className="sm:max-w-[600px] rounded-3xl">
    <DialogHeader>
      <DialogTitle className="text-2xl font-bold flex items-center gap-2">
        <Plus className="w-6 h-6 text-primary" />
        Đăng tin tuyển dụng mới
      </DialogTitle>
      <DialogDescription>
        Điền thông tin chi tiết về công việc để tìm kiếm ứng viên phù hợp nhất.
      </DialogDescription>
    </DialogHeader>
    <ScrollArea className="max-h-[70vh] pr-4">
      <div className="grid gap-6 py-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Tiêu đề công việc</Label>
          <Input id="title" placeholder="VD: Thiết kế Logo thương hiệu..." className="rounded-xl" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Ngành nghề</Label>
            <Select>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Chọn ngành nghề" />
              </SelectTrigger>
              <SelectContent>
                {jobCategories.map((group, idx) => (
                  <SelectGroup key={idx}>
                    <SelectLabel>{group.label}</SelectLabel>
                    {group.items.map(item => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Loại hình</Label>
            <Select>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Chọn loại hình" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Dự án ngắn hạn">Dự án ngắn hạn</SelectItem>
                <SelectItem value="Dự án dài hạn">Dự án dài hạn</SelectItem>
                <SelectItem value="Toàn thời gian">Toàn thời gian</SelectItem>
                <SelectItem value="Part-time">Part-time</SelectItem>
                <SelectItem value="Freelance">Freelance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="budget">Ngân sách dự kiến</Label>
            <Input id="budget" placeholder="VD: 5.000.000 VNĐ" className="rounded-xl" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="deposit" className="text-orange-600 font-medium">Yêu cầu cọc (nếu có)</Label>
            <Input id="deposit" placeholder="VD: 30% hoặc 0" className="rounded-xl border-orange-200 focus:border-orange-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="location">Địa điểm làm việc</Label>
            <Input id="location" placeholder="VD: Remote, Hà Nội..." className="rounded-xl" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="deadline">Hạn nộp hồ sơ</Label>
            <Input id="deadline" placeholder="VD: 2 tuần, 30/12..." className="rounded-xl" />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="reqs">Kỹ năng / Yêu cầu chính</Label>
          <Input id="reqs" placeholder="VD: Photoshop, Illustrator, Vẽ tay (Cách nhau dấu phẩy)" className="rounded-xl" />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="desc">Mô tả chi tiết công việc</Label>
          <Textarea id="desc" placeholder="Mô tả chi tiết yêu cầu, quyền lợi, trách nhiệm..." className="rounded-xl min-h-[120px]" />
        </div>
      </div>
    </ScrollArea>
    <div className="flex justify-end gap-3 pt-4 border-t">
      <DialogClose asChild>
        <Button variant="outline" className="rounded-xl">Hủy</Button>
      </DialogClose>
      <Button className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => toast.success("Tin của bạn đã được gửi đi phê duyệt!")}>
        Đăng tin ngay
      </Button>
    </div>
  </DialogContent>
);

const ApplyJobPage = ({ job, onBack, isAuthenticated, onRequireLogin }: { job: any; onBack: () => void; isAuthenticated: boolean; onRequireLogin: () => void }) => {
  const [bid, setBid] = useState<string>("");
  
  // Helper to parse and format currency
  const parseCurrency = (value: string) => parseInt(value.replace(/\D/g, "") || "0", 10);
  const formatCurrency = (value: number) => value.toLocaleString("vi-VN");

  const handleBidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    if (rawValue) {
        setBid(parseInt(rawValue, 10).toLocaleString("vi-VN"));
    } else {
        setBid("");
    }
  };

  const bidAmount = parseCurrency(bid);
  const fee = Math.round(bidAmount * 0.1); // 10% platform fee
  const net = bidAmount - fee;

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
                Ứng tuyển: {job.title}
            </div>
        </div>
        
        <ScrollArea className="flex-1 w-full">
            <div className="max-w-5xl mx-auto w-full p-4 md:p-8 pb-32">
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Application Form (8 cols) */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-background rounded-2xl border border-border/50 shadow-sm p-6 md:p-8">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" />
                                Thư giới thiệu & Hồ sơ
                            </h2>
                            
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-base font-semibold">Tại sao bạn phù hợp với công việc này?</Label>
                                    <Textarea 
                                        className="min-h-[200px] rounded-xl border-muted-foreground/20 focus:border-primary resize-y bg-secondary/10 text-base leading-relaxed p-4 shadow-sm"
                                        placeholder="Hãy viết ngắn gọn về kinh nghiệm và kỹ năng của bạn..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-base font-semibold">Tài liệu đính kèm</Label>
                                     <div className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-8 flex flex-col items-center justify-center gap-4 bg-secondary/5 hover:bg-secondary/10 transition-colors cursor-pointer group">
                                        <div className="bg-secondary p-3 rounded-full group-hover:scale-110 transition-transform">
                                            <Upload className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-foreground">
                                                <span className="text-primary hover:underline">Tải lên</span> CV hoặc Portfolio của bạn
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">Hỗ trợ PDF, DOCX, JPG, PNG (Tối đa 10MB)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Job Summary & Terms (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Job Summary Card */}
                        <div className="bg-secondary/10 rounded-2xl border border-border/50 p-6 space-y-4">
                            <h3 className="font-bold text-lg text-foreground">Thông tin công việc</h3>
                            <div className="space-y-3 text-sm">
                                <div className="font-medium text-primary text-base line-clamp-2">{job.title}</div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <DollarSign className="w-4 h-4" />
                                    <span>Ngân sách: <span className="text-foreground font-medium">{job.budget}</span></span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <MapPin className="w-4 h-4" />
                                    <span>{job.location}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Briefcase className="w-4 h-4" />
                                    <span>{job.type}</span>
                                </div>
                            </div>
                        </div>

                        {/* Bid Terms Card */}
                        <div className="bg-background rounded-2xl border border-border/50 shadow-sm p-6 space-y-6">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-green-600" />
                                Chi phí & Thời gian
                            </h3>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                     <Label className="text-sm font-medium text-muted-foreground uppercase">Chào giá (VNĐ)</Label>
                                     <div className="relative">
                                        <Input 
                                            value={bid}
                                            onChange={handleBidChange}
                                            className="pl-9 h-12 text-lg font-bold bg-secondary/20 border-transparent focus:bg-background focus:border-primary transition-all rounded-xl"
                                            placeholder="0"
                                            type="tel" 
                                        />
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₫</span>
                                     </div>
                                     <div className="text-xs text-muted-foreground flex justify-between px-1">
                                         <span>Phí dịch vụ: {formatCurrency(fee)} đ</span>
                                         <span className="font-medium text-green-600">Thực nhận: {formatCurrency(net)} đ</span>
                                     </div>
                                </div>

                                <div className="space-y-2">
                                     <Label className="text-sm font-medium text-muted-foreground uppercase">Thời gian hoàn thành</Label>
                                     <div className="relative">
                                        <Input className="pl-9 h-11 bg-secondary/20 border-transparent focus:bg-background rounded-xl" placeholder="VD: 3 ngày" />
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                     </div>
                                </div>
                                
                                <div className="space-y-2">
                                     <Label className="text-sm font-medium text-muted-foreground uppercase">Đặt cọc (nếu cần)</Label>
                                     <div className="relative">
                                        <Input className="pl-9 h-11 bg-secondary/20 border-transparent focus:bg-background rounded-xl" placeholder="Số tiền..." type="tel" />
                                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                     </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                         <div className="space-y-3 pt-2">
                             <Button 
                                className="w-full h-12 rounded-xl text-base bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                                onClick={() => toast.success("Hồ sơ ứng tuyển đã được gửi thành công!")}
                            >
                                Gửi hồ sơ ứng tuyển
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

const FreelancerRegistrationModal = () => (
  <DialogContent className="sm:max-w-[600px] rounded-3xl">
    <DialogHeader>
      <DialogTitle className="text-2xl font-bold flex items-center gap-2">
        <User className="w-6 h-6 text-primary" />
        Đăng ký làm Freelancer
      </DialogTitle>
      <DialogDescription>
        Hoàn tất hồ sơ để bắt đầu nhận dự án và kiếm tiền trên Locaith.
      </DialogDescription>
    </DialogHeader>
    <ScrollArea className="max-h-[70vh] pr-4">
      <div className="grid gap-6 py-4">
        <div className="grid gap-2">
            <Label htmlFor="fullname">Họ và tên</Label>
            <Input id="fullname" placeholder="VD: Nguyễn Văn A" className="rounded-xl" />
        </div>
        
        <div className="grid gap-2">
            <Label htmlFor="title">Chức danh chuyên môn</Label>
            <Input id="title" placeholder="VD: Senior Frontend Developer" className="rounded-xl" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Lĩnh vực chính</Label>
            <Select>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Chọn lĩnh vực" />
              </SelectTrigger>
              <SelectContent>
                {jobCategories.map((group, idx) => (
                  <SelectGroup key={idx}>
                    <SelectLabel>{group.label}</SelectLabel>
                    {group.items.map(item => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Trình độ</Label>
            <Select>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Chọn trình độ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fresher">Fresher (Mới ra trường)</SelectItem>
                <SelectItem value="junior">Junior (1-2 năm)</SelectItem>
                <SelectItem value="middle">Middle (2-4 năm)</SelectItem>
                <SelectItem value="senior">Senior (5+ năm)</SelectItem>
                <SelectItem value="expert">Chuyên gia (10+ năm)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
             <div className="grid gap-2">
                <Label htmlFor="rate">Mức lương mong muốn / giờ</Label>
                <Input id="rate" placeholder="VD: 200.000 VNĐ" className="rounded-xl" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="portfolio">Link Portfolio / CV</Label>
                <Input id="portfolio" placeholder="VD: behance.net/username" className="rounded-xl" />
            </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="skills">Kỹ năng nổi bật (Cách nhau bằng dấu phẩy)</Label>
          <Input id="skills" placeholder="VD: ReactJS, Figma, Python..." className="rounded-xl" />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="bio">Giới thiệu bản thân</Label>
          <Textarea id="bio" placeholder="Mô tả ngắn gọn về kinh nghiệm và thế mạnh của bạn..." className="rounded-xl min-h-[100px]" />
        </div>
      </div>
    </ScrollArea>
    <div className="flex justify-end gap-3 pt-4 border-t">
      <Button variant="outline" className="rounded-xl">Để sau</Button>
      <Button className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => toast.success("Đăng ký thành công! Hồ sơ đang được duyệt.")}>
        Hoàn tất đăng ký
      </Button>
    </div>
  </DialogContent>
);

const PostJobPage = ({ onBack, isAuthenticated, onRequireLogin }: { onBack: () => void; isAuthenticated: boolean; onRequireLogin: () => void }) => (
    <div className="flex flex-col flex-1 h-full min-w-0 bg-background relative z-10">
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
                Đăng tin tuyển dụng
            </div>
        </div>
        
        <ScrollArea className="flex-1 w-full">
            <div className="max-w-4xl mx-auto w-full p-4 md:p-8 pb-32">
                 <div className="bg-background rounded-2xl border border-border/50 shadow-sm p-6 md:p-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold flex items-center gap-2 mb-2 text-foreground">
                            <Plus className="w-6 h-6 text-primary" />
                            Đăng tin tuyển dụng mới
                        </h1>
                        <p className="text-muted-foreground">
                            Điền thông tin chi tiết về công việc để tìm kiếm ứng viên phù hợp nhất.
                        </p>
                    </div>

                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="title" className="text-base font-semibold">Tiêu đề công việc</Label>
                            <Input id="title" placeholder="VD: Thiết kế Logo thương hiệu..." className="rounded-xl h-12 bg-secondary/20" />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label className="text-base font-semibold">Ngành nghề</Label>
                                <Select>
                                    <SelectTrigger className="rounded-xl h-12 bg-secondary/20">
                                        <SelectValue placeholder="Chọn ngành nghề" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {jobCategories.map((group, idx) => (
                                            <SelectGroup key={idx}>
                                                <SelectLabel>{group.label}</SelectLabel>
                                                {group.items.map(item => (
                                                    <SelectItem key={item.id} value={item.id}>
                                                        {item.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-base font-semibold">Loại hình</Label>
                                <Select>
                                    <SelectTrigger className="rounded-xl h-12 bg-secondary/20">
                                        <SelectValue placeholder="Chọn loại hình" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Dự án ngắn hạn">Dự án ngắn hạn</SelectItem>
                                        <SelectItem value="Dự án dài hạn">Dự án dài hạn</SelectItem>
                                        <SelectItem value="Toàn thời gian">Toàn thời gian</SelectItem>
                                        <SelectItem value="Part-time">Part-time</SelectItem>
                                        <SelectItem value="Freelance">Freelance</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="budget" className="text-base font-semibold">Ngân sách dự kiến</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input id="budget" placeholder="VD: 5.000.000" className="pl-9 rounded-xl h-12 bg-secondary/20" />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">VNĐ</span>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="deposit" className="text-base font-semibold text-orange-600 flex items-center gap-2">
                                    <Shield className="w-4 h-4" /> Yêu cầu cọc (nếu có)
                                </Label>
                                <Input id="deposit" placeholder="VD: 30% hoặc 0" className="rounded-xl h-12 border-orange-200 focus:border-orange-500 bg-orange-50/50" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="location" className="text-base font-semibold">Địa điểm làm việc</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input id="location" placeholder="VD: Remote, Hà Nội..." className="pl-9 rounded-xl h-12 bg-secondary/20" />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="deadline" className="text-base font-semibold">Hạn nộp hồ sơ</Label>
                                 <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input id="deadline" placeholder="VD: 2 tuần, 30/12..." className="pl-9 rounded-xl h-12 bg-secondary/20" />
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="reqs" className="text-base font-semibold">Kỹ năng / Yêu cầu chính</Label>
                            <Input id="reqs" placeholder="VD: Photoshop, Illustrator, Vẽ tay (Cách nhau dấu phẩy)" className="rounded-xl h-12 bg-secondary/20" />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="desc" className="text-base font-semibold">Mô tả chi tiết công việc</Label>
                            <Textarea id="desc" placeholder="Mô tả chi tiết yêu cầu, quyền lợi, trách nhiệm..." className="rounded-xl min-h-[200px] p-4 text-base bg-secondary/20" />
                        </div>
                    </div>

                         <div className="flex justify-end gap-4 pt-6 border-t mt-4">
                            <Button variant="outline" size="lg" className="rounded-xl px-8 h-12" onClick={onBack}>Hủy</Button>
                            <Button size="lg" className="rounded-xl px-8 h-12 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20" onClick={() => {
                                if (!isAuthenticated) {
                                    onRequireLogin();
                                    return;
                                }
                                toast.success("Tin của bạn đã được gửi đi phê duyệt!");
                                onBack();
                            }}>
                                Đăng tin ngay
                            </Button>
                        </div>
                 </div>
            </div>
        </ScrollArea>
    </div>
);

export const JobsFeature: React.FC = () => {
  const navigate = useNavigate();
  const { setIsCollapsed } = useLayoutContext();
  const { isAuthenticated } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [selectedJobForApply, setSelectedJobForApply] = useState<any>(null);
  const itemsPerPage = 20;

  const handleNavigate = (feature: FeatureType) => {
    setSelectedJob(null);
    setIsCreatingJob(false);
    
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

  const allJobs = generateMockJobs();

  // Filter Logic
  const filteredJobs = allJobs.filter(job => {
    const matchesCategory = activeCategory === 'all' || job.category === activeCategory;
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          job.poster.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort Logic: Urgent (HOT) first, then by timestamp (newest first)
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (a.status === 'urgent' && b.status !== 'urgent') return -1;
    if (a.status !== 'urgent' && b.status === 'urgent') return 1;
    return b.timestamp - a.timestamp;
  });

  // Pagination Logic
  const totalPages = Math.ceil(sortedJobs.length / itemsPerPage);
  const currentJobs = sortedJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of list
    const listElement = document.getElementById('job-list-top');
    if (listElement) listElement.scrollIntoView({ behavior: 'smooth' });
  };

  // --- Render Apply Job View ---
  if (selectedJobForApply) {
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
            <ApplyJobPage 
                job={selectedJobForApply} 
                onBack={() => setSelectedJobForApply(null)} 
                isAuthenticated={isAuthenticated}
                onRequireLogin={() => setShowLogin(true)}
            />
        </>
      )
  }

  // --- Render Create Job View ---
  if (isCreatingJob) {
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
            <PostJobPage 
                onBack={() => setIsCreatingJob(false)} 
                isAuthenticated={isAuthenticated}
                onRequireLogin={() => setShowLogin(true)}
            />
        </>
      )
  }

  return (
    <div className="h-full w-full bg-slate-50/50 dark:bg-background text-foreground overflow-y-auto relative font-sans">
      
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50 pt-[env(safe-area-inset-top)] h-[calc(4rem+env(safe-area-inset-top))]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-w-fit">
                <div className="bg-primary/10 p-2 rounded-xl">
                    <Briefcase className="w-6 h-6 text-primary" />
                </div>
            </div>

            <div className="flex-1 max-w-2xl relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    className="pl-9 bg-secondary/50 border-transparent focus:bg-background focus:border-primary/20 transition-all rounded-full h-10" 
                    placeholder="Tìm việc làm, dự án freelance..." 
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1); // Reset page on search
                    }}
                />
            </div>

            <div className="flex items-center gap-3 min-w-fit">
                <Button 
                    className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 border-0"
                    onClick={() => setIsCreatingJob(true)}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Đăng tin
                </Button>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8 pb-32">
        
        {/* Navigation Buttons - Clean & Modern Layout */}
        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-8">
            <div 
                onClick={() => navigate('/chuyen-gia')}
                className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-900 rounded-2xl p-0.5 md:p-1 cursor-pointer shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-1 aspect-[4/3] md:aspect-auto"
            >
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 md:p-4 flex flex-col md:flex-row items-center justify-center md:justify-between h-full gap-1 md:gap-0">
                    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
                        <div className="bg-white/20 p-2 md:p-2.5 rounded-xl text-white group-hover:scale-110 transition-transform">
                            <Users className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="font-bold text-[10px] md:text-lg text-white leading-tight md:leading-none md:mb-1">Chuyên gia</h3>
                            <p className="text-blue-100 text-xs font-medium hidden md:block">Tìm kiếm chuyên gia</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all hidden md:block" />
                </div>
            </div>

            <div 
                onClick={() => navigate('/goi-tho')}
                className="group relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 dark:from-indigo-700 dark:to-purple-900 rounded-2xl p-0.5 md:p-1 cursor-pointer shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1 aspect-[4/3] md:aspect-auto"
            >
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 md:p-4 flex flex-col md:flex-row items-center justify-center md:justify-between h-full gap-1 md:gap-0">
                    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
                        <div className="bg-white/20 p-2 md:p-2.5 rounded-xl text-white group-hover:scale-110 transition-transform">
                            <HardHat className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="font-bold text-[10px] md:text-lg text-white leading-tight md:leading-none md:mb-1">Gọi thợ</h3>
                            <p className="text-purple-100 text-xs font-medium hidden md:block">Dịch vụ sửa chữa</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all hidden md:block" />
                </div>
            </div>

             <Dialog>
                <DialogTrigger asChild>
                    <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-800 rounded-2xl p-0.5 md:p-1 cursor-pointer shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-1 aspect-[4/3] md:aspect-auto">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 md:p-4 flex flex-col md:flex-row items-center justify-center md:justify-between h-full gap-1 md:gap-0">
                            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
                                <div className="bg-white/20 p-2 md:p-2.5 rounded-xl text-white group-hover:scale-110 transition-transform">
                                    <UserPlus className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <div className="text-center md:text-left">
                                    <h3 className="font-bold text-[10px] md:text-lg text-white leading-tight md:leading-none md:mb-1">Đăng ký</h3>
                                    <p className="text-emerald-100 text-xs font-medium hidden md:block">Bắt đầu kiếm tiền</p>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all hidden md:block" />
                        </div>
                    </div>
                </DialogTrigger>
                <FreelancerRegistrationModal />
            </Dialog>
        </div>

        {/* Filters - Professional & Sticky */}
        <div id="job-list-top" className="sticky top-[calc(4rem+env(safe-area-inset-top))] z-30 -mx-4 md:-mx-6 px-4 md:px-6 py-3 bg-slate-50/80 dark:bg-background/80 backdrop-blur-md border-y border-border/40 mb-6 transition-all">
            <ScrollArea className="w-full">
                <div className="flex items-center gap-2.5 pb-1">
                    <button
                        onClick={() => {
                            setActiveCategory("all");
                            setCurrentPage(1);
                        }}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap border select-none",
                            activeCategory === "all"
                                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25 scale-105"
                                : "bg-white dark:bg-secondary/20 text-muted-foreground border-transparent hover:border-border hover:bg-secondary/50 hover:text-foreground"
                        )}
                    >
                        <LayoutGrid className="w-4 h-4" />
                        Tất cả
                    </button>
                    <div className="w-px h-6 bg-border/60 mx-1 shrink-0" />
                    {allCategoriesFlat.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => {
                                setActiveCategory(cat.id);
                                setCurrentPage(1);
                            }}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap border select-none",
                                activeCategory === cat.id
                                    ? "bg-primary/10 text-primary border-primary/20 shadow-sm font-semibold"
                                    : "bg-white dark:bg-secondary/20 text-muted-foreground border-transparent hover:border-border hover:bg-secondary/50 hover:text-foreground"
                            )}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>
        </div>

        {/* Job Grid - Compact List View */}
        <div className="flex flex-col gap-3">
          {currentJobs.length > 0 ? (
            currentJobs.map((job) => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  onClick={() => setSelectedJob(job)}
                  onApply={() => setSelectedJobForApply(job)}
                />
            ))
          ) : (
            <div className="text-center py-20 bg-secondary/20 rounded-3xl border border-dashed">
                <Briefcase className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-bold">Không tìm thấy công việc phù hợp</h3>
                <p className="text-muted-foreground">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
                <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-xl w-10 h-10"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={cn(
                                "w-10 h-10 rounded-xl text-sm font-bold transition-all",
                                currentPage === page
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                            )}
                        >
                            {page}
                        </button>
                    ))}
                </div>

                <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-xl w-10 h-10"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
        )}

        {/* Info Footer */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-border/50">
             <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl flex items-start gap-4">
                <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400 shrink-0" />
                <div>
                    <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-1">Giao dịch an toàn</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Cơ chế bảo vệ thanh toán và đặt cọc minh bạch.</p>
                </div>
             </div>
             <div className="bg-purple-50 dark:bg-purple-900/10 p-6 rounded-2xl flex items-start gap-4">
                <CheckCircle2 className="w-8 h-8 text-purple-600 dark:text-purple-400 shrink-0" />
                <div>
                    <h3 className="font-bold text-purple-900 dark:text-purple-100 mb-1">Xác thực uy tín</h3>
                    <p className="text-sm text-purple-700 dark:text-purple-300">Hệ thống đánh giá và xác thực người dùng nghiêm ngặt.</p>
                </div>
             </div>
             <div className="bg-green-50 dark:bg-green-900/10 p-6 rounded-2xl flex items-start gap-4">
                <Star className="w-8 h-8 text-green-600 dark:text-green-400 shrink-0" />
                <div>
                    <h3 className="font-bold text-green-900 dark:text-green-100 mb-1">Chất lượng cao</h3>
                    <p className="text-sm text-green-700 dark:text-green-300">Kết nối với những chuyên gia hàng đầu trong mọi lĩnh vực.</p>
                </div>
             </div>
        </div>

      </div>



      {/* Job Detail Dialog */}
      <Dialog open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
        <DialogContent hideClose={true} className="!fixed !inset-0 !left-0 !top-0 !translate-x-0 !translate-y-0 !max-w-[100vw] !w-screen !h-screen !p-0 !gap-0 !border-none !shadow-none !bg-background !rounded-none !overflow-hidden !flex !flex-col !z-[100] focus:outline-none data-[state=open]:!slide-in-from-bottom-0 data-[state=open]:!slide-in-from-top-0 data-[state=open]:!zoom-in-100">
        {selectedJob && (
          <div className="flex w-full h-full bg-slate-50/30 dark:bg-background relative overflow-hidden">
            {/* Global Sidebar - Desktop */}
            <div className="hidden lg:block h-full border-r border-border shrink-0 z-50 bg-background w-[240px] xl:w-[260px]">
                <GlobalSidebar 
                    activeFeature="jobs" 
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
                        onClick={() => setSelectedJob(null)}
                    >
                        <ChevronLeft className="w-5 h-5" />
                        <span className="font-medium">Quay lại</span>
                    </Button>
                    <div className="text-sm font-semibold text-foreground/80 hidden md:block">
                        Chi tiết công việc
                    </div>
                    <div className="w-20" /> 
                </div>

                <ScrollArea className="flex-1 w-full h-full">
                    <div className="max-w-7xl mx-auto w-full p-4 md:p-8">
                       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                           {/* LEFT/CENTER Content */}
                           <div className="lg:col-span-8 xl:col-span-9 space-y-6 order-2 lg:order-1">
                               
                               {/* Job Header Info Block */}
                               <div className="bg-background rounded-xl border border-border/50 shadow-sm p-6">
                                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
                                        <h1 className="text-2xl font-bold text-foreground">{selectedJob.title}</h1>
                                        {selectedJob.status === 'urgent' && (
                                            <Badge variant="destructive" className="animate-pulse">HOT</Badge>
                                        )}
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                                        <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {selectedJob.location}</div>
                                        <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {selectedJob.postedAt}</div>
                                        <div className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {selectedJob.type}</div>
                                        <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-bold"><DollarSign className="w-4 h-4" /> {selectedJob.budget}</div>
                                        {selectedJob.deposit && selectedJob.deposit !== "Không yêu cầu" && selectedJob.deposit !== "Không" && (
                                            <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 font-medium">
                                                <Shield className="w-4 h-4" /> Cọc: {selectedJob.deposit}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-3">
                                        <Button 
                                            className="flex-1 md:flex-none rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                                            onClick={() => {
                                                setSelectedJob(null);
                                                setTimeout(() => setSelectedJobForApply(selectedJob), 100);
                                            }}
                                        >
                                            Ứng tuyển ngay
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            className="flex-1 md:flex-none rounded-xl gap-2"
                                            onClick={() => toast.success("Đã lưu công việc vào danh sách quan tâm!")}
                                        >
                                            <Star className="w-4 h-4" /> Lưu tin
                                        </Button>
                                    </div>
                               </div>

                               {/* Description */}
                               <section className="bg-background rounded-xl border border-border/50 shadow-sm p-6">
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                        <Info className="w-5 h-5 text-primary" /> Mô tả công việc
                                    </h3>
                                    <p className="text-foreground/80 leading-relaxed whitespace-pre-line text-justify">
                                        {selectedJob.description || "Chưa có mô tả chi tiết."}
                                    </p>
                               </section>

                               {/* Requirements */}
                               <section className="bg-background rounded-xl border border-border/50 shadow-sm p-6">
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                        <List className="w-5 h-5 text-primary" /> Yêu cầu
                                    </h3>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {selectedJob.requirements.map((req: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 bg-secondary/20 p-3 rounded-lg text-sm">
                                                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                                <span>{req}</span>
                                            </li>
                                        ))}
                                    </ul>
                               </section>
                               
                                {/* Additional Info Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-background rounded-xl border border-border/50 shadow-sm p-4 flex items-center gap-4">
                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl text-blue-600 dark:text-blue-400">
                                            <Calendar className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Hạn nộp hồ sơ</div>
                                            <div className="font-medium mt-0.5">{selectedJob.deadline}</div>
                                        </div>
                                    </div>
                                    <div className="bg-background rounded-xl border border-border/50 shadow-sm p-4 flex items-center gap-4">
                                        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-xl text-purple-600 dark:text-purple-400">
                                            <MessageCircle className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Thảo luận</div>
                                            <div className="font-medium mt-0.5">{selectedJob.poster.commentCount || 0} bình luận</div>
                                        </div>
                                    </div>
                                </div>
                           </div>

                           {/* RIGHT SIDEBAR (Poster Info) */}
                           <div className="lg:col-span-4 xl:col-span-3 space-y-4 lg:sticky lg:top-4 order-1 lg:order-2">
                                <div className="bg-background rounded-xl border border-border/50 shadow-sm p-5 text-center group hover:border-primary/30 transition-colors">
                                    <div className="mb-4 relative inline-block">
                                        <Avatar className="h-24 w-24 rounded-2xl border-4 border-background shadow-lg mx-auto group-hover:scale-105 transition-transform duration-300">
                                            <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">{selectedJob.poster.avatar}</AvatarFallback>
                                        </Avatar>
                                         {selectedJob.poster.verified && (
                                            <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-1 border border-background">
                                                <CheckCircle2 className="w-6 h-6 text-blue-500 fill-blue-500/10" />
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-lg mb-1">{selectedJob.poster.name}</h3>
                                    <div className="flex justify-center items-center gap-1 mb-4">
                                        <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/10 px-2 py-0.5 rounded-full border border-yellow-100 dark:border-yellow-900/20">
                                            <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                                            <span className="font-bold text-yellow-700 dark:text-yellow-500 text-sm">{selectedJob.poster.rating}</span>
                                        </div>
                                        <span className="text-muted-foreground text-xs">({selectedJob.poster.commentCount} đánh giá)</span>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-2 text-sm border-t border-border/50 pt-4">
                                        <div className="text-center p-2 bg-secondary/20 rounded-lg">
                                            <div className="font-bold text-foreground">100%</div>
                                            <div className="text-[10px] text-muted-foreground uppercase mt-1">Phản hồi</div>
                                        </div>
                                         <div className="text-center p-2 bg-secondary/20 rounded-lg">
                                            <div className="font-bold text-green-600">Verified</div>
                                            <div className="text-[10px] text-muted-foreground uppercase mt-1">Xác thực</div>
                                        </div>
                                    </div>
                                    
                                    <Button variant="outline" className="w-full mt-4 rounded-xl text-xs h-9">
                                        Xem hồ sơ
                                    </Button>
                                </div>
                                
                                <div className="bg-blue-50/50 dark:bg-blue-900/5 rounded-xl border border-blue-100 dark:border-blue-900/20 p-4">
                                    <h4 className="font-bold text-blue-800 dark:text-blue-300 text-sm mb-2 flex items-center gap-2">
                                        <Shield className="w-4 h-4" /> An toàn giao dịch
                                    </h4>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
                                        Số tiền thanh toán sẽ được giữ bởi Locaith cho đến khi bạn xác nhận hoàn thành công việc.
                                    </p>
                                </div>
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
