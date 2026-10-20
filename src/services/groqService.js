import { SYSTEM_PROMPT } from "../config/rpgconfig.js";

const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-oss-120b";

const getApiKey = () => {
  // Atenção: qualquer variável VITE_* é incluída no bundle do navegador.
  const apiKey = import.meta.env.VITE_GROQ_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "A chave da Groq não foi configurada. Defina VITE_GROQ_API_KEY no arquivo .env e reinicie o Vite.",
    );
  }
  return apiKey;
};

const getMessageContent = (message) => {
  if (typeof message?.content === "string") return message.content.trim();
  if (Array.isArray(message?.content)) {
    return message.content
      .filter((part) => part.type === "text" && typeof part.text === "string")
      .map((part) => part.text)
      .join("")
      .trim();
  }
  return "";
};

const requestChatCompletion = async (messages) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: import.meta.env.VITE_GROQ_MODEL?.trim() || DEFAULT_MODEL,
      messages,
      temperature: 0.8,
    }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const providerMessage = payload?.error?.message;
    if (
      response.status === 404 &&
      providerMessage?.includes("does not exist or you do not have access")
    ) {
      throw new Error(
        `${providerMessage} Confira VITE_GROQ_MODEL e escolha um modelo habilitado para sua conta no Groq Console. Depois, reinicie o Vite.`,
      );
    }
    throw new Error(
      providerMessage ||
        `A API da Groq respondeu com o status ${response.status}.`,
    );
  }

  const content = getMessageContent(payload?.choices?.[0]?.message);
  if (!content) throw new Error("A API da Groq retornou uma resposta vazia.");
  return content;
};

const normalizeChatHistory = (history = []) =>
  history
    .map((message) => {
      const legacyParts = message.parts;
      const content =
        (typeof message.content === "string" && message.content) ||
        (typeof legacyParts?.text === "string" && legacyParts.text) ||
        (typeof legacyParts?.[0]?.text === "string" && legacyParts[0].text) ||
        (typeof message.text === "string" && message.text) ||
        "";
      const role =
        message.role === "assistant" || message.role === "model"
          ? "assistant"
          : "user";

      return { role, content: content.trim() };
    })
    .filter((message) => message.content);

export const startGame = () =>
  requestChatCompletion([
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: "Comece o jogo e descreva o cenário inicial.",
    },
  ]);

export const continueGame = (history) => {
  const messages = normalizeChatHistory(history);
  if (messages.length === 0 || messages.at(-1).role !== "user") {
    throw new Error("O histórico precisa terminar com uma ação do jogador.");
  }

  return requestChatCompletion([
    { role: "system", content: SYSTEM_PROMPT },
    ...messages,
  ]);
};
