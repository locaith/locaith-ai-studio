import React from 'react';

export type ViewState = 'BUILDER' | 'INTERIOR' | 'COMPOSE' | 'SEARCH' | 'MARKETING';

export type VoiceMode = 'HIDDEN' | 'FULL' | 'WIDGET';

export interface NavItem {
  icon: React.ElementType;
  label: string;
  id: string; 
  active?: boolean;
  badge?: string;
}

export interface SuggestionChip {
  id: string;
  label: string;
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

// Website Builder Types
export interface ProjectFile {
  name: string;
  content: string;
  language: 'typescript' | 'javascript' | 'css' | 'html' | 'json';
  status: 'pending' | 'creating' | 'complete';
}

export interface BuildStep {
  id: number;
  type: 'thinking' | 'file' | 'shell' | 'error' | 'success';
  message: string;
  detail?: string;
}

export interface WebBuilderState {
  files: Record<string, ProjectFile>;
  activeFile: string | null;
  logs: BuildStep[];
  status: 'idle' | 'planning' | 'coding' | 'previewing' | 'complete';
  url?: string; // Deployed URL
}