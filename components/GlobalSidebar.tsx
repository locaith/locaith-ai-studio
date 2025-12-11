import React, { useState } from 'react';
import { useAuth } from '../src/hooks/useAuth';
import { useLayoutContext } from '../src/context/LayoutContext';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  Globe,
  PenTool,
  FileText,
  Search,
  Mic,
  Zap,
  Settings,
  Palette,
  ChevronLeft,
  ChevronRight,
  Plus,
  Folder,
  MessageSquare,
  LayoutGrid,
  Compass,
  Sun,
  Moon,
  Briefcase,
  Users,
  MessageCircle,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useTheme } from "next-themes";

export type FeatureType = 'dashboard' | 'web-builder' | 'design' | 'fashion' | 'text' | 'search' | 'voice' | 'automation' | 'settings' | 'apps' | 'explore' | 'jobs' | 'experts' | 'chat' | 'profile' | 'check' | 'projects';
export type ThemeType = 'default' | 'universe' | 'ocean' | 'sky' | 'matrix' | 'pink' | 'coffee' | 'custom';

interface GlobalSidebarProps {
  activeFeature: FeatureType;
  onSelect: (feature: FeatureType) => void;
  currentTheme: ThemeType;
  onThemeChange: (theme: ThemeType, customImage?: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface SidebarItemProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  isCollapsed?: boolean;
  badge?: number | string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ active, onClick, icon, label, isCollapsed, badge }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className={cn(
              "mb-2 transition-all duration-200",
              isCollapsed 
                ? "w-10 h-10 p-0 ml-3 neu-icon-btn rounded-full" 
                : "w-full justify-start px-4 py-2 h-auto",
              active 
                ? isCollapsed ? "neu-pressed-primary text-white" : "neu-pressed-primary text-white font-medium" 
                : isCollapsed ? "neu-btn hover:text-primary" : "neu-btn hover:text-primary text-muted-foreground"
            )}
            onClick={onClick}
          >
            <div className={cn("flex items-center relative", isCollapsed ? "justify-center w-full" : "")}>
                {icon}
                {isCollapsed && badge && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold">
                    {badge}
                  </span>
                )}
            </div>
            <span className={cn(
              "overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap text-sm flex-1 flex items-center justify-between",
              isCollapsed ? "max-w-0 opacity-0 ml-0" : "max-w-[200px] opacity-100 ml-3"
            )}>
              {label}
              {!isCollapsed && badge && (
                <span className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] text-white font-bold">
                  {badge}
                </span>
              )}
            </span>
          </Button>
        </TooltipTrigger>
        {isCollapsed && (
          <TooltipContent side="right">
            {label}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export const GlobalSidebar: React.FC<GlobalSidebarProps> = ({
  activeFeature,
  onSelect,
  currentTheme,
  onThemeChange,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const { setAuthModalOpen, setAuthMode, unreadCount } = useLayoutContext();
  const { user, isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();


  return (
    <div className={cn(
      "h-screen neu-bg border-r border-sidebar-border flex flex-col transition-all duration-300 z-50 overflow-hidden",
      isCollapsed ? "w-16" : "w-[260px]"
    )}>
      {/* Studio Header */}
      <div className={cn(
        "h-16 flex items-center border-b border-sidebar-border transition-all duration-300 justify-between",
        isCollapsed ? "pl-4 pr-2" : "px-4"
      )}>
        <div className={cn("flex items-center gap-3 overflow-hidden")}>
          {onToggleCollapse && (
             <Button size="icon" onClick={onToggleCollapse} className="h-8 w-8 shrink-0 neu-icon-btn hover:text-primary mr-1 rounded-full">
               <ChevronLeft className={cn("h-4 w-4 transition-all", isCollapsed ? "rotate-90 scale-0" : "rotate-0 scale-100")} />
               <ChevronRight className={cn("absolute h-4 w-4 transition-all", isCollapsed ? "rotate-0 scale-100" : "-rotate-90 scale-0")} />
             </Button>
          )}

          {!isCollapsed && (
            <>
              <img src="/logo-locaith.png" alt="Locaith" className="w-8 h-8 rounded-md" />
              <div className="flex flex-col overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap max-w-[150px] opacity-100">
                <span className="font-bold text-sm leading-none">Locaith AI</span>
                <span className="text-[10px] text-muted-foreground font-semibold tracking-wider">PRO SUITE</span>
              </div>
            </>
          )}
        </div>

        {!isCollapsed && (
          <div className="flex items-center gap-1">
             <Button
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-8 w-8 neu-icon-btn hover:text-primary rounded-full"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <ScrollArea className="flex-1 py-2">
        <div className={cn("transition-all duration-200 space-y-1", isCollapsed ? "px-0" : "px-4")}>
          {/* Section: Tạo mới (Create New) */}
          <div className={cn(
            "px-2 text-xs font-bold text-muted-foreground uppercase tracking-wider overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap",
            isCollapsed ? "max-h-0 opacity-0 mb-0" : "max-h-6 opacity-100 mb-2 mt-2"
          )}>
            Tạo mới
          </div>
          
          <SidebarItem
            active={activeFeature === 'dashboard'}
            onClick={() => onSelect('dashboard')}
            icon={<MessageSquare className="h-4 w-4" />}
            label="Trợ lý AI"
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            active={activeFeature === 'search'}
            onClick={() => onSelect('search')}
            icon={<Search className="h-4 w-4" />}
            label="Tìm kiếm nâng cao"
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            active={activeFeature === 'jobs'}
            onClick={() => onSelect('jobs')}
            icon={<Briefcase className="h-4 w-4" />}
            label="Sàn việc làm"
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            active={activeFeature === 'experts'}
            onClick={() => onSelect('experts')}
            icon={<Users className="h-4 w-4" />}
            label="Chuyên gia"
            isCollapsed={isCollapsed}
          />
          {/* <SidebarItem
            active={activeFeature === 'web-builder'}
            onClick={() => onSelect('web-builder')}
            icon={<Globe className="h-4 w-4" />}
            label="Website Builder"
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            active={activeFeature === 'design'}
            onClick={() => onSelect('design')}
            icon={<PenTool className="h-4 w-4" />}
            label="Interior & Design"
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            active={activeFeature === 'text'}
            onClick={() => onSelect('text')}
            icon={<FileText className="h-4 w-4" />}
            label="Compose Word"
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            active={activeFeature === 'fashion'}
            onClick={() => onSelect('fashion')}
            icon={<Palette className="h-4 w-4" />}
            label="Fashion Design"
            isCollapsed={isCollapsed}
          /> */}

          <Separator className="my-4" />

          {/* Section: Công cụ (Tools) */}
          <div className={cn(
            "px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap",
            isCollapsed ? "max-h-0 opacity-0 mb-0" : "max-h-6 opacity-100 mb-2"
          )}>
            Công cụ
          </div>
          
          <SidebarItem
            active={activeFeature === 'chat'}
            onClick={() => onSelect('chat')}
            icon={<MessageCircle className="h-4 w-4" />}
            label="Chat trực tiếp"
            isCollapsed={isCollapsed}
            badge={unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : undefined}
          />
          <SidebarItem
            active={activeFeature === 'check'}
            onClick={() => onSelect('check')}
            icon={<Zap className="h-4 w-4" />}
            label="Check"
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            active={activeFeature === 'apps'}
            onClick={() => onSelect('apps')}
            icon={<LayoutGrid className="h-4 w-4" />}
            label="Kho ứng dụng"
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            active={activeFeature === 'explore'}
            onClick={() => onSelect('explore')}
            icon={<Compass className="h-4 w-4" />}
            label="Khám phá"
            isCollapsed={isCollapsed}
          />

          <Separator className="my-4" />

          {/* Section: Dự án (Projects) */}
          <div className={cn(
            "flex items-center justify-between px-2 overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap",
            isCollapsed ? "max-h-0 opacity-0 mb-0" : "max-h-8 opacity-100 mb-2"
          )}>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dự án</div>
            <Button variant="ghost" size="icon" className="h-5 w-5">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          
          {/* Project List Placeholder */}
          <SidebarItem
             active={activeFeature === 'projects'}
             onClick={() => onSelect('projects')}
             icon={<Folder className="h-4 w-4" />}
             label="Dự án đầu tiên"
             isCollapsed={isCollapsed}
          />
           <SidebarItem
             active={false}
             onClick={() => {}}
             icon={<Folder className="h-4 w-4" />}
             label="Marketing Campaign"
             isCollapsed={isCollapsed}
          />
        </div>
      </ScrollArea>

      {/* Footer Section */}
      <div className={cn("border-t border-sidebar-border", isCollapsed ? "p-0 py-2" : "p-4")}>



        <Separator className="my-2 opacity-50" />

        {isAuthenticated ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className={cn(
                    "mb-2 transition-all duration-200 h-auto",
                    isCollapsed 
                      ? "w-10 h-10 p-0 ml-3 neu-icon-btn rounded-full" 
                      : "w-full justify-start px-2 py-2",
                    activeFeature === 'profile'
                      ? isCollapsed ? "neu-pressed-primary text-primary" : "neu-pressed-primary text-primary font-medium" 
                      : isCollapsed ? "neu-btn hover:text-primary" : "neu-btn hover:text-primary text-muted-foreground"
                  )}
                  onClick={() => onSelect('profile')}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className={cn(activeFeature === 'profile' ? "text-primary" : "")}>{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    "flex flex-col items-start overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap",
                    isCollapsed ? "max-w-0 opacity-0 ml-0" : "max-w-[150px] opacity-100 ml-3"
                  )}>
                      <span className={cn("text-sm font-medium truncate", activeFeature === 'profile' ? "text-primary" : "")}>
                        {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                      </span>
                      <span className={cn("text-xs truncate", activeFeature === 'profile' ? "text-muted-foreground" : "text-muted-foreground")}>
                        {user?.email}
                      </span>
                  </div>
                </Button>
              </TooltipTrigger>
              {isCollapsed && <TooltipContent side="right">Hồ sơ cá nhân</TooltipContent>}
            </Tooltip>
          </TooltipProvider>
        ) : (
          <div className="flex flex-col gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className={cn(
                      "transition-all duration-200 text-muted-foreground hover:text-primary", 
                      isCollapsed 
                        ? "w-10 h-10 p-0 ml-3" 
                        : "w-full justify-start px-3"
                    )}
                    onClick={() => { setAuthMode('login'); setAuthModalOpen(true); }}
                  >
                    <LogIn className="h-4 w-4" />
                    <span className={cn(
                        "overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap",
                        isCollapsed ? "max-w-0 opacity-0 ml-0" : "max-w-[100px] opacity-100 ml-3"
                    )}>
                      Đăng nhập
                    </span>
                  </Button>
                </TooltipTrigger>
                {isCollapsed && <TooltipContent side="right">Đăng nhập</TooltipContent>}
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
    </div>
  );
};
