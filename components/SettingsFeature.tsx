import React, { useState, useRef } from 'react';
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Moon, Sun, Monitor, Palette, Bell, User, Shield, ArrowLeft, 
  Cpu, CreditCard, Globe, Lock, Key, Smartphone, Zap, Check, 
  LogOut, AlertCircle, ChevronRight, Copy, Eye, EyeOff, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "../src/hooks/useAuth";
import { supabase } from "../src/lib/supabase";

export const SettingsFeature: React.FC = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [mounted, setMounted] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("general");
  const [apiKeyVisible, setApiKeyVisible] = React.useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setMounted(true);
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

  const themes = [
    { id: 'default', name: 'Minimal', color: 'bg-gray-100 dark:bg-zinc-800' },
    { id: 'universe', name: 'Universe', color: 'bg-gradient-to-br from-zinc-900 to-neutral-900' },
    { id: 'ocean', name: 'Ocean', color: 'bg-gradient-to-br from-blue-900 to-cyan-900' },
    { id: 'sky', name: 'Sky', color: 'bg-gradient-to-b from-blue-400 to-white' },
    { id: 'matrix', name: 'Matrix', color: 'bg-black border border-green-900' },
    { id: 'pink', name: 'Dreamy', color: 'bg-gradient-to-br from-zinc-400 to-zinc-600' },
    { id: 'coffee', name: 'Coffee', color: 'bg-[#3e2723]' },
  ];

  const menuItems = [
    { id: 'general', label: 'Chung', icon: Globe },
    { id: 'account', label: 'Tài khoản', icon: User },
    { id: 'appearance', label: 'Giao diện', icon: Palette },
    { id: 'ai', label: 'Cấu hình AI', icon: Cpu },
    { id: 'billing', label: 'Gói & Thanh toán', icon: CreditCard },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
    { id: 'security', label: 'Bảo mật', icon: Shield },
  ];

  if (!mounted) {
    return <div className="h-full w-full bg-background" />;
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Đã sao chép vào clipboard");
  };

  return (
    <div className="h-full w-full bg-background flex flex-col">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-50 neu-bg border-b border-border pt-[env(safe-area-inset-top)] h-[calc(3.5rem+env(safe-area-inset-top))] flex items-center px-3 shadow-sm shrink-0">
         <div className="flex items-center gap-2 w-full">
            <Button 
                onClick={() => navigate(-1)} 
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full"
            >
                <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="font-bold text-lg">Cài đặt</span>
         </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col md:flex-row">
          
          {/* Sidebar Navigation */}
          <TabsList className="h-auto md:h-full w-full md:w-64 overflow-x-auto md:overflow-y-auto flex md:flex-col justify-start items-stretch bg-muted/30 md:border-r border-border p-2 gap-1 rounded-none shrink-0">
             <div className="hidden md:flex items-center gap-3 px-4 py-6 mb-2">
                <div className="bg-primary/10 p-2 rounded-xl">
                    <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h2 className="font-bold text-lg">Cài đặt</h2>
                    <p className="text-xs text-muted-foreground">Locaith Studio</p>
                </div>
             </div>
             
             {menuItems.map((item) => (
                <TabsTrigger 
                    key={item.id} 
                    value={item.id}
                    className="justify-start px-4 py-3 h-auto data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all rounded-lg group"
                >
                    <item.icon className="w-4 h-4 mr-3 text-muted-foreground group-data-[state=active]:text-primary" />
                    <span className="truncate">{item.label}</span>
                    {item.id === 'billing' && <Badge variant="secondary" className="ml-auto text-[10px] h-5">Pro</Badge>}
                </TabsTrigger>
             ))}

             <div className="mt-auto hidden md:block px-4 py-4">
                 <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/10">
                    <h4 className="font-bold text-sm mb-1 text-primary">Cần trợ giúp?</h4>
                    <p className="text-xs text-muted-foreground mb-3">Liên hệ đội ngũ hỗ trợ Locaith</p>
                    <Button size="sm" variant="outline" className="w-full bg-background h-8 text-xs">Gửi yêu cầu</Button>
                 </div>
             </div>
          </TabsList>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 pb-32 md:p-8 md:pb-24">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* --- GENERAL TAB --- */}
                <TabsContent value="general" className="space-y-6 mt-0">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold tracking-tight">Cài đặt chung</h2>
                        <p className="text-muted-foreground">Tùy chỉnh ngôn ngữ và khu vực của bạn.</p>
                    </div>
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div className="grid gap-2">
                                <Label>Ngôn ngữ</Label>
                                <Select defaultValue="vi">
                                    <SelectTrigger className="w-full md:w-[300px]">
                                        <SelectValue placeholder="Chọn ngôn ngữ" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="vi">Tiếng Việt</SelectItem>
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="jp">日本語</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Separator />
                            <div className="grid gap-2">
                                <Label>Định dạng ngày & giờ</Label>
                                <Select defaultValue="auto">
                                    <SelectTrigger className="w-full md:w-[300px]">
                                        <SelectValue placeholder="Chọn định dạng" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="auto">Tự động (theo hệ thống)</SelectItem>
                                        <SelectItem value="24h">24 giờ (14:30)</SelectItem>
                                        <SelectItem value="12h">12 giờ (2:30 PM)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- ACCOUNT TAB --- */}
                <TabsContent value="account" className="space-y-6 mt-0">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold tracking-tight">Tài khoản</h2>
                        <p className="text-muted-foreground">Quản lý thông tin cá nhân và hồ sơ.</p>
                    </div>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Hồ sơ công khai</CardTitle>
                            <CardDescription>Thông tin này sẽ hiển thị với người dùng khác.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col md:flex-row items-start gap-6">
                                <div className="flex flex-col items-center gap-3">
                                    <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                                        <AvatarImage src={user?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Locaith"} />
                                        <AvatarFallback>{user?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                    />
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                    >
                                        {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                        {uploading ? 'Đang tải...' : 'Thay đổi ảnh'}
                                    </Button>
                                </div>
                                <div className="flex-1 w-full space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="fullname">Họ và tên</Label>
                                            <Input id="fullname" defaultValue="Người dùng Locaith" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="username">Tên người dùng</Label>
                                            <Input id="username" defaultValue="locaith_user" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bio">Giới thiệu ngắn</Label>
                                        <Textarea id="bio" placeholder="Viết vài dòng về bạn..." className="min-h-[100px]" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/30 px-6 py-4 flex justify-end">
                            <Button>Lưu thay đổi</Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Email & Liên hệ</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="flex items-center justify-between p-3 border rounded-lg bg-background">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                                        <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">user@locaith.com</p>
                                        <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                                            <Check className="w-3 h-3" /> Đã xác thực
                                        </p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm">Chỉnh sửa</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- APPEARANCE TAB --- */}
                <TabsContent value="appearance" className="space-y-6 mt-0">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold tracking-tight">Giao diện</h2>
                        <p className="text-muted-foreground">Tùy chỉnh trải nghiệm thị giác của bạn.</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Chế độ màu</CardTitle>
                            <CardDescription>Chọn giao diện sáng hoặc tối cho ứng dụng.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-3 gap-4">
                            <div 
                                className={cn(
                                "cursor-pointer rounded-xl border-2 p-4 hover:bg-accent hover:text-accent-foreground transition-all flex flex-col items-center gap-3",
                                theme === 'light' ? "border-primary bg-primary/5" : "border-border"
                                )}
                                onClick={() => setTheme('light')}
                            >
                                <div className="w-full aspect-video bg-[#f0f2f5] rounded-lg border shadow-sm flex items-center justify-center">
                                    <Sun className="h-6 w-6 text-orange-500" />
                                </div>
                                <span className="font-medium text-sm">Sáng</span>
                            </div>
                            <div 
                                className={cn(
                                "cursor-pointer rounded-xl border-2 p-4 hover:bg-accent hover:text-accent-foreground transition-all flex flex-col items-center gap-3",
                                theme === 'dark' ? "border-primary bg-primary/5" : "border-border"
                                )}
                                onClick={() => setTheme('dark')}
                            >
                                <div className="w-full aspect-video bg-[#1e1e2e] rounded-lg border shadow-sm flex items-center justify-center">
                                    <Moon className="h-6 w-6 text-indigo-400" />
                                </div>
                                <span className="font-medium text-sm">Tối</span>
                            </div>
                            <div 
                                className={cn(
                                "cursor-pointer rounded-xl border-2 p-4 hover:bg-accent hover:text-accent-foreground transition-all flex flex-col items-center gap-3",
                                theme === 'system' ? "border-primary bg-primary/5" : "border-border"
                                )}
                                onClick={() => setTheme('system')}
                            >
                                <div className="w-full aspect-video bg-gradient-to-r from-[#f0f2f5] to-[#1e1e2e] rounded-lg border shadow-sm flex items-center justify-center">
                                    <Monitor className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <span className="font-medium text-sm">Hệ thống</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Chủ đề (Themes)</CardTitle>
                            <CardDescription>Bộ sưu tập màu sắc độc quyền của Locaith.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {themes.map((t) => (
                                <div
                                    key={t.id}
                                    className={cn(
                                        "group relative cursor-pointer overflow-hidden rounded-xl border-2 transition-all hover:scale-105",
                                        theme === t.id ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50"
                                    )}
                                    onClick={() => setTheme(t.id)}
                                >
                                    <div className={cn("h-20 w-full", t.color)} />
                                    <div className="p-3 bg-card flex items-center justify-between">
                                        <span className="font-medium text-xs">{t.name}</span>
                                        {theme === t.id && <Check className="h-3 w-3 text-primary" />}
                                    </div>
                                </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- AI CONFIG TAB --- */}
                <TabsContent value="ai" className="space-y-6 mt-0">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold tracking-tight">Cấu hình AI</h2>
                        <p className="text-muted-foreground">Quản lý mô hình và tham số sinh nội dung.</p>
                    </div>

                    <Card className="border-primary/20 shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Cpu className="w-5 h-5 text-primary" />
                                Mô hình mặc định
                            </CardTitle>
                            <CardDescription>Chọn mô hình AI chính cho các tác vụ của bạn.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="grid gap-2">
                                <Select defaultValue="gemini-1.5-pro">
                                    <SelectTrigger className="w-full h-12 text-base">
                                        <SelectValue placeholder="Chọn mô hình" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro (Khuyên dùng)</SelectItem>
                                        <SelectItem value="gpt-4o">GPT-4o (OpenAI)</SelectItem>
                                        <SelectItem value="claude-3.5-sonnet">Claude 3.5 Sonnet (Anthropic)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    * Gemini 1.5 Pro được tối ưu hóa tốt nhất cho Locaith Studio.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                         <CardHeader>
                            <CardTitle>System Prompt (Toàn cục)</CardTitle>
                            <CardDescription>Hướng dẫn hành vi mặc định cho tất cả trợ lý AI.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea 
                                className="min-h-[150px] font-mono text-sm"
                                placeholder="Ví dụ: Bạn là một trợ lý AI chuyên nghiệp, luôn trả lời ngắn gọn và chính xác..."
                                defaultValue="Bạn là trợ lý AI thông minh của Locaith Studio. Hãy luôn trả lời một cách hữu ích, chuyên nghiệp và sáng tạo."
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>API Key & Kết nối</CardTitle>
                            <CardDescription>Quản lý khóa truy cập API cho các tích hợp bên ngoài.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Locaith Studio API Key</Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Input 
                                            type={apiKeyVisible ? "text" : "password"} 
                                            value="sk-locaith-xxxxxxxxxxxxxxxxxxxxxxxx" 
                                            readOnly 
                                            className="font-mono bg-muted/50 pr-10"
                                        />
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="absolute right-0 top-0 h-full text-muted-foreground hover:text-foreground"
                                            onClick={() => setApiKeyVisible(!apiKeyVisible)}
                                        >
                                            {apiKeyVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                    <Button variant="outline" onClick={() => copyToClipboard("sk-locaith-xxxxxxxxxxxxxxxxxxxxxxxx")}>
                                        <Copy className="h-4 w-4 mr-2" /> Sao chép
                                    </Button>
                                </div>
                                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                    <AlertCircle className="w-3 h-3" /> Không chia sẻ khóa này với bất kỳ ai.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- BILLING TAB --- */}
                <TabsContent value="billing" className="space-y-6 mt-0">
                     <div className="mb-6">
                        <h2 className="text-2xl font-bold tracking-tight">Gói & Thanh toán</h2>
                        <p className="text-muted-foreground">Quản lý đăng ký và hạn mức sử dụng.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <Card className="md:col-span-2 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-xl">Gói hiện tại: PRO</CardTitle>
                                        <CardDescription>Gia hạn ngày 15/01/2025</CardDescription>
                                    </div>
                                    <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">Đang hoạt động</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">AI Tokens</span>
                                        <span className="text-muted-foreground">1.2M / 2M</span>
                                    </div>
                                    <Progress value={60} className="h-2" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">Lưu trữ (Cloud)</span>
                                        <span className="text-muted-foreground">4.5GB / 10GB</span>
                                    </div>
                                    <Progress value={45} className="h-2" />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button variant="default" className="w-full sm:w-auto">Nâng cấp gói</Button>
                                <Button variant="ghost" className="ml-2">Hủy đăng ký</Button>
                            </CardFooter>
                        </Card>

                        <Card className="flex flex-col justify-center items-center text-center p-6 space-y-4">
                            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full">
                                <CreditCard className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                                <h3 className="font-bold">Phương thức thanh toán</h3>
                                <p className="text-xs text-muted-foreground mt-1">Visa •••• 4242</p>
                            </div>
                            <Button variant="outline" size="sm" className="w-full">Quản lý</Button>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Lịch sử hóa đơn</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <FileTextIcon className="w-4 h-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">Hóa đơn #{1000 + i}</p>
                                                <p className="text-xs text-muted-foreground">15/{13-i}/2024</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold">$29.00</p>
                                            <Badge variant="outline" className="text-[10px] text-green-600 border-green-200">Đã thanh toán</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- NOTIFICATIONS TAB --- */}
                <TabsContent value="notifications" className="space-y-6 mt-0">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold tracking-tight">Thông báo</h2>
                        <p className="text-muted-foreground">Chọn cách bạn muốn nhận thông tin từ chúng tôi.</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Kênh thông báo</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between space-x-2">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Email</Label>
                                    <p className="text-sm text-muted-foreground">Nhận thông báo qua email đăng ký.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between space-x-2">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Thông báo đẩy (Push)</Label>
                                    <p className="text-sm text-muted-foreground">Nhận thông báo trên trình duyệt.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between space-x-2">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Tin nhắn trong App</Label>
                                    <p className="text-sm text-muted-foreground">Hiển thị thông báo khi đang sử dụng.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                 {/* --- SECURITY TAB --- */}
                 <TabsContent value="security" className="space-y-6 mt-0">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold tracking-tight">Bảo mật</h2>
                        <p className="text-muted-foreground">Bảo vệ tài khoản và dữ liệu của bạn.</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Đăng nhập & Mật khẩu</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="font-medium">Mật khẩu</p>
                                    <p className="text-sm text-muted-foreground">Thay đổi lần cuối 3 tháng trước</p>
                                </div>
                                <Button variant="outline">Đổi mật khẩu</Button>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="font-medium">Xác thực 2 bước (2FA)</p>
                                    <p className="text-sm text-muted-foreground">Tăng cường bảo mật cho tài khoản</p>
                                </div>
                                <Switch />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-900/30">
                        <CardHeader>
                            <CardTitle className="text-red-600">Vùng nguy hiểm</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Đăng xuất khỏi mọi thiết bị</p>
                                    <p className="text-sm text-muted-foreground">Kết thúc tất cả các phiên đăng nhập hiện tại</p>
                                </div>
                                <Button variant="outline" className="text-red-600 hover:bg-red-50">Thực hiện</Button>
                            </div>
                            <Separator />
                             <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Xóa tài khoản</p>
                                    <p className="text-sm text-muted-foreground">Hành động này không thể hoàn tác</p>
                                </div>
                                <Button variant="destructive">Xóa tài khoản</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

const FileTextIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" x2="8" y1="13" y2="13" />
        <line x1="16" x2="8" y1="17" y2="17" />
        <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
);
