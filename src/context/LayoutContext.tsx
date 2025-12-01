import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LayoutContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (isOpen: boolean) => void;
  authMode: 'login' | 'signup';
  setAuthMode: (mode: 'login' | 'signup') => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const useLayoutContext = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayoutContext must be used within a LayoutProvider');
  }
  return context;
};

interface LayoutProviderProps {
  children: ReactNode;
}

export const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const toggleSidebar = () => setIsCollapsed(prev => !prev);

  return (
    <LayoutContext.Provider value={{ 
      isCollapsed, 
      setIsCollapsed, 
      toggleSidebar,
      isAuthModalOpen,
      setAuthModalOpen,
      authMode,
      setAuthMode
    }}>
      {children}
    </LayoutContext.Provider>
  );
};
