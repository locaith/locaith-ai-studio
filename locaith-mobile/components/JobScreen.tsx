import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Dimensions, StyleSheet, Image, Modal, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageSquare, MessageCircle, Briefcase, LayoutGrid, Compass, User, Search, Plus, Users, MapPin, Clock, Star, Info, X, ChevronDown, Check, FileText, Upload, DollarSign, Shield, ChevronLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const jobCategories = [
  { id: "dev", label: "Lập trình & IT" },
  { id: "design", label: "Thiết kế & Sáng tạo" },
  { id: "marketing", label: "Marketing & Sales" },
  { id: "content", label: "Viết lách & Dịch thuật" },
  { id: "admin", label: "Hành chính & Nhân sự" },
  { id: "service", label: "Dịch vụ & CSKH" },
];

const jobTypes = [
    "Dự án ngắn hạn",
    "Dự án dài hạn",
    "Toàn thời gian",
    "Part-time",
    "Freelance"
];

const JobDetailModal = ({ visible, onClose, job, onApply }) => {
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
                                <TouchableOpacity onPress={onClose} className="w-8 h-8 bg-white/5 rounded-full items-center justify-center">
                                    <ChevronLeft size={20} color="#9ca3af" />
                                </TouchableOpacity>
                                <View className="flex-1">
                                    <Text className="text-gray-400 text-xs">Chi tiết công việc</Text>
                                    <Text className="text-white font-bold text-base numberOfLines={1} ellipsizeMode='tail'">
                                        {job?.title}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <ScrollView className="flex-1 px-5 py-4" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                            
                            {/* Job Header Info Block */}
                            <View className="bg-[#131320] rounded-2xl border border-white/10 p-5 mb-4">
                                <View className="flex-row items-start justify-between mb-2">
                                    <Text className="flex-1 text-xl font-bold text-white leading-7 mr-2">{job?.title}</Text>
                                    {job?.status === 'urgent' && (
                                        <View className="bg-red-500/20 px-2 py-1 rounded">
                                            <Text className="text-red-500 text-[10px] font-bold">HOT</Text>
                                        </View>
                                    )}
                                </View>
                                
                                <View className="flex-row flex-wrap gap-4 mb-4">
                                    <View className="flex-row items-center gap-1.5">
                                        <MapPin size={14} color="#9ca3af" />
                                        <Text className="text-gray-400 text-xs">{job?.location}</Text>
                                    </View>
                                    <View className="flex-row items-center gap-1.5">
                                        <Clock size={14} color="#9ca3af" />
                                        <Text className="text-gray-400 text-xs">{job?.postedAt}</Text>
                                    </View>
                                    <View className="flex-row items-center gap-1.5">
                                        <Briefcase size={14} color="#9ca3af" />
                                        <Text className="text-gray-400 text-xs">{job?.type}</Text>
                                    </View>
                                </View>

                                <View className="flex-row items-center gap-2 mb-2">
                                    <DollarSign size={16} color="#22c55e" />
                                    <Text className="text-green-500 font-bold text-base">{job?.budget}</Text>
                                </View>

                                {job?.deposit && job?.deposit !== "Không yêu cầu" && (
                                    <View className="flex-row items-center gap-2 mb-4">
                                        <Shield size={16} color="#ea580c" />
                                        <Text className="text-orange-600 font-medium text-sm">Cọc: {job?.deposit}</Text>
                                    </View>
                                )}

                                <View className="flex-row gap-3 mt-2">
                                    <TouchableOpacity 
                                        className="flex-1 bg-blue-600 py-3 rounded-xl items-center shadow-lg shadow-blue-600/20"
                                        onPress={onApply}
                                    >
                                        <Text className="text-white font-bold">Ứng tuyển ngay</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity className="flex-1 bg-white/5 border border-white/10 py-3 rounded-xl flex-row items-center justify-center gap-2">
                                        <Star size={16} color="#9ca3af" />
                                        <Text className="text-gray-300 font-bold">Lưu tin</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Poster Info (Mobile friendly placement) */}
                            <View className="bg-[#1e1e2e] rounded-2xl border border-white/10 p-4 mb-4 flex-row items-center gap-4">
                                <View className="relative">
                                    <View className="w-16 h-16 bg-[#131320] rounded-2xl items-center justify-center border border-white/10">
                                        <Text className="text-blue-500 font-bold text-xl">{job?.poster?.avatar}</Text>
                                    </View>
                                    {job?.poster?.verified && (
                                        <View className="absolute -bottom-1 -right-1 bg-[#1e1e2e] rounded-full p-1">
                                            <View className="bg-blue-500 rounded-full p-0.5">
                                                <Check size={10} color="white" />
                                            </View>
                                        </View>
                                    )}
                                </View>
                                <View className="flex-1">
                                    <Text className="text-white font-bold text-base mb-1">{job?.poster?.name}</Text>
                                    <View className="flex-row items-center gap-2">
                                        <View className="flex-row items-center gap-1 bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20">
                                            <Star size={12} color="#eab308" fill="#eab308" />
                                            <Text className="text-yellow-500 text-xs font-bold">{job?.poster?.rating}</Text>
                                        </View>
                                        <Text className="text-gray-500 text-xs">({job?.poster?.commentCount} đánh giá)</Text>
                                    </View>
                                </View>
                                <TouchableOpacity className="bg-white/5 p-2 rounded-xl border border-white/10">
                                    <ChevronLeft size={20} color="#9ca3af" style={{ transform: [{ rotate: '180deg' }] }} />
                                </TouchableOpacity>
                            </View>

                            {/* Description */}
                            <View className="bg-[#1e1e2e] rounded-2xl border border-white/10 p-5 mb-4">
                                <View className="flex-row items-center gap-2 mb-3">
                                    <Info size={20} color="#3b82f6" />
                                    <Text className="text-white font-bold text-lg">Mô tả công việc</Text>
                                </View>
                                <Text className="text-gray-300 leading-6 text-sm">
                                    {job?.description || "Chưa có mô tả chi tiết."}
                                </Text>
                            </View>

                            {/* Requirements */}
                            <View className="bg-[#1e1e2e] rounded-2xl border border-white/10 p-5 mb-4">
                                <View className="flex-row items-center gap-2 mb-3">
                                    <LayoutGrid size={20} color="#3b82f6" />
                                    <Text className="text-white font-bold text-lg">Yêu cầu</Text>
                                </View>
                                <View className="gap-2">
                                    {job?.requirements?.map((req, i) => (
                                        <View key={i} className="flex-row items-start gap-3 bg-[#131320] p-3 rounded-xl">
                                            <View className="bg-green-500/20 p-1 rounded-full mt-0.5">
                                                <Check size={10} color="#22c55e" />
                                            </View>
                                            <Text className="text-gray-300 text-sm flex-1">{req}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            {/* Additional Info Grid */}
                            <View className="flex-row gap-4 mb-6">
                                <View className="flex-1 bg-[#1e1e2e] rounded-2xl border border-white/10 p-4 flex-row items-center gap-3">
                                    <View className="bg-blue-500/10 p-2.5 rounded-xl">
                                        <Clock size={20} color="#3b82f6" />
                                    </View>
                                    <View>
                                        <Text className="text-[10px] text-gray-500 font-bold uppercase">Hạn nộp</Text>
                                        <Text className="text-white font-medium text-sm mt-0.5">{job?.deadline}</Text>
                                    </View>
                                </View>
                                <View className="flex-1 bg-[#1e1e2e] rounded-2xl border border-white/10 p-4 flex-row items-center gap-3">
                                    <View className="bg-purple-500/10 p-2.5 rounded-xl">
                                        <MessageCircle size={20} color="#a855f7" />
                                    </View>
                                    <View>
                                        <Text className="text-[10px] text-gray-500 font-bold uppercase">Thảo luận</Text>
                                        <Text className="text-white font-medium text-sm mt-0.5">{job?.poster?.commentCount || 0} bình luận</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Safety Note */}
                            <View className="bg-blue-500/10 rounded-2xl border border-blue-500/20 p-4 mb-8">
                                <View className="flex-row items-center gap-2 mb-2">
                                    <Shield size={16} color="#3b82f6" />
                                    <Text className="text-blue-400 font-bold text-sm">An toàn giao dịch</Text>
                                </View>
                                <Text className="text-blue-300/80 text-xs leading-5">
                                    Số tiền thanh toán sẽ được giữ bởi Locaith cho đến khi bạn xác nhận hoàn thành công việc.
                                </Text>
                            </View>

                        </ScrollView>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const ApplyJobModal = ({ visible, onClose, job }) => {
    const [bid, setBid] = useState("");
    
    // Helper to parse and format currency
    const parseCurrency = (value) => parseInt(value.replace(/\D/g, "") || "0", 10);
    const formatCurrency = (value) => value.toLocaleString("vi-VN");
  
    const handleBidChange = (text) => {
      const rawValue = text.replace(/\D/g, "");
      if (rawValue) {
          setBid(parseInt(rawValue, 10).toLocaleString("vi-VN"));
      } else {
          setBid("");
      }
    };
  
    const bidAmount = parseCurrency(bid);
    const fee = Math.round(bidAmount * 0.1); // 10% platform fee
    const net = bidAmount - fee;

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
                                <TouchableOpacity onPress={onClose} className="w-8 h-8 bg-white/5 rounded-full items-center justify-center">
                                    <ChevronLeft size={20} color="#9ca3af" />
                                </TouchableOpacity>
                                <View className="flex-1">
                                    <Text className="text-gray-400 text-xs">Ứng tuyển công việc</Text>
                                    <Text className="text-white font-bold text-base numberOfLines={1} ellipsizeMode='tail'">
                                        {job?.title}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <ScrollView className="flex-1 px-5 py-4" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                            
                            {/* Bid Section */}
                            <View className="bg-[#1e1e2e] rounded-2xl border border-white/10 p-5 mb-4">
                                <View className="flex-row items-center gap-2 mb-4">
                                    <DollarSign size={20} color="#22c55e" />
                                    <Text className="text-white font-bold text-lg">Chi phí & Thời gian</Text>
                                </View>
                                
                                <View className="space-y-4">
                                    <View className="gap-2">
                                        <Text className="text-gray-400 font-medium text-sm uppercase">Chào giá (VNĐ)</Text>
                                        <View className="relative">
                                            <TextInput 
                                                value={bid}
                                                onChangeText={handleBidChange}
                                                className="bg-[#131320] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white font-bold text-lg"
                                                placeholder="0"
                                                placeholderTextColor="#6b7280"
                                                keyboardType="numeric"
                                            />
                                            <Text className="absolute left-4 top-4 text-gray-400 font-bold">₫</Text>
                                        </View>
                                        <View className="flex-row justify-between px-1">
                                            <Text className="text-gray-500 text-xs">Phí dịch vụ: {formatCurrency(fee)} đ</Text>
                                            <Text className="text-green-500 text-xs font-bold">Thực nhận: {formatCurrency(net)} đ</Text>
                                        </View>
                                    </View>

                                    <View className="gap-2">
                                        <Text className="text-gray-400 font-medium text-sm uppercase">Thời gian hoàn thành</Text>
                                        <View className="relative">
                                            <TextInput 
                                                className="bg-[#131320] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white"
                                                placeholder="VD: 3 ngày"
                                                placeholderTextColor="#6b7280"
                                            />
                                            <View className="absolute left-3 top-3.5">
                                                <Clock size={16} color="#9ca3af" />
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {/* Letter Section */}
                            <View className="bg-[#1e1e2e] rounded-2xl border border-white/10 p-5 mb-4">
                                <View className="flex-row items-center gap-2 mb-4">
                                    <FileText size={20} color="#3b82f6" />
                                    <Text className="text-white font-bold text-lg">Thư giới thiệu & Hồ sơ</Text>
                                </View>
                                
                                <View className="gap-2 mb-4">
                                    <Text className="text-gray-300 font-medium text-sm">Tại sao bạn phù hợp?</Text>
                                    <TextInput 
                                        className="bg-[#131320] border border-white/10 rounded-xl p-4 text-white h-32 leading-5"
                                        placeholder="Hãy viết ngắn gọn về kinh nghiệm và kỹ năng của bạn..."
                                        placeholderTextColor="#6b7280"
                                        multiline
                                        textAlignVertical="top"
                                    />
                                </View>

                                <TouchableOpacity className="border-2 border-dashed border-white/10 rounded-xl p-6 items-center justify-center bg-white/5">
                                    <View className="bg-[#1e1e2e] p-3 rounded-full mb-2">
                                        <Upload size={24} color="#9ca3af" />
                                    </View>
                                    <Text className="text-blue-500 font-medium text-sm mb-1">Tải lên CV hoặc Portfolio</Text>
                                    <Text className="text-gray-500 text-xs">PDF, DOCX, JPG, PNG (Max 10MB)</Text>
                                </TouchableOpacity>
                            </View>

                        </ScrollView>

                        <View className="p-5 border-t border-white/10 bg-[#1e1e2e] flex-row gap-3">
                            <TouchableOpacity onPress={onClose} className="flex-1 py-3 rounded-xl border border-white/10 items-center">
                                <Text className="text-gray-400 font-bold">Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="flex-1 py-3 rounded-xl bg-blue-600 items-center shadow-lg shadow-blue-600/20">
                                <Text className="text-white font-bold">Gửi hồ sơ</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const FreelancerRegistrationModal = ({ visible, onClose }) => {
    const [field, setField] = useState("");
    const [level, setLevel] = useState("");
    const [showFieldPicker, setShowFieldPicker] = useState(false);
    const [showLevelPicker, setShowLevelPicker] = useState(false);

    const levels = [
        { id: "fresher", label: "Fresher (Mới ra trường)" },
        { id: "junior", label: "Junior (1-2 năm)" },
        { id: "middle", label: "Middle (2-4 năm)" },
        { id: "senior", label: "Senior (5+ năm)" },
        { id: "expert", label: "Chuyên gia (10+ năm)" }
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
                                    <User size={20} color="white" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-white font-bold text-lg">Đăng ký làm Freelancer</Text>
                                    <Text className="text-gray-400 text-xs numberOfLines={1}">Hoàn tất hồ sơ để bắt đầu nhận việc</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={onClose} className="w-8 h-8 bg-white/5 rounded-full items-center justify-center">
                                <X size={20} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="flex-1 px-5 py-4" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                            
                            <View className="space-y-4">
                                <View className="gap-2">
                                    <Text className="text-gray-300 font-medium text-sm">Họ và tên</Text>
                                    <TextInput 
                                        className="bg-[#131320] border border-white/10 rounded-xl px-4 py-3 text-white"
                                        placeholder="VD: Nguyễn Văn A"
                                        placeholderTextColor="#6b7280"
                                    />
                                </View>

                                <View className="gap-2">
                                    <Text className="text-gray-300 font-medium text-sm">Chức danh chuyên môn</Text>
                                    <TextInput 
                                        className="bg-[#131320] border border-white/10 rounded-xl px-4 py-3 text-white"
                                        placeholder="VD: Senior Frontend Developer"
                                        placeholderTextColor="#6b7280"
                                    />
                                </View>

                                <View className="flex-row gap-4 z-20">
                                    <View className="flex-1 gap-2">
                                        <Text className="text-gray-300 font-medium text-sm">Lĩnh vực chính</Text>
                                        <TouchableOpacity 
                                            onPress={() => {
                                                setShowFieldPicker(!showFieldPicker);
                                                setShowLevelPicker(false);
                                            }}
                                            className="bg-[#131320] border border-white/10 rounded-xl px-4 py-3 flex-row justify-between items-center"
                                        >
                                            <Text className={field ? "text-white" : "text-gray-500"}>
                                                {field ? jobCategories.find(c => c.id === field)?.label : "Chọn lĩnh vực"}
                                            </Text>
                                            <ChevronDown size={16} color="#9ca3af" />
                                        </TouchableOpacity>
                                        {showFieldPicker && (
                                            <View className="absolute top-full left-0 right-0 bg-[#2a2a3c] border border-white/10 rounded-xl z-50 mt-1 shadow-lg shadow-black/50 overflow-hidden">
                                                {jobCategories.filter(c => c.id !== 'all').map((item) => (
                                                    <TouchableOpacity 
                                                        key={item.id}
                                                        onPress={() => {
                                                            setField(item.id);
                                                            setShowFieldPicker(false);
                                                        }}
                                                        className="px-4 py-3 border-b border-white/5 flex-row justify-between items-center active:bg-white/5"
                                                    >
                                                        <Text className="text-gray-300 text-sm">{item.label}</Text>
                                                        {field === item.id && <Check size={14} color="#3b82f6" />}
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        )}
                                    </View>

                                    <View className="flex-1 gap-2">
                                        <Text className="text-gray-300 font-medium text-sm">Trình độ</Text>
                                        <TouchableOpacity 
                                            onPress={() => {
                                                setShowLevelPicker(!showLevelPicker);
                                                setShowFieldPicker(false);
                                            }}
                                            className="bg-[#131320] border border-white/10 rounded-xl px-4 py-3 flex-row justify-between items-center"
                                        >
                                            <Text className={level ? "text-white" : "text-gray-500"}>
                                                {level ? levels.find(l => l.id === level)?.label : "Chọn trình độ"}
                                            </Text>
                                            <ChevronDown size={16} color="#9ca3af" />
                                        </TouchableOpacity>
                                        {showLevelPicker && (
                                            <View className="absolute top-full left-0 right-0 bg-[#2a2a3c] border border-white/10 rounded-xl z-50 mt-1 shadow-lg shadow-black/50 overflow-hidden" style={{ width: '150%' }}>
                                                {levels.map((item) => (
                                                    <TouchableOpacity 
                                                        key={item.id}
                                                        onPress={() => {
                                                            setLevel(item.id);
                                                            setShowLevelPicker(false);
                                                        }}
                                                        className="px-4 py-3 border-b border-white/5 flex-row justify-between items-center active:bg-white/5"
                                                    >
                                                        <Text className="text-gray-300 text-sm">{item.label}</Text>
                                                        {level === item.id && <Check size={14} color="#3b82f6" />}
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                </View>

                                <View className="flex-row gap-4">
                                    <View className="flex-1 gap-2">
                                        <Text className="text-gray-300 font-medium text-sm">Lương mong muốn / giờ</Text>
                                        <TextInput 
                                            className="bg-[#131320] border border-white/10 rounded-xl px-4 py-3 text-white"
                                            placeholder="VD: 200.000"
                                            placeholderTextColor="#6b7280"
                                            keyboardType="numeric"
                                        />
                                    </View>
                                    <View className="flex-1 gap-2">
                                        <Text className="text-gray-300 font-medium text-sm">Link Portfolio / CV</Text>
                                        <TextInput 
                                            className="bg-[#131320] border border-white/10 rounded-xl px-4 py-3 text-white"
                                            placeholder="behance.net/..."
                                            placeholderTextColor="#6b7280"
                                        />
                                    </View>
                                </View>

                                <View className="gap-2">
                                    <Text className="text-gray-300 font-medium text-sm">Kỹ năng nổi bật</Text>
                                    <TextInput 
                                        className="bg-[#131320] border border-white/10 rounded-xl px-4 py-3 text-white"
                                        placeholder="VD: ReactJS, Figma, Python..."
                                        placeholderTextColor="#6b7280"
                                    />
                                </View>

                                <View className="gap-2">
                                    <Text className="text-gray-300 font-medium text-sm">Giới thiệu bản thân</Text>
                                    <TextInput 
                                        className="bg-[#131320] border border-white/10 rounded-xl px-4 py-3 text-white h-24 leading-5"
                                        placeholder="Mô tả ngắn gọn về kinh nghiệm và thế mạnh của bạn..."
                                        placeholderTextColor="#6b7280"
                                        multiline
                                        textAlignVertical="top"
                                    />
                                </View>
                            </View>
                        </ScrollView>

                        <View className="p-5 border-t border-white/10 bg-[#1e1e2e] flex-row gap-3">
                            <TouchableOpacity onPress={onClose} className="flex-1 py-3 rounded-xl border border-white/10 items-center">
                                <Text className="text-gray-400 font-bold">Để sau</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onClose} className="flex-1 py-3 rounded-xl bg-blue-600 items-center shadow-lg shadow-blue-600/20">
                                <Text className="text-white font-bold">Hoàn tất đăng ký</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const PostJobModal = ({ visible, onClose }) => {
    const [category, setCategory] = useState("");
    const [type, setType] = useState("");
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [showTypePicker, setShowTypePicker] = useState(false);

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
                        className="bg-[#1e1e2e] w-full h-[90%] sm:h-auto sm:max-h-[85%] rounded-t-3xl sm:rounded-3xl border border-white/10 overflow-hidden"
                        style={{ maxHeight: '90%' }}
                    >
                        {/* Header */}
                        <View className="flex-row items-center justify-between px-5 py-4 border-b border-white/10">
                            <View className="flex-row items-center gap-2">
                                <View className="w-8 h-8 bg-blue-600 rounded-lg items-center justify-center">
                                    <Plus size={20} color="white" />
                                </View>
                                <Text className="text-white font-bold text-lg">Đăng tin tuyển dụng</Text>
                            </View>
                            <TouchableOpacity onPress={onClose} className="w-8 h-8 bg-white/5 rounded-full items-center justify-center">
                                <X size={20} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="flex-1 px-5 py-4" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                            <Text className="text-gray-400 text-sm mb-6">Điền thông tin chi tiết về công việc để tìm kiếm ứng viên phù hợp nhất.</Text>

                            <View className="space-y-4">
                                <View className="gap-2">
                                    <Text className="text-gray-300 font-medium text-sm">Tiêu đề công việc</Text>
                                    <TextInput 
                                        className="bg-[#131320] border border-white/10 rounded-xl px-4 py-3 text-white"
                                        placeholder="VD: Thiết kế Logo thương hiệu..."
                                        placeholderTextColor="#6b7280"
                                    />
                                </View>

                                <View className="flex-row gap-4">
                                    <View className="flex-1 gap-2">
                                        <Text className="text-gray-300 font-medium text-sm">Ngành nghề</Text>
                                        <TouchableOpacity 
                                            onPress={() => {
                                                setShowCategoryPicker(!showCategoryPicker);
                                                setShowTypePicker(false);
                                            }}
                                            className="bg-[#131320] border border-white/10 rounded-xl px-4 py-3 flex-row justify-between items-center"
                                        >
                                            <Text className={category ? "text-white" : "text-gray-500"}>
                                                {category ? jobCategories.find(c => c.id === category)?.label : "Chọn ngành"}
                                            </Text>
                                            <ChevronDown size={16} color="#9ca3af" />
                                        </TouchableOpacity>
                                        {showCategoryPicker && (
                                            <View className="absolute top-full left-0 right-0 bg-[#2a2a3c] border border-white/10 rounded-xl z-50 mt-1 shadow-lg shadow-black/50 overflow-hidden">
                                                {jobCategories.map((item) => (
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
                                            </View>
                                        )}
                                    </View>

                                    <View className="flex-1 gap-2">
                                        <Text className="text-gray-300 font-medium text-sm">Loại hình</Text>
                                        <TouchableOpacity 
                                            onPress={() => {
                                                setShowTypePicker(!showTypePicker);
                                                setShowCategoryPicker(false);
                                            }}
                                            className="bg-[#131320] border border-white/10 rounded-xl px-4 py-3 flex-row justify-between items-center"
                                        >
                                            <Text className={type ? "text-white" : "text-gray-500"}>
                                                {type || "Chọn loại"}
                                            </Text>
                                            <ChevronDown size={16} color="#9ca3af" />
                                        </TouchableOpacity>
                                        {showTypePicker && (
                                            <View className="absolute top-full left-0 right-0 bg-[#2a2a3c] border border-white/10 rounded-xl z-50 mt-1 shadow-lg shadow-black/50 overflow-hidden">
                                                {jobTypes.map((item, index) => (
                                                    <TouchableOpacity 
                                                        key={index}
                                                        onPress={() => {
                                                            setType(item);
                                                            setShowTypePicker(false);
                                                        }}
                                                        className="px-4 py-3 border-b border-white/5 flex-row justify-between items-center active:bg-white/5"
                                                    >
                                                        <Text className="text-gray-300 text-sm">{item}</Text>
                                                        {type === item && <Check size={14} color="#3b82f6" />}
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                </View>

                                <View className="flex-row gap-4">
                                    <View className="flex-1 gap-2">
                                        <Text className="text-gray-300 font-medium text-sm">Ngân sách dự kiến</Text>
                                        <TextInput 
                                            className="bg-[#131320] border border-white/10 rounded-xl px-4 py-3 text-white"
                                            placeholder="VD: 5.000.000"
                                            placeholderTextColor="#6b7280"
                                            keyboardType="numeric"
                                        />
                                    </View>
                                    <View className="flex-1 gap-2">
                                        <Text className="text-orange-400 font-medium text-sm">Cọc (nếu có)</Text>
                                        <TextInput 
                                            className="bg-[#131320] border border-orange-500/30 rounded-xl px-4 py-3 text-white"
                                            placeholder="VD: 30%"
                                            placeholderTextColor="#6b7280"
                                        />
                                    </View>
                                </View>

                                <View className="flex-row gap-4">
                                    <View className="flex-1 gap-2">
                                        <Text className="text-gray-300 font-medium text-sm">Địa điểm</Text>
                                        <TextInput 
                                            className="bg-[#131320] border border-white/10 rounded-xl px-4 py-3 text-white"
                                            placeholder="VD: Remote"
                                            placeholderTextColor="#6b7280"
                                        />
                                    </View>
                                    <View className="flex-1 gap-2">
                                        <Text className="text-gray-300 font-medium text-sm">Hạn nộp</Text>
                                        <TextInput 
                                            className="bg-[#131320] border border-white/10 rounded-xl px-4 py-3 text-white"
                                            placeholder="VD: 30/12"
                                            placeholderTextColor="#6b7280"
                                        />
                                    </View>
                                </View>

                                <View className="gap-2">
                                    <Text className="text-gray-300 font-medium text-sm">Kỹ năng / Yêu cầu chính</Text>
                                    <TextInput 
                                        className="bg-[#131320] border border-white/10 rounded-xl px-4 py-3 text-white"
                                        placeholder="VD: Photoshop, Illustrator, Vẽ tay..."
                                        placeholderTextColor="#6b7280"
                                    />
                                </View>

                                <View className="gap-2">
                                    <Text className="text-gray-300 font-medium text-sm">Mô tả chi tiết</Text>
                                    <TextInput 
                                        className="bg-[#131320] border border-white/10 rounded-xl px-4 py-3 text-white h-32"
                                        placeholder="Mô tả chi tiết yêu cầu, quyền lợi, trách nhiệm..."
                                        placeholderTextColor="#6b7280"
                                        multiline
                                        textAlignVertical="top"
                                    />
                                </View>
                            </View>
                        </ScrollView>

                        <View className="p-5 border-t border-white/10 bg-[#1e1e2e] flex-row gap-3">
                            <TouchableOpacity onPress={onClose} className="flex-1 py-3 rounded-xl border border-white/10 items-center">
                                <Text className="text-gray-400 font-bold">Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onClose} className="flex-1 py-3 rounded-xl bg-blue-600 items-center shadow-lg shadow-blue-600/20">
                                <Text className="text-white font-bold">Đăng tin ngay</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const JobScreen = ({ onNavigate, currentTab }) => {
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [showPostModal, setShowPostModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFreelancerModal, setShowFreelancerModal] = useState(false);

  const filters = ["Tất cả", "Lập trình & IT", "Thiết kế & Sáng tạo", "Marketing"];

  const currentJob = {
      title: "Chuyên viên tư vấn giải pháp AI cho doanh nghiệp",
      budget: "25.000.000 - 40.000.000 VNĐ",
      location: "Hà Nội",
      type: "Toàn thời gian",
      status: "urgent",
      postedAt: "Vừa xong",
      deposit: "Không yêu cầu",
      deadline: "30/12",
      description: "Locaith AI Solutions cần tuyển chuyên viên tư vấn giải pháp AI. Nhiệm vụ bao gồm: Tư vấn giải pháp cho khách hàng doanh nghiệp, xây dựng tài liệu giới thiệu sản phẩm, phối hợp với team kỹ thuật để demo giải pháp.",
      poster: { 
          avatar: "LA", 
          name: "Locaith AI Solutions", 
          rating: "5.0", 
          verified: true, 
          commentCount: "856" 
      },
      requirements: ["Hiểu biết AI", "Tiếng Anh tốt", "Giao tiếp xuất sắc"]
  };

  return (
    <View className="flex-1 bg-[#050511]">
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 gap-3">
            <TouchableOpacity 
                className="w-10 h-10 bg-blue-600 rounded-xl items-center justify-center shadow-lg shadow-blue-500/20"
                onPress={() => onNavigate('experts')}
            >
                <Users size={20} color="white" />
            </TouchableOpacity>
            
            <View className="flex-1 h-10 bg-[#1e1e2e] rounded-full flex-row items-center px-4 border border-white/10">
                <Search size={16} color="#9ca3af" />
                <TextInput 
                    className="flex-1 ml-2 text-sm text-white h-full"
                    placeholder="Tìm việc làm, dự án free"
                    placeholderTextColor="#6b7280"
                />
            </View>

            <TouchableOpacity 
                className="h-10 px-4 bg-blue-600 rounded-full flex-row items-center gap-1 shadow-lg shadow-blue-500/20"
                onPress={() => setShowPostModal(true)}
            >
                <Plus size={16} color="white" />
                <Text className="text-white font-bold text-sm">Đăng tin</Text>
            </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
            {/* Stats Cards */}
            <View className="flex-row gap-3 px-4 mt-4">
                <LinearGradient
                    colors={['#3b82f6', '#2563eb']}
                    className="flex-1 p-4 rounded-2xl"
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Text className="text-blue-100 text-sm font-medium mb-1">Công việc mới</Text>
                    <Text className="text-white text-3xl font-bold">1,248</Text>
                </LinearGradient>

                <LinearGradient
                    colors={['#d946ef', '#a855f7']}
                    className="flex-1 p-4 rounded-2xl"
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Text className="text-purple-100 text-sm font-medium mb-1">Hoàn thành</Text>
                    <Text className="text-white text-3xl font-bold">856</Text>
                </LinearGradient>
            </View>

            {/* Freelancer Banner */}
            <View className="mx-4 mt-6">
                <View className="bg-[#131320] border border-white/10 rounded-3xl p-5 relative overflow-hidden">
                    <View className="z-10">
                        <Text className="text-white text-lg font-bold mb-1">Đăng ký Freelancer</Text>
                        <Text className="text-gray-400 text-sm mb-3 max-w-[220px]">
                            Tạo hồ sơ và bắt đầu kiếm tiền ngay hôm nay
                        </Text>
                        <TouchableOpacity 
                            className="flex-row items-center"
                            onPress={() => setShowFreelancerModal(true)}
                        >
                            <Text className="text-blue-500 font-bold mr-1">Tham gia ngay</Text>
                            <Text className="text-blue-500 font-bold">></Text>
                        </TouchableOpacity>
                    </View>
                    
                    <View className="absolute right-4 top-4 bg-[#1e1e2e] p-3 rounded-2xl border border-white/5">
                        <User size={24} color="#3b82f6" />
                    </View>
                </View>
            </View>

            {/* Filter Tabs */}
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                className="mt-6 pl-4"
                contentContainerStyle={{ paddingRight: 20 }}
            >
                {filters.map((filter, index) => (
                    <TouchableOpacity 
                        key={index}
                        onPress={() => setActiveFilter(filter)}
                        className={`mr-3 px-5 py-2 rounded-full border ${
                            activeFilter === filter 
                                ? 'bg-blue-600 border-blue-600' 
                                : 'bg-[#131320] border-white/10'
                        }`}
                    >
                        <Text className={`${
                            activeFilter === filter ? 'text-white font-bold' : 'text-gray-400'
                        }`}>
                            {filter}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Job Card */}
            <View className="mx-4 mt-6">
                <View className="bg-[#131320] border border-white/10 rounded-3xl p-5">
                    {/* Card Header */}
                    <View className="flex-row gap-3 mb-3">
                        <View className="w-12 h-12 bg-[#1e1e2e] rounded-xl items-center justify-center border border-white/5">
                            <Text className="text-blue-500 font-bold text-lg">LA</Text>
                            <View className="absolute -bottom-1 -right-1 bg-[#131320] rounded-full p-0.5">
                                <View className="bg-blue-500 rounded-full p-0.5">
                                     <Text style={{ fontSize: 6 }} className="text-white">✓</Text>
                                </View>
                            </View>
                        </View>
                        <View className="flex-1">
                            <View className="flex-row items-center gap-2 mb-1">
                                <Text className="text-white font-bold text-base">Locaith AI Solutions</Text>
                            </View>
                            <View className="flex-row gap-2">
                                <View className="bg-yellow-500/20 px-1.5 py-0.5 rounded flex-row items-center gap-1">
                                    <Star size={10} color="#eab308" fill="#eab308" />
                                    <Text className="text-yellow-500 text-[10px] font-bold">5</Text>
                                </View>
                                <View className="bg-blue-500/20 px-1.5 py-0.5 rounded flex-row items-center gap-1">
                                    <MessageCircle size={10} color="#3b82f6" fill="#3b82f6" />
                                    <Text className="text-blue-500 text-[10px] font-bold">856</Text>
                                </View>
                                <View className="bg-red-500/20 px-1.5 py-0.5 rounded">
                                    <Text className="text-red-500 text-[10px] font-bold">HOT</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Job Title */}
                    <View className="mb-3">
                        <View className="bg-gray-800/50 self-start px-2 py-0.5 rounded mb-2">
                             <Text className="text-gray-400 text-[10px]">#2</Text>
                        </View>
                        <Text className="text-blue-500 font-bold text-lg leading-6">
                            Chuyên viên tư vấn giải pháp AI cho doanh nghiệp
                        </Text>
                    </View>

                    {/* Tags */}
                    <View className="flex-row flex-wrap gap-2 mb-4">
                        {["Hiểu biết AI", "Tiếng Anh tốt", "Giao tiếp xuất sắc"].map((tag, i) => (
                            <View key={i} className="bg-[#1e1e2e] px-3 py-1.5 rounded-lg border border-white/5">
                                <Text className="text-gray-400 text-xs">{tag}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Meta Info */}
                    <View className="flex-row gap-4 mb-4">
                        <View className="flex-row items-center gap-1">
                            <MapPin size={14} color="#9ca3af" />
                            <Text className="text-gray-400 text-xs">Hà Nội</Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                            <Clock size={14} color="#9ca3af" />
                            <Text className="text-gray-400 text-xs">Vừa xong</Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                            <Briefcase size={14} color="#9ca3af" />
                            <Text className="text-gray-400 text-xs">Tuyển gấp</Text>
                        </View>
                    </View>

                    {/* Footer */}
                    <View className="border-t border-white/10 pt-4">
                        <View className="flex-row justify-between items-end mb-3">
                             <View>
                                <Text className="text-green-500 font-bold text-base">Từ 25.000.000</Text>
                                <Text className="text-green-500 font-bold text-base">đến 40.000.000 VNĐ/tháng</Text>
                             </View>
                             <TouchableOpacity 
                                className="border border-white/20 px-3 py-1.5 rounded-full flex-row items-center gap-1"
                                onPress={() => setShowDetailModal(true)}
                            >
                                <Info size={14} color="#d1d5db" />
                                <Text className="text-gray-300 text-xs font-medium">Thông tin</Text>
                             </TouchableOpacity>
                        </View>
                        
                        <View className="flex-row items-center justify-between">
                            <Text className="text-orange-400 text-xs">Cọc: Không yêu cầu</Text>
                            <TouchableOpacity 
                                className="bg-blue-600 px-6 py-2 rounded-full shadow-lg shadow-blue-600/20"
                                onPress={() => setShowDetailModal(true)}
                            >
                                <Text className="text-white font-bold text-sm">Ứng tuyển</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
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

            <TouchableOpacity className="items-center px-2">
                <View className="bg-blue-600/20 p-2 rounded-xl mb-1">
                    <Briefcase size={20} color="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                </View>
                <Text className="text-[10px] font-medium text-blue-500">Việc làm</Text>
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

            <TouchableOpacity className="items-center px-2 opacity-60" onPress={() => onNavigate && onNavigate('profile')}>
                <View className="p-2 mb-1">
                    <User size={22} color="#9ca3af" />
                </View>
                <Text className="text-[10px] font-medium text-gray-400">Cá nhân</Text>
            </TouchableOpacity>
        </BlurView>
      </View>

      <PostJobModal visible={showPostModal} onClose={() => setShowPostModal(false)} />
      <JobDetailModal 
        visible={showDetailModal} 
        onClose={() => setShowDetailModal(false)} 
        job={currentJob} 
        onApply={() => {
            setShowDetailModal(false);
            setShowApplyModal(true);
        }}
      />
      <ApplyJobModal visible={showApplyModal} onClose={() => setShowApplyModal(false)} job={currentJob} />
      <FreelancerRegistrationModal visible={showFreelancerModal} onClose={() => setShowFreelancerModal(false)} />
    </View>
  );
};

export default JobScreen;
