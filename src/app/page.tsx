'use client'

import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import TaskBoard from './components/TaskBoard'
import ChatSidebar from './components/ChatSidebar'
import type { Task } from './components/TaskBoard'
import { syncTasksFromFrontend } from '@/lib/db/tasks'

// Tarefas iniciais definidas aqui para garantir consistência
const initialTasks: Task[] = [
  { 
    id: '1',
    text: "Praticar 30 minutos de yoga",
    description: "Seguir a rotina de yoga matinal para melhorar flexibilidade e foco",
    tag: "Saúde",
    emoji: "🧘‍♀️",
    time: "07h30",
    dueDate: new Date().toISOString(),
    priority: "medium",
    section: "hoje",
    checked: false 
  },
  { 
    id: '2',
    text: "Consulta no dentista",
    description: "Checkup semestral e limpeza",
    tag: "Compromissos",
    emoji: "🦷",
    time: "10h00",
    dueDate: new Date().toISOString(),
    priority: "high",
    section: "hoje",
    checked: false 
  },
  { 
    id: '3',
    text: "Comprar pão",
    description: "Passar na padaria do bairro",
    tag: "Lista de compras",
    emoji: "🥖",
    time: "",
    dueDate: new Date().toISOString(),
    priority: "low",
    section: "hoje",
    checked: false 
  },
  { 
    id: '4',
    text: "Planejar sessões de pesquisas do usuário",
    description: "Preparar roteiro e selecionar participantes para as entrevistas",
    tag: "Reuniões do dia",
    emoji: "👥",
    time: "15h00",
    dueDate: new Date().toISOString(),
    priority: "high",
    section: "equipe",
    checked: false 
  }
];

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Sincroniza tarefas no localStorage
  useEffect(() => {
    // Tenta carregar tarefas do localStorage
    try {
      const savedTasks = localStorage.getItem('tasks');
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
    } catch (error) {
      console.error('Erro ao carregar tarefas do localStorage:', error);
    }
  }, []);
  
  useEffect(() => {
    // Salva tarefas no localStorage quando elas são atualizadas
    try {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Erro ao salvar tarefas no localStorage:', error);
    }
  }, [tasks]);
  
  // Quando uma tarefa é atualizada, atualiza o estado e as tarefas
  const handleTasksUpdate = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    
    // Envie tarefas para o servidor se integração estiver ativa
    syncTasksFromFrontend(updatedTasks);
  }
  
  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
    setIsChatOpen(true);
  }
  
  const handleCloseChatSidebar = () => {
    setIsChatOpen(false);
  }
  
  return (
    <main className="flex min-h-screen min-w-[800px]">
      <Sidebar />
      
      <TaskBoard 
        onTaskClick={handleTaskSelect}
        onTasksUpdate={handleTasksUpdate}
        initialTasks={tasks}
      />
      
      <ChatSidebar 
        selectedTask={selectedTask}
        isOpen={isChatOpen} 
        onClose={handleCloseChatSidebar}
      />
    </main>
  )
} 