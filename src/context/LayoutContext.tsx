import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface LayoutContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (isOpen: boolean) => void;
  authMode: 'login' | 'signup';
  setAuthMode: (mode: 'login' | 'signup') => void;
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  refreshUnreadCount: () => void;
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
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = React.useCallback(async () => {
    if (!user) return;
    
    // Simple debounce/throttle could be added here if needed, 
    // but AbortController is better for cancelling stale requests.
    // However, Supabase JS client doesn't support AbortSignal directly in all methods yet.
    // We will use a flag to ignore results of stale requests.
    
    try {
      // Use RPC for optimized fetching
      const { data: count, error } = await supabase.rpc('get_total_unread_count');

      if (error) {
          // Fallback to old method if RPC fails (e.g. script not run yet)
          console.warn('RPC get_total_unread_count failed, falling back to legacy method:', error);
          
          // 1. Direct Messages
          const { count: dmCount, error: dmError } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('receiver_id', user.id)
            .eq('is_read', false);

          if (dmError) throw dmError;

          // 2. Group Messages (Legacy loop)
          const { data: myGroups } = await supabase.from('groups').select('id');
          let groupUnread = 0;
          if (myGroups && myGroups.length > 0) {
              const chunkSize = 5;
              for (let i = 0; i < myGroups.length; i += chunkSize) {
                  const chunk = myGroups.slice(i, i + chunkSize);
                  const promises = chunk.map(async (g) => {
                      const lastRead = localStorage.getItem(`group_read_${g.id}_${user.id}`);
                      if (lastRead) {
                          const { count } = await supabase
                            .from('messages')
                            .select('*', { count: 'exact', head: true })
                            .eq('group_id', g.id)
                            .gt('created_at', lastRead);
                          return count || 0;
                      }
                      return 0;
                  });
                  const counts = await Promise.all(promises);
                  groupUnread += counts.reduce((a, b) => a + b, 0);
              }
          }
          setUnreadCount((dmCount || 0) + groupUnread);
      } else {
          setUnreadCount(count || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [user]);

  // Fetch unread count on mount and subscribe to changes
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    fetchUnreadCount();

    // Realtime subscription for DMs
    const dmChannel = supabase.channel('global_unread_count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    // Realtime subscription for Groups
    // We need to fetch groups first to subscribe
    let groupChannels: any[] = [];
    
    const subscribeToGroups = async () => {
        const { data: myGroups } = await supabase.from('groups').select('id');
        if (myGroups) {
            myGroups.forEach(g => {
                const ch = supabase.channel(`group_unread_${g.id}`)
                    .on('postgres_changes', {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'messages',
                        filter: `group_id=eq.${g.id}`
                    }, (payload) => {
                         if (payload.new.sender_id !== user.id) {
                             fetchUnreadCount();
                         }
                    })
                    .subscribe();
                groupChannels.push(ch);
            });
        }
    };
    
    subscribeToGroups();

    return () => {
      supabase.removeChannel(dmChannel);
      groupChannels.forEach(ch => supabase.removeChannel(ch));
    };
  }, [user, fetchUnreadCount]);

  const toggleSidebar = () => setIsCollapsed(prev => !prev);

  return (
    <LayoutContext.Provider value={{ 
      isCollapsed, 
      setIsCollapsed, 
      toggleSidebar,
      isAuthModalOpen,
      setAuthModalOpen,
      authMode,
      setAuthMode,
      unreadCount,
      setUnreadCount,
      refreshUnreadCount: fetchUnreadCount
    }}>
      {children}
    </LayoutContext.Provider>
  );
};
