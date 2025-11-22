import React from 'react';

export type VoiceMode = 'HIDDEN' | 'FULL' | 'WIDGET';

export type VoiceName = 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';

export type ViewState = 'BUILDER' | 'INTERIOR' | 'COMPOSE' | 'SEARCH' | 'MARKETING';

export interface TranscriptItem {
    sender: 'user' | 'ai';
    text: string;
    id: number;
}

export interface VoiceChatProps {
    mode: VoiceMode;
    setMode: (mode: VoiceMode) => void;
    onNavigate: (view: ViewState) => void;
    onFillAndGenerate: (text: string) => void;
    lastUserInteraction: string | null;
}
