'use client'

import { useState } from 'react'

interface Task {
  id: string
  text: string
  description: string
  tag: string
  emoji: string
  time: string
  dueDate: string
  priority: 'high' | 'medium' | 'low'
  section: 'hoje' | 'equipe'
  checked: boolean
}

const taskCategories = [
  { name: "Saúde", emoji: "🧘‍♀️", color: "bg-green-100 text-green-800" },
  { name: "Compromissos", emoji: "📅", color: "bg-blue-100 text-blue-800" },
  { name: "Lista de compras", emoji: "🛒", color: "bg-yellow-100 text-yellow-800" },
  { name: "Reuniões do dia", emoji: "👥", color: "bg-purple-100 text-purple-800" },
  { name: "Pessoal", emoji: "📝", color: "bg-gray-100 text-gray-800" }
]

const priorityLevels = {
  high: { label: "Alta", color: "bg-red-100 text-red-800" },
  medium: { label: "Média", color: "bg-yellow-100 text-yellow-800" },
  low: { label: "Baixa", color: "bg-green-100 text-green-800" }
}

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
]

export default function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [input, setInput] = useState("")
  const [description, setDescription] = useState("")
  const [selectedTag, setSelectedTag] = useState(taskCategories[0].name)
  const [selectedPriority, setSelectedPriority] = useState<Task['priority']>('medium')
  const [selectedTime, setSelectedTime] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showAddTask, setShowAddTask] = useState(false)

  const addTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    
    const selectedCategory = taskCategories.find(cat => cat.name === selectedTag)
    
    const newTask: Task = { 
      id: Date.now().toString(),
      text: input,
      description: description || "Sem descrição",
      tag: selectedTag,
      emoji: selectedCategory?.emoji || "📝",
      time: selectedTime,
      dueDate: selectedDate,
      priority: selectedPriority,
      section: "hoje",
      checked: false 
    }
    setTasks([...tasks, newTask])
    setInput("")
    setDescription("")
    setSelectedTime("")
    setSelectedPriority('medium')
    setShowAddTask(false)
  }

  const toggleTask = (taskId: string) => {
    setTasks(tasks => tasks.map(task => 
      task.id === taskId ? { ...task, checked: !task.checked } : task
    ))
  }

  const TaskSection = ({ title, tasks }: { title: string, tasks: Task[] }) => (
    <div className="mb-8">
      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">{title}</h3>
      <div className="space-y-1">
        {tasks.map((task) => {
          const categoryColor = taskCategories.find(cat => cat.name === task.tag)?.color || "bg-gray-100 text-gray-800"
          const priorityColor = priorityLevels[task.priority].color
          
          return (
            <div 
              key={task.id} 
              className="group flex flex-col gap-2 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <input 
                  type="checkbox" 
                  checked={task.checked} 
                  onChange={() => toggleTask(task.id)} 
                  className="w-5 h-5 border-2 border-gray-300 rounded-full checked:bg-gray-800 checked:border-gray-800 cursor-pointer transition-colors"
                />
                <div className="flex-1">
                  <span className={`text-[15px] font-medium ${task.checked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {task.text}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-sm ml-9">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColor}`}>
                  {priorityLevels[task.priority].label}
                </span>
                
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${categoryColor}`}>
                  {task.emoji} {task.tag}
                </span>

                {task.time && (
                  <span className="font-medium text-gray-500">{task.time}</span>
                )}
                
                <span className="text-gray-500">
                  {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="flex-1 bg-white">
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-gray-800">Meus projetos</h2>
          <button className="text-gray-400 hover:text-gray-600 p-2 rounded-lg transition-colors">
            <span className="material-icons">visibility</span>
          </button>
        </div>

        <div className="mb-8">
          {!showAddTask ? (
            <button
              onClick={() => setShowAddTask(true)}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors font-medium"
            >
              <span className="text-gray-400 text-xl">+</span> Adicionar tarefa
            </button>
          ) : (
            <form onSubmit={addTask} className="flex flex-col gap-4 bg-gray-50 p-4 rounded-lg">
              <input
                autoFocus
                className="w-full border-0 border-b-2 border-gray-200 py-2 text-gray-700 font-medium text-[15px] focus:outline-none focus:border-gray-400 placeholder-gray-400 bg-transparent"
                placeholder="ex: Reunião com o time às 15h"
                value={input}
                onChange={e => setInput(e.target.value)}
              />
              
              <textarea
                className="w-full border-0 border-b-2 border-gray-200 py-2 text-gray-700 text-[15px] focus:outline-none focus:border-gray-400 placeholder-gray-400 bg-transparent resize-none"
                placeholder="Descrição (opcional)"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
              />
              
              <div className="flex gap-4">
                <select
                  value={selectedTag}
                  onChange={e => setSelectedTag(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-gray-400 bg-white"
                >
                  {taskCategories.map(category => (
                    <option key={category.name} value={category.name}>
                      {category.emoji} {category.name}
                    </option>
                  ))}
                </select>
                
                <select
                  value={selectedPriority}
                  onChange={e => setSelectedPriority(e.target.value as Task['priority'])}
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
                  onChange={e => setSelectedTime(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-gray-400 bg-white"
                />
                
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-gray-400 bg-white"
                />
              </div>

              <div className="flex gap-2">
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Adicionar tarefa
                </button>
                <button 
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>

        <TaskSection 
          title="Hoje" 
          tasks={tasks.filter(t => t.section === "hoje")} 
        />
        
        <TaskSection 
          title="Equipe" 
          tasks={tasks.filter(t => t.section === "equipe")} 
        />
      </div>
    </div>
  )
} 