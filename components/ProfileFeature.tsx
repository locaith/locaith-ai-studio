import React from 'react';
import {
  User, Settings, HelpCircle, LogOut, ChevronRight,
  CreditCard, Bell, Shield, Zap, Layout, FileText,
  History, Bookmark, Star, Crown, Briefcase
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "../src/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export const ProfileFeature = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Mock data for the profile
  const profileData = {
    name: user?.user_metadata?.full_name || "Người dùng Locaith",
    email: user?.email || "user@locaith.com",
    avatar: user?.user_metadata?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Locaith",
    credits: 1250,
    plan: "Free",
    projects: 12,
    saved: 45
  };

  const workspaceItems = [
    { id: 'projects', label: "Dự án của tôi", icon: <Layout className="h-5 w-5 text-blue-500" />, route: '/projects', desc: "Quản lý các dự án đã tạo" },
    { id: 'saved', label: "Đã lưu", icon: <Bookmark className="h-5 w-5 text-orange-500" />, route: '/saved', desc: "Công cụ và nội dung yêu thích" },
    { id: 'history', label: "Lịch sử hoạt động", icon: <History className="h-5 w-5 text-gray-500" />, route: '/history', desc: "Xem lại các hoạt động gần đây" },
    { id: 'jobs', label: "Việc làm & Ứng tuyển", icon: <Briefcase className="h-5 w-5 text-indigo-500" />, route: '/jobs/my-jobs', desc: "Trạng thái hồ sơ ứng tuyển" },
  ];

  const accountItems = [
    { id: 'subscription', label: "Gói dịch vụ", icon: <Crown className="h-5 w-5 text-yellow-500" />, route: '/subscription', desc: "Nâng cấp và quản lý thanh toán" },
    { id: 'settings', label: "Cài đặt", icon: <Settings className="h-5 w-5 text-slate-500" />, route: '/settings', desc: "Tùy chỉnh giao diện và ứng dụng" },
    { id: 'notifications', label: "Thông báo", icon: <Bell className="h-5 w-5 text-red-500" />, route: '/notifications', desc: "Quản lý thông báo nhận được" },
    { id: 'security', label: "Quyền riêng tư & Bảo mật", icon: <Shield className="h-5 w-5 text-green-500" />, route: '/privacy', desc: "Bảo vệ tài khoản của bạn" },
  ];

  return (
    <div className="h-full w-full bg-background pb-24 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 neu-bg h-14 px-3 border-b border-sidebar-border flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Cá nhân</h1>
        <Button size="icon" className="neu-icon-btn h-9 w-9 hover:text-primary">
            <Settings className="h-5 w-5" />
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Card */}
        <div className="flex items-center gap-4 mb-2">
            <Avatar className="h-16 w-16 border-2 border-background shadow-sm ring-2 ring-border/20">
                <AvatarImage src={profileData.avatar} />
                <AvatarFallback>LC</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <h2 className="font-bold text-xl text-foreground">{profileData.name}</h2>
                <p className="text-sm text-muted-foreground">{profileData.email}</p>
                <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs font-normal bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">
                        {profileData.plan} Plan
                    </Badge>
                    <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                        Member
                    </Badge>
                </div>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
            <Card className="p-3 flex flex-col items-center justify-center gap-1 bg-secondary/20 border-border/50 shadow-none">
                <div className="bg-yellow-500/10 p-2 rounded-full">
                    <Zap className="h-4 w-4 text-yellow-500" />
                </div>
                <span className="font-bold text-lg">{profileData.credits}</span>
                <span className="text-xs text-muted-foreground">Credits</span>
            </Card>
            <Card className="p-3 flex flex-col items-center justify-center gap-1 bg-secondary/20 border-border/50 shadow-none">
                <div className="bg-blue-500/10 p-2 rounded-full">
                    <Layout className="h-4 w-4 text-blue-500" />
                </div>
                <span className="font-bold text-lg">{profileData.projects}</span>
                <span className="text-xs text-muted-foreground">Dự án</span>
            </Card>
            <Card className="p-3 flex flex-col items-center justify-center gap-1 bg-secondary/20 border-border/50 shadow-none">
                <div className="bg-orange-500/10 p-2 rounded-full">
                    <Bookmark className="h-4 w-4 text-orange-500" />
                </div>
                <span className="font-bold text-lg">{profileData.saved}</span>
                <span className="text-xs text-muted-foreground">Đã lưu</span>
            </Card>
        </div>

        {/* Upgrade Banner */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white shadow-lg">
            <div className="relative z-10 flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-lg">Nâng cấp Pro</h3>
                    <p className="text-blue-100 text-sm mb-3">Mở khóa toàn bộ tính năng AI cao cấp</p>
                    <Button size="sm" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50 border-none h-8">
                        Nâng cấp ngay
                    </Button>
                </div>
                <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                    <Crown className="h-8 w-8 text-yellow-300 fill-yellow-300" />
                </div>
            </div>
            {/* Decor elements */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        {/* Workspace Section */}
        <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">Không gian làm việc</h3>
            <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
                {workspaceItems.map((item, index) => (
                    <div key={item.id}>
                        <div 
                            onClick={() => navigate(item.route)}
                            className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors cursor-pointer active:bg-secondary/50"
                        >
                            <div className="p-2 rounded-lg bg-secondary/50">
                                {item.icon}
                            </div>
                            <div className="flex-1">
                                <div className="font-medium text-sm">{item.label}</div>
                                <div className="text-xs text-muted-foreground">{item.desc}</div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                        </div>
                        {index < workspaceItems.length - 1 && <Separator className="bg-border/40" />}
                    </div>
                ))}
            </div>
        </div>

        {/* Account Section */}
        <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">Tài khoản</h3>
            <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
                {accountItems.map((item, index) => (
                    <div key={item.id}>
                        <div 
                            onClick={() => navigate(item.route)}
                            className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors cursor-pointer active:bg-secondary/50"
                        >
                            <div className="p-2 rounded-lg bg-secondary/50">
                                {item.icon}
                            </div>
                            <div className="flex-1">
                                <div className="font-medium text-sm">{item.label}</div>
                                <div className="text-xs text-muted-foreground">{item.desc}</div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                        </div>
                        {index < accountItems.length - 1 && <Separator className="bg-border/40" />}
                    </div>
                ))}
            </div>
        </div>

        {/* Support Section */}
        <div className="space-y-3">
            <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
                <div 
                    onClick={() => navigate('/help')}
                    className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors cursor-pointer"
                >
                    <div className="p-2 rounded-lg bg-secondary/50">
                        <HelpCircle className="h-5 w-5 text-teal-500" />
                    </div>
                    <div className="flex-1">
                        <div className="font-medium text-sm">Trợ giúp & Hỗ trợ</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                </div>
            </div>
        </div>
        
        <Button 
            variant="outline" 
            className="w-full h-12 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 dark:border-red-900/30 dark:hover:bg-red-900/20 mt-4"
            onClick={async () => {
                await signOut();
                navigate('/');
            }}
        >
            <LogOut className="h-4 w-4 mr-2" />
            Đăng xuất
        </Button>
        
        <div className="pt-4 pb-8 text-center space-y-1">
            <p className="text-xs text-muted-foreground">Locaith AI Studio v1.2.0</p>
            <p className="text-[10px] text-muted-foreground/60">© 2024 Locaith Inc. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};
