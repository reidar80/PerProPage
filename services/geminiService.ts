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
