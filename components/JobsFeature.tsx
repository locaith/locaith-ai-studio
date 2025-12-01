import React, { useState } from 'react';
import { 
  Search, Plus, Star, FileText, DollarSign, Clock, Shield, MapPin, 
  CheckCircle, Users, Calendar, Building2, MessageSquare, Send, Zap, Briefcase 
} from "lucide-react";
import { Button } from "../src/components/ui/button";
import { Input } from "../src/components/ui/input";
import { Label } from "../src/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../src/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../src/components/ui/select";
import { ScrollArea } from "../src/components/ui/scroll-area";
import { Textarea } from "../src/components/ui/textarea";
import { Badge } from "../src/components/ui/badge";
import { toast } from "../src/hooks/use-toast";
import { useIsMobile } from "../src/hooks/useIsMobile";

interface Comment {
  id: number;
  user: string;
  content: string;
  date: string;
  rating: number;
}

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  budget: string;
  type: string;
  category: string;
  duration: string;
  posted: string;
  applicants: number;
  rating: number;
  totalRatings: number;
  featured: boolean;
  byLocaith: boolean;
  description: string;
  requirements: string[];
  deposit: string;
  successCriteria: string;
  credits: number;
  comments: Comment[];
  icon: string;
}

export const JobsFeature = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Nổi bật");
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [newComment, setNewComment] = useState("");
  const [userRating, setUserRating] = useState(0);
  
  const categories = [{
    id: "featured",
    label: "Nổi bật"
  }, {
    id: "tech",
    label: "Công nghệ"
  }, {
    id: "design",
    label: "Thiết kế"
  }, {
    id: "marketing",
    label: "Marketing"
  }, {
    id: "media",
    label: "Media"
  }, {
    id: "content",
    label: "Viết lách"
  }, {
    id: "service",
    label: "Dịch vụ"
  }, {
    id: "consulting",
    label: "Tư vấn"
  }];

  const jobs: Job[] = [{
    id: 1,
    title: "Thiết kế logo và bộ nhận diện thương hiệu",
    company: "Startup Coffee House",
    location: "Hà Nội",
    budget: "5-10 triệu",
    type: "Freelance",
    category: "Thiết kế",
    duration: "2 tuần",
    posted: "2 ngày trước",
    applicants: 15,
    rating: 4.8,
    totalRatings: 127,
    featured: true,
    byLocaith: false,
    description: "Cần thiết kế logo độc đáo và bộ nhận diện thương hiệu hoàn chỉnh cho chuỗi cà phê mới. Yêu cầu phong cách minimalist, hiện đại và dễ nhận diện.",
    requirements: ["Adobe Illustrator", "Brand Identity", "Minimalist Design"],
    deposit: "30%",
    successCriteria: "Logo được duyệt qua 3 vòng revision, bàn giao đầy đủ file gốc và guideline",
    credits: 50,
    comments: [{
      id: 1,
      user: "Minh Anh",
      content: "Công việc rõ ràng, feedback nhanh",
      date: "1 ngày trước",
      rating: 5
    }, {
      id: 2,
      user: "Hoàng Long",
      content: "Khách hàng dễ tính, thanh toán đúng hạn",
      date: "3 ngày trước",
      rating: 4
    }],
    icon: "🎨"
  }, {
    id: 2,
    title: "Phát triển website thương mại điện tử",
    company: "Fashion Store Vietnam",
    location: "TP. Hồ Chí Minh",
    budget: "30-50 triệu",
    type: "Dự án",
    category: "Công nghệ",
    duration: "2 tháng",
    posted: "1 ngày trước",
    applicants: 28,
    rating: 4.9,
    totalRatings: 256,
    featured: true,
    byLocaith: true,
    description: "Xây dựng website bán hàng thời trang với giỏ hàng, thanh toán online và quản lý kho. Hỗ trợ đa ngôn ngữ và responsive design.",
    requirements: ["React", "Node.js", "Payment Integration", "MongoDB"],
    deposit: "40%",
    successCriteria: "Website hoạt động ổn định, pass UAT, đáp ứng đủ chức năng trong SOW",
    credits: 200,
    comments: [{
      id: 1,
      user: "Tech Lead",
      content: "Dự án lớn nhưng được hỗ trợ tốt từ team",
      date: "2 ngày trước",
      rating: 5
    }],
    icon: "💻"
  }, {
    id: 3,
    title: "Viết content marketing cho 20 bài blog",
    company: "Digital Marketing Agency",
    location: "Remote",
    budget: "8-12 triệu",
    type: "Remote",
    category: "Viết lách",
    duration: "1 tháng",
    posted: "3 giờ trước",
    applicants: 42,
    rating: 4.7,
    totalRatings: 189,
    featured: true,
    byLocaith: false,
    description: "Cần content writer có kinh nghiệm viết bài SEO về lĩnh vực du lịch và ẩm thực. Mỗi bài từ 1500-2000 từ.",
    requirements: ["SEO Writing", "Content Strategy", "WordPress"],
    deposit: "20%",
    successCriteria: "Bài viết đạt chuẩn SEO, không đạo văn, được duyệt bởi editor",
    credits: 80,
    comments: [{
      id: 1,
      user: "Writer Pro",
      content: "Công việc linh hoạt, có thể làm remote",
      date: "1 tuần trước",
      rating: 5
    }, {
      id: 2,
      user: "Content Creator",
      content: "Deadline hợp lý, yêu cầu rõ ràng",
      date: "2 tuần trước",
      rating: 4
    }],
    icon: "✍️"
  }, {
    id: 4,
    title: "Quay dựng video giới thiệu sản phẩm",
    company: "Tech Gadget Store",
    location: "Đà Nẵng",
    budget: "10-15 triệu",
    type: "Freelance",
    category: "Media",
    duration: "1 tuần",
    posted: "5 ngày trước",
    applicants: 19,
    rating: 4.6,
    totalRatings: 95,
    featured: false,
    byLocaith: false,
    description: "Sản xuất video quảng cáo sản phẩm công nghệ, thời lượng 2-3 phút. Cần có kịch bản sáng tạo và hình ảnh bắt mắt.",
    requirements: ["Video Editing", "After Effects", "Cinematography"],
    deposit: "25%",
    successCriteria: "Video đạt chất lượng 4K, được duyệt sau 2 vòng revision",
    credits: 100,
    comments: [{
      id: 1,
      user: "Videographer",
      content: "Khách hàng cho phép sáng tạo tự do",
      date: "3 ngày trước",
      rating: 5
    }],
    icon: "🎬"
  }, {
    id: 5,
    title: "Tư vấn chiến lược social media",
    company: "Beauty & Cosmetics",
    location: "Hà Nội",
    budget: "15-20 triệu",
    type: "Part-time",
    category: "Marketing",
    duration: "3 tháng",
    posted: "1 tuần trước",
    applicants: 23,
    rating: 4.8,
    totalRatings: 142,
    featured: false,
    byLocaith: true,
    description: "Xây dựng và triển khai chiến lược marketing trên Facebook, Instagram, TikTok cho thương hiệu mỹ phẩm.",
    requirements: ["Social Media Strategy", "Analytics", "Ads Management"],
    deposit: "30%",
    successCriteria: "Tăng follower 50%, engagement rate trên 5%",
    credits: 150,
    comments: [{
      id: 1,
      user: "Marketing Expert",
      content: "Dự án dài hạn, có tiềm năng mở rộng",
      date: "5 ngày trước",
      rating: 4
    }],
    icon: "📱"
  }, {
    id: 6,
    title: "Phát triển ứng dụng mobile đặt xe",
    company: "Transport Solutions",
    location: "TP. Hồ Chí Minh",
    budget: "80-120 triệu",
    type: "Dự án",
    category: "Công nghệ",
    duration: "4 tháng",
    posted: "4 ngày trước",
    applicants: 31,
    rating: 4.9,
    totalRatings: 312,
    featured: true,
    byLocaith: true,
    description: "Xây dựng app đặt xe tương tự Grab với tính năng real-time tracking, thanh toán đa dạng.",
    requirements: ["React Native", "Firebase", "Google Maps API", "Payment Gateway"],
    deposit: "50%",
    successCriteria: "App hoạt động ổn định trên iOS và Android, pass stress test",
    credits: 500,
    comments: [{
      id: 1,
      user: "Senior Dev",
      content: "Dự án lớn, team support chuyên nghiệp",
      date: "2 ngày trước",
      rating: 5
    }, {
      id: 2,
      user: "Mobile Dev",
      content: "Budget hợp lý cho scope công việc",
      date: "1 tuần trước",
      rating: 5
    }],
    icon: "🚗"
  }, {
    id: 7,
    title: "Thiết kế nội thất văn phòng",
    company: "Co-working Space HN",
    location: "Hà Nội",
    budget: "20-30 triệu",
    type: "Freelance",
    category: "Thiết kế",
    duration: "3 tuần",
    posted: "2 ngày trước",
    applicants: 12,
    rating: 4.5,
    totalRatings: 78,
    featured: false,
    byLocaith: false,
    description: "Thiết kế không gian làm việc chung hiện đại, sáng tạo cho 50 người. Yêu cầu phong cách Scandinavian.",
    requirements: ["Interior Design", "3D Rendering", "AutoCAD", "Space Planning"],
    deposit: "35%",
    successCriteria: "Thiết kế được duyệt, bàn giao bản vẽ kỹ thuật đầy đủ",
    credits: 120,
    comments: [{
      id: 1,
      user: "Interior Designer",
      content: "Khách hàng có vision rõ ràng",
      date: "4 ngày trước",
      rating: 4
    }],
    icon: "🏢"
  }, {
    id: 8,
    title: "Dịch thuật tài liệu Anh - Việt",
    company: "Legal Consulting Firm",
    location: "Remote",
    budget: "5-8 triệu",
    type: "Remote",
    category: "Dịch vụ",
    duration: "1 tuần",
    posted: "1 ngày trước",
    applicants: 37,
    rating: 4.7,
    totalRatings: 165,
    featured: false,
    byLocaith: false,
    description: "Dịch 50 trang tài liệu pháp lý từ tiếng Anh sang tiếng Việt. Yêu cầu độ chính xác cao.",
    requirements: ["Legal Translation", "English-Vietnamese", "Proofreading"],
    deposit: "20%",
    successCriteria: "Bản dịch chính xác 100%, được native speaker review",
    credits: 60,
    comments: [{
      id: 1,
      user: "Translator",
      content: "Tài liệu chuyên ngành nhưng được hỗ trợ glossary",
      date: "2 ngày trước",
      rating: 4
    }],
    icon: "📄"
  }, {
    id: 9,
    title: "Tư vấn pháp lý startup",
    company: "Locaith Legal",
    location: "Online",
    budget: "10-15 triệu",
    type: "Tư vấn",
    category: "Tư vấn",
    duration: "Theo yêu cầu",
    posted: "Hôm nay",
    applicants: 8,
    rating: 5.0,
    totalRatings: 89,
    featured: true,
    byLocaith: true,
    description: "Dịch vụ tư vấn pháp lý toàn diện cho startup: đăng ký kinh doanh, hợp đồng, sở hữu trí tuệ.",
    requirements: ["Luật doanh nghiệp", "Luật SHTT", "Soạn thảo hợp đồng"],
    deposit: "50%",
    successCriteria: "Tư vấn đầy đủ các vấn đề pháp lý, cung cấp template hợp đồng",
    credits: 100,
    comments: [{
      id: 1,
      user: "Startup Founder",
      content: "Tư vấn chi tiết, giải đáp mọi thắc mắc",
      date: "1 ngày trước",
      rating: 5
    }],
    icon: "⚖️"
  }];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || job.company.toLowerCase().includes(searchQuery.toLowerCase()) || job.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "Nổi bật" || job.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredJobs = filteredJobs.filter(job => job.featured);
  const trendingJobs = [...filteredJobs].sort((a, b) => b.totalRatings - a.totalRatings).slice(0, 6);
  const byLocaithJobs = filteredJobs.filter(job => job.byLocaith);

  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star 
            key={star} 
            className={`h-4 w-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"} ${interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""}`} 
            onClick={() => interactive && setUserRating(star)} 
          />
        ))}
      </div>
    );
  };

  const handleSubmitComment = () => {
    if (newComment.trim() && userRating > 0) {
      toast({
        title: "Đã gửi đánh giá!",
        description: "Cảm ơn bạn đã chia sẻ trải nghiệm."
      });
      setNewComment("");
      setUserRating(0);
    }
  };

  const handleSubmitJob = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Yêu cầu đã được gửi!",
      description: "Chúng tôi sẽ xem xét và phản hồi trong vòng 24 giờ."
    });
    setIsPostJobOpen(false);
  };

  const isMobile = useIsMobile();

  return (
    <div className="h-full w-full bg-background flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        {/* Mobile Custom Header */}
        {isMobile && (
          <header className="sticky top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border safe-area-top">
            <div className="flex items-center gap-2 h-14 px-3">
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <Search className="h-4 w-4" />
              </Button>
              <Input 
                placeholder="Tìm việc làm..." 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                className="h-8 text-sm flex-1 bg-muted/50" 
              />
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <FileText className="h-4 w-4" />
              </Button>
              <Dialog open={isPostJobOpen} onOpenChange={setIsPostJobOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="shrink-0 text-xs px-2 h-8">
                    <Plus className="h-3 w-3 mr-1" />
                    Đăng 
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </header>
        )}

        <div className={`container mx-auto px-6 py-8 max-w-6xl ${isMobile ? 'pt-4 px-2' : ''}`}>
          {/* Desktop Header */}
          {!isMobile && (
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-xl font-semibold text-foreground">Sàn Việc Làm</h1>
              <div className="flex items-center gap-3">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  Việc của tôi
                </Button>
                <Dialog open={isPostJobOpen} onOpenChange={setIsPostJobOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Đăng việc
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh]">
                    <DialogHeader>
                      <DialogTitle className="text-2xl">Đăng tin tuyển dụng</DialogTitle>
                      <DialogDescription>
                        Điền thông tin chi tiết để đăng tin. Chúng tôi sẽ xem xét và duyệt trong vòng 24 giờ.
                      </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh] pr-4">
                      <form onSubmit={handleSubmitJob} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="jobTitle">Tiêu đề công việc *</Label>
                          <Input id="jobTitle" placeholder="VD: Lập trình viên React Senior" required />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="company">Công ty *</Label>
                            <Input id="company" placeholder="Tên công ty" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="location">Địa điểm *</Label>
                            <Select required>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn địa điểm" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hanoi">Hà Nội</SelectItem>
                                <SelectItem value="hcm">TP. Hồ Chí Minh</SelectItem>
                                <SelectItem value="danang">Đà Nẵng</SelectItem>
                                <SelectItem value="remote">Remote</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="category">Lĩnh vực *</Label>
                            <Select required>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn lĩnh vực" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="tech">Công nghệ</SelectItem>
                                <SelectItem value="design">Thiết kế</SelectItem>
                                <SelectItem value="marketing">Marketing</SelectItem>
                                <SelectItem value="media">Media</SelectItem>
                                <SelectItem value="content">Viết lách</SelectItem>
                                <SelectItem value="service">Dịch vụ</SelectItem>
                                <SelectItem value="consulting">Tư vấn</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="jobType">Loại hình *</Label>
                            <Select required>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn loại hình" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="freelance">Freelance</SelectItem>
                                <SelectItem value="project">Dự án</SelectItem>
                                <SelectItem value="parttime">Part-time</SelectItem>
                                <SelectItem value="remote">Remote</SelectItem>
                                <SelectItem value="consulting">Tư vấn</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="budget">Ngân sách (VNĐ) *</Label>
                            <Input id="budget" placeholder="VD: 10-20 triệu" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="duration">Thời gian *</Label>
                            <Input id="duration" placeholder="VD: 2 tháng" required />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="deposit">Đặt cọc (%)</Label>
                            <Input id="deposit" placeholder="VD: 30%" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="credits">Credits yêu cầu</Label>
                            <Input id="credits" type="number" placeholder="VD: 100" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description">Mô tả công việc *</Label>
                          <Textarea id="description" placeholder="Mô tả chi tiết về công việc, yêu cầu, quyền lợi..." rows={4} required />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="successCriteria">Tiêu chí đánh giá thành công *</Label>
                          <Textarea id="successCriteria" placeholder="Mô tả cách đánh giá công việc hoàn thành..." rows={3} required />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="requirements">Yêu cầu kỹ năng</Label>
                          <Input id="requirements" placeholder="VD: React, TypeScript, Tailwind CSS (phân cách bằng dấu phẩy)" />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="contact">Thông tin liên hệ *</Label>
                          <Input id="contact" type="email" placeholder="Email hoặc số điện thoại" required />
                        </div>

                        <div className="flex justify-end pt-4">
                          <Button type="submit">Gửi yêu cầu</Button>
                        </div>
                      </form>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}

          {/* Hero Section - Desktop Only */}
          {!isMobile && (
            <div className="text-center mb-10">
              <h2 className="text-5xl font-bold text-foreground mb-4">Việc Làm</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Tìm kiếm và đăng tin việc làm phù hợp với nhu cầu của bạn.
                <br />
                Kết nối người giao việc và người nhận việc một cách hiệu quả.
              </p>

              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Tìm kiếm việc làm..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-12 h-14 text-base bg-muted/50 border-border rounded-xl" />
              </div>
            </div>
          )}

          {/* Category Tabs - Desktop Only */}
          {!isMobile && (
            <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
              {categories.map(category => (
                <button 
                  key={category.id} 
                  onClick={() => setActiveCategory(category.label)} 
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeCategory === category.label ? "text-foreground border-b-2 border-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          )}

          {/* Featured Section */}
          {featuredJobs.length > 0 && (
            <section className="mb-8 md:mb-12">
              <div className="mb-3 md:mb-6">
                <h3 className="text-lg md:text-2xl font-bold text-foreground">Nổi bật</h3>
                <p className="text-xs md:text-base text-muted-foreground">Những việc làm được tuyển chọn trong tuần</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                {featuredJobs.slice(0, 4).map(job => (
                  <div key={job.id} onClick={() => setSelectedJob(job)} className="p-3 md:p-5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer border border-border/50">
                    <div className="flex items-start gap-3 md:gap-4">
                      <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-lg md:text-2xl shrink-0">
                        {job.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground mb-1 truncate text-sm md:text-base">{job.title}</h4>
                        <div className="flex items-center gap-1 text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">
                          <span>{job.rating}</span>
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>•</span>
                          <span className="text-green-500 font-medium">{job.budget}</span>
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                        <p className="text-[10px] md:text-xs text-muted-foreground mt-1 md:mt-2">By {job.company}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-2 md:mt-4 text-sm text-muted-foreground hover:text-foreground h-8 md:h-10">
                Xem thêm
              </Button>
            </section>
          )}

          {/* Trending Section */}
          <section className="mb-8 md:mb-12">
            <div className="mb-3 md:mb-6">
              <h3 className="text-lg md:text-2xl font-bold text-foreground">Trending</h3>
              <p className="text-xs md:text-base text-muted-foreground">Việc làm phổ biến nhất từ cộng đồng</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
              {trendingJobs.map((job, index) => (
                <div key={job.id} onClick={() => setSelectedJob(job)} className="flex items-center md:items-start gap-3 md:gap-4 p-2 md:p-4 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer border border-transparent hover:border-border/50">
                  <span className="text-base md:text-lg font-bold text-muted-foreground w-4 md:w-6 text-center">{index + 1}</span>
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-lg md:text-xl shrink-0">
                    {job.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground mb-0.5 md:mb-1 truncate text-sm md:text-base">{job.title}</h4>
                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-1 md:line-clamp-2">{job.description}</p>
                    <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">By {job.company}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-2 md:mt-4 text-sm text-muted-foreground hover:text-foreground h-8 md:h-10">
              Xem thêm
            </Button>
          </section>

          {/* By Locaith Section */}
          {byLocaithJobs.length > 0 && (
            <section className="mb-8 md:mb-12">
              <div className="mb-3 md:mb-6">
                <h3 className="text-lg md:text-2xl font-bold text-foreground">By Locaith</h3>
                <p className="text-xs md:text-base text-muted-foreground">Việc làm được xác minh bởi Locaith</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
                {byLocaithJobs.map(job => (
                  <div key={job.id} onClick={() => setSelectedJob(job)} className="flex items-center md:items-start gap-3 md:gap-4 p-2 md:p-4 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer border border-transparent hover:border-border/50">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-lg md:text-xl shrink-0">
                      {job.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 md:gap-2 mb-0.5 md:mb-1">
                        <h4 className="font-semibold text-foreground truncate text-sm md:text-base">{job.title}</h4>
                        <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-primary shrink-0" />
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground line-clamp-1 md:line-clamp-2">{job.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* No Results */}
          {filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <Briefcase className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Không tìm thấy công việc phù hợp</h3>
              <p className="text-muted-foreground">Thử tìm kiếm với từ khóa khác</p>
            </div>
          )}
        </div>
      </div>

      {/* Job Detail Dialog */}
      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          {selectedJob && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-3xl">
                    {selectedJob.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <DialogTitle className="text-xl">{selectedJob.title}</DialogTitle>
                      {selectedJob.byLocaith && <CheckCircle className="h-5 w-5 text-primary" />}
                    </div>
                    <DialogDescription className="text-sm mt-1">
                      By {selectedJob.company}
                    </DialogDescription>
                    <div className="flex items-center gap-2 mt-2">
                      {renderStars(Math.floor(selectedJob.rating))}
                      <span className="text-sm text-muted-foreground">
                        {selectedJob.rating} ({selectedJob.totalRatings} đánh giá)
                      </span>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <ScrollArea className="max-h-[55vh] pr-4">
                <div className="space-y-6">
                  {/* Description */}
                  <p className="text-muted-foreground">{selectedJob.description}</p>

                  {/* Key Info Grid */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Ngân sách</p>
                        <p className="font-semibold text-green-500">{selectedJob.budget}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Thời gian</p>
                        <p className="font-semibold">{selectedJob.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Đặt cọc</p>
                        <p className="font-semibold">{selectedJob.deposit}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Địa điểm</p>
                        <p className="font-semibold">{selectedJob.location}</p>
                      </div>
                    </div>
                  </div>

                  {/* Success Criteria */}
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Tiêu chí đánh giá thành công
                    </h4>
                    <p className="text-sm text-muted-foreground">{selectedJob.successCriteria}</p>
                  </div>

                  {/* Requirements */}
                  <div>
                    <h4 className="font-semibold mb-2">Yêu cầu kỹ năng</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.requirements.map(req => (
                        <Badge key={req} variant="secondary" className="px-3 py-1">
                          {req}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{selectedJob.applicants} ứng viên</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{selectedJob.posted}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      <span>{selectedJob.type}</span>
                    </div>
                  </div>

                  {/* Comments Section */}
                  <div className="border-t pt-6">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Đánh giá từ cộng đồng ({selectedJob.comments.length})
                    </h4>
                    <div className="space-y-4 mb-6">
                      {selectedJob.comments.map(comment => (
                        <div key={comment.id} className="p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{comment.user}</span>
                            <div className="flex items-center gap-2">
                              {renderStars(comment.rating)}
                              <span className="text-xs text-muted-foreground">{comment.date}</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{comment.content}</p>
                        </div>
                      ))}
                    </div>

                    {/* Add Comment */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Đánh giá của bạn:</span>
                        {renderStars(userRating, true)}
                      </div>
                      <div className="flex gap-2">
                        <Input placeholder="Viết đánh giá..." value={newComment} onChange={e => setNewComment(e.target.value)} className="flex-1" />
                        <Button size="icon" onClick={handleSubmitComment}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <DialogFooter>
                <Button className="w-full gap-2" size="lg">
                  <Zap className="h-4 w-4" />
                  Ứng tuyển ngay • {selectedJob.credits} credits
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
