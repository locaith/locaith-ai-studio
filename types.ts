
export interface GenerateRequest {
  prompt: string;
  currentCode?: string;
}

export enum TabOption {
  PREVIEW = 'preview',
  CODE = 'code'
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  action?: {
    label: string;
    type: string;
    payload: any;
  };
}