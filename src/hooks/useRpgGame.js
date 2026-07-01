import { useState, useEffect } from 'react';
import { start_RPG_master, send_player_choice } from '../services/geminiService.js';

export function useRpgGame() {
  const [history, setHistory] = useState(() => {
    const savedHistory = localStorage.getItem('rpg_history_save');
    if (savedHistory) {
      const parsed = JSON.parse(savedHistory);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    return [];
  });
  
  const [userMessage, setUserMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    if (history && history.length > 0) {
      localStorage.setItem('rpg_history_save', JSON.stringify(history));
    }
  }, [history]);

  useEffect(() => {
    async function initializeRPGMaster() {
      // Se já houver histórico, cancela a chamada inicial para economizar requisições
      if (history.length > 0) return;

      setIsLoading(true);
      setApiError(null);
      try {
        const initialText = await start_RPG_master();
        setHistory([{ role: 'model', parts: { text: initialText } }]);
      } catch (error) {
        console.error('Error initializing RPG Master:', error);
        setApiError('The realm is unavailable right now. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    initializeRPGMaster();
  }, [history.length]);

  const sendPlayerAction = async (targetAction) => {
    const isEvent = targetAction && typeof targetAction.preventDefault === 'function';
    if (isEvent) targetAction.preventDefault();

    const finalMessage = isEvent ? userMessage : targetAction;
    if (!finalMessage || !finalMessage.trim() || isLoading) return;

    setUserMessage(''); 
    setIsLoading(true);
    setApiError(null);

    const newUserMessageObj = { role: 'user', parts: { text: finalMessage } };
    const updatedHistoryWithUser = [...history, newUserMessageObj];
    setHistory(updatedHistoryWithUser);

    try {
      const nextMasterResponse = await send_player_choice(updatedHistoryWithUser, finalMessage);

      setHistory([
        ...updatedHistoryWithUser,
        { role: 'model', parts: { text: nextMasterResponse } }
      ]);
    } catch (error) {
      console.error('Error sending message to RPG Master:', error);
      setApiError('The connection failed. Try sending your action again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetGame = () => {
    localStorage.removeItem('rpg_history_save');
    setHistory([]);
    window.location.reload(); 
  };

  return {
    history,
    userMessage,
    setUserMessage,
    isLoading,
    apiError,
    sendPlayerAction,
    resetGame
  };
}
