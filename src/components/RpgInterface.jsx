import { useEffect, useRef } from "react";
import { useRpgGame } from "../hooks/useRpgGame.js";
import "./RpgInterface.css";

export default function RpgInterface() {
  const {
    history,
    userMessage,
    setUserMessage,
    isLoading,
    apiError,
    handleFormSubmit,
    retryLastAction,
    sendPlayerAction,
    resetGame,
  } = useRpgGame();

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "end",
    });
  }, [history]);

  // Determina se o mestre respondeu e extrai as opções disponíveis.
  const lastMessage = history[history.length - 1];
  const isMasterTurn = lastMessage?.role === "assistant";
  const masterText = isMasterTurn ? lastMessage.content : "";

  const parseOptions = (text) => {
    if (!text) return [];
    const lines = text.split("\n");
    return lines
      .map((line) => line.trim())
      .filter((line) => /^[A-D][).]/i.test(line));
  };

  const availableOptions = parseOptions(masterText);

  return (
    <section className="rpg-container" aria-label="Mesa de jogo">
      {/* BARRA DE FERRAMENTAS DO JOGO COM O BOTÃO DE RESET */}
      <header className="rpg-toolbar">
        <span className="game-status" role="status" aria-live="polite">
          {isLoading
            ? "● A história está se desenrolando..."
            : "● Aventura ativa"}
        </span>
        {history.length > 0 && (
          <button
            onClick={resetGame}
            disabled={isLoading}
            className="reset-button"
            title="Começar uma nova aventura"
          >
            Novo jogo
          </button>
        )}
      </header>

      {/* 1. MESSAGES HISTORY LOG */}
      <div
        className="chat-log"
        role="log"
        aria-label="Histórico da aventura"
        aria-live="polite"
        aria-relevant="additions"
      >
        {history.map((chat, index) => {
          const isMaster = chat.role === "assistant";
          return (
            <div
              key={index}
              className={`message-wrapper ${isMaster ? "master-turn" : "player-turn"}`}
            >
              <span className="character-label">
                {isMaster ? "🔮 Mestre" : "🛡️ Jogador"}
              </span>

              <div className="message-card">{chat.content}</div>
            </div>
          );
        })}

        {/* LOADING INDICATOR */}
        {isLoading && (
          <div className="loading-wrapper">
            <span className="loading-label">
              🔮 O Mestre está tecendo seu destino...
            </span>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={bottomRef} aria-hidden="true" />
      </div>

      {/* ERROR CONTAINER */}
      {apiError && (
        <div className="error-container" role="alert">
          <p className="error-message">{apiError}</p>
          <button
            type="button"
            onClick={retryLastAction}
            className="retry-button"
          >
            {history.length === 0 ? "Invocar o Mestre" : "Tentar novamente"}
          </button>
        </div>
      )}

      {/* 2. DYNAMIC QUICK CHOICE BUTTONS */}
      {!isLoading && availableOptions.length > 0 && (
        <div
          className="quick-choices-container"
          role="group"
          aria-label="Ações disponíveis"
        >
          {availableOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => sendPlayerAction(option)}
              className="choice-button"
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {/* 3. PLAYER INPUT FORM */}
      <form onSubmit={handleFormSubmit} className="input-form">
        <input
          type="text"
          aria-label="Sua ação para o Mestre"
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          disabled={isLoading}
          placeholder={isLoading ? "Aguarde o Mestre..." : "Digite sua ação..."}
          className="text-input"
        />
        <button
          type="submit"
          disabled={isLoading || !userMessage.trim()}
          className="submit-button"
        >
          Enviar
        </button>
      </form>
    </section>
  );
}
