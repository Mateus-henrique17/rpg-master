import { SYSTEM_PROMPT } from "../config/rpgconfig.js";

const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-oss-120b";
const REQUEST_TIMEOUT_MS = 30_000;

export class GameApiError extends Error {
  constructor(
    message,
    { code = "UNKNOWN_ERROR", status = 0, retryAfterSeconds = 0 } = {},
  ) {
    super(message);
    this.name = "GameApiError";
    this.code = code;
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

const parseRetryAfter = (headers) => {
  const seconds = Number(headers?.get("retry-after"));
  if (Number.isFinite(seconds) && seconds > 0) return Math.ceil(seconds);

  const resetTime = headers?.get("x-ratelimit-reset-requests");
  if (!resetTime) return 0;

  const duration = resetTime.match(/^(\d+(?:\.\d+)?)(ms|s|m|h)$/);
  if (!duration) return 0;

  const multipliers = { ms: 0.001, s: 1, m: 60, h: 3600 };
  return Math.ceil(Number(duration[1]) * multipliers[duration[2]]);
};

const createProviderError = (payload, status, headers) => {
  const providerError = payload?.error;
  const providerMessage = providerError?.message;
  const retryAfterSeconds =
    parseRetryAfter(headers) || (status === 429 ? 60 : 0);
  let code = providerError?.code || "PROVIDER_ERROR";
  let message =
    "Não foi possível conversar com o Mestre. Tente novamente em instantes.";

  if (status === 401 || status === 403) {
    code = "INVALID_API_KEY";
    message = "A chave da Groq foi recusada. Confira VITE_GROQ_API_KEY.";
  } else if (status === 404) {
    code = "MODEL_UNAVAILABLE";
    message =
      `O modelo não está disponível. Confira VITE_GROQ_MODEL. ${providerMessage || ""}`.trim();
  } else if (status === 429) {
    code = "RATE_LIMITED";
    message =
      "A Groq limitou temporariamente as solicitações. Aguarde antes de tentar novamente.";
  } else if (status >= 500) {
    code = "PROVIDER_UNAVAILABLE";
    message =
      "A Groq está temporariamente indisponível. Tente novamente em instantes.";
  } else if (providerMessage) {
    message = providerMessage;
  }

  return new GameApiError(message, { code, status, retryAfterSeconds });
};

const requestChatCompletion = async (messages) => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY?.trim();
  if (!apiKey || apiKey.startsWith("cole_sua_chave")) {
    throw new GameApiError(
      "Configure VITE_GROQ_API_KEY no arquivo .env e reinicie o Vite para habilitar a aventura.",
      { code: "MISSING_API_KEY" },
    );
  }

  let response;
  try {
    response = await fetch(API_URL, {
      method: "POST",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: import.meta.env.VITE_GROQ_MODEL?.trim() || DEFAULT_MODEL,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        temperature: 0.8,
      }),
    });
  } catch (error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      throw new GameApiError(
        "A resposta da Groq demorou demais. Tente novamente.",
        {
          code: "REQUEST_TIMEOUT",
        },
      );
    }
    throw new GameApiError(
      "Não foi possível conectar à Groq. Verifique sua conexão e tente novamente.",
      { code: "NETWORK_ERROR" },
    );
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw createProviderError(payload, response.status, response.headers);
  }

  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new GameApiError(
      "O Mestre não retornou uma resposta válida. Tente novamente.",
      { code: "EMPTY_RESPONSE", status: 502 },
    );
  }
  return content.trim();
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
    { role: "user", content: "Comece o jogo e descreva o cenário inicial." },
  ]);

export const continueGame = (history) => {
  const messages = normalizeChatHistory(history);
  if (messages.length === 0 || messages.at(-1).role !== "user") {
    throw new GameApiError(
      "O histórico precisa terminar com uma ação do jogador.",
      { code: "INVALID_HISTORY", status: 400 },
    );
  }
  return requestChatCompletion(messages);
};
