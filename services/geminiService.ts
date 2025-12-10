
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
      text: `PHASE 1: DYNAMIC LOCATION & CODE IDENTIFICATION
      User Location Input: "${request.location || "Not Specified"}"
      
      ACTION: 
      1. Extract the City, State, and Country.
      2. Research the SPECIFIC building codes for this location (e.g. "NBC 2016", "IBC 2021", "Dubai Building Code").
      3. Use these exact codes for the compliance audit.`
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
      text: `PHASE 2: PRECISION BLUEPRINT ANALYSIS
      ACTION: Analyze the uploaded image with EXTREME ACCURACY.
      - Extract exact measurements for rooms, doors, and windows.
      - Identify structural elements and furniture.
      - Map this data to the 'originalBlueprint' JSON structure.`
    });
  } else if (request.textPrompt) {
    parts.push({
      text: `PHASE 2: GENERATIVE ARCHITECTURAL DESIGN
      Design Brief: "${request.textPrompt}"
      ACTION: Generate a detailed floor plan that meets the brief and adheres to the local codes identified in Phase 1.`
    });
  }

  // 3. Audit & Correction
  parts.push({
      text: `PHASE 3: COMPLIANCE AUDIT & 3D MODELING
      ACTION:
      1. Compare the 'originalBlueprint' against the identified local codes (Setbacks, Room Sizes, Egress).
      2. Create a 'correctedBlueprint' fixing any violations.
      3. Generate the final JSON object containing 2D, 3D, and Compliance data.`
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
