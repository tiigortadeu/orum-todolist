/**
 * Módulo para gerenciamento de mensagens.
 * Implementação inicial com armazenamento em memória.
 */

// Armazenamento em memória para mensagens
interface Message {
  id: string;
  userId: string;
  taskId: string | null;
  content: string;
  sender: 'user' | 'system';
  timestamp: Date;
  metadata?: any;
}

// Mensagens armazenadas por conversação (userId + taskId)
const messageStore: Record<string, Message[]> = {};

/**
 * Gera uma chave única para identificar uma conversação
 */
function getConversationKey(userId: string, taskId: string | null): string {
  return `${userId}:${taskId || 'global'}`;
}

/**
 * Salva uma mensagem no armazenamento
 */
export async function saveMessage(message: Omit<Message, 'id'>): Promise<Message> {
  try {
    const { userId, taskId, content, sender, timestamp, metadata } = message;
    
    const key = getConversationKey(userId, taskId);
    
    // Cria o array de mensagens se não existir
    if (!messageStore[key]) {
      messageStore[key] = [];
    }
    
    // Cria nova mensagem com ID
    const newMessage: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      taskId,
      content,
      sender,
      timestamp,
      metadata
    };
    
    // Adiciona ao armazenamento
    messageStore[key].push(newMessage);
    
    return newMessage;
  } catch (error) {
    console.error('Erro ao salvar mensagem:', error);
    throw new Error('Falha ao salvar mensagem');
  }
}

/**
 * Obtém o histórico de mensagens para um usuário e tarefa
 */
export async function getMessageHistory(
  userId: string,
  taskId: string | null = null,
  limit: number = 10
): Promise<Message[]> {
  try {
    const key = getConversationKey(userId, taskId);
    
    // Retorna as últimas mensagens
    const messages = messageStore[key] || [];
    
    // Ordena por timestamp e limita a quantidade
    return [...messages]
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .slice(-limit);
  } catch (error) {
    console.error('Erro ao obter histórico de mensagens:', error);
    return [];
  }
}

/**
 * Limpa o histórico de mensagens de uma conversação
 */
export async function clearMessageHistory(
  userId: string,
  taskId: string | null = null
): Promise<void> {
  try {
    const key = getConversationKey(userId, taskId);
    messageStore[key] = [];
  } catch (error) {
    console.error('Erro ao limpar histórico de mensagens:', error);
    throw new Error('Falha ao limpar histórico de mensagens');
  }
}

/**
 * Obtém mensagens recentes para contexto
 */
export async function getRecentMessagesForContext(
  userId: string,
  taskId: string | null = null,
  count: number = 5
): Promise<Array<{user?: string, bot?: string}>> {
  try {
    const messages = await getMessageHistory(userId, taskId);
    
    // Formata as mensagens para o formato esperado pelo contexto
    const formattedMessages: Array<{user?: string, bot?: string}> = [];
    
    // Processa as mensagens em pares (usuário -> bot)
    for (let i = 0; i < messages.length; i += 2) {
      const userMessage = messages[i]?.sender === 'user' ? messages[i] : null;
      const botMessage = messages[i + 1]?.sender === 'system' ? messages[i + 1] : null;
      
      const pair: {user?: string, bot?: string} = {};
      
      if (userMessage) {
        pair.user = userMessage.content;
      }
      
      if (botMessage) {
        pair.bot = botMessage.content;
      }
      
      if (Object.keys(pair).length > 0) {
        formattedMessages.push(pair);
      }
    }
    
    // Retorna apenas os últimos 'count' pares
    return formattedMessages.slice(-count);
  } catch (error) {
    console.error('Erro ao obter mensagens recentes para contexto:', error);
    return [];
  }
} 