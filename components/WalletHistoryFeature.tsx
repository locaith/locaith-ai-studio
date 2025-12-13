import React, { useState } from 'react';
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, Filter, Search, Download, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export const WalletHistoryFeature = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdraw'>('all');

  // Mock transactions
  const transactions = [
    { id: 'tx_1', type: 'deposit', title: 'Nạp tiền vào ví', sub: 'Vietcombank ****9876', amount: '+500.000 đ', date: '10:30 - 15/12/2024', status: 'success' },
    { id: 'tx_2', type: 'withdraw', title: 'Rút tiền về ngân hàng', sub: 'Techcombank ****1234', amount: '-2.000.000 đ', date: '09:15 - 14/12/2024', status: 'processing' },
    { id: 'tx_3', type: 'deposit', title: 'Nạp tiền vào ví', sub: 'Thẻ Visa ****4242', amount: '+1.000.000 đ', date: '14:20 - 12/12/2024', status: 'success' },
    { id: 'tx_4', type: 'withdraw', title: 'Thanh toán gói Pro', sub: 'Gói tháng', amount: '-299.000 đ', date: '08:00 - 10/12/2024', status: 'success' },
    { id: 'tx_5', type: 'deposit', title: 'Hoàn tiền', sub: 'Từ giao dịch #9988', amount: '+50.000 đ', date: '11:45 - 08/12/2024', status: 'success' },
  ];

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    return tx.type === filter;
  });

  return (
    <div className="h-full w-full bg-background flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-[env(safe-area-inset-top)] h-[calc(3.5rem+env(safe-area-inset-top))] px-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="-ml-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Lịch sử giao dịch</h1>
        </div>
        <Button variant="ghost" size="icon">
          <Download className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-32 md:p-6 max-w-3xl mx-auto w-full space-y-6">
        
        {/* Filters */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button 
              variant={filter === 'all' ? "default" : "outline"} 
              size="sm" 
              onClick={() => setFilter('all')}
              className="rounded-full"
            >
              Tất cả
            </Button>
            <Button 
              variant={filter === 'deposit' ? "default" : "outline"} 
              size="sm" 
              onClick={() => setFilter('deposit')}
              className="rounded-full"
            >
              Tiền vào
            </Button>
            <Button 
              variant={filter === 'withdraw' ? "default" : "outline"} 
              size="sm" 
              onClick={() => setFilter('withdraw')}
              className="rounded-full"
            >
              Tiền ra
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Tìm kiếm giao dịch..." className="pl-9 bg-secondary/30" />
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground px-1">Tháng 12/2024</div>
          <Card className="divide-y divide-border/50 border shadow-sm">
            {filteredTransactions.map(tx => (
              <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={cn("p-2.5 rounded-full", 
                    tx.type === 'deposit' ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : 
                    "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                  )}>
                    {tx.type === 'deposit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="font-semibold text-sm md:text-base">{tx.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{tx.sub}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn("font-bold text-sm md:text-base", 
                    tx.type === 'deposit' ? "text-green-600 dark:text-green-400" : "text-foreground"
                  )}>{tx.amount}</div>
                  <div className="text-[10px] md:text-xs text-muted-foreground mt-1 flex items-center justify-end gap-1">
                    {tx.date}
                    {tx.status === 'processing' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" title="Đang xử lý" />
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {filteredTransactions.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                Không tìm thấy giao dịch nào.
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
};
