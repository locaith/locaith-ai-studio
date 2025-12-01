import React from 'react';
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Moon, Sun, Monitor, Palette, Bell, User, Shield, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type ThemeType = 'default' | 'universe' | 'ocean' | 'sky' | 'matrix' | 'pink' | 'coffee' | 'custom';

export const SettingsFeature: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const themes = [
    { id: 'default', name: 'Minimal', color: 'bg-gray-100' },
    { id: 'universe', name: 'Universe', color: 'bg-gradient-to-br from-zinc-900 to-neutral-900' },
    { id: 'ocean', name: 'Ocean', color: 'bg-gradient-to-br from-blue-900 to-cyan-900' },
    { id: 'sky', name: 'Sky', color: 'bg-gradient-to-b from-blue-400 to-white' },
    { id: 'matrix', name: 'Matrix', color: 'bg-black border border-green-900' },
    { id: 'pink', name: 'Dreamy', color: 'bg-gradient-to-br from-zinc-400 to-zinc-600' },
    { id: 'coffee', name: 'Coffee', color: 'bg-[#3e2723]' },
  ];

  if (!mounted) {
    return <div className="h-full w-full bg-background" />;
  }

  return (
    <div className="h-full w-full bg-background">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-50 neu-bg border-b border-[var(--sidebar-border)] h-14 flex items-center px-3 shadow-sm">
         <div className="flex items-center gap-2 w-full">
            <Button 
                onClick={() => navigate(-1)} 
                className="neu-icon-btn h-9 w-9 flex items-center justify-center rounded-full p-0"
            >
                <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="font-bold text-lg text-[var(--neu-text)]">Cài đặt</span>
         </div>
      </div>

      <div className="container mx-auto py-8 px-4 max-w-5xl animate-in fade-in duration-500">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight hidden md:block">Cài đặt</h1>
          <p className="text-muted-foreground mt-2">Quản lý tài khoản và tùy chỉnh trải nghiệm của bạn.</p>
        </div>

        <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 h-auto p-1">
          <TabsTrigger value="appearance" className="py-2.5">
            <Palette className="w-4 h-4 mr-2" />
            Giao diện
          </TabsTrigger>
          <TabsTrigger value="account" className="py-2.5">
            <User className="w-4 h-4 mr-2" />
            Tài khoản
          </TabsTrigger>
          <TabsTrigger value="notifications" className="py-2.5">
            <Bell className="w-4 h-4 mr-2" />
            Thông báo
          </TabsTrigger>
          <TabsTrigger value="privacy" className="py-2.5">
            <Shield className="w-4 h-4 mr-2" />
            Bảo mật
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chế độ màu</CardTitle>
              <CardDescription>Chọn giao diện sáng hoặc tối cho ứng dụng.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              <div 
                className={cn(
                  "cursor-pointer rounded-xl border-2 p-4 hover:bg-accent hover:text-accent-foreground transition-all",
                  theme === 'light' ? "border-primary bg-accent/50" : "border-muted"
                )}
                onClick={() => setTheme('light')}
              >
                <div className="flex flex-col items-center gap-2">
                  <Sun className="h-6 w-6" />
                  <span className="font-medium">Sáng</span>
                </div>
              </div>
              <div 
                className={cn(
                  "cursor-pointer rounded-xl border-2 p-4 hover:bg-accent hover:text-accent-foreground transition-all",
                  theme === 'dark' ? "border-primary bg-accent/50" : "border-muted"
                )}
                onClick={() => setTheme('dark')}
              >
                <div className="flex flex-col items-center gap-2">
                  <Moon className="h-6 w-6" />
                  <span className="font-medium">Tối</span>
                </div>
              </div>
              <div 
                className={cn(
                  "cursor-pointer rounded-xl border-2 p-4 hover:bg-accent hover:text-accent-foreground transition-all",
                  theme === 'system' ? "border-primary bg-accent/50" : "border-muted"
                )}
                onClick={() => setTheme('system')}
              >
                <div className="flex flex-col items-center gap-2">
                  <Monitor className="h-6 w-6" />
                  <span className="font-medium">Hệ thống</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chủ đề (Themes)</CardTitle>
              <CardDescription>Tùy chỉnh màu sắc và phong cách của ứng dụng.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {themes.map((t) => (
                  <div
                    key={t.id}
                    className="group relative cursor-pointer overflow-hidden rounded-xl border border-border hover:border-primary/50 transition-all"
                    onClick={() => setTheme(t.id)}
                  >
                    <div className={cn("h-24 w-full transition-transform group-hover:scale-105", t.color)} />
                    <div className="p-3 bg-card">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{t.name}</span>
                        {theme === t.id && (
                          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin tài khoản</CardTitle>
              <CardDescription>Quản lý thông tin cá nhân và hồ sơ của bạn.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center p-8 text-muted-foreground border border-dashed rounded-lg">
                Tính năng đang được phát triển
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt thông báo</CardTitle>
              <CardDescription>Tùy chỉnh cách bạn nhận thông báo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="email-notifs">Email thông báo</Label>
                <Switch id="email-notifs" />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="push-notifs">Thông báo đẩy</Label>
                <Switch id="push-notifs" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Bảo mật & Quyền riêng tư</CardTitle>
              <CardDescription>Quản lý mật khẩu và quyền truy cập.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center justify-center p-8 text-muted-foreground border border-dashed rounded-lg">
                Tính năng đang được phát triển
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
