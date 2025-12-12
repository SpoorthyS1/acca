
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
      text: `PHASE 2: FORENSIC BLUEPRINT EXTRACTION (THINKING MODE)
      
      **TASK:** You are digitizing a floor plan. Every line, every pixel matters.
      
      **THINKING PROCESS (Must be reflected in output accuracy):**
      
      1.  **GRID SCAN:** Mentally divide the image into a 10x10 grid. Scan each cell.
      2.  **ROOM IDENTIFICATION:** 
          -   Find every label. 
          -   Find every small enclosed space (closets, toilets).
          -   **DO NOT MISS ANY ROOM.**
      3.  **WALL TRACING (NEIGHBOR CHECK):**
          -   Start with the largest room.
          -   Identify what is next to it.
          -   **LOCK COORDINATES:** If the Kitchen shares a wall with the Garage, they must share the EXACT SAME coordinate line.
      4.  **DETAIL VALIDATION (ZOOM IN):**
          -   **Windows:** Is that a window or just a dimension line? (Windows are gaps in walls with inner lines). Measure relative to doors.
          -   **Doors:** Look for the **ARC**. No arc = sliding or cased opening.
          -   **Stairs:** Identify the block of parallel lines. Do not put walls between stair treads.
      
      **SCALE REFERENCE:**
      -   Find a standard doorway (usually 30-36 inches). Use this to calculate the feet/inches of everything else.
      
      **OUTPUT:**
      -   'originalBlueprint': The EXACT state of the image. (If it has code violations, KEEP THEM).
      -   'correctedBlueprint': The fixed version.
      
      Output ONLY the JSON.`
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
      2. Generate "correctedBlueprint" where ALL violations are resolved.
      3. Return the JSON.`
  });

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        // Maximize thinking budget for deep visual analysis
        thinkingConfig: {
            thinkingBudget: 16000
        }
      },
      contents: {
        parts: parts
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    // Clean up potential markdown formatting if the model slips up
    let jsonStr = text.trim();
    if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/^```json/, '').replace(/```$/, '');
    } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```/, '').replace(/```$/, '');
    }

    try {
        let result = JSON.parse(jsonStr);
        
        // FIX: Handle potential root wrapper (e.g., { complianceResult: { ... } })
        if (result.complianceResult) {
            result = result.complianceResult;
        }

        // Data Integrity Check
        if (!result.originalBlueprint || !result.correctedBlueprint) {
            console.error("Invalid Structure - Keys found:", Object.keys(result));
            throw new Error("Incomplete blueprint data received. Missing 'originalBlueprint' or 'correctedBlueprint'.");
        }
        
        return result as ComplianceResult;
    } catch (parseError) {
        console.error("Failed to parse JSON:", jsonStr);
        throw new Error("AI response was not valid JSON. Please try again.");
    }

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
