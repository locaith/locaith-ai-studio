import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { GlobalSidebar, FeatureType, ThemeType } from "../../../components/GlobalSidebar";
import { AuthModal } from "../../../components/AuthModal";
import { useTheme } from "next-themes";
import { LayoutProvider, useLayoutContext } from "../../context/LayoutContext";
import { 
  MessageSquare, 
  Briefcase, 
  Users, 
  LayoutGrid, 
  Compass, 
  User,
  MessageCircle
} from "lucide-react";
import { ShaderGradientCanvas, ShaderGradient } from 'shadergradient';
import StarBackground from '../../components/ui/StarBackground';

interface LayoutProps {
  children: ReactNode;
}

const MobileBottomNav = ({ activeFeature, onSelect, unreadCount }: { activeFeature: FeatureType, onSelect: (f: FeatureType) => void, unreadCount: number }) => {
  const navItems = [
    { id: 'dashboard', label: 'Tư vấn AI', icon: MessageSquare },
    { id: 'jobs', label: 'Việc làm', icon: Briefcase },
    { id: 'chat', label: 'Chat', icon: Users, badge: unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : undefined },
    { id: 'apps', label: 'Ứng dụng', icon: LayoutGrid },
    { id: 'explore', label: 'Khám phá', icon: Compass },
    { id: 'profile', label: 'Cá nhân', icon: User }, 
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 neu-bg border-t border-sidebar-border z-50 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
      <div className="flex justify-between items-center h-[3.25rem] px-2 gap-1">
        {navItems.map((item) => {
          const isActive = activeFeature === item.id || (item.id === 'dashboard' && activeFeature === 'dashboard');
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id as FeatureType)}
              className={`flex flex-col items-center justify-center flex-1 h-full rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'neu-pressed-primary text-primary scale-95' 
                  : 'neu-btn text-muted-foreground hover:text-primary active:scale-95'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold px-1 py-0.5 rounded-full shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-semibold mt-0.5 leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const LayoutContent = ({ children }: LayoutProps) => {
  const { isCollapsed, setIsCollapsed, toggleSidebar, isAuthModalOpen, setAuthModalOpen, authMode, unreadCount } = useLayoutContext();
  const location = useLocation();
  const navigate = useNavigate();
  const { setTheme, theme } = useTheme();

  // Map route to feature type
  const getActiveFeature = (): FeatureType => {
    const path = location.pathname;
    if (path === '/' || path === '') return 'dashboard';
    if (path.includes('builder')) return 'web-builder';
    if (path.includes('design')) return 'design';
    if (path.includes('fashion')) return 'fashion' as FeatureType;
    if (path.includes('compose')) return 'text';
    if (path.includes('search')) return 'search';
    if (path.includes('apps')) return 'apps';
    if (path.includes('explore')) return 'explore';
    if (path.includes('jobs') || path.includes('giao-viec-lam')) return 'jobs';
    if (path.includes('jobs/my-jobs')) return 'jobs';
    if (path.includes('experts') || path.includes('chuyen-gia')) return 'experts';
    if (path.includes('automation')) return 'automation';
    if (path.includes('voice')) return 'voice';
    if (path.includes('chat')) return 'chat';
    if (path.includes('check')) return 'check';
    if (path.includes('profile')) return 'profile' as FeatureType;
    if (path.includes('history')) return 'profile' as FeatureType;
    if (path.includes('projects')) return 'projects' as FeatureType;
    if (path.includes('settings')) return 'settings' as FeatureType;
    return 'dashboard';
  };

  const handleSelect = (feature: FeatureType) => {
    // Only auto-collapse for specific features
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

  const showGradient = location.pathname === '/' || location.pathname === '/search' || location.pathname === '/jobs' || location.pathname === '/giao-viec-lam' || location.pathname === '/experts' || location.pathname === '/chuyen-gia' || location.pathname === '/check';
  const isDashboard = location.pathname === '/';
  const isDarkMode = theme === 'dark';

  return (
    <div className="flex h-[100dvh] bg-background overflow-hidden relative">
      {/* Global Background Gradient */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-700"
        style={{ opacity: showGradient ? 1 : 0, zIndex: 0 }}
      >
        {showGradient && (
          <StarBackground />
        )}
      </div>

      <div className="hidden md:flex h-full relative z-10">
        <GlobalSidebar 
          activeFeature={getActiveFeature()} 
          onSelect={handleSelect}
          currentTheme={(theme as ThemeType) || 'default'}
          onThemeChange={(t) => setTheme(t)}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleSidebar}
        />
      </div>
      
      <main 
        className="flex-1 overflow-auto relative w-full md:pb-0 pb-16 z-10" // Add padding bottom for mobile nav
      >
        {children}
      </main>
      
      <div className="relative z-10">
        <MobileBottomNav activeFeature={getActiveFeature()} onSelect={handleSelect} unreadCount={unreadCount} />
      </div>
      
      {/* Global Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        initialMode={authMode} 
      />
      
      <Toaster />
    </div>
  );
};

export const Layout = ({ children }: LayoutProps) => {
  return (
    <LayoutProvider>
      <LayoutContent>{children}</LayoutContent>
    </LayoutProvider>
  );
};
