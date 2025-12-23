import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions, Modal, SafeAreaView as RNSafeAreaView, Platform, KeyboardAvoidingView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
    Settings, Shield, CheckCircle, Wallet, ArrowUpRight, ArrowDownLeft, 
    CreditCard, History, Crown, UserCog, Star, Briefcase, Gem, Ticket, 
    Medal, UserPlus, Zap, Bookmark, Clock, FileText, Package, HelpCircle, 
    LogOut, ChevronRight, MessageSquare, MessageCircle, LayoutGrid, Compass, User,
    ArrowLeft, Landmark, Plus, Trash2, CheckCircle2, Gift,
    Copy, Share2, QrCode, Users, Filter, Calendar, Bell, Edit2, Search
} from 'lucide-react-native';

import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const PaymentManagementModal = ({ visible, onClose }) => {
    const [activeTab, setActiveTab] = useState("methods"); // methods | tax

    const savedCards = [
        { id: 1, type: 'Visa', last4: '4242', expiry: '12/24', isDefault: true },
    ];

    const savedBanks = [
        { id: 1, name: 'Vietcombank', number: '**** 9876', owner: 'NGUYEN VAN A', isDefault: true },
    ];

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
            statusBarTranslucent={true}
            hardwareAccelerated={true}
        >
            <View className="flex-1 bg-[#050511]">
                <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
                    {/* Header */}
                    <View className="flex-row items-center px-4 py-3 border-b border-white/10 bg-[#050511]">
                        <TouchableOpacity 
                            onPress={onClose}
                            className="w-10 h-10 rounded-full bg-white/5 items-center justify-center mr-3"
                        >
                            <ArrowLeft size={24} color="white" />
                        </TouchableOpacity>
                        <Text className="text-white font-bold text-lg">Quản lý thanh toán</Text>
                    </View>

                    <View className="flex-1">
                        {/* Tabs */}
                        <View className="flex-row px-4 py-4 border-b border-white/5">
                            <TouchableOpacity 
                                onPress={() => setActiveTab("methods")}
                                className={`flex-1 items-center py-2 border-b-2 ${activeTab === "methods" ? "border-blue-500" : "border-transparent"}`}
                            >
                                <Text className={`font-bold ${activeTab === "methods" ? "text-blue-500" : "text-gray-400"}`}>Phương thức</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={() => setActiveTab("tax")}
                                className={`flex-1 items-center py-2 border-b-2 ${activeTab === "tax" ? "border-blue-500" : "border-transparent"}`}
                            >
                                <Text className={`font-bold ${activeTab === "tax" ? "text-blue-500" : "text-gray-400"}`}>Thông tin thuế</Text>
                            </TouchableOpacity>
                        </View>

                        <KeyboardAvoidingView 
                            behavior={Platform.OS === "ios" ? "padding" : "height"}
                            className="flex-1"
                        >
                            <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
                                {activeTab === "methods" ? (
                                    <View className="space-y-6 pb-8">
                                        {/* Credit Cards */}
                                        <View>
                                            <View className="flex-row items-center justify-between mb-4">
                                                <View className="flex-row items-center gap-2">
                                                    <CreditCard size={18} color="#9ca3af" />
                                                    <Text className="text-white font-bold text-base">Thẻ tín dụng / Ghi nợ</Text>
                                                </View>
                                                <TouchableOpacity className="flex-row items-center gap-1 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                                                    <Plus size={14} color="white" />
                                                    <Text className="text-white text-xs font-medium">Thêm thẻ</Text>
                                                </TouchableOpacity>
                                            </View>

                                            <View className="space-y-3">
                                                {savedCards.map(card => (
                                                    <View key={card.id} className="bg-[#1e1e2e] rounded-xl p-4 border border-white/5 flex-row items-center justify-between">
                                                        <View className="flex-row items-center gap-4">
                                                            <View className="w-12 h-8 bg-blue-900/30 rounded items-center justify-center border border-blue-500/30">
                                                                <Text className="text-blue-400 font-bold text-[10px]">{card.type}</Text>
                                                            </View>
                                                            <View>
                                                                <Text className="text-white font-medium">•••• •••• •••• {card.last4}</Text>
                                                                <Text className="text-gray-500 text-xs">Hết hạn: {card.expiry}</Text>
                                                            </View>
                                                        </View>
                                                        <View className="flex-row items-center gap-3">
                                                            {card.isDefault && (
                                                                <View className="bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-500/30">
                                                                    <Text className="text-blue-400 text-[10px] font-bold">Mặc định</Text>
                                                                </View>
                                                            )}
                                                            <TouchableOpacity>
                                                                <Trash2 size={18} color="#6b7280" />
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>

                                        {/* Bank Accounts */}
                                        <View>
                                            <View className="flex-row items-center justify-between mb-4 pt-4 border-t border-white/5">
                                                <View className="flex-row items-center gap-2">
                                                    <Landmark size={18} color="#9ca3af" />
                                                    <Text className="text-white font-bold text-base">Tài khoản ngân hàng</Text>
                                                </View>
                                                <TouchableOpacity className="flex-row items-center gap-1 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                                                    <Plus size={14} color="white" />
                                                    <Text className="text-white text-xs font-medium">Liên kết</Text>
                                                </TouchableOpacity>
                                            </View>

                                            <View className="space-y-3">
                                                {savedBanks.map(bank => (
                                                    <View key={bank.id} className="bg-[#1e1e2e] rounded-xl p-4 border border-white/5 flex-row items-center justify-between">
                                                        <View className="flex-row items-center gap-4">
                                                            <View className="w-10 h-10 bg-green-500/10 rounded-full items-center justify-center border border-green-500/20">
                                                                <Landmark size={18} color="#4ade80" />
                                                            </View>
                                                            <View>
                                                                <Text className="text-white font-medium">{bank.name}</Text>
                                                                <Text className="text-gray-500 text-xs">{bank.number} - {bank.owner}</Text>
                                                            </View>
                                                        </View>
                                                        <View className="flex-row items-center gap-3">
                                                            {bank.isDefault && (
                                                                <View className="bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-500/30">
                                                                    <Text className="text-blue-400 text-[10px] font-bold">Mặc định</Text>
                                                                </View>
                                                            )}
                                                            <TouchableOpacity>
                                                                <Trash2 size={18} color="#6b7280" />
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>
                                                ))}
                                            </View>
                                            
                                            <View className="mt-4 bg-blue-900/10 p-3 rounded-lg border border-blue-500/20">
                                                <Text className="text-blue-200/70 text-xs leading-4 italic">
                                                    * Kết nối tài khoản ngân hàng nội địa Việt Nam để thực hiện nạp và rút tiền nhanh chóng.
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                ) : (
                                    <View className="pb-8">
                                        <View className="bg-[#1e1e2e] rounded-2xl border border-white/5 p-5">
                                            <View className="flex-row items-center gap-3 mb-2">
                                                <FileText size={20} color="#3b82f6" />
                                                <Text className="text-white font-bold text-lg">Thông tin xuất hóa đơn</Text>
                                            </View>
                                            <Text className="text-gray-400 text-xs mb-6 leading-5">
                                                Thông tin này sẽ được sử dụng để tự động xuất hóa đơn VAT cho các giao dịch nạp tiền.
                                            </Text>

                                            <View className="space-y-4">
                                                <View>
                                                    <Text className="text-gray-300 font-medium text-sm mb-2">Tên công ty / Cá nhân</Text>
                                                    <TextInput 
                                                        className="bg-[#131320] border border-white/10 rounded-xl px-4 py-3 text-white"
                                                        placeholder="Nhập tên đầy đủ trên đăng ký kinh doanh"
                                                        placeholderTextColor="#6b7280"
                                                        defaultValue="Người dùng Locaith"
                                                    />
                                                </View>

                                                <View>
                                                    <Text className="text-gray-300 font-medium text-sm mb-2">Mã số thuế</Text>
                                                    <TextInput 
                                                        className="bg-[#131320] border border-white/10 rounded-xl px-4 py-3 text-white"
                                                        placeholder="Ví dụ: 0101234567"
                                                        placeholderTextColor="#6b7280"
                                                        keyboardType="numeric"
                                                    />
                                                </View>

                                                <View>
                                                    <Text className="text-gray-300 font-medium text-sm mb-2">Địa chỉ đăng ký</Text>
                                                    <TextInput 
                                                        className="bg-[#131320] border border-white/10 rounded-xl px-4 py-3 text-white"
                                                        placeholder="Số nhà, đường, phường/xã..."
                                                        placeholderTextColor="#6b7280"
                                                    />
                                                </View>

                                                <View>
                                                    <Text className="text-gray-300 font-medium text-sm mb-2">Email nhận hóa đơn</Text>
                                                    <TextInput 
                                                        className="bg-[#131320] border border-white/10 rounded-xl px-4 py-3 text-white"
                                                        placeholder="email@company.com"
                                                        placeholderTextColor="#6b7280"
                                                        keyboardType="email-address"
                                                        defaultValue="user@locaith.com"
                                                    />
                                                </View>

                                                <TouchableOpacity className="w-full bg-blue-600 py-3.5 rounded-xl items-center flex-row justify-center gap-2 shadow-lg shadow-blue-600/20 mt-2">
                                                    <CheckCircle2 size={18} color="white" />
                                                    <Text className="text-white font-bold">Lưu thông tin thuế</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                )}
                            </ScrollView>
                        </KeyboardAvoidingView>
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    );
};

const PurchaseHistoryModal = ({ visible, onClose }) => {
    const [filter, setFilter] = useState("all"); // all | deposit | withdraw | spend

    const transactions = [
        { id: 1, type: 'deposit', title: 'Nạp tiền qua VCB', date: '20/10/2023 10:30', amount: 5000000, status: 'success', code: 'TRX-83729' },
        { id: 2, type: 'spend', title: 'Đăng ký gói Pro (1 tháng)', date: '21/10/2023 14:20', amount: -299000, status: 'success', code: 'INV-2023-001' },
        { id: 3, type: 'withdraw', title: 'Rút tiền về Vietcombank', date: '22/10/2023 09:15', amount: -1000000, status: 'pending', code: 'WDR-99283' },
        { id: 4, type: 'spend', title: 'Thuê chuyên gia @minhnguyen', date: '23/10/2023 16:45', amount: -500000, status: 'success', code: 'HIR-11223' },
        { id: 5, type: 'deposit', title: 'Hoàn tiền giao dịch lỗi', date: '24/10/2023 11:00', amount: 500000, status: 'success', code: 'REF-33445' },
    ];

    const getFilteredTransactions = () => {
        if (filter === 'all') return transactions;
        return transactions.filter(t => t.type === filter);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'success': return 'text-green-500';
            case 'pending': return 'text-yellow-500';
            case 'failed': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'success': return 'Thành công';
            case 'pending': return 'Đang xử lý';
            case 'failed': return 'Thất bại';
            default: return status;
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'deposit': return ArrowDownLeft;
            case 'withdraw': return ArrowUpRight;
            case 'spend': return CreditCard;
            default: return History;
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
            statusBarTranslucent={true}
            hardwareAccelerated={true}
        >
            <View className="flex-1 bg-[#050511]">
                <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
                    {/* Header */}
                    <View className="flex-row items-center px-4 py-3 border-b border-white/10 bg-[#050511]">
                        <TouchableOpacity 
                            onPress={onClose}
                            className="w-10 h-10 rounded-full bg-white/5 items-center justify-center mr-3"
                        >
                            <ArrowLeft size={24} color="white" />
                        </TouchableOpacity>
                        <Text className="text-white font-bold text-lg">Lịch sử giao dịch</Text>
                    </View>

                    {/* Filter Tabs */}
                    <View className="px-4 py-4">
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3">
                            {[
                                { id: 'all', label: 'Tất cả' },
                                { id: 'deposit', label: 'Nạp tiền' },
                                { id: 'withdraw', label: 'Rút tiền' },
                                { id: 'spend', label: 'Chi tiêu' },
                            ].map(tab => (
                                <TouchableOpacity
                                    key={tab.id}
                                    onPress={() => setFilter(tab.id)}
                                    className={`px-4 py-2 rounded-full border ${filter === tab.id ? 'bg-blue-600 border-blue-600' : 'bg-[#1e1e2e] border-white/10'}`}
                                >
                                    <Text className={`font-medium text-sm ${filter === tab.id ? 'text-white' : 'text-gray-400'}`}>
                                        {tab.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Transaction List */}
                    <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                        <View className="space-y-3">
                            {getFilteredTransactions().map(item => (
                                <View key={item.id} className="bg-[#1e1e2e] rounded-xl p-4 border border-white/5 flex-row justify-between items-center">
                                    <View className="flex-row items-center gap-3 flex-1">
                                        <View className={`w-10 h-10 rounded-full items-center justify-center ${item.amount > 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                            {React.createElement(getIcon(item.type), { 
                                                size: 20, 
                                                color: item.amount > 0 ? '#4ade80' : '#ef4444' 
                                            })}
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-white font-bold text-sm mb-0.5" numberOfLines={1}>{item.title}</Text>
                                            <Text className="text-gray-500 text-xs">{item.date} • {item.code}</Text>
                                        </View>
                                    </View>
                                    <View className="items-end">
                                        <Text className={`font-bold text-sm mb-0.5 ${item.amount > 0 ? 'text-green-500' : 'text-white'}`}>
                                            {item.amount > 0 ? '+' : ''}{formatCurrency(item.amount)}
                                        </Text>
                                        <Text className={`text-[10px] font-medium ${getStatusColor(item.status)}`}>
                                            {getStatusText(item.status)}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </View>
        </Modal>
    );
};

const UpgradeAccountModal = ({ visible, onClose, initialTab = "credits" }) => {
    const [activeTab, setActiveTab] = useState(initialTab); // credits | plans

    useEffect(() => {
        if (visible) {
            setActiveTab(initialTab);
        }
    }, [visible, initialTab]);

    const creditPackages = [
        { id: 1, credits: 100, price: 20000, bonus: 0, popular: false },
        { id: 2, credits: 500, price: 90000, bonus: 10, popular: true },
        { id: 3, credits: 1000, price: 170000, bonus: 15, popular: false },
        { id: 4, credits: 5000, price: 800000, bonus: 20, popular: false },
        { id: 5, credits: 10000, price: 1500000, bonus: 25, popular: false },
        { id: 6, credits: 50000, price: 7000000, bonus: 30, popular: false },
    ];

    const plans = [
        { 
            id: 'free', 
            name: 'Free', 
            price: 0, 
            features: ['Truy cập cơ bản', '10 Credits/ngày', 'Hỗ trợ cộng đồng'],
            color: 'gray'
        },
        { 
            id: 'pro', 
            name: 'Pro', 
            price: 199000, 
            features: ['Truy cập đầy đủ', '100 Credits/ngày', 'Hỗ trợ ưu tiên', 'Không quảng cáo'],
            color: 'blue',
            popular: true
        },
        { 
            id: 'agency', 
            name: 'Agency', 
            price: 499000, 
            features: ['Không giới hạn', '500 Credits/ngày', 'Hỗ trợ 24/7', 'API Access', 'Team Management'],
            color: 'purple'
        },
    ];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
            statusBarTranslucent={true}
            hardwareAccelerated={true}
        >
            <View className="flex-1 bg-[#050511]">
                <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
                    {/* Header */}
                    <View className="flex-row items-center px-4 py-3 border-b border-white/10 bg-[#050511]">
                        <TouchableOpacity 
                            onPress={onClose}
                            className="w-10 h-10 rounded-full bg-white/5 items-center justify-center mr-3"
                        >
                            <ArrowLeft size={24} color="white" />
                        </TouchableOpacity>
                        <Text className="text-white font-bold text-lg">Nâng cấp tài khoản</Text>
                    </View>

                    {/* Tabs */}
                    <View className="flex-row px-4 py-4 border-b border-white/5">
                        <TouchableOpacity 
                            onPress={() => setActiveTab("credits")}
                            className={`flex-1 items-center py-2 border-b-2 ${activeTab === "credits" ? "border-blue-500" : "border-transparent"}`}
                        >
                            <Text className={`font-bold ${activeTab === "credits" ? "text-blue-500" : "text-gray-400"}`}>Mua Credits</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => setActiveTab("plans")}
                            className={`flex-1 items-center py-2 border-b-2 ${activeTab === "plans" ? "border-blue-500" : "border-transparent"}`}
                        >
                            <Text className={`font-bold ${activeTab === "plans" ? "text-blue-500" : "text-gray-400"}`}>Gói thành viên</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                        {activeTab === "credits" ? (
                            <View className="flex-row flex-wrap justify-between">
                                {creditPackages.map(pkg => (
                                    <TouchableOpacity 
                                        key={pkg.id} 
                                        className={`w-[48%] bg-[#1e1e2e] rounded-xl p-4 mb-4 border ${pkg.popular ? 'border-blue-500' : 'border-white/5'} relative`}
                                    >
                                        {pkg.popular && (
                                            <View className="absolute -top-3 left-0 right-0 items-center">
                                                <View className="bg-blue-600 px-3 py-1 rounded-full">
                                                    <Text className="text-white text-[10px] font-bold">Phổ biến nhất</Text>
                                                </View>
                                            </View>
                                        )}
                                        <View className="items-center mb-3 mt-2">
                                            <View className="w-12 h-12 bg-yellow-500/10 rounded-full items-center justify-center mb-2">
                                                <Zap size={24} color="#eab308" fill="#eab308" />
                                            </View>
                                            <Text className="text-white font-bold text-xl">{pkg.credits}</Text>
                                            <Text className="text-gray-400 text-xs">Credits</Text>
                                        </View>
                                        
                                        <View className="items-center border-t border-white/5 pt-3">
                                            <Text className="text-white font-bold text-base mb-1">{formatCurrency(pkg.price)}</Text>
                                            {pkg.bonus > 0 && (
                                                <Text className="text-green-500 text-xs font-medium">Tặng thêm {pkg.bonus}%</Text>
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : (
                            <View className="space-y-4">
                                {plans.map(plan => (
                                    <View 
                                        key={plan.id} 
                                        className={`bg-[#1e1e2e] rounded-xl p-5 border ${plan.popular ? 'border-blue-500' : 'border-white/5'} relative overflow-hidden`}
                                    >
                                        {plan.popular && (
                                            <View className="absolute top-0 right-0 bg-blue-600 px-3 py-1 rounded-bl-xl">
                                                <Text className="text-white text-[10px] font-bold">Khuyên dùng</Text>
                                            </View>
                                        )}
                                        
                                        <View className="flex-row items-center justify-between mb-4">
                                            <View>
                                                <Text className={`font-bold text-lg ${plan.id === 'pro' ? 'text-blue-400' : plan.id === 'agency' ? 'text-purple-400' : 'text-gray-400'}`}>
                                                    {plan.name}
                                                </Text>
                                                <View className="flex-row items-baseline gap-1">
                                                    <Text className="text-white text-2xl font-bold">{formatCurrency(plan.price)}</Text>
                                                    <Text className="text-gray-500 text-xs">/ tháng</Text>
                                                </View>
                                            </View>
                                            <View className={`w-12 h-12 rounded-full items-center justify-center bg-${plan.color}-500/10`}>
                                                <Crown size={24} color={plan.id === 'pro' ? '#60a5fa' : plan.id === 'agency' ? '#c084fc' : '#9ca3af'} />
                                            </View>
                                        </View>

                                        <View className="space-y-3 mb-6">
                                            {plan.features.map((feature, index) => (
                                                <View key={index} className="flex-row items-center gap-3">
                                                    <CheckCircle2 size={16} color={plan.id === 'free' ? '#9ca3af' : '#4ade80'} />
                                                    <Text className="text-gray-300 text-sm">{feature}</Text>
                                                </View>
                                            ))}
                                        </View>

                                        <TouchableOpacity 
                                            className={`w-full py-3 rounded-xl items-center ${plan.id === 'free' ? 'bg-white/10' : 'bg-blue-600 shadow-lg shadow-blue-600/20'}`}
                                        >
                                            <Text className="text-white font-bold">
                                                {plan.id === 'free' ? 'Đang sử dụng' : 'Nâng cấp ngay'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}
                    </ScrollView>
                </SafeAreaView>
            </View>
        </Modal>
    );
};

const PromotionsModal = ({ visible, onClose }) => {
    const [activeTab, setActiveTab] = useState("all");

    const promotions = [
        {
            id: "p1",
            title: "Giảm 15% gói VIP",
            description: "Áp dụng cho tất cả các gói đăng ký VIP từ 6 tháng trở lên",
            discount: "15%",
            expiry: "Hết hạn trong 1 ngày",
            count: 1,
            type: "vip",
            image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=200&auto=format&fit=crop",
            colors: ['#a855f7', '#6366f1'] // from-purple-500 to-indigo-500
        },
        {
            id: "p2",
            title: "Tặng 100 Credits AI",
            description: "Dùng để tạo ảnh, viết content hoặc chat với AI chuyên gia",
            discount: "100 Credits",
            expiry: "Hết hạn: 31/12/2024",
            count: 3,
            type: "ai",
            image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=200&auto=format&fit=crop",
            colors: ['#3b82f6', '#06b6d4'] // from-blue-500 to-cyan-500
        },
        {
            id: "p3",
            title: "Giảm 50% Gói Voice Studio",
            description: "Trải nghiệm giọng đọc AI cao cấp với giá ưu đãi",
            discount: "50%",
            expiry: "Hết hạn trong 3 ngày",
            count: 1,
            type: "voice",
            image: "https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?q=80&w=200&auto=format&fit=crop",
            colors: ['#ec4899', '#f43f5e'] // from-pink-500 to-rose-500
        },
        {
            id: "p4",
            title: "Thiết kế Logo AI Miễn Phí",
            description: "Tạo 5 logo đầu tiên hoàn toàn miễn phí với AI Designer",
            discount: "Free",
            expiry: "Hết hạn: 15/01/2025",
            count: 5,
            type: "design",
            image: "https://images.unsplash.com/photo-1626785774573-4b799314346d?q=80&w=200&auto=format&fit=crop",
            colors: ['#fb923c', '#f59e0b'] // from-orange-400 to-amber-500
        },
        {
            id: "p5",
            title: "Giảm 20% Automation",
            description: "Tối ưu quy trình làm việc với các công cụ tự động hóa",
            discount: "20%",
            expiry: "Hết hạn: 20/01/2025",
            count: 1,
            type: "auto",
            image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=200&auto=format&fit=crop",
            colors: ['#10b981', '#14b8a6'] // from-emerald-500 to-teal-500
        }
    ];

    const categories = [
        { id: 'all', label: 'Tất cả' },
        { id: 'vip', label: 'Gói VIP' },
        { id: 'ai', label: 'AI Chat' },
        { id: 'voice', label: 'Voice' },
        { id: 'design', label: 'Design' },
        { id: 'auto', label: 'Auto' },
    ];

    const filteredPromotions = activeTab === "all" 
        ? promotions 
        : promotions.filter(p => p.type === activeTab);

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
            statusBarTranslucent={true}
            hardwareAccelerated={true}
        >
            <View className="flex-1 bg-[#050511]">
                <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
                    {/* Header */}
                    <View className="flex-row items-center justify-between px-4 py-3 border-b border-white/10 bg-[#050511]">
                        <View className="flex-row items-center">
                            <TouchableOpacity 
                                onPress={onClose}
                                className="w-10 h-10 rounded-full bg-white/5 items-center justify-center mr-3"
                            >
                                <ArrowLeft size={24} color="white" />
                            </TouchableOpacity>
                            <Text className="text-white font-bold text-lg">Ưu đãi của tôi</Text>
                        </View>
                        <TouchableOpacity>
                            <Text className="text-blue-500 font-medium text-xs">Quy định</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                        {/* Wallet Summary */}
                        <View className="px-4 py-4">
                            <LinearGradient
                                colors={['#7c3aed', '#4f46e5']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                className="rounded-2xl p-4 relative overflow-hidden"
                            >
                                <View className="flex-row items-center justify-between z-10">
                                    <View>
                                        <Text className="text-white/80 text-xs font-medium mb-1">Số dư ưu đãi</Text>
                                        <View className="flex-row items-center gap-2">
                                            <Text className="text-white text-2xl font-bold">15</Text>
                                            <Text className="text-white/80 text-sm">mã khả dụng</Text>
                                        </View>
                                    </View>
                                    <View className="bg-white/20 p-2.5 rounded-xl border border-white/20">
                                        <Ticket size={24} color="white" />
                                    </View>
                                </View>
                            </LinearGradient>
                        </View>

                        {/* Categories */}
                        <View className="px-4 mb-4">
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                                {categories.map((cat) => (
                                    <TouchableOpacity
                                        key={cat.id}
                                        onPress={() => setActiveTab(cat.id)}
                                        className={`px-4 py-2 rounded-full border ${activeTab === cat.id ? 'bg-blue-600 border-blue-600' : 'bg-[#1e1e2e] border-white/10'}`}
                                    >
                                        <Text className={`font-medium text-xs ${activeTab === cat.id ? 'text-white' : 'text-gray-400'}`}>
                                            {cat.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* List Header */}
                        <View className="flex-row items-center justify-between px-4 mb-4">
                            <View className="flex-row items-center gap-2">
                                <Gift size={16} color="#3b82f6" />
                                <Text className="text-white font-bold text-sm">Danh sách mã ưu đãi</Text>
                            </View>
                            <TouchableOpacity>
                                <Text className="text-gray-400 text-xs">Lịch sử dùng mã</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Promotions List */}
                        <View className="px-4 space-y-4">
                            {filteredPromotions.map((promo) => (
                                <View 
                                    key={promo.id} 
                                    className="bg-[#1e1e2e] rounded-xl border border-white/10 overflow-hidden"
                                >
                                    <View className="flex-row h-28">
                                        {/* Image Section */}
                                        <View className="w-28 relative">
                                            <LinearGradient
                                                colors={promo.colors}
                                                className="absolute inset-0 opacity-90"
                                            />
                                            <Image 
                                                source={{ uri: promo.image }}
                                                className="absolute inset-0 w-full h-full opacity-60"
                                                resizeMode="cover"
                                            />
                                            <View className="absolute inset-0 items-center justify-center">
                                                <View className="bg-white/20 p-2 rounded-full border border-white/30">
                                                    <Ticket size={20} color="white" />
                                                </View>
                                            </View>
                                        </View>

                                        {/* Content Section */}
                                        <View className="flex-1 p-3 justify-between">
                                            <View>
                                                <View className="flex-row items-center justify-between mb-1">
                                                    <Text className="text-white font-bold text-sm flex-1 mr-2" numberOfLines={1}>
                                                        {promo.title}
                                                    </Text>
                                                    <View className="bg-white/10 px-1.5 py-0.5 rounded">
                                                        <Text className="text-white/80 text-[10px] font-bold">x{promo.count}</Text>
                                                    </View>
                                                </View>
                                                <Text className="text-gray-400 text-xs leading-4" numberOfLines={2}>
                                                    {promo.description}
                                                </Text>
                                            </View>

                                            <View className="flex-row items-center justify-between pt-2 border-t border-dashed border-white/10 mt-1">
                                                <View className="flex-row items-center gap-1">
                                                    <Clock size={12} color="#fb923c" />
                                                    <Text className="text-orange-400 text-[10px] font-medium">{promo.expiry}</Text>
                                                </View>
                                                <TouchableOpacity className="bg-white/10 px-3 py-1.5 rounded-full">
                                                    <Text className="text-white text-[10px] font-bold">Dùng ngay</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </View>
        </Modal>
    );
};

const MembershipTierModal = ({ visible, onClose }) => {
    const [activeTier, setActiveTier] = useState("gold");

    // Mock user current status
    const currentStatus = {
        tier: "Gold",
        points: 1250,
        nextTier: "Platinum",
        pointsNeeded: 750
    };

    const tiers = {
        silver: {
            id: "silver",
            name: "Silver",
            colors: ['#cbd5e1', '#94a3b8'], // slate-300 to slate-400
            textColor: "text-slate-300",
            icon: <Shield size={24} color="white" />,
            benefits: [
                "Tích lũy 1% giá trị giao dịch thành Credits",
                "Truy cập các công cụ AI cơ bản",
                "Hỗ trợ kỹ thuật qua Email trong 24h",
                "Tham gia cộng đồng Locaith Basic"
            ]
        },
        gold: {
            id: "gold",
            name: "Gold",
            colors: ['#facc15', '#ca8a04'], // yellow-400 to yellow-600
            textColor: "text-yellow-400",
            icon: <Crown size={24} color="white" />,
            benefits: [
                "Tích lũy 2% giá trị giao dịch thành Credits",
                "Giảm 5% khi mua gói Credits bổ sung",
                "Truy cập sớm các tính năng Beta (Voice/Design)",
                "Hỗ trợ ưu tiên qua Chat trực tuyến",
                "Quà tặng sinh nhật 500 Credits"
            ]
        },
        platinum: {
            id: "platinum",
            name: "Platinum",
            colors: ['#22d3ee', '#2563eb'], // cyan-400 to blue-600
            textColor: "text-cyan-400",
            icon: <Gem size={24} color="white" />,
            benefits: [
                "Tích lũy 4% giá trị giao dịch thành Credits",
                "Giảm 10% trọn đời các dịch vụ Locaith",
                "Quyền truy cập API riêng biệt (Rate limit x2)",
                "Chuyên viên hỗ trợ 1-1 (Account Manager)",
                "Vé mời sự kiện Locaith Tech Summit hàng năm"
            ]
        },
        diamond: {
            id: "diamond",
            name: "Diamond",
            colors: ['#0f172a', '#581c87', '#0f172a'], // slate-900 via purple-900 to slate-900
            textColor: "text-purple-400",
            icon: <Zap size={24} color="white" />, // Sparkles replaced with Zap as fallback or similar
            benefits: [
                "Tích lũy 6% giá trị giao dịch thành Credits",
                "Miễn phí 1 gói dịch vụ Enterprise bất kỳ",
                "Quyền lợi cổ đông danh dự (nếu đủ điều kiện)",
                "Đặc quyền yêu cầu tính năng riêng (Custom Feature)",
                "Mọi quyền lợi của hạng Platinum"
            ]
        }
    };

    const activeTierData = tiers[activeTier];

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
            statusBarTranslucent={true}
            hardwareAccelerated={true}
        >
            <View className="flex-1 bg-[#050511]">
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <SafeAreaView edges={['top']} className="bg-[#1a1a1a] z-10">
                        <View className="flex-row items-center px-4 py-3 bg-[#1a1a1a]">
                            <TouchableOpacity 
                                onPress={onClose}
                                className="w-10 h-10 rounded-full bg-white/5 items-center justify-center mr-3"
                            >
                                <ArrowLeft size={24} color="white" />
                            </TouchableOpacity>
                            <Text className="text-white font-bold text-lg">Hạng thành viên</Text>
                        </View>
                    </SafeAreaView>

                    {/* Hero Section */}
                    <View className="bg-[#1a1a1a] pt-4 pb-20 px-4 relative overflow-hidden">
                        {/* Background Decoration */}
                        <View className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        
                        <View className="items-center z-10 mb-8">
                            <Text className={`text-3xl font-black tracking-tight mb-2 ${tiers[currentStatus.tier.toLowerCase()].textColor}`}>
                                {currentStatus.tier}
                            </Text>
                            <Text className="text-gray-400 text-sm font-medium mb-1">Credits khả dụng</Text>
                            <View className="flex-row items-center gap-2">
                                <View className="bg-yellow-500/20 p-1 rounded-full">
                                    <Zap size={16} color="#eab308" fill="#eab308" />
                                </View>
                                <Text className="text-white text-2xl font-bold">{currentStatus.points}</Text>
                            </View>
                        </View>

                        {/* Card Visualization */}
                        <View className="mx-auto w-full max-w-sm aspect-[1.586/1] rounded-2xl shadow-2xl overflow-hidden relative border border-white/10">
                            <LinearGradient
                                colors={activeTierData.colors}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                className="absolute inset-0"
                            />
                            {/* Card Texture */}
                            <View className="absolute inset-0 bg-black/10" />
                            
                            <View className="flex-1 p-6 justify-between relative z-10">
                                <View className="flex-row justify-between items-start">
                                    <View className="flex-row items-center gap-3">
                                        <View className="w-10 h-10 rounded-lg bg-white/20 items-center justify-center backdrop-blur-md">
                                            {activeTierData.icon}
                                        </View>
                                        <Text className="font-bold text-lg text-white tracking-widest uppercase shadow-sm">Locaith</Text>
                                    </View>
                                    <Text className="font-mono text-white/80 text-xs">No. 8839 1029</Text>
                                </View>

                                <View>
                                    <View className="w-full h-12 bg-white/10 skew-x-12 absolute -left-4 -top-16 opacity-30" />
                                    <View className="flex-row justify-between items-end">
                                        <View>
                                            <Text className="text-[10px] text-white/80 uppercase tracking-wider mb-1">Thành viên</Text>
                                            <Text className="text-xl font-bold text-white tracking-wide uppercase shadow-sm">{activeTierData.name} MEMBER</Text>
                                        </View>
                                        <View className="items-end">
                                            <Text className="text-[10px] text-white/80 uppercase tracking-wider mb-1">Ngày tham gia</Text>
                                            <Text className="text-sm font-medium text-white shadow-sm">12/2023</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Content Section */}
                    <View className="-mt-12 bg-[#050511] rounded-t-[32px] px-4 pt-8 pb-10 min-h-[500px]">
                        <View className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6" />
                        
                        <Text className="font-bold text-white text-lg mb-4 px-2">Ưu đãi hạng thành viên</Text>

                        {/* Tabs */}
                        <View className="flex-row bg-[#1e1e2e] p-1 rounded-xl mb-6">
                            {Object.values(tiers).map((tier) => (
                                <TouchableOpacity
                                    key={tier.id}
                                    onPress={() => setActiveTier(tier.id)}
                                    className={`flex-1 py-2 rounded-lg items-center ${activeTier === tier.id ? 'bg-[#050511] shadow-sm' : ''}`}
                                >
                                    <Text className={`text-[10px] font-bold uppercase ${activeTier === tier.id ? 'text-white' : 'text-gray-400'}`}>
                                        {tier.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Benefits List */}
                        <View className="space-y-4 mb-6">
                            {activeTierData.benefits.map((benefit, index) => (
                                <View key={index} className="flex-row items-start gap-4 p-4 rounded-xl bg-[#1e1e2e]/50 border border-white/5">
                                    <View className="w-8 h-8 rounded-full items-center justify-center overflow-hidden">
                                        <LinearGradient
                                            colors={activeTierData.colors}
                                            className="absolute inset-0 opacity-90"
                                        />
                                        {index === 0 ? <Gift size={14} color="white" /> : 
                                         index === 1 ? <Zap size={14} color="white" /> :
                                         <CheckCircle2 size={14} color="white" />}
                                    </View>
                                    <Text className="flex-1 text-gray-300 text-sm leading-5 font-medium">
                                        {benefit}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        {/* Status / CTA */}
                        {activeTier === currentStatus.tier.toLowerCase() ? (
                            <View className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 items-center">
                                <Text className="text-sm font-bold text-green-500">Bạn đang ở hạng này</Text>
                                <View className="w-full bg-gray-700 rounded-full h-2.5 mt-3 mb-1 overflow-hidden">
                                    <View className="bg-green-500 h-2.5 rounded-full" style={{ width: '70%' }} />
                                </View>
                                <Text className="text-xs text-gray-400 mt-1">Cần thêm {currentStatus.pointsNeeded} điểm để lên hạng tiếp theo</Text>
                            </View>
                        ) : (
                            <View className="mb-6">
                                <TouchableOpacity className="w-full bg-white py-3 rounded-xl items-center">
                                    <Text className="text-black font-bold">Xem điều kiện thăng hạng</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Additional Links */}
                        <View className="border-t border-white/10 pt-2 mb-6">
                            <TouchableOpacity className="flex-row items-center justify-between w-full p-4 active:bg-white/5 rounded-xl">
                                <Text className="font-bold text-sm text-white">Lịch sử điểm của tôi</Text>
                                <ChevronRight size={16} color="#9ca3af" />
                            </TouchableOpacity>
                            <TouchableOpacity className="flex-row items-center justify-between w-full p-4 active:bg-white/5 rounded-xl">
                                <Text className="font-bold text-sm text-white">Chi tiết chương trình Locaith Club</Text>
                                <ChevronRight size={16} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>

                        {/* Main CTA */}
                        <TouchableOpacity className="w-full h-12 rounded-xl overflow-hidden shadow-lg shadow-red-500/20">
                            <LinearGradient
                                colors={['#dc2626', '#e11d48']} // red-600 to rose-600
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                className="flex-1 items-center justify-center"
                            >
                                <Text className="text-white font-bold text-base">Mở khóa quyền lợi Locaith Club</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        
                        {/* Safe Area Spacer for Bottom */}
                        <View className="h-10" />
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
};

const ReferralModal = ({ visible, onClose }) => {
    const [activeTab, setActiveTab] = useState("referrer"); // referrer | referee
    const [showQR, setShowQR] = useState(false);
    const referralCode = "LCT-8839";
    const referralLink = `https://locaith.com/ref/${referralCode}`;

    const handleCopy = (text, type) => {
        // In a real app, use Clipboard.setString(text)
        // Clipboard.setString(text);
        alert(`Đã sao chép ${type}: ${text}`);
    };

    const stepsForReferrer = [
        {
            step: 1,
            title: "Gửi lời mời",
            desc: "Chia sẻ mã giới thiệu hoặc đường link cho bạn bè qua mạng xã hội."
        },
        {
            step: 2,
            title: "Bạn bè đăng ký",
            desc: "Bạn bè tạo tài khoản Locaith và nhập mã giới thiệu của bạn."
        },
        {
            step: 3,
            title: "Nhận thưởng ngay",
            desc: "Nhận 500 Credits khi bạn bè hoàn thành xác minh tài khoản."
        }
    ];

    const stepsForReferee = [
        {
            step: 1,
            title: "Tải & Đăng ký",
            desc: "Truy cập Locaith Studio và tạo tài khoản mới."
        },
        {
            step: 2,
            title: "Nhập mã giới thiệu",
            desc: `Nhập mã "${referralCode}" tại bước đăng ký hoặc trong mục Cài đặt.`
        },
        {
            step: 3,
            title: "Nhận quà chào mừng",
            desc: "Nhận ngay gói Starter Pack trị giá 150.000đ và 200 Credits."
        }
    ];

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
            statusBarTranslucent={true}
            hardwareAccelerated={true}
        >
            <View className="flex-1 bg-[#050511]">
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <SafeAreaView edges={['top']} className="bg-[#10b981] z-10">
                        <View className="flex-row items-center justify-between px-4 py-3 bg-[#10b981]">
                            <View className="flex-row items-center gap-3">
                                <TouchableOpacity 
                                    onPress={onClose}
                                    className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
                                >
                                    <ArrowLeft size={24} color="white" />
                                </TouchableOpacity>
                                <Text className="text-white font-bold text-lg">Giới thiệu bạn bè</Text>
                            </View>
                            <TouchableOpacity className="bg-white/20 px-3 py-1.5 rounded-full">
                                <Text className="text-white text-xs font-bold">Lịch sử</Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>

                    {/* Hero Section */}
                    <View className="relative overflow-hidden">
                        <LinearGradient
                            colors={['#10b981', '#0d9488']}
                            className="absolute inset-0"
                        />
                        {/* Decorative Elements */}
                        <View className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <View className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
                        
                        <View className="items-center px-6 pt-6 pb-16 z-10">
                            <View className="bg-white/20 w-16 h-16 rounded-2xl items-center justify-center backdrop-blur-sm mb-4 border border-white/20 shadow-lg">
                                <Gift size={32} color="white" />
                            </View>
                            <Text className="text-2xl font-bold text-white mb-2 text-center">Mời bạn thêm vui</Text>
                            <Text className="text-white/90 text-sm text-center leading-5 max-w-[280px]">
                                Nhận ngay <Text className="font-bold text-yellow-300">500 Credits</Text> cho mỗi lượt giới thiệu thành công. Không giới hạn số lượng!
                            </Text>
                        </View>
                    </View>

                    {/* Content Container */}
                    <View className="-mt-8 px-4 relative z-20 pb-10">
                        {/* Stats Card */}
                        <View className="bg-[#1e1e2e] rounded-2xl p-4 flex-row border border-white/10 shadow-lg mb-6">
                            <View className="flex-1 items-center border-r border-white/10">
                                <Text className="text-xs text-gray-400 font-medium mb-1">Đã chia sẻ</Text>
                                <View className="flex-row items-baseline gap-1">
                                    <Text className="text-xl font-bold text-white">12</Text>
                                    <Text className="text-xs text-gray-500">lần</Text>
                                </View>
                            </View>
                            <View className="flex-1 items-center">
                                <Text className="text-xs text-gray-400 font-medium mb-1">Đã giới thiệu</Text>
                                <View className="flex-row items-baseline gap-1">
                                    <Text className="text-xl font-bold text-[#10b981]">3</Text>
                                    <Text className="text-xs text-gray-500">bạn</Text>
                                </View>
                            </View>
                        </View>

                        {/* Referral Code Action Area */}
                        <View className="bg-[#1e1e2e] rounded-2xl p-6 border border-dashed border-[#10b981]/30 relative overflow-hidden mb-6">
                            <View className="absolute inset-0 bg-[#10b981]/5" />
                            
                            <View className="items-center mb-6">
                                <Text className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">Mã giới thiệu của bạn</Text>
                                <View className="flex-row items-center justify-center gap-3">
                                    <Text className="text-3xl font-black tracking-widest text-[#10b981] font-mono">{referralCode}</Text>
                                    <TouchableOpacity 
                                        className="w-8 h-8 items-center justify-center rounded-lg bg-[#10b981]/10"
                                        onPress={() => handleCopy(referralCode, "Mã giới thiệu")}
                                    >
                                        <Copy size={16} color="#10b981" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View className="flex-row gap-3">
                                <TouchableOpacity 
                                    className="flex-1 bg-[#10b981] py-3 rounded-xl flex-row items-center justify-center gap-2 shadow-lg shadow-[#10b981]/20"
                                    onPress={() => handleCopy(referralLink, "Link giới thiệu")}
                                >
                                    <Share2 size={16} color="white" />
                                    <Text className="text-white font-bold">Chia sẻ Link</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    className="flex-1 bg-[#1e1e2e] py-3 rounded-xl flex-row items-center justify-center gap-2 border border-[#10b981]/30"
                                    onPress={() => setShowQR(true)}
                                >
                                    <QrCode size={16} color="#10b981" />
                                    <Text className="text-[#10b981] font-bold">Mã QR</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Instructions Tabs */}
                        <View className="mb-6">
                            <Text className="font-bold text-white text-lg mb-4">Cách nhận phần thưởng</Text>
                            
                            <View className="flex-row bg-[#1e1e2e] p-1 rounded-xl mb-4 border border-white/5">
                                <TouchableOpacity 
                                    onPress={() => setActiveTab("referrer")}
                                    className={`flex-1 py-2.5 rounded-lg items-center ${activeTab === "referrer" ? "bg-[#050511] shadow-sm border border-white/5" : ""}`}
                                >
                                    <Text className={`text-xs font-bold uppercase ${activeTab === "referrer" ? "text-white" : "text-gray-500"}`}>Dành cho bạn</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    onPress={() => setActiveTab("referee")}
                                    className={`flex-1 py-2.5 rounded-lg items-center ${activeTab === "referee" ? "bg-[#050511] shadow-sm border border-white/5" : ""}`}
                                >
                                    <Text className={`text-xs font-bold uppercase ${activeTab === "referee" ? "text-white" : "text-gray-500"}`}>Người được mời</Text>
                                </TouchableOpacity>
                            </View>

                            <View className="space-y-3">
                                {(activeTab === "referrer" ? stepsForReferrer : stepsForReferee).map((step, index) => (
                                    <View key={index} className="flex-row gap-4 p-4 rounded-xl bg-[#1e1e2e] border border-white/5 relative overflow-hidden">
                                        <View className={`absolute top-0 left-0 w-1 h-full ${activeTab === "referrer" ? "bg-emerald-500/20" : "bg-blue-500/20"}`} />
                                        
                                        <View className={`w-8 h-8 rounded-full items-center justify-center shrink-0 ${activeTab === "referrer" ? "bg-emerald-500/10" : "bg-blue-500/10"}`}>
                                            <Text className={`font-bold text-sm ${activeTab === "referrer" ? "text-emerald-500" : "text-blue-500"}`}>{step.step}</Text>
                                        </View>
                                        
                                        <View className="flex-1">
                                            <Text className="font-bold text-white text-sm mb-1">{step.title}</Text>
                                            <Text className="text-xs text-gray-400 leading-5">{step.desc}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Footer Policy Link */}
                        <TouchableOpacity className="items-center py-2">
                            <Text className="text-xs text-gray-500 underline">Điều khoản và điều kiện chương trình</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                {/* QR Code Modal Overlay */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={showQR}
                    onRequestClose={() => setShowQR(false)}
                >
                    <View className="flex-1 bg-black/80 items-center justify-center p-6">
                        <View className="bg-[#1e1e2e] w-full max-w-sm rounded-3xl p-6 items-center border border-white/10 relative">
                            <TouchableOpacity 
                                onPress={() => setShowQR(false)}
                                className="absolute top-4 right-4 z-10"
                            >
                                <View className="bg-white/10 p-1 rounded-full">
                                    <Trash2 size={20} color="white" className="rotate-45" /> 
                                    {/* Using Trash2 rotate-45 as a close icon fallback or just X icon if available, but I don't have X imported. 
                                        Actually, I imported Plus, I can rotate Plus 45deg. Or just use simple Text X. 
                                        Let's use a simple View with X logic or reuse ChevronRight rotated. 
                                        Actually I have `Trash2`, let's check imports. `ArrowLeft` is there.
                                        I'll just use a Text 'X' for simplicity or better yet, a Close button at bottom.
                                    */}
                                </View>
                            </TouchableOpacity>

                            <Text className="text-xl font-bold text-white mb-6 mt-2">Quét mã để tải App</Text>
                            
                            <View className="bg-white p-4 rounded-2xl mb-6">
                                <View className="w-48 h-48 bg-black items-center justify-center">
                                    <QrCode size={100} color="white" />
                                </View>
                            </View>
                            
                            <Text className="text-gray-400 text-center text-sm mb-6">
                                Người được giới thiệu quét mã này để tải ứng dụng và nhận quà.
                            </Text>

                            <TouchableOpacity 
                                onPress={() => setShowQR(false)}
                                className="w-full bg-[#1e1e2e] border border-white/20 py-3 rounded-xl items-center"
                            >
                                <Text className="text-white font-bold">Đóng</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        </Modal>
    );
};

const JobsManagementModal = ({ visible, onClose }) => {
    const [activeTab, setActiveTab] = useState("received"); // received | posted
    const [searchQuery, setSearchQuery] = useState("");

    const mockPostedProjects = [
        {
            id: "P001",
            title: "Thiết kế UI/UX cho App Thương mại điện tử",
            type: "Thiết kế & Sáng tạo",
            partner: {
                name: "Nguyễn Văn B",
                avatar: "https://github.com/shadcn.png",
                role: "Freelancer",
                isVerified: true
            },
            budget: 25000000,
            deadline: "2024-06-10",
            status: "in_progress",
            progress: 65,
            lastUpdate: "2 giờ trước",
            tasks: [
                { id: "t1", title: "Nghiên cứu & Wireframe", completed: true },
                { id: "t2", title: "UI Design - Màn hình chính", completed: true },
                { id: "t3", title: "UI Design - Checkout", completed: false },
            ]
        },
        {
            id: "P002",
            title: "Viết bài chuẩn SEO mảng Công nghệ",
            type: "Viết lách & Dịch thuật",
            partner: {
                name: "Trần Thị C",
                avatar: "https://github.com/shadcn.png",
                role: "Freelancer",
                isVerified: false
            },
            budget: 5000000,
            deadline: "2024-05-25",
            status: "reviewing",
            progress: 90,
            lastUpdate: "30 phút trước",
            tasks: [
                { id: "t1", title: "Lên outline", completed: true },
                { id: "t2", title: "Viết nháp 10 bài", completed: true },
            ]
        }
    ];

    const mockReceivedProjects = [
        {
            id: "P003",
            title: "Phát triển Landing Page ReactJS",
            type: "Lập trình & IT",
            partner: {
                name: "TechStart Corp",
                avatar: "https://github.com/shadcn.png",
                role: "Client",
                isVerified: true
            },
            budget: 12000000,
            deadline: "2024-05-20",
            status: "in_progress",
            progress: 40,
            lastUpdate: "1 ngày trước",
            tasks: [
                { id: "t1", title: "Setup Project & UI Base", completed: true },
                { id: "t2", title: "Responsive & Mobile", completed: false },
            ]
        },
        {
            id: "P004",
            title: "Logo Design cho Brand Coffee",
            type: "Thiết kế & Sáng tạo",
            partner: {
                name: "Coffee House",
                avatar: "https://github.com/shadcn.png",
                role: "Client",
                isVerified: true
            },
            budget: 3000000,
            deadline: "2024-05-05",
            status: "completed",
            progress: 100,
            lastUpdate: "1 tuần trước",
            tasks: [
                { id: "t1", title: "Concept Sketch", completed: true },
                { id: "t2", title: "Final Deliverables", completed: true },
            ]
        }
    ];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': return { text: 'Chờ bắt đầu', color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' };
            case 'in_progress': return { text: 'Đang thực hiện', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
            case 'reviewing': return { text: 'Chờ duyệt', color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' };
            case 'completed': return { text: 'Hoàn thành', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' };
            case 'cancelled': return { text: 'Đã hủy', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' };
            default: return { text: 'Không xác định', color: 'text-gray-500', bg: 'bg-gray-500/10', border: 'border-gray-500/20' };
        }
    };

    const activeProjects = activeTab === "received" ? mockReceivedProjects : mockPostedProjects;

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
            statusBarTranslucent={true}
            hardwareAccelerated={true}
        >
            <View className="flex-1 bg-[#050511]">
                <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
                    {/* Header */}
                    <View className="flex-row items-center justify-between px-4 py-3 border-b border-white/10 bg-[#050511]">
                        <View className="flex-row items-center">
                            <TouchableOpacity 
                                onPress={onClose}
                                className="w-10 h-10 rounded-full bg-white/5 items-center justify-center mr-3"
                            >
                                <ArrowDownLeft size={24} color="white" className="rotate-45" />
                            </TouchableOpacity>
                            <Text className="text-white font-bold text-lg">Việc làm & Ứng tuyển</Text>
                        </View>
                        <View className="flex-row items-center gap-2">
                            <TouchableOpacity className="w-9 h-9 rounded-full bg-white/5 items-center justify-center border border-white/10">
                                <Filter size={18} color="#9ca3af" />
                            </TouchableOpacity>
                            <TouchableOpacity className="flex-row items-center gap-1.5 bg-blue-600 px-3 py-2 rounded-full shadow-lg shadow-blue-600/20">
                                <Plus size={16} color="white" />
                                <Text className="text-white font-bold text-xs">Đăng tin</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Tabs & Search */}
                    <View className="px-4 pt-4 pb-2">
                        {/* Tabs */}
                        <View className="flex-row bg-[#1e1e2e] p-1 rounded-xl mb-4">
                            <TouchableOpacity 
                                onPress={() => setActiveTab("received")}
                                className={`flex-1 py-2 rounded-lg items-center flex-row justify-center gap-2 ${activeTab === "received" ? 'bg-[#050511] shadow-sm' : ''}`}
                            >
                                <Text className={`text-xs font-bold ${activeTab === "received" ? 'text-white' : 'text-gray-400'}`}>
                                    Việc đã nhận
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={() => setActiveTab("posted")}
                                className={`flex-1 py-2 rounded-lg items-center flex-row justify-center gap-2 ${activeTab === "posted" ? 'bg-[#050511] shadow-sm' : ''}`}
                            >
                                <Text className={`text-xs font-bold ${activeTab === "posted" ? 'text-white' : 'text-gray-400'}`}>
                                    Việc đã giao
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Search */}
                        <View className="relative">
                            <View className="absolute left-3 top-3 z-10">
                                <Search size={16} color="#6b7280" />
                            </View>
                            <TextInput
                                className="bg-[#1e1e2e] text-white pl-10 pr-4 py-2.5 rounded-xl border border-white/10 text-sm"
                                placeholder="Tìm kiếm dự án..."
                                placeholderTextColor="#6b7280"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                    </View>

                    {/* Project List */}
                    <ScrollView className="flex-1 px-4 pt-2" contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
                        {activeProjects.length > 0 ? (
                            <View className="space-y-4">
                                {activeProjects.map((project) => {
                                    const statusStyle = getStatusBadge(project.status);
                                    const isOwner = activeTab === "posted";

                                    return (
                                        <TouchableOpacity key={project.id} activeOpacity={0.9} className="bg-[#1e1e2e] rounded-2xl border border-white/10 overflow-hidden">
                                            {/* Card Header */}
                                            <View className="p-4 pb-3 border-b border-white/5">
                                                <View className="flex-row justify-between items-start mb-2">
                                                    <View className="flex-row items-center gap-2">
                                                        <View className={`px-2 py-0.5 rounded text-[10px] font-medium border ${statusStyle.bg} ${statusStyle.border}`}>
                                                            <Text className={`${statusStyle.color} text-[10px] font-bold`}>{statusStyle.text}</Text>
                                                        </View>
                                                        <View className="flex-row items-center gap-1">
                                                            <Clock size={10} color="#6b7280" />
                                                            <Text className="text-gray-500 text-[10px]">Cập nhật {project.lastUpdate}</Text>
                                                        </View>
                                                    </View>
                                                    <View>
                                                        <Text className="text-green-500 font-bold text-base text-right">
                                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(project.budget)}
                                                        </Text>
                                                        <Text className="text-gray-500 text-[10px] text-right">Ngân sách</Text>
                                                    </View>
                                                </View>
                                                
                                                <Text className="text-white font-bold text-base mb-1" numberOfLines={1}>{project.title}</Text>
                                                <View className="flex-row items-center gap-1.5">
                                                    <Briefcase size={12} color="#9ca3af" />
                                                    <Text className="text-gray-400 text-xs">{project.type}</Text>
                                                </View>
                                            </View>

                                            {/* Card Content */}
                                            <View className="p-4">
                                                {/* Partner Info & Deadline */}
                                                <View className="flex-row justify-between items-center mb-4">
                                                    <View className="flex-row items-center gap-2">
                                                        <Image 
                                                            source={{ uri: project.partner.avatar }} 
                                                            className="w-8 h-8 rounded-full bg-gray-700"
                                                        />
                                                        <View>
                                                            <View className="flex-row items-center gap-1">
                                                                <Text className="text-white font-medium text-sm">{project.partner.name}</Text>
                                                                {project.partner.isVerified && <Shield size={10} color="#3b82f6" fill="#3b82f6" />}
                                                            </View>
                                                            <Text className="text-gray-500 text-[10px]">{project.partner.role}</Text>
                                                        </View>
                                                    </View>
                                                    <View className="items-end">
                                                        <Text className="text-gray-500 text-[10px] mb-0.5">Deadline</Text>
                                                        <View className="flex-row items-center gap-1">
                                                            <Calendar size={12} color="#e5e7eb" />
                                                            <Text className="text-gray-200 text-xs font-medium">{project.deadline}</Text>
                                                        </View>
                                                    </View>
                                                </View>

                                                {/* Progress */}
                                                <View className="mb-4">
                                                    <View className="flex-row justify-between mb-1.5">
                                                        <Text className="text-gray-400 text-xs font-medium">Tiến độ</Text>
                                                        <Text className="text-white text-xs font-bold">{project.progress}%</Text>
                                                    </View>
                                                    <View className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                                        <View className="h-full bg-blue-500 rounded-full" style={{ width: `${project.progress}%` }} />
                                                    </View>
                                                </View>

                                                {/* Tasks */}
                                                <View className="flex-row flex-wrap gap-2">
                                                    {project.tasks.map(task => (
                                                        <View key={task.id} className="flex-row items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                                                            <View className={`w-1.5 h-1.5 rounded-full ${task.completed ? 'bg-green-500' : 'bg-gray-500'}`} />
                                                            <Text className={`text-[10px] ${task.completed ? 'text-gray-400 line-through' : 'text-gray-300'}`}>
                                                                {task.title}
                                                            </Text>
                                                        </View>
                                                    ))}
                                                    <View className="bg-white/5 px-2 py-1 rounded-md border border-white/5">
                                                        <Text className="text-[10px] text-gray-400">+2 việc khác</Text>
                                                    </View>
                                                </View>
                                            </View>

                                            {/* Card Footer Actions */}
                                            <View className="px-4 py-3 bg-white/5 border-t border-white/5 flex-row justify-between items-center">
                                                <View className="flex-row gap-2">
                                                    <TouchableOpacity className="flex-row items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                                                        <MessageSquare size={14} color="#9ca3af" />
                                                        <Text className="text-gray-300 text-xs font-medium">Chat</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity className="flex-row items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                                                        <FileText size={14} color="#9ca3af" />
                                                        <Text className="text-gray-300 text-xs font-medium">Chi tiết</Text>
                                                    </TouchableOpacity>
                                                </View>

                                                {isOwner ? (
                                                    <View className="flex-row gap-2">
                                                        <TouchableOpacity className="flex-row items-center gap-1.5 bg-orange-500/10 px-3 py-1.5 rounded-lg border border-orange-500/20">
                                                            <Bell size={14} color="#f97316" />
                                                            <Text className="text-orange-500 text-xs font-medium">Nhắc</Text>
                                                        </TouchableOpacity>
                                                        {project.status === 'reviewing' && (
                                                            <TouchableOpacity className="flex-row items-center gap-1.5 bg-green-600 px-3 py-1.5 rounded-lg">
                                                                <CheckCircle2 size={14} color="white" />
                                                                <Text className="text-white text-xs font-medium">Duyệt</Text>
                                                            </TouchableOpacity>
                                                        )}
                                                    </View>
                                                ) : (
                                                    project.status !== 'completed' && project.status !== 'cancelled' && (
                                                        <TouchableOpacity className="flex-row items-center gap-1.5 bg-blue-600 px-3 py-1.5 rounded-lg">
                                                            <ArrowUpRight size={14} color="white" />
                                                            <Text className="text-white text-xs font-medium">Cập nhật</Text>
                                                        </TouchableOpacity>
                                                    )
                                                )}
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        ) : (
                            <View className="items-center justify-center py-12">
                                <View className="w-16 h-16 rounded-full bg-white/5 items-center justify-center mb-4 border border-white/10">
                                    <Briefcase size={32} color="#6b7280" />
                                </View>
                                <Text className="text-white font-bold text-lg mb-1">Chưa có dự án nào</Text>
                                <Text className="text-gray-500 text-sm text-center max-w-[250px] mb-6">
                                    {activeTab === "received" 
                                        ? "Bạn chưa nhận dự án nào trên sàn việc làm." 
                                        : "Bạn chưa đăng tin tuyển dụng hoặc dự án nào."}
                                </Text>
                                <TouchableOpacity className="bg-white px-6 py-3 rounded-xl">
                                    <Text className="text-black font-bold">
                                        {activeTab === "received" ? "Tìm việc ngay" : "Đăng tin ngay"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </ScrollView>
                </SafeAreaView>
            </View>
        </Modal>
    );
};

const ProfileScreen = ({ onNavigate }) => {
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgradeModalTab, setUpgradeModalTab] = useState("credits");
    const [showPromotionsModal, setShowPromotionsModal] = useState(false);
    const [showMembershipModal, setShowMembershipModal] = useState(false);
    const [showReferralModal, setShowReferralModal] = useState(false);
    const [showJobsManagementModal, setShowJobsManagementModal] = useState(false);
    
    const renderMenuItem = (icon: any, title: string, subtitle?: string, isDestructive = false, onPress?: () => void) => (
        <TouchableOpacity 
            className="flex-row items-center justify-between py-4 border-b border-white/5 last:border-0"
            onPress={onPress}
        >
            <View className="flex-row items-center gap-4">
                <View className={`w-10 h-10 rounded-xl items-center justify-center ${isDestructive ? 'bg-red-500/10' : 'bg-[#1e1e2e]'}`}>
                    {React.createElement(icon, { size: 20, color: isDestructive ? '#ef4444' : '#9ca3af' })}
                </View>
                <View>
                    <Text className={`font-medium text-base ${isDestructive ? 'text-red-500' : 'text-white'}`}>{title}</Text>
                    {subtitle && <Text className="text-gray-500 text-xs mt-0.5">{subtitle}</Text>}
                </View>
            </View>
            <ChevronRight size={16} color="#4b5563" />
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-[#050511]">
            <SafeAreaView className="flex-1" edges={['top']}>
                {/* Header */}
                <View className="flex-row justify-between items-center px-4 py-3">
                    <Text className="text-white text-xl font-bold">Hồ sơ cá nhân</Text>
                    <TouchableOpacity>
                        <Settings size={24} color="#9ca3af" />
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                    
                    {/* User Info Card */}
                    <View className="bg-[#131320] rounded-2xl p-4 mb-6 border border-white/10 mt-2">
                        <View className="flex-row items-center mb-6">
                            <View className="w-16 h-16 rounded-full bg-gray-700 mr-4 border-2 border-blue-500 overflow-hidden">
                                <Image 
                                    source={{ uri: 'https://github.com/shadcn.png' }} 
                                    className="w-full h-full"
                                />
                            </View>
                            <View className="flex-1">
                                <View className="flex-row items-center gap-2 mb-1">
                                    <Text className="text-white text-lg font-bold">HaiAumedia</Text>
                                    <CheckCircle size={16} color="#3b82f6" fill="#3b82f6" />
                                    <View className="bg-purple-500/20 px-1.5 py-0.5 rounded flex-row items-center gap-1">
                                        <Shield size={10} color="#a855f7" />
                                    </View>
                                    <View className="bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-500/30">
                                        <Text className="text-blue-400 text-[10px] font-bold">Free</Text>
                                    </View>
                                </View>
                                <Text className="text-gray-400 text-sm">cskh.aumedia@gmail.com</Text>
                            </View>
                        </View>

                        <View className="flex-row justify-between items-center border-t border-white/5 pt-4">
                            <View className="items-center flex-1 border-r border-white/5">
                                <Text className="text-white font-bold text-lg mb-0.5">12</Text>
                                <Text className="text-gray-500 text-xs">Dự án</Text>
                            </View>
                            <View className="items-center flex-1 border-r border-white/5">
                                <Text className="text-white font-bold text-lg mb-0.5">45</Text>
                                <Text className="text-gray-500 text-xs">Đã lưu</Text>
                            </View>
                            <View className="items-center flex-1">
                                <Text className="text-yellow-500 font-bold text-lg mb-0.5">1250</Text>
                                <Text className="text-gray-500 text-xs">Credits</Text>
                            </View>
                        </View>
                    </View>

                    {/* Wallet Section */}
                    <Text className="text-gray-400 text-xs font-bold mb-3 uppercase tracking-wider">Ví tài khoản</Text>
                    <View className="bg-[#131320] rounded-2xl p-5 mb-6 border border-white/10 relative overflow-hidden">
                        {/* Background Decoration */}
                        <View className="absolute -right-4 -bottom-8 opacity-5 transform rotate-12">
                            <Wallet size={120} color="white" />
                        </View>

                        <View className="flex-row items-center gap-2 mb-2">
                            <Wallet size={16} color="#9ca3af" />
                            <Text className="text-gray-400 text-xs font-bold uppercase">Số dư khả dụng</Text>
                        </View>
                        <Text className="text-white text-3xl font-bold mb-6">5.000.000 đ</Text>

                        <View className="flex-row gap-3">
                            <TouchableOpacity className="flex-1 bg-[#10b981] py-3 rounded-xl flex-row items-center justify-center gap-2 shadow-lg shadow-green-900/20">
                                <ArrowDownLeft size={18} color="white" />
                                <Text className="text-white font-bold">Nạp tiền</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="flex-1 bg-[#1e1e2e] py-3 rounded-xl flex-row items-center justify-center gap-2 border border-white/10">
                                <ArrowUpRight size={18} color="white" />
                                <Text className="text-white font-bold">Rút tiền</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Menu Group 1 */}
                    <View className="bg-[#131320] rounded-2xl px-4 mb-6 border border-white/10">
                        {renderMenuItem(CreditCard, "Quản lý thanh toán", "Liên kết thẻ, ngân hàng & thuế", false, () => setShowPaymentModal(true))}
                        {renderMenuItem(History, "Lịch sử mục mua", "Lịch sử nạp rút & chi tiêu", false, () => setShowHistoryModal(true))}
                        {renderMenuItem(Crown, "Nâng cấp tài khoản", "Đổi VND sang Credits & Gói cước", false, () => {
                            setUpgradeModalTab("credits");
                            setShowUpgradeModal(true);
                        })}
                    </View>

                    {/* Expert Info Section */}
                    <View className="bg-[#0f172a] rounded-2xl p-4 mb-6 border border-blue-900/30">
                        <View className="flex-row justify-between items-center mb-4">
                            <View className="flex-row items-center gap-2">
                                <UserCog size={20} color="#3b82f6" />
                                <Text className="text-white font-bold text-base">Thông tin chuyên gia</Text>
                            </View>
                            <View className="bg-green-500/20 px-2 py-0.5 rounded text-xs border border-green-500/30">
                                <Text className="text-green-500 text-[10px] font-bold">Đã duyệt</Text>
                            </View>
                        </View>

                        <Text className="text-white font-bold text-lg mb-1">Cập nhật hồ sơ</Text>
                        <Text className="text-gray-400 text-xs mb-4 leading-5">Hoàn thiện hồ sơ năng lực để tăng độ tin cậy và tiếp cận nhiều khách hàng hơn.</Text>

                        <View className="flex-row items-center gap-4 mb-4 bg-[#1e293b] p-3 rounded-xl">
                            <View className="flex-row items-center gap-1.5">
                                <Star size={14} color="#eab308" fill="#eab308" />
                                <Text className="text-white text-sm font-bold">5.0</Text>
                            </View>
                            <View className="w-[1px] h-4 bg-white/10" />
                            <View className="flex-row items-center gap-1.5">
                                <Briefcase size={14} color="#3b82f6" />
                                <Text className="text-white text-sm font-medium">12 Dự án</Text>
                            </View>
                        </View>

                        <TouchableOpacity className="bg-blue-600 w-full py-3 rounded-xl items-center shadow-lg shadow-blue-900/20">
                            <Text className="text-white font-bold">Cập nhật ngay</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Membership & Offers */}
                    <Text className="text-gray-400 text-xs font-bold mb-3 uppercase tracking-wider">Hạng thành viên và ưu đãi</Text>
                    <View className="bg-[#131320] rounded-2xl px-4 mb-6 border border-white/10">
                        {renderMenuItem(Gem, "Gói hội viên", undefined, false, () => {
                            setUpgradeModalTab("plans");
                            setShowUpgradeModal(true);
                        })}
                        {renderMenuItem(Ticket, "Mã khuyến mại", undefined, false, () => setShowPromotionsModal(true))}
                        {renderMenuItem(Medal, "Hạng thành viên", undefined, false, () => setShowMembershipModal(true))}
                        {renderMenuItem(UserPlus, "Giới thiệu bạn bè", undefined, false, () => setShowReferralModal(true))}
                    </View>

                    {/* Management */}
                    <Text className="text-gray-400 text-xs font-bold mb-3 uppercase tracking-wider">Quản lý</Text>
                    <View className="bg-[#131320] rounded-2xl px-4 mb-6 border border-white/10">
                        {renderMenuItem(Zap, "Check thông tin")}
                        {renderMenuItem(Briefcase, "Dự án của tôi")}
                        {renderMenuItem(Bookmark, "Đã lưu")}
                        {renderMenuItem(Clock, "Lịch sử hoạt động")}
                        {renderMenuItem(FileText, "Việc làm & Ứng tuyển", undefined, false, () => setShowJobsManagementModal(true))}
                        {renderMenuItem(Package, "Gói dịch vụ")}
                    </View>

                    {/* Other */}
                    <Text className="text-gray-400 text-xs font-bold mb-3 uppercase tracking-wider">Khác</Text>
                    <View className="bg-[#131320] rounded-2xl px-4 mb-8 border border-white/10">
                        {renderMenuItem(Settings, "Cài đặt")}
                        {renderMenuItem(HelpCircle, "Trợ giúp & Hỗ trợ")}
                        {renderMenuItem(LogOut, "Đăng xuất", undefined, true)}
                    </View>

                    <Text className="text-gray-600 text-center text-[10px] mb-8">Locaith AI Studio v1.2.0 • © 2024</Text>

                </ScrollView>
            </SafeAreaView>

            {/* Bottom Navigation Bar */}
            <View className="absolute bottom-0 w-full px-4 pb-12 pt-4">
                <BlurView intensity={80} tint="dark" className="flex-row justify-between items-center bg-[#000000] px-2 py-4 rounded-3xl border border-white/10">
                    <TouchableOpacity className="items-center px-2 opacity-60" onPress={() => onNavigate && onNavigate('dashboard')}>
                        <View className="p-2 mb-1">
                            <MessageSquare size={22} color="#9ca3af" />
                        </View>
                        <Text className="text-[10px] font-medium text-gray-400">Tư vấn AI</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="items-center px-2 opacity-60" onPress={() => onNavigate && onNavigate('jobs')}>
                        <View className="p-2 mb-1">
                            <Briefcase size={22} color="#9ca3af" />
                        </View>
                        <Text className="text-[10px] font-medium text-gray-400">Việc làm</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="items-center px-2 opacity-60" onPress={() => onNavigate && onNavigate('chat')}>
                <View className="p-2 mb-1">
                    <MessageCircle size={22} color="#9ca3af" />
                </View>
                <Text className="text-[10px] font-medium text-gray-400">Chat</Text>
            </TouchableOpacity>

                    <TouchableOpacity className="items-center px-2 opacity-60" onPress={() => onNavigate && onNavigate('apps')}>
                        <View className="p-2 mb-1">
                            <LayoutGrid size={22} color="#9ca3af" />
                        </View>
                        <Text className="text-[10px] font-medium text-gray-400">Ứng dụng</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="items-center px-2 opacity-60" onPress={() => onNavigate && onNavigate('explore')}>
                        <View className="p-2 mb-1">
                            <Compass size={22} color="#9ca3af" />
                        </View>
                        <Text className="text-[10px] font-medium text-gray-400">Khám phá</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="items-center px-2">
                        <View className="bg-blue-600/20 p-2 rounded-xl mb-1">
                            <User size={20} color="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                        </View>
                        <Text className="text-[10px] font-medium text-blue-500">Cá nhân</Text>
                    </TouchableOpacity>
                </BlurView>
            </View>

            <PaymentManagementModal 
                visible={showPaymentModal} 
                onClose={() => setShowPaymentModal(false)} 
            />

            <PurchaseHistoryModal 
                visible={showHistoryModal} 
                onClose={() => setShowHistoryModal(false)} 
            />

            <UpgradeAccountModal 
                visible={showUpgradeModal} 
                onClose={() => setShowUpgradeModal(false)} 
                initialTab={upgradeModalTab}
            />

            <PromotionsModal 
                visible={showPromotionsModal} 
                onClose={() => setShowPromotionsModal(false)} 
            />

            <MembershipTierModal 
                visible={showMembershipModal} 
                onClose={() => setShowMembershipModal(false)} 
            />

            <ReferralModal 
                visible={showReferralModal} 
                onClose={() => setShowReferralModal(false)} 
            />

            <JobsManagementModal 
                visible={showJobsManagementModal} 
                onClose={() => setShowJobsManagementModal(false)} 
            />
        </View>
    );
};

export default ProfileScreen;
