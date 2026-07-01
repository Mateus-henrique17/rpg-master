import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../config/rpgConfig.js";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const MODEL_NAME = "gemini-2.5-flash";

// Inicia o Mestre trazendo o primeiro cenário do RPG
export const start_RPG_master = async () => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME, 
      contents: [
        { parts: [{ text: "Start the game and describe the initial scenario." }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION, 
        temperature: 0.7 
      }
    });

    // Garante a extração correta do texto se a propriedade direta falhar
    const textOutput = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textOutput) throw new Error("A API respondeu, mas o formato do texto veio inválido.");
    return textOutput; 
  } catch (error) {
    console.error("Erro ao iniciar o RPG Master:", error);
    throw error;
  }
};

export const send_player_choice = async (history, message) => {
  try {
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'model' || msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.text || msg.parts?.[0]?.text || "" }]
    }));

    const chat = ai.chats.create({
      model: MODEL_NAME,
      history: formattedHistory,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7
      }
    });

    //Envia a string/objeto correto para o sendMessage
    const response = await chat.sendMessage({
      message: [{ parts: [{ text: message }] }]
    });
    
    // Mesma extração segura para o fluxo de conversas
    const textOutput = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textOutput) throw new Error("A API respondeu o jogador, mas o texto veio vazio.");
    return textOutput;
  } catch (error) {
    console.error("Erro ao enviar jogada:", error);
    throw error;
  }
};

