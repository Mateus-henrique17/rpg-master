import { useCallback, useEffect, useRef, useState } from "react";
import { continueGame, startGame } from "../services/groqService.js";

const STORAGE_KEY = "rpg_history_save";

const normalizeStoredHistory = (history) => {
  if (!Array.isArray(history)) return [];

  return history
    .map((message) => {
      const content =
        (typeof message?.content === "string" && message.content) ||
        (typeof message?.parts?.text === "string" && message.parts.text) ||
        (typeof message?.parts?.[0]?.text === "string" &&
          message.parts[0].text) ||
        "";
      const role =
        message?.role === "assistant" || message?.role === "model"
          ? "assistant"
          : "user";

      return { role, content: content.trim() };
    })
    .filter((message) => message.content);
};

const loadSavedHistory = () => {
  try {
    const savedHistory = localStorage.getItem(STORAGE_KEY);
    return savedHistory ? normalizeStoredHistory(JSON.parse(savedHistory)) : [];
  } catch {
    return [];
  }
};

export function useRpgGame() {
  const [history, setHistory] = useState(loadSavedHistory);
  const [userMessage, setUserMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const requestInProgress = useRef(false);
  const pendingAction = useRef(null);

  useEffect(() => {
    try {
      if (history.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error("Não foi possível salvar o progresso do jogo:", error);
    }
  }, [history]);

  const initializeGame = useCallback(async () => {
    if (requestInProgress.current) return;

    pendingAction.current = null;
    requestInProgress.current = true;
    setIsLoading(true);
    setApiError(null);
    try {
      const openingScene = await startGame();
      setHistory([{ role: "assistant", content: openingScene }]);
    } catch (error) {
      console.error("Erro ao iniciar o jogo:", error);
      setApiError(error.message || "Não foi possível iniciar a aventura.");
    } finally {
      requestInProgress.current = false;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (history.length > 0) return undefined;

    const initializationTimer = window.setTimeout(initializeGame, 0);
    return () => window.clearTimeout(initializationTimer);
  }, [history.length, initializeGame]);

  const sendPlayerAction = async (targetAction) => {
    const action = typeof targetAction === "string" ? targetAction.trim() : "";
    if (!action || requestInProgress.current) return;

    pendingAction.current = action;
    requestInProgress.current = true;
    setUserMessage("");
    setIsLoading(true);
    setApiError(null);

    const updatedHistory = [...history, { role: "user", content: action }];
    setHistory(updatedHistory);

    try {
      const nextScene = await continueGame(updatedHistory);
      setHistory([
        ...updatedHistory,
        { role: "assistant", content: nextScene },
      ]);
      pendingAction.current = null;
    } catch (error) {
      console.error("Erro ao enviar a ação do jogador:", error);
      setHistory(history);
      setUserMessage(action);
      setApiError(error.message || "Não foi possível enviar sua ação.");
    } finally {
      requestInProgress.current = false;
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    sendPlayerAction(userMessage);
  };

  const retryLastAction = () => {
    if (pendingAction.current) sendPlayerAction(pendingAction.current);
    else if (history.length === 0) initializeGame();
  };

  const resetGame = () => {
    pendingAction.current = null;
    setHistory([]);
    setUserMessage("");
    setApiError(null);
  };

  return {
    history,
    userMessage,
    setUserMessage,
    isLoading,
    apiError,
    initializeGame,
    handleFormSubmit,
    retryLastAction,
    sendPlayerAction,
    resetGame,
  };
}
