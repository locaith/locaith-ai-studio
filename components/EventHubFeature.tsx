import React from 'react';
import { Search, Bell, Calendar, QrCode, Ticket, Bookmark, ChevronRight, ChevronLeft, MapPin, Star } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useNavigate } from 'react-router-dom';

export const EventHubFeature = () => {
  const navigate = useNavigate();
  const categories = [
    { id: 'tech', label: 'Công nghệ', count: 124, icon: '💻' },
    { id: 'real-estate', label: 'Bất động sản', count: 86, icon: '🏢' },
    { id: 'marketing', label: 'Marketing', count: 45, icon: '📈' },
    { id: 'startup', label: 'Startups', count: 32, icon: '🚀' },
    { id: 'finance', label: 'Tài chính', count: 28, icon: '💰' },
  ];

  const featuredEvents = [
    {
      id: 1,
      title: "Vietnam Tech Summit 2024",
      date: "15-17/03/2024",
      location: "TP.HCM",
      price: "1.500.000đ",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop",
      tags: ["Công nghệ", "Hot"],
      isHot: true
    },
    {
      id: 2,
      title: "Startup Connect Global",
      date: "22-23/03/2024",
      location: "Hà Nội",
      price: "Miễn phí",
      image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=2070&auto=format&fit=crop",
      tags: ["Khởi nghiệp"],
      isHot: false
    },
    {
      id: 3,
      title: "AI Revolution Conference",
      date: "05/04/2024",
      location: "Đà Nẵng",
      price: "2.000.000đ",
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=2070&auto=format&fit=crop",
      tags: ["AI", "Technology"],
      isHot: true
    }
  ];

  const upcomingEvents = [
    {
      id: 4,
      title: "VietBuild Expo 2024",
      date: "12/04",
      location: "SECC",
      category: "Bất động sản",
      image: "https://images.unsplash.com/photo-1504384308090-c54be3855833?q=80&w=1924&auto=format&fit=crop"
    },
    {
      id: 5,
      title: "HR Summit Vietnam",
      date: "20/04",
      location: "InterContinental",
      category: "Nhân sự",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop"
    },
    {
      id: 6,
      title: "Marketing Future 2024",
      date: "25/04",
      location: "GEM Center",
      category: "Marketing",
      image: "https://images.unsplash.com/photo-1551818255-e6e10975bc17?q=80&w=1973&auto=format&fit=crop"
    }
  ];

  return (
    <div className="min-h-full bg-background pb-20 md:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50 pt-[env(safe-area-inset-top)]">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-2">
            <Button 
                variant="ghost" 
                size="icon" 
                className="-ml-2 mr-1 h-8 w-8 text-muted-foreground hover:text-foreground" 
                onClick={() => navigate(-1)}
            >
                <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="bg-orange-500 rounded-lg p-1.5">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-foreground">EventHub</span>
          </div>
          <div className="flex items-center gap-4">
            <Search className="w-6 h-6 text-muted-foreground" />
            <div className="relative">
              <Bell className="w-6 h-6 text-muted-foreground" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-background"></span>
            </div>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Tìm sự kiện, hội nghị..." 
              className="pl-9 bg-secondary/50 border-transparent focus:bg-background focus:border-primary/20 transition-all rounded-xl h-11 text-base"
            />
          </div>
        </div>
      </div>

      <div className="pb-24 pt-4">
        {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-2 px-4 mb-8">
            <div className="flex flex-col items-center gap-2 cursor-pointer group">
              <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-200 transition-transform group-active:scale-95">
                <QrCode className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Check-in</span>
            </div>
            <div className="flex flex-col items-center gap-2 cursor-pointer group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200 transition-transform group-active:scale-95">
                <Ticket className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Vé của tôi</span>
            </div>
            <div className="flex flex-col items-center gap-2 cursor-pointer group">
              <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-200 transition-transform group-active:scale-95">
                <Bookmark className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Đã lưu</span>
            </div>
            <div className="flex flex-col items-center gap-2 cursor-pointer group">
              <div className="w-14 h-14 rounded-2xl bg-purple-500 flex items-center justify-center text-white shadow-lg shadow-purple-200 transition-transform group-active:scale-95">
                <Bell className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Thông báo</span>
            </div>
          </div>

          {/* Categories */}
          <div className="mb-8">
            <div className="flex items-center justify-between px-4 mb-3">
              <h3 className="font-bold text-foreground">Danh mục</h3>
              <span className="text-xs font-medium text-orange-500 cursor-pointer">Tất cả</span>
            </div>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex px-4 gap-3 pb-4">
                {categories.map((cat) => (
                  <button 
                    key={cat.id}
                    className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl shadow-sm min-w-max active:bg-secondary transition-colors hover:bg-secondary/50"
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <span className="text-sm font-semibold text-foreground">
                      {cat.label} <span className="text-muted-foreground font-normal">({cat.count})</span>
                    </span>
                  </button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>
          </div>

          {/* Featured Events */}
          <div className="mb-8">
            <div className="flex items-center justify-between px-4 mb-3">
              <h3 className="font-bold text-foreground text-lg">Sự kiện nổi bật</h3>
              <div className="flex items-center text-orange-500 text-xs font-medium cursor-pointer">
                Xem tất cả <ChevronRight className="w-3 h-3 ml-0.5" />
              </div>
            </div>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex px-4 gap-4 pb-4">
                {featuredEvents.map((event) => (
                  <div key={event.id} className="relative w-[280px] group cursor-pointer" onClick={() => navigate(`/events/${event.id}`)}>
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-3">
                      <img 
                        src={event.image} 
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                      
                      {/* Tags */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        {event.tags.map((tag, idx) => (
                          <Badge 
                            key={idx} 
                            className={cn(
                              "border-none px-2.5 py-0.5 h-6 text-xs font-medium rounded-full",
                              tag === "Hot" ? "bg-amber-400 text-amber-950" : "bg-orange-500 text-white"
                            )}
                          >
                            {tag === "Hot" && <Star className="w-3 h-3 mr-1 fill-amber-950" />}
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Bookmark */}
                      <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 transition-colors">
                        <Bookmark className="w-4 h-4" />
                      </button>

                      {/* Price Badge */}
                      <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-slate-900 shadow-sm">
                        {event.price}
                      </div>
                    </div>

                    <h4 className="font-bold text-foreground text-base mb-1 truncate pr-2">{event.title}</h4>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-orange-500" />
                        {event.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-orange-500" />
                        {event.location}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>
          </div>

          {/* Upcoming Events */}
          <div className="px-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground text-lg">Sắp diễn ra</h3>
              <div className="flex items-center text-orange-500 text-xs font-medium cursor-pointer">
                Xem tất cả
              </div>
            </div>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center p-3 bg-card rounded-2xl border border-border/50 shadow-sm active:scale-[0.99] transition-transform cursor-pointer hover:bg-secondary/50" onClick={() => navigate(`/events/${event.id}`)}>
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                    <img 
                      src={event.image} 
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 ml-3">
                    <h4 className="font-bold text-foreground text-sm mb-1 truncate">{event.title}</h4>
                    <Badge variant="secondary" className="h-5 px-2 text-[10px] bg-orange-50 text-orange-600 hover:bg-orange-100 border-none mb-1.5 rounded-md">
                      {event.category}
                    </Badge>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {event.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {event.location}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 ml-2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
  );
};

export default EventHubFeature;
