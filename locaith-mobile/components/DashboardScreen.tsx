import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Dimensions, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageSquare, MessageCircle, Image as ImageIcon, Mic, Paperclip, ArrowUp, Search, Briefcase, LayoutGrid, Compass, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

// Star component for background effect
interface StarProps {
  top: number;
  left: number;
  size: number;
  opacity: number;
}

const Star: React.FC<StarProps> = ({ top, left, size, opacity }) => (
  <View style={{
    position: 'absolute',
    top,
    left,
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: 'white',
    opacity,
  }} />
);

const DashboardScreen = ({ onNavigate }) => {
  const [inputValue, setInputValue] = useState("");

  // Generate static stars
  const [stars] = useState(() => 
    [...Array(40)].map((_, i) => ({
      key: i,
      top: Math.random() * height,
      left: Math.random() * width,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.6 + 0.1
    }))
  );

  return (
    <View className="flex-1 bg-[#050511] overflow-hidden">
       {/* Background Gradient */}
       <LinearGradient
        colors={['#020617', '#0f172a', '#000000']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Stars Background */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {stars.map(({ key, ...starProps }) => (
            <Star key={key} {...starProps} />
        ))}
      </View>

      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header - Compact & Functional */}
        <View className="flex-row items-center px-5 py-3 gap-3 z-50">
            <View className="w-9 h-9 rounded-xl bg-white/10 border border-white/5 items-center justify-center backdrop-blur-md">
                 <Text className="text-blue-500 font-bold text-xl italic">L</Text>
            </View>
            
            <View className="flex-1 h-10 bg-white/5 rounded-2xl flex-row items-center px-4 border border-white/10">
                <Search size={16} color="#94a3b8" />
                <TextInput 
                    className="flex-1 ml-3 text-sm text-white h-full"
                    placeholder="Tìm kiếm mọi thứ..."
                    placeholderTextColor="#64748b"
                />
            </View>
        </View>

        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView 
                className="flex-1" 
                contentContainerStyle={{ paddingBottom: 120, paddingTop: 20 }} 
                showsVerticalScrollIndicator={false}
            >
                {/* Brand / Hero Section - Clean & Centered */}
                <View className="items-center mt-10 mb-8 px-4">
                    <View className="mb-6 relative">
                         <LinearGradient
                            colors={['#2563eb', '#7c3aed']}
                            className="w-20 h-20 rounded-[24px] items-center justify-center shadow-lg shadow-blue-500/30"
                            style={{ transform: [{ rotate: '-10deg' }] }}
                         >
                            <Text className="text-white font-bold text-4xl italic">Lo</Text>
                         </LinearGradient>
                    </View>
                    
                    <View className="flex-row items-center mb-4">
                        <Text className="text-3xl font-bold text-white tracking-tight">Locaith </Text>
                        <Text className="text-3xl font-bold text-[#3b82f6] tracking-tight">AI Studio</Text>
                    </View>
                    
                    <Text className="text-gray-400 text-base text-center max-w-xs leading-6 font-medium">
                        Trợ lý thông minh toàn năng. Giúp bạn lập kế hoạch, tư vấn giải pháp và hiện thực hóa ý tưởng.
                    </Text>
                </View>

                {/* Main Input Area - "Glassmorphism" Card */}
                <View className="mx-4 mb-10">
                    <View 
                        className="bg-[#1e1e2e]/80 border border-white/10 rounded-[32px] p-1 shadow-2xl"
                    >
                        <View className="p-5">
                            <TextInput
                                className="w-full text-lg text-white leading-7 min-h-[60px]"
                                placeholder="Bạn đang nghĩ gì? Hãy để tôi giúp..."
                                placeholderTextColor="#6b7280"
                                multiline
                                textAlignVertical="top"
                                value={inputValue}
                                onChangeText={setInputValue}
                                style={{ padding: 0 }}
                            />
                            
                            <View className="flex-row justify-between items-center mt-6">
                                <View className="flex-row gap-5">
                                    <TouchableOpacity>
                                        <ImageIcon size={22} color="#9ca3af" />
                                    </TouchableOpacity>
                                    <TouchableOpacity>
                                        <Mic size={22} color="#9ca3af" />
                                    </TouchableOpacity>
                                    <TouchableOpacity>
                                        <Paperclip size={22} color="#9ca3af" />
                                    </TouchableOpacity>
                                </View>
                                
                                <TouchableOpacity 
                                    disabled={!inputValue.trim()}
                                >
                                    <ArrowUp size={22} color={inputValue.trim() ? '#fff' : '#4b5563'} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Suggestions / Discovery */}
                <View className="mx-4">
                    <Text className="text-xs font-bold text-gray-500 text-center uppercase tracking-[2px] mb-6">
                        KHÁM PHÁ KHẢ NĂNG
                    </Text>
                    
                    <View className="gap-3">
                        <TouchableOpacity 
                            className="w-full bg-[#1e1e2e]/60 p-5 rounded-2xl border border-white/5 active:bg-[#1e1e2e]"
                            onPress={() => setInputValue("Tôi muốn tổ chức hội nghị cần những gì?")}
                        >
                            <Text className="text-center text-gray-200 text-base font-medium">
                                Tôi muốn tổ chức hội nghị cần những gì?
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            className="w-full bg-[#1e1e2e]/60 p-5 rounded-2xl border border-white/5 active:bg-[#1e1e2e]"
                            onPress={() => setInputValue("Cần chuẩn bị gì cho sự kiện ra mắt sản phẩm?")}
                        >
                            <Text className="text-center text-gray-200 text-base font-medium">
                                Cần chuẩn bị gì cho sự kiện ra mắt sản phẩm?
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Bottom Navigation Bar */}
      <View className="absolute bottom-0 w-full px-4 pb-12 pt-4">
        <BlurView intensity={80} tint="dark" className="flex-row justify-between items-center bg-[#000000] px-2 py-4 rounded-3xl border border-white/10">
            <TouchableOpacity className="items-center px-2">
                <View className="bg-blue-600/20 p-2 rounded-xl mb-1">
                     <MessageSquare size={20} color="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                </View>
                <Text className="text-[10px] font-medium text-blue-500">Tư vấn AI</Text>
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

export default DashboardScreen;
