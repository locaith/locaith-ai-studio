
import React, { useState, useEffect, useRef } from 'react';
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
}

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
          model: 'gemini-2.5-flash',
          contents: `Trả lời ngắn gọn, chính xác câu hỏi này bằng tiếng Việt, có sử dụng Google Search để lấy thông tin mới nhất: "${query}"`,
          config: {
            tools: [{ googleSearch: {} }] // Enable grounding
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
            model: 'gemini-2.5-flash',
            contents: `Trả lời ngắn gọn, chính xác câu hỏi này bằng tiếng Việt: "${query}". (Lưu ý: Không thể truy cập tìm kiếm thời gian thực lúc này, hãy trả lời dựa trên kiến thức có sẵn)`,
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

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const sessionPromise = aiRef.current.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
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
                    continue;
                  }
                  lastProcessedPromptRef.current = { text: prompt, time: now };

                  // CRITICAL: Minimize to widget when generating
                  setMode('WIDGET');

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
                } else if (fc.name === 'get_crypto_price') {
                  const symbol = (fc.args as any).symbol || 'BTC';
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
                  // Call the bridge to text model
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

            // Handle Audio
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              const outputCtx = outputAudioContextRef.current;
              if (outputCtx) {
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                const audioBuffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
                const source = outputCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputCtx.destination);
                source.addEventListener('ended', () => {
                  sourcesRef.current.delete(source);
                });
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(source);
                setAudioVolume(0.5 + Math.random() * 0.3);
              }
            }

            // Handle Transcription
            const outTrans = msg.serverContent?.outputTranscription;
            const inTrans = msg.serverContent?.inputTranscription;

            if (outTrans?.text) {
              currentOutputTransRef.current += outTrans.text;
              updateTranscript('ai', currentOutputTransRef.current, false);
            }
            if (inTrans?.text) {
              currentInputTransRef.current += inTrans.text;
              updateTranscript('user', currentInputTransRef.current, false);
            }

            if (msg.serverContent?.turnComplete) {
              if (currentInputTransRef.current) {
                updateTranscript('user', currentInputTransRef.current, true);
                currentInputTransRef.current = '';
              }
              if (currentOutputTransRef.current) {
                updateTranscript('ai', currentOutputTransRef.current, true);
                currentOutputTransRef.current = '';
              }
              setAudioVolume(0);
            }
          },
          onclose: () => {
            setIsConnected(false);
            console.log("Connection closed");
          },
          onerror: (e) => {
            console.error("Voice Socket Error:", e);
            setConnectionError("Connection error. Check API Key or Network.");
            setIsConnected(false);
          }
        }
      });

      sessionRef.current = sessionPromise;

    } catch (err: any) {
      console.error("Connection failed", err);
      setConnectionError(err.message || "Failed to connect to Gemini Live");
      setIsConnected(false);
      isConnectingRef.current = false;
      setIsConnecting(false);
    }
  };

  const handleTestVoice = async () => {
    if (!aiRef.current) return;
    setIsTestingVoice(true);
    try {
      const response = await aiRef.current.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: {
          parts: [{ text: "Chào bạn, mình là Locaith. Mình sẽ đưa bạn đi trải nghiệm tính năng ngay." }]
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } },
          },
        }
      });

      const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioData) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const audioBuffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.start();
      }
    } catch (e) {
      console.error("Voice test failed", e);
    } finally {
      setIsTestingVoice(false);
    }
  };

  const handleSaveSettings = () => {
    setShowSettings(false);
    if (isConnected) {
      cleanup();
      setTimeout(() => {
        connect();
      }, 500);
    }
  };

  const updateTranscript = (sender: 'user' | 'ai', text: string, isFinal: boolean) => {
    setTranscripts(prev => {
      const newArr = [...prev];

      // Anti-repetition for UI display: Check if the exact same text was the last message from AI
      if (sender === 'ai' && newArr.length > 0) {
        const lastMsg = newArr[newArr.length - 1];
        if (lastMsg.sender === 'ai' && lastMsg.id !== lastAiTranscriptId.current && lastMsg.text.trim() === text.trim()) {
          // Duplicate message detected, ignore it
          return prev;
        }
      }

      let idRef = sender === 'user' ? lastUserTranscriptId : lastAiTranscriptId;

      if (idRef.current !== null) {
        const idx = newArr.findIndex(t => t.id === idRef.current);
        if (idx !== -1) {
          newArr[idx] = { ...newArr[idx], text };
        } else {
          const newId = transcriptIdCounter.current++;
          idRef.current = newId;
          newArr.push({ sender, text, id: newId });
        }
      } else {
        const newId = transcriptIdCounter.current++;
        idRef.current = newId;
        newArr.push({ sender, text, id: newId });
      }

      if (isFinal) {
        idRef.current = null;
      }
      return newArr;
    });
  };

  const handleClose = () => {
    console.log('🔒 User closed Voice Chat');
    cleanup();
    // Force reset all refs
    sessionRef.current = null;
    isConnectingRef.current = false;
    setMode('HIDDEN');
  };

  // --- WIDGET MODE RENDER ---
  if (mode === 'WIDGET') {
    return (
      <div className="absolute bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4">
        <div className="bg-white/90 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-full p-2 flex items-center space-x-3 pr-4 ring-1 ring-black/5">
          {/* Visualizer Mini */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isConnected ? 'bg-black' : 'bg-gray-200'}`}>
            {isConnected ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="absolute inset-0 bg-blue-500 opacity-30 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
                <div
                  className="w-6 h-6 bg-gradient-to-tr from-blue-400 to-purple-500 rounded-full"
                  style={{ transform: `scale(${0.8 + audioVolume * 0.5})`, transition: 'transform 0.1s' }}
                ></div>
              </div>
            ) : (
              <MicOff className="w-5 h-5 text-gray-500" />
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-900">Locaith AI</span>
            <span className="text-[10px] text-gray-500 flex items-center gap-1">
              {isConnected && !isMuted ? <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> : <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>}
              {isConnected ? (isMuted ? 'Mic Muted' : 'Listening...') : 'Paused'}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-1 pl-2 border-l border-gray-200">
            <button onClick={() => {
              playSound(isMuted ? 'unmute' : 'mute');
              setIsMuted(!isMuted);
            }} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600">
              {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </button>
            <button onClick={() => setMode('FULL')} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600">
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleClose} className="p-1.5 hover:bg-red-50 rounded-full text-red-500">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- FULL MODE RENDER ---
  return (
    <div className="absolute inset-0 z-40 bg-gray-900 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

      {/* --- Header --- */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20">
        <div className="flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? 'bg-red-500' : 'bg-gray-500'}`}></span>
          <span className="text-white font-medium text-sm tracking-widest uppercase opacity-80">
            {isConnected ? 'Live Voice Mode' : 'Voice Chat Ready'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setMode('WIDGET')}
            className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all"
            title="Minimize"
          >
            <Minimize2 className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all"
          >
            <Settings className="w-5 h-5" />
          </button>

          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-red-400 bg-white/5 hover:bg-white/10 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Popover */}
        {showSettings && (
          <div className="absolute right-6 top-16 w-96 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold">Voice Settings</h3>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 uppercase font-bold block mb-2">Voice Model</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'] as VoiceName[]).map(v => (
                    <button
                      key={v}
                      onClick={() => setSelectedVoice(v)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${selectedVoice === v ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 uppercase font-bold block mb-2">System Instruction</label>
                <textarea
                  value={systemInstruction}
                  onChange={(e) => setSystemInstruction(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-gray-200 focus:border-blue-500 outline-none h-32 resize-none scrollbar-hide"
                />
              </div>

              <div className="pt-4 border-t border-gray-700 flex space-x-3">
                <button
                  onClick={handleTestVoice}
                  disabled={isTestingVoice}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-xs font-medium flex items-center justify-center space-x-2 transition-colors"
                >
                  {isTestingVoice ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Volume2 className="w-3 h-3" />}
                  <span>Test Voice</span>
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-xs font-medium flex items-center justify-center space-x-2 transition-colors"
                >
                  <span>Save & Apply</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- Main Visual Area (Orb) --- */}
      <div className="flex-1 flex flex-col items-center justify-center relative">

        {/* Status Text */}
        {connectionError ? (
          <div className="flex items-center space-x-2 text-red-400 bg-red-500/10 px-4 py-1 rounded-full border border-red-500/20">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-medium">{connectionError}</span>
          </div>
        ) : isConnecting ? (
          <div className="flex items-center space-x-2 text-blue-400 bg-blue-500/10 px-4 py-1 rounded-full border border-blue-500/20">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-medium">Connecting to Voice...</span>
          </div>
        ) : isConnected ? (
          <p className="text-gray-400 text-sm animate-pulse flex items-center justify-center gap-2">
            {isMuted ? (
              <span className="text-red-400 font-medium flex items-center gap-2">
                <MicOff className="w-4 h-4" />
                Microphone is muted
              </span>
            ) : audioVolume > 0.05 ? (
              <span className="text-blue-400 font-medium">Listening / Speaking...</span>
            ) : (
              "Listening..."
            )}
          </p>
        ) : (
          <p className="text-gray-500 text-sm">Ready to connect</p>
        )}
      </div>

      {/* Transcripts Container */}
      <div className="w-full max-w-2xl px-6 max-h-[400px] overflow-y-auto scrollbar-hide mask-linear-fade">
        <div className="space-y-3 flex flex-col justify-end min-h-full pb-4">
          {transcripts.length === 0 && isConnected && (
            <div className="text-center text-gray-600 text-xs italic">Conversation will appear here...</div>
          )}
          {transcripts.map((t) => (
            <div key={t.id} className={`flex ${t.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`
                         max-w-[80%] px-4 py-2 rounded-2xl text-sm
                         ${t.sender === 'user' ? 'bg-blue-600/20 text-blue-100 border border-blue-500/30' : 'bg-gray-800/50 text-gray-200 border border-gray-700'}
                      `}>
                {t.text}
              </div>
            </div>
          ))}
          <div ref={scrollEndRef} />
        </div>
      </div>

      {/* --- Bottom Control Bar --- */}
      <div className="h-24 bg-gray-900 border-t border-gray-800 flex items-center justify-center space-x-6 z-20">
        <button
          onClick={() => {
            playSound(isMuted ? 'unmute' : 'mute');
            setIsMuted(!isMuted);
          }}
          disabled={!isConnected}
          className={`
            relative p-4 rounded-full transition-all 
            ${isMuted ? 'bg-red-500/20 text-red-500' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'} 
            ${!isConnected && 'opacity-50 cursor-not-allowed'}
          `}
        >
          {isConnected && !isMuted && (
            <span className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping"></span>
          )}
          {isMuted ? <MicOff className="w-6 h-6 relative z-10" /> : <Mic className="w-6 h-6 relative z-10" />}
        </button>

        <button
          onClick={isConnected ? cleanup : connect}
          className={`
               h-16 px-8 rounded-full flex items-center space-x-3 font-semibold text-lg shadow-lg transition-all transform active:scale-95
               ${isConnected ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-white hover:bg-gray-100 text-gray-900'}
            `}
        >
          {isConnected ? (
            <>
              <div className="relative">
                <Mic className="w-6 h-6" />
              </div>
              <span>End Session</span>
            </>
          ) : (
            <>
              <Play className="w-6 h-6 fill-current" />
              <span>Start Voice Chat</span>
            </>
          )}
        </button>

        <button
          onClick={() => setShowSettings(true)}
          className="p-4 rounded-full bg-gray-800 text-gray-400 hover:bg-gray-700 transition-all"
        >
          <Settings className="w-6 h-6" />
        </button>
      </div>

      <style>{`
        .mask-linear-fade {
          mask-image: linear-gradient(to bottom, transparent, black 20%);
          -webkit-mask-image: linear-gradient(to bottom, transparent, black 20%);
        }
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
      `}</style>
    </div>
  );
};

export default VoiceChat;

