import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MessageCircle, 
  Phone, 
  Video, 
  MoreHorizontal, 
  Image as ImageIcon, 
  Paperclip, 
  Smile, 
  Send, 
  Users, 
  Bell, 
  BellOff, 
  Pin, 
  UserPlus, 
  FileText, 
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Layout,
  Clock,
  MoreVertical,
  Filter,
  Loader2,
  LogOut,
  Settings,
  Contact as ContactIcon,
  Check,
  Plus,
  Link,
  Shield,
  AlertTriangle,
  Trash2,
  EyeOff,
  Sticker,
  X,
  Calendar,
  ArrowUpDown,
  Info,
  UserCheck,
  UserMinus,
  Mic,
  Cake
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

import { supabase } from '../src/lib/supabase';
import { useAuth } from '../src/hooks/useAuth';
import { useLayoutContext } from '../src/context/LayoutContext';

// --- Types matching Supabase Schema ---

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
  role: string;
  status: string;
  last_seen: string;
}

interface Contact {
  id: string; // This is the contact_id (user_id of the other person)
  profile: Profile;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  status: 'accepted' | 'pending';
  is_pinned?: boolean;
  muted_until?: number;
}

interface MessageReaction {
  id: number;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  type: 'text' | 'image' | 'link' | 'file' | 'sticker' | 'contact';
  file_url?: string;
  is_read: boolean;
  priority?: 'normal' | 'important' | 'urgent';
  message_reactions?: MessageReaction[];
}

export const SocialChatFeature = () => {
  const { user } = useAuth();
  const { setAuthModalOpen, setUnreadCount, refreshUnreadCount, unreadCount } = useLayoutContext();
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageCache, setMessageCache] = useState<Record<string, Message[]>>({}); // Cache messages by contact ID
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [rightSidebarView, setRightSidebarView] = useState<'info' | 'search'>('info');
  
  // View State
  const [mainView, setMainView] = useState<'chat' | 'friends'>('chat');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [friendSearchQuery, setFriendSearchQuery] = useState('');
  const [friendSort, setFriendSort] = useState<'name-asc' | 'name-desc'>('name-asc');
  const [selectedAlphaFilter, setSelectedAlphaFilter] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [viewingProfile, setViewingProfile] = useState<Profile | null>(null);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);

  // Feature States
  const [pinnedContacts, setPinnedContacts] = useState<Set<string>>(new Set());
  const [mutedContacts, setMutedContacts] = useState<Record<string, number>>({}); // id -> timestamp (expiry)
  const [isMuteDialogOpen, setIsMuteDialogOpen] = useState(false);
  const [muteDuration, setMuteDuration] = useState('1h');
  const [friendTab, setFriendTab] = useState<'friends' | 'groups'>('friends');
  
  // Appointment State
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const [appointments, setAppointments] = useState<{id: string, title: string, time: string, contactId: string}[]>([]);
  const [newAppointmentTitle, setNewAppointmentTitle] = useState('');
  const [newAppointmentTime, setNewAppointmentTime] = useState('');
  const [appointmentRepeat, setAppointmentRepeat] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);

  // Media View States
  const [showAllImages, setShowAllImages] = useState(false);
  const [showAllFiles, setShowAllFiles] = useState(false);
  const [showAllLinks, setShowAllLinks] = useState(false);

  // Group States
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Realtime States
  const [typingUsers, setTypingUsers] = useState<Record<string, 'desktop' | 'mobile' | null>>({});
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Input Action States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isStickerOpen, setIsStickerOpen] = useState(false);
  const [isContactCardOpen, setIsContactCardOpen] = useState(false);
  const [selectedContactToShare, setSelectedContactToShare] = useState<string | null>(null);
  const [messagePriority, setMessagePriority] = useState<'normal' | 'important' | 'urgent'>('normal');

  const stickers = [
    "👍", "❤️", "😂", "😮", "😢", "😡", "🎉", "🔥", 
    "👋", "🙏", "🤝", "💪", "🧠", "💡", "🚀", "💯"
  ];

  const contactsRef = useRef<Contact[]>([]); // Keep track of contacts for event listeners
  const selectedContactIdRef = useRef<string | null>(null);
  const activeChannelRef = useRef<any>(null);

  // Helper to clean URLs
  const cleanUrl = (url: string | undefined) => {
    if (!url) return undefined;
    return url.trim();
  };

  // Handle Reactions
  const handleReaction = async (messageId: string, emoji: string) => {
      if (!user) return;
      
      const currentMessage = messages.find(m => m.id === messageId);
      if (!currentMessage) return;

      const existingReaction = currentMessage.message_reactions?.find(r => r.user_id === user.id && r.emoji === emoji);

      // Optimistic update
      setMessages(prev => prev.map(m => {
          if (m.id === messageId) {
              let newReactions = m.message_reactions || [];
              if (existingReaction) {
                  // Remove reaction
                  newReactions = newReactions.filter(r => !(r.user_id === user.id && r.emoji === emoji));
              } else {
                  // Add reaction
                  newReactions = [...newReactions, {
                      id: Date.now(), 
                      message_id: messageId,
                      user_id: user.id,
                      emoji: emoji,
                      created_at: new Date().toISOString()
                  }];
              }
              return { ...m, message_reactions: newReactions };
          }
          return m;
      }));

      try {
          let error;
          if (existingReaction) {
             const { error: delError } = await supabase.from('message_reactions')
                .delete()
                .eq('message_id', messageId)
                .eq('user_id', user.id)
                .eq('emoji', emoji);
             error = delError;
          } else {
              const { error: insError } = await supabase.from('message_reactions').insert({
                  message_id: messageId,
                  user_id: user.id,
                  emoji: emoji
              });
              error = insError;
          }

          if (error) throw error;
      } catch (error) {
          console.error('Error handling reaction:', error);
          // Revert optimistic update
          setMessages(prev => prev.map(m => {
              if (m.id === messageId) {
                  let newReactions = m.message_reactions || [];
                  if (existingReaction) {
                      // Re-add removed reaction
                      newReactions = [...newReactions, existingReaction];
                  } else {
                      // Remove added reaction (find by emoji and user)
                      newReactions = newReactions.filter(r => !(r.user_id === user.id && r.emoji === emoji));
                  }
                  return { ...m, message_reactions: newReactions };
              }
              return m;
          }));
          toast.error('Không thể thả cảm xúc. Vui lòng thử lại.');
      }
  };

  // Sync refs
  useEffect(() => {
    contactsRef.current = contacts;
    
    // Sync global unread count with local contacts state to ensure consistency
    // This fixes the issue where sidebar badge differs from chat list or persists incorrectly
    const totalUnread = contacts.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
    setUnreadCount(totalUnread);
  }, [contacts, setUnreadCount]);

  useEffect(() => {
    selectedContactIdRef.current = selectedContactId;
    
    // Mark as read when selecting a contact
    if (selectedContactId) {
        // 1. Optimistic local update
        setContacts(prev => prev.map(c => 
            c.id === selectedContactId ? { ...c, unreadCount: 0 } : c
        ));

        // 2. Trigger backend update immediately
        const isGroup = contacts.find(c => c.id === selectedContactId)?.profile.role === 'Group';
        if (isGroup) {
             localStorage.setItem(`group_read_${selectedContactId}_${user?.id}`, new Date().toISOString());
             supabase.rpc('mark_group_read', { _group_id: selectedContactId });
        } else {
             supabase.rpc('mark_dm_read', { _sender_id: selectedContactId });
        }
    }
  }, [selectedContactId, user]);

  // Sync total unread count to global context (Moved to contacts useEffect)
  // const totalUnread = contacts.reduce((sum, contact) => sum + (contact.unreadCount || 0), 0);
  
  // --- 1. Fetch Contacts (Defined as function to be reusable) ---
  const fetchContacts = React.useCallback(async () => {
    if (!user) return;
    // Don't show loading if we already have contacts (silent refresh)
    if (contactsRef.current.length === 0) {
        setIsLoadingContacts(true);
    }
    try {
      // 1. Fetch direct contacts
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select(`
          contact_id,
          is_pinned,
          muted_until,
          profiles:contact_id (id, full_name, avatar_url, role, status, last_seen)
        `)
        .eq('user_id', user.id);

      if (contactsError) throw contactsError;

      // 2. Fetch groups
      const { data: groupsData, error: groupsError } = await supabase
          .from('groups')
          .select('*');

      // 3. Fetch unread counts (DM) via RPC
      const { data: unreadData, error: unreadError } = await supabase.rpc('get_dm_unread_counts');

      const unreadMap: Record<string, number> = {};
      if (unreadData) {
          unreadData.forEach((item: any) => {
              unreadMap[item.sender_id] = Number(item.count);
          });
      } else if (unreadError) {
          console.warn('RPC get_dm_unread_counts failed:', unreadError);
      }

      // 3.5 Fetch unread counts (Groups) via RPC
      const { data: groupUnreadCounts, error: groupUnreadError } = await supabase.rpc('get_group_unread_counts');
      const groupUnreadMap: Record<string, number> = {};
      if (groupUnreadCounts) {
          groupUnreadCounts.forEach((item: any) => {
              groupUnreadMap[item.group_id] = Number(item.count);
          });
      } else if (groupUnreadError) {
          // console.warn('RPC get_group_unread_counts failed:', groupUnreadError);
      }

      let allContacts: Contact[] = [];
      const pinnedSet = new Set<string>();
      const mutedObj: Record<string, number> = {};

      // Process Contacts
      if (contactsData) {
          allContacts = contactsData
            .filter((item: any) => item.profiles) // Filter out contacts with missing profiles to prevent crashes
            .map((item: any) => {
              if (item.is_pinned) pinnedSet.add(item.contact_id);
              if (item.muted_until) mutedObj[item.contact_id] = item.muted_until;

              return {
                      id: item.contact_id,
                      profile: item.profiles,
                      // Ensure unread count is 0 if this is the currently selected contact (Client-side override)
                      unreadCount: item.contact_id === selectedContactIdRef.current ? 0 : (unreadMap[item.contact_id] || 0),
                      status: 'accepted',
                      is_pinned: item.is_pinned,
                      muted_until: item.muted_until
                  };
          });
      }
      
      // Update local states for pin and mute
      setPinnedContacts(pinnedSet);
      setMutedContacts(mutedObj);

      // Process Groups
      if (groupsData && !groupsError) {
           const groupContacts = groupsData.map((group: any) => {
               // Use RPC result for unread count
               let unread = groupUnreadMap[group.id] || 0;

               return {
                   id: group.id,
                   profile: {
                       id: group.id,
                       full_name: group.name,
                       avatar_url: group.avatar_url,
                       role: 'Group',
                       status: 'online',
                       last_seen: new Date().toISOString()
                   },
                   unreadCount: unread,
                   status: 'accepted'
               };
           });

           allContacts = [...groupContacts, ...allContacts]; // Groups on top
      }

      setContacts(allContacts);
      
      // 4. Fetch Last Messages for sorting
      // We fetch the most recent messages for the user to populate the sidebar preview
      try {
          const { data: recentMessages, error: msgError } = await supabase
              .from('messages')
              .select('id, content, created_at, sender_id, receiver_id, group_id, type')
              .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id},group_id.not.is.null`) 
              .order('created_at', { ascending: false })
              .limit(100);

          if (recentMessages && !msgError) {
              setContacts(prev => prev.map(contact => {
                  // Find the latest message for this contact
                  const lastMsg = recentMessages.find(m => 
                      (m.group_id === contact.id) || 
                      (m.sender_id === contact.id && m.receiver_id === user.id) || 
                      (m.sender_id === user.id && m.receiver_id === contact.id)
                  );
                  
                  if (lastMsg) {
                      return {
                          ...contact,
                          lastMessage: lastMsg.type === 'text' ? lastMsg.content : `[${lastMsg.type}]`,
                          lastMessageTime: lastMsg.created_at
                      };
                  }
                  return contact;
              }));
          }
      } catch (e) {
          console.error("Error fetching recent messages:", e);
      }

      // Removed auto-select to ensure list view is shown first on mobile/navigation
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setIsLoadingContacts(false);
    }
  }, [user]);

  useEffect(() => {
    fetchContacts();
    
    // Subscribe to new contacts
    const channel = supabase.channel('contacts_list')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts', filter: `user_id=eq.${user?.id}` }, () => {
            fetchContacts();
        })
        .subscribe();

    // Subscribe to messages to update unread counts and contact list realtime
    const messageChannel = supabase.channel('global_messages_listener')
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages', 
            filter: `receiver_id=eq.${user?.id}` 
        }, async (payload) => {
            const newMsg = payload.new as Message;
            const senderId = newMsg.sender_id;

            // Check if contact exists using ref to avoid stale closure
            const exists = contactsRef.current.some(c => c.id === senderId);

            if (!exists) {
                // New conversation! Fetch profile and add to list optimistically
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', senderId)
                    .single();
                
                if (profile) {
                    const newContact: Contact = {
                        id: senderId,
                        profile: profile,
                        unreadCount: 1,
                        lastMessage: newMsg.type === 'text' ? newMsg.content : `[${newMsg.type}]`,
                        lastMessageTime: newMsg.created_at,
                        status: 'accepted'
                    };
                    
                    setContacts(prev => {
                        // Prevent duplicates in case of race conditions
                        if (prev.some(c => c.id === senderId)) return prev;
                        return [newContact, ...prev];
                    });
                    setUnreadCount(prev => prev + 1);
                    toast.info(`Tin nhắn mới từ ${profile.full_name}`);
                } else {
                    // Fallback if profile fetch fails
                    fetchContacts();
                }
            } else {
                // Optimistic update for existing contact
                setContacts(prev => {
                    const idx = prev.findIndex(c => c.id === senderId);
                    if (idx === -1) return prev; // Should not happen given exists check but safe
                    
                    const contact = prev[idx];
                    const isCurrentChat = senderId === selectedContactIdRef.current;
                    
                    const updatedContact = {
                        ...contact,
                        lastMessage: newMsg.type === 'text' ? newMsg.content : `[${newMsg.type}]`,
                        lastMessageTime: newMsg.created_at,
                        unreadCount: isCurrentChat ? 0 : (contact.unreadCount || 0) + 1
                    };
                    
                    const newList = [...prev];
                    newList.splice(idx, 1);
                    newList.unshift(updatedContact);
                    return newList;
                });

                // Update global unread count
                if (senderId !== selectedContactIdRef.current) {
                    setUnreadCount(prev => prev + 1);
                } else {
                    // Mark read in backend if we are in the chat
                    supabase.rpc('mark_dm_read', { _sender_id: senderId });
                }
            }
        })
        .subscribe();

    // Subscribe to group changes (memberships and details)
    const groupChannel = supabase.channel('group_changes')
        .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'group_members',
            filter: `user_id=eq.${user?.id}`
        }, () => {
            fetchContacts();
        })
        .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'groups'
        }, () => {
             // We can't easily filter groups by membership here without complex RLS or ID list, 
             // but fetchContacts will filter them.
             fetchContacts();
        })
        .subscribe();
        
    return () => { 
        supabase.removeChannel(channel); 
        supabase.removeChannel(messageChannel);
        supabase.removeChannel(groupChannel);
    };
  }, [user, fetchContacts]);

  // Sync contacts when global unread count changes - REMOVED to prevent infinite loop
  // useEffect(() => {
  //     fetchContacts();
  // }, [unreadCount, fetchContacts]);

  // --- 2. Fetch Messages & Realtime Chat ---
  useEffect(() => {
    if (!user || !selectedContactId) return;

    // Optimistic Unread Count Update
    const contactIndex = contacts.findIndex(c => c.id === selectedContactId);
    if (contactIndex !== -1) {
        const contact = contacts[contactIndex];
        if (contact.unreadCount > 0) {
            // Immediately reduce global unread count
            setUnreadCount(prev => Math.max(0, prev - contact.unreadCount));
            
            // Update local contacts state immediately
            setContacts(prev => prev.map(c => 
                c.id === selectedContactId ? { ...c, unreadCount: 0 } : c
            ));
        }
    }



    const fetchMessages = async () => {
      // Use cache if available for instant switch
      if (messageCache[selectedContactId]) {
          setMessages(messageCache[selectedContactId]);
          setIsLoadingMessages(false);
      } else {
          setIsLoadingMessages(true);
      }

      try {
        const isGroup = selectedContact?.profile.role === 'Group';
        // Fix PGRST200: Fetch reactions separately to avoid missing foreign key relationship error
        let query = supabase.from('messages').select('*');

        if (isGroup) {
            query = query.eq('group_id', selectedContactId);
        } else {
            query = query.or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedContactId}),and(sender_id.eq.${selectedContactId},receiver_id.eq.${user.id})`);
        }

        const { data, error } = await query.order('created_at', { ascending: true });

        if (error) throw error;
        
        let validMessages = data || [];

        // Manually fetch reactions
        if (validMessages.length > 0) {
            const messageIds = validMessages.map(m => m.id);
            const { data: reactions } = await supabase
                .from('message_reactions')
                .select('*')
                .in('message_id', messageIds);
                
            if (reactions) {
                validMessages = validMessages.map(m => ({
                    ...m,
                    message_reactions: reactions.filter(r => r.message_id === m.id)
                }));
            }
        }

        setMessages(validMessages);
        
        // Update Cache
        setMessageCache(prev => ({
            ...prev,
            [selectedContactId]: validMessages
        }));

        // Mark as read (Backend)
        if (isGroup) {
            localStorage.setItem(`group_read_${selectedContactId}_${user.id}`, new Date().toISOString());
            supabase.rpc('mark_group_read', { _group_id: selectedContactId }).then(({ error }) => {
                if (error) console.warn("RPC mark_group_read failed:", error);
            });
        } else {
             // Use RPC to bypass RLS restrictions and ensure server-side update
             supabase.rpc('mark_dm_read', { _sender_id: selectedContactId }).then(({ error }) => {
                 if (error) console.warn("RPC mark_dm_read failed:", error);
             });
        }
        
        // Sync with backend eventually, but we already did optimistic update
        // fetchContacts(); // Optional: might be too heavy to call every time
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setIsLoadingMessages(false);
        scrollToBottom();
      }
    };

    fetchMessages();

    // Subscribe to new messages using a consistent channel name
    const isGroup = selectedContact?.profile.role === 'Group';
    const channelName = isGroup ? `group:${selectedContactId}` : `chat:${[user.id, selectedContactId].sort().join('_')}`;
    
    const channel = supabase.channel(channelName)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: isGroup ? `group_id=eq.${selectedContactId}` : `receiver_id=eq.${user.id}`
      }, async (payload) => {
        const newMsg = payload.new as Message;
        
        const isRelevant = isGroup ? newMsg.group_id === selectedContactId : newMsg.sender_id === selectedContactId;

        if (isRelevant) {
          // Stop typing indicator immediately
          setTypingUsers(prev => {
              const newPrev = { ...prev };
              delete newPrev[newMsg.sender_id];
              return newPrev;
          });

          setMessages(prev => {
              if (prev.some(m => m.id === newMsg.id)) return prev;
              const updated = [...prev, newMsg];
              
              // Update Cache as well
              setMessageCache(cache => ({
                  ...cache,
                  [selectedContactId]: updated
              }));
              
              return updated;
          });
          scrollToBottom();
          
          if (isGroup) {
              localStorage.setItem(`group_read_${selectedContactId}_${user.id}`, new Date().toISOString());
              supabase.rpc('mark_group_read', { _group_id: selectedContactId });
          } else {
              supabase.rpc('mark_dm_read', { _sender_id: selectedContactId });
          }
          // No need to refresh global unread count as we are viewing it (it remains 0 for this chat)
        }
      })
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `sender_id=eq.${user.id}` // Listen for my own messages
      }, (payload) => {
        const newMsg = payload.new as Message;
        const isRelevant = isGroup ? newMsg.group_id === selectedContactId : newMsg.receiver_id === selectedContactId;

        if (isRelevant) {
           setMessages(prev => {
               if (prev.some(m => m.id === newMsg.id)) return prev;
               
               // Optimistic matching
               const optimisticMsgIndex = prev.findIndex(m => 
                   m.id.length < 20 && // Assuming real UUIDs are longer than 20 chars (36 chars) and optimistic IDs are timestamps (13 chars)
                   m.content === newMsg.content
               );
               
               let newMessages;
               if (optimisticMsgIndex !== -1) {
                   newMessages = [...prev];
                   newMessages[optimisticMsgIndex] = newMsg;
               } else {
                   newMessages = [...prev, newMsg];
               }

               // Update Cache
               setMessageCache(cache => ({
                   ...cache,
                   [selectedContactId]: newMessages
               }));

               return newMessages;
           });
           scrollToBottom();
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `sender_id=eq.${user.id}`
      }, (payload) => {
          const updatedMsg = payload.new as Message;
          setMessages(prev => {
              const updated = prev.map(m => m.id === updatedMsg.id ? updatedMsg : m);
              // Update Cache
               setMessageCache(cache => ({
                   ...cache,
                   [selectedContactId]: updated
               }));
              return updated;
          });
      })
      .on('broadcast', { event: 'typing' }, (payload) => {
          const { userId, isTyping, device } = payload.payload;
          if (userId === selectedContactId) {
              if (isTyping === false) {
                  setTypingUsers(prev => {
                      const newPrev = { ...prev };
                      delete newPrev[userId];
                      return newPrev;
                  });
              } else {
                  setTypingUsers(prev => ({
                      ...prev,
                      [userId]: device || 'desktop'
                  }));
                  
                  // Auto clear after 32s just in case "stop" event is missed (slightly longer than sender timeout)
                  setTimeout(() => {
                      setTypingUsers(prev => {
                          const newPrev = { ...prev };
                          delete newPrev[userId];
                          return newPrev;
                      });
                  }, 32000);
              }
          }
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'message_reactions' 
      }, (payload) => {
          // Check if reaction belongs to current messages
          // Note: payload.new/old might not have message_id in some delete cases depending on replica identity, 
          // but typically for standard deletes we get old record if identity is set.
          // For safety, we just update if we find the message.
          
          setMessages(prev => {
              const msgId = (payload.new as any)?.message_id || (payload.old as any)?.message_id;
              if (!msgId) return prev;
              
              const messageExists = prev.some(m => m.id === msgId);
              if (!messageExists) return prev;

              if (payload.eventType === 'INSERT') {
                  const newReaction = payload.new as MessageReaction;
                  return prev.map(msg => {
                      if (msg.id === newReaction.message_id) {
                          const currentReactions = msg.message_reactions || [];
                          if (currentReactions.some(r => r.id === newReaction.id)) return msg;
                          return {
                              ...msg,
                              message_reactions: [...currentReactions, newReaction]
                          };
                      }
                      return msg;
                  });
              } else if (payload.eventType === 'DELETE') {
                  const oldReactionId = (payload.old as any).id;
                  return prev.map(msg => {
                      if (msg.id === msgId && msg.message_reactions?.some(r => r.id === oldReactionId)) {
                          return {
                              ...msg,
                              message_reactions: msg.message_reactions.filter(r => r.id !== oldReactionId)
                          };
                      }
                      return msg;
                  });
              }
              return prev;
          });
      })
      .subscribe();
      
    activeChannelRef.current = channel;

    return () => { 
        supabase.removeChannel(channel); 
        activeChannelRef.current = null;
    };
  }, [user, selectedContactId]);

  // --- 2.5 Global Message Listener (New Conversations) ---
  // Merged into the main subscription above to avoid duplicate listeners


  // --- 2.6 Fetch Appointments ---
  useEffect(() => {
    if (!user || !selectedContactId) return;

    const fetchAppointments = async () => {
        const isGroup = selectedContact?.profile.role === 'Group';
        let query = supabase.from('appointments').select('*');

        if (isGroup) {
            query = query.eq('group_id', selectedContactId);
        } else {
            // Fix: Trim IDs to avoid 400 Bad Request due to whitespace
            const uid = user.id?.trim();
            const cid = selectedContactId?.trim();
            
            if (uid && cid) {
                // Fix: use created_by instead of user_id for appointments table
                query = query.or(`and(created_by.eq.${uid},contact_id.eq.${cid}),and(created_by.eq.${cid},contact_id.eq.${uid})`);
            }
        }

        const { data, error } = await query.order('time', { ascending: true });

        if (!error && data) {
            setAppointments(data.map(item => ({
                id: item.id.toString(),
                title: item.title,
                time: item.time,
                contactId: item.group_id || item.contact_id,
                repeat: item.repeat_pattern
            })));
        }
    };

    fetchAppointments();
  }, [user, selectedContactId]);

  // --- 2.7 Fetch Friend Requests ---
  useEffect(() => {
    if (!user) return;
    
    const fetchRequests = async () => {
        // Fetch incoming
        const { data: incoming, error } = await supabase
            .from('friend_requests')
            .select(`
                id,
                sender:sender_id (id, full_name, avatar_url)
            `)
            .eq('receiver_id', user.id)
            .eq('status', 'pending');
        
        if (error) {
            console.error('Error fetching friend requests:', error);
        }

        if (incoming) setIncomingRequests(incoming);

        // Fetch sent (to update UI buttons)
        const { data: sent } = await supabase
            .from('friend_requests')
            .select('receiver_id')
            .eq('sender_id', user.id)
            .eq('status', 'pending');
            
        if (sent) {
            setSentRequests(new Set(sent.map(r => r.receiver_id)));
        }
    };
    
    fetchRequests();

    // Subscribe to friend_requests
    const channel = supabase.channel(`friend_requests_${user.id}`)
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'friend_requests',
            filter: `receiver_id=eq.${user.id}`
        }, (payload) => {
            fetchRequests();
            toast.info('Bạn có lời mời kết bạn mới!');
        })
        .on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'friend_requests',
            filter: `sender_id=eq.${user.id}`
        }, (payload) => {
            fetchRequests();
            if (payload.new.status === 'accepted') {
                toast.success('Lời mời kết bạn đã được chấp nhận!');
                fetchContacts();
            }
        })
        .on('postgres_changes', {
            event: 'DELETE',
            schema: 'public',
            table: 'friend_requests'
        }, () => {
            fetchRequests();
        })
        .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleAcceptRequest = async (requestId: string) => {
      try {
          const { error } = await supabase.rpc('accept_friend_request', { request_id: requestId });
          if (error) throw error;
          
          toast.success('Đã chấp nhận lời mời');
          
          // Remove from local state immediately
          const req = incomingRequests.find(r => r.id === requestId);
          setIncomingRequests(prev => prev.filter(r => r.id !== requestId));
          
          // Add to contacts
          if (req) {
             const { data: profile } = await supabase.from('profiles').select('*').eq('id', req.sender.id).single();
             if (profile) {
                 const newContact: Contact = {
                      id: profile.id,
                      profile: profile,
                      unreadCount: 0,
                      status: 'accepted'
                 };
                 setContacts(prev => [newContact, ...prev]);
             }
          }
      } catch (err) {
          console.error(err);
          toast.error('Lỗi khi chấp nhận');
      }
  };

  const handleRejectRequest = async (requestId: string) => {
      try {
          const { error } = await supabase
              .from('friend_requests')
              .delete()
              .eq('id', requestId);

          if (error) throw error;
          
          toast.success('Đã từ chối lời mời');
          setIncomingRequests(prev => prev.filter(r => r.id !== requestId));
      } catch (err) {
          console.error(err);
          toast.error('Lỗi khi từ chối');
      }
  };

  const handleCancelRequest = async (receiverId: string) => {
      if (!user) return;
      try {
          const { error } = await supabase
              .from('friend_requests')
              .delete()
              .eq('sender_id', user.id)
              .eq('receiver_id', receiverId)
              .eq('status', 'pending');

          if (error) throw error;
          
          toast.success('Đã hủy lời mời kết bạn');
          setSentRequests(prev => {
              const newSet = new Set(prev);
              newSet.delete(receiverId);
              return newSet;
          });
      } catch (err) {
          console.error(err);
          toast.error('Lỗi khi hủy lời mời');
      }
  };



  const handleStartChat = (profile: Profile) => {
      const existingContact = contacts.find(c => c.id === profile.id);
      if (existingContact) {
          setSelectedContactId(profile.id);
          setMainView('chat');
          // Optional: We can't easily close the uncontrolled dialog, but switching view might be enough feedback
      } else {
          toast.info("Vui lòng kết bạn để bắt đầu trò chuyện");
      }
  };

  const scrollToBottom = () => {
      setTimeout(() => {
          if (scrollRef.current) {
              scrollRef.current.scrollIntoView({ behavior: 'smooth' });
          }
      }, 100);
  };

  // --- 3. Actions ---

  const handleSendMessage = async (
    content?: string, 
    type: 'text' | 'image' | 'link' | 'file' | 'sticker' | 'contact' = 'text', 
    fileUrl?: string
  ) => {
    if (!user || !selectedContactId) return;
    
    const text = content || inputMessage.trim();
    if (!text && type === 'text') return;

    if (type === 'text') setInputMessage('');

    try {
        const isGroup = selectedContact?.profile.role === 'Group';
        const msgPayload = {
            sender_id: user.id,
            receiver_id: isGroup ? null : selectedContactId,
            group_id: isGroup ? selectedContactId : null,
            content: text,
            type: type,
            file_url: fileUrl,
            priority: messagePriority
        };

        // Optimistic update
        const tempId = Date.now().toString();
        const tempMsg: Message = {
            id: tempId,
            ...msgPayload,
            receiver_id: isGroup ? '' : selectedContactId, // Safe fallback for types
            created_at: new Date().toISOString(),
            is_read: false,
            priority: messagePriority
        };
        setMessages(prev => [...prev, tempMsg]);
        scrollToBottom();

        const { data: sentMsg, error } = await supabase
            .from('messages')
            .insert(msgPayload)
            .select()
            .single();

        if (error) throw error;
        
        // Update optimistic message with real ID
        if (sentMsg) {
            setMessages(prev => {
                // If the real message is ALREADY in the list (e.g. from subscription), 
                // we should remove the optimistic one (tempId) and ensure real one is kept.
                
                // Check if real ID exists
                if (prev.some(m => m.id === sentMsg.id)) {
                    // Remove optimistic
                    return prev.filter(m => m.id !== tempId);
                }
                
                // Otherwise replace optimistic with real
                return prev.map(m => m.id === tempId ? sentMsg : m);
            });
        }
        
        if (type === 'text') setMessagePriority('normal');
    } catch (err) {
        console.error('Failed to send message:', err);
        toast.error('Gửi tin nhắn thất bại');
    }
  };

  const handleShareContact = () => {
    if (!selectedContactToShare) return;
    const contact = contacts.find(c => c.id === selectedContactToShare);
    if (contact) {
        const contactInfo = `${contact.profile.full_name}`;
        handleSendMessage(contactInfo, 'contact');
        setIsContactCardOpen(false);
        setSelectedContactToShare(null);
    }
  };

  const handleCreateAppointment = async () => {
    if (!newAppointmentTitle || !newAppointmentTime || !selectedContactId || !user) return;
    
    try {
        const isGroup = selectedContact?.profile.role === 'Group';
        const { data, error } = await supabase
            .from('appointments')
            .insert({
                created_by: user.id,
                contact_id: isGroup ? null : selectedContactId,
                group_id: isGroup ? selectedContactId : null,
                title: newAppointmentTitle,
                time: new Date(newAppointmentTime).toISOString(),
                repeat_pattern: appointmentRepeat
            })
            .select()
            .single();

        if (error) throw error;

        const newAppt = {
            id: data.id.toString(),
            title: data.title,
            time: data.time,
            contactId: data.group_id || data.contact_id,
            repeat: data.repeat_pattern
        };
        
        setAppointments(prev => [...prev, newAppt]);
        setIsCreatingAppointment(false);
        setNewAppointmentTitle('');
        setNewAppointmentTime('');
        setAppointmentRepeat('none');
        
        toast.success('Đã tạo nhắc hẹn');
        handleSendMessage(`Đã tạo nhắc hẹn: ${newAppointmentTitle} vào lúc ${new Date(newAppointmentTime).toLocaleString('vi-VN')}`, 'text', undefined);
    } catch (err) {
        console.error('Error creating appointment:', err);
        toast.error('Lỗi khi tạo lịch hẹn');
    }
  };

  const handleDeleteAppointment = async (apptId: string) => {
      try {
          const { error } = await supabase
              .from('appointments')
              .delete()
              .eq('id', apptId);
              
          if (error) throw error;
          
          setAppointments(prev => prev.filter(p => p.id !== apptId));
          toast.success('Đã xóa nhắc hẹn');
      } catch (err) {
          console.error('Error deleting appointment:', err);
          toast.error('Lỗi khi xóa lịch hẹn');
      }
  };

  const handleTyping = async () => {
      if (!user || !selectedContactId || !activeChannelRef.current) return;
      
      // Clear existing timeout to debounce "stop typing"
      if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
      }
      
      // Detect Device
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const device = isMobile ? 'mobile' : 'desktop';

      try {
        await activeChannelRef.current.send({
            type: 'broadcast',
            event: 'typing',
            payload: { userId: user.id, isTyping: true, device: device }
        });
        
        // Set timeout to send "stop typing" after inactivity (30s as requested)
        typingTimeoutRef.current = setTimeout(async () => {
            if (activeChannelRef.current) {
                 await activeChannelRef.current.send({
                    type: 'broadcast',
                    event: 'typing',
                    payload: { userId: user.id, isTyping: false, device: device }
                });
            }
        }, 30000);
      } catch (err) {
          console.error('Error sending typing event:', err);
      }
  };

  const handleSearchUsers = async () => {
      if (!searchQuery.trim()) return;
      setIsSearching(true);
      try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .ilike('full_name', `%${searchQuery}%`)
            .neq('id', user?.id) // Don't show self
            .limit(5);
            
          if (error) throw error;
          setSearchResults(data || []);
      } catch (err) {
          console.error(err);
      } finally {
          setIsSearching(false);
      }
  };

  const handleAddFriend = async (friendId: string) => {
      if (!user) return;
      try {
          // Send friend request
          const { error } = await supabase
              .from('friend_requests')
              .insert({ sender_id: user.id, receiver_id: friendId, status: 'pending' });

          if (error) {
               if (error.code === '23505') { // Unique violation
                   toast.error('Đã gửi lời mời kết bạn rồi');
               } else {
                   throw error;
               }
          } else {
              toast.success('Đã gửi lời mời kết bạn');
              setSentRequests(prev => new Set(prev).add(friendId));
          }
      } catch (err: any) {
          console.error(err);
          toast.error(`Lỗi khi gửi lời mời: ${err.message || err.details || 'Không xác định'}`);
      }
  };

  const handleCreateGroup = async () => {
        if (!groupName.trim() || selectedFriends.length === 0 || !user) return;
        
        console.log("Creating group with user:", user.id);
        setIsCreatingGroup(true);
        try {
            // 1. Create Group
            const { data: groupData, error: groupError } = await supabase
                .from('groups')
                .insert({
                    name: groupName,
                    created_by: user.id
                })
                .select()
                .single();
                
            if (groupError) {
                console.error('Group creation error (Insert):', groupError);
                throw groupError;
            }
          if (!groupData) {
              throw new Error('Không thể tạo nhóm (không nhận được dữ liệu trả về). Vui lòng kiểm tra lại quyền truy cập.');
          }
          
          // 2. Add Members (Creator + Selected Friends)
          const members = [
              { group_id: groupData.id, user_id: user.id, role: 'admin' },
              ...selectedFriends.map(friendId => ({
                  group_id: groupData.id,
                  user_id: friendId,
                  role: 'member'
              }))
          ];
          
          const { error: membersError } = await supabase
              .from('group_members')
              .insert(members);
              
          if (membersError) throw membersError;
          
          toast.success('Đã tạo nhóm thành công');
          setIsCreateGroupOpen(false);
          setGroupName('');
          setSelectedFriends([]);
          
          // Add to local state immediately
           const newGroup: Contact = {
                 id: groupData.id,
                 profile: {
                     id: groupData.id,
                     full_name: groupData.name,
                     avatar_url: groupData.avatar_url,
                     role: 'Group',
                     status: 'online',
                     last_seen: new Date().toISOString()
                 },
                 unreadCount: 0,
                 status: 'accepted'
           };
           setContacts(prev => [newGroup, ...prev]);
           setSelectedContactId(newGroup.id);
           
           // Sync with server to ensure consistency
           fetchContacts();
          
      } catch (err) {
          console.error('Error creating group:', err);
          toast.error('Lỗi khi tạo nhóm');
      } finally {
          setIsCreatingGroup(false);
      }
  };

  const toggleFriendSelection = (friendId: string) => {
      setSelectedFriends(prev => 
          prev.includes(friendId) 
              ? prev.filter(id => id !== friendId)
              : [...prev, friendId]
      );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
      const file = e.target.files?.[0];
      if (!file || !user || !selectedContactId) return;

      try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
              .from('chat-uploads')
              .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
              .from('chat-uploads')
              .getPublicUrl(filePath);

          await handleSendMessage(file.name, type, publicUrl);
          toast.success('Đã gửi file thành công');
      } catch (error) {
          console.error('Error uploading file:', error);
          toast.error('Lỗi khi tải lên file');
      }
  };

  const handleStickerSelect = (sticker: string) => {
      handleSendMessage(sticker, 'sticker');
      setIsStickerOpen(false);
  };

  const handleContactShare = (contactId: string) => {
      const contact = contacts.find(c => c.id === contactId);
      if (contact) {
        handleSendMessage(JSON.stringify({ id: contact.id, name: contact.profile.full_name, avatar: contact.profile.avatar_url }), 'contact');
      }
      setIsContactCardOpen(false);
  };

  const handleMuteConfirm = async () => {
      if (!selectedContactId) return;
      
      let duration = 0;
      const now = new Date();
      
      switch (muteDuration) {
          case '1h':
              duration = 60 * 60 * 1000;
              break;
          case '4h':
              duration = 4 * 60 * 60 * 1000;
              break;
          case '8am':
              const tomorrow8am = new Date();
              tomorrow8am.setDate(tomorrow8am.getDate() + 1);
              tomorrow8am.setHours(8, 0, 0, 0);
              duration = tomorrow8am.getTime() - now.getTime();
              break;
          case 'until_on':
               duration = -1;
               break;
      }

      const expiry = duration === -1 ? -1 : now.getTime() + duration;

      setMutedContacts(prev => ({
          ...prev,
          [selectedContactId]: expiry
      }));
      
      setIsMuteDialogOpen(false);
      toast.success('Đã tắt thông báo');

      try {
          const { error } = await supabase
              .from('contacts')
              .update({ muted_until: expiry })
              .eq('user_id', user.id)
              .eq('contact_id', selectedContactId);
          if (error) throw error;
      } catch (err) {
          console.error('Failed to update mute status', err);
      }
  };

  const handleUnfriend = async () => {
      if (!selectedContactId) return;
      if (!confirm('Bạn có chắc chắn muốn hủy kết bạn? Cuộc trò chuyện sẽ bị khóa cho đến khi kết bạn lại.')) return;

      try {
          const { error } = await supabase.rpc('unfriend_user', { target_user_id: selectedContactId });
          if (error) throw error;
          
          toast.success('Đã hủy kết bạn');
          
          // Remove from local state
          setContacts(prev => prev.filter(c => c.id !== selectedContactId));
          setSelectedContactId(null); // Close chat
          setMainView('friends'); // Return to friends list
      } catch (err) {
          console.error(err);
          toast.error('Lỗi khi hủy kết bạn');
      }
  };

  // --- Render Login State ---
  if (!user) {
      return (
          <div className="flex flex-col items-center justify-center h-full bg-background p-8 text-center animate-in fade-in">
              <div className="bg-secondary/30 p-8 rounded-full mb-6">
                  <MessageCircle className="w-16 h-16 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Đăng nhập để Chat</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                  Kết nối với cộng đồng Locaith, trao đổi với chuyên gia và bạn bè ngay lập tức.
              </p>
              <Button onClick={() => setAuthModalOpen(true)} size="lg" className="px-8">
                  Đăng nhập / Đăng ký
              </Button>
          </div>
      );
  }

  const selectedContact = contacts.find(c => c.id === selectedContactId);

  const filteredContacts = contacts.filter(contact => {
      if (!contact || !contact.profile) return false; // Safety check
      
      // Tab Filtering
      if (activeTab === 'unread' && contact.unreadCount === 0) return false;
      if (activeTab === 'friends' && contact.profile.role === 'Group') return false;
      if (activeTab === 'groups' && contact.profile.role !== 'Group') return false;

      // Search Filtering
      if (chatSearchQuery) {
          const query = chatSearchQuery.toLowerCase();
          const nameMatch = contact.profile.full_name?.toLowerCase().includes(query);
          const messageMatch = contact.lastMessage?.toLowerCase().includes(query);
          if (!nameMatch && !messageMatch) return false;
      }
      return true;
  }).sort((a, b) => {
      // Pinned contacts first
      const isAPinned = pinnedContacts.has(a.id);
      const isBPinned = pinnedContacts.has(b.id);
      if (isAPinned && !isBPinned) return -1;
      if (!isAPinned && isBPinned) return 1;
      
      // Sort by last message time (newest first)
      if (a.lastMessageTime && b.lastMessageTime) {
          return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
      }
      if (a.lastMessageTime) return -1;
      if (b.lastMessageTime) return 1;

      return 0;
  });

  const togglePin = async (contactId: string) => {
      const isPinned = pinnedContacts.has(contactId);
      const newValue = !isPinned;

      setPinnedContacts(prev => {
          const newSet = new Set(prev);
          if (isPinned) {
              newSet.delete(contactId);
          } else {
              newSet.add(contactId);
          }
          return newSet;
      });
      
      try {
          const { error } = await supabase
              .from('contacts')
              .update({ is_pinned: newValue })
              .eq('user_id', user?.id)
              .eq('contact_id', contactId);
          if (error) throw error;
      } catch (err) {
          console.error('Failed to update pin status', err);
          // Revert
          setPinnedContacts(prev => {
              const newSet = new Set(prev);
              if (isPinned) newSet.add(contactId);
              else newSet.delete(contactId);
              return newSet;
          });
      }
  };

  const handleMute = (durationMinutes: number | 'until_on' | 'until_8am') => {
      if (!selectedContactId) return;
      
      let expiry = 0;
      const now = Date.now();

      if (durationMinutes === 'until_on') {
          expiry = -1; // Special value for indefinite
      } else if (durationMinutes === 'until_8am') {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(8, 0, 0, 0);
          expiry = tomorrow.getTime();
      } else {
          expiry = now + (durationMinutes * 60 * 1000);
      }

      setMutedContacts(prev => ({
          ...prev,
          [selectedContactId]: expiry
      }));
      setIsMuteDialogOpen(false);
  };

  const isMuted = (contactId: string) => {
      const expiry = mutedContacts[contactId];
      if (!expiry) return false;
      if (expiry === -1) return true;
      return Date.now() < expiry;
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-background overflow-hidden relative">
      <div className="flex-1 flex w-full overflow-hidden relative">
      {/* --- Left Sidebar: Contact List --- */}
      <div className={`${(selectedContactId || mainView === 'friends') ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-r border-border flex-col bg-background shrink-0`}>
        {mainView === 'chat' ? (
          <>
            {/* Search & Header */}
            <div className="flex items-center gap-2 p-3 border-b border-border bg-background">
                 {/* 1. Icon Kính lúp (Search Icon) */}
                 <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground rounded-full hover:bg-secondary">
                     <Search className="h-5 w-5" />
                 </Button>

                 {/* 2. Khung tìm kiếm hội thoại (Chat Search Input Frame) */}
                 <div className="flex-1 bg-secondary/50 rounded-full h-9 flex items-center px-4 transition-colors focus-within:bg-secondary/80">
                     <input 
                         placeholder="Tìm kiếm hội thoại..." 
                         className="w-full bg-transparent border-none text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                         value={chatSearchQuery}
                         onChange={(e) => setChatSearchQuery(e.target.value)}
                     />
                 </div>

                 {/* 3. Nút thêm bạn bè (Add Friend Button) */}
                 <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground rounded-full hover:bg-secondary">
                            <UserPlus className="h-5 w-5" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Tìm kiếm bạn bè</DialogTitle>
                        </DialogHeader>
                        <div className="flex gap-2 mt-4">
                            <Input 
                                placeholder="Nhập tên..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearchUsers()}
                            />
                            <Button onClick={handleSearchUsers} disabled={isSearching}>
                                {isSearching ? <Loader2 className="animate-spin" /> : <Search />}
                            </Button>
                        </div>
                        <div className="mt-4 space-y-2">
                            {searchResults.map(profile => (
                                <div key={profile.id} className="flex items-center justify-between p-2 hover:bg-secondary rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={cleanUrl(profile.avatar_url)} />
                                            <AvatarFallback>{profile.full_name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{profile.full_name}</p>
                                            <p className="text-xs text-muted-foreground">{profile.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleStartChat(profile)}>
                                                        <MessageCircle className="w-4 h-4 text-blue-500" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Nhắn tin</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setViewingProfile(profile)}>
                                                        <Info className="w-4 h-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Xem thông tin</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                        
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button 
                                                        size="sm" 
                                                        variant={sentRequests.has(profile.id) ? "destructive" : "secondary"}
                                                        onClick={() => sentRequests.has(profile.id) ? handleCancelRequest(profile.id) : handleAddFriend(profile.id)}
                                                        disabled={contacts.some(c => c.id === profile.id)}
                                                    >
                                                        {contacts.some(c => c.id === profile.id) ? (
                                                            <UserCheck className="w-4 h-4 text-green-600" />
                                                        ) : sentRequests.has(profile.id) ? (
                                                            <X className="w-4 h-4" />
                                                        ) : (
                                                            <UserPlus className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    {contacts.some(c => c.id === profile.id) ? 'Đã là bạn bè' : sentRequests.has(profile.id) ? 'Hủy lời mời' : 'Thêm bạn bè'}
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </div>
                            ))}
                            {searchResults.length === 0 && searchQuery && !isSearching && (
                                <p className="text-center text-muted-foreground">Không tìm thấy kết quả</p>
                            )}
                        </div>
                    </DialogContent>
                 </Dialog>

                 {/* 4. Nút tạo nhóm (Create Group Button) */}
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <Button 
                                variant="ghost" 
                                size="icon" 
                                className="shrink-0 text-muted-foreground rounded-full hover:bg-secondary"
                                onClick={() => setIsCreateGroupOpen(true)}
                             >
                                 <Users className="h-5 w-5" />
                             </Button>
                        </TooltipTrigger>
                        <TooltipContent>Tạo nhóm chat</TooltipContent>
                    </Tooltip>
                 </TooltipProvider>
            </div>

                 {/* Profile Info Dialog */}
                 <Dialog open={!!viewingProfile} onOpenChange={(open) => !open && setViewingProfile(null)}>
                    <DialogContent className="sm:max-w-sm">
                        <DialogHeader>
                            <DialogTitle>Thông tin tài khoản</DialogTitle>
                        </DialogHeader>
                        {viewingProfile && (
                            <div className="flex flex-col items-center gap-4 py-4">
                                <Avatar className="h-24 w-24 border-2 border-border">
                                    <AvatarImage src={cleanUrl(viewingProfile.avatar_url)} />
                                    <AvatarFallback className="text-2xl">{viewingProfile.full_name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="text-center space-y-1">
                                    <h3 className="font-bold text-xl">{viewingProfile.full_name}</h3>
                                    <Badge variant="secondary">{viewingProfile.role}</Badge>
                                    <div className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground">
                                        <span className={`w-2 h-2 rounded-full ${viewingProfile.status === 'online' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                        {viewingProfile.status === 'online' ? 'Đang hoạt động' : 'Ngoại tuyến'}
                                    </div>
                                    {viewingProfile.last_seen && (
                                        <p className="text-xs text-muted-foreground">
                                            Hoạt động lần cuối: {new Date(viewingProfile.last_seen).toLocaleString('vi-VN')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </DialogContent>
                 </Dialog>
    

              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-3 bg-transparent p-0 h-auto">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none px-0 pb-2 text-xs font-semibold text-muted-foreground flex items-center gap-1"
              >
                Tất cả
                {unreadCount > 0 && (
                    <Badge variant="destructive" className="h-5 min-w-5 p-0 flex items-center justify-center text-[10px] rounded-full px-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="friends" 
                onClick={() => setMainView('chat')}
                className="data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none px-0 pb-2 text-xs font-semibold text-muted-foreground"
              >
                Bạn bè
              </TabsTrigger>
              <TabsTrigger 
                value="groups" 
                onClick={() => setMainView('chat')}
                className="data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none px-0 pb-2 text-xs font-semibold text-muted-foreground"
              >
                Nhóm
              </TabsTrigger>
            </TabsList>
          </Tabs>
    
            {/* Contact List */}
            <ScrollArea className="flex-1">
              <div className="flex flex-col">
                {isLoadingContacts ? (
                    <div className="flex justify-center p-4"><Loader2 className="animate-spin text-muted-foreground" /></div>
                ) : filteredContacts.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground text-sm">
                        {activeTab === 'unread' ? 'Không có tin nhắn chưa đọc.' : (
                            <>Chưa có bạn bè nào.<br/>Hãy tìm kiếm để kết bạn!</>
                        )}
                    </div>
                ) : (
                    filteredContacts.map((contact) => (
                    <div 
                        key={contact.id}
                        onClick={() => {
                            setSelectedContactId(contact.id);
                            setMainView('chat');
                        }}
                        className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-secondary/50 transition-colors ${
                        selectedContactId === contact.id && mainView === 'chat' ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                    >
                        <div className="relative">
                        <Avatar className="h-12 w-12 border border-border">
                            <AvatarImage src={cleanUrl(contact.profile.avatar_url)} />
                            <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">{contact.profile.full_name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        {contact.profile.role === 'Group' && (
                            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-zinc-800 rounded-full p-[2px] shadow-sm border border-border/50">
                                <Users className="h-3.5 w-3.5 text-blue-600 fill-blue-600/10" />
                            </div>
                        )}
                        {contact.profile.status === 'online' && contact.profile.role !== 'Group' && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></span>
                        )}
                        </div>
                        <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                            <h3 className="font-semibold text-sm truncate pr-2 flex items-center gap-1">
                                {contact.profile.full_name}
                                {pinnedContacts.has(contact.id) && <Pin className="h-3 w-3 text-blue-600 fill-blue-600" />}
                                {isMuted(contact.id) && <BellOff className="h-3 w-3 text-muted-foreground" />}
                            </h3>
                            <span className="text-[10px] text-muted-foreground shrink-0">
                                {contact.lastMessageTime && (() => {
                                    try {
                                        const date = new Date(contact.lastMessageTime);
                                        const now = new Date();
                                        const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                                        
                                        if (isToday) {
                                            // Calculate minutes ago if less than 1 hour
                                            const diffMs = now.getTime() - date.getTime();
                                            const diffMins = Math.floor(diffMs / 60000);
                                            if (diffMins < 1) return 'Vừa xong';
                                            if (diffMins < 60) return `${diffMins} phút`;
                                            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                        }
                                        return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
                                    } catch (e) { return ''; }
                                })()}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className={`text-xs truncate ${contact.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                {contact.lastMessage ? (
                                    contact.lastMessage
                                ) : contact.unreadCount > 0 ? (
                                    'Tin nhắn mới'
                                ) : (
                                    'Nhấn để chat'
                                )}
                            </p>
                            {contact.unreadCount > 0 && (
                                <Badge variant="default" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-blue-600 hover:bg-blue-700">
                                    {contact.unreadCount}
                                </Badge>
                            )}
                        </div>
                        </div>
                    </div>
                    ))
                )}
              </div>
            </ScrollArea>
          </>
        ) : (
          <>
             {/* Friends Sidebar Content */}
             <div className="p-3 border-b border-border space-y-3">
                 <div className="relative w-full">
                     <div className="h-10 flex items-center font-bold text-lg">Danh sách bạn bè</div>
                 </div>
                 <Tabs value="friends" className="w-full">
                    <TabsList className="w-full grid grid-cols-2 bg-transparent p-0 h-auto">
                      <TabsTrigger 
                        value="all" 
                        onClick={() => { setMainView('chat'); setActiveTab('all'); }}
                        className="data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none px-0 pb-2 text-xs font-semibold text-muted-foreground flex items-center gap-1"
                      >
                        Tất cả
                        {unreadCount > 0 && (
                        <Badge variant="destructive" className="h-5 min-w-5 p-0 flex items-center justify-center text-[10px] rounded-full px-1">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                    )}
                      </TabsTrigger>
                      <TabsTrigger 
                        value="friends" 
                        className="data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none px-0 pb-2 text-xs font-semibold text-muted-foreground"
                      >
                        Danh sách
                      </TabsTrigger>
                    </TabsList>
                 </Tabs>
             </div>
             <div className="p-2 space-y-1 flex-1">
                 {incomingRequests.length > 0 && (
                     <div className="mb-4">
                         <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                             Lời mời kết bạn ({incomingRequests.length})
                         </div>
                         {incomingRequests.map(req => {
                            // Fallback for missing sender profile
                            const sender = req.sender || { 
                                full_name: 'Người dùng ẩn', 
                                avatar_url: null, 
                                id: 'unknown' 
                            };
                            
                            return (
                             <div key={req.id} className="flex items-center justify-between p-3 hover:bg-secondary/50 rounded-lg">
                                 <div className="flex items-center gap-2">
                                     <Avatar className="h-8 w-8">
                                         <AvatarImage src={cleanUrl(sender.avatar_url)} />
                                         <AvatarFallback>{sender.full_name?.charAt(0) || '?'}</AvatarFallback>
                                     </Avatar>
                                     <div className="text-sm font-medium truncate max-w-[120px]">
                                        {sender.full_name}
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <Button size="sm" className="h-7 text-xs px-2" onClick={() => handleAcceptRequest(req.id)}>
                                        Đồng ý
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-7 text-xs px-2 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleRejectRequest(req.id)}>
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                         )})}
                         <Separator className="my-2" />
                     </div>
                 )}
                 <Button variant="ghost" className="w-full justify-start gap-3 bg-blue-50 text-blue-600 font-bold">
                     <ContactIcon className="h-4 w-4" /> Danh sách bạn bè
                 </Button>
                 <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground font-medium">
                     <Users className="h-4 w-4" /> Nhóm và cộng đồng
                 </Button>
                 <Separator className="my-2" />
                 <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground font-medium">
                     <UserPlus className="h-4 w-4" /> Lời mời kết bạn
                 </Button>
                 <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground font-medium">
                     <Shield className="h-4 w-4" /> Lời mời vào nhóm
                 </Button>
             </div>
          </>
        )}
        
        {/* User Profile Mini */}
        <div className="hidden md:flex p-3 border-t border-border bg-secondary/10 items-center justify-between">
            <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={cleanUrl(user.user_metadata?.avatar_url)} />
                    <AvatarFallback>Me</AvatarFallback>
                </Avatar>
                <div className="text-xs">
                    <p className="font-bold">{user.user_metadata?.full_name || user.email}</p>
                    <p className="text-green-600">Online</p>
                </div>
            </div>
            <div className="flex items-center gap-1">
                {mainView === 'friends' && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => setMainView('chat')}
                                >
                                    <MessageCircle className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Quay lại Chat</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setMainView(v => v === 'chat' ? 'friends' : 'chat')}
                                className={mainView === 'friends' ? 'bg-secondary text-blue-600' : ''}
                            >
                                <ContactIcon className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Danh bạ</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Settings className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Cài đặt</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => supabase.auth.signOut()} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Đăng xuất</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>

        </div>

      {/* --- Main Content Area --- */}
      <div className={`${(!selectedContactId && mainView !== 'friends') ? 'hidden md:flex' : 'flex'} flex-1 overflow-hidden relative`}>
        {mainView === 'friends' ? (
             <div className="flex h-full w-full bg-background animate-in fade-in duration-300 flex-col">
                  {/* Header - Synchronized with Chat Header */}
                  <div className="flex flex-col bg-background shrink-0">
                      {/* Top Bar */}
                      <div className="flex items-center gap-2 p-3 border-b border-border bg-background">
                           <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground rounded-full hover:bg-secondary">
                               <Search className="h-5 w-5" />
                           </Button>

                           <div className="flex-1 bg-secondary/50 rounded-full h-9 flex items-center px-4 transition-colors focus-within:bg-secondary/80">
                               <input 
                                   placeholder="Tìm kiếm bạn bè..." 
                                   className="w-full bg-transparent border-none text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                                   value={friendSearchQuery}
                                   onChange={(e) => setFriendSearchQuery(e.target.value)}
                               />
                           </div>

                           <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground rounded-full hover:bg-secondary">
                                        <UserPlus className="h-5 w-5" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Tìm kiếm bạn bè</DialogTitle>
                                    </DialogHeader>
                                    <div className="flex gap-2 mt-4">
                                        <Input 
                                            placeholder="Nhập tên..." 
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearchUsers()}
                                        />
                                        <Button onClick={handleSearchUsers} disabled={isSearching}>
                                            {isSearching ? <Loader2 className="animate-spin" /> : <Search />}
                                        </Button>
                                    </div>
                                    <div className="mt-4 space-y-2">
                                        {searchResults.map(profile => (
                                            <div key={profile.id} className="flex items-center justify-between p-2 hover:bg-secondary rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={cleanUrl(profile.avatar_url)} />
                                                        <AvatarFallback>{profile.full_name?.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">{profile.full_name}</p>
                                                        <p className="text-xs text-muted-foreground">{profile.role}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setViewingProfile(profile)}>
                                                                    <Info className="w-4 h-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Xem thông tin</TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                    
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button 
                                                                    size="sm" 
                                                                    variant={sentRequests.has(profile.id) ? "destructive" : "secondary"}
                                                                    onClick={() => sentRequests.has(profile.id) ? handleCancelRequest(profile.id) : handleAddFriend(profile.id)}
                                                                    disabled={contacts.some(c => c.id === profile.id)}
                                                                >
                                                                    {contacts.some(c => c.id === profile.id) ? (
                                                                        <UserCheck className="w-4 h-4 text-green-600" />
                                                                    ) : sentRequests.has(profile.id) ? (
                                                                        <X className="w-4 h-4" />
                                                                    ) : (
                                                                        <UserPlus className="w-4 h-4" />
                                                                    )}
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                {contacts.some(c => c.id === profile.id) ? 'Đã là bạn bè' : sentRequests.has(profile.id) ? 'Hủy lời mời' : 'Thêm bạn bè'}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            </div>
                                        ))}
                                        {searchResults.length === 0 && searchQuery && !isSearching && (
                                            <p className="text-center text-muted-foreground">Không tìm thấy kết quả</p>
                                        )}
                                    </div>
                                </DialogContent>
                           </Dialog>

                           <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground rounded-full relative">
                               <Bell className="h-5 w-5" />
                               <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full border border-background"></span>
                           </Button>
                      </div>
                      
                      {/* Tabs */}
                      <div className="grid grid-cols-3 text-sm font-medium pt-2 bg-background border-b border-border">
                          <div 
                              className="pb-3 text-muted-foreground cursor-pointer hover:text-foreground text-center transition-colors border-b-2 border-transparent"
                              onClick={() => {
                                  setMainView('chat');
                                  setActiveTab('all');
                              }}
                          >
                              Hội thoại
                          </div>
                          <div 
                              className={`pb-3 cursor-pointer text-center transition-colors border-b-2 ${friendTab === 'friends' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                              onClick={() => setFriendTab('friends')}
                          >
                              Bạn bè
                          </div>
                          <div 
                              className={`pb-3 cursor-pointer text-center transition-colors border-b-2 ${friendTab === 'groups' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                              onClick={() => setFriendTab('groups')}
                          >
                              Nhóm
                          </div>
                      </div>
                  </div>
                  
                  <div className="flex-1 overflow-hidden relative flex flex-col">
                      <ScrollArea className="flex-1">
                          {/* Functional Items */}
                          <div className="p-0">
                               {/* Friend Requests - Only show in Friends tab */}
                               {friendTab === 'friends' && (
                               <div className="flex items-center gap-4 p-4 active:bg-secondary/50 transition-colors cursor-pointer border-b border-border/40">
                                   <div className="bg-blue-500 rounded-full p-2.5">
                                       <Users className="h-6 w-6 text-white" />
                                   </div>
                                   <div className="flex-1">
                                       <div className="font-medium text-base">Lời mời kết bạn</div>
                                   </div>
                                   {incomingRequests.length > 0 && (
                                      <Badge className="bg-red-500 hover:bg-red-600 mr-2 rounded-full px-2">{incomingRequests.length}</Badge>
                                   )}
                                   {/* <ChevronRight className="h-5 w-5 text-muted-foreground/50" /> */}
                               </div>
                               )}
                               
                               {/* Birthdays - Only show in Friends tab */}
                               {friendTab === 'friends' && (
                               <div className="flex items-center gap-4 p-4 active:bg-secondary/50 transition-colors cursor-pointer border-b border-border/40">
                                   <div className="bg-blue-500 rounded-full p-2.5 relative">
                                       <Cake className="h-6 w-6 text-white" />
                                       <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
                                   </div>
                                   <div className="flex-1">
                                       <div className="font-medium text-base flex items-center gap-2">
                                          Sinh nhật <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                       </div>
                                       <div className="text-xs text-muted-foreground mt-0.5 font-normal">Hôm nay là sinh nhật Gia Bảo và 3 người khác</div>
                                   </div>
                               </div>
                               )}
                          </div>

                          {/* Separator */}
                          <div className="h-2 bg-secondary/20"></div>

                          {/* Filters */}
                          <div className="px-4 py-3 flex gap-3 overflow-x-auto no-scrollbar items-center">
                               <div className="bg-secondary/50 text-foreground rounded-full px-4 py-1.5 text-sm font-bold whitespace-nowrap">
                                   Tất cả {contacts.filter(c => friendTab === 'groups' ? c.profile.role === 'Group' : c.profile.role !== 'Group').length}
                               </div>
                               <div className="border border-border text-muted-foreground rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap">
                                   Mới truy cập
                               </div>
                          </div>

                          {/* Contacts List */}
                          <div className="pb-20">
                              {contacts.filter(c => friendTab === 'groups' ? c.profile.role === 'Group' : c.profile.role !== 'Group').length === 0 ? (
                                  <div className="text-center p-8 text-muted-foreground">
                                      {friendTab === 'groups' ? 'Chưa tham gia nhóm nào' : 'Không tìm thấy bạn bè'}
                                  </div>
                              ) : (
                                  (() => {
                                      const sorted = [...contacts]
                                          .filter(c => {
                                              // Filter by Tab
                                              if (friendTab === 'groups') {
                                                  if (c.profile.role !== 'Group') return false;
                                              } else {
                                                  if (c.profile.role === 'Group') return false;
                                              }

                                              const name = c.profile.full_name || '';
                                              const matchesSearch = name.toLowerCase().includes(friendSearchQuery.toLowerCase());
                                              
                                              if (!matchesSearch) return false;
                                              
                                              if (selectedAlphaFilter) {
                                                  const firstChar = name.charAt(0).toUpperCase();
                                                  if (selectedAlphaFilter === '#') {
                                                      return !/[A-Z]/.test(firstChar);
                                                  }
                                                  return firstChar === selectedAlphaFilter;
                                              }
                                              
                                              return true;
                                          })
                                          .sort((a, b) => {
                                              const nA = a.profile.full_name || '';
                                              const nB = b.profile.full_name || '';
                                              return nA.localeCompare(nB);
                                          });
                                      
                                      let lastLetter = '';
                                      
                                      return sorted.map((contact) => {
                                          const name = contact.profile.full_name || contact.profile.email || 'Unknown';
                                          const currentLetter = name.charAt(0).toUpperCase();
                                          const isLetter = /[A-Z]/.test(currentLetter);
                                          const headerLetter = isLetter ? currentLetter : '#';
                                          const showHeader = headerLetter !== lastLetter;
                                          if (showHeader) lastLetter = headerLetter;
                                          
                                          return (
                                              <React.Fragment key={contact.id}>
                                                  {showHeader && (
                                                      <div className="px-4 py-1 bg-transparent text-sm font-bold text-foreground mt-2">{headerLetter}</div>
                                                  )}
                                                  <div 
                                                      className="flex items-center justify-between p-4 py-3 active:bg-secondary/30 transition-colors cursor-pointer"
                                                      onClick={() => {
                                                          setSelectedContactId(contact.id);
                                                          setMainView('chat');
                                                      }}
                                                  >
                                                      <div className="flex items-center gap-4">
                                                          <div className="relative">
                                                              <Avatar className="h-10 w-10 border border-border/50">
                                                                  <AvatarImage src={cleanUrl(contact.profile.avatar_url)} />
                                                                  <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">{name.charAt(0)}</AvatarFallback>
                                                              </Avatar>
                                                              {contact.profile.role === 'Group' && (
                                                                  <div className="absolute -bottom-1 -right-1 bg-white dark:bg-zinc-800 rounded-full p-[2px] shadow-sm border border-border/50">
                                                                     <Users className="h-3.5 w-3.5 text-blue-600 fill-blue-600/10" />
                                                                  </div>
                                                              )}
                                                          </div>
                                                          <div className="flex flex-col">
                                                              <span className="font-medium text-base text-foreground flex items-center gap-1.5">
                                                                  {name}
                                                              </span>
                                                          </div>
                                                      </div>
                                                      <div className="flex items-center gap-4 text-muted-foreground/40">
                                                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-muted-foreground hover:bg-secondary" onClick={(e) => { e.stopPropagation(); }}>
                                                              <Phone className="h-5 w-5 stroke-[1.5]" />
                                                          </Button>
                                                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-muted-foreground hover:bg-secondary" onClick={(e) => { e.stopPropagation(); }}>
                                                              <Video className="h-6 w-6 stroke-[1.5]" />
                                                          </Button>
                                                      </div>
                                                  </div>
                                              </React.Fragment>
                                          );
                                      });
                                  })()
                              )}
                          </div>
                      </ScrollArea>
                      
                      {/* Alphabet Sidebar */}
                      <div className="absolute right-0.5 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 items-center justify-center text-[10px] text-muted-foreground/60 font-medium z-10 select-none h-3/4">
                          {'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('').map(char => (
                              <div 
                                key={char} 
                                className={`w-4 text-center h-4 flex items-center justify-center cursor-pointer transition-all ${selectedAlphaFilter === char ? 'text-primary font-bold scale-150' : 'hover:text-primary'}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedAlphaFilter(prev => prev === char ? null : char);
                                }}
                              >
                                {char}
                              </div>
                          ))}
                      </div>
                  </div>
             </div>
        ) : (
             <>
                 {/* --- Center: Chat Window --- */}
                 <div className="flex-1 flex flex-col min-w-0 bg-[#eef0f3] dark:bg-secondary/10">
                    {selectedContact ? (
                        <>
                            {/* Chat Header */}
                            <div className="h-16 border-b border-border bg-background flex items-center justify-between px-4 shrink-0">
                            <div className="flex items-center gap-3">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="md:hidden -ml-2" 
                                    onClick={() => setSelectedContactId(null)}
                                >
                                    <ChevronLeft className="h-6 w-6" />
                                </Button>
                                <div className="relative">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={cleanUrl(selectedContact.profile.avatar_url)} />
                                        <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">{selectedContact.profile.full_name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    {selectedContact.profile.role === 'Group' && (
                                        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-zinc-800 rounded-full p-[2px] shadow-sm border border-border/50">
                                            <Users className="h-3 w-3 text-blue-600 fill-blue-600/10" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                <h2 className="font-bold text-base flex items-center gap-2">
                                    {selectedContact.profile.full_name}
                                    {selectedContact.profile.role !== 'user' && (
                                    <Badge variant="secondary" className="text-[10px] h-5 px-1 font-normal bg-blue-50 text-blue-600 border-blue-100">
                                        <Users className="w-3 h-3 mr-1" />
                                        {selectedContact.profile.role}
                                    </Badge>
                                    )}
                                </h2>
                                <div className="flex items-center text-xs text-muted-foreground gap-1">
                                    {typingUsers[selectedContact.id] ? (
                                        <span className="text-blue-600 font-medium animate-pulse">
                                            {typingUsers[selectedContact.id] === 'mobile' ? '📱' : '💻'} đang gõ...
                                        </span>
                                    ) : (
                                        <>
                                            <span className="text-green-600">Truy cập gần đây</span>
                                        </>
                                    )}
                                </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                                {/* Mobile Actions */}
                                <Button variant="ghost" size="icon" className="md:hidden text-blue-600">
                                    <Phone className="h-6 w-6" />
                                </Button>
                                <Button variant="ghost" size="icon" className="md:hidden text-blue-600">
                                    <Video className="h-6 w-6" />
                                </Button>
                                <Button variant="ghost" size="icon" className="md:hidden text-blue-600" onClick={() => {
                                    setRightSidebarView('info');
                                    setShowRightSidebar(true);
                                }}>
                                    <Layout className="h-6 w-6" />
                                </Button>

                                {/* Desktop Actions */}
                                <div className="hidden md:flex items-center gap-1">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" onClick={() => setIsCreateGroupOpen(true)}>
                                                    <UserPlus className="h-5 w-5 text-muted-foreground" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Thêm bạn vào trò chuyện</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <Video className="h-5 w-5 text-muted-foreground" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Gọi video</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className={`${rightSidebarView === 'search' && showRightSidebar ? 'bg-secondary text-blue-600' : 'text-muted-foreground'}`}
                                                    onClick={() => {
                                                        setRightSidebarView('search');
                                                        setShowRightSidebar(true);
                                                    }}
                                                >
                                                    <Search className="h-5 w-5" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Tìm kiếm trong trò chuyện</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className={`text-muted-foreground hover:text-blue-600 ${rightSidebarView === 'info' && showRightSidebar ? 'bg-secondary' : ''}`}
                                                    onClick={() => {
                                                        if (showRightSidebar && rightSidebarView === 'info') {
                                                            setShowRightSidebar(false);
                                                        } else {
                                                            setRightSidebarView('info');
                                                            setShowRightSidebar(true);
                                                        }
                                                    }}
                                                >
                                                    <Layout className="h-5 w-5" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Thông tin hội thoại</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreVertical className="h-5 w-5 text-muted-foreground" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => {
                                                setRightSidebarView('info');
                                                setShowRightSidebar(true);
                                            }}>
                                                <Info className="w-4 h-4 mr-2" />
                                                Thông tin
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setIsMuteDialogOpen(true)}>
                                                <BellOff className="w-4 h-4 mr-2" />
                                                Tắt thông báo
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={handleUnfriend}>
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Hủy kết bạn
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                            </div>

                            {/* Messages List */}
                            <ScrollArea className="flex-1 p-2 md:p-4">
                            <div className="flex flex-col gap-4 max-w-4xl mx-auto">
                                {messages.map((msg, index) => {
                                const isMe = msg.sender_id === user.id;
                                const isLastMessage = index === messages.length - 1;
                                return (
                                    <div 
                                        key={msg.id} 
                                        id={`msg-${msg.id}`}
                                        className={`flex ${isMe ? 'justify-end' : 'justify-start'} gap-3 group`}
                                    >
                                    {!isMe && (
                                        <Avatar className="h-8 w-8 mt-1">
                                        <AvatarImage src={cleanUrl(selectedContact.profile.avatar_url)} />
                                        <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">{selectedContact.profile.full_name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    )}
                                    
                                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[70%] relative group/bubble`}>

                                        <div className={`px-3 py-2 md:px-4 md:py-2.5 rounded-xl shadow-sm relative ${
                                    isMe 
                                        ? 'bg-blue-50 dark:bg-blue-900/30 text-foreground rounded-tr-none' 
                                        : 'bg-white dark:bg-secondary text-foreground rounded-tl-none'
                                    } ${
                                        msg.priority === 'important' ? 'border-2 border-orange-400' : 
                                        msg.priority === 'urgent' ? 'border-2 border-red-500' : ''
                                    }`}>
                                    
                                    {msg.priority === 'important' && (
                                        <div className="flex items-center gap-1 text-orange-600 mb-1 text-xs font-bold uppercase">
                                            <AlertTriangle className="h-3 w-3" /> Quan trọng
                                        </div>
                                    )}
                                    {msg.priority === 'urgent' && (
                                        <div className="flex items-center gap-1 text-red-600 mb-1 text-xs font-bold uppercase">
                                            <Shield className="h-3 w-3" /> Khẩn cấp
                                        </div>
                                    )}

                                    {(!msg.type || msg.type === 'text') && (
                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                    )}
                                    {msg.type === 'link' && (
                                        <a href={msg.content} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">
                                        {msg.content}
                                        </a>
                                    )}
                                    {msg.type === 'image' && (
                                        <div className="rounded-lg overflow-hidden my-1">
                                            <img 
                                                src={cleanUrl(msg.file_url || msg.content)} 
                                                alt="Image" 
                                                className="max-w-full max-h-[300px] object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none'; // Hide broken images
                                                }}
                                            />
                                        </div>
                                    )}
                                    {msg.type === 'sticker' && (
                                        <div className="text-6xl my-1 select-none">
                                            {msg.content}
                                        </div>
                                    )}
                                    {msg.type === 'file' && (
                                        <div className="flex items-center gap-3 p-2 bg-secondary/50 rounded-lg border">
                                            <div className="h-10 w-10 bg-blue-100 flex items-center justify-center rounded">
                                                <FileText className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{msg.content}</p>
                                                <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                                                    Tải xuống
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                    {msg.type === 'contact' && (
                                         <div className="flex items-center gap-3 p-2 bg-secondary/50 rounded-lg border min-w-[200px]">
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback><ContactIcon className="h-5 w-5" /></AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">Danh thiếp</p>
                                                <p className="text-xs text-muted-foreground truncate">{msg.content}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Reaction Display */}
                                    {msg.message_reactions && msg.message_reactions.length > 0 && (
                                        <div className={`absolute -bottom-3 ${isMe ? 'right-2' : 'left-2'} bg-background/90 dark:bg-zinc-800 rounded-full px-1.5 py-0.5 shadow border border-border flex items-center gap-1 z-20 cursor-pointer hover:bg-secondary transition-colors`}>
                                            {/* Icons */}
                                            <div className="flex -space-x-1 items-center">
                                                {Object.entries(
                                                    msg.message_reactions.reduce((acc, reaction) => {
                                                        acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
                                                        return acc;
                                                    }, {} as Record<string, number>)
                                                )
                                                // Sort by count descending
                                                .sort((a, b) => b[1] - a[1])
                                                // Take top 3
                                                .slice(0, 3)
                                                .map(([emoji, count]) => (
                                                    <span key={emoji} className="text-xs leading-none relative z-10">{emoji}</span>
                                                ))}
                                            </div>
                                            
                                            {/* Count */}
                                            {msg.message_reactions.length > 1 && (
                                                <span className="text-[10px] font-medium text-muted-foreground ml-0.5">
                                                    {msg.message_reactions.length}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    
                                    <span className="text-[10px] text-muted-foreground mt-1 opacity-70 flex items-center gap-1 justify-end">
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {isMe && (
                                            msg.is_read ? (
                                                <span title="Đã xem" className="text-blue-500"><Check className="h-3 w-3" /></span>
                                            ) : (
                                                <span title="Đã gửi"><Check className="h-3 w-3 text-muted-foreground" /></span>
                                            )
                                        )}
                                    </span>

                                    {/* Add Reaction Button - Corner Position */}
                                    <div className={`absolute -bottom-2 ${isMe ? 'left-[-5px]' : 'right-[-5px]'} ${isLastMessage ? 'opacity-100' : 'opacity-0 group-hover/bubble:opacity-100'} transition-opacity z-20`}>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full bg-background/80 backdrop-blur hover:bg-secondary shadow-sm border border-border">
                                                    <Smile className="h-3 w-3 text-muted-foreground" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-1 flex gap-1 shadow-lg rounded-full" align={isMe ? "start" : "end"} side="top">
                                                {["👍", "❤️", "😂", "😮", "😢", "😡"].map(emoji => (
                                                    <button
                                                        key={emoji}
                                                        className="text-lg hover:bg-accent p-1.5 rounded-full transition-transform hover:scale-125"
                                                        onClick={() => handleReaction(msg.id, emoji)}
                                                    >
                                                        {emoji}
                                                    </button>
                                                ))}
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    </div>
                                    </div>
                                    </div>
                                );
                                })}
                                {typingUsers[selectedContactId] && (
                                    <div className="flex justify-start gap-3 animate-in fade-in duration-300">
                                        <Avatar className="h-8 w-8 mt-1">
                                            <AvatarImage src={cleanUrl(selectedContact?.profile.avatar_url)} />
                                            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">{selectedContact?.profile.full_name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="px-2 py-2 flex items-center gap-2">
                                            <span className="text-sm text-[#0084ff] font-medium flex items-center gap-2">
                                                <span className="text-lg leading-none animate-pulse">•••</span>
                                                <span className="animate-pulse">{typingUsers[selectedContactId] === 'mobile' ? 'Đang soạn tin trên điện thoại' : 'Đang soạn tin trên máy tính'}</span>
                                            </span>
                                        </div>
                                    </div>
                                )}
                                <div ref={scrollRef} />
                            </div>
                            </ScrollArea>

                            {/* Input Area */}
                            <div className="bg-background border-t border-border">
                                {/* Hidden Inputs */}
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(e, 'image')}
                                />
                                <input 
                                    type="file" 
                                    ref={attachmentInputRef} 
                                    className="hidden" 
                                    onChange={(e) => handleFileUpload(e, 'file')}
                                />

                                    {/* Desktop Layout */}
                                <div className="hidden md:block">
                                    {/* Toolbar */}
                                    <div className="flex items-center gap-1 px-3 pt-2">
                                        <Popover open={isStickerOpen} onOpenChange={setIsStickerOpen}>
                                            <PopoverTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                    <Sticker className="h-5 w-5" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-64 p-2" align="start">
                                                <div className="grid grid-cols-4 gap-2">
                                                    {stickers.map((s, i) => (
                                                        <button 
                                                            key={i} 
                                                            className="text-2xl hover:bg-secondary p-2 rounded transition-colors"
                                                            onClick={() => handleStickerSelect(s)}
                                                        >
                                                            {s}
                                                        </button>
                                                    ))}
                                                </div>
                                            </PopoverContent>
                                        </Popover>

                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                        onClick={() => fileInputRef.current?.click()}
                                                    >
                                                        <ImageIcon className="h-5 w-5" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Gửi hình ảnh</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                        onClick={() => attachmentInputRef.current?.click()}
                                                    >
                                                        <Paperclip className="h-5 w-5" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Gửi đính kèm File</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                        <Popover open={isContactCardOpen} onOpenChange={setIsContactCardOpen}>
                                            <PopoverTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                    <ContactIcon className="h-5 w-5" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-60 p-0" align="start">
                                                <div className="p-2 border-b font-medium text-sm">Gửi danh thiếp</div>
                                                <ScrollArea className="h-48">
                                                    {contacts.map(c => (
                                                        <div 
                                                            key={c.id} 
                                                            className="flex items-center gap-2 p-2 hover:bg-secondary cursor-pointer"
                                                            onClick={() => handleContactShare(c.id)}
                                                        >
                                                            <Avatar className="h-6 w-6">
                                                                <AvatarImage src={cleanUrl(c.profile.avatar_url)} />
                                                                <AvatarFallback>{c.profile.full_name?.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                            <span className="text-sm truncate">{c.profile.full_name}</span>
                                                        </div>
                                                    ))}
                                                </ScrollArea>
                                            </PopoverContent>
                                        </Popover>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                    <MoreHorizontal className="h-5 w-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start">
                                                <DropdownMenuItem onClick={() => setIsAppointmentDialogOpen(true)}>
                                                    <Calendar className="mr-2 h-4 w-4" />
                                                    <span>Tạo nhắc hẹn</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => setMessagePriority(prev => prev === 'important' ? 'normal' : 'important')}>
                                                    {messagePriority === 'important' ? <Check className="mr-2 h-4 w-4" /> : <AlertTriangle className="mr-2 h-4 w-4 text-orange-500" />}
                                                    <span>Đánh dấu tin quan trọng</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setMessagePriority(prev => prev === 'urgent' ? 'normal' : 'urgent')}>
                                                    {messagePriority === 'urgent' ? <Check className="mr-2 h-4 w-4" /> : <Shield className="mr-2 h-4 w-4 text-red-500" />}
                                                    <span>Đánh dấu tin khẩn cấp</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div className="p-3 pt-1">
                                        <div className="flex items-end gap-2">
                                            <div className="flex-1 relative">
                                                {messagePriority !== 'normal' && (
                                                    <div className={`absolute -top-10 left-0 px-3 py-1.5 rounded-t-md text-xs font-medium text-white flex items-center gap-2 shadow-sm ${
                                                        messagePriority === 'important' ? 'bg-orange-500' : 'bg-red-500'
                                                    }`}>
                                                        {messagePriority === 'important' ? <AlertTriangle className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                                                        {messagePriority === 'important' ? 'Tin quan trọng' : 'Tin khẩn cấp'}
                                                        <X 
                                                            className="h-3 w-3 cursor-pointer hover:bg-white/20 rounded" 
                                                            onClick={() => setMessagePriority('normal')}
                                                        />
                                                    </div>
                                                )}
                                                <Input 
                                                    placeholder={`Nhập @, tin nhắn tới ${selectedContact.profile.full_name}`}
                                                    className={`pr-10 min-h-[44px] py-3 bg-secondary/30 focus-visible:ring-1 focus-visible:ring-blue-500 ${
                                                        messagePriority !== 'normal' ? 'rounded-tl-none' : ''
                                                    }`}
                                                    value={inputMessage}
                                                    onChange={(e) => {
                                                        setInputMessage(e.target.value);
                                                        handleTyping();
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleSendMessage();
                                                        }
                                                    }}
                                                />
                                                <Smile className="absolute right-3 top-3 h-5 w-5 text-muted-foreground cursor-pointer hover:text-blue-600" />
                                            </div>
                                            <Button 
                                                size="icon" 
                                                onClick={() => handleSendMessage()}
                                                className={`h-[44px] w-[44px] shrink-0 transition-all ${
                                                    inputMessage.trim() ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                                                }`}
                                            >
                                                <Send className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Mobile Layout */}
                                <div className="flex md:hidden items-center gap-2 p-2 px-3 border-t border-border">
                                    <Popover open={isStickerOpen} onOpenChange={setIsStickerOpen}>
                                        <PopoverTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-muted-foreground shrink-0 h-9 w-9">
                                                <Smile className="h-6 w-6" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-64 p-2" align="start" side="top">
                                            <div className="grid grid-cols-4 gap-2">
                                                {stickers.map((s, i) => (
                                                    <button 
                                                        key={i} 
                                                        className="text-2xl hover:bg-secondary p-2 rounded transition-colors"
                                                        onClick={() => handleStickerSelect(s)}
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        </PopoverContent>
                                    </Popover>

                                    <div className="flex-1 bg-secondary/50 rounded-full px-4 py-2 flex items-center min-h-[40px]">
                                        <input
                                            ref={inputRef}
                                            className="bg-transparent border-none outline-none w-full text-base placeholder:text-muted-foreground"
                                            placeholder="Tin nhắn"
                                            value={inputMessage}
                                            onChange={(e) => {
                                                setInputMessage(e.target.value);
                                                handleTyping();
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleSendMessage();
                                                }
                                            }}
                                        />
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-muted-foreground shrink-0 h-9 w-9">
                                                <MoreHorizontal className="h-6 w-6" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => attachmentInputRef.current?.click()}>
                                                <Paperclip className="mr-2 h-4 w-4" />
                                                <span>Gửi đính kèm File</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setIsAppointmentDialogOpen(true)}>
                                                <Calendar className="mr-2 h-4 w-4" />
                                                <span>Tạo nhắc hẹn</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    {inputMessage.trim() ? (
                                        <Button variant="ghost" size="icon" className="text-blue-600 shrink-0 h-9 w-9" onClick={() => handleSendMessage()}>
                                            <Send className="h-6 w-6" />
                                        </Button>
                                    ) : (
                                        <Button variant="ghost" size="icon" className="text-muted-foreground shrink-0 h-9 w-9">
                                            <Mic className="h-6 w-6" />
                                        </Button>
                                    )}

                                    <Button variant="ghost" size="icon" className="text-muted-foreground shrink-0 h-9 w-9" onClick={() => fileInputRef.current?.click()}>
                                        <ImageIcon className="h-6 w-6" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <MessageCircle className="w-16 h-16 mb-4 opacity-20" />
                            <p>Chọn một người bạn để bắt đầu trò chuyện</p>
                        </div>
                    )}
                  </div>

                  {/* --- Right Sidebar: Info --- */}
                  {showRightSidebar && selectedContact && (
                    <div className="fixed inset-0 z-50 w-full lg:static lg:w-80 lg:z-auto border-l border-border bg-background flex flex-col shrink-0 animate-in slide-in-from-right duration-300">
                      {rightSidebarView === 'info' ? (
                        <>
                          <div className="h-16 border-b border-border flex items-center justify-between px-4 font-bold text-base shrink-0">
                            <span className="lg:hidden w-9"></span>
                            <span className="flex-1 text-center lg:text-left lg:flex-none">Thông tin hội thoại</span>
                            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setShowRightSidebar(false)}>
                                <X className="h-5 w-5" />
                            </Button>
                          </div>

                          <ScrollArea className="flex-1">
                            {/* Header Actions */}
                            <div className="p-4 flex justify-between items-start border-b border-border">
                               <div 
                                   className="flex flex-col items-center gap-2 cursor-pointer group w-1/3"
                                   onClick={() => {
                                       if (isMuted(selectedContact.id)) {
                                            setMutedContacts(prev => {
                                                const newMuted = { ...prev };
                                                delete newMuted[selectedContact.id];
                                                return newMuted;
                                            });
                                       } else {
                                           setIsMuteDialogOpen(true);
                                       }
                                   }}
                               >
                                  <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${
                                      isMuted(selectedContact.id) 
                                      ? 'bg-red-100 text-red-600' 
                                      : 'bg-secondary text-muted-foreground group-hover:bg-secondary/80'
                                  }`}>
                                    <BellOff className="h-5 w-5" />
                                  </div>
                                  <span className={`text-xs text-center font-medium transition-colors ${
                                      isMuted(selectedContact.id) ? 'text-red-600' : 'text-muted-foreground group-hover:text-foreground'
                                  }`}>
                                      {isMuted(selectedContact.id) ? 'Đã tắt' : 'Tắt thông\nbáo'}
                                  </span>
                               </div>
                               <div 
                                   className="flex flex-col items-center gap-2 cursor-pointer group w-1/3"
                                   onClick={() => togglePin(selectedContact.id)}
                               >
                                  <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${
                                      pinnedContacts.has(selectedContact.id) 
                                      ? 'bg-blue-100 text-blue-600' 
                                      : 'bg-secondary text-muted-foreground group-hover:bg-secondary/80'
                                  }`}>
                                    <Pin className={`h-5 w-5 ${pinnedContacts.has(selectedContact.id) ? 'fill-blue-600' : ''}`} />
                                  </div>
                                  <span className={`text-xs text-center font-medium transition-colors ${
                                      pinnedContacts.has(selectedContact.id) ? 'text-blue-600' : 'text-muted-foreground group-hover:text-foreground'
                                  }`}>
                                      {pinnedContacts.has(selectedContact.id) ? 'Đã ghim' : 'Ghim hội\nthoại'}
                                  </span>
                               </div>
                               <div className="flex flex-col items-center gap-2 cursor-pointer group w-1/3" onClick={() => {
                                   setIsCreateGroupOpen(true);
                                   if (selectedContact && selectedContact.profile.role !== 'Group') {
                                       setSelectedFriends(prev => prev.includes(selectedContact.id) ? prev : [...prev, selectedContact.id]);
                                   }
                               }}>
                                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-secondary/80 transition-colors">
                                    <UserPlus className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                  <span className="text-xs text-center font-medium text-muted-foreground group-hover:text-foreground transition-colors">Tạo nhóm<br/>trò chuyện</span>
                               </div>
                            </div>

                            {/* General Info List */}
                            <div className="p-4 space-y-4 border-b border-border">
                                <div 
                                    className="flex items-center gap-3 text-sm font-medium cursor-pointer hover:text-blue-600 transition-colors text-foreground/80"
                                    onClick={() => setIsAppointmentDialogOpen(true)}
                                >
                                    <Clock className="h-5 w-5 text-muted-foreground" />
                                    <span>Danh sách nhắc hẹn</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm font-medium cursor-pointer hover:text-blue-600 transition-colors text-foreground/80">
                                    <Users className="h-5 w-5 text-muted-foreground" />
                                    <span>0 nhóm chung</span>
                                </div>
                            </div>

                            {/* Accordions */}
                            <Accordion type="multiple" defaultValue={['images', 'files', 'links', 'security']} className="w-full">
                                
                                {/* Images/Videos */}
                                <AccordionItem value="images" className="border-b border-border px-4">
                                    <AccordionTrigger className="font-bold text-sm hover:no-underline py-4">Ảnh/Video</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="grid grid-cols-3 gap-2 mb-3">
                                            {messages.filter(m => m.type === 'image').slice(0, showAllImages ? undefined : 6).map(img => (
                                                <div key={img.id} className="aspect-square bg-secondary rounded-md overflow-hidden cursor-pointer border border-border hover:opacity-90 transition-opacity">
                                                    <img src={cleanUrl(img.file_url || img.content)} alt="img" className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                            {messages.filter(m => m.type === 'image').length === 0 && (
                                                <div className="col-span-3 text-center py-4 text-xs text-muted-foreground bg-secondary/10 rounded-lg">
                                                    Chưa có ảnh/video
                                                </div>
                                            )}
                                        </div>
                                        {messages.filter(m => m.type === 'image').length > 6 && (
                                            <Button 
                                                variant="secondary" 
                                                className="w-full text-xs h-8"
                                                onClick={() => setShowAllImages(!showAllImages)}
                                            >
                                                {showAllImages ? 'Thu gọn' : 'Xem tất cả'}
                                            </Button>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Files */}
                                <AccordionItem value="files" className="border-b border-border px-4">
                                    <AccordionTrigger className="font-bold text-sm hover:no-underline py-4">File</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-3 mb-3">
                                             {messages.filter(m => m.type === 'file').slice(0, showAllFiles ? undefined : 3).map(file => (
                                                <div key={file.id} className="flex items-center gap-3 p-2 bg-secondary/20 rounded-lg hover:bg-secondary/40 transition-colors cursor-pointer">
                                                    <div className="h-10 w-10 bg-blue-100 flex items-center justify-center rounded shrink-0">
                                                        <FileText className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0 overflow-hidden">
                                                        <p className="text-xs font-semibold truncate text-foreground">{file.content}</p>
                                                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                                            <span>10 KB</span>
                                                            <span>•</span>
                                                            <span>{new Date(file.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                             ))}
                                             {messages.filter(m => m.type === 'file').length === 0 && (
                                                <div className="text-center py-2 text-xs text-muted-foreground bg-secondary/10 rounded-lg">
                                                    Chưa có file
                                                </div>
                                            )}
                                        </div>
                                        {messages.filter(m => m.type === 'file').length > 3 && (
                                            <Button 
                                                variant="secondary" 
                                                className="w-full text-xs h-8"
                                                onClick={() => setShowAllFiles(!showAllFiles)}
                                            >
                                                {showAllFiles ? 'Thu gọn' : 'Xem tất cả'}
                                            </Button>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Links */}
                                <AccordionItem value="links" className="border-b border-border px-4">
                                    <AccordionTrigger className="font-bold text-sm hover:no-underline py-4">Link</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-3 mb-3">
                                             {messages.filter(m => m.type === 'link').slice(0, showAllLinks ? undefined : 3).map(link => {
                                                 let hostname = "";
                                                 try {
                                                     hostname = new URL(link.content).hostname;
                                                 } catch {
                                                     hostname = "link";
                                                 }
                                                 return (
                                                    <div key={link.id} className="flex items-center gap-3 p-2 bg-secondary/20 rounded-lg hover:bg-secondary/40 transition-colors">
                                                        <div className="h-10 w-10 bg-secondary flex items-center justify-center rounded shrink-0">
                                                            <Link className="h-4 w-4 text-foreground" />
                                                        </div>
                                                        <div className="flex-1 min-w-0 overflow-hidden">
                                                            <a href={link.content} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold truncate hover:underline block text-blue-600">{link.content}</a>
                                                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                                                <span>{hostname}</span>
                                                                <span>•</span>
                                                                <span>{new Date(link.created_at).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                 );
                                             })}
                                             {messages.filter(m => m.type === 'link').length === 0 && (
                                                <div className="text-center py-2 text-xs text-muted-foreground bg-secondary/10 rounded-lg">
                                                    Chưa có liên kết
                                                </div>
                                            )}
                                        </div>
                                        {messages.filter(m => m.type === 'link').length > 3 && (
                                            <Button 
                                                variant="secondary" 
                                                className="w-full text-xs h-8"
                                                onClick={() => setShowAllLinks(!showAllLinks)}
                                            >
                                                {showAllLinks ? 'Thu gọn' : 'Xem tất cả'}
                                            </Button>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                          </ScrollArea>
                        </>
                      ) : (
                        <>
                          <div className="h-16 border-b border-border flex items-center justify-between px-4 font-bold text-base shrink-0">
                              <span className="lg:hidden w-9"></span>
                              <span className="flex-1 text-center lg:text-left lg:flex-none">Tìm kiếm tin nhắn</span>
                              <Button variant="ghost" size="icon" onClick={() => setShowRightSidebar(false)}>
                                  <X className="h-5 w-5" />
                              </Button>
                          </div>
                          <div className="p-4 border-b border-border">
                              <div className="relative">
                              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                  placeholder="Tìm tin nhắn..."
                                  className="pl-9"
                                  value={messageSearchQuery}
                                  onChange={(e) => setMessageSearchQuery(e.target.value)}
                              />
                              </div>
                              <div className="flex gap-2 mt-3">
                              <Button variant="secondary" size="sm" className="h-7 text-xs">Tất cả</Button>
                              <Button variant="ghost" size="sm" className="h-7 text-xs">Thành viên</Button>
                              <Button variant="ghost" size="sm" className="h-7 text-xs">Ngày</Button>
                              </div>
                          </div>
                          <ScrollArea className="flex-1">
                              <div className="p-4 space-y-4">
                              {messages
                                  .filter(m => m.content && m.content.toLowerCase().includes(messageSearchQuery.toLowerCase()))
                                  .map(m => (
                                      <div 
                                          key={m.id} 
                                          className="p-3 rounded-lg bg-secondary/50 cursor-pointer hover:bg-secondary transition-colors"
                                          onClick={() => {
                                              const el = document.getElementById(`msg-${m.id}`);
                                              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                          }}
                                      >
                                          <div className="flex items-center gap-2 mb-1">
                                              <Avatar className="h-6 w-6">
                                                  <AvatarImage src={cleanUrl(m.sender_id === user.id ? user.user_metadata.avatar_url : selectedContact.profile.avatar_url)} />
                                                  <AvatarFallback>U</AvatarFallback>
                                              </Avatar>
                                              <span className="font-medium text-xs">
                                                  {m.sender_id === user.id ? 'Bạn' : selectedContact.profile.full_name}
                                              </span>
                                              <span className="text-[10px] text-muted-foreground ml-auto">
                                                  {new Date(m.created_at).toLocaleDateString()}
                                              </span>
                                          </div>
                                          <p className="text-sm line-clamp-2 text-muted-foreground">
                                              {m.content}
                                          </p>
                                      </div>
                                  ))
                              }
                              {messageSearchQuery && messages.filter(m => m.content?.toLowerCase().includes(messageSearchQuery.toLowerCase())).length === 0 && (
                                  <div className="text-center text-muted-foreground text-sm py-8">
                                      Không tìm thấy kết quả nào
                                  </div>
                              )}
                              {!messageSearchQuery && (
                                   <div className="text-center text-muted-foreground text-sm py-8">
                                      Nhập từ khóa để tìm kiếm
                                  </div>
                              )}
                              </div>
                          </ScrollArea>
                        </>
                      )}
                    </div>
                  )}
             </>
        )}
      </div>

      {/* Create Group Dialog */}
      <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo nhóm chat mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tên nhóm</label>
              <Input 
                placeholder="Nhập tên nhóm..." 
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Chọn thành viên ({selectedFriends.length})</label>
              <ScrollArea className="h-60 border rounded-md p-2">
                {contacts.filter(c => c.profile.role !== 'Group').length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Chưa có bạn bè để thêm vào nhóm.</p>
                ) : (
                    contacts.filter(c => c.profile.role !== 'Group').map(contact => (
                    <div 
                        key={contact.id} 
                        className="flex items-center justify-between p-2 hover:bg-secondary rounded cursor-pointer"
                        onClick={() => toggleFriendSelection(contact.id)}
                    >
                        <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={cleanUrl(contact.profile.avatar_url)} />
                            <AvatarFallback>{contact.profile.full_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{contact.profile.full_name}</span>
                        </div>
                        {selectedFriends.includes(contact.id) ? (
                            <div className="h-5 w-5 bg-blue-600 rounded flex items-center justify-center text-white">
                                <Check className="h-3 w-3" />
                            </div>
                        ) : (
                            <div className="h-5 w-5 border-2 rounded" />
                        )}
                    </div>
                    ))
                )}
              </ScrollArea>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCreateGroupOpen(false)}>Hủy</Button>
            <Button onClick={handleCreateGroup} disabled={isCreatingGroup || !groupName.trim() || selectedFriends.length === 0}>
                {isCreatingGroup ? <Loader2 className="animate-spin mr-2" /> : null}
                Tạo nhóm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mute Dialog */}
      <Dialog open={isMuteDialogOpen} onOpenChange={setIsMuteDialogOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Tắt thông báo</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <p className="text-sm text-muted-foreground">Chọn thời gian tắt thông báo cho cuộc trò chuyện này:</p>
                
                <div className="space-y-2">
                    {[
                        { id: '1h', label: 'Trong 1 giờ' },
                        { id: '4h', label: 'Trong 4 giờ' },
                        { id: '8am', label: 'Cho đến 8:00 AM ngày mai' },
                        { id: 'until_on', label: 'Cho đến khi được mở lại' }
                    ].map((option) => (
                        <div 
                            key={option.id}
                            className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                muteDuration === option.id 
                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                                : 'border-border hover:bg-secondary/50'
                            }`}
                            onClick={() => setMuteDuration(option.id)}
                        >
                            <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                                muteDuration === option.id ? 'border-blue-600' : 'border-muted-foreground'
                            }`}>
                                {muteDuration === option.id && <div className="h-2 w-2 rounded-full bg-blue-600" />}
                            </div>
                            <span className="text-sm font-medium">{option.label}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsMuteDialogOpen(false)}>Hủy</Button>
                <Button onClick={handleMuteConfirm}>Xác nhận</Button>
            </div>
        </DialogContent>
      </Dialog>

      {/* Appointment Dialog */}
      <Dialog open={isAppointmentDialogOpen} onOpenChange={setIsAppointmentDialogOpen}>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>
                    {isCreatingAppointment ? 'Tạo lịch hẹn mới' : 'Danh sách nhắc hẹn'}
                </DialogTitle>
            </DialogHeader>

            {isCreatingAppointment ? (
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nội dung</label>
                        <Input 
                            placeholder="Nhập nội dung cuộc hẹn..." 
                            value={newAppointmentTitle}
                            onChange={(e) => setNewAppointmentTitle(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Thời gian</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            <Badge variant="outline" className="cursor-pointer hover:bg-secondary" onClick={() => {
                                const d = new Date();
                                d.setMinutes(d.getMinutes() + 15);
                                const offset = d.getTimezoneOffset() * 60000;
                                const localISOTime = (new Date(d.getTime() - offset)).toISOString().slice(0, 16);
                                setNewAppointmentTime(localISOTime);
                            }}>15 phút nữa</Badge>
                            <Badge variant="outline" className="cursor-pointer hover:bg-secondary" onClick={() => {
                                const d = new Date();
                                d.setMinutes(d.getMinutes() + 30);
                                const offset = d.getTimezoneOffset() * 60000;
                                const localISOTime = (new Date(d.getTime() - offset)).toISOString().slice(0, 16);
                                setNewAppointmentTime(localISOTime);
                            }}>30 phút nữa</Badge>
                            <Badge variant="outline" className="cursor-pointer hover:bg-secondary" onClick={() => {
                                const d = new Date();
                                d.setDate(d.getDate() + 1);
                                d.setHours(9, 0, 0, 0);
                                const offset = d.getTimezoneOffset() * 60000;
                                const localISOTime = (new Date(d.getTime() - offset)).toISOString().slice(0, 16);
                                setNewAppointmentTime(localISOTime);
                            }}>9:00 ngày mai</Badge>
                        </div>
                        <Input 
                            type="datetime-local" 
                            value={newAppointmentTime}
                            onChange={(e) => setNewAppointmentTime(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Lặp lại</label>
                        <Select value={appointmentRepeat} onValueChange={(v: any) => setAppointmentRepeat(v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn lặp lại" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Không lặp lại</SelectItem>
                                <SelectItem value="daily">Hàng ngày</SelectItem>
                                <SelectItem value="weekly">Hàng tuần</SelectItem>
                                <SelectItem value="monthly">Hàng tháng</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setIsCreatingAppointment(false)}>Hủy</Button>
                        <Button onClick={handleCreateAppointment} disabled={!newAppointmentTitle || !newAppointmentTime}>Tạo lịch hẹn</Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4 py-4">
                    <Button className="w-full" onClick={() => setIsCreatingAppointment(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Tạo lịch hẹn
                    </Button>
                    
                    <ScrollArea className="h-[300px] pr-4">
                        <div className="space-y-2">
                            {appointments.length === 0 ? (
                                 <div className="text-center text-muted-foreground py-8">
                                     Chưa có lịch hẹn nào.
                                 </div>
                            ) : (
                                appointments
                                    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
                                    .map(apt => (
                                    <div key={apt.id} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border border-border">
                                        <div className="flex gap-3 items-start">
                                            <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded flex items-center justify-center shrink-0">
                                                <Calendar className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">{apt.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(apt.time).toLocaleString('vi-VN', { 
                                                        weekday: 'short', 
                                                        year: 'numeric', 
                                                        month: 'numeric', 
                                                        day: 'numeric', 
                                                        hour: '2-digit', 
                                                        minute: '2-digit' 
                                                    })}
                                                </p>
                                                {(apt as any).repeat && (apt as any).repeat !== 'none' && (
                                                    <Badge variant="secondary" className="mt-1 text-[10px] h-5">
                                                        {((apt as any).repeat === 'daily' && 'Hàng ngày') ||
                                                         ((apt as any).repeat === 'weekly' && 'Hàng tuần') ||
                                                         ((apt as any).repeat === 'monthly' && 'Hàng tháng')}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                            onClick={() => handleDeleteAppointment(apt.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>
            )}
        </DialogContent>
      </Dialog>
      </div>


    </div>
  );
};
