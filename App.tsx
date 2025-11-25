import React, { useState, useCallback, useRef, useEffect, Suspense } from 'react';
import { GlobalSidebar, FeatureType, ThemeType } from './components/GlobalSidebar';
const ComposeFeature = React.lazy(() => import('./components/ComposeFeature').then(m => ({ default: m.ComposeFeature })));
const SearchFeature = React.lazy(() => import('./components/SearchFeature').then(m => ({ default: m.SearchFeature })));
const ContentAutomationFeature = React.lazy(() => import('./components/ContentAutomationFeature').then(m => ({ default: m.ContentAutomationFeature })));
const DesignFeature = React.lazy(() => import('./components/DesignFeature').then(m => ({ default: m.DesignFeature })));
const DashboardFeature = React.lazy(() => import('./components/DashboardFeature').then(m => ({ default: m.DashboardFeature })));
const WebBuilderFeature = React.lazy(() => import('./components/WebBuilderFeature').then(m => ({ default: m.WebBuilderFeature })));
import { PublishedSite } from './components/PublishedSite';

import { AuthModal } from './components/AuthModal';
import { useAuth } from './src/hooks/useAuth';
import { RecentHistorySidebar } from './components/RecentHistorySidebar';
import { useUserActivity } from './src/hooks/useUserActivity';
import { supabase } from './src/lib/supabase';
import { GoogleGenAI } from '@google/genai';
import VoiceChat from './components/VoiceChat';
import { VoiceMode } from './src/types/voice';

// Extend Navigator interface for Web Bluetooth API
declare global {
  interface Navigator {
    bluetooth: any;
  }
}

// --- Shared Components ---
export const Logo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <img
    src="/logo-locaith.png"
    alt="Locaith Studio"
    className={className}
  />
);

// --- Feature Placeholders ---

// DesignFeature is now imported from components/DesignFeature.tsx

// --- Voice Feature Data ---
const GOOGLE_VOICES = [
  { id: 'en-US-Journey-D', name: 'Journey D', type: 'Expressive', gender: 'Male' },
  { id: 'en-US-Journey-F', name: 'Journey F', type: 'Expressive', gender: 'Female' },
  { id: 'en-US-Neural2-A', name: 'Neural2 A', type: 'Pro', gender: 'Male' },
  { id: 'en-US-Neural2-C', name: 'Neural2 C', type: 'Pro', gender: 'Female' },
  { id: 'en-US-Neural2-F', name: 'Neural2 F', type: 'Pro', gender: 'Female' },
  { id: 'en-US-Studio-M', name: 'Studio M', type: 'Studio', gender: 'Male' },
  { id: 'en-US-Studio-O', name: 'Studio O', type: 'Studio', gender: 'Female' },
  { id: 'en-US-Wavenet-A', name: 'WaveNet A', type: 'Standard', gender: 'Male' },
];


const SettingsFeature: React.FC = () => {
  const { user, signOut, signInWithGoogle, isAuthenticated } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState<any[]>([]);

  const scanDevices = async () => {
    setScanning(true);
    try {
      // Simulate scanning or actually try to access bluetooth if available
      if (navigator.bluetooth) {
        try {
          const device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: ['battery_service']
          });
          setDevices(prev => [...prev, { name: device.name || 'Unknown Device', id: device.id, type: 'Bluetooth' }]);
        } catch (err) {
          console.log("Bluetooth cancelled or failed", err);
        }
      } else {
        // Simulation for UI demo
        await new Promise(resolve => setTimeout(resolve, 1500));
        setDevices(prev => [...prev,
        { name: 'ESP32-S3-Box', id: 'dev_01', type: 'WiFi/Matter' },
        { name: 'HC-05 Module', id: 'dev_02', type: 'Bluetooth' }
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="p-10 max-w-5xl mx-auto text-gray-900 animate-fade-in-up overflow-y-auto h-full bg-white/80 backdrop-blur-md shadow-sm">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 drop-shadow-md">Settings</h2>
      <div className="bg-white/50 backdrop-blur-md rounded-xl border border-gray-200 p-6 space-y-8 shadow-sm">

        {/* Account Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Account</h3>
          <div className="flex items-center justify-between p-4 bg-gray-50/80 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <div>
                <div className="font-medium">
                  {user?.user_metadata?.full_name || 'User'}
                </div>
                <div className="text-sm text-gray-500">
                  {user?.email || 'user@example.com'}
                </div>
              </div>
            </div>
            {isAuthenticated ? (
              <button
                onClick={signOut}
                className="text-sm text-red-600 hover:text-red-700 hover:underline"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="text-sm text-brand-600 hover:text-brand-700 hover:underline"
              >
                Sign In with Google
              </button>
            )}
          </div>
        </div>

        {/* Device Management */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Connected Devices</h3>
              <p className="text-sm text-gray-500">Manage physical AI hardware (ESP32, Bluetooth speakers, IoT).</p>
            </div>
            <button
              onClick={scanDevices}
              disabled={scanning}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all flex items-center gap-2"
            >
              {scanning ? (
                <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path><path d="M5 12a7 7 0 0 1 14 0"></path></svg>
              )}
              {scanning ? 'Scanning...' : 'Add Device'}
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {devices.length === 0 ? (
              <div className="p-8 text-center text-gray-500 bg-gray-50/50">
                No devices connected. Click "Add Device" to scan for Bluetooth or WiFi hardware.
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {devices.map((dev, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                        {dev.type === 'Bluetooth' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 7 10 10-5 5V2l5 5L7 17"></path></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{dev.name}</div>
                        <div className="text-xs text-gray-500">ID: {dev.id} • {dev.type}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase">Connected</span>
                      <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* API Keys */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">API Configuration</h3>
          <div className="p-4 bg-gray-50/80 rounded-lg border border-gray-200">
            <label className="text-sm text-gray-500 block mb-2">Gemini API Key</label>
            <div className="flex gap-2">
              <input type="password" value="************************" disabled className="flex-1 bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-500" />
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50">Update</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import { LoginPage } from './components/LoginPage';

// ... (keep existing imports)

// --- Main App Shell ---

const App: React.FC = () => {
  const [subdomain, setSubdomain] = useState<string | null>(null);

  useEffect(() => {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    let sub: string | null = null;

    if (hostname === 'localhost') {
      sub = null;
    } else if (hostname.endsWith('.localhost')) {
      sub = parts[0];
    } else if (parts.length > 2) {
      if (!['www', 'app', 'studio'].includes(parts[0])) {
        sub = parts[0];
      }
    }

    if (sub) {
      setSubdomain(sub);
    }
  }, []);

  if (subdomain) {
    return <PublishedSite subdomain={subdomain} />;
  }

  const [activeFeature, setActiveFeature] = useState<FeatureType>('voice');
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('default');
  const [customBg, setCustomBg] = useState<string | null>(null);
  // const [showAuthModal, setShowAuthModal] = useState(false); // Removed in favor of full page login
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'signup'>('login');
  const [voicePrompt, setVoicePrompt] = useState<string>('');
  const [voiceTrigger, setVoiceTrigger] = useState<number>(0);
  const [voiceMode, setVoiceMode] = useState<VoiceMode>('HIDDEN');
  const [currentProject, setCurrentProject] = useState<any>(null);

  // View State for Login Page
  const [view, setView] = useState<'app' | 'login'>('app');
  const [isAuthReady, setIsAuthReady] = useState(false); // Failsafe for loading timeout

  // Auth
  const { user, signOut, isAuthenticated, loading } = useAuth();

  // Sidebar State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(256); // Default 64 * 4 = 256px

  const handleThemeChange = (theme: ThemeType, customImage?: string) => {
    setCurrentTheme(theme);
    if (customImage) {
      setCustomBg(customImage);
    }
  };

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarCollapsed(true);
      setSidebarWidth(80);
    }
  }, []);

  // Auto-navigate based on auth state
  useEffect(() => {
    if (isAuthenticated && view === 'login') {
      setView('app');
    }
  }, [isAuthenticated, view]);

  // CRITICAL: Failsafe timeout for loading screen (prevent infinite loading)
  useEffect(() => {
    if (!loading) {
      setIsAuthReady(true);
      return;
    }

    const timeout = setTimeout(() => {
      console.warn('⚠️ Loading timeout exceeded (5s) - forcing auth ready');
      setIsAuthReady(true); // Force bypass loading screen
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeout);
  }, [loading]);





  const getBackgroundClass = () => {
    if (currentTheme === 'custom' && customBg) return '';
    switch (currentTheme) {
      case 'universe': return 'bg-[url("https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")] bg-cover bg-center';
      case 'ocean': return 'bg-[url("https://images.unsplash.com/photo-1473773508845-188df298d2d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")] bg-cover bg-center';
      case 'sky': return 'bg-[url("https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")] bg-cover bg-center';
      case 'matrix': return 'bg-[url("https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")] bg-cover bg-center';
      case 'pink': return 'bg-gradient-to-br from-pink-400 via-rose-300 to-indigo-300';
      case 'coffee': return 'bg-[#2c1b18]'; // Simple solid color for vintage feel, or could use a texture
      default: return 'bg-gray-50';
    }
  };

  // Sidebar Resizing Logic
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);

  const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
    isResizingRef.current = true;
  }, []);

  const stopResizing = useCallback(() => {
    isResizingRef.current = false;
  }, []);

  const resize = useCallback((mouseMoveEvent: MouseEvent) => {
    if (isResizingRef.current) {
      const newWidth = mouseMoveEvent.clientX;
      if (newWidth > 60 && newWidth < 400) {
        setSidebarWidth(newWidth);
        if (newWidth < 80) setIsSidebarCollapsed(true);
        else setIsSidebarCollapsed(false);
      }
    }
  }, []);

  const handleNavigate = (view: any) => {
    const map: Record<string, FeatureType> = {
      BUILDER: 'web-builder',
      INTERIOR: 'design',
      COMPOSE: 'text',
      SEARCH: 'search',
      MARKETING: 'automation',
      DASHBOARD: 'dashboard',
    };
    const target = map[String(view).toUpperCase()] || 'web-builder';
    setActiveFeature(target);
  };

  const handleFillAndGenerate = (text: string) => {
    setActiveFeature('web-builder');
    setVoicePrompt(text);
    setVoiceTrigger((t) => t + 1);
  };

  useEffect(() => {
    setVoiceMode(activeFeature === 'voice' ? 'FULL' : 'WIDGET');
  }, [activeFeature]);

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);



  // Close mobile menu when selecting a feature
  const handleMobileSelect = (feature: FeatureType) => {
    setActiveFeature(feature);
    setIsMobileMenuOpen(false);
  };

  // Global loading screen while checking auth (like GPT/Gemini)
  if (loading && !isAuthReady) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Logo className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-brand-500 rounded-full animate-[loading_1.5s_ease-in-out_infinite]" style={{ width: '30%' }}></div>
          </div>
          <p className="text-sm text-gray-500 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Chỉ hiển thị LoginPage khi chủ động chuyển sang chế độ đăng nhập
  if (view === 'login') {
    return (
      <LoginPage
        onLoginSuccess={() => setView('app')}
        onBack={() => setView('app')}
      />
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden transition-colors duration-300 relative">
      {/* Auth Modal - Removed/Commented out as we use LoginPage now */}
      {/* <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialMode={authInitialMode} /> */}

      <div className="flex h-full bg-white text-gray-900 font-sans overflow-hidden transition-colors duration-300">

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Resizable Global Sidebar */}
        <div
          className={`
            fixed inset-y-0 left-0 z-50 bg-white shadow-2xl md:shadow-none transition-transform duration-300 ease-out md:relative md:translate-x-0 flex-shrink-0
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
          style={{ width: isMobile ? '280px' : (isSidebarCollapsed ? 80 : sidebarWidth) }}
        >
          <GlobalSidebar
            activeFeature={activeFeature}
            onSelect={handleMobileSelect}
            currentTheme={currentTheme}
            onThemeChange={handleThemeChange}
            isCollapsed={isMobile ? false : isSidebarCollapsed}
            onToggleCollapse={isMobile ? undefined : () => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
          {/* Resize Handle (Desktop Only) */}
          <div
            className="hidden md:block absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-brand-500/50 transition-colors z-50"
            onMouseDown={startResizing}
          />
        </div>

        {/* Main Content Area - Features now use transparent backgrounds */}
        <div
          className={`flex-1 relative overflow-hidden transition-colors duration-300 ${getBackgroundClass()}`}
          style={currentTheme === 'custom' && customBg ? { backgroundImage: `url(${customBg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        >
          {/* Reduced overlay opacity for clearer themes (bg-white/30 instead of /80) */}
          {currentTheme !== 'default' && <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px] z-0"></div>}

          <div className="relative z-10 h-full flex flex-col">
            <div className="shrink-0 h-10 md:h-12 bg-white/80 backdrop-blur flex items-center justify-between md:justify-end px-3 md:px-4 border-b border-gray-200">
              {/* Mobile Menu Trigger */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
              </button>
              {!isAuthenticated && (
                <div className="flex items-center gap-2">
                  <button onClick={() => { setAuthInitialMode('login'); setView('login'); }} className="px-3 py-1.5 bg-white/80 border border-gray-200 rounded-full text-xs text-gray-700 hover:bg-white transition-colors">Đăng nhập</button>
                  <button onClick={() => { setAuthInitialMode('signup'); setView('login'); }} className="px-3 py-1.5 bg-white/80 border border-gray-200 rounded-full text-xs text-gray-700 hover:bg-white transition-colors">Đăng ký</button>
                </div>
              )}
            </div>

            <div className="flex-1 relative overflow-hidden">
              <Suspense fallback={<div className="h-full w-full flex items-center justify-center"><div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div></div>}>
                {activeFeature === 'dashboard' && <DashboardFeature
                  onOpenProject={(project) => {
                    setCurrentProject(project);
                    setActiveFeature('web-builder');
                  }}
                  onNewProject={() => {
                    setCurrentProject(null);
                    setActiveFeature('web-builder');
                  }}
                />}
                {activeFeature === 'web-builder' && <WebBuilderFeature
                  initialPrompt={voicePrompt}
                  trigger={voiceTrigger}
                  currentProject={currentProject}
                  onProjectChange={(project) => setCurrentProject(project)}
                />}
                {activeFeature === 'design' && <DesignFeature />}
                {activeFeature === 'text' && <ComposeFeature />}
                {activeFeature === 'search' && <SearchFeature />}
                {activeFeature === 'automation' && <ContentAutomationFeature />}
                {activeFeature === 'settings' && <SettingsFeature />}
              </Suspense>
            </div>

            {voiceMode !== 'HIDDEN' && (
              <VoiceChat
                mode={voiceMode}
                setMode={setVoiceMode}
                onNavigate={handleNavigate}
                onFillAndGenerate={handleFillAndGenerate}
                lastUserInteraction={null}
              />
            )}


          </div>
        </div>

        {/* Recent History Sidebar */}
        {isAuthenticated && (
          <div className="hidden lg:block">
            <RecentHistorySidebar
              currentFeature={activeFeature}
              isCollapsed={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
