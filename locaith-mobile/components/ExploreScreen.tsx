import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
    Search, Bell, Building2, User, Users, Zap, Globe, BookOpen, Lightbulb, 
    Languages, TrendingUp, Share2, MessageSquare, Briefcase, MessageCircle, 
    LayoutGrid, Compass, ArrowRight, Star
} from 'lucide-react-native';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const ExploreScreen = ({ onNavigate }) => {
    const [activeTab, setActiveTab] = useState('Nổi bật');
    const tabs = ['Nổi bật', 'Doanh nghiệp', 'Cá nhân', 'Ngành nghề & Lĩnh vực'];

    const featuredApps = [
        {
            id: 1,
            title: "Locaith Enterprise Suite",
            desc: "Giải pháp toàn diện cho doanh nghiệp: Tự động hóa quy trình, phân tích dữ liệu lớn và quản trị thông minh.",
            author: "Locaith Official",
            rating: 5.0,
            users: "2.5M",
            icon: Building2,
            tag: "Nổi bật",
            color: "#3b82f6" // blue
        },
        {
            id: 2,
            title: "Personal Growth Assistant",
            desc: "Người bạn đồng hành phát triển bản thân: Lập kế hoạch, theo dõi thói quen và tối ưu hóa hiệu suất cá nhân.",
            author: "Life Coach Team",
            rating: 4.9,
            users: "1.8M",
            icon: User,
            tag: "Nổi bật",
            color: "#a855f7" // purple
        }
    ];

    const businessApps = [
        {
            id: 1,
            title: "Quản trị Nhân sự AI",
            desc: "Tự động hóa tuyển dụng, chấm công và đánh giá hiệu suất nhân viên.",
            author: "HR Tech",
            icon: Users,
            color: "#3b82f6"
        },
        {
            id: 2,
            title: "Marketing Automation",
            desc: "Lên chiến dịch, tối ưu quảng cáo và chăm sóc khách hàng tự động.",
            author: "MarTech Pro",
            icon: Zap,
            color: "#f97316"
        },
        {
            id: 3,
            title: "Thương mại Điện tử",
            desc: "Tối ưu hóa gian hàng và phân tích hành vi người mua.",
            author: "Ecom Wizard",
            icon: Globe,
            color: "#8b5cf6"
        }
    ];

    const educationApps = [
        {
            id: 1,
            title: "Tổng hợp Tài liệu",
            desc: "Tóm tắt sách, báo cáo khoa học và bài nghiên cứu.",
            author: "Scholar",
            icon: BookOpen,
            color: "#3b82f6"
        },
        {
            id: 2,
            title: "Gia sư STEM",
            desc: "Hỗ trợ giải bài tập Toán, Lý, Hóa chi tiết.",
            author: "EduBot",
            icon: Lightbulb,
            color: "#eab308"
        },
        {
            id: 3,
            title: "Học Ngoại ngữ",
            desc: "Luyện giao tiếp và sửa lỗi ngữ pháp thời gian thực.",
            author: "Lingua",
            icon: Languages,
            color: "#10b981"
        },
        {
            id: 4,
            title: "Phân tích Dữ liệu",
            desc: "Hỗ trợ xử lý số liệu thống kê cho bài nghiên cứu.",
            author: "Data Lab",
            icon: TrendingUp,
            color: "#8b5cf6"
        }
    ];

    const communityApps = [
        {
            id: 1,
            title: "Thư viện Prompt",
            desc: "Kho tàng các câu lệnh mẫu được cộng đồng bình chọn.",
            author: "Prompt Engineering",
            icon: Share2,
            color: "#f97316"
        }
    ];

    const renderSectionHeader = (title, subtitle, showLink = true) => (
        <View className="mb-4 mt-6">
            <View className="flex-row justify-between items-center mb-1">
                <Text className="text-white text-xl font-bold">{title}</Text>
                {showLink && (
                    <TouchableOpacity>
                        <Text className="text-blue-500 font-medium">Xem thêm</Text>
                    </TouchableOpacity>
                )}
            </View>
            <Text className="text-gray-400 text-xs">{subtitle}</Text>
        </View>
    );

    const renderListItem = (item) => (
        <TouchableOpacity key={item.id} className="flex-row items-start mb-6">
            <View className={`w-12 h-12 rounded-full items-center justify-center mr-3`} style={{ backgroundColor: `${item.color}15` }}>
                <item.icon size={24} color={item.color} />
            </View>
            <View className="flex-1 border-b border-white/5 pb-6">
                <Text className="text-white font-bold text-base mb-1">{item.title}</Text>
                <Text className="text-gray-400 text-xs mb-2 leading-5">{item.desc}</Text>
                <Text className="text-gray-500 text-[10px]">Bởi {item.author}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-[#050511]">
            <SafeAreaView className="flex-1" edges={['top']}>
                {/* Header */}
                <View className="flex-row items-center px-4 py-3 gap-3">
                    <Search size={24} color="#9ca3af" />
                    <View className="flex-1 h-10 bg-[#1e1e2e] rounded-full flex-row items-center px-4 border border-white/10">
                        <TextInput 
                            className="flex-1 text-sm text-white h-full"
                            placeholder="Tìm kiếm trong khám phá..."
                            placeholderTextColor="#6b7280"
                        />
                    </View>
                    <TouchableOpacity className="w-10 h-10 bg-[#1e1e2e] rounded-full items-center justify-center border border-white/10">
                        <Bell size={20} color="#9ca3af" />
                        <View className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-[#1e1e2e]" />
                    </TouchableOpacity>
                </View>

                {/* Filters */}
                <View>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false} 
                        className="mt-2 pl-4 mb-2"
                        contentContainerStyle={{ paddingRight: 20 }}
                    >
                        {tabs.map((tab, index) => (
                            <TouchableOpacity 
                                key={index}
                                onPress={() => setActiveTab(tab)}
                                className={`mr-3 px-5 py-2 rounded-full ${
                                    activeTab === tab 
                                        ? 'bg-white' 
                                        : 'bg-[#1e1e2e] border border-white/5'
                                }`}
                            >
                                <Text className={`font-medium ${
                                    activeTab === tab ? 'text-black' : 'text-gray-400'
                                }`}>
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
                    
                    {/* Featured Section */}
                    <View className="mt-4 mb-2">
                        <View className="flex-row items-center gap-2 mb-1">
                            <Text className="text-white text-xl font-bold">Nổi bật</Text>
                            <View className="bg-blue-500/20 px-2 py-0.5 rounded-md border border-blue-500/30">
                                <Text className="text-blue-400 text-[10px] font-bold">Lựa chọn hàng đầu</Text>
                            </View>
                        </View>
                        <Text className="text-gray-400 text-xs mb-4">Lựa chọn hàng đầu được tuyển chọn tuần này</Text>

                        {featuredApps.map((app) => (
                            <TouchableOpacity key={app.id} className="bg-[#0f172a] rounded-2xl p-4 mb-4 border border-white/10 shadow-lg">
                                <View className="flex-row justify-between items-start mb-3">
                                    <View className="flex-row gap-3">
                                        <View className={`w-12 h-12 rounded-xl items-center justify-center border border-white/10`} style={{ backgroundColor: '#1e293b' }}>
                                            <app.icon size={24} color={app.color} />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-white font-bold text-lg mb-0.5 w-[200px]" numberOfLines={1}>{app.title}</Text>
                                            <View className="bg-white/10 self-start px-2 py-0.5 rounded text-xs">
                                                <Text className="text-white text-[10px] font-medium">{app.tag}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                                
                                <Text className="text-gray-300 text-sm mb-4 leading-5">{app.desc}</Text>
                                
                                <View className="flex-row justify-between items-center border-t border-white/5 pt-3">
                                    <Text className="text-gray-500 text-xs">Bởi {app.author}</Text>
                                    <View className="flex-row items-center gap-3">
                                        <View className="flex-row items-center gap-1">
                                            <Star size={12} color="#eab308" fill="#eab308" />
                                            <Text className="text-white text-xs font-bold">{app.rating}</Text>
                                        </View>
                                        <View className="flex-row items-center gap-1">
                                            <MessageSquare size={12} color="#9ca3af" />
                                            <Text className="text-gray-400 text-xs">{app.users}</Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Business Section */}
                    {renderSectionHeader("Doanh nghiệp", "Giải pháp chuyên nghiệp cho tổ chức và công ty")}
                    <View>
                        {businessApps.map(renderListItem)}
                    </View>

                    {/* Education Section */}
                    {renderSectionHeader("Nghiên cứu & Giáo dục", "Hỗ trợ học tập, giảng dạy và nghiên cứu khoa học")}
                    <View>
                        {educationApps.map(renderListItem)}
                    </View>

                    {/* Community Section */}
                    {renderSectionHeader("Cộng đồng", "Kết nối, chia sẻ và lấy cảm hứng từ cộng đồng")}
                    <View>
                        {communityApps.map(renderListItem)}
                    </View>

                </ScrollView>
            </SafeAreaView>

            {/* Bottom Navigation Bar */}
            <View className="absolute bottom-0 w-full px-4 pb-8 pt-4">
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

                    <TouchableOpacity className="items-center px-2">
                        <View className="bg-blue-600/20 p-2 rounded-xl mb-1">
                            <Compass size={20} color="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                        </View>
                        <Text className="text-[10px] font-medium text-blue-500">Khám phá</Text>
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

export default ExploreScreen;
