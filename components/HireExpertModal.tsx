import React from 'react';
import { Briefcase, Info, Shield, DollarSign, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// Define a loose interface to avoid strict dependency on the mock data structure
export interface Expert {
    id: string;
    name: string;
    role: string;
    company: string;
    price: string;
    deposit: string;
    requirements: string;
    [key: string]: any;
}

interface HireExpertModalProps {
    expert: Expert;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const HireExpertModal = ({ expert, open, onOpenChange }: HireExpertModalProps) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success("Đã gửi lời mời thuê thành công! Chuyên gia sẽ phản hồi sớm.");
        onOpenChange(false);
    };

    if (!expert) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[900px] bg-background p-0 gap-0 overflow-hidden border-none shadow-2xl">
                 <DialogHeader className="px-6 py-4 border-b border-border/50 bg-slate-50/50 dark:bg-muted/20 flex flex-row items-center justify-between sticky top-0 z-10">
                    <div>
                        <DialogTitle className="text-xl font-bold text-primary flex items-center gap-2">
                            <Briefcase className="w-5 h-5" />
                            Thuê chuyên gia: {expert.name}
                        </DialogTitle>
                        <DialogDescription className="mt-1">
                            Tạo đề xuất công việc và gửi lời mời hợp tác
                        </DialogDescription>
                    </div>
                </DialogHeader>
                
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col md:flex-row h-[70vh]">
                        {/* Left: Project Details */}
                        <ScrollArea className="flex-1 border-r border-border/50">
                            <div className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold uppercase text-muted-foreground flex items-center gap-2">
                                        <Info className="w-4 h-4" /> Thông tin dự án
                                    </h4>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="project-name">Tên dự án <span className="text-red-500">*</span></Label>
                                        <Input id="project-name" placeholder="Ví dụ: Xây dựng hệ thống CRM, Thiết kế Logo..." required className="bg-secondary/20" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="project-desc">Mô tả chi tiết <span className="text-red-500">*</span></Label>
                                        <Textarea 
                                            id="project-desc" 
                                            placeholder="Mô tả mục tiêu, phạm vi công việc và các yêu cầu cụ thể..." 
                                            className="min-h-[150px] bg-secondary/20 resize-none" 
                                            required 
                                        />
                                        <p className="text-xs text-muted-foreground text-right">0/2000 ký tự</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                         <div className="space-y-2">
                                            <Label htmlFor="start-date">Ngày bắt đầu mong muốn</Label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input id="start-date" type="date" className="pl-9 bg-secondary/20" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="duration">Thời gian dự kiến</Label>
                                            <Select>
                                                <SelectTrigger className="bg-secondary/20">
                                                    <SelectValue placeholder="Chọn thời gian" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="1week">Dưới 1 tuần</SelectItem>
                                                    <SelectItem value="1month">1 - 4 tuần</SelectItem>
                                                    <SelectItem value="3months">1 - 3 tháng</SelectItem>
                                                    <SelectItem value="longterm">Dài hạn (trên 3 tháng)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-border/50">
                                     <h4 className="text-sm font-bold uppercase text-muted-foreground flex items-center gap-2">
                                        <Shield className="w-4 h-4" /> Yêu cầu từ chuyên gia
                                    </h4>
                                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/20 text-sm text-blue-800 dark:text-blue-300">
                                        <p className="font-semibold mb-1">Yêu cầu:</p>
                                        <p className="opacity-90">{expert.requirements}</p>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>

                        {/* Right: Financials */}
                        <div className="w-full md:w-[350px] bg-slate-50/50 dark:bg-muted/10 flex flex-col">
                            <ScrollArea className="flex-1">
                                <div className="p-6 space-y-6">
                                     <h4 className="text-sm font-bold uppercase text-muted-foreground flex items-center gap-2">
                                        <DollarSign className="w-4 h-4" /> Đề xuất chi phí
                                    </h4>

                                    <div className="bg-background p-4 rounded-xl border border-border shadow-sm space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="rate">Mức giá theo giờ</Label>
                                            <div className="relative">
                                                <Input id="rate" defaultValue={expert.price} className="pl-3 pr-12 font-semibold text-right" />
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <Label htmlFor="hours">Số giờ dự kiến / tuần</Label>
                                            <Input id="hours" type="number" placeholder="40" className="text-right" />
                                        </div>

                                        <div className="pt-4 border-t border-border border-dashed space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Tạm tính (1 tuần):</span>
                                                <span className="font-bold">0 VNĐ</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Phí dịch vụ (5%):</span>
                                                <span className="font-bold">0 VNĐ</span>
                                            </div>
                                            <div className="flex justify-between text-base font-bold text-primary pt-2 border-t border-border">
                                                <span>Tổng cộng:</span>
                                                <span>0 VNĐ</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Hình thức thanh toán</Label>
                                            <div className="grid grid-cols-1 gap-2">
                                                <div className="flex items-center space-x-2 border p-3 rounded-lg bg-background hover:border-primary cursor-pointer transition-colors">
                                                    <div className="w-4 h-4 rounded-full border border-primary bg-primary" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold">Locaith Secure Pay</p>
                                                        <p className="text-xs text-muted-foreground">Giữ tiền an toàn cho đến khi hoàn thành</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-orange-50 dark:bg-orange-900/10 p-3 rounded-lg border border-orange-100 dark:border-orange-900/20 text-xs text-orange-800 dark:text-orange-300 flex gap-2">
                                            <Shield className="w-4 h-4 shrink-0" />
                                            <span>
                                                Khoản cọc <strong>{expert.deposit}</strong> sẽ được tạm giữ khi chuyên gia chấp nhận yêu cầu.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>
                            
                            <div className="p-4 border-t border-border bg-background sticky bottom-0">
                                <div className="flex gap-3">
                                    <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                                        Hủy bỏ
                                    </Button>
                                    <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/20">
                                        Gửi đề nghị
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
