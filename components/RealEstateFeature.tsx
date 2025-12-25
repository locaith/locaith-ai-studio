import React from 'react';
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Home, MapPin, Filter, BedDouble, Bath, Square } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const RealEstateFeature = () => {
  const navigate = useNavigate();

  const categories = [
    { id: "apartment", label: "Căn hộ" },
    { id: "house", label: "Nhà phố" },
    { id: "villa", label: "Biệt thự" },
    { id: "land", label: "Đất nền" },
    { id: "office", label: "Văn phòng" },
  ];

  const listings = [
    {
      id: 1,
      title: "Vinhomes Central Park - Landmark 81",
      location: "Bình Thạnh, TP.HCM",
      price: "8.5 Tỷ",
      type: "Căn hộ",
      beds: 3,
      baths: 2,
      area: "110m²",
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80&auto=format&fit=crop",
      tag: "HOT"
    },
    {
      id: 2,
      title: "Biệt thự Thảo Điền view sông",
      location: "Thủ Đức, TP.HCM",
      price: "45 Tỷ",
      type: "Biệt thự",
      beds: 5,
      baths: 6,
      area: "350m²",
      image: "https://images.unsplash.com/photo-1613977257377-9882621663a8?w=800&q=80&auto=format&fit=crop",
      tag: "VIP"
    },
    {
      id: 3,
      title: "Nhà phố thương mại Sala",
      location: "Thủ Thiêm, TP.HCM",
      price: "32 Tỷ",
      type: "Nhà phố",
      beds: 4,
      baths: 4,
      area: "180m²",
      image: "https://images.unsplash.com/photo-1600596542815-2495db9dc2c3?w=800&q=80&auto=format&fit=crop",
      tag: "Mới"
    },
    {
      id: 4,
      title: "Penthouse Empire City",
      location: "Thủ Thiêm, TP.HCM",
      price: "60 Tỷ",
      type: "Căn hộ",
      beds: 4,
      baths: 5,
      area: "250m²",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80&auto=format&fit=crop",
      tag: "Premium"
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50 pt-[env(safe-area-inset-top)]">
        <div className="flex items-center px-4 h-16 gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 rounded-lg p-1.5">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-foreground">Bất động sản</span>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Tìm kiếm theo khu vực, dự án..." 
              className="pl-9 bg-secondary/50 border-transparent focus:bg-background focus:border-primary/20 rounded-xl"
            />
            <Button size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Categories */}
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">Khám phá</h2>
                <Button variant="link" className="text-primary h-auto p-0">Xem tất cả</Button>
            </div>
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex space-x-3 pb-2">
                    {categories.map((cat) => (
                        <Button
                            key={cat.id}
                            variant="outline"
                            className="rounded-full border-muted-foreground/20 hover:border-primary hover:text-primary hover:bg-primary/5"
                        >
                            {cat.label}
                        </Button>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>

        {/* Featured Listings */}
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">Nổi bật nhất</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {listings.map((item) => (
                    <Card key={item.id} className="overflow-hidden border-border/50 group cursor-pointer hover:shadow-lg transition-all">
                        <div className="relative aspect-[4/3] overflow-hidden">
                            <img 
                                src={item.image} 
                                alt={item.title}
                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-3 left-3">
                                <Badge className="bg-primary/90 hover:bg-primary border-0">
                                    {item.tag}
                                </Badge>
                            </div>
                            <div className="absolute bottom-3 left-3">
                                <Badge variant="secondary" className="backdrop-blur-md bg-black/50 text-white border-0">
                                    {item.price}
                                </Badge>
                            </div>
                        </div>
                        <CardContent className="p-4">
                            <div className="space-y-2">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-semibold line-clamp-1">{item.title}</h3>
                                </div>
                                <div className="flex items-center text-muted-foreground text-sm">
                                    <MapPin className="w-3.5 h-3.5 mr-1" />
                                    {item.location}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t border-border/50 mt-2">
                                    <div className="flex items-center gap-1">
                                        <BedDouble className="w-4 h-4" />
                                        <span>{item.beds}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Bath className="w-4 h-4" />
                                        <span>{item.baths}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Square className="w-4 h-4" />
                                        <span>{item.area}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>

        {/* AI Valuation Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white relative overflow-hidden">
            <div className="relative z-10 space-y-4">
                <h3 className="text-xl font-bold">Định giá AI</h3>
                <p className="text-indigo-100 max-w-xs">
                    Sử dụng trí tuệ nhân tạo để định giá bất động sản của bạn chính xác nhất.
                </p>
                <Button variant="secondary" className="text-indigo-600 font-semibold">
                    Định giá ngay
                </Button>
            </div>
            <div className="absolute right-0 bottom-0 opacity-20 translate-x-1/4 translate-y-1/4">
                <Home className="w-40 h-40" />
            </div>
        </div>
      </div>
    </div>
  );
};
