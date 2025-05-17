import { useState, useEffect } from 'react';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'system';
  timestamp: string;
  intent?: string;
  entities?: Array<{name: string, value: string}>;
}

// Chave usada para armazenar os chats no localStorage
const CHATS_STORAGE_KEY = 'orumaiv_task_chats';

/**
 * Obtém todos os chats armazenados
 */
export function getAllChats(): Record<string, ChatMessage[]> {
  if (typeof window === 'undefined') return {};
  
  try {
    const storedChats = localStorage.getItem(CHATS_STORAGE_KEY);
    return storedChats ? JSON.parse(storedChats) : {};
  } catch (error) {
    console.error('Erro ao obter chats do localStorage:', error);
    return {};
  }
}

/**
 * Obtém o chat de uma tarefa específica
 * @param taskId ID da tarefa
 */
export function getTaskChat(taskId: string): ChatMessage[] {
  const allChats = getAllChats();
  return allChats[taskId] || [];
}

/**
 * Salva o chat de uma tarefa
 * @param taskId ID da tarefa
 * @param messages Lista de mensagens do chat
 */
export function saveTaskChat(taskId: string, messages: ChatMessage[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    const allChats = getAllChats();
    allChats[taskId] = messages;
    localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(allChats));
  } catch (error) {
    console.error('Erro ao salvar chat no localStorage:', error);
  }
}

/**
 * Apaga o chat de uma tarefa específica
 * @param taskId ID da tarefa
 */
export function clearTaskChat(taskId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const allChats = getAllChats();
    if (allChats[taskId]) {
      delete allChats[taskId];
      localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(allChats));
    }
  } catch (error) {
    console.error('Erro ao apagar chat do localStorage:', error);
  }
}

/**
 * Hook para gerenciar o estado do chat com persistência
 * @param taskId ID da tarefa atual
 */
export function usePersistentChat(initialTaskId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [taskId, setTaskId] = useState<string | null>(initialTaskId);
  
  // Carrega as mensagens do localStorage quando a tarefa muda
  useEffect(() => {
    if (taskId) {
      const savedMessages = getTaskChat(taskId);
      if (savedMessages.length > 0) {
        setMessages(savedMessages);
      } else {
        setMessages([]);
      }
    }
  }, [taskId]);
  
  // Salva as mensagens no localStorage sempre que são atualizadas
  useEffect(() => {
    if (taskId && messages.length > 0) {
      saveTaskChat(taskId, messages);
    }
  }, [messages, taskId]);
  
  // Função para atualizar mensagens com persistência
  const updateMessages = (newMessages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {
    setMessages(newMessages);
    
    // Se for uma função, precisamos executá-la para obter o novo valor
    if (typeof newMessages === 'function') {
      const computedMessages = newMessages(messages);
      if (taskId) {
        saveTaskChat(taskId, computedMessages);
      }
    } else if (taskId) {
      saveTaskChat(taskId, newMessages);
    }
  };
  
  // Função para limpar o chat atual
  const clearChat = () => {
    if (taskId) {
      clearTaskChat(taskId);
      setMessages([]);
    }
  };
  
  return {
    messages,
    setMessages: updateMessages,
    taskId,
    setTaskId,
    clearChat
  };
} 