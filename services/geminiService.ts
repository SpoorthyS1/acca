
import { GoogleGenAI } from "@google/genai";
import { ComplianceResult, AnalysisRequest } from "../types";
import { SYSTEM_INSTRUCTION, MODEL_NAME } from "../constants";

export const analyzeDesign = async (request: AnalysisRequest): Promise<ComplianceResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key might be missing or not accessible in process.env.API_KEY");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey || '' });

  const parts: any[] = [];
  
  // 1. Establish Location Context & Code Research
  parts.push({
      text: `PHASE 1: LOCATION & CODE RESEARCH
      Target Location: "${request.location || "Not Specified"}"
      ACTION: Use 'googleSearch' to identify the specific residential building code, zoning setbacks, and egress requirements for this location.`
  });

  // 2. Input Processing (Image or Text)
  if (request.imageData && request.mimeType) {
    parts.push({
      inlineData: {
        data: request.imageData,
        mimeType: request.mimeType
      }
    });
    parts.push({
      text: `PHASE 2: BLUEPRINT EXTRACTION (OCR)
      ACTION: Analyze the uploaded image. Extract the EXACT geometry.
      - Treat the image as ground truth for the 'originalBlueprint'.
      - Identify all rooms, doors (with swings), windows, and furniture.
      - Estimate dimensions in FEET based on standard cues (e.g., a standard door is 3ft wide).`
    });
  } else if (request.textPrompt) {
    parts.push({
      text: `PHASE 2: GENERATIVE DESIGN
      Design Brief: "${request.textPrompt}"
      ACTION: Create a floor plan that meets these requirements.
      - Introduce 1-2 plausible code violations in the 'originalBlueprint' (e.g., door swinging into person, window too small) to demonstrate the audit capability.`
    });
  }

  // 3. Audit & Correction
  parts.push({
      text: `PHASE 3: COMPLIANCE AUDIT & CORRECTION
      ACTION:
      1. Compare 'originalBlueprint' against the found Building Code.
      2. List specific violations in the 'violations' array.
      3. Generate 'correctedBlueprint' by modifying ONLY the non-compliant elements (e.g., resize window, move wall for setback).
      
      OUTPUT: Produce the FINAL JSON object strictly adhering to the 'ComplianceResult' interface.`
  });

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }], 
      },
      contents: {
        parts: parts
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    // Robust JSON extraction
    let jsonStr = text;
    
    // Attempt to extract JSON from markdown blocks or raw text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        jsonStr = jsonMatch[0];
    }

    try {
        const result = JSON.parse(jsonStr) as ComplianceResult;
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
