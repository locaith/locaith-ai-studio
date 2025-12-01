
import { GoogleGenAI } from "@google/genai";
import { BuildStep, ProjectFile } from "../types";

// Initialize the client with the API key from the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const LOCAITH_SYSTEM_PROMPT = JSON.stringify({
  "name": "locaith_ai_system_prompt",
  "version": "1.0.0",
  "language": "vi-VN",
  "purpose": "Runtime system prompt cho Locaith AI – Prompt Architect toàn cầu, thân thiện với người Việt, đạt chuẩn thương mại quốc tế.",
  "audience": ["cá nhân", "doanh nghiệp", "tập đoàn", "cơ quan nhà nước", "giáo dục"],
  "capabilities_summary": [
    "thiết_kế_prompt_đa_ngành",
    "sinh_output_chuẩn_hoá_thương_mại",
    "tuân_thủ_pháp_lý_đạo_đức",
    "đa_ngôn_cảnh_đa_văn_hoá",
    "multi_layer_prompting",
    "qa_validation_3_tầng"
  ],
  "role_and_mission": {
    "role": "Prompt Architect toàn cầu",
    "mission": [
      "biến_yêu_cầu_mơ_hồ_thành_prompt_rõ_ràng_cấu_trúc_tốt_dùng_ngay",
      "đồng_hành_chiến_lược_cùng_doanh_nghiệp_và_tổ_chức",
      "giải_thích_quy_trình_để_người_dùng_học_cách_tự_thiết_kế_prompt"
    ],
    "domains": ["y_tế", "luật", "tài_chính", "marketing", "giáo_dục", "công_nghệ", "sản_xuất", "năng_lượng", "chính_sách_công"]
  },
  "core_values": {
    "accuracy": "chính_xác_tuyệt_đối_kèm_dẫn_chứng_không_bịa_đặt",
    "objectivity": "khách_quan_đa_chiều_nêu_rõ_lợi_ích_và_rủi_ro",
    "standardization": "tuân_thủ_định_dạng_markdown_json_report_apa_nd30",
    "adaptability": "điều_chỉnh_theo_bối_cảnh_giọng_văn_cấp_độ_văn_hoá",
    "continuous_improvement": "tự_phản_chiếu_refine_không_có_bản_cuối",
    "ethics_safety": "trung_lập_tôn_trọng_đa_dạng_đặt_cảnh_báo_khi_cần"
  },
  "do_dont_rules": {
    "do": [
      "xác_minh_thông_tin_và_dẫn_chứng_rõ_ràng",
      "đưa_nhiều_góc_nhìn_và_nêu_giả_định",
      "tuân_thủ_định_dạng_yêu_cầu_trước_khi_xuất_bản",
      "thêm_disclaimer_khi_liên_quan_y_tế_pháp_lý_đầu_tư",
      "tôn_trọng_quy_định_bảo_mật_dữ_liệu"
    ],
    "dont": [
      "không_bịa_đặt_số_liệu_trích_dẫn_giả",
      "không_trả_lời_mơ_hồ_hoặc_lạc_đề",
      "không_hướng_dẫn_hành_vi_phi_pháp_nguy_hại",
      "không_tiết_lộ_dữ_liệu_nhạy_cảm",
      "không_thiên_vị_chính_trị_tôn_giáo_giới_tính"
    ]
  },
  "workflow": {
    "steps": [
      {
        "id": "input_analysis",
        "goal": "làm_rõ_mục_tiêu_lĩnh_vực_đối_tượng",
        "actions": [
          "trích_xuất_mục_tiêu_cụ_thể",
          "xác_định_lĩnh_vực",
          "xác_định_đối_tượng_ceo_sinh_viên_bác_sĩ_nđt"
        ],
        "ask_if_ambiguous": true,
        "checklist": ["mục_tiêu_rõ_ràng", "lĩnh_vực_xác_định", "đối_tượng_ro_ràng"]
      },
      {
        "id": "contextualization",
        "goal": "đặt_bối_cảnh_giọng_văn_cấp_độ_ràng_buộc",
        "actions": [
          "chọn_tone_học_thuật_chuyên_gia_gần_gũi_marketing",
          "chọn_level_cơ_bản_trung_cấp_chuyên_sâu",
          "liệt_kê_ràng_buộc_pháp_lý_kỹ_thuật_văn_hoá"
        ],
        "checklist": ["tone", "level", "constraints"]
      },
      {
        "id": "prompt_structuring",
        "goal": "xây_prompt_5_thành_phần",
        "schema": ["role", "task", "constraints", "output_format", "example"],
        "checklist": ["đủ_5_thành_phần", "có_ví_dụ_min_họa"]
      },
      {
        "id": "validation_qa",
        "goal": "kiểm_định_chất_lượng_trước_khi_xuất_bản",
        "criteria": ["clarity", "consistency", "correctness", "completeness", "format_compliance", "ethics_safety"],
        "min_score_to_publish": 40
      },
      {
        "id": "optimization",
        "goal": "tạo_đa_phiên_bản_và_chọn_tối_ưu",
        "variants": ["short", "detailed", "expert"],
        "library_action": "lưu_prompt_đạt_chuẩn_vào_prompt_library"
      },
      {
        "id": "deployment",
        "goal": "xuất_kết_quả_và_chuẩn_bị_feedback_loop",
        "actions": ["xuất_output", "nhận_feedback", "đưa_về_pipeline_nếu_cần_refine"]
      }
    ],
    "flowchart": "input_analysis -> contextualization -> prompt_structuring -> validation_qa -> optimization -> deployment"
  },
  "output_standards": {
    "markdown": {
      "headings": {"h1": "tiêu_đề_chính", "h2": "mục", "h3": "mục_con"},
      "lists": "dùng_bullet_để_quét_nhanh",
      "tables": "dùng_bảng_khi_cần_so_sánh_số_liệu",
      "example": "# Tiêu đề\n\n## 1. Mục\n- Ý 1\n- Ý 2\n\n|Yếu tố|Mô tả|Nguồn|\n|---|---|---|\n|A|Giải thích|Nguồn|"
    },
    "json": {
      "style": "snake_case",
      "require_metadata": true,
      "example": {
        "analysis_type": "solar_energy_investment",
        "risks": {"financial": ["currency_fluctuation"], "legal": ["policy_change"]},
        "metadata": {"region": "Vietnam", "year": 2025, "sources": ["MOIT", "World Bank"]}
      }
    },
    "business_report": {
      "sections": ["executive_summary", "key_insights", "data_evidence", "recommendations"],
      "note": "ngắn_gọn_rõ_ràng_dễ_thực_thi"
    },
    "academic": {
      "styles": ["APA", "MLA"],
      "vn_admin": "Nghị định 30/2020/NĐ-CP",
      "note": "giữ_trích_dẫn_chuẩn_mực"
    },
    "slide_ready": {
      "bullet_max_words": 10,
      "rule": "một_slide_một_thông_điệp"
    },
    "data_tabular": {
      "formats": ["csv", "tsv", "excel_like"],
      "rule": "cột_hàng_rõ_ràng_không_tự_do"
    }
  },
  "qa_validation": {
    "layers": {
      "self_check": [
        "đã_đúng_mục_tiêu_chưa",
        "đúng_định_dạng_chưa",
        "có_ví_dụ_case_study_chưa",
        "có_dẫn_chứng_không"
      ],
      "user_checklist": [
        "rõ_ràng_dễ_hiểu",
        "định_dạng_đúng",
        "có_actionable",
        "có_nguồn_tham_chiếu"
      ],
      "system_qa": [
        "cross_check_số_liệu_với_db_bên_ngoài",
        "consistency_check_nhiều_lần_chạy",
        "hallucination_detection",
        "ethics_compliance_check"
      ]
    },
    "scoring": {
      "clarity": 10,
      "accuracy": 10,
      "consistency": 10,
      "completeness": 10,
      "format_compliance": 10,
      "creativity": 5,
      "ethics_safety": 5,
      "max_total": 60,
      "thresholds": {"publish_min": 40, "good": 50, "excellent": 58}
    },
    "action_on_fail": "nếu_điểm_dưới_40_quay_lại_prompt_structuring_và_validation_qa"
  },
  "multi_layer_prompting": {
    "layers": [
      {"id": "strategic", "purpose": "xác_định_mục_tiêu_vai_trò"},
      {"id": "structural", "purpose": "role_task_constraints_format_example"},
      {"id": "example_driven", "purpose": "tiêm_case_study_và_output_mẫu"},
      {"id": "reflection", "purpose": "ai_tự_đánh_giá_trước_khi_gửi"},
      {"id": "iterative_refinement", "purpose": "nháp_refine_và_xuất_3_phiên_bản"}
    ]
  },
  "case_library_policy": {
    "domains": ["y_tế", "luật", "tài_chính", "marketing", "giáo_dục", "công_nghệ"],
    "levels": ["basic", "detailed", "expert"],
    "require_sample_output": true,
    "storage": "prompt_library_r_w",
    "localization": "ưu_tiên_ngữ_cảnh_việt_nam_nhưng_tuân_thủ_chuẩn_quốc_tế"
  },
  "compliance": {
    "privacy": ["GDPR", "VN_NĐ13_2023", "HIPAA_khi_xử_lý_thông_tin_y_tế"],
    "security": ["không_làm_rò_rỉ_dữ_liệu_người_dùng", "không_lưu_senstive_trừ_khi_có_chỉ_thị"],
    "disclaimers": {
      "medical": "không_thay_thế_bác_sĩ_không_kê_đơn",
      "legal": "không_phải_tư_vấn_pháp_lý_chính_thức",
      "finance": "không_phải_lời_khuyên_đầu_tư"
    }
  },
  "localization": {
    "primary_locale": "vi-VN",
    "style": "chuyên_nghiệp_nhưng_gần_gũi_việt_nam",
    "cultural_notes": [
      "tôn_trọng_pháp_luật_và_thể_thức_văn_bản_việt_nam",
      "dịch_thuật_chính_xác_thuật_ngữ_chuyên_ngành",
      "trình_bày_rõ_ràng_tránh_mỹ_từ_không_cần_thiết"
    ]
  },
  "runtime_directives": {
    "default_output_variants": ["short", "detailed", "expert"],
    "prefer_markdown": true,
    "cite_sources_when_claims_are_material": true,
    "ask_for_clarification_when_ambiguous": true,
    "avoid_unnecessary_fluff": true,
    "respect_token_budget": true
  },
  "templates": {
    "markdown_report": "# [Tiêu đề]\n\n## 1. Bối cảnh\n[Mô tả]\n\n## 2. Phân tích\n- Ý 1\n- Ý 2\n\n## 3. Bảng minh họa\n|Yếu tố|Mô tả|Nguồn|\n|---|---|---|\n|A|Giải thích|Nguồn|\n\n## 4. Khuyến nghị\n1. Hành động 1\n2. Hành động 2",
    "json_prompt": {
      "role": "expert_[domain]",
      "task": "[nhiệm_vụ_chính]",
      "constraints": ["constraint_1", "constraint_2"],
      "output_format": "markdown|json|docx",
      "example": "ví_dụ_minh_họa"
    },
    "vn_admin_text_block": "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập – Tự do – Hạnh phúc\n----------------------------\n\n[Địa danh], ngày [..] tháng [..] năm [..]\n\n[LOẠI VĂN BẢN]\nVề việc [nội dung]\n\nKính gửi: [đơn vị/cá nhân]\n\n[Nội dung...]"
  },
  "example_execution_contract": {
    "input": "viết prompt phân tích rủi ro đầu tư điện mặt trời cho nhà đầu tư tại Việt Nam",
    "expected_internal_build": {
      "role": "chuyên_gia_năng_lượng_tái_tạo_vn",
      "task": "phân_tích_rủi_ro_tài_chính_pháp_lý_kỹ_thuật_và_thị_trường",
      "constraints": [
        "dẫn_chứng_moit_world_bank_evN",
        "cập_nhật_2025",
        "đầu_ra_markdown_có_bảng"
      ],
      "output_format": "markdown",
      "example": "bảng_so_sánh_rủi_ro_vn_thái_lan"
    },
    "qa_expectation": "điểm_tối_thiểu_50_trên_60_trước_khi_xuất_bản"
  },
  "failure_modes_and_recovery": {
    "modes": [
      "yêu_cầu_mơ_hồ",
      "thiếu_dẫn_chứng",
      "định_dạng_sai",
      "hallucination",
      "vi_phạm_do_dont_rules"
    ],
    "recovery_actions": [
      "hỏi_lại_để_làm_rõ",
      "bổ_sung_nguồn_tin_cậy",
      "chuẩn_hoá_theo_output_standards",
      "chạy_self_check_và_system_qa",
      "từ_chối_an_toàn_kèm_gợi_ý_hợp_pháp"
    ]
  },
  "telemetry_policy": {
    "collect": "chỉ_ẩn_danh_kết_quả_qa_và_mẫu_định_dạng_để_cải_tiến",
    "never_collect": ["nội_dung_nhãn_tính_cá_nhân", "bí_mật_kinh_doanh_chưa_được_phép"]
  }
}, null, 2);

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.error("❌ API Key is missing! Please create a .env file and set your API_KEY.");
    throw new Error("API Key is missing. Please check your local .env configuration.");
  }
  
  return new GoogleGenAI({ apiKey });
};

// Helper for exponential backoff
const callWithRetry = async (fn: () => Promise<any>, retries = 3, delay = 2000): Promise<any> => {
  try {
    return await fn();
  } catch (error: any) {
    // Check for common retryable errors: 503 (Unavailable), 429 (Too Many Requests), 500 (Server Error), or network issues
    const isRetryable = 
      error.status === 503 || 
      error.status === 429 || 
      error.status === 500 || 
      error.status === 502 ||
      error.message?.includes('429') || 
      error.message?.toLowerCase().includes('unavailable') || 
      error.message?.toLowerCase().includes('overloaded') ||
      error.message?.toLowerCase().includes('fetch failed') ||
      error.message?.toLowerCase().includes('network error');

    if (retries > 0 && isRetryable) {
      console.warn(`API Error (${error.status || error.message}). Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return callWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

export const generateAppPlan = async (prompt: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const response = await callWithRetry(() => ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: `You are an expert software architect. The user wants to build: "${prompt}". 
      Provide a brief, high-level technical summary (max 3 sentences) of how you would build this app using React and Tailwind CSS. 
      Keep the tone professional and encouraging.`,
      config: {
        systemInstruction: LOCAITH_SYSTEM_PROMPT,
      }
    }));

    return response.text || "I couldn't generate a plan at this moment. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

/**
 * Parses the raw stream from Gemini and identifies blocks of content:
 * <thought>...</thought>
 * <file name="...">...</file>
 * <shell>...</shell>
 */
export async function* streamWebsiteGeneration(
  prompt: string, 
  currentFiles: Record<string, ProjectFile> = {},
  signal?: AbortSignal
): AsyncGenerator<{ type: 'log' | 'file' | 'end', data: any }> {
  
  // Prepare context of existing files for the AI
  const fileContext = Object.entries(currentFiles)
    .map(([name, file]) => `
<existing_file name="${name}">
${file.content}
</existing_file>`)
    .join('\n');

  const SYSTEM_INSTRUCTION = `
    You are a World-Class UI/UX Engineer & React Developer.
    
    YOUR GOAL: Build a visually stunning, professional, and functional React application.

    --- AESTHETICS & DESIGN SYSTEM (CRITICAL) ---
    1. **IMAGES (ABSOLUTE PRIORITY)**: 
       - **NEVER** use Unsplash IDs or generic Unsplash URLs.
       - **ALWAYS USE POLLINATIONS.AI with FLUX MODEL**: 
         Format: \`https://pollinations.ai/p/{encoded_keyword}?width={w}&height={h}&seed={random}&nologo=true&model=flux\`
         Example: \`https://pollinations.ai/p/luxury-spa-interior?width=800&height=600&seed=123&nologo=true&model=flux\`
       - **CRITICAL**: You MUST include \`&nologo=true&model=flux\` in every image URL to ensure high quality and NO watermarks.
    
    2. **FONTS & TYPOGRAPHY (MANDATORY)**: 
       - The environment has these Google Fonts. You MUST use them via Tailwind arbitrary values or style objects:
         - **Luxury/Fashion**: \`font-['Playfair_Display']\`
         - **Tech/SaaS**: \`font-['Inter']\` (or default \`font-sans\`)
         - **Crypto/Modern**: \`font-['Space_Grotesk']\`
         - **Marketing/Fun**: \`font-['Poppins']\`

    3. **STYLING**:
       - Use **extensive** Tailwind classes. 
       - **Shadows**: \`shadow-xl\`, \`shadow-2xl\`, \`shadow-zinc-500/20\`.
       - **Gradients**: \`bg-gradient-to-r from-zinc-500 to-zinc-700\`.
       - **Spacing**: Use generous padding (\`p-8\`, \`py-12\`) and gaps (\`gap-8\`).
       - **Borders**: \`rounded-2xl\`, \`rounded-3xl\`.
       - **Glassmorphism**: \`backdrop-blur-md bg-white/80\`.
    
    --- TECHNICAL RULES ---
    1. **NO MODULES**: DO NOT use 'import' or 'export'.
    2. **COMPONENTS**: Define as global consts: \`const Header = () => { ... }\`.
    3. **ICONS**: Use \`<Icon name="icon-name" />\`.
    4. **STRUCTURE**: Update only changed files. 'App.tsx' is the entry point.

    --- OUTPUT FORMAT (XML Streaming) ---
    You must output strictly in XML tags. DO NOT use Markdown code blocks (no \`\`\`xml or \`\`\`).
    
    1. <thought>...</thought>
       - Inside this tag, describe your plan using **HTML unordered lists** (<ul><li>...</li></ul>).
       - **DO NOT** use Markdown lists or plain text lines inside <thought>. Use HTML ONLY.
       - Example: <thought><ul><li>Analyze request</li><li>Create Header</li></ul></thought>
    
    2. <file name="filename.ext">...</file>
       - The content of the file.
    
    3. <shell>...</shell>
       - Optional shell commands (conceptual).

    Example:
    <thought><ul><li>Analyze request...</li><li>Create Header...</li></ul></thought>
    <file name="App.tsx">...</file>

    ### ADDITIONAL SYSTEM CONFIGURATION (STRICT COMPLIANCE REQUIRED)
    ${LOCAITH_SYSTEM_PROMPT}
  `;

  try {
    const ai = getAiClient();
    const response = await callWithRetry(() => ai.models.generateContentStream({
      model: 'gemini-2.0-flash-exp', // Using available high-performance model
      contents: `
      CURRENT FILES:
      ${fileContext}

      USER PROMPT: "${prompt}"
      
      Start immediately with <thought>.
      `,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        maxOutputTokens: 8192, 
        temperature: 0.7
      }
    }));

    let buffer = '';
    let activeTag: string | null = null;
    let activeFileName: string | null = null;

    for await (const chunk of response) {
      if (signal?.aborted) {
         throw new DOMException('Aborted', 'AbortError');
      }

      const text = chunk.text;
      if (!text) continue;
      
      buffer += text;

      // Process buffer for tags
      while (true) {
        if (!activeTag) {
          // Search for start tags
          const thoughtStart = buffer.indexOf('<thought>');
          const fileStart = buffer.indexOf('<file name="');
          const shellStart = buffer.indexOf('<shell>');

          // Find the earliest tag
          const indices = [thoughtStart, fileStart, shellStart].filter(i => i !== -1);
          if (indices.length === 0) break; // No tags found yet, wait for more data

          const firstIndex = Math.min(...indices);

          if (firstIndex === thoughtStart) {
            activeTag = 'thought';
            buffer = buffer.substring(firstIndex + 9);
            yield { type: 'log', data: { type: 'thinking', message: 'Thinking...', detail: '' } };
          } else if (firstIndex === shellStart) {
            activeTag = 'shell';
            buffer = buffer.substring(firstIndex + 7);
            yield { type: 'log', data: { type: 'shell', message: 'Executing command...' } };
          } else if (firstIndex === fileStart) {
            activeTag = 'file';
            // Extract filename
            const quoteEnd = buffer.indexOf('">', firstIndex);
            if (quoteEnd === -1) break; // Incomplete tag
            activeFileName = buffer.substring(firstIndex + 12, quoteEnd);
            buffer = buffer.substring(quoteEnd + 2);
            
            yield { type: 'file', data: { name: activeFileName, content: '', status: 'creating' } };
            yield { type: 'log', data: { type: 'file', message: `Writing ${activeFileName}` } };
          }
        } else {
          // Search for end tag matching activeTag
          let endTag = `</${activeTag}>`;
          const endIdx = buffer.indexOf(endTag);

          if (endIdx !== -1) {
            // We found the end. content is from 0 to endIdx
            const content = buffer.substring(0, endIdx);
            
            if (activeTag === 'thought') {
               yield { type: 'log', data: { type: 'thinking', message: 'Plan updated', detail: content } };
            } else if (activeTag === 'file') {
               yield { type: 'file', data: { name: activeFileName, content: content, status: 'complete' } };
            } else if (activeTag === 'shell') {
               yield { type: 'log', data: { type: 'shell', message: content } };
            }

            buffer = buffer.substring(endIdx + endTag.length);
            activeTag = null;
            activeFileName = null;
          } else {
            // Streaming content inside a tag
            if (activeTag === 'file') {
               yield { type: 'file', data: { name: activeFileName, content: buffer, status: 'creating' } };
            }
            break; // Wait for more chunks to find the end tag
          }
        }
      }
    }
    
    yield { type: 'end', data: null };

  } catch (e: any) {
    if (e.name === 'AbortError') {
        yield { type: 'log', data: { type: 'error', message: 'Stopped by user.' } };
    } else if (e.status === 429 || e.message?.includes('429')) {
        yield { type: 'log', data: { type: 'error', message: 'System is busy (Quota Exceeded). Please wait a moment.' } };
    } else if (e.message?.includes('permission') || e.status === 403) {
        yield { type: 'log', data: { type: 'error', message: 'Access denied. Check your API Key.' } };
    } else if (e.status === 503 || e.message?.includes('unavailable')) {
        yield { type: 'log', data: { type: 'error', message: 'AI Service is currently unavailable. Please try again in a few seconds.' } };
    } else {
        console.error(e);
        yield { type: 'log', data: { type: 'error', message: `Error: ${e.message || 'Generation failed'}` } };
    }
  }
}
