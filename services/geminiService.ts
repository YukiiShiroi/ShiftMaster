
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Overrides, Holidays } from "../types";
import { getPseudocode } from "../utils/scheduler";

/**
 * Analyzes the schedule based on user queries using Gemini API.
 */
export const analyzeSchedule = async (
  // shift is removed as it's now deterministic
  currentDate: Date,
  userQuery: string,
  overrides: Overrides,
  holidays: Holidays
): Promise<string> => {
  try {
    // Fix: Always use process.env.API_KEY directly when initializing the GoogleGenAI instance as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = "gemini-3-flash-preview";
    
    const dateStr = currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const pseudoCode = getPseudocode();

    const overridesList = Object.keys(overrides).length > 0 
        ? JSON.stringify(overrides) 
        : "None";
    
    const holidaysList = Object.keys(holidays).length > 0
        ? JSON.stringify(holidays)
        : "None";

    const prompt = `
      You are an expert workforce scheduling assistant.
      
      The calendar follows an ALTERNATING 2-WEEK CYCLE:
      - Week 1 (Shift 1): Work Mon, Tue, Fri, Sat, Sun. (Off Wed, Thu).
      - Week 2 (Shift 2): Work Wed, Thu. (Off Mon, Tue, Fri, Sat, Sun).
      - PAYDAY: Every Wednesday of Week 2 (Shift 2).
      - The cycle is mathematically deterministic based on weeks passed since Jan 1, 2024 (Week 1).
      
      Current Context:
      - Current Date View: ${dateStr}
      - Manual Overrides: ${overridesList}
      - Holidays: ${holidaysList}
      
      Logic Reference:
      ${pseudoCode}
      
      User Query: "${userQuery}"
      
      Analyze the query. If the user asks about paydays, calculate when the next Shift 2 Wednesday is.
      Keep the response concise, helpful, and friendly.
    `;

    // Fix: Explicitly type the response and call generateContent directly on ai.models
    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    // Fix: Access .text as a property, not a method, as per SDK guidelines
    return response.text || "I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error while analyzing the schedule. Please check your API key.";
  }
};
