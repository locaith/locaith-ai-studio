import React from 'react';
import { ArrowLeft, Check, Zap, Crown, Building2, Rocket, Globe } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "../src/hooks/useAuth";

export const UpgradeFeature = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Mock current user data
  const currentPlan = "Free";
  const currentCredits = 1250;

  const packages = [
    {
      name: "Free",
      price: "0 đ",
      period: "vĩnh viễn",
      credits: 50,
      color: "border-border",
      features: [
        "50 Credits mỗi tháng",
        "Truy cập tính năng cơ bản",
        "Hỗ trợ cộng đồng"
      ],
      current: true
    },
    {
      name: "Basic",
      price: "199.000 đ",
      period: "tháng",
      credits: 500,
      color: "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10",
      features: [
        "500 Credits mỗi tháng",
        "Tạo website cơ bản",
        "Truy cập kho giao diện chuẩn",
        "Hỗ trợ qua email"
      ],
      recommended: true
    },
    {
      name: "Pro",
      price: "499.000 đ",
      period: "tháng",
      credits: 2000,
      color: "border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10",
      features: [
        "2000 Credits mỗi tháng",
        "Tạo website không giới hạn",
        "Truy cập kho giao diện cao cấp",
        "Xuất mã nguồn",
        "Hỗ trợ ưu tiên 24/7"
      ]
    },
    {
      name: "Business",
      price: "1.499.000 đ",
      period: "tháng",
      credits: 10000,
      color: "border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-900/10",
      features: [
        "10.000 Credits mỗi tháng",
        "Tất cả tính năng Pro",
        "API Access",
        "Team collaboration (3 members)",
        "Custom domain support"
      ]
    },
    {
      name: "Enterprise",
      price: "Liên hệ",
      period: "",
      credits: "Unlimited",
      color: "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10",
      features: [
        "Credits không giới hạn",
        "Giải pháp tùy chỉnh riêng",
        "Dedicated Account Manager",
        "SLA cam kết uptime",
        "Đào tạo & Onboarding"
      ]
    }
  ];

  return (
    <div className="h-full w-full bg-background flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-[env(safe-area-inset-top)] h-[calc(3.5rem+env(safe-area-inset-top))] px-4 border-b border-border flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="-ml-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Nâng cấp tài khoản</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-32 md:p-6 w-full">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Current Status */}
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">Gói hiện tại: {currentPlan}</h2>
                <div className="flex items-center gap-2 opacity-90">
                  <Zap className="h-4 w-4 text-yellow-300 fill-yellow-300" />
                  <span>Bạn đang có <span className="font-bold text-yellow-300">{currentCredits} Credits</span> khả dụng</span>
                </div>
              </div>
              <Button className="bg-white text-purple-600 hover:bg-white/90 border-0 shadow-sm font-semibold">
                Mua thêm Credits lẻ
              </Button>
            </div>
          </div>

          <div className="text-center space-y-2 max-w-2xl mx-auto mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Chọn gói phù hợp với bạn</h2>
            <p className="text-muted-foreground">
              Nâng cấp để mở khóa thêm nhiều tính năng và nhận lượng Credits lớn hơn với chi phí tiết kiệm.
            </p>
          </div>

          {/* Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {packages.map((pkg) => (
              <Card key={pkg.name} className={cn("flex flex-col relative transition-all hover:shadow-lg border-2", pkg.color)}>
                {pkg.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm z-10">
                    Phổ biến nhất
                  </div>
                )}
                
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl font-bold">{pkg.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-2xl font-bold">{pkg.price}</span>
                    {pkg.period && <span className="text-sm text-muted-foreground"> / {pkg.period}</span>}
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1">
                  <div className="flex items-center justify-center gap-2 mb-6 p-2 bg-background/50 rounded-lg border border-border/50">
                    <Zap className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-bold">{pkg.credits} Credits</span>
                  </div>
                  
                  <ul className="space-y-3 text-sm">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span className="text-muted-foreground leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter className="pt-2">
                  <Button 
                    className={cn("w-full", pkg.recommended ? "bg-blue-600 hover:bg-blue-700" : "")} 
                    variant={pkg.current ? "outline" : "default"}
                    disabled={pkg.current}
                  >
                    {pkg.current ? "Đang sử dụng" : "Nâng cấp ngay"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="p-6 bg-secondary/30 rounded-xl border border-border/50 text-center">
            <h3 className="font-semibold mb-2">Cần tư vấn thêm?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Đội ngũ chuyên gia của chúng tôi luôn sẵn sàng hỗ trợ bạn lựa chọn giải pháp tốt nhất.
            </p>
            <Button variant="outline">Liên hệ tư vấn</Button>
          </div>

        </div>
      </div>
    </div>
  );
};
