import React, { useState } from 'react';
import { useAuth } from '../src/hooks/useAuth';

export type FeatureType = 'dashboard' | 'web-builder' | 'design' | 'text' | 'search' | 'voice' | 'automation' | 'settings';
export type ThemeType = 'default' | 'universe' | 'ocean' | 'sky' | 'matrix' | 'pink' | 'coffee' | 'custom';

interface GlobalSidebarProps {
  activeFeature: FeatureType;
  onSelect: (feature: FeatureType) => void;
  currentTheme: ThemeType;
  onThemeChange: (theme: ThemeType, customImage?: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const SidebarItem: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  isCollapsed?: boolean;
}> = ({ active, onClick, icon, label, isCollapsed }) => (
  <button
    onClick={onClick}
    title={isCollapsed ? label : ''}
    className={`w-full p-3 rounded-xl flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} transition-all duration-200 group relative ${active
        ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/20'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
  >
    {active && !isCollapsed && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
    )}
    <div className={`${active ? 'text-white' : 'text-gray-500 group-hover:text-gray-900'}`}>
      {icon}
    </div>
    {!isCollapsed && <span className="font-medium text-sm tracking-wide whitespace-nowrap">{label}</span>}
  </button>
);

export const GlobalSidebar: React.FC<GlobalSidebarProps> = ({ activeFeature, onSelect, currentTheme, onThemeChange, isCollapsed = false, onToggleCollapse }) => {
  const [showThemeModal, setShowThemeModal] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      onThemeChange('custom', url);
      setShowThemeModal(false);
    }
  };

  return (
    <div className="h-screen bg-white/90 backdrop-blur border-r border-gray-200 flex flex-col z-50 transition-colors duration-300 w-full overflow-hidden">
      {/* Studio Header */}
      <div className={`p-3 md:p-6 flex items-center transition-all ${isCollapsed ? 'flex-col justify-center gap-4' : 'justify-between'}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <img src="/logo-locaith.png" alt="Locaith Studio" className="w-8 h-8 flex-shrink-0" />
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="font-bold text-gray-900 tracking-tight whitespace-nowrap">Locaith Studio</span>
              <span className="text-[10px] text-brand-600 uppercase tracking-wider font-semibold whitespace-nowrap">Pro Suite</span>
            </div>
          )}
        </div>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className={`text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100 ${isCollapsed ? '' : ''}`}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="11 17 6 12 11 7"></polyline><polyline points="18 17 13 12 18 7"></polyline></svg>
            )}
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 px-2 md:px-4 space-y-2 overflow-y-auto scrollbar-hide py-3 md:py-4">
        {!isCollapsed && <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">Create</div>}

        <SidebarItem
          active={activeFeature === 'dashboard'}
          onClick={() => onSelect('dashboard')}
          label="Dashboard"
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>}
          isCollapsed={isCollapsed}
        />

        <SidebarItem
          active={activeFeature === 'web-builder'}
          onClick={() => onSelect('web-builder')}
          label="Website Builder"
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>}
          isCollapsed={isCollapsed}
        />

        <SidebarItem
          active={activeFeature === 'design'}
          onClick={() => onSelect('design')}
          label="Interior & Design"
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5"></circle><circle cx="17.5" cy="10.5" r=".5"></circle><circle cx="8.5" cy="7.5" r=".5"></circle><circle cx="6.5" cy="12.5" r=".5"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path></svg>}
          isCollapsed={isCollapsed}
        />

        <SidebarItem
          active={activeFeature === 'text'}
          onClick={() => onSelect('text')}
          label="Compose Word"
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>}
          isCollapsed={isCollapsed}
        />

        {!isCollapsed && <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2 mt-6">Tools</div>}
        {isCollapsed && <div className="h-4"></div>}

        <SidebarItem
          active={activeFeature === 'search'}
          onClick={() => onSelect('search')}
          label="Deep Web Search"
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>}
          isCollapsed={isCollapsed}
        />

        <SidebarItem
          active={activeFeature === 'voice'}
          onClick={() => onSelect('voice')}
          label="Voice Chat"
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>}
          isCollapsed={isCollapsed}
        />

        <SidebarItem
          active={activeFeature === 'automation'}
          onClick={() => onSelect('automation')}
          label="Content & Automation"
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>}
          isCollapsed={isCollapsed}
        />
      </div>

      {/* Bottom Section */}
      <div className="p-2 md:p-4 border-t border-gray-200 space-y-2 bg-gray-50/50 transition-colors duration-300 relative">
        <SidebarItem
          active={activeFeature === 'settings'}
          onClick={() => onSelect('settings')}
          label="Settings"
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>}
          isCollapsed={isCollapsed}
        />

        {/* Theme Trigger */}
        <div
          onClick={() => setShowThemeModal(true)}
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2 text-gray-500 hover:text-gray-900 bg-white rounded-lg border border-gray-200 cursor-pointer transition-all`}
        >
          {isCollapsed ? (
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-brand-500 to-accent-500"></div>
          ) : (
            <>
              <span className="text-xs font-medium flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                Themes
              </span>
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-brand-500 to-accent-500"></div>
            </>
          )}
        </div>

        {/* Theme Modal Popover */}
        {showThemeModal && (
          <div className="absolute bottom-full left-0 w-64 mb-2 bg-white border border-gray-200 rounded-xl shadow-2xl p-3 z-50 animate-fade-in-up">
            <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-100">
              <span className="text-xs font-bold text-gray-900">Appearance</span>
              <button onClick={(e) => { e.stopPropagation(); setShowThemeModal(false); }} className="text-gray-400 hover:text-gray-900">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-1 px-1">Colors</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'default', name: 'Minimal', color: 'bg-gray-100' },
                { id: 'universe', name: 'Universe', color: 'bg-gradient-to-br from-indigo-900 to-purple-900' },
                { id: 'ocean', name: 'Ocean', color: 'bg-gradient-to-br from-blue-900 to-cyan-900' },
                { id: 'sky', name: 'Sky', color: 'bg-gradient-to-b from-blue-400 to-white' },
                { id: 'matrix', name: 'Matrix', color: 'bg-black border border-green-900' },
                { id: 'pink', name: 'Dreamy', color: 'bg-gradient-to-br from-pink-400 to-rose-300' },
                { id: 'coffee', name: 'Coffee', color: 'bg-[#3e2723]' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => { onThemeChange(t.id as ThemeType); setShowThemeModal(false); }}
                  className={`h-12 rounded-lg ${t.color} flex items-center justify-center text-[10px] text-white font-medium relative overflow-hidden ring-1 ring-transparent hover:ring-brand-500 transition-all`}
                >
                  {currentTheme === t.id && <div className="absolute inset-0 bg-white/20 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>}
                  <span className="relative z-10 shadow-sm drop-shadow-md">{t.name}</span>
                </button>
              ))}
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100">
              <label className="flex items-center justify-center gap-2 w-full py-2 bg-gray-100 hover:bg-gray-200 text-xs font-medium text-gray-600 rounded-lg cursor-pointer transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                Upload Image
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              </label>
            </div>
          </div>
        )}

        {/* User Profile (real data) */}
        <div className={`pt-2 mt-2 border-t border-gray-200 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          {isAuthenticated && user?.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full flex-shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 p-[1px] flex-shrink-0">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <span className="text-xs font-bold text-gray-900">{user?.email?.charAt(0)?.toUpperCase() || 'G'}</span>
              </div>
            </div>
          )}
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-medium text-gray-900 whitespace-nowrap">
                {isAuthenticated ? (user?.user_metadata?.full_name || user?.email || 'User') : 'Guest'}
              </span>
              <span className="text-[10px] text-gray-500 whitespace-nowrap">
                {isAuthenticated ? (user?.email || '') : 'Not signed in'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
