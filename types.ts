export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export enum TabOption {
  PREVIEW = 'PREVIEW',
  CODE = 'CODE'
}

export interface GenerateRequest {
  prompt: string;
  currentCode?: string;
}