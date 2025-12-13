import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { LOCAITH_SYSTEM_PROMPT } from "../services/geminiService";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { 
  FileText, 
  Send, 
  Loader2, 
  Check, 
  Scale, 
  ExternalLink, 
  Maximize2, 
  Minimize2,
  Printer,
  Download,
  GripVertical,
  BookOpen,
  ArrowLeft,
  Share2
} from "lucide-react";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface DocumentSection {
  id: string;
  title: string;
  content: string;
}

interface LegalSource {
  title: string;
  uri: string;
  snippet: string;
}

export const ComposeFeature: React.FC = () => {
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string; sources?: LegalSource[] }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<string[]>([]);
  const [activeMobileTab, setActiveMobileTab] = useState<'chat' | 'document'>('chat');

  // Document State
  const [docContent, setDocContent] = useState<string>('');
  const [legalBases, setLegalBases] = useState<LegalSource[]>([]);

  // Resizable Pane State
  const [leftWidth, setLeftWidth] = useState(400); // Initial width
  const isResizingRef = useRef(false);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
  }, []);

  const stopResizing = useCallback(() => {
    isResizingRef.current = false;
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizingRef.current) {
      let newWidth = e.clientX - 64; // approximate offset for main sidebar if collapsed or expanded
      // We need to calculate relative to the container, but simplified for now using clientX
      // Assuming global sidebar is roughly 256px or 80px.
      // Better approach: just use movement
      setLeftWidth(prev => {
        const next = prev + e.movementX;
        if (next < 300) return 300;
        if (next > 800) return 800;
        return next;
      });
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  // Setup default blank document structure according to Decree 30
  useEffect(() => {
    setDocContent(`
      <table style="width: 100%; margin-bottom: 20px; border: none; border-collapse: collapse;">
        <tr>
          <td style="width: 40%; text-align: center; vertical-align: top;">
            <div style="font-size: 13pt; text-transform: uppercase; font-weight: normal;">TÊN CƠ QUAN CHỦ QUẢN</div>
            <div style="font-size: 13pt; text-transform: uppercase; font-weight: bold;">TÊN CƠ QUAN BAN HÀNH</div>
            <div style="border-top: 1px solid black; width: 35%; margin: 0 auto; padding-top: 5px;"></div>
            <div style="font-size: 13pt; margin-top: 5px;">Số: ... /...</div>
          </td>
          <td style="width: 60%; text-align: center; vertical-align: top;">
            <div style="font-size: 13pt; font-weight: bold; text-transform: uppercase;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
            <div style="font-size: 14pt; font-weight: bold;">Độc lập - Tự do - Hạnh phúc</div>
            <div style="border-top: 1px solid black; width: 65%; margin: 0 auto; padding-top: 5px;"></div>
            <div style="font-size: 14pt; font-style: italic; margin-top: 5px; text-align: right; padding-right: 20px;">........, ngày ... tháng ... năm 20...</div>
          </td>
        </tr>
      </table>
      
      <div style="text-align: center; margin: 30px 0;">
        <div style="font-size: 15pt; font-weight: bold; text-transform: uppercase;">QUYẾT ĐỊNH</div>
        <div style="font-size: 14pt; font-weight: bold;">Về việc ........................</div>
      </div>

      <div style="font-size: 14pt; text-align: justify; line-height: 1.5;">
        <p><em>Căn cứ Luật Tổ chức Chính phủ ngày 19 tháng 6 năm 2015;</em></p>
        <p><em>Căn cứ Nghị định số 30/2020/NĐ-CP ngày 05 tháng 3 năm 2020 của Chính phủ về công tác văn thư;</em></p>
        <p><em>Căn cứ ....................................................................;</em></p>
        <p><em>Theo đề nghị của ..........................................................;</em></p>
      </div>

      <div style="margin-top: 20px; font-size: 14pt; font-weight: bold; text-align: center;">QUYẾT ĐỊNH:</div>

      <div style="font-size: 14pt; text-align: justify; line-height: 1.5; margin-top: 10px;">
        <p><strong>Điều 1.</strong> [Nội dung điều 1]</p>
        <p><strong>Điều 2.</strong> [Nội dung điều 2]</p>
        <p><strong>Điều 3.</strong> [Nội dung điều 3]</p>
      </div>

      <table style="width: 100%; margin-top: 50px; border: none; border-collapse: collapse;">
        <tr>
          <td style="width: 50%; vertical-align: top; font-size: 12pt;">
            <div style="font-weight: bold; font-style: italic;">Nơi nhận:</div>
            <div>- Như Điều ...;</div>
            <div>- Lưu: VT, ...</div>
          </td>
          <td style="width: 50%; text-align: center; vertical-align: top;">
            <div style="font-size: 13pt; font-weight: bold; text-transform: uppercase;">THỦ TRƯỞNG CƠ QUAN</div>
            <div style="font-style: italic;">(Ký, đóng dấu, ghi rõ họ tên)</div>
            <div style="height: 100px;"></div>
            <div style="font-size: 14pt; font-weight: bold;">Nguyễn Văn A</div>
          </td>
        </tr>
      </table>
    `);
  }, []);

  const addStep = (step: string) => {
    setProcessingSteps(prev => [...prev, step]);
  };

  const handleSend = async () => {
    if (!chatInput.trim()) return;

    const userMsg = { role: 'user' as const, content: chatInput };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsLoading(true);
    // We do NOT clear processingSteps here to let them persist or we can clear if starting new task
    setProcessingSteps([]);

    try {
      // STEP 1: Analyze Request
      addStep("Đang phân tích yêu cầu của bạn...");

      // STEP 2: Search Legal Bases
      addStep("Đang tra cứu hệ thống văn bản pháp luật (Nghị định, Thông tư)...");
      const searchPrompt = `
        Tìm kiếm thông tin pháp lý và mẫu văn bản cho yêu cầu: "${chatInput}".
        Đặc biệt chú ý đến các Nghị định, Luật, Thông tư liên quan đến nội dung này theo quy định pháp luật Việt Nam hiện hành.
        Tìm kiếm các căn cứ pháp lý bắt buộc phải có cho loại văn bản này.
      `;

      const searchResponse = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: searchPrompt,
        config: {
          tools: [{ googleSearch: {} }],
          systemInstruction: LOCAITH_SYSTEM_PROMPT,
        }
      });

      const groundingChunks = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources: LegalSource[] = groundingChunks
        .map((chunk: any) => chunk.web ? { title: chunk.web.title, uri: chunk.web.uri, snippet: chunk.web.title } : null)
        .filter(Boolean);

      setLegalBases(sources);

      if (sources.length > 0) {
        addStep(`Đã tìm thấy ${sources.length} văn bản pháp luật liên quan.`);
      } else {
        addStep("Không tìm thấy văn bản cụ thể, sử dụng mẫu chung.");
      }

      // STEP 3: Drafting
      addStep("Đang tổng hợp thông tin và soạn thảo nội dung chi tiết theo Nghị định 30...");

      const draftingPrompt = `
        Bạn là một chuyên gia soạn thảo văn bản hành chính nhà nước Việt Nam, tuân thủ tuyệt đối Nghị định 30/2020/NĐ-CP.
        
        Nhiệm vụ: Soạn thảo văn bản dựa trên yêu cầu: "${chatInput}".
        
        THÔNG TIN CĂN CỨ (Chỉ sử dụng thông tin này để viết phần "Căn cứ...", KHÔNG chèn link vào văn bản):
        ${JSON.stringify(sources)}
        
        QUY ĐỊNH VỀ THỂ THỨC (RẤT QUAN TRỌNG - TUÂN THỦ NGHIÊM NGẶT):
        
        1. XÁC ĐỊNH LOẠI VĂN BẢN:
           - Nếu là "Công văn" (Official Dispatch) / "Tờ trình" (Proposal) / "Báo cáo" (Report):
             + Table Header (Cột 1): Tên cơ quan chủ quản (hoa thường) -> Tên cơ quan ban hành (HOA ĐẬM) -> HR Line -> Số: ... (Canh giữa).
             + Table Header (Cột 2): Quốc hiệu (HOA ĐẬM) -> Tiêu ngữ (Đậm) -> HR Line -> Địa danh, ngày... (nghiêng).
             + NGAY DƯỚI "Số:..." ở Cột 1: Là "V/v ...." (Trích yếu nội dung). Font size nhỏ hơn (12pt).
             + Phần "Kính gửi: ...": Nằm dưới trích yếu hoặc canh giữa trang (nếu tên cơ quan nhận ngắn) hoặc thụt lề (nếu nhiều nơi nhận).
             + Nội dung chính.
             + Table Footer (Nơi nhận): Cột 1 ghi "Nơi nhận:" (đậm, nghiêng, 12pt), liệt kê các đơn vị. Cột 2 là chữ ký.

           - Nếu là "Quyết định" (Decision) / "Nghị quyết":
             + Header giống trên.
             + Tiêu đề (QUYẾT ĐỊNH) canh giữa, HOA ĐẬM.
             + Trích yếu (V/v...) canh giữa dưới tiêu đề.
             + Phần "Căn cứ": Bắt buộc phải có. In nghiêng, thụt đầu dòng, kết thúc bằng dấu chấm phẩy. (Ví dụ: Căn cứ Nghị định 30...).
             + Phần "QUYẾT ĐỊNH:" (Hoặc Nghị quyết:) canh giữa, đậm.
             + Các Điều khoản (Điều 1, Điều 2...).
        
        2. LỖI CẦN TRÁNH (QUAN TRỌNG):
           - KHÔNG lặp lại tên cơ quan ban hành (Ví dụ: Đã có ở Header thì không ghi lại ở tiêu đề).
           - KHÔNG chèn thẻ <a> (link) vào văn bản. Các nguồn tra cứu sẽ được hiển thị ở giao diện bên ngoài. Trong văn bản chỉ ghi text (Ví dụ: "Căn cứ Luật Đất đai 2013").
           - Font chữ: Times New Roman, size 13pt-14pt. Trích yếu V/v size 12pt.
           - Canh lề: Justify cho nội dung văn bản.
        
        YÊU CẦU ĐẦU RA:
        - CHỈ trả về mã HTML cho nội dung văn bản (không thẻ html/body/head, chỉ div/table/p).
        - KHÔNG wrap trong markdown code block.
      `;

      const draftResponse = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: draftingPrompt,
        config: {
          systemInstruction: LOCAITH_SYSTEM_PROMPT,
        }
      });

      addStep("Đang hoàn thiện định dạng theo chuẩn Nghị định 30/2020/NĐ-CP...");

      // Clean up the response aggressively
      let draftHtml = draftResponse.text;
      draftHtml = draftHtml.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '');
      draftHtml = draftHtml.replace(/<html>/i, '').replace(/<\/html>/i, '').replace(/<body>/i, '').replace(/<\/body>/i, '');

      setDocContent(draftHtml);

      addStep("Hoàn tất.");

      const assistantMsg = {
        role: 'assistant' as const,
        content: `Đã soạn thảo văn bản theo chuẩn Nghị định 30/2020/NĐ-CP. Đã cập nhật ${sources.length} căn cứ pháp lý trong phần nội dung.`,
        sources: sources
      };
      setMessages(prev => [...prev, assistantMsg]);

    } catch (error) {
      console.error("Error in compose:", error);
      addStep("Gặp lỗi trong quá trình xử lý.");
      setMessages(prev => [...prev, { role: 'assistant', content: "Xin lỗi, tôi gặp sự cố khi tìm kiếm thông tin hoặc soạn thảo." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Print Document</title>');
      printWindow.document.write('<style>@page { size: A4; margin: 20mm 15mm; } body { font-family: "Times New Roman", serif; } a { text-decoration: none; color: black; } </style>');
      printWindow.document.write('</head><body>');
      printWindow.document.write(docContent);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownload = () => {
    // Simulate DOCX generation by creating a specially formatted HTML file that Word opens gracefully
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML to Word Document with JavaScript</title><style>body { font-family: 'Times New Roman'; }</style></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + docContent + footer;

    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = 'van_ban_du_thao.doc';
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  return (
    <div className="flex h-full neu-bg overflow-hidden animate-fade-in-up selection:bg-accent-500/30 flex-col md:flex-row text-gray-700">

      {/* Left Column: Chat & Research */}
      <div
        style={{ width: leftWidth }}
        className={`${activeMobileTab === 'chat' ? 'flex' : 'hidden'} md:flex flex-col border-r border-gray-200/50 neu-bg z-10 relative flex-shrink-0 w-full md:w-auto h-full`}
      >
        <div className="md:h-auto p-0 md:p-4 border-b border-gray-200/50 flex items-center gap-2 neu-bg sticky top-0 z-50 md:static pt-[env(safe-area-inset-top)] h-[calc(3.5rem+env(safe-area-inset-top))]">
          <div className="flex items-center gap-2 px-4 md:px-0 w-full h-full">
            <div className="neu-pressed h-10 w-10 flex items-center justify-center rounded-xl text-primary md:flex hidden">
                <FileText className="w-5 h-5" />
            </div>
            {/* Mobile Icon */}
             <div className="md:hidden neu-pressed h-9 w-9 flex items-center justify-center rounded-full text-primary">
                <FileText className="w-5 h-5" />
            </div>
            <div>
                <h2 className="font-bold text-foreground md:text-base text-sm">Soạn thảo Văn bản</h2>
                <p className="text-xs text-muted-foreground hidden md:block">Chuẩn Nghị định 30/2020/NĐ-CP</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[90%] p-3 rounded-xl text-sm transition-all ${msg.role === 'user'
                  ? 'neu-pressed text-primary font-medium rounded-br-none border border-primary/20'
                  : 'neu-flat text-foreground rounded-bl-none'
                }`}>
                {msg.content}
              </div>

              {/* Source Citations Popup/Card Style */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 w-full max-w-[90%] neu-flat rounded-xl p-4 relative group">
                  <div className="absolute -left-1 top-4 w-1 h-8 bg-primary rounded-r-full"></div>
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="p-1 neu-pressed rounded-md text-primary">
                      <Scale className="w-3 h-3" />
                    </span>
                    Căn cứ pháp lý
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                    {msg.sources.map((source, sIdx) => (
                      <div key={sIdx} className="relative pl-3 border-l-2 border-gray-200 hover:border-primary transition-colors">
                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="block group-item">
                          <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {source.title}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <img
                              src={`https://www.google.com/s2/favicons?domain=${new URL(source.uri).hostname}&sz=16`}
                              alt="favicon"
                              className="w-3 h-3 opacity-60"
                              onError={(e) => (e.currentTarget.style.display = 'none')}
                            />
                            <div className="text-[10px] text-muted-foreground truncate">{new URL(source.uri).hostname}</div>
                          </div>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Persistent Streaming Steps Visualization */}
          {processingSteps.length > 0 && (
            <div className="ml-2 space-y-2 neu-pressed p-3 rounded-lg">
              <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Quy trình xử lý</div>
              {processingSteps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2 animate-fade-in-up">
                  {idx === processingSteps.length - 1 && isLoading ? (
                    <span className="w-4 h-4 flex items-center justify-center">
                      <Loader2 className="w-3 h-3 animate-spin text-primary" />
                    </span>
                  ) : (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                  <span className={`text-xs ${idx === processingSteps.length - 1 && isLoading ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200/50 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div className="relative neu-pressed rounded-2xl p-1 bg-gray-50/50">
            <Textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ví dụ: Soạn công văn gửi Bộ Tài chính về việc..."
              className="w-full bg-transparent border-none focus:ring-0 resize-none min-h-[96px] text-foreground placeholder:text-muted-foreground"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={isLoading || !chatInput.trim()}
              className={cn(
                "absolute bottom-2 right-2 h-8 w-8 transition-all duration-200",
                isLoading || !chatInput.trim() 
                  ? "neu-flat text-muted-foreground cursor-not-allowed" 
                  : "neu-btn hover:text-primary active:scale-95"
              )}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Drag Handle */}
        <div
          className="hidden md:block absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-primary/50 transition-colors z-20"
          onMouseDown={startResizing}
        ></div>

        {/* Mobile Switch to Document Button */}
        <Button
          onClick={() => setActiveMobileTab('document')}
          className="md:hidden absolute bottom-20 right-4 z-50 neu-btn text-primary rounded-full gap-2 animate-bounce"
        >
          <FileText className="w-4 h-4" />
          <span>Xem văn bản</span>
        </Button>
      </div>

      {/* Right Column: A4 Preview */}
      <div className={`${activeMobileTab === 'document' ? 'flex' : 'hidden'} md:flex flex-1 flex-col h-full overflow-hidden relative neu-bg`}>
        <div className="neu-bg border-b border-border flex items-center justify-between px-4 md:px-6 z-20 sticky top-0 md:static pt-[env(safe-area-inset-top)] h-[calc(3.5rem+env(safe-area-inset-top))]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Xem trước (A4)</span>
            <span className="hidden md:inline-block px-2 py-0.5 neu-pressed text-[10px] text-muted-foreground rounded">Chế độ chỉnh sửa</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handlePrint} className="md:flex hidden neu-btn text-muted-foreground hover:text-foreground">
              <Printer className="w-4 h-4 mr-2" />
              In ấn
            </Button>
            <button onClick={handlePrint} className="md:hidden neu-btn h-9 w-9 flex items-center justify-center rounded-full text-muted-foreground">
                <Printer className="w-4 h-4" />
            </button>
            
            <Button variant="ghost" size="sm" onClick={handleDownload} className="md:flex hidden neu-btn text-muted-foreground hover:text-primary">
              <Download className="w-4 h-4 mr-2" />
              Tải Word
            </Button>
             <button onClick={handleDownload} className="md:hidden neu-btn h-9 w-9 flex items-center justify-center rounded-full text-muted-foreground">
                <Download className="w-4 h-4" />
            </button>

            <Button size="sm" className="md:flex hidden neu-btn text-primary hover:text-primary/80">
              <Share2 className="w-4 h-4 mr-2" />
              Chia sẻ
            </Button>
             <button className="md:hidden neu-btn h-9 w-9 flex items-center justify-center rounded-full text-primary">
                <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 neu-pressed flex justify-center items-start">
          <div
            className="bg-white text-black shadow-2xl print:shadow-none transition-all w-full md:w-[210mm] md:min-h-[297mm]"
            style={{
              height: 'auto',
              padding: '20mm 15mm',
              fontFamily: '"Times New Roman", Times, serif',
              fontSize: '14pt',
              lineHeight: '1.5',
              boxSizing: 'border-box',
              marginBottom: '50px'
            }}
          >
            <div
              contentEditable
              dangerouslySetInnerHTML={{ __html: docContent }}
              className="outline-none focus:ring-1 focus:ring-primary/20 min-h-full"
              onBlur={(e) => setDocContent(e.currentTarget.innerHTML)}
            />
          </div>
        </div>

        {/* Mobile Switch to Chat Button */}
        <Button
          onClick={() => setActiveMobileTab('chat')}
          className="md:hidden absolute bottom-6 right-4 z-50 neu-btn text-foreground rounded-full shadow-lg gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Chat</span>
        </Button>
      </div>
    </div>
  );
};