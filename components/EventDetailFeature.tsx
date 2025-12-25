import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  MoreHorizontal, 
  ThumbsUp, 
  MessageCircle, 
  Share2, 
  MapPin, 
  Calendar, 
  Users,
  CheckCircle2,
  Image as ImageIcon,
  Send
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Mock data for the event detail
const EVENT_DATA = {
  id: 1,
  title: "Vietnam Tech Summit 2024",
  coverImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop",
  avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&q=80&auto=format&fit=crop",
  category: "Công nghệ",
  date: "15-17/03/2024",
  location: "Trung tâm Hội nghị SECC, TP.HCM",
  stats: {
    likes: "12K",
    followers: "15K",
    going: "2.5K"
  },
  description: "Sự kiện công nghệ lớn nhất năm quy tụ hơn 500 doanh nghiệp và 50 diễn giả hàng đầu thế giới.",
  posts: [
    {
      id: 101,
      author: "Vietnam Tech Summit 2024",
      avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&q=80&auto=format&fit=crop",
      time: "2 giờ trước",
      content: "🔥 CHÍNH THỨC: DANH SÁCH DIỄN GIẢ KHÁCH MỜI\n\nChúng tôi vinh dự được chào đón các chuyên gia hàng đầu từ Google, Microsoft và Amazon sẽ có mặt tại sự kiện năm nay.\n\nĐừng bỏ lỡ cơ hội giao lưu và học hỏi những xu hướng công nghệ mới nhất!\n\n#VTS2024 #TechSummit #AI #Blockchain",
      images: [
        "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&q=80&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1544531696-60c35eb52270?w=800&q=80&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80&auto=format&fit=crop"
      ],
      likes: 452,
      comments: 89,
      shares: 34
    },
    {
      id: 102,
      author: "Vietnam Tech Summit 2024",
      avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&q=80&auto=format&fit=crop",
      time: "5 giờ trước",
      content: "Không khí chuẩn bị đang rất nóng! Các gian hàng đang được gấp rút hoàn thiện để chào đón khách tham quan vào ngày mai.\n\nCác bạn đã sẵn sàng chưa? 👇",
      images: [
        "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80&auto=format&fit=crop"
      ],
      likes: 1205,
      comments: 234,
      shares: 112
    }
  ]
};

const PostItem = ({ post }: { post: any }) => {
  return (
    <div className="bg-background mb-3 md:rounded-xl md:border md:border-border/50 shadow-sm">
      {/* Post Header */}
      <div className="p-4 flex items-start justify-between">
        <div className="flex gap-3">
          <Avatar className="w-10 h-10 border border-border">
            <AvatarImage src={post.avatar} />
            <AvatarFallback>EV</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-1">
              <h4 className="font-bold text-sm text-foreground">{post.author}</h4>
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-500/10" />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>{post.time}</span>
              <span>•</span>
              <Users className="w-3 h-3" />
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="text-sm text-foreground whitespace-pre-line">{post.content}</p>
      </div>

      {/* Post Images */}
      {post.images && post.images.length > 0 && (
        <div className={cn(
          "grid gap-1 mb-3",
          post.images.length === 1 ? "grid-cols-1" : 
          post.images.length === 2 ? "grid-cols-2" : 
          "grid-cols-2"
        )}>
          {post.images.map((img: string, idx: number) => (
            <div key={idx} className={cn(
              "relative overflow-hidden bg-secondary",
              post.images.length === 1 ? "aspect-video" : "aspect-square",
              post.images.length === 3 && idx === 0 ? "col-span-2 aspect-video" : ""
            )}>
              <img src={img} alt="Post content" className="object-cover w-full h-full" />
            </div>
          ))}
        </div>
      )}

      {/* Post Stats */}
      <div className="px-4 py-2 flex items-center justify-between text-xs text-muted-foreground border-b border-border/50">
        <div className="flex items-center gap-1">
          <div className="bg-blue-500 rounded-full p-0.5">
            <ThumbsUp className="w-2.5 h-2.5 text-white fill-white" />
          </div>
          <span>{post.likes}</span>
        </div>
        <div className="flex gap-3">
          <span>{post.comments} bình luận</span>
          <span>{post.shares} chia sẻ</span>
        </div>
      </div>

      {/* Post Actions */}
      <div className="px-2 py-1 flex items-center justify-between">
        <Button variant="ghost" className="flex-1 gap-2 text-muted-foreground hover:text-foreground">
          <ThumbsUp className="w-5 h-5" />
          <span className="text-sm font-medium">Thích</span>
        </Button>
        <Button variant="ghost" className="flex-1 gap-2 text-muted-foreground hover:text-foreground">
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Bình luận</span>
        </Button>
        <Button variant="ghost" className="flex-1 gap-2 text-muted-foreground hover:text-foreground">
          <Share2 className="w-5 h-5" />
          <span className="text-sm font-medium">Chia sẻ</span>
        </Button>
      </div>
    </div>
  );
};

export const EventDetailFeature = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('posts');

  // In a real app, fetch event details by ID
  const event = EVENT_DATA;

  return (
    <div className="min-h-full bg-secondary/30 pb-20 md:pb-0">
      {/* Top Nav */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 pt-[env(safe-area-inset-top)]">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="-ml-2" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <span className="font-semibold text-lg line-clamp-1">{event.title}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon">
              <Search className="w-6 h-6" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Cover & Profile Header */}
      <div className="bg-background pb-4 mb-3">
        <div className="relative h-48 md:h-64 bg-muted">
          <img 
            src={event.coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
        
        <div className="px-4 -mt-16 relative">
          <div className="flex justify-between items-end">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-background overflow-hidden bg-muted">
                <img src={event.avatar} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-2 right-2 bg-blue-500 rounded-full p-1 border-2 border-background">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          <div className="mt-3">
            <h1 className="text-2xl font-bold text-foreground">{event.title}</h1>
            <div className="text-sm text-muted-foreground font-medium mt-1 flex items-center gap-2">
              <span>{event.category}</span>
              <span>•</span>
              <span>{event.stats.likes} người thích</span>
            </div>
          </div>

          {/* Quick Stats/Info */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{event.location}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-5">
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              Đăng ký tham gia
            </Button>
            <Button variant="secondary" className="flex-1 gap-2 font-semibold bg-secondary hover:bg-secondary/80">
              <MessageCircle className="w-4 h-4" />
              Nhắn tin
            </Button>
            <Button variant="secondary" size="icon" className="bg-secondary hover:bg-secondary/80">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-4 mt-4 border-t border-border/50">
          {['Bài viết', 'Giới thiệu', 'Ảnh', 'Sự kiện'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab === 'Bài viết' ? 'posts' : tab.toLowerCase())}
              className={cn(
                "flex-1 py-3 text-sm font-semibold border-b-2 transition-colors",
                (tab === 'Bài viết' && activeTab === 'posts') || activeTab === tab.toLowerCase()
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-3xl mx-auto md:px-4">
        {/* Create Post Input (Simulated) */}
        <div className="bg-background p-4 mb-3 md:rounded-xl md:border md:border-border/50 flex gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>ME</AvatarFallback>
          </Avatar>
          <div className="flex-1 bg-secondary/50 rounded-full px-4 flex items-center text-muted-foreground text-sm cursor-pointer hover:bg-secondary transition-colors">
            Viết bình luận hoặc thắc mắc...
          </div>
          <Button variant="ghost" size="icon" className="text-green-600">
            <ImageIcon className="w-6 h-6" />
          </Button>
        </div>

        {/* Posts Feed */}
        <div className="space-y-3">
          <div className="bg-background p-4 mb-3 md:rounded-xl md:border md:border-border/50 shadow-sm">
            <h3 className="font-bold text-lg mb-2">Giới thiệu</h3>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {event.description}
            </p>
            <Button variant="link" className="px-0 text-blue-600 h-auto mt-1">Xem thêm chi tiết</Button>
          </div>

          {event.posts.map((post) => (
            <PostItem key={post.id} post={post} />
          ))}
        </div>
        
        <div className="h-10" /> {/* Bottom spacer */}
      </div>
    </div>
  );
};

export default EventDetailFeature;
