
import { GoogleGenAI } from "@google/genai";
import { ComplianceResult, AnalysisRequest } from "../types";
import { SYSTEM_INSTRUCTION, MODEL_NAME } from "../constants";

// Helper to compress images to avoid payload limits (Fixes "Rpc failed" errors)
const compressImage = async (base64Str: string, maxWidth = 1024): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = `data:image/jpeg;base64,${base64Str}`;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const scaleSize = maxWidth / img.width;
            if (scaleSize >= 1) {
                resolve(base64Str); // No resize needed
                return;
            }
            canvas.width = maxWidth;
            canvas.height = img.height * scaleSize;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(base64Str);
                return;
            }
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const compressed = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
            resolve(compressed);
        };
        img.onerror = () => resolve(base64Str); // Fallback
    });
};

export const analyzeDesign = async (request: AnalysisRequest): Promise<ComplianceResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key might be missing or not accessible in process.env.API_KEY");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey || '' });

  const parts: any[] = [];
  
  // 1. Establish Location Context & Code Research
  parts.push({
      text: `PHASE 1: DYNAMIC LOCATION & CODE IDENTIFICATION
      User Location Input: "${request.location || "Not Specified"}"
      
      ACTION: 
      1. Extract the City, State, and Country.
      2. Identify the governing building codes (e.g. "IRC 2021", "California Building Code").
      `
  });

  // 2. Input Processing (Image or Text)
  if (request.imageData && request.mimeType) {
    // Compress image before sending to prevent XHR/Payload errors
    const processedImage = await compressImage(request.imageData);
    
    parts.push({
      inlineData: {
        data: processedImage,
        mimeType: "image/jpeg" // Always send as jpeg after compression
      }
    });
    parts.push({
      text: `PHASE 2: STRICT FIDELITY EXTRACTION
      ACTION: Analyze the image.
      - Trace the "originalBlueprint" EXACTLY as drawn.
      - If a door is missing in the image, the "originalBlueprint" MUST NOT have that door.
      - If a room is too small, draw it too small.
      - Do not apply fixes yet.`
    });
  } else if (request.textPrompt) {
    parts.push({
      text: `PHASE 2: GENERATIVE DESIGN
      Design Brief: "${request.textPrompt}"
      ACTION: Generate an initial layout.`
    });
  }

  // 3. Audit & Correction
  parts.push({
      text: `PHASE 3: AUDIT & CORRECTION
      ACTION:
      1. Audit "originalBlueprint" against the codes found in Phase 1.
      2. Generate "correctedBlueprint" where ALL violations are resolved (e.g., widen doors, add windows, expand rooms).
      3. Return the JSON.`
  });

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        // Removed googleSearch tool to allow use of responseMimeType: 'application/json'
        // This forces the model to output valid JSON only, preventing parsing errors.
        responseMimeType: 'application/json',
      },
      contents: {
        parts: parts
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    // Clean up potential markdown formatting if the model slips up (though MIME type usually fixes this)
    let jsonStr = text.trim();
    if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/^```json/, '').replace(/```$/, '');
    } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```/, '').replace(/```$/, '');
    }

    try {
        const result = JSON.parse(jsonStr) as ComplianceResult;
        
        // Data Integrity Check
        if (!result.originalBlueprint || !result.correctedBlueprint) {
            throw new Error("Incomplete blueprint data received");
        }
        
        return result;
    } catch (parseError) {
        console.error("Failed to parse JSON:", jsonStr);
        throw new Error("AI response was not valid JSON. Please try again.");
    }

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
