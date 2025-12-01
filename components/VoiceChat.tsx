﻿import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Settings,
  X,
  Pause,
  Play,
  Volume2,
  Minimize2,
  Maximize2,
  AlertTriangle
} from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from "@google/genai";
import { LOCAITH_SYSTEM_PROMPT } from "../services/geminiService";
import { VoiceMode, ViewState } from '../src/types/voice';

// Types for internal state
type VoiceName = 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
type TranscriptItem = { sender: 'user' | 'ai'; text: string; id: number };

interface VoiceChatProps {
  mode: VoiceMode;
  setMode: (mode: VoiceMode) => void;
  onNavigate: (view: ViewState) => void;
  onFillAndGenerate: (text: string) => void;
  lastUserInteraction: string | null;
}

// --- Tool Definitions ---
const navigateTool: FunctionDeclaration = {
  name: 'navigate_to_feature',
  description: 'Chuyển màn hình ứng dụng tới tính năng cụ thể mà người dùng yêu cầu (ví dụ: thiết kế nội thất, soạn văn bản, tìm kiếm...). GỌI TOOL NÀY KHI NGƯỜI DÙNG MUỐN MỞ TÍNH NĂNG.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      feature: {
        type: Type.STRING,
        description: 'Tên tính năng cần chuyển đến.',
        enum: ['BUILDER', 'INTERIOR', 'COMPOSE', 'SEARCH', 'MARKETING']
      }
    },
    required: ['feature']
  }
};

const fillPromptTool: FunctionDeclaration = {
  name: 'fill_prompt_and_generate',
  description: 'Điền nội dung vào ô nhập liệu của người dùng và tự động nhấn nút tạo/gửi. Sử dụng công cụ này khi bạn đã hiểu ý định của người dùng và muốn thực hiện hành động thay cho họ.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      prompt: {
        type: Type.STRING,
        description: 'Nội dung chi tiết cần nhập vào ô prompt để hệ thống xử lý. Hãy viết prompt thật chi tiết, đầy đủ thay cho người dùng.'
      }
    },
    required: ['prompt']
  }
};

const cryptoPriceTool: FunctionDeclaration = {
  name: 'get_crypto_price',
  description: 'Lấy giá realtime và biến động 24h của một đồng coin. CHỈ DÙNG CHO CRYPTO/COIN.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      symbol: {
        type: Type.STRING,
        description: 'Mã coin (ví dụ: BTC, ETH, SOL). Mặc định là USDT nếu không rõ.'
      }
    },
    required: ['symbol']
  }
};

const generalKnowledgeTool: FunctionDeclaration = {
  name: 'get_general_knowledge',
  description: 'Dùng công cụ này để lấy thông tin realtime về: GIÁ VÀNG, CHỨNG KHOÁN, THỜI TIẾT, TIN TỨC, THỂ THAO, PHÁP LUẬT, CÔNG NGHỆ, Y TẾ, ĐỊA ĐIỂM, v.v. Bất cứ thứ gì KHÔNG PHẢI COIN đều dùng cái này.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: 'Câu hỏi chi tiết cần tra cứu (ví dụ: "Giá vàng SJC hôm nay", "Thời tiết Hà Nội", "Giá cổ phiếu Vingroup", "Kết quả bóng đá").'
      }
    },
    required: ['query']
  }
};

// --- Audio Helper Functions ---

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const LOCAITH_SYSTEM_INSTRUCTION = `
Bạn là Locaith, trợ lý công nghệ thông minh (Locaith Studio Pro Suite).

QUY TẮC TUYỆT ĐỐI (SYSTEM PRIORITY):

1. **PHÁT HIỆN Ý ĐỊNH ĐIỀU HƯỚNG (NAVIGATE)**: 
   - Nếu người dùng nói: "Mở tính năng X", "Tôi muốn thiết kế web", "Chuyển sang soạn thảo", "Quay lại trang chủ"...
   - **DỪNG NÓI**.
   - **GỌI NGAY LẬP TỨC** function \`navigate_to_feature\`.
   - KHÔNG trả lời bằng lời nói "Ok tôi sẽ mở..." nếu chưa gọi tool.

2. **THÔNG TIN REALTIME (QUAN TRỌNG)**:
   - **Coin/Crypto** -> Gọi \`get_crypto_price\`.
   - **Vàng, Chứng khoán, Thời tiết, Tin tức, Thể thao, Địa điểm, Doanh nghiệp, Luật pháp, Y tế, Phim ảnh, Người nổi tiếng...** -> **BẮT BUỘC** gọi \`get_general_knowledge\`.
   - **TUYỆT ĐỐI KHÔNG** tự bịa số liệu từ kiến thức cũ (ví dụ: không được tự nói giá vàng là X nếu chưa gọi tool).
   - Nếu người dùng hỏi chung chung "Giá vàng thế nào?", hãy gọi tool với query "Giá vàng SJC/Thế giới hôm nay".

3. **HỖ TRỢ**:
   - Luôn phản hồi ngắn gọn, xúc tích, thân thiện.
   - Tự động điền prompt (\`fill_prompt_and_generate\`) nếu người dùng mô tả ý tưởng app/website.

THÔNG TIN CÔNG TY:
- Locaith Solution (locaith.com).

### CORE SYSTEM COMPLIANCE (LOCAITH GLOBAL STANDARD)
${LOCAITH_SYSTEM_PROMPT}
`;

const VoiceChat: React.FC<VoiceChatProps> = ({ mode, setMode, onNavigate, onFillAndGenerate, lastUserInteraction }) => {
  // --- State ---
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false); // UI Loading state
  const [isMuted, setIsMuted] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0); // 0 to 1
  const [showSettings, setShowSettings] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>('Puck');
  const [systemInstruction, setSystemInstruction] = useState(LOCAITH_SYSTEM_INSTRUCTION);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // --- Refs for Audio & API ---
  const aiRef = useRef<GoogleGenAI | null>(null);
  const sessionRef = useRef<any>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const transcriptIdCounter = useRef(0);
  const scrollEndRef = useRef<HTMLDivElement>(null);

  // Transcript buffering refs
  const currentInputTransRef = useRef('');
  const currentOutputTransRef = useRef('');
  const lastUserTranscriptId = useRef<number | null>(null);
  const lastAiTranscriptId = useRef<number | null>(null);

  // 🔒 CRITICAL: Prevent duplicate connections
  const isConnectingRef = useRef(false);
  const isMutedRef = useRef(isMuted);

  // --- Sound Effects Helpers ---
  const playSound = (type: 'mute' | 'unmute') => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'mute') {
      // Low pitch, descending tone for mute
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    } else {
      // High pitch, ascending tone for unmute
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    }

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  };

  // Sync isMuted state to Ref and MediaStream tracks
  useEffect(() => {
    isMutedRef.current = isMuted;
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });
    }
  }, [isMuted]);

  // 🛡️ DEBOUNCE: Prevent duplicate prompt generation
  const lastProcessedPromptRef = useRef<{ text: string, time: number } | null>(null);

  // --- Initialization ---
  useEffect(() => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        setConnectionError("API Key Missing. Please check your .env file.");
        return;
      }
      aiRef.current = new GoogleGenAI({ apiKey });
      // MANUAL START: No auto-connect here. User must click start.
    } catch (e: any) {
      console.error("Initialization error:", e);
      setConnectionError(e.message || "Failed to initialize AI");
    }

    return () => {
      cleanup();
    };
  }, []);

  // 🔊 GLOBAL AUTOPLAY FIX: Resume AudioContext on ANY user interaction
  useEffect(() => {
    const handleInteraction = () => {
      if (inputAudioContextRef.current?.state === 'suspended') {
        inputAudioContextRef.current.resume();
      }
      if (outputAudioContextRef.current?.state === 'suspended') {
        outputAudioContextRef.current.resume();
      }
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  useEffect(() => {
    if (scrollEndRef.current && mode === 'FULL') {
      scrollEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcripts, mode]);

  const cleanup = () => {
    console.log('🔴 CLEANUP - Disconnecting voice...');
    isConnectingRef.current = false;

    if (sessionRef.current) {
      sessionRef.current.then((s: any) => {
        if (s.close) s.close();
      }).catch(() => { });
      sessionRef.current = null;
    }

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.onaudioprocess = null;
    }
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
      inputAudioContextRef.current.close();
    }
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
      outputAudioContextRef.current.close();
    }

    sourcesRef.current.forEach(s => {
      try { s.stop(); } catch (e) { }
    });
    sourcesRef.current.clear();

    setIsConnected(false);
    setAudioVolume(0);
  };

  const audioBufferToBase64 = (buffer: Float32Array): string => {
    const l = buffer.length;
    const arrayBuffer = new ArrayBuffer(l * 2);
    const dataView = new DataView(arrayBuffer);

    for (let i = 0; i < l; i++) {
      let s = Math.max(-1, Math.min(1, buffer[i]));
      s = s < 0 ? s * 0x8000 : s * 0x7FFF;
      dataView.setInt16(i * 2, s, true);
    }

    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Client-side Crypto Fetcher
  const fetchCryptoData = async (symbol: string) => {
    try {
      // Using Binance Public API
      const pair = symbol.toUpperCase().endsWith('USDT') ? symbol.toUpperCase() : `${symbol.toUpperCase()}USDT`;

      // We use a public CORS proxy if possible, or rely on Binance's relatively open CORS policy.
      // Using explicit robust error handling for Network Errors
      try {
        const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${pair}`);
        if (!res.ok) throw new Error("Coin not found");
        const data = await res.json();

        const price = parseFloat(data.lastPrice).toFixed(2);
        const change = parseFloat(data.priceChangePercent).toFixed(2);

        return {
          price: `$${price}`,
          change: `${change}%`,
          isPositive: parseFloat(change) > 0,
          rawChange: parseFloat(change)
        };
      } catch (netErr) {
        // Fallback for network blockers or CORS issues on some browsers
        console.warn("Binance API Network Error:", netErr);
        return { error: "Không thể kết nối máy chủ Binance (Do chặn CORS hoặc Mạng). Vui lòng thử lại sau." };
      }
    } catch (e) {
      console.warn("Crypto API Error:", e);
      return { error: "Không thể lấy dữ liệu coin lúc này." };
    }
  };

  // General Knowledge Bridge (Using Flash Model with Google Search)
  const fetchGeneralKnowledge = async (query: string, retryCount = 1) => {
    try {
      if (!aiRef.current) return { error: "AI not initialized" };

      try {
        // Attempt using Google Search Grounding
        const response = await aiRef.current.models.generateContent({
          model: 'gemini-2.0-flash-exp',
          contents: `Trả lời ngắn gọn, chính xác câu hỏi này bằng tiếng Việt, có sử dụng Google Search để lấy thông tin mới nhất: "${query}"`,
          config: {
            tools: [{ googleSearch: {} }], // Enable grounding
            systemInstruction: LOCAITH_SYSTEM_PROMPT
          }
        });

        return { answer: response.text };
      } catch (innerError: any) {
        // Handle Service Unavailable (503) specifically for this tool call
        if (innerError.status === 503 && retryCount > 0) {
          console.warn("Search Service Unavailable, retrying...");
          await new Promise(r => setTimeout(r, 1500));
          return fetchGeneralKnowledge(query, retryCount - 1);
        }

        // Fallback: If permission denied (403) or other issue with search tool, try without search
        if (innerError.message?.includes('permission') || innerError.status === 403 || innerError.message?.includes('found')) {
          console.warn("Search Grounding permission denied, falling back to standard generation.");
          const response = await aiRef.current.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: `Trả lời ngắn gọn, chính xác câu hỏi này bằng tiếng Việt: "${query}". (Lưu ý: Không thể truy cập tìm kiếm thời gian thực lúc này, hãy trả lời dựa trên kiến thức có sẵn)`,
            config: {
                systemInstruction: LOCAITH_SYSTEM_PROMPT
            }
          });
          return { answer: response.text };
        }
        throw innerError;
      }
    } catch (e) {
      console.error("General Knowledge Error:", e);
      return { error: "Hiện tại tôi không thể tra cứu thông tin này do lỗi kết nối." };
    }
  };

  const connect = async () => {
    // 🔒 GUARD: Prevent duplicate connections
    if (isConnectingRef.current || sessionRef.current) {
      console.warn('⚠️ Already connecting or connected. Skipping duplicate connection attempt.');
      return;
    }

    console.log('🚀 Starting NEW connection...');
    isConnectingRef.current = true;
    setIsConnecting(true); // Show spinner

    if (!aiRef.current) {
      setConnectionError("AI Client not initialized. Missing API Key?");
      isConnectingRef.current = false;
      return;
    }
    setConnectionError(null);

    try {
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      inputAudioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;
      nextStartTimeRef.current = outputCtx.currentTime;

      // 🔊 AUTOPLAY FIX: Attempt to resume, but DO NOT await (prevents hanging)
      if (outputCtx.state === 'suspended') {
        console.log('🔊 Resuming suspended AudioContext...');
        outputCtx.resume().catch(e => console.warn("Auto-resume failed:", e));
      }
      if (inputCtx.state === 'suspended') {
        inputCtx.resume().catch(e => console.warn("Auto-resume failed:", e));
      }

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err: any) {
        console.error("Microphone access error:", err);
        if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          throw new Error("Không tìm thấy Microphone. Vui lòng kiểm tra kết nối thiết bị.");
        } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          throw new Error("Vui lòng cho phép truy cập Microphone để sử dụng tính năng này.");
        } else {
          throw new Error(`Lỗi Microphone: ${err.message || "Không xác định"}`);
        }
      }
      mediaStreamRef.current = stream;

      const sessionPromise = aiRef.current.live.connect({
        model: 'gemini-2.0-flash-exp',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } },
          },
          systemInstruction: systemInstruction,
          tools: [{ functionDeclarations: [navigateTool, fillPromptTool, cryptoPriceTool, generalKnowledgeTool] }],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            console.log("✅ Gemini Live Connected Successfully");
            setIsConnected(true);
            setConnectionError(null);
            isConnectingRef.current = false;
            setIsConnecting(false);

            const source = inputCtx.createMediaStreamSource(stream);
            sourceNodeRef.current = source;
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              let sum = 0;
              for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
              const rms = Math.sqrt(sum / inputData.length);
              setAudioVolume(prev => Math.max(rms * 5, prev * 0.9));

              if (isMutedRef.current) return;

              const base64Data = audioBufferToBase64(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({
                  media: {
                    mimeType: 'audio/pcm;rate=16000',
                    data: base64Data
                  }
                });
              });
            };

            source.connect(processor);
            processor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            // Handle Tool Calls
            if (msg.toolCall) {
              for (const fc of msg.toolCall.functionCalls) {
                if (fc.name === 'navigate_to_feature') {
                  const feature = (fc.args as any).feature;

                  // CRITICAL: Force minimize to WIDGET when navigation happens
                  setMode('WIDGET');
                  onNavigate(feature);

                  sessionPromise.then(session => {
                    session.sendToolResponse({
                      functionResponses: {
                        id: fc.id,
                        name: fc.name,
                        response: { result: 'success' }
                      }
                    });
                  });
                } else if (fc.name === 'fill_prompt_and_generate') {
                  const prompt = (fc.args as any).prompt;

                  // 🛡️ DEBOUNCE CHECK
                  const now = Date.now();
                  if (lastProcessedPromptRef.current &&
                    lastProcessedPromptRef.current.text === prompt &&
                    now - lastProcessedPromptRef.current.time < 5000) { // Increased to 5s
                    console.warn("Duplicate prompt ignored:", prompt);
                    // Still send success response to clear the tool call
                    sessionPromise.then(session => {
                      session.sendToolResponse({
                        functionResponses: {
                          id: fc.id,
                          name: fc.name,
                          response: { result: 'success' }
                        }
                      });
                    });
                  } else {
                    lastProcessedPromptRef.current = { text: prompt, time: now };
                    onFillAndGenerate(prompt);

                    sessionPromise.then(session => {
                      session.sendToolResponse({
                        functionResponses: {
                          id: fc.id,
                          name: fc.name,
                          response: { result: 'success' }
                        }
                      });
                    });
                  }
                } else if (fc.name === 'get_crypto_price') {
                  const symbol = (fc.args as any).symbol;
                  const data = await fetchCryptoData(symbol);
                  sessionPromise.then(session => {
                    session.sendToolResponse({
                      functionResponses: {
                        id: fc.id,
                        name: fc.name,
                        response: { result: data }
                      }
                    });
                  });
                } else if (fc.name === 'get_general_knowledge') {
                  const query = (fc.args as any).query;
                  const data = await fetchGeneralKnowledge(query);
                  sessionPromise.then(session => {
                    session.sendToolResponse({
                      functionResponses: {
                        id: fc.id,
                        name: fc.name,
                        response: { result: data }
                      }
                    });
                  });
                }
              }
            }

            if (msg.serverContent?.modelTurn?.parts) {
              for (const part of msg.serverContent.modelTurn.parts) {
                if (part.text) {
                  // Only add if different from last AI transcript to avoid duplicates
                  // (Basic check - improved by handling IDs if available)
                  if (part.text !== currentOutputTransRef.current) {
                     currentOutputTransRef.current = part.text;
                     setTranscripts(prev => {
                         const last = prev[prev.length - 1];
                         if (last && last.sender === 'ai') {
                             return [...prev.slice(0, -1), { ...last, text: last.text + part.text }];
                         }
                         return [...prev, { sender: 'ai', text: part.text, id: Date.now() }];
                     });
                  }
                }
                if (part.inlineData && part.inlineData.mimeType.startsWith('audio/pcm')) {
                   const pcmData = decode(part.inlineData.data);
                   const buffer = await decodeAudioData(pcmData, outputAudioContextRef.current!, 24000, 1);
                   
                   const source = outputAudioContextRef.current!.createBufferSource();
                   source.buffer = buffer;
                   source.connect(outputAudioContextRef.current!.destination);
                   
                   const now = outputAudioContextRef.current!.currentTime;
                   // Schedule next chunk
                   const start = Math.max(now, nextStartTimeRef.current);
                   source.start(start);
                   nextStartTimeRef.current = start + buffer.duration;
                   
                   sourcesRef.current.add(source);
                   source.onended = () => sourcesRef.current.delete(source);
                }
              }
            }
          },
          onclose: () => {
             console.log("🔴 Connection Closed");
             cleanup();
          },
          onerror: (err) => {
             console.error("🔴 Connection Error:", err);
             setConnectionError(err.message);
             cleanup();
          }
        }
      });
      
      sessionRef.current = sessionPromise;

    } catch (e: any) {
      console.error("Connection Setup Error:", e);
      setConnectionError(e.message);
      setIsConnecting(false);
      isConnectingRef.current = false;
    }
  };

  const disconnect = () => {
    cleanup();
  };

  return (
    <>
      {/* Main UI - only visible in FULL mode or when not minimized */}
      <div className={`flex flex-col h-full bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900 transition-all duration-500 ${mode === 'WIDGET' ? 'hidden' : ''}`}>
        
        {/* Header - Glassmorphism */}
        <div className="flex items-center justify-between px-6 py-4 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-b border-indigo-100 dark:border-indigo-900/50 z-10 sticky top-0">
          <div className="flex items-center space-x-3">
             <div className="relative">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-slate-400'} shadow-sm`} />
                {isConnected && <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75" />}
             </div>
             <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                Locaith Voice Pro
             </h2>
             <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 text-[10px] font-bold tracking-wider uppercase border border-indigo-200 dark:border-indigo-800">
                Beta
             </span>
          </div>
          <div className="flex items-center space-x-2">
            <button 
                onClick={() => setShowSettings(!showSettings)} 
                className="p-2.5 rounded-full bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 text-slate-600 dark:text-slate-300 transition-all hover:shadow-md border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900"
                title="Cài đặt"
            >
              <Settings size={18} />
            </button>
            <button 
                onClick={() => setMode('WIDGET')} 
                className="p-2.5 rounded-full bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 text-slate-600 dark:text-slate-300 transition-all hover:shadow-md border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900"
                title="Thu nhỏ"
            >
               <Minimize2 size={18} />
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth custom-scrollbar">
           {/* Welcome Message */}
           <div className="flex justify-start animate-fade-in-up">
              <div className="group relative max-w-[85%] md:max-w-[75%]">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl rounded-tl-none opacity-20 group-hover:opacity-30 transition duration-500 blur"></div>
                  <div className="relative bg-white dark:bg-gray-800 p-5 rounded-2xl rounded-tl-none border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
                     <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                            AI
                        </div>
                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Trợ lý Locaith</span>
                     </div>
                     <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        <p className="mb-2">Chào bạn! Tôi là <strong>Locaith Voice</strong>. Hãy trò chuyện với tôi để trải nghiệm sức mạnh của AI.</p>
                        <p className="mb-1">Bạn có thể yêu cầu tôi:</p>
                        <ul className="mt-1 space-y-1 list-disc list-inside text-slate-600 dark:text-slate-400 pl-1">
                            <li>Tra cứu thông tin thời gian thực</li>
                            <li>Viết nội dung sáng tạo</li>
                            <li>Điều khiển các tính năng ứng dụng</li>
                        </ul>
                     </div>
                  </div>
              </div>
           </div>
           
           {transcripts.map((t) => (
             <div key={t.id} className={`flex ${t.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                {t.sender === 'ai' ? (
                    <div className="group relative max-w-[85%] md:max-w-[75%]">
                        <div className="relative bg-white dark:bg-gray-800 p-5 rounded-2xl rounded-tl-none border border-indigo-100 dark:border-indigo-900/50 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
                                    AI
                                </div>
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Locaith</span>
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{t.text}</p>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-[85%] md:max-w-[75%]">
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-4 rounded-2xl rounded-tr-none shadow-lg shadow-indigo-500/20">
                           <p className="text-sm leading-relaxed">{t.text}</p>
                        </div>
                    </div>
                )}
             </div>
           ))}
           
           {/* Thinking Indicator */}
           {isConnected && transcripts.length > 0 && transcripts[transcripts.length - 1].sender === 'user' && (
               <div className="flex justify-start animate-pulse">
                   <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-2xl rounded-tl-none border border-indigo-50 dark:border-indigo-900/30 flex items-center gap-1">
                       <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                       <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                       <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                   </div>
               </div>
           )}
           <div ref={scrollEndRef} />
        </div>

        {/* Controls Area - Glassmorphism */}
        <div className="p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-indigo-100 dark:border-indigo-900/50 flex flex-col items-center gap-6 z-10 relative">
           {/* Error Alert */}
           {connectionError && (
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center space-x-2 text-red-600 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-4 py-2 rounded-full text-sm shadow-lg animate-bounce">
                 <AlertTriangle size={16} />
                 <span>{connectionError}</span>
              </div>
           )}

           {/* Visualizer */}
           <div className="w-full max-w-xs h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
               {isConnected ? (
                   <div 
                       className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-100 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                       style={{ width: `${Math.max(5, Math.min(audioVolume * 100, 100))}%` }}
                   />
               ) : (
                   <div className="h-full w-full bg-slate-200 dark:bg-slate-700 opacity-50" />
               )}
           </div>

           {/* Main Controls */}
           <div className="flex items-center justify-center gap-8">
              {!isConnected ? (
                 <button
                    onClick={connect}
                    disabled={isConnecting}
                    className={`group relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-xl ${
                       isConnecting 
                       ? 'bg-slate-200 dark:bg-slate-700 cursor-not-allowed' 
                       : 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-indigo-500/30 hover:shadow-indigo-500/50'
                    }`}
                 >
                    {isConnecting ? (
                        <div className="absolute inset-0 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
                    ) : (
                        <>
                            <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                            <Mic size={32} className="relative z-10" />
                        </>
                    )}
                 </button>
              ) : (
                 <>
                    <button
                       onClick={() => setIsMuted(!isMuted)}
                       className={`p-4 rounded-full transition-all duration-300 border shadow-sm hover:shadow-md ${
                          isMuted 
                          ? 'bg-red-50 border-red-200 text-red-500 dark:bg-red-900/20 dark:border-red-800' 
                          : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 dark:bg-gray-800 dark:border-gray-700 dark:text-slate-300'
                       }`}
                       title={isMuted ? "Bật micro" : "Tắt micro"}
                    >
                       {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                    </button>

                    <button
                       onClick={disconnect}
                       className="group w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-pink-600 text-white flex items-center justify-center shadow-xl shadow-red-500/30 hover:shadow-red-500/50 transition-all transform hover:scale-105 active:scale-95"
                       title="Ngắt kết nối"
                    >
                       <X size={32} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                    
                    <div className="w-[58px]" /> {/* Spacer to balance layout if needed, or add another button here */}
                 </>
              )}
           </div>
           
           <p className="text-xs font-medium text-slate-400 dark:text-slate-500 tracking-wide uppercase">
               {isConnected ? (isMuted ? 'Micro đã tắt' : 'Đang nghe...') : 'Nhấn để bắt đầu trò chuyện'}
           </p>
        </div>
      </div>

      {/* Widget Mode - Floating Pill */}
      {mode === 'WIDGET' && (
         <div 
            className="fixed bottom-6 right-6 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-full shadow-2xl shadow-indigo-500/20 border border-indigo-100 dark:border-indigo-800 p-2 flex items-center gap-3 cursor-pointer hover:scale-105 transition-all duration-300 group animate-in slide-in-from-bottom-4 fade-in"
            onClick={() => setMode('FULL')}
         >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-inner ${isConnected ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
               {isConnected ? (
                  <div className="relative">
                     <Mic size={20} />
                     <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-indigo-600 animate-ping" />
                  </div>
               ) : (
                  <MicOff size={20} />
               )}
            </div>
            <div className="pr-4">
               <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Locaith Voice</p>
               <div className="flex items-center gap-1.5">
                   <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
                   <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{isConnected ? 'Đang hoạt động' : 'Đã ngắt kết nối'}</p>
               </div>
            </div>
            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />
            <button 
               className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-indigo-600 transition-colors"
               onClick={(e) => { e.stopPropagation(); setMode('FULL'); }}
               title="Mở rộng"
            >
               <Maximize2 size={18} />
            </button>
         </div>
      )}
      
      {/* Settings Modal - Refined */}
      {showSettings && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-indigo-100 dark:border-indigo-900 scale-100 animate-in zoom-in-95 duration-200">
               <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                      <Settings size={20} className="text-indigo-500" />
                      Cài đặt Voice
                  </h3>
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                  >
                      <X size={20} />
                  </button>
               </div>
               <div className="p-6 space-y-6">
                  <div>
                     <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider text-[10px]">Giọng nói AI</label>
                     <div className="grid grid-cols-2 gap-3">
                        {['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'].map((voice) => (
                           <button
                              key={voice}
                              onClick={() => setSelectedVoice(voice as VoiceName)}
                              className={`relative px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                                 selectedVoice === voice 
                                 ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 shadow-sm' 
                                 : 'bg-white dark:bg-gray-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-indigo-700'
                              }`}
                           >
                              {voice}
                              {selectedVoice === voice && (
                                  <span className="absolute top-1/2 right-3 -translate-y-1/2 flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                  </span>
                              )}
                           </button>
                        ))}
                     </div>
                  </div>
                  
                  <div className="pt-2">
                      <button 
                        onClick={() => setShowSettings(false)}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all active:scale-[0.98]"
                      >
                          Xong
                      </button>
                  </div>
               </div>
            </div>
         </div>
      )}
    </>
  );
};

export default VoiceChat;
