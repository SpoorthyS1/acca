import { GoogleGenAI } from "@google/genai";
import { ComplianceResult, AnalysisRequest } from "../types";
import { SYSTEM_INSTRUCTION, MODEL_NAME } from "../constants";

export const analyzeDesign = async (request: AnalysisRequest): Promise<ComplianceResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set REACT_APP_GEMINI_API_KEY or process.env.API_KEY");
  }

  const ai = new GoogleGenAI({ apiKey });

  const parts: any[] = [];
  
  parts.push({
      text: `Project Location: ${request.location}. Identify the applicable building code for this location.`
  });

  if (request.imageData && request.mimeType) {
    parts.push({
      inlineData: {
        data: request.imageData,
        mimeType: request.mimeType
      }
    });
    parts.push({
      text: "Analyze this floor plan image. Extract the layout into the 'originalBlueprint' structure. Then, perform a compliance audit against the identified code, list violations, and create a 'correctedBlueprint' that fixes them."
    });
  } else if (request.textPrompt) {
    parts.push({
      text: `Design Brief: "${request.textPrompt}". Generate a preliminary 'originalBlueprint' (with potential typical novice errors) and a 'correctedBlueprint' (fully compliant). List the violations found in the original.`
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }], 
      },
      contents: {
        parts: parts
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    // Clean up potential markdown code blocks if present (though responseMimeType usually handles this)
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '');
    const result = JSON.parse(jsonStr) as ComplianceResult;
    return result;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
