import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  MessageSquare, 
  Clock, 
  Calendar, 
  MoreVertical, 
  Trash2, 
  CornerUpLeft 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HistorySession {
  id: string;
  title: string;
  preview: string;
  date: Date;
  messageCount: number;
}

const MOCK_HISTORY: HistorySession[] = [
  {
    id: '1',
    title: "Lập kế hoạch marketing cho quán cafe",
    preview: "Tôi muốn mở một quán cafe nhỏ ở quận 1, bạn có thể giúp tôi lập kế hoạch marketing không?",
    date: new Date(), // Today
    messageCount: 12
  },
  {
    id: '2',
    title: "Viết email xin việc Marketing Manager",
    preview: "Hãy giúp tôi viết một email xin việc ấn tượng cho vị trí Marketing Manager tại công ty công nghệ.",
    date: new Date(Date.now() - 86400000), // Yesterday
    messageCount: 5
  },
  {
    id: '3',
    title: "Tư vấn thiết kế nội thất phòng ngủ",
    preview: "Phòng ngủ của tôi diện tích 15m2, tôi thích phong cách tối giản (Minimalism).",
    date: new Date(Date.now() - 86400000 * 2), // 2 days ago
    messageCount: 8
  },
  {
    id: '4',
    title: "Tìm hiểu về React Hooks",
    preview: "Giải thích cho tôi về useEffect và useMemo trong React.",
    date: new Date(Date.now() - 86400000 * 5), // 5 days ago
    messageCount: 20
  },
  {
    id: '5',
    title: "Ý tưởng quà tặng sinh nhật",
    preview: "Gợi ý quà tặng sinh nhật cho bạn gái thích đọc sách và yêu mèo.",
    date: new Date(Date.now() - 86400000 * 10), // 10 days ago
    messageCount: 6
  }
];

export const HistoryFeature = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sessions, setSessions] = useState<HistorySession[]>(MOCK_HISTORY);

  const filteredSessions = sessions.filter(session => 
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupSessionsByDate = (sessions: HistorySession[]) => {
    const groups: { [key: string]: HistorySession[] } = {
      'Hôm nay': [],
      'Hôm qua': [],
      '7 ngày trước': [],
      'Cũ hơn': []
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    sessions.forEach(session => {
      const date = new Date(session.date);
      date.setHours(0, 0, 0, 0);

      if (date.getTime() === today.getTime()) {
        groups['Hôm nay'].push(session);
      } else if (date.getTime() === yesterday.getTime()) {
        groups['Hôm qua'].push(session);
      } else if (date > lastWeek) {
        groups['7 ngày trước'].push(session);
      } else {
        groups['Cũ hơn'].push(session);
      }
    });

    return groups;
  };

  const groupedSessions = groupSessionsByDate(filteredSessions);

  const handleDelete = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const handleOpenSession = (id: string) => {
    // Navigate to chat with session context
    // For now, just navigate to dashboard/chat
    navigate('/');
  };

  return (
    <div className="h-full w-full bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b h-[calc(3.5rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Lịch sử hoạt động</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
             <Calendar className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Tìm kiếm cuộc hội thoại..." 
            className="pl-9 bg-secondary/50 border-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {Object.entries(groupedSessions).map(([label, group]) => (
            group.length > 0 && (
              <div key={label} className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground px-2">{label}</h3>
                <div className="space-y-1">
                  {group.map(session => (
                    <div 
                      key={session.id}
                      className="group flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer"
                      onClick={() => handleOpenSession(session.id)}
                    >
                      <div className="mt-1 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <MessageSquare className="h-4 w-4 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-medium truncate text-foreground group-hover:text-primary transition-colors">
                            {session.title}
                          </h4>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {session.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate pr-4">
                          {session.preview}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                            {session.messageCount} tin nhắn
                          </span>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleOpenSession(session.id);
                          }}>
                            <CornerUpLeft className="h-4 w-4 mr-2" />
                            Tiếp tục
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(session.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}

          {filteredSessions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">Không tìm thấy kết quả</h3>
              <p className="text-muted-foreground max-w-xs mt-2">
                Thử tìm kiếm với từ khóa khác hoặc bắt đầu một cuộc hội thoại mới.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
