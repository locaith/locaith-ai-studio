import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layout, Search, Filter, Briefcase, Clock, Calendar, 
  MoreHorizontal, MessageSquare, CheckCircle2, AlertCircle, 
  ArrowUpRight, ArrowDownLeft, FileText, ChevronRight, 
  Upload, User, Shield, Star, Bell, Plus, Edit2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Mock Data Types
type ProjectStatus = 'pending' | 'in_progress' | 'reviewing' | 'completed' | 'cancelled';

interface Project {
  id: string;
  title: string;
  type: string;
  partner: {
    name: string;
    avatar: string;
    role: string; // 'Freelancer' or 'Client'
    isVerified: boolean;
  };
  budget: number;
  startDate: string;
  deadline: string;
  status: ProjectStatus;
  progress: number;
  lastUpdate: string;
  description: string;
  tasks: { id: string; title: string; completed: boolean }[];
}

const mockPostedProjects: Project[] = [
  {
    id: "P001",
    title: "Thiết kế UI/UX cho App Thương mại điện tử",
    type: "Thiết kế & Sáng tạo",
    partner: {
      name: "Nguyễn Văn B",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=B",
      role: "Freelancer",
      isVerified: true
    },
    budget: 25000000,
    startDate: "2024-05-10",
    deadline: "2024-06-10",
    status: "in_progress",
    progress: 65,
    lastUpdate: "2 giờ trước",
    description: "Thiết kế trọn bộ giao diện App Mobile (iOS/Android) cho sàn TMĐT thời trang.",
    tasks: [
      { id: "t1", title: "Nghiên cứu & Wireframe", completed: true },
      { id: "t2", title: "UI Design - Màn hình chính", completed: true },
      { id: "t3", title: "UI Design - Checkout & Profile", completed: false },
      { id: "t4", title: "Prototyping & Handover", completed: false },
    ]
  },
  {
    id: "P002",
    title: "Viết bài chuẩn SEO mảng Công nghệ",
    type: "Viết lách & Dịch thuật",
    partner: {
      name: "Trần Thị C",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=C",
      role: "Freelancer",
      isVerified: false
    },
    budget: 5000000,
    startDate: "2024-05-15",
    deadline: "2024-05-25",
    status: "reviewing",
    progress: 90,
    lastUpdate: "30 phút trước",
    description: "Viết 10 bài blog chuẩn SEO về xu hướng AI năm 2024.",
    tasks: [
      { id: "t1", title: "Lên outline", completed: true },
      { id: "t2", title: "Viết nháp 10 bài", completed: true },
      { id: "t3", title: "Chỉnh sửa theo feedback", completed: false },
    ]
  }
];

const mockReceivedProjects: Project[] = [
  {
    id: "P003",
    title: "Phát triển Landing Page ReactJS",
    type: "Lập trình & IT",
    partner: {
      name: "TechStart Corp",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tech",
      role: "Client",
      isVerified: true
    },
    budget: 12000000,
    startDate: "2024-05-12",
    deadline: "2024-05-20",
    status: "in_progress",
    progress: 40,
    lastUpdate: "1 ngày trước",
    description: "Code Landing Page giới thiệu sản phẩm từ thiết kế Figma có sẵn, yêu cầu Responsive và Animation nhẹ.",
    tasks: [
      { id: "t1", title: "Setup Project & UI Base", completed: true },
      { id: "t2", title: "Responsive & Mobile", completed: false },
      { id: "t3", title: "Animation & Optimization", completed: false },
    ]
  },
  {
    id: "P004",
    title: "Logo Design cho Brand Coffee",
    type: "Thiết kế & Sáng tạo",
    partner: {
      name: "Coffee House",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Coffee",
      role: "Client",
      isVerified: true
    },
    budget: 3000000,
    startDate: "2024-05-01",
    deadline: "2024-05-05",
    status: "completed",
    progress: 100,
    lastUpdate: "1 tuần trước",
    description: "Thiết kế Logo Minimalist cho quán cà phê phong cách Hàn Quốc.",
    tasks: [
      { id: "t1", title: "Concept Sketch", completed: true },
      { id: "t2", title: "Vectorize & Color", completed: true },
      { id: "t3", title: "Final Deliverables", completed: true },
    ]
  }
];

const getStatusBadge = (status: ProjectStatus) => {
  switch (status) {
    case 'pending': return <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">Chờ bắt đầu</Badge>;
    case 'in_progress': return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Đang thực hiện</Badge>;
    case 'reviewing': return <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">Chờ duyệt</Badge>;
    case 'completed': return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Hoàn thành</Badge>;
    case 'cancelled': return <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">Đã hủy</Badge>;
    default: return <Badge variant="outline">Không xác định</Badge>;
  }
};

const ProjectCard = ({ project, isOwner }: { project: Project, isOwner: boolean }) => {
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [progressValue, setProgressValue] = useState([project.progress]);
  const [updateNote, setUpdateNote] = useState("");

  const handleUpdate = () => {
    toast.success("Đã cập nhật tiến độ dự án thành công!");
    setUpdateDialogOpen(false);
    // In a real app, this would call an API
  };

  return (
    <Card className="hover:shadow-md transition-all border-l-4 border-l-transparent hover:border-l-primary group">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              {getStatusBadge(project.status)}
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> Cập nhật {project.lastUpdate}
              </span>
            </div>
            <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors cursor-pointer">
              {project.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5" /> {project.type}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="font-bold text-lg text-green-600 dark:text-green-400">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(project.budget)}
            </div>
            <div className="text-xs text-muted-foreground">Ngân sách</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 border">
                <AvatarImage src={project.partner.avatar} />
                <AvatarFallback>{project.partner.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium flex items-center gap-1">
                  {project.partner.name}
                  {project.partner.isVerified && <Shield className="w-3 h-3 text-blue-500 fill-blue-500/20" />}
                </div>
                <div className="text-xs text-muted-foreground">{project.partner.role}</div>
              </div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <div>Deadline</div>
              <div className="font-medium text-foreground flex items-center gap-1 justify-end">
                <Calendar className="w-3 h-3" /> {project.deadline}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span>Tiến độ</span>
              <span>{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {project.tasks.slice(0, 2).map(task => (
              <div key={task.id} className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/30 p-2 rounded-md">
                <div className={cn("w-2 h-2 rounded-full", task.completed ? "bg-green-500" : "bg-slate-300")} />
                <span className={task.completed ? "line-through opacity-70" : ""}>{task.title}</span>
              </div>
            ))}
            {project.tasks.length > 2 && (
              <div className="flex items-center justify-center text-xs text-muted-foreground bg-secondary/30 p-2 rounded-md">
                +{project.tasks.length - 2} việc khác
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-3 border-t bg-secondary/10 flex justify-between gap-3">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            Chat
          </Button>
          <Button variant="ghost" size="sm" className="h-8 gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            Chi tiết
          </Button>
        </div>
        
        {isOwner ? (
          // Actions for Client (Job Poster)
          <div className="flex gap-2">
             <Button variant="outline" size="sm" className="h-8 gap-1.5 border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700">
                <Bell className="w-3.5 h-3.5" />
                Nhắc nhở
             </Button>
             <Button variant="outline" size="sm" className="h-8 gap-1.5">
                <Edit2 className="w-3.5 h-3.5" />
                Sửa
             </Button>
             {project.status === 'reviewing' && (
                <Button size="sm" className="h-8 gap-1.5 bg-green-600 hover:bg-green-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Duyệt & Thanh toán
                </Button>
             )}
          </div>
        ) : (
          // Actions for Freelancer (Job Receiver)
          <div className="flex gap-2">
            {project.status !== 'completed' && project.status !== 'cancelled' && (
              <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-8 gap-1.5 bg-blue-600 hover:bg-blue-700">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    Cập nhật tiến độ
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cập nhật tiến độ dự án</DialogTitle>
                    <DialogDescription>
                      {project.title}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Tiến độ hoàn thành ({progressValue}%)</Label>
                      <Slider 
                        value={progressValue} 
                        onValueChange={setProgressValue} 
                        max={100} 
                        step={5} 
                        className="py-4"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Ghi chú cập nhật</Label>
                      <Textarea 
                        placeholder="Mô tả những công việc bạn đã hoàn thành..." 
                        value={updateNote}
                        onChange={(e) => setUpdateNote(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Đính kèm tệp (nếu có)</Label>
                      <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-muted-foreground hover:bg-secondary/50 cursor-pointer transition-colors">
                        <Upload className="h-8 w-8 mb-2 opacity-50" />
                        <span className="text-xs">Kéo thả hoặc click để tải lên</span>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>Hủy</Button>
                    <Button onClick={handleUpdate}>Gửi cập nhật</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export const MyJobsFeature = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("received");

  return (
    <div className="h-full w-full bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b h-14 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
             <ArrowDownLeft className="h-5 w-5 rotate-45" />
          </Button>
          <h1 className="text-lg font-semibold">Việc làm & Ứng tuyển</h1>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" className="hidden md:flex gap-1.5">
              <Filter className="h-4 w-4" /> Lọc
           </Button>
           <Button size="sm" className="gap-1.5" onClick={() => navigate('/jobs')}>
              <Plus className="h-4 w-4" /> Đăng việc mới
           </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-5xl mx-auto w-full">
        <Tabs defaultValue="received" value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <TabsList className="grid w-full md:w-[400px] grid-cols-2">
              <TabsTrigger value="received">Việc đã nhận (Freelancer)</TabsTrigger>
              <TabsTrigger value="posted">Việc đã giao (Client)</TabsTrigger>
            </TabsList>
            
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Tìm kiếm dự án..." className="pl-9 h-9" />
            </div>
          </div>

          <TabsContent value="received" className="space-y-4">
             {mockReceivedProjects.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {mockReceivedProjects.map(project => (
                    <ProjectCard key={project.id} project={project} isOwner={false} />
                  ))}
                </div>
             ) : (
                <div className="text-center py-12">
                   <div className="bg-secondary/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Briefcase className="h-8 w-8 text-muted-foreground" />
                   </div>
                   <h3 className="font-medium text-lg mb-2">Chưa có dự án nào</h3>
                   <p className="text-muted-foreground text-sm mb-6">Bạn chưa nhận dự án nào trên sàn việc làm.</p>
                   <Button onClick={() => navigate('/jobs')}>Tìm việc ngay</Button>
                </div>
             )}
          </TabsContent>

          <TabsContent value="posted" className="space-y-4">
            {mockPostedProjects.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {mockPostedProjects.map(project => (
                    <ProjectCard key={project.id} project={project} isOwner={true} />
                  ))}
                </div>
             ) : (
                <div className="text-center py-12">
                   <div className="bg-secondary/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Layout className="h-8 w-8 text-muted-foreground" />
                   </div>
                   <h3 className="font-medium text-lg mb-2">Chưa đăng dự án nào</h3>
                   <p className="text-muted-foreground text-sm mb-6">Bạn chưa đăng tin tuyển dụng hoặc dự án nào.</p>
                   <Button onClick={() => navigate('/jobs')}>Đăng tin ngay</Button>
                </div>
             )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
