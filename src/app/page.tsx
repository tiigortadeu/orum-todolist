'use client'

import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import TaskBoard from './components/TaskBoard'
import ChatSidebar from './components/ChatSidebar'
import type { Task } from './components/TaskBoard'
import { syncTasksFromFrontend } from '@/lib/db/tasks'

// Tarefas iniciais definidas aqui para garantir consistência
const initialTasks = [
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
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [tasks, setTasks] = useState<Task[]>(initialTasks)

  // Sincroniza as tarefas iniciais com o banco de dados em memória quando o componente monta
  useEffect(() => {
    // Inicializa o banco de dados em memória uma única vez na montagem
    syncTasksFromFrontend(initialTasks);
    console.log("Tarefas iniciais sincronizadas com o banco de dados em memória:", initialTasks);
  }, []);

  // Recebe tarefas do componente TaskBoard
  const handleTasksUpdate = (updatedTasks: Task[]) => {
    setTasks(updatedTasks)
    
    // Sincroniza tarefas com o armazenamento local para os agentes
    syncTasksFromFrontend(updatedTasks)
    console.log("Tarefas atualizadas sincronizadas com o banco de dados em memória:", updatedTasks);
  }

  // Atualiza uma tarefa específica (quando alterada pelo chat)
  const handleTaskUpdate = (updatedTask: Task) => {
    const updatedTasks = tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    );
    
    setTasks(updatedTasks);
    
    // Sincroniza com o armazenamento em memória após atualizar
    syncTasksFromFrontend(updatedTasks);
    
    // Atualiza a tarefa selecionada, se for a mesma
    if (selectedTask && selectedTask.id === updatedTask.id) {
      setSelectedTask(updatedTask)
    }
    
    console.log("Tarefa atualizada:", updatedTask);
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setIsChatOpen(true)
  }

  const handleChatClose = () => {
    setIsChatOpen(false)
    setSelectedTask(null)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <TaskBoard 
          onTaskClick={handleTaskClick} 
          onTasksUpdate={handleTasksUpdate}
          initialTasks={tasks}
        />
      </main>
      <ChatSidebar 
        isOpen={isChatOpen}
        selectedTask={selectedTask}
        onClose={handleChatClose}
        onTaskUpdated={handleTaskUpdate}
      />
    </div>
  )
} 