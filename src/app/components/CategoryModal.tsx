'use client'

import { useState, useRef, useEffect } from 'react'

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (name: string, emoji: string) => void
}

// Lista de emojis para seleção
const emojiOptions = [
  "📝", "📌", "📊", "📈", "📅", "🔍", "🧩", "🌟", "🎯", "🔔", 
  "🏆", "✨", "🛠️", "📚", "🗂️", "🧘‍♀️", "🦷", "🥖", "👥", "💼",
  "🏠", "🎓", "💻", "🎨", "🚗", "✈️", "🛒", "💰", "🎬", "🎮"
]

export default function CategoryModal({ isOpen, onClose, onSave }: CategoryModalProps) {
  const [name, setName] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState(emojiOptions[0])
  const modalRef = useRef<HTMLDivElement>(null)
  
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
  
  // Resetar o formulário quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      setName('')
      setSelectedEmoji(emojiOptions[0])
    }
  }, [isOpen])
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onSave(name.trim(), selectedEmoji)
      onClose()
    }
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 transform transition-all"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4">Nova Categoria</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="category-name" className="block text-sm font-medium text-gray-700 mb-1">
              Nome da categoria
            </label>
            <input
              type="text"
              id="category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Trabalho, Estudos, Pessoal..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Escolha um emoji
            </label>
            <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto custom-scrollbar p-1">
              {emojiOptions.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`
                    h-10 w-10 flex items-center justify-center text-xl rounded-lg transition-colors
                    ${selectedEmoji === emoji 
                      ? 'bg-gray-200 ring-2 ring-gray-400' 
                      : 'hover:bg-gray-100'
                    }
                  `}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{selectedEmoji}</span>
              <span className="font-medium">{name || "Nova Categoria"}</span>
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 hover:bg-gray-700 transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 