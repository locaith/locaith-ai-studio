import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import VoiceChat from './components/VoiceChat';
import { ViewState, VoiceMode } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('BUILDER');
  const [voiceMode, setVoiceMode] = useState<VoiceMode>('HIDDEN');
  
  // Shared state for AI control
  const [inputText, setInputText] = useState('');
  const [triggerGeneration, setTriggerGeneration] = useState(0); // Increment to trigger
  const [lastInteraction, setLastInteraction] = useState<string | null>(null);

  const handleVoiceStart = () => {
    setVoiceMode('FULL');
  };

  const handleNavigate = (view: ViewState) => {
    setCurrentView(view);
    if (voiceMode === 'FULL') {
      setVoiceMode('WIDGET');
    }
  };

  const handleFillAndGenerate = (text: string) => {
    setInputText(text);
    // Slight delay to ensure text is set before triggering
    setTimeout(() => {
      setTriggerGeneration(prev => prev + 1);
    }, 100);
  };

  const handleUserInteraction = useCallback((description: string) => {
    setLastInteraction(description);
    // Reset after a short time so the same interaction can be triggered again if needed,
    // though primarily this is for the VoiceChat to consume immediately.
    setTimeout(() => setLastInteraction(null), 1000);
  }, []);

  return (
    <div className="flex h-screen w-full bg-white relative overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        onVoiceStart={handleVoiceStart}
        isVoiceActive={voiceMode !== 'HIDDEN'}
      />
      
      <MainContent 
        currentView={currentView}
        inputText={inputText}
        setInputText={setInputText}
        autoTrigger={triggerGeneration}
        onUserInteraction={handleUserInteraction}
      />

      {voiceMode !== 'HIDDEN' && (
        <VoiceChat 
          mode={voiceMode} 
          setMode={setVoiceMode} 
          onNavigate={handleNavigate}
          onFillAndGenerate={handleFillAndGenerate}
          lastUserInteraction={lastInteraction}
        />
      )}
    </div>
  );
};

export default App;