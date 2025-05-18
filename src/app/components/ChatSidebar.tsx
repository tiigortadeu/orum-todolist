'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Task } from './TaskBoard'
import { usePersistentChat, ChatMessage } from '../../lib/db/chats'
import DashboardViewer from './DashboardViewer'

interface ChatSidebarProps {
  isOpen: boolean
  selectedTask: Task | null
  onClose: () => void
  onTaskUpdated?: (task: Task) => void
}

export default function ChatSidebar({ 
  isOpen, 
  selectedTask, 
  onClose,
  onTaskUpdated 
}: ChatSidebarProps) {
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasWelcomeMessage, setHasWelcomeMessage] = useState<Record<string, boolean>>({})
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const chatSidebarRef = useRef<HTMLDivElement>(null)
  const [currentDashboard, setCurrentDashboard] = useState<any>(null)  // Estado para armazenar o dashboard atual
  
  // Usar o hook de persistência de chat
  const { messages, setMessages, taskId, setTaskId, clearChat } = usePersistentChat(
    selectedTask?.id || null
  )

  // Efeito para adicionar listener de clique fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && chatSidebarRef.current && !chatSidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Adiciona o event listener apenas quando o chat estiver aberto
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Função para rolar para o final do chat
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  }

  // Efeito para atualizar o ID da tarefa quando uma nova tarefa é selecionada
  useEffect(() => {
    if (selectedTask && selectedTask.id !== taskId) {
      setTaskId(selectedTask.id)
    }
  }, [selectedTask, taskId, setTaskId])

  // Efeito para enviar mensagem de boas-vindas se for a primeira vez que abrimos uma tarefa
  useEffect(() => {
    if (selectedTask && taskId && messages.length === 0 && !hasWelcomeMessage[taskId]) {
      sendWelcomeMessage()
      setHasWelcomeMessage(prev => ({ ...prev, [taskId]: true }))
    }
  }, [selectedTask, taskId, messages.length, hasWelcomeMessage])

  // Efeito para rolar para o final quando as mensagens mudam ou o painel é aberto
  useEffect(() => {
    if (isOpen) {
      // Timeout um pouco maior para garantir que o DOM foi completamente atualizado
      setTimeout(scrollToBottom, 150);
    }
  }, [messages, isOpen]);

  // Função para enviar a mensagem automática de boas-vindas
  const sendWelcomeMessage = async () => {
    if (!selectedTask) return
    
    setIsLoading(true)

    try {
      // Envia para a API de agentes uma mensagem automática
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `welcome_auto_message:${selectedTask.text}`,
          taskId: selectedTask?.id,
          userId: 'user1', // Em produção, usar ID real do usuário
          isAutoWelcome: true // Indica que é uma mensagem de boas-vindas
        }),
      })

      if (!response.ok) {
        throw new Error('Erro na comunicação com o serviço')
      }

      const data = await response.json()
      
      // Adiciona a resposta inicial do sistema
      const botMessage: ChatMessage = {
        id: data.id,
        text: data.text,
        sender: 'system',
        timestamp: data.timestamp,
        intent: data.intent,
        entities: data.entities,
        dashboardResult: data.dashboardResult // Adiciona dashboardResult se houver
      }

      setMessages([botMessage])
      
      // Verifica se há um dashboard na resposta
      if (data.dashboardResult) {
        setCurrentDashboard(data.dashboardResult)
      }
      
      // Rolar para o final após adicionar a mensagem de boas-vindas
      setTimeout(scrollToBottom, 150)
      
      // Se a tarefa foi atualizada, notifica o componente pai
      if (data.taskUpdated && onTaskUpdated && data.taskData) {
        onTaskUpdated({
          ...selectedTask,
          ...data.taskData
        })
      }
    } catch (error) {
      console.error('Erro ao processar mensagem inicial:', error)
      
      // Adiciona mensagem de erro
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        text: 'Olá! Estou aqui para ajudar com suas tarefas.',
        sender: 'system',
        timestamp: new Date().toISOString()
      }
      
      setMessages([errorMessage])
      
      // Rolar para o final após adicionar a mensagem de erro
      setTimeout(scrollToBottom, 150)
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    // Adiciona a mensagem do usuário à UI
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setNewMessage('')
    setIsLoading(true)
    
    // Rolar para o final após adicionar a mensagem do usuário
    setTimeout(scrollToBottom, 150)

    try {
      // Envia para a API de agentes
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: newMessage,
          taskId: selectedTask?.id,
          userId: 'user1' // Em produção, usar ID real do usuário
        }),
      })

      if (!response.ok) {
        throw new Error('Erro na comunicação com o serviço')
      }

      const data = await response.json()
      
      // Adiciona a resposta do sistema
      const botMessage: ChatMessage = {
        id: data.id,
        text: data.text,
        sender: 'system',
        timestamp: data.timestamp,
        intent: data.intent,
        entities: data.entities,
        dashboardResult: data.dashboardResult // Adiciona dashboardResult se houver
      }

      setMessages(prev => [...prev, botMessage])
      
      // Verifica se há um dashboard na resposta
      if (data.dashboardResult) {
        setCurrentDashboard(data.dashboardResult)
      }
      
      // Rolar para o final após adicionar a resposta do sistema
      setTimeout(scrollToBottom, 150)
      
      // Se a tarefa foi atualizada, notifica o componente pai
      if (data.taskUpdated && onTaskUpdated && data.taskData) {
        onTaskUpdated({
          ...selectedTask!,
          ...data.taskData
        })
      }
    } catch (error) {
      console.error('Erro ao processar mensagem:', error)
      
      // Adiciona mensagem de erro
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        text: 'Desculpe, tive um problema ao processar sua mensagem. Por favor, tente novamente.',
        sender: 'system',
        timestamp: new Date().toISOString()
      }
      
      setMessages(prev => [...prev, errorMessage])
      // Rolar para o final após adicionar a mensagem de erro
      setTimeout(scrollToBottom, 150)
    } finally {
      setIsLoading(false)
    }
  }

  // Função para limpar o chat atual
  const handleClearChat = () => {
    if (window.confirm('Tem certeza que deseja finalizar este chat? Todo o histórico será perdido.')) {
      clearChat()
      setCurrentDashboard(null) // Limpa o dashboard atual
      setHasWelcomeMessage(prev => {
        const newState = { ...prev }
        if (taskId) delete newState[taskId]
        return newState
      })
    }
  }

  // Renderiza mensagens com suporte a Markdown
  const renderMessageContent = (text: string, sender: 'user' | 'system', dashboardResult: any = null) => {
    if (sender === 'user') {
      return <p className="text-sm whitespace-pre-wrap">{text}</p>;
    } else {
      return (
        <div className="markdown-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {text}
          </ReactMarkdown>
          
          {/* Renderiza o dashboard se existir */}
          {dashboardResult && (
            <div className="mt-4">
              <DashboardViewer dashboardResult={dashboardResult} />
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && selectedTask && (
        <motion.aside
          ref={chatSidebarRef}
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-[600px] h-screen bg-white/90 backdrop-blur-sm border-l border-gray-200 flex flex-col fixed right-0 top-0"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Detalhes da Tarefa</h2>
              <div className="flex gap-2">
                <button 
                  onClick={handleClearChat}
                  title="Finalizar Chat"
                  className="text-gray-400 hover:text-red-500 p-2 rounded-lg transition-colors"
                >
                  <span className="material-icons">delete</span>
                </button>
                <button 
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg transition-colors"
                >
                  <span className="material-icons">close</span>
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-medium text-gray-700">{selectedTask.text}</h3>
              <p className="text-sm text-gray-500">{selectedTask.description}</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="material-icons text-gray-400 text-base">schedule</span>
                <span className="text-gray-600">{selectedTask.time || 'Sem horário definido'}</span>
              </div>
              {selectedTask.tag && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="material-icons text-gray-400 text-base">label</span>
                  <span className="text-gray-600">{selectedTask.emoji} {selectedTask.tag}</span>
                </div>
              )}
            </div>
          </div>

          {/* Dashboard fixo (se existir) */}
          {currentDashboard && (
            <div className="border-b border-gray-200 p-4">
              <DashboardViewer dashboardResult={currentDashboard} />
            </div>
          )}

          {/* Messages */}
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {messages.length === 0 && !isLoading && (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400 text-center">
                  Nenhuma mensagem ainda. Comece a conversar!
                </p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[90%] rounded-lg p-4 ${
                    message.sender === 'user'
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {renderMessageContent(message.text, message.sender, message.dashboardResult)}
                  <span className="text-xs opacity-70 mt-2 block">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-4 max-w-[90%]">
                  <div className="flex space-x-2 items-center">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Message Input */}
          <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                disabled={isLoading}
                rows={3}
                className="w-full px-4 py-3 bg-gray-100 border border-transparent rounded-lg text-sm focus:outline-none focus:border-gray-300 disabled:opacity-70 resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (newMessage.trim()) sendMessage(e);
                  }
                }}
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Pressione Enter para enviar, Shift+Enter para nova linha</span>
                <button
                  type="submit"
                  disabled={!newMessage.trim() || isLoading}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                >
                  Enviar
                </button>
              </div>
            </div>
          </form>
        </motion.aside>
      )}
    </AnimatePresence>
  )
} 