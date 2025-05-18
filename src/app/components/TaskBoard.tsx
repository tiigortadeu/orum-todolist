'use client'

import { useState, useEffect } from 'react'
import { useCategories } from '@/lib/contexts/CategoryContext'
import TaskModal from './TaskModal'

export interface Task {
  id: string
  text: string
  description: string
  tag: string // Pode ser string vazia
  emoji: string
  time: string
  dueDate: string
  priority: 'high' | 'medium' | 'low'
  section: 'hoje' | 'equipe'
  checked: boolean
}

interface TaskBoardProps {
  onTaskClick: (task: Task) => void
  onTasksUpdate?: (tasks: Task[]) => void
  initialTasks?: Task[]
}

export const priorityLevels = {
  high: { label: "Alta", color: "bg-red-100 text-red-800" },
  medium: { label: "Média", color: "bg-yellow-100 text-yellow-800" },
  low: { label: "Baixa", color: "bg-green-100 text-green-800" }
}

const defaultTasks: Task[] = [
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
]

// Componente para editar tarefa no próprio card
interface TaskCardEditorProps {
  task: Task;
  onSave: (updatedTask: Task) => void;
  onCancel: () => void;
}

function TaskCardEditor({ task, onSave, onCancel }: TaskCardEditorProps) {
  const [text, setText] = useState(task.text);
  const [description, setDescription] = useState(task.description);
  const [selectedTag, setSelectedTag] = useState(task.tag);
  const [selectedPriority, setSelectedPriority] = useState<Task['priority']>(task.priority);
  const [selectedTime, setSelectedTime] = useState(task.time ? task.time.replace('h', ':') : '');
  const [selectedDate, setSelectedDate] = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const { categories } = useCategories();

  // Verifica se a categoria ainda existe, caso não exista, reseta para vazio
  useEffect(() => {
    if (task.tag && !categories.find(cat => cat.name === task.tag)) {
      setSelectedTag('');
    }
  }, [categories, task.tag]);

  const formatTime = (time: string) => {
    if (!time) return '';
    // Converte formato HH:MM para HHhMM
    return time.replace(':', 'h');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const selectedCategory = categories.find(cat => cat.name === selectedTag);
    
    const updatedTask: Task = {
      ...task,
      text,
      description,
      tag: selectedTag,
      emoji: selectedCategory?.emoji || "",
      time: formatTime(selectedTime),
      dueDate: selectedDate,
      priority: selectedPriority
    };
    
    onSave(updatedTask);
  };
  
  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCancel();
  };

  return (
    <form onSubmit={handleSave} onClick={(e) => e.stopPropagation()} className="space-y-4 bg-white p-4 rounded-lg shadow-md">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Nome da tarefa"
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:border-gray-400"
      />
      
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descrição"
        rows={2}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
      />
      
      <div className="grid grid-cols-2 gap-2">
        <select
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-gray-400 bg-white"
        >
          <option value="">Sem categoria</option>
          {categories.map(category => (
            <option key={category.name} value={category.name}>
              {category.emoji} {category.name}
            </option>
          ))}
        </select>
        
        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value as Task['priority'])}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-gray-400 bg-white"
        >
          {Object.entries(priorityLevels).map(([key, value]) => (
            <option key={key} value={key}>
              {value.label}
            </option>
          ))}
        </select>
        
        <input
          type="time"
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-gray-400 bg-white"
        />
        
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-gray-400 bg-white"
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-2">
        <button 
          type="button"
          onClick={handleCancel}
          className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm"
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="px-3 py-1.5 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
        >
          Salvar
        </button>
      </div>
    </form>
  );
}

export default function TaskBoard({ onTaskClick, onTasksUpdate, initialTasks }: TaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks || defaultTasks)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  
  const { categories } = useCategories()

  useEffect(() => {
    if (initialTasks) {
      setTasks(initialTasks)
    }
  }, [initialTasks])

  // Atualiza tarefas quando categorias são excluídas
  useEffect(() => {
    const updatedTasks = tasks.map(task => {
      // Se a categoria da tarefa não existe mais, redefine para vazio
      if (task.tag && !categories.find(cat => cat.name === task.tag)) {
        return {
          ...task,
          tag: '',
          emoji: ''
        };
      }
      return task;
    });
    
    // Só atualiza se algo foi alterado
    if (JSON.stringify(updatedTasks) !== JSON.stringify(tasks)) {
      setTasks(updatedTasks);
      if (onTasksUpdate) {
        onTasksUpdate(updatedTasks);
      }
    }
  }, [categories]);

  const toggleTask = (taskId: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, checked: !task.checked } : task
    )
    
    setTasks(updatedTasks)
    
    if (onTasksUpdate) {
      onTasksUpdate(updatedTasks)
    }
  }

  const updateTask = (updatedTask: Task) => {
    const updatedTasks = tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    )
    
    setTasks(updatedTasks)
    setEditingTaskId(null)
    
    if (onTasksUpdate) {
      onTasksUpdate(updatedTasks)
    }
  }

  const addTask = (taskData: Omit<Task, 'id' | 'checked'>) => {
    const newTask: Task = {
      id: Date.now().toString(),
      ...taskData,
      checked: false
    }
    
    const updatedTasks = [...tasks, newTask]
    setTasks(updatedTasks)
    
    if (onTasksUpdate) {
      onTasksUpdate(updatedTasks)
    }
  }

  const filterTasks = (tasks: Task[]): Task[] => {
    if (!searchQuery.trim()) return tasks

    const query = searchQuery.toLowerCase()
    return tasks.filter(task => {
      const searchableFields = [
        task.text,
        task.description,
        task.tag,
        task.time,
        priorityLevels[task.priority].label,
        new Date(task.dueDate).toLocaleDateString('pt-BR')
      ]
      
      return searchableFields.some(field => 
        field.toLowerCase().includes(query)
      )
    })
  }

  const handleTaskCardClick = (task: Task) => {
    // Se estiver no modo de edição de outra task, cancela
    if (editingTaskId && editingTaskId !== task.id) {
      setEditingTaskId(null);
    }
    
    // Se não estiver editando essa task e a tarefa não estiver concluída, abre o chat
    if (editingTaskId !== task.id && !task.checked) {
      onTaskClick(task);
    }
  }

  const handleEditToggle = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    setEditingTaskId(editingTaskId === taskId ? null : taskId);
  }

  const deleteTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
      const updatedTasks = tasks.filter(task => task.id !== taskId)
      setTasks(updatedTasks)
      
      if (onTasksUpdate) {
        onTasksUpdate(updatedTasks)
      }
      
      // Fechar o modo de edição se estiver editando a tarefa excluída
      if (editingTaskId === taskId) {
        setEditingTaskId(null)
      }
    }
  }

  const handleAddTaskClick = () => {
    // Transfere o conteúdo da pesquisa para o modal e limpa a pesquisa
    const searchContent = searchQuery.trim()
    setIsTaskModalOpen(true)
    if (searchContent) {
      setSearchQuery('')
    }
  }

  // Variável para rastrear cliques recentes no checkbox
  const [recentlyToggled, setRecentlyToggled] = useState<string | null>(null);
  
  // Função auxiliar para registrar clique no checkbox
  const handleCheckboxToggle = (taskId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    toggleTask(taskId);
    
    // Registra este ID como recentemente alternado
    setRecentlyToggled(taskId);
    
    // Limpa após 500ms para permitir cliques futuros
    setTimeout(() => {
      setRecentlyToggled(null);
    }, 500);
  }

  return (
    <div className="flex-1 bg-white">
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-gray-800">Minhas tarefas</h2>
          <button className="text-gray-400 hover:text-gray-600 p-2 rounded-lg transition-colors">
            <span className="material-icons">visibility</span>
          </button>
        </div>

        <div className="relative mb-8">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar tarefas..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
          />
          <span className="material-icons absolute left-3 top-2 text-gray-400">search</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
            >
              <span className="material-icons">close</span>
            </button>
          )}
        </div>

        <div className="mb-8">
          <button
            onClick={handleAddTaskClick}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors font-medium"
          >
            <span className="text-gray-400 text-xl">+</span> Adicionar tarefa
          </button>
        </div>

        <div className="space-y-1">
          {filterTasks(tasks).map((task) => {
            const categoryColor = categories.find(cat => cat.name === task.tag)?.color || ""
            const priorityColor = priorityLevels[task.priority].color
            
            return (
              <div 
                key={task.id} 
                className="group flex flex-col gap-2 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={(e) => {
                  // Verificar se o clique foi diretamente no checkbox
                  const target = e.target as HTMLElement;
                  // Não abre o chat se o clique ocorreu no checkbox ou nos botões
                  if (!target.closest('input[type="checkbox"]') && 
                      !target.closest('button') && 
                      recentlyToggled !== task.id) {
                    handleTaskCardClick(task);
                  }
                }}
              >
                {editingTaskId === task.id ? (
                  <TaskCardEditor 
                    task={task} 
                    onSave={updateTask} 
                    onCancel={() => setEditingTaskId(null)} 
                  />
                ) : (
                  <>
                    <div className="flex items-center gap-4">
                      <input 
                        type="checkbox" 
                        checked={task.checked} 
                        onChange={(e) => handleCheckboxToggle(task.id, e)}
                        onClick={(e) => {
                          // Impede a propagação do evento de clique para o card
                          e.stopPropagation();
                        }}
                        className="w-5 h-5 border-2 border-gray-300 rounded-full checked:bg-gray-800 checked:border-gray-800 cursor-pointer transition-colors"
                      />
                      <div className="flex-1">
                        <span className={`text-[15px] font-medium ${task.checked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                          {task.text}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => handleEditToggle(e, task.id)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                          title="Editar tarefa"
                        >
                          <span className="material-icons text-sm">edit</span>
                        </button>
                        <button
                          onClick={(e) => deleteTask(task.id, e)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                          title="Excluir tarefa"
                        >
                          <span className="material-icons text-sm">delete</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm ml-9">
                      {task.time && (
                        <div className="flex items-center">
                          <span className="material-icons text-gray-400 text-sm mr-1">schedule</span>
                          <span className="text-xs text-gray-500">{task.time}</span>
                        </div>
                      )}
                      
                      {task.tag && (
                        <div className="flex items-center gap-1 text-xs">
                          <span>{task.emoji}</span>
                          <span className="text-gray-500">{task.tag}</span>
                        </div>
                      )}
                      
                      <div className={`ml-auto px-2 py-0.5 rounded-full text-xs ${priorityColor}`}>
                        {priorityLevels[task.priority].label}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
      
      <TaskModal 
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={addTask}
        initialSearchQuery={searchQuery}
      />
    </div>
  )
} 