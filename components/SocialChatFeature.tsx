import React from 'react';
import { MessageCircle } from 'lucide-react';

export const SocialChatFeature = () => {
  return (
    <div className="flex flex-col h-full w-full bg-background text-foreground animate-in fade-in zoom-in duration-500">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-50 neu-bg border-b border-[var(--sidebar-border)] h-14 flex items-center px-4 shadow-sm">
          <span className="font-bold text-lg text-[var(--neu-text)]">Chat trực tiếp</span>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
      <div className="relative">
         <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
         <div className="bg-secondary/30 p-12 rounded-3xl border border-white/10 flex flex-col items-center gap-6 max-w-lg text-center backdrop-blur-md shadow-2xl relative z-10">
            <div className="p-6 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <MessageCircle className="w-16 h-16" />
            </div>
            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Chat trực tiếp</h2>
                <p className="text-lg text-muted-foreground">Trò chuyện với bạn bè và chuyên gia. Tính năng đang được hoàn thiện.</p>
            </div>
            <div className="px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium border border-blue-500/20">
                Sắp ra mắt
            </div>
         </div>
      </div>
      </div>
    </div>
  );
};
