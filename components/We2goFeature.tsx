import React from 'react';
import { ArrowLeft, Plane, Map, Hotel } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";

export const We2goFeature = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-full bg-background pb-20 md:pb-0">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50 pt-[env(safe-area-inset-top)]">
        <div className="flex items-center px-4 h-16 gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="bg-sky-500 rounded-lg p-1.5">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-foreground">We2go - AI Du lịch</span>
          </div>
        </div>
      </div>
      
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="w-24 h-24 bg-sky-100 rounded-full flex items-center justify-center">
            <Map className="w-12 h-12 text-sky-600" />
        </div>
        <h2 className="text-2xl font-bold">Lên kế hoạch chuyến đi của bạn</h2>
        <p className="text-muted-foreground max-w-xs">
          Trợ lý AI giúp bạn tìm kiếm địa điểm, đặt phòng và lên lịch trình du lịch hoàn hảo.
        </p>
        <Button className="bg-sky-500 hover:bg-sky-600">Bắt đầu ngay</Button>
      </div>
    </div>
  );
};
