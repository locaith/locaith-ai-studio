import React from 'react';
import { ArrowLeft, CreditCard, Landmark, Plus, Trash2, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../src/hooks/useAuth";

export const PaymentFeature = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Mock data
  const profileData = {
    name: user?.user_metadata?.full_name || "Người dùng Locaith",
    email: user?.email || "user@locaith.com",
  };

  const savedCards = [
    { id: 1, type: 'Visa', last4: '4242', expiry: '12/24', isDefault: true },
  ];

  const savedBanks = [
    { id: 1, name: 'Vietcombank', number: '**** 9876', owner: 'NGUYEN VAN A', isDefault: true },
  ];

  return (
    <div className="h-full w-full bg-background flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-[env(safe-area-inset-top)] h-[calc(3.5rem+env(safe-area-inset-top))] px-4 border-b border-border flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="-ml-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Quản lý thanh toán</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-32 md:p-6 max-w-3xl mx-auto w-full space-y-6">
        
        <Tabs defaultValue="methods" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="methods">Phương thức thanh toán</TabsTrigger>
            <TabsTrigger value="tax">Thông tin thuế</TabsTrigger>
          </TabsList>
          
          <TabsContent value="methods" className="space-y-6">
            {/* Credit Cards */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-base flex items-center gap-2">
                  <CreditCard className="h-4 w-4" /> Thẻ tín dụng / Ghi nợ
                </h3>
                <Button variant="outline" size="sm" className="h-8">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Thêm thẻ
                </Button>
              </div>
              
              <div className="grid gap-4">
                {savedCards.map(card => (
                  <Card key={card.id} className="relative overflow-hidden">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-14 bg-slate-900 rounded flex items-center justify-center text-white font-bold text-xs">
                          {card.type}
                        </div>
                        <div>
                          <div className="font-medium">•••• •••• •••• {card.last4}</div>
                          <div className="text-sm text-muted-foreground">Hết hạn: {card.expiry}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {card.isDefault && (
                          <span className="text-xs bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-full font-medium">
                            Mặc định
                          </span>
                        )}
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Bank Accounts */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-base flex items-center gap-2">
                  <Landmark className="h-4 w-4" /> Tài khoản ngân hàng
                </h3>
                <Button variant="outline" size="sm" className="h-8">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Liên kết ngân hàng
                </Button>
              </div>
              
              <div className="grid gap-4">
                {savedBanks.map(bank => (
                  <Card key={bank.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                          <Landmark className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <div className="font-medium">{bank.name}</div>
                          <div className="text-sm text-muted-foreground">{bank.number} - {bank.owner}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {bank.isDefault && (
                          <span className="text-xs bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-full font-medium">
                            Mặc định
                          </span>
                        )}
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <p className="text-xs text-muted-foreground bg-secondary/50 p-3 rounded-lg">
                * Kết nối tài khoản ngân hàng nội địa Việt Nam để thực hiện nạp và rút tiền nhanh chóng.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="tax" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  Thông tin xuất hóa đơn
                </CardTitle>
                <CardDescription>
                  Thông tin này sẽ được sử dụng để tự động xuất hóa đơn VAT cho các giao dịch nạp tiền.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tax-name">Tên công ty / Cá nhân</Label>
                  <Input id="tax-name" placeholder="Nhập tên đầy đủ trên đăng ký kinh doanh" defaultValue={profileData.name} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tax-id">Mã số thuế</Label>
                  <Input id="tax-id" placeholder="Ví dụ: 0101234567" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tax-address">Địa chỉ đăng ký</Label>
                  <Input id="tax-address" placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tax-email">Email nhận hóa đơn</Label>
                  <Input id="tax-email" type="email" placeholder="email@company.com" defaultValue={profileData.email} />
                </div>

                <Button className="w-full mt-2 bg-blue-600 hover:bg-blue-700">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Lưu thông tin thuế
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
};
