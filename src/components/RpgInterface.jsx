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
    initializeRPGMaster,
    sendPlayerAction,
    resetGame,
  } = useRpgGame();

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  // Logica para determinar se é a vez do mestre e extrair as opções disponíveis
  const lastMessage = history[history.length - 1];
  const isMasterTurn = lastMessage?.role === "model";
  const masterText = isMasterTurn ? lastMessage.parts.text : "";

  const parseOptions = (text) => {
    if (!text) return [];
    const lines = text.split("\n");
    return lines
      .map((line) => line.trim())
      .filter((line) => /^\d+[\s.)]/.test(line));
  };

  const availableOptions = parseOptions(masterText);

  return (
    <div className="rpg-container">
      {/* BARRA DE FERRAMENTAS DO JOGO COM O BOTÃO DE RESET */}
      <div className="rpg-toolbar">
        <span className="game-status">
          {isLoading ? "● Story unfolding..." : "● Game active"}
        </span>
        {history.length > 0 && (
          <button
            onClick={resetGame}
            className="reset-button"
            title="Start a new adventure"
          >
            New Game
          </button>
        )}
      </div>

      {/* 1. MESSAGES HISTORY LOG */}
      <div className="chat-log">
        {history.map((chat, index) => {
          const isMaster = chat.role === "model";
          return (
            <div
              key={index}
              className={`message-wrapper ${isMaster ? "master-turn" : "player-turn"}`}
            >
              <span className="character-label">
                {isMaster ? "🔮 Master" : "🛡️ Player"}
              </span>

              <div className="message-card">{chat.parts.text}</div>
            </div>
          );
        })}

        {/* LOADING INDICATOR */}
        {isLoading && (
          <div className="loading-wrapper">
            <span className="loading-label">
              🔮 Master is weaving your destiny...
            </span>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ERROR CONTAINER */}
      {apiError && (
        <div className="error-container">
          <p className="error-message">{apiError}</p>
          <button
            type="button"
            onClick={initializeRPGMaster}
            className="retry-button"
          >
            Awake the Master
          </button>
        </div>
      )}

      {/* 2. DYNAMIC QUICK CHOICE BUTTONS */}
      {!isLoading && availableOptions.length > 0 && (
        <div className="quick-choices-container">
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
      <form onSubmit={sendPlayerAction} className="input-form">
        <input
          type="text"
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          disabled={isLoading}
          placeholder={
            isLoading
              ? "Wait for the Master..."
              : "Type your customized action..."
          }
          className="text-input"
        />
        <button
          type="submit"
          disabled={isLoading || !userMessage.trim()}
          className="submit-button"
        >
          Send
        </button>
      </form>
    </div>
  );
}
