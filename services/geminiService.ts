import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { RESUME_DATA, SYSTEM_INSTRUCTION } from "../constants";

let ai: GoogleGenAI | null = null;
let chatSession: Chat | null = null;
let customContext = "";

const getAiInstance = () => {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

const getContext = () => {
  // Convert the full object (including new fields) to string
  const resumeContext = JSON.stringify(RESUME_DATA, null, 2);
  const pdfContext = customContext ? `\n\nAdditionally, the user has uploaded a PDF with the following content:\n${customContext}` : "";
  return `Here is the full resume data in JSON format:\n${resumeContext}${pdfContext}`;
};

export const initializeChat = async () => {
  const client = getAiInstance();
  
  // Combine System Instruction with the Data Context immediately
  const fullSystemInstruction = `${SYSTEM_INSTRUCTION}\n\n${getContext()}`;

  chatSession = client.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: fullSystemInstruction,
    },
  });

  return chatSession;
};

export const sendMessage = async (message: string): Promise<string> => {
  try {
    if (!chatSession) {
      await initializeChat();
    }
    
    const response: GenerateContentResponse = await chatSession!.sendMessage({ 
      message: message 
    });
    
    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Sorry, I encountered an error connecting to the AI service.";
  }
};

export const updateContextWithPDF = async (pdfText: string) => {
  customContext = pdfText;
  // Re-initialize to inject new context into system instruction
  await initializeChat();
};

// Initialize on load
updateContextWithPDF("");