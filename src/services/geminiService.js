import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_INSTRUCTION } from "../config/rpgconfig.js";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("VITE_GEMINI_API_KEY não foi definida.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");
const MODEL_NAME = "gemini-2.5-flash";

// Inicia o Mestre trazendo o primeiro cenário do RPG
export const start_RPG_master = async () => {
  try {
    if (!apiKey) {
      throw new Error("A chave da API do Gemini não está configurada.");
    }

    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: SYSTEM_INSTRUCTION, 
    });

    const response = await model.generateContent({
      contents: [{ parts: [{ text: "Start the game and describe the initial scenario." }] }],
      generationConfig: {
        temperature: 0.7,
      },
    });

    const textOutput = response.response.text();

    if (!textOutput)
      throw new Error("A API respondeu, mas o formato do texto veio inválido.");
    return textOutput;
  } catch (error) {
    console.error("Erro ao iniciar o RPG Master:", error);
    throw error;
  }
};

export const send_player_choice = async (history, message) => {
  try {
    if (!apiKey) {
      throw new Error("A chave da API do Gemini não está configurada.");
    }

    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    // Formata o histórico limpando estruturas antigas
    const formattedHistory = history.map((msg) => {
      const textFromParts =
        typeof msg.parts?.text === "string"
          ? msg.parts.text
          : typeof msg.parts?.[0]?.text === "string"
            ? msg.parts[0].text
            : typeof msg.text === "string"
              ? msg.text
              : "";

      return {
        role: msg.role === "model" || msg.role === "assistant" ? "model" : "user",
        parts: [{ text: textFromParts }],
      };
    });

    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        temperature: 0.7,
      },
    });

    const prompt = typeof message === "string" ? message : String(message ?? "");

    const result = await chat.sendMessage(prompt);
    const textOutput = result.response.text();

    if (!textOutput) {
      throw new Error("A API respondeu o jogador, mas o texto veio vazio.");
    }

    return textOutput;
  } catch (error) {
    console.error("Erro ao enviar jogada:", error);
    throw error;
  }
};
