import React from 'react';
import { 
  LayoutGrid, 
  Palette, 
  FileText, 
  Search, 
  Mic, 
  MessageSquare, 
  ChevronsLeft, 
  Settings, 
  Sun,
  Rocket
} from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
  onVoiceStart: () => void;
  isVoiceActive: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, onVoiceStart, isVoiceActive }) => {
  
  const getLinkClass = (isActive: boolean) => {
    if (isActive) {
      return "flex items-center space-x-3 px-3 py-2.5 bg-blue-600 rounded-lg text-white cursor-pointer shadow-sm shadow-blue-200 transition-all";
    }
    return "flex items-center space-x-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors";
  };

  const getIconClass = (isActive: boolean) => {
    return isActive ? "w-5 h-5 text-white" : "w-5 h-5";
  };

  return (
    <div className="w-72 h-screen bg-white border-r border-gray-100 flex flex-col justify-between sticky top-0 left-0 overflow-y-auto hidden md:flex z-50">
      {/* Top Section */}
      <div className="p-4 space-y-8">
        {/* Logo */}
        <div className="flex items-center space-x-2 px-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-900 text-sm leading-tight">Locaith Studio</span>
            <span className="text-[10px] font-semibold text-blue-600 tracking-wider">PRO SUITE</span>
          </div>
        </div>

        {/* Menu Groups */}
        <div className="space-y-6">
          {/* Group 1: Create */}
          <div>
            <h3 className="px-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Create</h3>
            <nav className="space-y-1">
              <div 
                onClick={() => onViewChange('BUILDER')}
                className={getLinkClass(currentView === 'BUILDER')}
              >
                <LayoutGrid className={getIconClass(currentView === 'BUILDER')} />
                <span className="text-sm font-medium">Website Builder</span>
              </div>
              <div 
                onClick={() => onViewChange('INTERIOR')}
                className={getLinkClass(currentView === 'INTERIOR')}
              >
                <Palette className={getIconClass(currentView === 'INTERIOR')} />
                <span className="text-sm font-medium">Interior & Design</span>
              </div>
              <div 
                onClick={() => onViewChange('COMPOSE')}
                className={getLinkClass(currentView === 'COMPOSE')}
              >
                <FileText className={getIconClass(currentView === 'COMPOSE')} />
                <span className="text-sm font-medium">Compose Word</span>
              </div>
            </nav>
          </div>

          {/* Group 2: Tools */}
          <div>
            <h3 className="px-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Tools</h3>
            <nav className="space-y-1">
              <div 
                onClick={() => onViewChange('SEARCH')}
                className={getLinkClass(currentView === 'SEARCH')}
              >
                <Search className={getIconClass(currentView === 'SEARCH')} />
                <span className="text-sm font-medium">Deep Web Search</span>
              </div>
              <div 
                onClick={onVoiceStart}
                className={`${isVoiceActive ? "bg-red-50 text-red-600 border border-red-100" : "text-gray-600 hover:bg-gray-50"} flex items-center space-x-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors`}
              >
                <Mic className={`w-5 h-5 ${isVoiceActive ? "text-red-500 animate-pulse" : ""}`} />
                <span className="text-sm font-medium">Voice Chat</span>
                {isVoiceActive && <span className="ml-auto w-2 h-2 rounded-full bg-red-500 animate-ping" />}
              </div>
              <div 
                onClick={() => onViewChange('MARKETING')}
                className={getLinkClass(currentView === 'MARKETING')}
              >
                <MessageSquare className={getIconClass(currentView === 'MARKETING')} />
                <span className="text-sm font-medium">Marketing Content</span>
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-4 space-y-2 border-t border-gray-50">
        {/* Collapse */}
        <div className="flex justify-center py-2 cursor-pointer text-gray-400 hover:text-gray-600">
            <ChevronsLeft className="w-5 h-5" />
        </div>

        {/* Settings */}
        <div className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer">
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">Settings</span>
        </div>

        {/* Theme Switcher */}
        <div className="flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg">
           <div className="flex items-center space-x-2 text-gray-600">
             <Sun className="w-4 h-4" />
             <span className="text-xs font-medium">Themes</span>
           </div>
           <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        </div>

        {/* Profile */}
        <div className="flex items-center space-x-3 px-3 py-3 mt-2 hover:bg-gray-50 rounded-lg cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center border border-red-200">
             <span className="text-red-500 font-bold text-xs">G</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">Guest</span>
            <span className="text-[10px] text-gray-500">Not signed in</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;