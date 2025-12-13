import React from 'react';
import {
  User, Settings, HelpCircle, LogOut, ChevronRight,
  CreditCard, Bell, Shield, Zap, Layout, FileText,
  History, Bookmark, Star, Crown, Briefcase, Copy, CheckCircle2,
  Wallet, ArrowUpRight, ArrowDownLeft, Coins, BadgeCheck, Ticket, Medal, UserPlus, Gem, UserCog,
  Lock, Globe, Trash2, Smartphone, Mail, Camera, Loader2, Upload
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAuth } from "../src/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { supabase } from '../src/lib/supabase';
import { toast } from "sonner";

export const ProfileFeature = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [expertInfo, setExpertInfo] = React.useState<any>(null);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const saved = localStorage.getItem('expertProfileData');
    if (saved) {
      try {
        setExpertInfo(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load expert info", e);
      }
    }
  }, []);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
          if (uploadError.message.includes('Bucket not found')) {
              toast.error('Chưa cấu hình Storage (Bucket not found). Vui lòng liên hệ Admin.');
              setUploading(false);
              return;
          }
          throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile in DB
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      // Update auth metadata (triggers useAuth update)
      const { error: authError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (authError) throw authError;

      toast.success('Cập nhật ảnh đại diện thành công!');
      
      // Force refresh user data or let useAuth handle it
      // Note: useAuth might need a refresh mechanism or it updates automatically on auth state change
      
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error('Lỗi khi cập nhật ảnh đại diện');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Mock data for the profile
  const profileData = {
    name: expertInfo?.name || user?.user_metadata?.full_name || "Người dùng Locaith",
    email: user?.email || "user@locaith.com",
    avatar: user?.user_metadata?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Locaith",
    credits: 1250,
    balance: 5000000,
    plan: "Free",
    projects: 12,
    saved: 45,
    referralCode: user?.id ? user.id.substring(0, 8).toUpperCase() : "LCT-2024",
    isVerified: true, // Quyền truy cập chuyên nghiệp
    isExpert: true // Trạng thái chuyên gia (Đã duyệt)
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You might want to add a toast notification here
  };

  const workspaceItems = [
    { id: 'check', label: "Check thông tin", icon: <Zap className="h-5 w-5 text-purple-500" />, route: '/check', desc: "Kiểm tra uy tín chuyên gia & dự án" },
    { id: 'projects', label: "Dự án của tôi", icon: <Layout className="h-5 w-5 text-blue-500" />, route: '/projects', desc: "Quản lý các dự án đã tạo" },
    { id: 'saved', label: "Đã lưu", icon: <Bookmark className="h-5 w-5 text-orange-500" />, route: '/saved', desc: "Công cụ và nội dung yêu thích" },
    { id: 'history', label: "Lịch sử hoạt động", icon: <History className="h-5 w-5 text-gray-500" />, route: '/history', desc: "Xem lại các hoạt động gần đây" },
    { id: 'jobs', label: "Việc làm & Ứng tuyển", icon: <Briefcase className="h-5 w-5 text-indigo-500" />, route: '/jobs/my-jobs', desc: "Trạng thái hồ sơ ứng tuyển" },
  ];

  const membershipItems = [
    { id: 'member-package', label: "Gói hội viên", icon: <Gem className="h-5 w-5 text-pink-500" />, route: '/membership/packages', desc: "Các gói ưu đãi đặc quyền" },
    { id: 'promo', label: "Mã khuyến mại", icon: <Ticket className="h-5 w-5 text-orange-500" />, route: '/membership/promos', desc: "Voucher và mã giảm giá của bạn" },
    { id: 'tier', label: "Hạng thành viên", icon: <Medal className="h-5 w-5 text-yellow-500" />, route: '/membership/tier', desc: "Quyền lợi theo hạng thành viên" },
    { id: 'referral', label: "Giới thiệu bạn bè", icon: <UserPlus className="h-5 w-5 text-green-500" />, route: '/membership/referral', desc: "Nhận thưởng khi mời bạn bè" },
  ];

  const walletItems = [
    { id: 'payment', label: "Quản lý thanh toán", icon: <CreditCard className="h-5 w-5 text-indigo-500" />, route: '/profile/payment', desc: "Liên kết thẻ, ngân hàng & thuế" },
    { id: 'history', label: "Lịch sử mục mua", icon: <History className="h-5 w-5 text-blue-500" />, route: '/profile/wallet-history', desc: "Lịch sử nạp rút & chi tiêu" },
    { id: 'upgrade', label: "Nâng cấp tài khoản", icon: <Crown className="h-5 w-5 text-yellow-500" />, route: '/profile/upgrade', desc: "Đổi VND sang Credits & Gói cước" },
  ];

  const accountItems = [
    { id: 'subscription', label: "Gói dịch vụ", icon: <Crown className="h-5 w-5 text-yellow-500" />, route: '/subscription', desc: "Nâng cấp và quản lý thanh toán" },
  ];

  return (
    <div className="h-full w-full bg-background pb-32 overflow-y-auto">
      <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*"
          onChange={handleAvatarUpload}
      />
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-[env(safe-area-inset-top)] h-[calc(3.5rem+env(safe-area-inset-top))] px-4 border-b border-border flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Hồ sơ cá nhân</h1>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <Settings className="h-5 w-5" />
        </Button>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-6">
        {/* Compact Profile Header */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="flex items-center gap-4 flex-1">
                <div className="relative group cursor-pointer" onClick={() => !uploading && fileInputRef.current?.click()}>
                    <Avatar className={cn(
                        "h-16 w-16 border-2 border-background ring-2 ring-border/20 transition-opacity",
                        uploading && "opacity-80"
                    )}>
                        <AvatarImage src={profileData.avatar} className={uploading ? "opacity-50" : ""} />
                        <AvatarFallback>LC</AvatarFallback>
                    </Avatar>
                    {uploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/20 rounded-full z-10">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full z-10">
                        <Camera className="h-6 w-6 text-white" />
                    </div>
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="font-bold text-lg text-foreground flex items-center gap-1">
                            {profileData.name}
                            {profileData.isVerified && (
                                <div className="flex items-center gap-1">
                                    <BadgeCheck className="w-5 h-5 text-blue-500 fill-blue-500/10" />
                                    <div className="bg-purple-100 dark:bg-purple-900/30 p-1 rounded-full" title="Tài khoản định danh đã xác minh">
                                        <Shield className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                                    </div>
                                </div>
                            )}
                        </h2>
                        <Badge variant="secondary" className="text-[10px] px-1.5 h-5 font-normal bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                            {profileData.plan}
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{profileData.email}</p>
                </div>
            </div>
            
            <Separator orientation="vertical" className="hidden md:block h-10" />
            <Separator orientation="horizontal" className="md:hidden" />
            
            <div className="flex items-center justify-around md:justify-end gap-6 md:gap-8 px-2">
                <div className="flex flex-col items-center">
                    <span className="font-bold text-lg">{profileData.projects}</span>
                    <span className="text-xs text-muted-foreground">Dự án</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="font-bold text-lg">{profileData.saved}</span>
                    <span className="text-xs text-muted-foreground">Đã lưu</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="font-bold text-lg text-yellow-600 dark:text-yellow-500">{profileData.credits}</span>
                    <span className="text-xs text-muted-foreground">Credits</span>
                </div>
            </div>
        </div>

        {/* Wallet & ID Section - Compact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Wallet Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                     <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ví tài khoản</h3>
                </div>
                
                {/* Balance & Actions Card */}
                <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white dark:from-background dark:to-background dark:border dark:border-border relative">
                    <div className="absolute top-0 right-0 p-3 opacity-5">
                        <Wallet className="w-32 h-32 text-white transform rotate-12 translate-x-8 -translate-y-8" />
                    </div>
                    
                    <div className="p-5 relative z-10">
                        <div className="flex items-center gap-2 mb-2 text-slate-300">
                             <div className="bg-white/10 p-1 rounded-md backdrop-blur-sm">
                                <Wallet className="h-3.5 w-3.5" />
                            </div>
                            <span className="font-medium text-xs uppercase tracking-wide">Số dư khả dụng</span>
                        </div>

                        <div className="mb-6">
                             <span className="text-3xl font-bold tracking-tight">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(profileData.balance)}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Button 
                                className="h-9 bg-emerald-500 hover:bg-emerald-600 text-white border-0 font-medium shadow-sm transition-all"
                                onClick={() => navigate('/profile/payment')}
                            >
                                <ArrowDownLeft className="h-4 w-4 mr-1.5" />
                                Nạp tiền
                            </Button>
                            <Button 
                                variant="outline" 
                                className="h-9 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white font-medium transition-all"
                                onClick={() => navigate('/profile/payment')}
                            >
                                <ArrowUpRight className="h-4 w-4 mr-1.5" />
                                Rút tiền
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Wallet Menu Items */}
                <Card className="border shadow-sm divide-y divide-border/50">
                    {walletItems.map((item) => (
                         <div 
                            key={item.id}
                            onClick={() => navigate(item.route)}
                            className="flex items-center gap-3 p-3 hover:bg-secondary/40 transition-colors cursor-pointer group"
                        >
                            <div className={cn("p-2 rounded-md bg-secondary/50 group-hover:bg-background transition-colors")}>
                                {React.cloneElement(item.icon as React.ReactElement, { className: "h-4 w-4" })}
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-medium">{item.label}</div>
                                <div className="text-xs text-muted-foreground">{item.desc}</div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground" />
                        </div>
                    ))}
                </Card>
            </div>

            {/* Expert Info Update or Locaith ID */}
            {profileData.isExpert ? (
                <Card className="flex flex-col p-5 justify-between bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200/50 dark:border-blue-800/50 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Briefcase className="w-32 h-32 text-blue-600" />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="flex items-center gap-2">
                                <div className="bg-blue-100 dark:bg-blue-900/40 p-1.5 rounded-lg ring-1 ring-blue-200 dark:ring-blue-800">
                                    <UserCog className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <span className="font-medium text-sm text-blue-950 dark:text-blue-100">Thông tin chuyên gia</span>
                            </div>
                            <Badge variant="outline" className="text-[10px] font-normal bg-green-500/10 text-green-600 border-green-200 dark:border-green-800 dark:text-green-400">
                                Đã duyệt
                            </Badge>
                        </div>
                        
                        <div className="relative z-10 space-y-3">
                            <div>
                                <h3 className="text-lg font-bold text-foreground mb-1">
                                    {expertInfo?.role || "Cập nhật hồ sơ"}
                                </h3>
                                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                    {expertInfo?.bio || "Hoàn thiện hồ sơ năng lực để tăng độ tin cậy và tiếp cận nhiều khách hàng hơn."}
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-3 text-xs bg-background/50 p-2 rounded-lg border border-border/50">
                                 <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                    <span className="font-medium text-foreground">5.0</span>
                                 </div>
                                 <Separator orientation="vertical" className="h-3" />
                                 <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                                    <span className="font-medium text-foreground">12 Dự án</span>
                                 </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-blue-200/50 dark:border-blue-800/50 relative z-10">
                         <Button 
                            className="w-full h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all hover:shadow-md"
                            onClick={() => navigate('/profile/expert-update')}
                         >
                            {expertInfo ? "Chỉnh sửa hồ sơ" : "Cập nhật ngay"}
                         </Button>
                    </div>
                </Card>
            ) : (
                <Card className="flex flex-col p-5 justify-between bg-card border shadow-sm">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="bg-purple-100 dark:bg-purple-900/30 p-1.5 rounded-lg">
                                    <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <span className="font-medium text-sm">Tài khoản định danh</span>
                            </div>
                            <Badge variant="secondary" className="text-[10px] font-normal">
                                Đã xác minh
                            </Badge>
                        </div>
                        
                        <div className="relative group">
                            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border/50 font-mono text-lg font-bold tracking-widest text-center text-foreground">
                                <span className="flex-1">{profileData.referralCode}</span>
                                <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8 hover:bg-background/80"
                                    onClick={() => copyToClipboard(profileData.referralCode)}
                                >
                                    <Copy className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground leading-relaxed text-center">
                                Mã định danh duy nhất của bạn để nhận thanh toán và xác minh giao dịch trên hệ thống.
                            </p>
                        </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-border/50">
                         <Button variant="outline" className="w-full h-9 text-xs">
                            Xem chi tiết hồ sơ
                         </Button>
                    </div>
                </Card>
            )}
        </div>

        {/* Menu Sections - Consolidated */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
                <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">Hạng thành viên và ưu đãi</h3>
                    <Card className="border shadow-sm divide-y divide-border/50">
                        {membershipItems.map((item) => (
                             <div 
                                key={item.id}
                                onClick={() => navigate(item.route)}
                                className="flex items-center gap-3 p-3 hover:bg-secondary/40 transition-colors cursor-pointer group"
                            >
                                <div className={cn("p-2 rounded-md bg-secondary/50 group-hover:bg-background transition-colors")}>
                                    {React.cloneElement(item.icon as React.ReactElement, { className: "h-4 w-4" })}
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-medium">{item.label}</div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground" />
                            </div>
                        ))}
                    </Card>
                </div>

                <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">Quản lý</h3>
                    <Card className="border shadow-sm divide-y divide-border/50">
                        {[...workspaceItems, ...accountItems].slice(0, 6).map((item) => (
                             <div 
                                key={item.id}
                                onClick={() => navigate(item.route)}
                                className="flex items-center gap-3 p-3 hover:bg-secondary/40 transition-colors cursor-pointer group"
                            >
                                <div className={cn("p-2 rounded-md bg-secondary/50 group-hover:bg-background transition-colors")}>
                                    {React.cloneElement(item.icon as React.ReactElement, { className: "h-4 w-4" })}
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-medium">{item.label}</div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground" />
                            </div>
                        ))}
                    </Card>
                </div>
            </div>

            <div className="space-y-4">
                 <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">Khác</h3>
                 <Card className="border shadow-sm divide-y divide-border/50">

                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="settings" className="border-b-0">
                            <AccordionTrigger className="hover:no-underline py-3 px-3 hover:bg-secondary/40 data-[state=open]:bg-secondary/40 group [&[data-state=open]>div>svg]:rotate-90">
                                <div className="flex items-center gap-3 w-full">
                                    <div className="p-2 rounded-md bg-secondary/50 group-hover:bg-background transition-colors">
                                        <Settings className="h-4 w-4 text-slate-500" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="text-sm font-medium">Cài đặt</div>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-0 border-t border-border/50">
                                <div className="divide-y divide-border/50 bg-secondary/10">
                                    <div 
                                        onClick={() => !uploading && fileInputRef.current?.click()} 
                                        className={`flex items-center gap-3 p-3 pl-12 hover:bg-secondary/60 cursor-pointer transition-colors group/item ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                                    >
                                        <div className="relative">
                                            <Camera className="h-4 w-4 text-muted-foreground group-hover/item:text-foreground" />
                                            {uploading && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                                                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-sm text-muted-foreground group-hover/item:text-foreground">
                                            {uploading ? 'Đang cập nhật...' : 'Cập nhật ảnh đại diện'}
                                        </span>
                                    </div>
                                    <div onClick={() => navigate('/notifications')} className="flex items-center gap-3 p-3 pl-12 hover:bg-secondary/60 cursor-pointer transition-colors group/item">
                                        <Bell className="h-4 w-4 text-muted-foreground group-hover/item:text-foreground" />
                                        <span className="text-sm text-muted-foreground group-hover/item:text-foreground">Thông báo</span>
                                    </div>
                                    <div onClick={() => navigate('/privacy')} className="flex items-center gap-3 p-3 pl-12 hover:bg-secondary/60 cursor-pointer transition-colors group/item">
                                        <Shield className="h-4 w-4 text-muted-foreground group-hover/item:text-foreground" />
                                        <span className="text-sm text-muted-foreground group-hover/item:text-foreground">Quyền riêng tư & Bảo mật</span>
                                    </div>
                                    <div onClick={() => navigate('/settings/password')} className="flex items-center gap-3 p-3 pl-12 hover:bg-secondary/60 cursor-pointer transition-colors group/item">
                                        <Lock className="h-4 w-4 text-muted-foreground group-hover/item:text-foreground" />
                                        <span className="text-sm text-muted-foreground group-hover/item:text-foreground">Đổi mật khẩu</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 pl-12 hover:bg-secondary/60 cursor-pointer transition-colors group/item">
                                        <Globe className="h-4 w-4 text-muted-foreground group-hover/item:text-foreground" />
                                        <span className="text-sm text-muted-foreground group-hover/item:text-foreground">Ngôn ngữ: Tiếng Việt</span>
                                    </div>
                                    <div onClick={() => navigate('/settings/delete-account')} className="flex items-center gap-3 p-3 pl-12 hover:bg-red-50 dark:hover:bg-red-900/10 cursor-pointer transition-colors text-red-600/80 hover:text-red-600 dark:text-red-400/80 dark:hover:text-red-400">
                                        <Trash2 className="h-4 w-4" />
                                        <span className="text-sm">Xóa tài khoản</span>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                    
                    <div 
                        onClick={() => navigate('/help')}
                        className="flex items-center gap-3 p-3 hover:bg-secondary/40 transition-colors cursor-pointer group"
                    >
                        <div className="p-2 rounded-md bg-secondary/50 group-hover:bg-background">
                            <HelpCircle className="h-4 w-4 text-teal-500" />
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-medium">Trợ giúp & Hỗ trợ</div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                    </div>

                    <div 
                        onClick={async () => {
                            await signOut();
                            navigate('/');
                        }}
                        className="flex items-center gap-3 p-3 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors cursor-pointer group text-red-600 dark:text-red-400"
                    >
                        <div className="p-2 rounded-md bg-red-100/50 dark:bg-red-900/20 group-hover:bg-red-100 dark:group-hover:bg-red-900/30">
                            <LogOut className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-medium">Đăng xuất</div>
                        </div>
                    </div>
                 </Card>
                 
                 <div className="pt-4 text-center">
                    <p className="text-[10px] text-muted-foreground/60">Locaith AI Studio v1.2.0 • © 2024</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
