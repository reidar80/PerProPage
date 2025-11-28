import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { RESUME_DATA, SYSTEM_INSTRUCTION } from "../constants";

let ai: GoogleGenAI | null = null;
let chatSession: Chat | null = null;

const getAiInstance = () => {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

export const sendMessage = async (message: string): Promise<string> => {
  try {
    const client = getAiInstance();
    if (!chatSession) {
      const resumeContext = JSON.stringify(RESUME_DATA, null, 2);
      const fullSystemInstruction = `${SYSTEM_INSTRUCTION}\n\nHere is the resume data:\n${resumeContext}`;
      
      chatSession = client.chats.create({
        model: 'gemini-3-pro-preview',
        config: {
          systemInstruction: fullSystemInstruction,
        },
      });
    }

    const response: GenerateContentResponse = await chatSession.sendMessage({ 
      message: message 
    });
    
    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Sorry, I encountered an error connecting to the AI service.";
  }
};

export const generatePdfSummary = async (language: string): Promise<string> => {
  try {
    const client = getAiInstance();
    const resumeContext = JSON.stringify(RESUME_DATA, null, 2);
    
    // We create a fresh single-turn request for the PDF summary to ensure strict adherence
    const prompt = `
      You are an expert resume writer.
      Based on the following JSON resume data, write a compelling professional presentation (profile summary) for Reidar J. Boldevin.
      
      Requirements:
      1. Language: ${language === 'no' ? 'Norwegian' : (language === 'zh' ? 'Chinese (Simplified)' : 'English')}.
      2. Length: Approximately 100-200 words. 1 paragraph.
      3. Focus: Executive Management, Cyber Security, Identity Management (Entra ID), and Cloud Architecture.
      4. Tone: Professional, confident, and executive.
      5. Output: Just the text paragraph. No markdown formatting, no titles.

      Resume Data:
      ${resumeContext}
    `;

    const response = await client.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });

    return response.text?.trim() || "Experienced IT Professional specializing in Cyber Security and Identity Management.";
  } catch (error) {
    console.error("Gemini PDF Summary Error:", error);
    // Fallback based on static data if AI fails
    const fallback = RESUME_DATA.contact.summary[language as keyof typeof RESUME_DATA.contact.summary] || RESUME_DATA.contact.summary.en;
    return fallback;
  }
};