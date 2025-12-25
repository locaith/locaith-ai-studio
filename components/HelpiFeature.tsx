import React from 'react';
import { ArrowLeft, Star, ChevronDown, Heart, Stethoscope, Baby, User, BookOpen, ChevronRight, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export const HelpiFeature = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-full bg-slate-50 pb-24 md:pb-0">
      {/* Header Section */}
      <div className="bg-[#6B46C1] text-white pt-[env(safe-area-inset-top)] pb-6 rounded-b-[2.5rem] relative overflow-hidden shadow-lg">
        <div className="px-4 py-4 flex items-center justify-between">
           {/* Custom Back Button for consistency, though UI doesn't explicitly show it, it's needed for nav */}
           <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-white hover:bg-white/20 -ml-2">
             <ArrowLeft className="w-6 h-6" />
           </Button>

           <div className="flex items-center gap-2 bg-[#FFD700] text-[#D97706] px-3 py-1 rounded-full shadow-sm cursor-pointer">
              <div className="bg-red-500 rounded-full p-0.5">
                  <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              </div>
              <ChevronDown className="w-4 h-4 text-red-500" />
           </div>
        </div>

        <div className="px-6 pb-4">
            <h1 className="text-xl font-bold">Hôm nay bạn như thế nào ?</h1>
        </div>
        
        {/* Pink Banner Overlay */}
        <div className="px-4 -mb-16 relative z-10">
            <div className="bg-[#FFC0CB] rounded-2xl p-4 shadow-md border-2 border-white/50">
                <h2 className="text-[#333] font-serif font-bold text-lg mb-3 leading-tight">
                    Hãy khám phá và trải nghiệm các dịch vụ chăm sóc người bệnh.
                </h2>
                <Button className="w-fit bg-[#FF8FA3] hover:bg-[#ff7a91] text-[#333] font-semibold border-none rounded-lg h-9 px-6 text-sm">
                    Đăng nhập / Tạo tài khoản
                </Button>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 px-4 space-y-8">
        
        {/* Carousel / Banner Ads */}
        <div className="w-full">
             <ScrollArea className="w-full whitespace-nowrap rounded-2xl">
                 <div className="flex w-max gap-4">
                    <div className="w-[300px] h-[160px] rounded-2xl overflow-hidden relative shrink-0">
                        <img 
                            src="https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=800&q=80&auto=format&fit=crop" 
                            alt="Summer Offer" 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/80 to-transparent p-4 flex flex-col justify-center text-white">
                            <span className="font-bold text-yellow-300 text-lg shadow-black/20 drop-shadow-md">Hot Summer Offer!</span>
                            <span className="text-3xl font-black italic uppercase">A/C Service</span>
                            <div className="mt-2 bg-white text-blue-600 font-bold px-3 py-1 rounded-full w-fit text-sm">30K OFF</div>
                        </div>
                    </div>
                    <div className="w-[300px] h-[160px] rounded-2xl overflow-hidden relative shrink-0">
                        <img 
                            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80&auto=format&fit=crop" 
                            alt="Medical Care" 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/60 to-transparent p-4 flex flex-col justify-end text-white">
                            <span className="font-bold text-xl">Chăm sóc tận tâm</span>
                        </div>
                    </div>
                 </div>
                 <ScrollBar orientation="horizontal" className="hidden" />
             </ScrollArea>
             {/* Dots Indicator */}
             <div className="flex justify-center gap-2 mt-3">
                 <div className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                 <div className="w-2.5 h-2.5 rounded-full bg-orange-200" />
                 <div className="w-2.5 h-2.5 rounded-full bg-orange-200" />
                 <div className="w-2.5 h-2.5 rounded-full bg-orange-200" />
             </div>
        </div>

        {/* Services Grid */}
        <div>
            <h3 className="font-bold text-lg text-slate-700 mb-4">Dịch vụ</h3>
            <div className="grid grid-cols-4 gap-2">
                {/* Item 1 */}
                <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center relative shadow-sm group active:scale-95 transition-transform">
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">NEW</div>
                        <Stethoscope className="w-8 h-8 text-orange-500" />
                    </div>
                    <span className="text-xs text-center font-medium text-slate-600 leading-tight">Chăm sóc người bệnh</span>
                </div>

                {/* Item 2 */}
                <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center relative shadow-sm group active:scale-95 transition-transform">
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">NEW</div>
                        <Baby className="w-8 h-8 text-orange-500" />
                    </div>
                    <span className="text-xs text-center font-medium text-slate-600 leading-tight">Trông Trẻ</span>
                </div>

                {/* Item 3 */}
                <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center relative shadow-sm group active:scale-95 transition-transform">
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">NEW</div>
                        <User className="w-8 h-8 text-orange-500" />
                    </div>
                    <span className="text-xs text-center font-medium text-slate-600 leading-tight">Chăm sóc người cao tuổi</span>
                </div>

                {/* Item 4 */}
                <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center relative shadow-sm group active:scale-95 transition-transform">
                         <div className="grid grid-cols-2 gap-1 p-3">
                             <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                             <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                             <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                             <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                         </div>
                    </div>
                    <span className="text-xs text-center font-medium text-slate-600 leading-tight">Cẩm nang Y tế</span>
                </div>
            </div>
        </div>

        {/* Offers Section */}
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-slate-700">Ưu đãi</h3>
                <span className="text-emerald-500 font-semibold text-sm cursor-pointer">Xem thêm</span>
            </div>
            
            <ScrollArea className="w-full whitespace-nowrap">
                 <div className="flex w-max gap-4 pb-4">
                    {/* Offer Card 1 */}
                    <div className="w-[280px] bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="h-[140px] bg-orange-500 relative">
                             <img 
                                src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80&auto=format&fit=crop" 
                                alt="Pizza" 
                                className="w-full h-full object-cover opacity-90"
                             />
                             <div className="absolute top-4 left-4 text-white">
                                <span className="font-black text-4xl drop-shadow-lg">PIZZA 0<sup className="text-xl">Đ</sup></span>
                             </div>
                        </div>
                        <div className="p-3">
                            <h4 className="font-bold text-slate-800 text-sm mb-2">MIỄN PHÍ CHO PIZZA THỨ 2</h4>
                            <div className="flex items-center gap-2">
                                <div className="bg-purple-100 p-1 rounded">
                                    <Heart className="w-4 h-4 text-purple-600 fill-purple-600" />
                                </div>
                                <span className="text-orange-500 font-bold text-sm">10 HPoints</span>
                            </div>
                        </div>
                    </div>

                    {/* Offer Card 2 */}
                    <div className="w-[280px] bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="h-[140px] bg-yellow-400 relative">
                             <img 
                                src="https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&q=80&auto=format&fit=crop" 
                                alt="Delivery" 
                                className="w-full h-full object-cover opacity-90 mix-blend-overlay"
                             />
                             <div className="absolute bottom-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">LALAMOVE</div>
                        </div>
                        <div className="p-3">
                            <h4 className="font-bold text-slate-800 text-sm mb-2">Ưu đãi lên đến 50k cho khách hàng mới</h4>
                            <div className="flex items-center gap-2">
                                <div className="bg-purple-100 p-1 rounded">
                                    <Heart className="w-4 h-4 text-purple-600 fill-purple-600" />
                                </div>
                                <span className="text-orange-500 font-bold text-sm">20 HP</span>
                            </div>
                        </div>
                    </div>
                 </div>
                 <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>

      </div>
    </div>
  );
};
