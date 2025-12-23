import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useState } from 'react';
import './global.css';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import DashboardScreen from './components/DashboardScreen';
import JobScreen from './components/JobScreen';
import AppsScreen from './components/AppsScreen';
import ExploreScreen from './components/ExploreScreen';
import ProfileScreen from './components/ProfileScreen';
import ChatScreen from './components/ChatScreen';
import ExpertsScreen from './components/ExpertsScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('dashboard');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <DashboardScreen onNavigate={setCurrentScreen} />;
      case 'jobs':
        return <JobScreen onNavigate={setCurrentScreen} />;
      case 'experts':
        return <ExpertsScreen onNavigate={setCurrentScreen} />;
      case 'apps':
        return <AppsScreen onNavigate={setCurrentScreen} />;
      case 'explore':
        return <ExploreScreen onNavigate={setCurrentScreen} />;
      case 'profile':
        return <ProfileScreen onNavigate={setCurrentScreen} />;
      case 'chat':
        return <ChatScreen onNavigate={setCurrentScreen} />;
      default:
        return <DashboardScreen onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <View style={styles.container}>
          <StatusBar style="light" />
          {renderScreen()}
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050511',
  },
});
