import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, Dimensions, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, Star, CheckCircle, MapPin, Building2, User, Plus, Bookmark, Info, MessageSquare, Briefcase, MessageCircle, LayoutGrid, Compass, Check, X, Phone, Mail, ChevronDown, DollarSign, Shield, Award, Clock, ChevronLeft, Upload } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const expertCategories = [
  { id: "all", label: "Tất cả" },
  { id: "dev", label: "Lập trình & IT" },
  { id: "ai", label: "Chuyên gia AI" },
  { id: "design", label: "Thiết kế & Sáng tạo" },
  { id: "marketing", label: "Marketing & SEO" },
  { id: "finance", label: "Tài chính" },
  { id: "legal", label: "Pháp lý" },
  { id: "education", label: "Giáo dục & Đào tạo" },
];

const RegisterExpertModal = ({ visible, onClose }) => {
    const [category, setCategory] = useState("");
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = () => {
        if (!agreed) return;
        setLoading(true);
        // Mock API call
        setTimeout(() => {
            setLoading(false);
            Alert.alert(
                "Đăng ký thành công!",
                "Hồ sơ của bạn đang được xét duyệt. Chúng tôi sẽ liên hệ lại trong vòng 24h làm việc.",
                [{ text: "OK", onPress: onClose }]
            );
        }, 1500);
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
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <View 
                    className="flex-1 bg-black/80 justify-end sm:justify-center p-0 sm:p-4"
                    style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
                >
                    <View 
                        className="bg-[#1e1e2e] w-full h-[95%] sm:h-auto sm:max-h-[90%] rounded-t-3xl sm:rounded-3xl border border-white/10 overflow-hidden"
                        style={{ maxHeight: '95%' }}
                    >
                        {/* Header */}
                        <View className="flex-row items-center justify-between px-5 py-4 border-b border-white/10 bg-[#1e1e2e]">
                            <View className="flex-row items-center gap-3 flex-1">
                                <View className="w-8 h-8 bg-blue-600 rounded-lg items-center justify-center">
                                    <Shield size={20} color="white" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-white font-bold text-lg">Đăng ký Chuyên gia</Text>
                                    <Text className="text-gray-400 text-xs numberOfLines={1}">Gia nhập mạng lưới chuyên gia Locaith</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={onClose} className="w-8 h-8 bg-white/5 rounded-full items-center justify-center">
                                <X size={20} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="flex-1 px-5 py-4" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                            
                            {/* Benefits Banner */}
                            <LinearGradient
                                colors={['#1e3a8a', '#1e40af']}
                                className="rounded-2xl p-5 mb-6 border border-blue-500/30 relative overflow-hidden"
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <View className="relative z-10">
                                    <Text className="text-white font-bold text-lg mb-2">Quyền lợi thành viên</Text>
                                    <View className="space-y-2">
                                        {[
                                            "Tiếp cận hàng ngàn dự án hấp dẫn",
                                            "Thanh toán đảm bảo, minh bạch 100%",
                                            "Xây dựng thương hiệu cá nhân",
                                            "Tham gia cộng đồng Elite Experts"
                                        ].map((item, i) => (
                                            <View key={i} className="flex-row items-start gap-2">
                                                <CheckCircle size={14} color="#4ade80" style={{ marginTop: 2 }} />
                                                <Text className="text-blue-100 text-xs flex-1">{item}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                                <Shield size={120} color="white" style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.1 }} />
                            </LinearGradient>

                            {/* Section 1: Personal Info */}
                            <View className="mb-6">
                                <View className="flex-row items-center gap-2 mb-4">
                                    <View className="p-2 bg-blue-500/10 rounded-lg">
                                        <User size={18} color="#3b82f6" />
                                    </View>
                                    <Text className="text-white font-bold text-base">Thông tin cá nhân</Text>
                                </View>
                                
                                <View className="space-y-4">
                                    <View className="gap-2">
                                        <Text className="text-gray-300 font-medium text-sm">Họ và tên <Text className="text-red-500">*</Text></Text>
                                        <TextInput 
                                            className="bg-[#131320] border border-white/10 rounded-xl px-4 py-3 text-white"
                                            placeholder="VD: Nguyễn Văn A"
                                            placeholderTextColor="#6b7280"
                                        />
                                    </View>

                                    <View className="flex-row gap-4">
                                        <View className="flex-1 gap-2">
                                            <Text className="text-gray-300 font-medium text-sm">Số điện thoại <Text className="text-red-500">*</Text></Text>
                                            <TextInput 
                                                className="bg-[#131320] border border-white/10 rounded-xl px-4 py-3 text-white"
                                                placeholder="0912..."
                                                placeholderTextColor="#6b7280"
                                                keyboardType="phone-pad"
                                            />
                                        </View>
                                        <View className="flex-1 gap-2">
                                            <Text className="text-gray-300 font-medium text-sm">Email <Text className="text-red-500">*</Text></Text>
                                            <TextInput 
                                                className="bg-[#131320] border border-white/10 rounded-xl px-4 py-3 text-white"
                                                placeholder="name@email.com"
                                                placeholderTextColor="#6b7280"
                                                keyboardType="email-address"
                                            />
                                        </View>
                                    </View>

                                    <View className="gap-2">
                                        <Text className="text-gray-300 font-medium text-sm">LinkedIn / Portfolio</Text>
                                        <TextInput 
                                            className="bg-[#131320] border border-white/10 rounded-xl px-4 py-3 text-white"
                                            placeholder="linkedin.com/in/..."
                                            placeholderTextColor="#6b7280"
                                        />
                                    </View>
                                </View>
                            </View>

                            {/* Section 2: Professional Profile */}
                            <View className="mb-6">
                                <View className="flex-row items-center gap-2 mb-4">
                                    <View className="p-2 bg-purple-500/10 rounded-lg">
                                        <Briefcase size={18} color="#a855f7" />
                                    </View>
                                    <Text className="text-white font-bold text-base">Hồ sơ chuyên môn</Text>
                                </View>

                                <View className="space-y-4">
                                    <View className="gap-2">
                                        <Text className="text-gray-300 font-medium text-sm">Chức danh hiển thị <Text className="text-red-500">*</Text></Text>
                                        <TextInput 
                                            className="bg-[#131320] border border-white/10 rounded-xl px-4 py-3 text-white"
                                            placeholder="VD: Senior AI Engineer"
                                            placeholderTextColor="#6b7280"
                                        />
                                    </View>

                                    <View className="gap-2 z-20">
                                        <Text className="text-gray-300 font-medium text-sm">Lĩnh vực chuyên môn <Text className="text-red-500">*</Text></Text>
                                        <TouchableOpacity 
                                            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                                            className="bg-[#131320] border border-white/10 rounded-xl px-4 py-3 flex-row justify-between items-center"
                                        >
                                            <Text className={category ? "text-white" : "text-gray-500"}>
                                                {category ? expertCategories.find(c => c.id === category)?.label : "Chọn lĩnh vực"}
                                            </Text>
                                            <ChevronDown size={16} color="#9ca3af" />
                                        </TouchableOpacity>
                                        {showCategoryPicker && (
                                            <View className="absolute top-full left-0 right-0 bg-[#2a2a3c] border border-white/10 rounded-xl z-50 mt-1 shadow-lg shadow-black/50 overflow-hidden">
                                                <ScrollView style={{ maxHeight: 200 }}>
                                                    {expertCategories.filter(c => c.id !== 'all').map((item) => (
                                                        <TouchableOpacity 
                                                            key={item.id}
                                                            onPress={() => {
                                                                setCategory(item.id);
                                                                setShowCategoryPicker(false);
                                                            }}
                                                            className="px-4 py-3 border-b border-white/5 flex-row justify-between items-center active:bg-white/5"
                                                        >
                                                            <Text className="text-gray-300 text-sm">{item.label}</Text>
                                                            {category === item.id && <Check size={14} color="#3b82f6" />}
                                                        </TouchableOpacity>
                                                    ))}
                                                </ScrollView>
                                            </View>
                                        )}
                                    </View>

                                    <View className="flex-row gap-4">
                                        <View className="flex-[2] gap-2">
                                            <Text className="text-gray-300 font-medium text-sm">Công ty hiện tại</Text>
                                            <TextInput 
                                                className="bg-[#131320] border border-white/10 rounded-xl px-4 py-3 text-white"
                                                placeholder="VD: Google..."
                                                placeholderTextColor="#6b7280"
                                            />
                                        </View>
                                        <View className="flex-1 gap-2">
                                            <Text className="text-gray-300 font-medium text-sm">Kinh nghiệm</Text>
                                            <TextInput 
                                                className="bg-[#131320] border border-white/10 rounded-xl px-4 py-3 text-white"
                                                placeholder="Số năm"
                                                placeholderTextColor="#6b7280"
                                                keyboardType="numeric"
                                            />
                                        </View>
                                    </View>

                                    <View className="gap-2">
                                        <Text className="text-gray-300 font-medium text-sm">Giới thiệu & Thành tích <Text className="text-red-500">*</Text></Text>
                                        <TextInput 
                                            className="bg-[#131320] border border-white/10 rounded-xl px-4 py-3 text-white h-28 leading-5"
                                            placeholder="Mô tả kinh nghiệm, dự án đã thực hiện và thế mạnh của bạn..."
                                            placeholderTextColor="#6b7280"
                                            multiline
                                            textAlignVertical="top"
                                        />
                                    </View>
                                </View>
                            </View>

                            {/* Section 3: Services & Rates */}
                            <View className="mb-6">
                                <View className="flex-row items-center gap-2 mb-4">
                                    <View className="p-2 bg-green-500/10 rounded-lg">
                                        <DollarSign size={18} color="#22c55e" />
                                    </View>
                                    <Text className="text-white font-bold text-base">Dịch vụ & Chi phí</Text>
                                </View>

                                <View className="space-y-4">
                                    <View className="flex-row gap-4">
                                        <View className="flex-1 gap-2">
                                            <Text className="text-gray-300 font-medium text-sm">Giá tham khảo/giờ</Text>
                                            <TextInput 
                                                className="bg-[#131320] border border-white/10 rounded-xl px-4 py-3 text-white"
                                                placeholder="VD: 1.000.000"
                                                placeholderTextColor="#6b7280"
                                                keyboardType="numeric"
                                            />
                                        </View>
                                        <View className="flex-1 gap-2">
                                            <Text className="text-gray-300 font-medium text-sm">Yêu cầu cọc</Text>
                                            <TextInput 
                                                className="bg-[#131320] border border-white/10 rounded-xl px-4 py-3 text-white"
                                                placeholder="VD: 500.000"
                                                placeholderTextColor="#6b7280"
                                                keyboardType="numeric"
                                            />
                                        </View>
                                    </View>

                                    <View className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex-row gap-3">
                                        <Award size={20} color="#f97316" />
                                        <View className="flex-1">
                                            <Text className="text-orange-500 font-bold text-sm mb-1">Chứng nhận & Xác minh</Text>
                                            <Text className="text-orange-400/80 text-xs leading-4">
                                                Để được gắn huy hiệu Verified, vui lòng chuẩn bị sẵn CV, Bằng cấp. Chúng tôi sẽ yêu cầu bổ sung ở bước xác minh sau.
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {/* Support Section */}
                            <View className="mb-6 bg-[#131320] border border-white/10 rounded-xl p-4">
                                <View className="flex-row items-center gap-2 mb-3">
                                    <Info size={18} color="#3b82f6" />
                                    <Text className="text-white font-bold text-base">Hỗ trợ</Text>
                                </View>
                                <View className="space-y-3">
                                    <View className="flex-row items-center gap-3 p-3 bg-white/5 rounded-lg">
                                        <Mail size={18} color="#9ca3af" />
                                        <View>
                                            <Text className="text-white font-medium text-sm">Email hỗ trợ</Text>
                                            <Text className="text-gray-400 text-xs">experts@locaith.com</Text>
                                        </View>
                                    </View>
                                    <View className="flex-row items-center gap-3 p-3 bg-white/5 rounded-lg">
                                        <Phone size={18} color="#9ca3af" />
                                        <View>
                                            <Text className="text-white font-medium text-sm">Hotline</Text>
                                            <Text className="text-gray-400 text-xs">1900 6868 (8:00 - 18:00)</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {/* Agreement */}
                            <TouchableOpacity 
                                className="flex-row items-start gap-3 mb-6 bg-white/5 p-3 rounded-xl border border-white/5"
                                onPress={() => setAgreed(!agreed)}
                            >
                                <View className={`w-5 h-5 rounded border ${agreed ? 'bg-blue-600 border-blue-600' : 'border-gray-500'} items-center justify-center mt-0.5`}>
                                    {agreed && <Check size={12} color="white" />}
                                </View>
                                <Text className="text-gray-400 text-xs flex-1 leading-5">
                                    Tôi cam kết thông tin cung cấp là chính xác và đồng ý với <Text className="text-blue-500 font-bold">Điều khoản dịch vụ</Text> của Locaith.
                                </Text>
                            </TouchableOpacity>

                        </ScrollView>

                        {/* Footer Buttons */}
                        <View className="p-5 border-t border-white/10 bg-[#1e1e2e] flex-row gap-3">
                            <TouchableOpacity onPress={onClose} className="flex-1 py-3 rounded-xl border border-white/10 items-center">
                                <Text className="text-gray-400 font-bold">Hủy bỏ</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={onClose} 
                                className={`flex-[2] py-3 rounded-xl items-center shadow-lg ${agreed ? 'bg-blue-600 shadow-blue-600/20' : 'bg-gray-700'}`}
                                disabled={!agreed}
                            >
                                <Text className={`font-bold ${agreed ? 'text-white' : 'text-gray-400'}`}>Gửi hồ sơ đăng ký</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const HireExpertModal = ({ expert, onClose }) => {
    const [projectName, setProjectName] = useState("");
    const [description, setDescription] = useState("");
    const [budget, setBudget] = useState("");
    const [duration, setDuration] = useState("");
    const [loading, setLoading] = useState(false);

    if (!expert) return null;

    const handleSubmit = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            onClose();
            // Show success message (can be handled by parent or toast)
        }, 1500);
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={!!expert}
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
                            <ChevronLeft size={24} color="white" />
                        </TouchableOpacity>
                        <View className="flex-1">
                            <Text className="text-white font-bold text-lg">Thuê chuyên gia</Text>
                            <Text className="text-blue-500 text-xs font-medium">{expert.name}</Text>
                        </View>
                    </View>

                    <KeyboardAvoidingView 
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        className="flex-1"
                    >
                        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                            {/* Intro Text */}
                            <View className="mb-6">
                                <Text className="text-white font-bold text-2xl mb-2">Thông tin dự án</Text>
                                <Text className="text-gray-400 text-sm leading-5">
                                    Mô tả chi tiết yêu cầu của bạn để chuyên gia có thể nắm bắt và phản hồi chính xác nhất.
                                </Text>
                            </View>

                            {/* Form Section 1: Project Details */}
                            <View className="bg-[#1e1e2e] rounded-2xl border border-white/5 p-5 mb-6">
                                <View className="flex-row items-center gap-3 mb-4 pb-4 border-b border-white/5">
                                    <View className="w-10 h-10 bg-blue-500/10 rounded-xl items-center justify-center">
                                        <Briefcase size={20} color="#3b82f6" />
                                    </View>
                                    <View>
                                        <Text className="text-white font-bold text-base">Chi tiết công việc</Text>
                                        <Text className="text-gray-500 text-xs">Thông tin cơ bản về dự án cần thuê.</Text>
                                    </View>
                                </View>

                                <View className="space-y-4">
                                    <View>
                                        <Text className="text-gray-300 font-medium text-sm mb-2">Tên dự án <Text className="text-red-500">*</Text></Text>
                                        <TextInput 
                                            className="bg-[#131320] border border-white/10 rounded-xl px-4 py-3 text-white"
                                            placeholder="Ví dụ: Xây dựng hệ thống CRM..."
                                            placeholderTextColor="#6b7280"
                                            value={projectName}
                                            onChangeText={setProjectName}
                                        />
                                    </View>

                                    <View>
                                        <Text className="text-gray-300 font-medium text-sm mb-2">Mô tả yêu cầu <Text className="text-red-500">*</Text></Text>
                                        <TextInput 
                                            className="bg-[#131320] border border-white/10 rounded-xl px-4 py-3 text-white h-40"
                                            placeholder="Mô tả chi tiết về phạm vi công việc, mục tiêu..."
                                            placeholderTextColor="#6b7280"
                                            multiline
                                            textAlignVertical="top"
                                            value={description}
                                            onChangeText={setDescription}
                                        />
                                    </View>

                                    <View>
                                        <Text className="text-gray-300 font-medium text-sm mb-2">Tài liệu đính kèm</Text>
                                        <TouchableOpacity className="border border-dashed border-white/20 rounded-xl p-6 items-center justify-center bg-white/5">
                                            <View className="w-10 h-10 bg-white/10 rounded-full items-center justify-center mb-2">
                                                <Upload size={20} color="#9ca3af" />
                                            </View>
                                            <Text className="text-blue-500 font-medium text-sm">Tải lên tài liệu</Text>
                                            <Text className="text-gray-500 text-xs mt-1">PDF, DOCX, JPG, PNG (Tối đa 20MB)</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            {/* Expert Summary Card */}
                            <View className="bg-[#1e1e2e] rounded-2xl border border-white/5 p-4 mb-6">
                                <Text className="text-white font-bold text-base mb-3 flex-row items-center gap-2">
                                    <User size={18} color="#3b82f6" />
                                    <Text> Chuyên gia được chọn</Text>
                                </Text>
                                <View className="flex-row gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                                    <View className="w-12 h-12 bg-blue-900/30 rounded-xl items-center justify-center border border-blue-500/30">
                                        <Text className="text-blue-500 font-bold text-lg">{expert.avatar}</Text>
                                    </View>
                                    <View className="flex-1 justify-center">
                                        <Text className="text-white font-bold text-sm">{expert.name}</Text>
                                        <Text className="text-gray-400 text-xs">{expert.role}</Text>
                                        <View className="bg-blue-500/10 px-2 py-0.5 rounded self-start mt-1">
                                            <Text className="text-blue-500 text-[10px] font-bold">{expert.price}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {/* Form Section 2: Budget & Timeline */}
                            <View className="bg-[#1e1e2e] rounded-2xl border border-white/5 p-5 mb-6">
                                <View className="flex-row items-center gap-3 mb-4 pb-4 border-b border-white/5">
                                    <View className="w-10 h-10 bg-green-500/10 rounded-xl items-center justify-center">
                                        <DollarSign size={20} color="#22c55e" />
                                    </View>
                                    <View>
                                        <Text className="text-white font-bold text-base">Ngân sách & Thời gian</Text>
                                        <Text className="text-gray-500 text-xs">Định giá và kế hoạch triển khai.</Text>
                                    </View>
                                </View>

                                <View className="space-y-4">
                                    <View>
                                        <Text className="text-gray-300 font-medium text-sm mb-2">Ngân sách dự kiến (VNĐ)</Text>
                                        <View className="relative justify-center">
                                            <TextInput 
                                                className="bg-[#131320] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white font-bold"
                                                placeholder="0"
                                                placeholderTextColor="#6b7280"
                                                keyboardType="numeric"
                                                value={budget}
                                                onChangeText={setBudget}
                                            />
                                            <Text className="absolute left-4 text-gray-500 font-bold">₫</Text>
                                        </View>
                                    </View>

                                    <View>
                                        <Text className="text-gray-300 font-medium text-sm mb-2">Thời gian dự kiến</Text>
                                        <View className="relative justify-center">
                                            <TextInput 
                                                className="bg-[#131320] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white"
                                                placeholder="VD: 2 tuần, 1 tháng..."
                                                placeholderTextColor="#6b7280"
                                                value={duration}
                                                onChangeText={setDuration}
                                            />
                                            <View className="absolute left-3">
                                                <Clock size={16} color="#6b7280" />
                                            </View>
                                        </View>
                                    </View>

                                    <View>
                                        <Text className="text-gray-300 font-medium text-sm mb-2">Đặt cọc (nếu có)</Text>
                                        <View className="relative justify-center">
                                            <TextInput 
                                                className="bg-[#131320] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white"
                                                value={expert.deposit || "Thỏa thuận"}
                                                editable={false}
                                            />
                                            <View className="absolute left-3">
                                                <Shield size={16} color="#6b7280" />
                                            </View>
                                        </View>
                                        {expert.deposit && (
                                            <Text className="text-gray-500 text-[10px] mt-1 italic">
                                                * Chuyên gia yêu cầu đặt cọc tối thiểu {expert.deposit}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            </View>

                        </ScrollView>
                    </KeyboardAvoidingView>

                    {/* Footer Buttons */}
                    <View className="p-4 border-t border-white/10 bg-[#1e1e2e] flex-row gap-3">
                        <TouchableOpacity onPress={onClose} className="flex-1 py-3.5 rounded-xl border border-white/10 items-center">
                            <Text className="text-gray-400 font-bold">Hủy bỏ</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={handleSubmit}
                            className="flex-[2] py-3.5 rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20 items-center"
                            disabled={loading}
                        >
                            <Text className="text-white font-bold">{loading ? "Đang gửi..." : "Gửi lời mời hợp tác"}</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    );
};

const ExpertDetailModal = ({ expert, onClose, onHire }) => {
    if (!expert) return null;

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={!!expert}
            onRequestClose={onClose}
            statusBarTranslucent={true}
            hardwareAccelerated={true}
        >
            <View className="flex-1 bg-[#050511]">
                <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
                    {/* Header */}
                    <View className="flex-row items-center justify-between px-4 py-3 border-b border-white/10 bg-[#131320]">
                        <TouchableOpacity onPress={onClose} className="p-2 -ml-2">
                            <ChevronLeft size={24} color="#9ca3af" />
                        </TouchableOpacity>
                        <Text className="text-white font-bold text-lg">Hồ sơ chuyên gia</Text>
                        <View className="w-8" />
                    </View>

                    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                        {/* Cover & Profile */}
                        <View className="relative">
                            <LinearGradient
                                colors={['#2563eb', '#4f46e5']}
                                className="h-32 w-full"
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            />
                            <View className="px-5 -mt-10">
                                <View className="flex-row justify-between items-end">
                                    <View className="w-24 h-24 bg-[#131320] rounded-2xl p-1 shadow-xl">
                                        <View className="flex-1 bg-[#1e1e2e] rounded-xl items-center justify-center border border-white/10">
                                            <Text className="text-blue-500 font-bold text-2xl">{expert.avatar}</Text>
                                        </View>
                                    </View>
                                    {expert.verified && (
                                        <View className="bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg flex-row items-center gap-1.5 mb-2">
                                            <CheckCircle size={14} color="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                                            <Text className="text-blue-500 font-bold text-xs">VERIFIED</Text>
                                        </View>
                                    )}
                                </View>

                                <View className="mt-4 mb-6">
                                    <Text className="text-white font-bold text-2xl mb-1">{expert.name}</Text>
                                    <Text className="text-blue-400 font-medium text-base mb-2">{expert.role}</Text>
                                    
                                    <View className="flex-row items-center gap-4 text-sm">
                                        <View className="flex-row items-center gap-1.5">
                                            <Building2 size={14} color="#9ca3af" />
                                            <Text className="text-gray-400">{expert.company}</Text>
                                        </View>
                                        {expert.location && (
                                            <View className="flex-row items-center gap-1.5">
                                                <MapPin size={14} color="#9ca3af" />
                                                <Text className="text-gray-400">{expert.location}</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>

                                {/* Stats Grid */}
                                <View className="flex-row gap-3 mb-6">
                                    <View className="flex-1 bg-[#1e1e2e] p-3 rounded-xl border border-white/5 items-center">
                                        <View className="flex-row items-center gap-1 mb-1">
                                            <Star size={14} color="#eab308" fill="#eab308" />
                                            <Text className="text-white font-bold">{expert.rating}</Text>
                                        </View>
                                        <Text className="text-gray-500 text-[10px] uppercase">Đánh giá</Text>
                                    </View>
                                    <View className="flex-1 bg-[#1e1e2e] p-3 rounded-xl border border-white/5 items-center">
                                        <Text className="text-white font-bold mb-1">{expert.stats?.projectsCompleted || 0}</Text>
                                        <Text className="text-gray-500 text-[10px] uppercase">Dự án</Text>
                                    </View>
                                    <View className="flex-1 bg-[#1e1e2e] p-3 rounded-xl border border-white/5 items-center">
                                        <Text className="text-white font-bold mb-1">{expert.stats?.responseTime || 'N/A'}</Text>
                                        <Text className="text-gray-500 text-[10px] uppercase">Phản hồi</Text>
                                    </View>
                                </View>

                                {/* Price Card */}
                                <View className="bg-[#1e1e2e] p-4 rounded-xl border border-white/10 mb-6">
                                    <View className="flex-row justify-between items-center mb-4">
                                        <View>
                                            <Text className="text-gray-400 text-xs mb-1">Chi phí thuê</Text>
                                            <Text className="text-green-500 font-bold text-xl">{expert.price}</Text>
                                        </View>
                                        <View className="bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20">
                                            <Text className="text-green-500 text-xs font-bold">Available</Text>
                                        </View>
                                    </View>
                                    <View className="flex-row gap-3">
                                        <TouchableOpacity className="flex-1 bg-white/5 border border-white/10 py-2.5 rounded-xl flex-row items-center justify-center gap-2">
                                            <MessageSquare size={16} color="white" />
                                            <Text className="text-white font-bold text-sm">Nhắn tin</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity className="flex-1 bg-white/5 border border-white/10 py-2.5 rounded-xl flex-row items-center justify-center gap-2">
                                            <Bookmark size={16} color="white" />
                                            <Text className="text-white font-bold text-sm">Lưu hồ sơ</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Bio Section */}
                                <View className="mb-6">
                                    <View className="flex-row items-center gap-2 mb-3">
                                        <User size={18} color="#9ca3af" />
                                        <Text className="text-gray-300 font-bold text-base uppercase tracking-wider">Giới thiệu</Text>
                                    </View>
                                    <Text className="text-gray-400 leading-6 text-justify">
                                        {expert.bio}
                                    </Text>
                                </View>

                                {/* Skills Section */}
                                <View className="mb-6">
                                    <View className="flex-row items-center gap-2 mb-3">
                                        <Award size={18} color="#9ca3af" />
                                        <Text className="text-gray-300 font-bold text-base uppercase tracking-wider">Kỹ năng</Text>
                                    </View>
                                    <View className="flex-row flex-wrap gap-2">
                                        {expert.skills.map((skill, index) => (
                                            <View key={index} className="bg-[#1e1e2e] px-3 py-1.5 rounded-lg border border-white/10">
                                                <Text className="text-gray-300 text-sm">{skill}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>

                                {/* Experience Section */}
                                {expert.experience && expert.experience.length > 0 && (
                                    <View className="mb-6">
                                        <View className="flex-row items-center gap-2 mb-4">
                                            <Briefcase size={18} color="#9ca3af" />
                                            <Text className="text-gray-300 font-bold text-base uppercase tracking-wider">Kinh nghiệm</Text>
                                        </View>
                                        <View className="pl-2 border-l border-white/10 ml-2 space-y-6">
                                            {expert.experience.map((exp, index) => (
                                                <View key={index} className="pl-4 relative">
                                                    <View className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500" />
                                                    <Text className="text-white font-bold text-base">{exp.role}</Text>
                                                    <View className="flex-row items-center justify-between mt-1 mb-2">
                                                        <Text className="text-blue-400 text-sm font-medium">{exp.company}</Text>
                                                        <Text className="text-gray-500 text-xs">{exp.period}</Text>
                                                    </View>
                                                    <Text className="text-gray-400 text-sm leading-5">{exp.description}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                )}

                                {/* Education & Achievements */}
                                <View className="grid gap-6">
                                    {expert.education && expert.education.length > 0 && (
                                        <View className="bg-[#1e1e2e] p-4 rounded-xl border border-white/5">
                                            <View className="flex-row items-center gap-2 mb-3">
                                                <Award size={18} color="#9ca3af" />
                                                <Text className="text-gray-300 font-bold text-sm uppercase tracking-wider">Học vấn</Text>
                                            </View>
                                            <View className="space-y-3">
                                                {expert.education.map((edu, index) => (
                                                    <View key={index}>
                                                        <Text className="text-white font-bold text-sm">{edu.degree}</Text>
                                                        <Text className="text-gray-400 text-xs mt-0.5">{edu.school}</Text>
                                                        <Text className="text-gray-500 text-[10px] mt-0.5">{edu.year}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    )}

                                    {expert.achievements && expert.achievements.length > 0 && (
                                        <View className="bg-[#1e1e2e] p-4 rounded-xl border border-white/5">
                                            <View className="flex-row items-center gap-2 mb-3">
                                                <Star size={18} color="#eab308" />
                                                <Text className="text-gray-300 font-bold text-sm uppercase tracking-wider">Thành tích</Text>
                                            </View>
                                            <View className="space-y-2">
                                                {expert.achievements.map((ach, index) => (
                                                    <View key={index} className="flex-row gap-2">
                                                        <Star size={12} color="#eab308" style={{ marginTop: 2 }} />
                                                        <Text className="text-gray-400 text-xs flex-1">{ach}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    )}
                                </View>

                                {/* Requirements Box */}
                                <View className="mt-6 mb-24 bg-blue-900/10 border border-blue-500/20 rounded-xl p-4">
                                    <View className="flex-row gap-3">
                                        <Shield size={20} color="#3b82f6" />
                                        <View className="flex-1">
                                            <Text className="text-blue-500 font-bold text-sm mb-1">Yêu cầu hợp tác</Text>
                                            <Text className="text-blue-200/70 text-xs leading-5">
                                                {expert.requirements}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </ScrollView>

                    {/* Fixed Bottom Action */}
                    <View className="absolute bottom-0 w-full px-5 py-4 bg-[#131320] border-t border-white/10">
                        <TouchableOpacity 
                            className="w-full bg-blue-600 py-3.5 rounded-xl shadow-lg shadow-blue-600/20 items-center"
                            onPress={() => {
                                onClose();
                                onHire();
                            }}
                        >
                            <Text className="text-white font-bold text-base">Thuê ngay</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    );
};

const mockExperts = [
  {
    id: "EXP-001",
    name: "Tiến sĩ Trần Minh Tuấn",
    role: "AI Research Scientist",
    company: "Locaith AI Lab",
    avatar: "MT",
    rating: 5.0,
    reviews: 142,
    price: "2.500.000 VNĐ/giờ",
    deposit: "1.000.000 VNĐ",
    verified: true,
    skills: ["Machine Learning", "Deep Learning", "NLP", "Computer Vision"],
    bio: "Chuyên gia hàng đầu về AI với hơn 10 năm nghiên cứu và phát triển các mô hình ngôn ngữ lớn. Tư vấn giải pháp chuyển đổi số cho các doanh nghiệp Fortune 500. Đã công bố 20+ bài báo khoa học tại các hội nghị AI hàng đầu.",
    requirements: "Chỉ nhận dự án có quy mô doanh nghiệp hoặc tư vấn chiến lược dài hạn. Yêu cầu NDA trước khi trao đổi chi tiết.",
    location: "Hà Nội, Việt Nam",
    stats: {
        projectsCompleted: 45,
        hoursWorked: 12500,
        responseTime: "Trong 1 giờ"
    },
    experience: [
        { role: "Senior AI Researcher", company: "Google DeepMind", period: "2018 - 2023", description: "Nghiên cứu và phát triển các mô hình ngôn ngữ lớn (LLMs). Tối ưu hóa thuật toán training." },
        { role: "AI Team Lead", company: "FPT Software", period: "2015 - 2018", description: "Xây dựng đội ngũ AI engineer từ con số 0. Triển khai các giải pháp AI cho khách hàng Nhật Bản." }
    ],
    education: [
        { degree: "Tiến sĩ Khoa học Máy tính", school: "Đại học Stanford", year: "2015" },
        { degree: "Thạc sĩ Trí tuệ Nhân tạo", school: "Đại học Tokyo", year: "2011" }
    ],
    achievements: [
        "Giải thưởng Best Paper tại NeurIPS 2022",
        "Top 10 Chuyên gia AI Việt Nam 2023",
        "Bằng sáng chế về NLP Processing"
    ]
  },
  {
    id: "EXP-002",
    name: "Nguyễn Thu Hà",
    role: "Senior UI/UX Designer",
    company: "Freelance",
    avatar: "TH",
    rating: 4.9,
    reviews: 89,
    price: "1.200.000 VNĐ/giờ",
    deposit: "500.000 VNĐ",
    verified: true,
    skills: ["Figma", "Adobe XD", "User Research", "Prototyping"],
    bio: "Nhà thiết kế trải nghiệm người dùng đam mê tạo ra các sản phẩm kỹ thuật số trực quan và dễ sử dụng. Phong cách hiện đại, tối giản. Có kinh nghiệm thiết kế app Fintech và E-commerce.",
    requirements: "Cần brief rõ ràng trước khi bắt đầu. Có thể làm việc onsite tại HCM.",
    location: "TP. Hồ Chí Minh, Việt Nam",
    stats: {
        projectsCompleted: 120,
        hoursWorked: 4500,
        responseTime: "Trong 30 phút"
    },
    experience: [
        { role: "Product Designer", company: "Grab", period: "2019 - 2022", description: "Thiết kế trải nghiệm người dùng cho ứng dụng GrabFood và GrabMart." },
        { role: "UI Designer", company: "VNG Corp", period: "2017 - 2019", description: "Tham gia thiết kế giao diện ZaloPay." }
    ],
    education: [
        { degree: "Cử nhân Mỹ thuật Công nghiệp", school: "Đại học Kiến trúc TP.HCM", year: "2017" }
    ],
    achievements: [
        "Giải nhất Behance Portfolio Review 2020",
        "Featured on Dribbble 5 times"
    ]
  },
  {
    id: "EXP-003",
    name: "Lê Văn Hùng",
    role: "Fullstack Developer",
    company: "Tech Corp",
    avatar: "LH",
    rating: 4.8,
    reviews: 215,
    price: "800.000 VNĐ/giờ",
    deposit: "Không yêu cầu",
    verified: true,
    skills: ["React", "Node.js", "AWS", "TypeScript", "Next.js"],
    bio: "Lập trình viên Fullstack với kinh nghiệm xây dựng các hệ thống web quy mô lớn. Cam kết code sạch, tối ưu hiệu năng. Chuyên về MERN stack và Serverless architecture.",
    requirements: "Nhận dự án outsource hoặc maintain hệ thống. Ưu tiên dự án dài hạn.",
    location: "Đà Nẵng, Việt Nam",
    stats: {
        projectsCompleted: 85,
        hoursWorked: 6000,
        responseTime: "Trong 2 giờ"
    },
    experience: [
        { role: "Senior Developer", company: "SmartDev", period: "2020 - Nay", description: "Phát triển các ứng dụng web cho khách hàng Châu Âu." },
        { role: "Web Developer", company: "Freelancer", period: "2018 - 2020", description: "Làm việc tự do trên Upwork với 100% Job Success Score." }
    ],
    education: [
        { degree: "Kỹ sư Phần mềm", school: "Đại học Bách Khoa Đà Nẵng", year: "2018" }
    ],
    achievements: [
        "Top Rated Plus Freelancer on Upwork",
        "Hackathon Winner 2019"
    ]
  }
];

const ExpertCard = ({ expert, onPressInfo, onPressHire }) => (
    <View className="bg-[#131320] border border-white/10 rounded-3xl p-5 mb-4 relative overflow-hidden">
        {/* ID Badge */}
        <View className="absolute top-4 left-5 z-10">
            <Text className="text-[10px] text-gray-500 font-mono">{expert.id}</Text>
        </View>

        {/* Rating Badge */}
        <View className="absolute top-4 right-5 z-10 bg-yellow-500/10 px-2 py-1 rounded-lg border border-yellow-500/20 flex-row items-center gap-1">
            <Star size={12} color="#eab308" fill="#eab308" />
            <Text className="text-yellow-500 text-xs font-bold">{expert.rating}</Text>
            <Text className="text-gray-500 text-[10px]">({expert.reviews})</Text>
        </View>

        {/* Header Info */}
        <View className="flex-row gap-4 mt-6 mb-3">
            <View className="w-14 h-14 bg-blue-900/30 rounded-2xl items-center justify-center border border-blue-500/30">
                <Text className="text-blue-500 font-bold text-xl">{expert.avatar}</Text>
            </View>
            <View className="flex-1 justify-center">
                <Text className="text-white font-bold text-lg leading-6">{expert.name}</Text>
                <View className="flex-row items-center gap-2 mt-1">
                    <Building2 size={12} color="#9ca3af" />
                    <Text className="text-gray-400 text-xs">{expert.role}</Text>
                </View>
                <View className="flex-row items-center gap-1 mt-0.5">
                    {expert.verified && <CheckCircle size={12} color="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />}
                    <Text className="text-gray-500 text-xs">{expert.company}</Text>
                </View>
            </View>
        </View>

        {/* Bio */}
        <Text className="text-gray-400 text-sm leading-5 mb-3" numberOfLines={3}>
            {expert.bio}
        </Text>

        {/* Requirements Box */}
        <View className="bg-[#1e1e2e] rounded-xl p-3 mb-4 border border-white/5">
            <Text className="text-blue-500 font-bold text-xs mb-1">Yêu cầu:</Text>
            <Text className="text-gray-300 text-xs leading-4">
                {expert.requirements}
            </Text>
        </View>

        {/* Tags */}
        <View className="flex-row flex-wrap gap-2 mb-5">
            {expert.skills.slice(0, 3).map((skill, index) => (
                <View key={index} className="bg-[#1e1e2e] px-3 py-1.5 rounded-lg border border-white/5">
                    <Text className="text-gray-400 text-xs">{skill}</Text>
                </View>
            ))}
            {expert.skills.length > 3 && (
                <View className="bg-[#1e1e2e] px-3 py-1.5 rounded-lg border border-white/5">
                    <Text className="text-gray-400 text-xs">+{expert.skills.length - 3}</Text>
                </View>
            )}
        </View>

        {/* Footer */}
        <View className="border-t border-white/10 pt-4 flex-row items-center justify-between">
            <View>
                <Text className="text-green-500 font-bold text-base">{expert.price}</Text>
                <Text className="text-orange-400/80 text-[10px]">Cọc: {expert.deposit}</Text>
            </View>
            <View className="flex-row gap-2">
                <TouchableOpacity 
                    className="flex-row items-center gap-1 px-3 py-2 rounded-xl border border-white/10 bg-white/5"
                    onPress={onPressInfo}
                >
                    <Info size={14} color="#d1d5db" />
                    <Text className="text-gray-300 text-xs font-medium">Thông tin</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    className="bg-blue-600 px-4 py-2 rounded-xl shadow-lg shadow-blue-600/20"
                    onPress={onPressHire}
                >
                    <Text className="text-white font-bold text-xs">Thuê ngay</Text>
                </TouchableOpacity>
            </View>
        </View>
    </View>
);

const ExpertsScreen = ({ onNavigate }) => {
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [hiringExpert, setHiringExpert] = useState(null);

  return (
    <View className="flex-1 bg-[#050511]">
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 gap-3">
            <TouchableOpacity 
                className="w-10 h-10 bg-blue-600 rounded-xl items-center justify-center shadow-lg shadow-blue-500/20"
                onPress={() => {}} // Filter action?
            >
                <Bookmark size={20} color="white" fill="white" />
            </TouchableOpacity>
            
            <View className="flex-1 h-10 bg-[#1e1e2e] rounded-full flex-row items-center px-4 border border-white/10">
                <Search size={16} color="#9ca3af" />
                <TextInput 
                    className="flex-1 ml-2 text-sm text-white h-full"
                    placeholder="Tìm kiếm chuyên gia theo..."
                    placeholderTextColor="#6b7280"
                />
            </View>

            <TouchableOpacity 
                className="h-10 px-4 bg-blue-600/20 border border-blue-500/30 rounded-full flex-row items-center gap-1"
                onPress={() => setShowRegisterModal(true)}
            >
                <Plus size={16} color="#3b82f6" />
                <Text className="text-blue-500 font-bold text-sm">Đăng ký</Text>
            </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <View className="mb-2">
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                className="mt-2 pl-4"
                contentContainerStyle={{ paddingRight: 20 }}
            >
                {expertCategories.map((cat, index) => (
                    <TouchableOpacity 
                        key={index}
                        onPress={() => setActiveFilter(cat.label)}
                        className={`mr-3 px-5 py-2 rounded-full border ${
                            activeFilter === cat.label 
                                ? 'bg-blue-600 border-blue-600' 
                                : 'bg-[#131320] border-white/10'
                        }`}
                    >
                        <Text className={`${
                            activeFilter === cat.label ? 'text-white font-bold' : 'text-gray-400'
                        }`}>
                            {cat.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>

        <ScrollView className="flex-1 px-4 pt-2" contentContainerStyle={{ paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
            {mockExperts.map((expert) => (
                <ExpertCard 
                    key={expert.id} 
                    expert={expert} 
                    onPressInfo={() => setSelectedExpert(expert)}
                    onPressHire={() => setHiringExpert(expert)}
                />
            ))}
        </ScrollView>
      </SafeAreaView>

      {/* Bottom Navigation Bar */}
      <View className="absolute bottom-0 w-full px-4 pb-12 pt-4">
        <BlurView intensity={80} tint="dark" className="flex-row justify-between items-center bg-[#000000] px-2 py-4 rounded-3xl border border-white/10">
            <TouchableOpacity className="items-center px-2 opacity-60" onPress={() => onNavigate('dashboard')}>
                <View className="p-2 mb-1">
                     <MessageSquare size={22} color="#9ca3af" />
                </View>
                <Text className="text-[10px] font-medium text-gray-400">Tư vấn AI</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center px-2 opacity-60" onPress={() => onNavigate('jobs')}>
                <View className="p-2 mb-1">
                    <Briefcase size={22} color="#9ca3af" />
                </View>
                <Text className="text-[10px] font-medium text-gray-400">Việc làm</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center px-2 opacity-60" onPress={() => onNavigate('chat')}>
                <View className="p-2 mb-1">
                    <MessageCircle size={22} color="#9ca3af" />
                </View>
                <Text className="text-[10px] font-medium text-gray-400">Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center px-2 opacity-60" onPress={() => onNavigate('apps')}>
                <View className="p-2 mb-1">
                    <LayoutGrid size={22} color="#9ca3af" />
                </View>
                <Text className="text-[10px] font-medium text-gray-400">Ứng dụng</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center px-2 opacity-60" onPress={() => onNavigate('explore')}>
                <View className="p-2 mb-1">
                    <Compass size={22} color="#9ca3af" />
                </View>
                <Text className="text-[10px] font-medium text-gray-400">Khám phá</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center px-2 opacity-60" onPress={() => onNavigate('profile')}>
                <View className="p-2 mb-1">
                    <User size={22} color="#9ca3af" />
                </View>
                <Text className="text-[10px] font-medium text-gray-400">Cá nhân</Text>
            </TouchableOpacity>
        </BlurView>
      </View>

      <RegisterExpertModal visible={showRegisterModal} onClose={() => setShowRegisterModal(false)} />
      <ExpertDetailModal 
        expert={selectedExpert} 
        onClose={() => setSelectedExpert(null)} 
        onHire={() => setHiringExpert(selectedExpert)}
      />
      <HireExpertModal expert={hiringExpert} onClose={() => setHiringExpert(null)} />
    </View>
  );
};

export default ExpertsScreen;