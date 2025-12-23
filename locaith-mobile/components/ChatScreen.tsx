import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
    MessageSquare, Briefcase, MessageCircle, LayoutGrid, Compass, User,
    Search, UserPlus, Users, LogIn, Lock
} from 'lucide-react-native';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const ChatScreen = ({ onNavigate }) => {
    // Simulated auth state. In a real app, this would come from a context or prop.
    const [isLoggedIn, setIsLoggedIn] = useState(true); 
    const [activeTab, setActiveTab] = useState('Hội thoại');
    const tabs = ['Hội thoại', 'Bạn bè', 'Nhóm'];

    const conversations = [
        {
            id: 1,
            name: "HaiCntt",
            message: "cố lên",
            time: "13-12",
            avatar: "https://github.com/shadcn.png", // Placeholder
            isOnline: true
        },
        {
            id: 2,
            name: "Ranmixology",
            message: "Alo",
            time: "11-12",
            avatar: null, // No image, use initial
            initial: "R",
            color: "#3b82f6", // blue
            isOnline: false
        }
    ];

    const LoginView = () => (
        <View className="flex-1 justify-center items-center px-6">
            <View className="bg-[#131320] p-6 rounded-3xl w-full border border-white/10 items-center">
                <View className="w-20 h-20 bg-blue-600/20 rounded-full items-center justify-center mb-6">
                    <Lock size={40} color="#3b82f6" />
                </View>
                <Text className="text-white text-2xl font-bold mb-2">Đăng nhập</Text>
                <Text className="text-gray-400 text-center mb-8">
                    Vui lòng đăng nhập để kết nối với bạn bè và đồng nghiệp trên Locaith AI Studio.
                </Text>

                <TouchableOpacity 
                    className="w-full bg-blue-600 py-3.5 rounded-xl items-center mb-4 shadow-lg shadow-blue-900/20"
                    onPress={() => setIsLoggedIn(true)} // Simulate login
                >
                    <Text className="text-white font-bold text-base">Đăng nhập ngay</Text>
                </TouchableOpacity>

                <TouchableOpacity className="w-full bg-[#1e1e2e] py-3.5 rounded-xl items-center border border-white/10">
                    <Text className="text-white font-bold text-base">Tạo tài khoản mới</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const ChatListView = () => (
        <>
            {/* Header */}
            <View className="px-4 py-3">
                <View className="flex-row items-center gap-3 mb-4">
                    <View className="flex-1 h-10 bg-[#1e1e2e] rounded-full flex-row items-center px-4 border border-white/10">
                        <Search size={18} color="#6b7280" />
                        <TextInput 
                            className="flex-1 ml-2 text-sm text-white h-full"
                            placeholder="Tìm kiếm hội thoại..."
                            placeholderTextColor="#6b7280"
                        />
                    </View>
                    <TouchableOpacity>
                        <UserPlus size={22} color="#9ca3af" />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Users size={22} color="#9ca3af" />
                    </TouchableOpacity>
                </View>

                {/* Tabs */}
                <View className="flex-row border-b border-white/10">
                    {tabs.map((tab) => (
                        <TouchableOpacity 
                            key={tab}
                            onPress={() => setActiveTab(tab)}
                            className={`flex-1 items-center pb-3 border-b-2 ${
                                activeTab === tab ? 'border-blue-500' : 'border-transparent'
                            }`}
                        >
                            <Text className={`font-medium ${
                                activeTab === tab ? 'text-blue-500' : 'text-gray-400'
                            }`}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
                {conversations.map((conv) => (
                    <TouchableOpacity key={conv.id} className="flex-row items-center px-4 py-3 active:bg-white/5">
                        <View className="relative mr-3">
                            {conv.avatar ? (
                                <Image 
                                    source={{ uri: conv.avatar }} 
                                    className="w-12 h-12 rounded-full bg-gray-700"
                                />
                            ) : (
                                <View 
                                    className="w-12 h-12 rounded-full items-center justify-center"
                                    style={{ backgroundColor: conv.color || '#6b7280' }}
                                >
                                    <Text className="text-white font-bold text-lg">{conv.initial}</Text>
                                </View>
                            )}
                            {conv.isOnline && (
                                <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#050511]" />
                            )}
                        </View>
                        
                        <View className="flex-1">
                            <View className="flex-row justify-between items-center mb-1">
                                <Text className="text-white font-bold text-base">{conv.name}</Text>
                                <Text className="text-gray-500 text-xs">{conv.time}</Text>
                            </View>
                            <Text className="text-gray-400 text-sm" numberOfLines={1}>
                                {conv.message}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </>
    );

    return (
        <View className="flex-1 bg-[#050511]">
            <SafeAreaView className="flex-1" edges={['top']}>
                {isLoggedIn ? <ChatListView /> : <LoginView />}
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

                    <TouchableOpacity className="items-center px-2">
                        <View className="bg-blue-600/20 p-2 rounded-xl mb-1">
                            <MessageCircle size={20} color="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                        </View>
                        <Text className="text-[10px] font-medium text-blue-500">Chat</Text>
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
        </View>
    );
};

export default ChatScreen;
