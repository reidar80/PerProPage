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

// Helper for exponential backoff retry logic
const retryWithBackoff = async <T>(
  fn: () => Promise<T>, 
  retries = 3, 
  delay = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    // Check for 503 specifically or generic overload messages
    const isOverloaded = error?.status === 503 || error?.code === 503 || error?.message?.includes('overloaded');
    
    if (retries > 0 && isOverloaded) {
      console.warn(`Model overloaded. Retrying in ${delay}ms... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

export const sendMessage = async (message: string): Promise<string> => {
  try {
    const client = getAiInstance();
    if (!chatSession) {
      const resumeContext = JSON.stringify(RESUME_DATA, null, 2);
      const fullSystemInstruction = `${SYSTEM_INSTRUCTION}\n\nHere is the resume data:\n${resumeContext}`;
      
      chatSession = client.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: fullSystemInstruction,
          tools: [{ googleSearch: {} }],
        },
      });
    }

    const response: GenerateContentResponse = await retryWithBackoff(() => 
      chatSession!.sendMessage({ message: message })
    );
    
    return response.text || "I couldn't generate a response.";
  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error?.status === 503 || error?.code === 503) {
      return "I'm currently experiencing high traffic (Model Overloaded). Please try again in a moment.";
    }
    return "Sorry, I encountered an error connecting to the AI service.";
  }
};

export const generatePdfSummary = async (language: string): Promise<string> => {
  try {
    const client = getAiInstance();
    const resumeContext = JSON.stringify(RESUME_DATA, null, 2);
    
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

    const response: GenerateContentResponse = await retryWithBackoff(() => 
      client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      })
    );

    return response.text?.trim() || "Experienced IT Professional specializing in Cyber Security and Identity Management.";
  } catch (error) {
    console.error("Gemini PDF Summary Error:", error);
    // Fallback based on static data if AI fails
    const fallback = RESUME_DATA.contact.summary[language as keyof typeof RESUME_DATA.contact.summary] || RESUME_DATA.contact.summary.en;
    return fallback;
  }
};