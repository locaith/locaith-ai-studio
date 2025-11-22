
import { GoogleGenAI } from "@google/genai";
import { BuildStep, ProjectFile } from "../types";

// --- CONFIGURATION ---
// This service is designed to work with both Google AI Studio and Vertex AI (via API Key).
// FOR LOCAL USAGE:
// 1. Create a .env file in your project root.
// 2. Add your API key: REACT_APP_API_KEY=your_key_here (or VITE_API_KEY depending on bundler).
// 3. Ensure your bundler exposes it as process.env.API_KEY.

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
      model: 'gemini-2.5-flash',
      contents: `You are an expert software architect. The user wants to build: "${prompt}". 
      Provide a brief, high-level technical summary (max 3 sentences) of how you would build this app using React and Tailwind CSS. 
      Keep the tone professional and encouraging.`,
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
       - **Shadows**: \`shadow-xl\`, \`shadow-2xl\`, \`shadow-indigo-500/20\`.
       - **Gradients**: \`bg-gradient-to-r from-blue-600 to-indigo-600\`.
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
       - Inside this tag, describe your plan using **HTML unordered lists** (\`<ul><li>...</li></ul>\`).
       - **DO NOT** use Markdown lists or plain text lines inside <thought>. Use HTML ONLY.
       - Example: <thought><ul><li>Analyze request</li><li>Create Header</li></ul></thought>
    
    2. <file name="filename.ext">...</file>
       - The content of the file.
    
    3. <shell>...</shell>
       - Optional shell commands (conceptual).

    Example:
    <thought><ul><li>Analyze request...</li><li>Create Header...</li></ul></thought>
    <file name="App.tsx">...</file>
  `;

  try {
    const ai = getAiClient();
    const response = await callWithRetry(() => ai.models.generateContentStream({
      model: 'gemini-2.5-flash', // Using Flash for stability and speed
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
