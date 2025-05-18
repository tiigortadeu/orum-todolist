'use client'

import { useState, useEffect, useRef } from 'react'
import Sidebar from './components/Sidebar'
import TaskBoard from './components/TaskBoard'
import ChatSidebar from './components/ChatSidebar'
import DashboardViewer from './components/DashboardViewer'
import type { Task } from './components/TaskBoard'
import { syncTasksFromFrontend } from '@/lib/db/tasks'
import { motion, AnimatePresence } from 'framer-motion'

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
  const [activeView, setActiveView] = useState('tasks');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardResult, setDashboardResult] = useState<any>(null);
  
  // Sincroniza tarefas no localStorage
  useEffect(() => {
    // Tenta carregar tarefas do localStorage
    try {
      const savedTasks = localStorage.getItem('tasks');
      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks);
        setTasks(parsedTasks);
        
        // Sincroniza as tarefas carregadas com o banco de dados do backend
        console.log('Sincronizando tarefas carregadas do localStorage com o backend');
        syncTasksFromFrontend(parsedTasks);
      } else {
        // Se não há tarefas salvas, sincroniza as tarefas iniciais
        console.log('Não há tarefas no localStorage, sincronizando tarefas iniciais');
        
        // Salvar tarefas iniciais no localStorage
        localStorage.setItem('tasks', JSON.stringify(initialTasks));
        
        // Sincronizar com o backend
        syncTasksFromFrontend(initialTasks);
      }
    } catch (error) {
      console.error('Erro ao carregar tarefas do localStorage:', error);
      
      // Em caso de erro, garante que as tarefas padrão serão usadas
      console.log('Usando tarefas padrão devido a erro');
      localStorage.setItem('tasks', JSON.stringify(initialTasks));
      syncTasksFromFrontend(initialTasks);
    }
    
    // Verifica se as tarefas foram sincronizadas corretamente após um curto período
    setTimeout(() => {
      console.log('Verificando sincronização de tarefas após inicialização');
      syncTasksFromFrontend(initialTasks); 
    }, 1000);
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
    
    // Se estamos na visualização de dashboards, recarregue o dashboard
    if (activeView === 'dashboards') {
      // Delay pequeno para permitir que a sincronização termine
      setTimeout(() => {
        console.log('Tarefas atualizadas, regenerando dashboard');
        generateChart();
      }, 500);
    }
    
    // Se todas as tarefas foram excluídas, forçar atualização do dashboard
    if (updatedTasks.length === 0 && activeView === 'dashboards') {
      // Limpar o dashboard atual para evitar mostrar dados antigos
      setDashboardResult(null);
      // Delay maior para garantir que o dashboard seja recriado do zero
      setTimeout(() => {
        console.log('Todas as tarefas foram excluídas, regenerando dashboard do zero');
        generateChart();
      }, 800);
    }
  }
  
  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
    setIsChatOpen(true);
  }
  
  const handleCloseChatSidebar = () => {
    setIsChatOpen(false);
  }
  
  // Efeito para recarregar o dashboard quando mudamos para a visualização de dashboards
  useEffect(() => {
    // Se estamos na visualização de dashboards e temos uma consulta, recarregue o dashboard
    if (activeView === 'dashboards' && searchQuery.trim() && dashboardResult) {
      console.log('Dashboard view activated, regenerating chart with query:', searchQuery);
      generateChart();
    }
  }, [activeView]);
  
  // Efeito para gerar automaticamente o dashboard de tarefas na primeira vez que a página carregar
  useEffect(() => {
    // Gerar automaticamente o dashboard padrão após 1 segundo do carregamento inicial
    const timer = setTimeout(() => {
      if (activeView === 'dashboards' && !dashboardResult) {
        console.log('Gerando dashboard inicial de tarefas por prioridade');
        generateChart();
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Função para gerar gráfico
  const generateChart = async () => {
    // Se não há consulta, usar 'tarefas por prioridade' como padrão
    const query = searchQuery.trim() || 'tarefas por prioridade';
    
    // Garantir que as tarefas estejam sincronizadas antes de gerar o gráfico
    console.log('Forçando sincronização de tarefas antes de gerar o gráfico');
    syncTasksFromFrontend(tasks);
    
    // Pequeno delay para permitir que a sincronização aconteça
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: query,
          userId: 'user1',
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao gerar o dashboard');
      }
      
      const data = await response.json();
      setDashboardResult(data.dashboardResult);
    } catch (error) {
      console.error('Erro ao gerar o dashboard:', error);
      alert('Ocorreu um erro ao gerar o dashboard. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <main className="flex min-h-screen min-w-[800px] bg-white">
      <Sidebar onMenuItemClick={(itemId) => setActiveView(itemId)} />
      
      <div className="flex-1 flex bg-white overflow-hidden">
        {/* Dashboard com animação */}
        <AnimatePresence initial={false}>
          {activeView === 'dashboards' && (
            <motion.div 
              key="dashboard-panel"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "60%", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="border-r border-gray-200 overflow-hidden"
            >
              <div className="p-8 h-full flex flex-col">
                <div className="max-w-xl mx-auto w-full">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-8">Dashboard</h2>
                  
                  <div className="relative flex mb-8">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="O que você quer saber?"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-lg focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            generateChart();
                          }
                        }}
                      />
                      <span className="material-icons absolute left-3 top-3 text-gray-400">search</span>
                    </div>
                    <button
                      className="ml-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center shadow-sm transition-colors"
                      onClick={generateChart}
                      disabled={isLoading}
                    >
                      <span className="material-icons mr-1">bar_chart</span>
                      {isLoading ? 'Gerando...' : 'Gerar'}
                    </button>
                  </div>
                  
                  {/* Área do gráfico */}
                  <div className="flex-1 flex-grow">
                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center h-64 border border-gray-200 rounded-lg bg-gray-50 p-4">
                        <div className="w-12 h-12 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
                        <p className="mt-4 text-gray-600">Gerando dashboard...</p>
                      </div>
                    ) : dashboardResult ? (
                      <DashboardViewer dashboardResult={dashboardResult} />
                    ) : (
                      <div className="border border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center h-[400px]">
                        <span className="material-icons text-5xl text-gray-300 mb-4">insert_chart</span>
                        <p className="text-gray-500 text-center">
                          Digite o que você deseja visualizar e clique em Gerar para criar um dashboard
                        </p>
                        <p className="text-gray-400 text-sm mt-2 text-center">
                          Exemplos: "gráfico de vendas por região", "pizza de tarefas por prioridade"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* TaskBoard com animação responsiva */}
        <motion.div 
          animate={{ 
            width: activeView === 'dashboards' ? "40%" : "100%"
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="h-full"
        >
          <TaskBoard 
            onTaskClick={handleTaskSelect}
            onTasksUpdate={handleTasksUpdate}
            initialTasks={tasks}
          />
        </motion.div>
      </div>
      
      <ChatSidebar 
        selectedTask={selectedTask}
        isOpen={isChatOpen} 
        onClose={handleCloseChatSidebar}
      />
    </main>
  )
} 