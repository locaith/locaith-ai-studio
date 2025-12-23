import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
    MessageSquare, MessageCircle, Briefcase, LayoutGrid, Compass, User, 
    Search, Star, Monitor, Shirt, Box, PenTool, Globe, Mic, Cpu, 
    BarChart3, ShieldCheck, Server, ArrowRight
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const AppsScreen = ({ onNavigate }) => {
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const filters = ["Tất cả", "Nổi bật", "Năng suất", "Sáng tạo", "Công cụ AI"];

  const locaithApps = [
      { id: 1, name: "Dashboard - Tổng quan", author: "Locaith", desc: "Trợ lý ảo thông minh giúp bạn lập kế hoạch, tra cứu...", rating: 5.0, users: "1M+", icon: LayoutGrid, color: "#3b82f6" },
      { id: 2, name: "Xây dựng Website", author: "Locaith", desc: "Thiết kế và xây dựng website chuyên nghiệp chỉ trong...", rating: 4.9, users: "500k+", icon: Monitor, color: "#8b5cf6" },
      { id: 3, name: "Thời trang AI", author: "Locaith", desc: "Thiết kế quần áo, phụ kiện và thử đồ ảo trên người mẫu...", rating: 4.8, users: "300k+", icon: Shirt, color: "#ec4899" },
      { id: 4, name: "Thiết kế Nội thất", author: "Locaith", desc: "Tư vấn thiết kế nội thất, phối màu và tạo không gian...", rating: 4.8, users: "250k+", icon: Box, color: "#f59e0b" },
      { id: 5, name: "Soạn thảo Pro", author: "Locaith", desc: "Trợ lý viết lách thông minh, hỗ trợ soạn email, báo cáo...", rating: 4.7, users: "800k+", icon: PenTool, color: "#10b981" },
      { id: 6, name: "Tìm kiếm Sâu", author: "Locaith", desc: "Công cụ tìm kiếm và phân tích thông tin chuyên sâu...", rating: 4.9, users: "600k+", icon: Globe, color: "#0ea5e9" },
      { id: 7, name: "Chat Giọng nói", author: "Locaith", desc: "Trò chuyện tự nhiên với AI bằng giọng nói đa ngôn ngữ.", rating: 4.8, users: "450k+", icon: Mic, color: "#a855f7" },
      { id: 8, name: "Tự động hóa", author: "Locaith", desc: "Tối ưu quy trình làm việc với các công cụ tự động hóa...", rating: 4.6, users: "150k+", icon: Cpu, color: "#64748b" },
  ];

  const communityApps = [
      { id: 1, name: "Data Insight 360", desc: "Phân tích dữ liệu lớn và dự báo xu hướng.", rating: 4.9, users: "10k+", icon: BarChart3, color: "#3b82f6" },
      { id: 2, name: "Code Scanner", desc: "Quét lỗ hổng bảo mật trong mã nguồn.", rating: 4.8, users: "8k+", icon: ShieldCheck, color: "#10b981" },
      { id: 3, name: "Cloud Manager", desc: "Tối ưu hóa chi phí hạ tầng đám mây.", rating: 4.7, users: "12k+", icon: Server, color: "#f59e0b" },
  ];

  return (
    <View className="flex-1 bg-[#050511]">
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 gap-3">
            <View className="w-10 h-10 bg-blue-600 rounded-xl items-center justify-center">
                <LayoutGrid size={20} color="white" />
            </View>
            
            <View className="flex-1 h-10 bg-[#1e1e2e] rounded-full flex-row items-center px-4 border border-white/10">
                <Search size={16} color="#9ca3af" />
                <TextInput 
                    className="flex-1 ml-2 text-sm text-white h-full"
                    placeholder="Tìm kiếm ứng dụng, công cụ AI..."
                    placeholderTextColor="#6b7280"
                />
            </View>
        </View>

        {/* Filters */}
        <View>
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                className="mt-2 pl-4 mb-4"
                contentContainerStyle={{ paddingRight: 20 }}
            >
                {filters.map((filter, index) => (
                    <TouchableOpacity 
                        key={index}
                        onPress={() => setActiveFilter(filter)}
                        className={`mr-3 px-4 py-2 rounded-full border ${
                            activeFilter === filter 
                                ? 'bg-blue-600 border-blue-600' 
                                : 'bg-transparent border-transparent'
                        }`}
                    >
                        <Text className={`${
                            activeFilter === filter ? 'text-white font-bold' : 'text-gray-400 font-medium'
                        }`}>
                            {filter}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
            {/* Hero Banner */}
            <View className="mx-4 mb-8">
                <LinearGradient
                    colors={['#4f46e5', '#a855f7', '#ec4899']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="rounded-[32px] p-6 h-[420px] relative overflow-hidden"
                >
                    {/* Background Elements */}
                    <View className="absolute top-10 right-10 opacity-20">
                         <Star size={100} color="white" fill="white" />
                    </View>

                    <View className="items-center mt-4">
                        <View className="bg-white/20 px-4 py-1.5 rounded-full mb-4 flex-row items-center gap-1">
                             <Star size={12} color="white" fill="white" />
                             <Text className="text-white text-xs font-bold">Nổi bật tuần này</Text>
                        </View>
                        
                        <Text className="text-white text-3xl font-bold text-center mb-4">Locaith Assistant</Text>
                        
                        <Text className="text-white/90 text-center text-base mb-8 leading-6 px-4">
                            Trợ lý AI toàn năng giúp bạn giải quyết mọi vấn đề. Từ lập kế hoạch, tìm kiếm thông tin đến sáng tạo nội dung.
                        </Text>

                        <View className="flex-row gap-4 w-full justify-center px-4">
                            <TouchableOpacity className="bg-white px-6 py-3 rounded-full flex-1 items-center shadow-lg">
                                <Text className="text-purple-600 font-bold">Khám phá ngay</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="bg-white/20 border border-white/30 px-6 py-3 rounded-full flex-1 items-center">
                                <Text className="text-white font-bold">Tìm hiểu thêm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    
                    {/* Bottom Logo Graphic */}
                    <View className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-white/10 rounded-[40px] rotate-12 items-center justify-center border border-white/20 backdrop-blur-sm">
                        <View className="w-48 h-48 bg-cyan-400 rounded-[30px] items-center justify-center shadow-2xl">
                             <Text className="text-white text-[120px] font-bold leading-[140px]">L</Text>
                        </View>
                    </View>
                </LinearGradient>
            </View>

            {/* Locaith Apps Section */}
            <View className="px-4 mb-6">
                <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center gap-2">
                        <Monitor size={20} color="#3b82f6" />
                        <Text className="text-white text-lg font-bold">Ứng dụng Locaith</Text>
                    </View>
                    <TouchableOpacity className="flex-row items-center gap-1">
                        <Text className="text-blue-500 text-xs font-medium">Xem tất cả</Text>
                        <ArrowRight size={12} color="#3b82f6" />
                    </TouchableOpacity>
                </View>

                {locaithApps.map((app) => (
                    <View key={app.id} className="bg-[#131320] rounded-2xl p-4 mb-3 border border-white/5 flex-row items-center">
                        <View className={`w-14 h-14 rounded-xl items-center justify-center mr-3`} style={{ backgroundColor: `${app.color}20` }}>
                             <app.icon size={28} color={app.color} />
                        </View>
                        <View className="flex-1 mr-2">
                            <Text className="text-white font-bold text-base mb-0.5">{app.name}</Text>
                            <Text className="text-gray-500 text-xs mb-1">by {app.author}</Text>
                            <Text className="text-gray-400 text-xs mb-2" numberOfLines={1}>{app.desc}</Text>
                            <View className="flex-row items-center gap-3">
                                <View className="flex-row items-center gap-1">
                                    <Star size={10} color="#eab308" fill="#eab308" />
                                    <Text className="text-yellow-500 text-[10px] font-bold">{app.rating}</Text>
                                </View>
                                <View className="flex-row items-center gap-1">
                                    <User size={10} color="#9ca3af" />
                                    <Text className="text-gray-500 text-[10px]">{app.users}</Text>
                                </View>
                                <Text className="text-green-500 text-[10px] font-bold">FREE</Text>
                            </View>
                        </View>
                        <TouchableOpacity className="bg-[#1e1e2e] px-4 py-2 rounded-full border border-white/10">
                            <Text className="text-white text-xs font-medium">Truy cập</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>

            {/* Community Apps Section */}
            <View className="px-4 mb-6">
                <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center gap-2">
                        <View className="w-5 h-5 bg-blue-500/20 rounded-md items-center justify-center">
                             <Text className="text-blue-500 text-xs font-bold">C</Text>
                        </View>
                        <Text className="text-white text-lg font-bold">Cộng đồng phát triển</Text>
                    </View>
                    <TouchableOpacity className="flex-row items-center gap-1">
                        <Text className="text-blue-500 text-xs font-medium">Khám phá thêm</Text>
                        <ArrowRight size={12} color="#3b82f6" />
                    </TouchableOpacity>
                </View>

                <View className="flex-row flex-wrap justify-between">
                    {communityApps.map((app) => (
                        <View key={app.id} className="w-full bg-[#131320] rounded-2xl p-4 mb-3 border border-white/5">
                            <View className="flex-row justify-between items-start mb-3">
                                <View className={`w-12 h-12 rounded-xl items-center justify-center`} style={{ backgroundColor: `${app.color}10` }}>
                                     <app.icon size={24} color={app.color} />
                                </View>
                                <View className="flex-row items-center gap-1">
                                    <Star size={12} color="#eab308" fill="#eab308" />
                                    <Text className="text-yellow-500 text-xs font-bold">{app.rating}</Text>
                                </View>
                            </View>
                            <Text className="text-white font-bold text-base mb-1">{app.name}</Text>
                            <Text className="text-gray-400 text-xs mb-3 leading-4">{app.desc}</Text>
                            <View className="flex-row items-center gap-1">
                                <User size={12} color="#9ca3af" />
                                <Text className="text-gray-500 text-xs">{app.users}</Text>
                            </View>
                        </View>
                    ))}
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

            <TouchableOpacity className="items-center px-2 opacity-60" onPress={() => onNavigate('jobs')}>
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

            <TouchableOpacity className="items-center px-2">
                <View className="bg-blue-600/20 p-2 rounded-xl mb-1">
                    <LayoutGrid size={20} color="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                </View>
                <Text className="text-[10px] font-medium text-blue-500">Ứng dụng</Text>
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
    </View>
  );
};

export default AppsScreen;
