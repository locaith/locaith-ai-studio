import React from 'react';
import { Zap } from 'lucide-react';

export const CheckFeature = () => {
  return (
    <div className="flex flex-col h-full w-full bg-background text-foreground animate-in fade-in zoom-in duration-500">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-50 neu-bg border-b border-[var(--sidebar-border)] h-14 flex items-center px-4 shadow-sm">
          <span className="font-bold text-lg text-[var(--neu-text)]">Check thông tin</span>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
      <div className="relative">
         <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full"></div>
         <div className="bg-secondary/30 p-12 rounded-3xl border border-white/10 flex flex-col items-center gap-6 max-w-lg text-center backdrop-blur-md shadow-2xl relative z-10">
            <div className="p-6 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border border-yellow-500/20 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                <Zap className="w-16 h-16" />
            </div>
            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Check thông tin</h2>
                <p className="text-lg text-muted-foreground">Tra cứu và xác thực thông tin chuyên gia, công việc, doanh nghiệp uy tín.</p>
            </div>
            <div className="px-4 py-1.5 rounded-full bg-yellow-500/10 text-yellow-400 text-sm font-medium border border-yellow-500/20">
                Sắp ra mắt
            </div>
         </div>
      </div>
      </div>
    </div>
  );
};
