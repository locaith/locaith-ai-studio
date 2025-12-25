import React, { useState } from 'react';
import { 
    User, Briefcase, DollarSign, FileText, CheckCircle2, 
    Upload, Linkedin, Globe, Award, ShieldCheck, ChevronRight,
    ArrowLeft
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useNavigate } from 'react-router-dom';

const expertCategories = [
    { id: "dev", label: "Lập trình & IT" },
    { id: "ai", label: "Chuyên gia AI" },
    { id: "design", label: "Thiết kế & Sáng tạo" },
    { id: "marketing", label: "Marketing & SEO" },
    { id: "finance", label: "Tài chính & Đầu tư" },
    { id: "legal", label: "Pháp lý" },
    { id: "education", label: "Giáo dục & Đào tạo" },
];

export const RegisterFreelancerFeature = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoading(false);
        toast.success("Đăng ký thành công! Hồ sơ của bạn đang được xét duyệt.", {
            description: "Chúng tôi sẽ liên hệ lại trong vòng 24h làm việc."
        });
        setStep(1); // Reset step
        navigate('/jobs'); // Redirect back to jobs or home
    };

    return (
        <div className="h-full w-full bg-background flex flex-col md:flex-row overflow-hidden">
            
            {/* Sidebar - Value Proposition */}
            <div className="hidden md:flex w-80 bg-slate-900 text-white p-8 flex-col justify-between relative overflow-hidden shrink-0">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 z-0" />
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl z-0" />
                
                <div className="relative z-10 space-y-6">
                    <Button variant="ghost" className="text-white/70 hover:text-white pl-0 gap-2" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-4 h-4" /> Quay lại
                    </Button>

                    <div className="flex items-center gap-3 text-blue-400 mt-4">
                        <ShieldCheck className="w-8 h-8" />
                        <span className="font-bold text-lg tracking-wide">Locaith Expert</span>
                    </div>
                    
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold leading-tight">Nâng tầm sự nghiệp của bạn</h3>
                        <p className="text-slate-400 text-sm">Gia nhập cộng đồng chuyên gia hàng đầu và kết nối với hàng ngàn doanh nghiệp.</p>
                    </div>

                    <div className="space-y-4 pt-4">
                        {[
                            "Tiếp cận dự án chất lượng cao",
                            "Đảm bảo thanh toán an toàn",
                            "Xây dựng thương hiệu cá nhân",
                            "Cộng đồng hỗ trợ chuyên nghiệp"
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                <span className="text-sm font-medium text-slate-200">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 pt-8 border-t border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-3">
                            {[1,2,3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                                    {i}
                                </div>
                            ))}
                        </div>
                        <div className="text-xs text-slate-400">
                            <strong className="text-white block">500+ Chuyên gia</strong>
                            đã tham gia tháng này
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-background relative">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center gap-2 p-4 border-b bg-background">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <span className="font-bold text-lg">Đăng ký chuyên gia</span>
                </div>

                <div className="px-8 py-6 border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-20 hidden md:block">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">Đăng ký hồ sơ Freelancer</h2>
                            <p className="text-muted-foreground mt-1">
                                Hoàn tất hồ sơ để bắt đầu nhận dự án ngay hôm nay
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full">
                            <span className={cn("flex items-center justify-center w-6 h-6 rounded-full text-xs transition-colors", step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>1</span>
                            <span className="hidden sm:inline">Thông tin</span>
                            <ChevronRight className="w-4 h-4" />
                            <span className={cn("flex items-center justify-center w-6 h-6 rounded-full text-xs transition-colors", step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>2</span>
                            <span className="hidden sm:inline">Hồ sơ</span>
                        </div>
                    </div>
                </div>

                <ScrollArea className="flex-1 px-4 md:px-8 py-6">
                    <form id="register-form" onSubmit={handleSubmit} className="space-y-8 pb-32 max-w-4xl mx-auto">
                        
                        {/* Section 1: Personal Info */}
                        <div className="space-y-6 bg-background p-6 rounded-xl border shadow-sm">
                            <div className="flex items-center gap-3 pb-2 border-b border-border/40">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                    <User className="w-5 h-5" />
                                </div>
                                <h3 className="font-semibold text-lg">Thông tin cá nhân</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="fullname" className="text-sm font-medium">Họ và tên <span className="text-red-500">*</span></Label>
                                    <Input id="fullname" placeholder="Nguyễn Văn A" required className="h-10 bg-background" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-sm font-medium">Số điện thoại <span className="text-red-500">*</span></Label>
                                    <Input id="phone" placeholder="0912..." required className="h-10 bg-background" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium">Email liên hệ <span className="text-red-500">*</span></Label>
                                    <Input id="email" type="email" placeholder="contact@example.com" required className="h-10 bg-background" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="linkedin" className="text-sm font-medium flex items-center gap-1">
                                        <Linkedin className="w-3 h-3" /> LinkedIn / Portfolio
                                    </Label>
                                    <Input id="linkedin" placeholder="linkedin.com/in/..." className="h-10 bg-background" />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Professional Profile */}
                        <div className="space-y-6 bg-background p-6 rounded-xl border shadow-sm">
                            <div className="flex items-center gap-3 pb-2 border-b border-border/40">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                                    <Briefcase className="w-5 h-5" />
                                </div>
                                <h3 className="font-semibold text-lg">Hồ sơ chuyên môn</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="role" className="text-sm font-medium">Chức danh hiển thị <span className="text-red-500">*</span></Label>
                                    <Input id="role" placeholder="VD: Senior AI Engineer" required className="h-10 bg-background" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category" className="text-sm font-medium">Lĩnh vực chuyên môn <span className="text-red-500">*</span></Label>
                                    <Select>
                                        <SelectTrigger className="h-10 bg-background">
                                            <SelectValue placeholder="Chọn lĩnh vực" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {expertCategories.map(cat => (
                                                <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="company" className="text-sm font-medium">Công ty hiện tại</Label>
                                    <div className="relative">
                                        <Building2Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input id="company" placeholder="VD: Google, Microsoft..." className="pl-9 h-10 bg-background" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="exp" className="text-sm font-medium">Số năm kinh nghiệm</Label>
                                    <Input id="exp" type="number" min="0" placeholder="5" className="h-10 bg-background" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio" className="text-sm font-medium">Giới thiệu bản thân & Thành tích nổi bật <span className="text-red-500">*</span></Label>
                                <Textarea 
                                    id="bio" 
                                    placeholder="Mô tả kinh nghiệm, dự án đã thực hiện và thế mạnh của bạn..." 
                                    className="min-h-[120px] bg-background resize-none" 
                                    required
                                />
                                <p className="text-xs text-muted-foreground text-right">Tối thiểu 100 ký tự</p>
                            </div>
                        </div>

                        {/* Section 3: Services & Rates */}
                        <div className="space-y-6 bg-background p-6 rounded-xl border shadow-sm">
                            <div className="flex items-center gap-3 pb-2 border-b border-border/40">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                                    <DollarSign className="w-5 h-5" />
                                </div>
                                <h3 className="font-semibold text-lg">Dịch vụ & Chi phí</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="price" className="text-sm font-medium">Mức giá tham khảo (VNĐ/giờ)</Label>
                                    <Input id="price" placeholder="1.000.000" className="h-10 bg-background" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="deposit" className="text-sm font-medium">Yêu cầu đặt cọc (VNĐ)</Label>
                                    <Input id="deposit" placeholder="500.000" className="h-10 bg-background" />
                                </div>
                            </div>
                            
                            <div className="p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 rounded-xl flex gap-3">
                                <Award className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <h4 className="font-medium text-sm text-orange-700 dark:text-orange-400">Chứng nhận & Xác minh</h4>
                                    <p className="text-xs text-orange-600/80 dark:text-orange-400/80">
                                        Để tăng độ uy tín, vui lòng chuẩn bị sẵn CV và các chứng chỉ liên quan. Chúng tôi sẽ yêu cầu bổ sung ở bước xác minh sau.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Terms */}
                        <div className="flex items-start space-x-2 pt-4">
                            <Checkbox id="terms" required />
                            <Label
                                htmlFor="terms"
                                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Tôi đồng ý với <span className="text-primary hover:underline cursor-pointer">Điều khoản dịch vụ</span> và <span className="text-primary hover:underline cursor-pointer">Chính sách bảo mật</span> của Locaith.
                            </Label>
                        </div>

                    </form>
                </ScrollArea>

                <div className="p-6 border-t border-border/50 bg-background/95 backdrop-blur flex justify-end gap-3 absolute bottom-0 w-full z-30">
                    <Button variant="ghost" onClick={() => navigate(-1)} disabled={loading}>Hủy bỏ</Button>
                    <Button 
                        type="submit" 
                        form="register-form" 
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/20"
                        disabled={loading}
                    >
                        {loading ? "Đang xử lý..." : "Gửi hồ sơ đăng ký"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

// Helper component for icon
const Building2Icon = ({ className }: { className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
        <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
        <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
        <path d="M10 6h4" />
        <path d="M10 10h4" />
        <path d="M10 14h4" />
        <path d="M10 18h4" />
    </svg>
);
