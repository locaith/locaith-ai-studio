import React from 'react';
import { Users } from 'lucide-react';

export const ExpertsFeature = () => {
  return (
    <div className="flex flex-col h-full w-full bg-background text-foreground animate-in fade-in zoom-in duration-500">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-50 neu-bg border-b border-[var(--sidebar-border)] h-14 flex items-center px-4 shadow-sm">
          <span className="font-bold text-lg text-[var(--neu-text)]">Chuyên gia</span>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
      <div className="relative">
         <div className="absolute inset-0 bg-zinc-500/20 blur-3xl rounded-full"></div>
         <div className="bg-secondary/30 p-12 rounded-3xl border border-white/10 flex flex-col items-center gap-6 max-w-lg text-center backdrop-blur-md shadow-2xl relative z-10">
            <div className="p-6 rounded-full bg-gradient-to-br from-zinc-500/20 to-zinc-500/5 border border-zinc-500/20 text-zinc-400 shadow-[0_0_15px_rgba(113,113,122,0.3)]">
                <Users className="w-16 h-16" />
            </div>
            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Chuyên gia</h2>
                <p className="text-lg text-muted-foreground">Tìm kiếm và kết nối với các chuyên gia hàng đầu. Tính năng đang được hoàn thiện.</p>
            </div>
            <div className="px-4 py-1.5 rounded-full bg-zinc-500/10 text-zinc-400 text-sm font-medium border border-zinc-500/20">
                Sắp ra mắt
            </div>
         </div>
      </div>
      </div>
    </div>
  );
};
