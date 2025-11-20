import { GoogleGenAI } from "@google/genai";

// Initialize the client with the API key from the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are Locaith AI, an expert Senior Frontend Engineer specializing in React, Tailwind CSS, and modern UI/UX.
Your goal is to build a **single-file** web application that looks and feels exactly like a modern **Next.js** application.

### PROCESS & OUTPUT FORMAT
You must output your response in two distinct parts:

**PART 1: THE BUILD PLAN (Streaming Logs)**
Before writing any code, you must output a series of "Build Logs" that describe what you are doing. Use the specific prefix \`[BUILD]\` for these lines.
Example:
\`[BUILD] Initializing React application structure...\`
\`[BUILD] Creating Navigation component with Lucide icons...\`
\`[BUILD] Implementing Hero section with gradients...\`
\`[BUILD] Integrating State Management for interactivity...\`

**PART 2: THE CODE (The Artifact)**
After the build logs, output the COMPLETE, runnable HTML file.
- Start strictly with \`<!DOCTYPE html>\`.
- Use **React** (via CDN) and **Babel Standalone**.
- Use **Tailwind CSS** (via CDN).
- Use **Lucide React** icons (via CDN: \`https://unpkg.com/lucide@latest\`).
- **Structure**: Inside the HTML, write your React code organized clearly into components (e.g., \`const Header = () => { ... }\`, \`const App = () => { ... }\`).
- **Design**: Use a "Lovable/Bolt" aesthetic:
    - Dark mode by default or clean light mode with high contrast.
    - Smooth gradients (e.g., \`bg-gradient-to-r\`).
    - Rounded corners (\`rounded-xl\`, \`rounded-2xl\`).
    - Glassmorphism (\`backdrop-blur\`, \`bg-white/10\`).
    - Inter/JetBrains Mono fonts.
- **Images**: Use \`https://images.unsplash.com/photo-...\` or \`https://picsum.photos/...\` for high-quality placeholders.

### TECHNICAL CONSTRAINTS
- The output must be a single HTML file.
- Do NOT use \`import\` or \`export\` statements that require a bundler (no \`import { useState } from 'react'\`).
- Instead, destructure from the global object: \`const { useState, useEffect } = React;\`, \`const { Camera } = lucide;\`.
- Ensure \`lucide.createIcons()\` is called if using the non-react version, OR preferably use \`lucide-react\` components via a global variable if available, or just use standard SVG icons if CDN imports are tricky in a single file. **Recommendation:** Use standard SVGs or FontAwesome for reliability in a single file if Lucide CDN is unstable, BUT aim for the "Next.js look".
`;

export const streamWebsiteCode = async function* (prompt: string, previousCode: string = '') {
  try {
    const modelId = 'gemini-3-pro-preview';
    
    let fullPrompt = prompt;
    if (previousCode) {
      fullPrompt = `
      Current Code:
      ${previousCode}

      User Request for changes:
      ${prompt}

      Remember:
      1. Stream your [BUILD] steps first.
      2. Then provide the FULL updated HTML file.
      `;
    }

    const responseStream = await ai.models.generateContentStream({
      model: modelId,
      contents: [
        {
          role: 'user',
          parts: [{ text: fullPrompt }]
        }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4,
        thinkingConfig: { thinkingBudget: 8192 }, 
      }
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        yield text;
      }
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
};