import React from 'react';
import { ArrowLeft, Wallet, CreditCard, QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";

export const LcPayFeature = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-full bg-background pb-20 md:pb-0">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50 pt-[env(safe-area-inset-top)]">
        <div className="flex items-center px-4 h-16 gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 rounded-lg p-1.5">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-foreground">LcPay - Cổng thanh toán</span>
          </div>
        </div>
      </div>
      
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center">
            <CreditCard className="w-12 h-12 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold">Thanh toán nhanh chóng, an toàn</h2>
        <p className="text-muted-foreground max-w-xs">
          Ví điện tử tích hợp AI, hỗ trợ thanh toán đa kênh và quản lý tài chính thông minh.
        </p>
        <div className="flex gap-3 w-full max-w-xs justify-center">
             <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">Liên kết thẻ</Button>
             <Button variant="outline" className="flex-1 border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                <QrCode className="w-4 h-4 mr-2" /> Quét QR
             </Button>
        </div>
      </div>
    </div>
  );
};
