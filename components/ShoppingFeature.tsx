import React from 'react';
import { useNavigate } from "react-router-dom";
import { 
  Search, ShoppingCart, ArrowLeft, Heart, User, Home, Menu, 
  Coins, CreditCard, Tag, Globe, Shirt, Gamepad2, Sparkles, 
  Smartphone, Baby, LayoutGrid, Timer, Star, Flame
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";

export const ShoppingFeature = () => {
  const navigate = useNavigate();

  const categories = [
    { label: "Săn xu", icon: <Coins className="w-6 h-6 text-yellow-500" />, color: "bg-yellow-100" },
    { label: "Thanh toán", icon: <CreditCard className="w-6 h-6 text-blue-500" />, color: "bg-blue-100" },
    { label: "Săn Deal", icon: <Tag className="w-6 h-6 text-red-500" />, color: "bg-red-100" },
    { label: "Quốc tế", icon: <Globe className="w-6 h-6 text-purple-500" />, color: "bg-purple-100" },
    { label: "Thời trang", icon: <Shirt className="w-6 h-6 text-pink-500" />, color: "bg-pink-100" },
    { label: "Giải trí", icon: <Gamepad2 className="w-6 h-6 text-green-500" />, color: "bg-green-100" },
    { label: "Làm đẹp", icon: <Sparkles className="w-6 h-6 text-rose-500" />, color: "bg-rose-100" },
    { label: "Nạp thẻ", icon: <Smartphone className="w-6 h-6 text-indigo-500" />, color: "bg-indigo-100" },
    { label: "Mẹ & Bé", icon: <Baby className="w-6 h-6 text-cyan-500" />, color: "bg-cyan-100" },
    { label: "Danh mục", icon: <LayoutGrid className="w-6 h-6 text-orange-500" />, color: "bg-orange-100" },
  ];

  const flashSaleItems = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&q=80",
      price: "16.900 ₫",
      original: "35.000 ₫",
      sold: 153,
      discount: "-52%"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400&q=80",
      price: "2.600 ₫",
      original: "5.000 ₫",
      sold: 2968,
      discount: "-48%"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&q=80",
      price: "13.800 ₫",
      original: "25.000 ₫",
      sold: 461,
      discount: "-45%"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
      price: "150.000 ₫",
      original: "300.000 ₫",
      sold: 89,
      discount: "-50%"
    }
  ];

  const forYouItems = [
    {
      id: 1,
      title: "Combo 10 Kẹp Tóc Ngôi Sao Thời Trang Hàn Quốc",
      price: "13.800 ₫",
      sold: "803",
      rating: 5,
      image: "https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=400&q=80",
      tag: "Flash Sale"
    },
    {
      id: 2,
      title: "Dép mang trong nhà cute dễ thương êm chân",
      price: "13.600 ₫",
      sold: "1.6k",
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1562183241-b937e95585b6?w=400&q=80",
      tag: "Choice"
    },
    {
      id: 3,
      title: "Bàn phím cơ Aula S75 Pro Custom",
      price: "120.000 ₫",
      sold: "686",
      rating: 5,
      image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=400&q=80",
      tag: "Best Seller"
    },
    {
      id: 4,
      title: "Thảm lau chân thấm hút nước hình hoa",
      price: "20.000 ₫",
      sold: "4159",
      rating: 5,
      image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80",
      tag: "Flash Sale"
    },
    {
      id: 5,
      title: "Tai nghe Bluetooth không dây chống ồn",
      price: "89.000 ₫",
      sold: "10k+",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1572569028738-411a561064a2?w=400&q=80",
      tag: "Official"
    },
    {
      id: 6,
      title: "Áo thun cotton unisex form rộng",
      price: "45.000 ₫",
      sold: "5.2k",
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80",
      tag: "Mall"
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-background border-b border-border/50 pt-[env(safe-area-inset-top)]">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" className="-ml-2" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Tìm kiếm sản phẩm..." 
              className="pl-9 pr-20 h-10 rounded-full border-primary/20 bg-secondary/50 focus:bg-background transition-all"
            />
            <Button 
              size="sm" 
              className="absolute right-1 top-1 bottom-1 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white border-0 px-4"
            >
              Search
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <ShoppingCart className="w-6 h-6" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Categories Grid */}
        <div className="grid grid-cols-5 gap-y-4 gap-x-2">
          {categories.map((cat, index) => (
            <div key={index} className="flex flex-col items-center gap-1.5 cursor-pointer group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.color} group-hover:scale-110 transition-transform`}>
                {cat.icon}
              </div>
              <span className="text-[10px] font-medium text-center leading-tight line-clamp-2 text-muted-foreground">
                {cat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Flash Sale */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-orange-500 italic">LazFlash Sale</h3>
              <div className="flex items-center gap-1 bg-black text-white px-2 py-0.5 rounded text-xs font-mono">
                <span>02</span>:<span>15</span>:<span>40</span>
              </div>
            </div>
            <Button variant="link" className="text-muted-foreground text-xs h-auto p-0">
              Xem thêm &gt;
            </Button>
          </div>
          
          <ScrollArea className="w-full whitespace-nowrap -mx-4 px-4">
            <div className="flex gap-3 pb-2">
              {flashSaleItems.map((item) => (
                <Card key={item.id} className="w-[140px] flex-shrink-0 overflow-hidden border-border/50">
                  <div className="relative aspect-square">
                    <img src={item.image} alt="Product" className="w-full h-full object-cover" />
                    <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-bl-lg">
                      {item.discount}
                    </div>
                  </div>
                  <div className="p-2 space-y-1">
                    <div className="font-bold text-red-500 text-sm">{item.price}</div>
                    <div className="text-[10px] text-muted-foreground line-through">{item.original}</div>
                    <div className="w-full bg-secondary rounded-full h-3 relative overflow-hidden mt-1">
                      <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-orange-500 to-red-500 w-[70%]" />
                      <div className="absolute inset-0 flex items-center justify-center text-[8px] text-white font-medium">
                        Đã bán {item.sold}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {/* Recommendations */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg">Dành riêng cho bạn</h3>
          <div className="grid grid-cols-2 gap-3">
            {forYouItems.map((item) => (
              <Card key={item.id} className="overflow-hidden border-border/50 hover:shadow-md transition-all cursor-pointer">
                <div className="aspect-square relative">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  {item.tag && (
                    <div className="absolute top-0 left-0 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-br-lg">
                      {item.tag}
                    </div>
                  )}
                </div>
                <div className="p-2 space-y-2">
                  <h4 className="text-sm font-medium line-clamp-2 leading-snug">{item.title}</h4>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-red-500 font-bold">{item.price}</span>
                      <span className="text-[10px] text-muted-foreground">Đã bán {item.sold}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < Math.floor(item.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
