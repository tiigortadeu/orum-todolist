'use client'

import { useState, useRef, useEffect } from 'react'
import { useCategories } from '@/lib/contexts/CategoryContext'
import type { Task } from './TaskBoard'

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: Omit<Task, 'id' | 'checked'>) => void
  initialSearchQuery?: string
}

export default function TaskModal({ isOpen, onClose, onSave, initialSearchQuery = '' }: TaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [selectedPriority, setSelectedPriority] = useState<Task['priority']>('medium')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const modalRef = useRef<HTMLDivElement>(null)
  const { categories } = useCategories()
  
  // Fechar o modal quando clicar fora dele
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      // Prevenir o scroll do fundo quando o modal está aberto
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'auto'
    }
  }, [isOpen, onClose])
  
  // Resetar o formulário quando o modal abrir e definir o valor inicial da pesquisa
  useEffect(() => {
    if (isOpen) {
      setTitle(initialSearchQuery)
      setDescription('')
      setSelectedTag('')
      setSelectedTime('')
      setSelectedPriority('medium')
      setSelectedDate(new Date().toISOString().split('T')[0])
    }
  }, [isOpen, initialSearchQuery])
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const selectedCategory = categories.find(cat => cat.name === selectedTag)
    
    onSave({
      text: title.trim(),
      description: description || "Sem descrição",
      tag: selectedTag,
      emoji: selectedCategory?.emoji || "",
      time: selectedTime.replace(':', 'h'),
      dueDate: selectedDate,
      priority: selectedPriority,
      section: "hoje"
    })
    
    onClose()
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 transform transition-all"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4">Nova Tarefa</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-1">
              Título
            </label>
            <input
              type="text"
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex: Reunião com o time às 15h"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              autoFocus
            />
          </div>
          
          <div>
            <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição (opcional)
            </label>
            <textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes sobre a tarefa..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-category" className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <select
                id="task-category"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                <option value="">Sem categoria</option>
                {categories.map(category => (
                  <option key={category.name} value={category.name}>
                    {category.emoji} {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="task-priority" className="block text-sm font-medium text-gray-700 mb-1">
                Prioridade
              </label>
              <select
                id="task-priority"
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value as Task['priority'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                <option value="high">Alta</option>
                <option value="medium">Média</option>
                <option value="low">Baixa</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="task-time" className="block text-sm font-medium text-gray-700 mb-1">
                Horário (opcional)
              </label>
              <input
                type="time"
                id="task-time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
            
            <div>
              <label htmlFor="task-date" className="block text-sm font-medium text-gray-700 mb-1">
                Data
              </label>
              <input
                type="date"
                id="task-date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 hover:bg-gray-700 transition-colors"
            >
              Adicionar tarefa
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 