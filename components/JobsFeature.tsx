import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, MapPin, DollarSign, Clock, Briefcase, Star, Shield, CheckCircle2, ChevronRight, User, Users, Building2, Globe, GraduationCap, LayoutGrid, List, ChevronLeft, MessageCircle, Info, Calendar, FileText, Paperclip, Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { GlobalSidebar, FeatureType } from './GlobalSidebar';
import { useLayoutContext } from '../src/context/LayoutContext';

// --- Mock Data ---

const jobCategories = [
  { id: "all", label: "Tất cả" },
  { id: "dev", label: "Lập trình & IT" },
  { id: "design", label: "Thiết kế & Sáng tạo" },
  { id: "marketing", label: "Marketing & Sales" },
  { id: "content", label: "Viết lách & Dịch thuật" },
  { id: "admin", label: "Hành chính & Nhân sự" },
  { id: "service", label: "Dịch vụ & CSKH" },
];

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
                {jobCategories.filter(c => c.id !== 'all').map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
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

const ApplyJobModal = ({ job }: { job: any }) => {
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
    <DialogContent className="sm:max-w-[800px] w-[95vw] md:w-full rounded-2xl p-0 overflow-hidden bg-[#f8f9fc] dark:bg-background max-h-[90dvh] md:max-h-[85vh]">
      {/* Header - Compact & Professional */}
      <div className="bg-white dark:bg-secondary/20 border-b px-3 py-2 md:px-6 md:py-4 flex items-center justify-between sticky top-0 z-10 shrink-0">
          <div className="flex-1 min-w-0">
              <DialogTitle className="text-sm md:text-lg font-bold text-foreground flex items-center gap-2">
                  <Briefcase className="w-4 h-4 md:w-5 md:h-5 text-primary shrink-0" />
                  <span className="line-clamp-1">Ứng tuyển: <span className="text-primary">{job.title}</span></span>
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-[10px] md:text-xs text-muted-foreground">
                   <span className="flex items-center gap-1 shrink-0"><DollarSign className="w-3 h-3" /> <span className="truncate max-w-[150px]">{job.budget}</span></span>
                   <span className="bg-muted px-1.5 rounded-full shrink-0">ID: #{job.id}</span>
              </div>
          </div>
      </div>

      <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-3 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6 pb-20 md:pb-6">
              
              {/* Left Column: Proposal Content (7 cols) */}
              <div className="md:col-span-7 space-y-3 md:space-y-6">
                   <div className="space-y-1.5 md:space-y-3">
                      <Label className="text-xs md:text-base font-semibold flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 md:w-4 md:h-4" /> Thư giới thiệu
                      </Label>
                      <Textarea 
                          className="min-h-[100px] md:min-h-[200px] rounded-xl border-muted-foreground/20 focus:border-primary resize-none bg-white dark:bg-secondary/10 text-xs md:text-sm leading-relaxed p-3 md:p-4 shadow-sm"
                          placeholder="Hãy thuyết phục khách hàng rằng bạn là người phù hợp nhất..."
                      />
                   </div>

                   <div className="space-y-1.5 md:space-y-3">
                      <Label className="text-xs md:text-base font-semibold flex items-center gap-2">
                          <Paperclip className="w-3.5 h-3.5 md:w-4 md:h-4" /> Tài liệu đính kèm
                      </Label>
                       <div className="border border-dashed border-muted-foreground/30 rounded-xl p-3 md:p-4 flex items-center justify-center gap-3 md:gap-4 bg-white dark:bg-secondary/10 hover:bg-secondary/20 transition-colors cursor-pointer group">
                          <div className="bg-secondary p-1.5 md:p-2 rounded-lg group-hover:scale-110 transition-transform">
                              <Upload className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                          </div>
                          <div className="text-xs md:text-sm text-muted-foreground">
                              <span className="text-primary font-medium">Tải lên</span> CV hoặc Portfolio
                          </div>
                      </div>
                   </div>
              </div>

              {/* Right Column: Financial Terms (5 cols) */}
              <div className="md:col-span-5 space-y-3">
                  <div className="bg-white dark:bg-secondary/10 rounded-xl border border-border shadow-sm p-3 md:p-5 space-y-3 md:space-y-5">
                      <div className="flex items-center gap-2 pb-2 md:pb-3 border-b border-dashed">
                          <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                          <h3 className="font-bold text-xs md:text-sm uppercase text-muted-foreground tracking-wider">Chi phí & Thời gian</h3>
                      </div>

                      {/* Bid Input */}
                      <div className="space-y-1.5">
                           <Label className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase">Chào giá (VNĐ)</Label>
                           <div className="relative">
                              <Input 
                                  value={bid}
                                  onChange={handleBidChange}
                                  className="pl-8 md:pl-9 h-9 md:h-12 text-sm md:text-lg font-bold bg-secondary/30 border-transparent hover:border-primary/30 focus:bg-background focus:border-primary transition-all rounded-lg"
                                  placeholder="0"
                                  type="tel" 
                              />
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₫</span>
                           </div>
                           
                           {/* Calculation Breakdown */}
                           <div className="bg-secondary/30 rounded-lg p-2 md:p-3 space-y-1 md:space-y-2 text-xs md:text-sm">
                              <div className="flex justify-between text-muted-foreground text-[10px] md:text-xs">
                                  <span>Phí dịch vụ (10%)</span>
                                  <span>- {formatCurrency(fee)} đ</span>
                              </div>
                              <div className="flex justify-between items-center pt-1.5 md:pt-2 border-t border-dashed border-muted-foreground/20">
                                  <span className="font-medium text-foreground">Thực nhận</span>
                                  <span className="font-bold text-green-600 text-sm md:text-base">{formatCurrency(net)} đ</span>
                              </div>
                           </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                          {/* Duration */}
                          <div className="space-y-1.5">
                               <Label className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase">Hoàn thành</Label>
                               <div className="relative">
                                  <Input className="pl-7 md:pl-9 h-9 md:h-10 bg-secondary/30 border-transparent hover:border-primary/30 focus:bg-background rounded-lg text-xs md:text-sm" placeholder="VD: 3 ngày" />
                                  <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground" />
                               </div>
                          </div>

                           {/* Deposit */}
                           <div className="space-y-1.5">
                              <Label className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase flex justify-between">
                                  <span>Cọc</span>
                              </Label>
                              <div className="relative">
                                  <Input className="h-9 md:h-10 bg-secondary/30 border-transparent hover:border-orange-200 focus:bg-background focus:border-orange-500 rounded-lg text-xs md:text-sm pl-2" placeholder="Số tiền..." type="tel" />
                              </div>
                           </div>
                      </div>
                  </div>
              </div>

          </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 md:p-4 bg-white dark:bg-secondary/20 border-t flex justify-between items-center shrink-0 w-full z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-none">
          <p className="text-[10px] md:text-xs text-muted-foreground hidden md:block">
              Bằng việc nộp hồ sơ, bạn đồng ý với <span className="text-primary underline cursor-pointer">Điều khoản dịch vụ</span>.
          </p>
          <div className="flex gap-2 md:gap-3 w-full md:w-auto">
               <DialogClose asChild>
                   <Button variant="ghost" className="rounded-xl flex-1 md:flex-none h-9 md:h-10 text-xs md:text-sm">Hủy</Button>
               </DialogClose>
               <Button 
                className="rounded-xl flex-1 md:flex-none h-9 md:h-10 text-xs md:text-sm bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                onClick={() => toast.success("Hồ sơ ứng tuyển đã được gửi thành công!")}
               >
                  Gửi hồ sơ
               </Button>
          </div>
      </div>
    </DialogContent>
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
                {jobCategories.filter(c => c.id !== 'all').map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
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

export const JobsFeature: React.FC = () => {
  const navigate = useNavigate();
  const { setIsCollapsed } = useLayoutContext();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [selectedJobForApply, setSelectedJobForApply] = useState<any>(null);
  const itemsPerPage = 5;

  const handleNavigate = (feature: FeatureType) => {
    setSelectedJob(null);
    
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

  return (
    <div className="h-full w-full bg-slate-50/50 dark:bg-background text-foreground overflow-y-auto relative font-sans">
      
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50 pt-[env(safe-area-inset-top)] h-[calc(4rem+env(safe-area-inset-top))]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-w-fit">
                <div 
                  className="bg-primary text-primary-foreground p-1.5 rounded-lg cursor-pointer md:cursor-default"
                  onClick={() => {
                    // Navigate to Experts page on mobile
                    if (window.innerWidth < 768) {
                      navigate('/chuyen-gia');
                    }
                  }}
                >
                    <Users className="h-5 w-5 md:hidden" />
                    <Briefcase className="h-5 w-5 hidden md:block" />
                </div>
                <span className="font-bold text-lg hidden md:block">Sàn Việc Làm</span>
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
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 border-0">
                        <Plus className="w-4 h-4 mr-2" />
                        Đăng tin
                    </Button>
                  </DialogTrigger>
                  <PostJobModal />
                </Dialog>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8 pb-32">
        
        {/* Hero / Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-blue-500/10">
            <div className="relative z-10">
              <h3 className="text-lg font-medium opacity-90 mb-1">Công việc mới</h3>
              <p className="text-4xl font-bold">1,248</p>
            </div>
            <div className="absolute -right-4 -bottom-4 bg-white/10 w-32 h-32 rounded-full blur-2xl"></div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-purple-500/10">
             <div className="relative z-10">
              <h3 className="text-lg font-medium opacity-90 mb-1">Hoàn thành</h3>
              <p className="text-4xl font-bold">856</p>
            </div>
            <div className="absolute -right-4 -bottom-4 bg-white/10 w-32 h-32 rounded-full blur-2xl"></div>
          </div>
           <div className="col-span-2 md:col-span-1 bg-white dark:bg-secondary/20 border border-border/50 rounded-3xl p-6 relative overflow-hidden flex items-center justify-between group cursor-pointer hover:border-primary/50 transition-all">
             <div>
              <h3 className="text-lg font-bold text-foreground mb-1">Đăng ký Freelancer</h3>
              <p className="text-sm text-muted-foreground">Tạo hồ sơ và bắt đầu kiếm tiền ngay hôm nay</p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="link" className="p-0 h-auto mt-2 text-primary font-bold">
                    Tham gia ngay <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </DialogTrigger>
                <FreelancerRegistrationModal />
              </Dialog>
            </div>
            <div className="bg-primary/10 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                <User className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div id="job-list-top" className="flex flex-col md:flex-row items-center justify-between gap-4 sticky top-[calc(4rem+env(safe-area-inset-top))] z-30 py-2 bg-slate-50/50 dark:bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <ScrollArea className="w-full max-w-[calc(100vw-32px)]">
                <div className="flex items-center gap-2">
                    {jobCategories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => {
                                setActiveCategory(cat.id);
                                setCurrentPage(1);
                            }}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                                activeCategory === cat.id
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

      {/* Apply Job Modal */}
      <Dialog open={!!selectedJobForApply} onOpenChange={(open) => !open && setSelectedJobForApply(null)}>
        {selectedJobForApply && <ApplyJobModal job={selectedJobForApply} />}
      </Dialog>

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
                <div className="h-14 border-b border-border/40 bg-background/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 shrink-0 z-40 sticky top-0">
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
