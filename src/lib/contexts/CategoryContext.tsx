'use client'

import { createContext, useState, useContext, ReactNode } from 'react'

export interface Category {
  name: string
  emoji: string
  color: string
}

// Lista inicial de categorias
const initialCategories: Category[] = [
  { name: "Saúde", emoji: "🧘‍♀️", color: "bg-green-100 text-green-800" },
  { name: "Compromissos", emoji: "📅", color: "bg-blue-100 text-blue-800" },
  { name: "Lista de compras", emoji: "🛒", color: "bg-yellow-100 text-yellow-800" },
  { name: "Reuniões do dia", emoji: "👥", color: "bg-purple-100 text-purple-800" },
  { name: "Pessoal", emoji: "📝", color: "bg-gray-100 text-gray-800" }
]

// Cores disponíveis para novas categorias
const availableColors = [
  "bg-green-100 text-green-800",
  "bg-blue-100 text-blue-800",
  "bg-yellow-100 text-yellow-800",
  "bg-purple-100 text-purple-800",
  "bg-gray-100 text-gray-800",
  "bg-red-100 text-red-800",
  "bg-pink-100 text-pink-800",
  "bg-indigo-100 text-indigo-800",
  "bg-orange-100 text-orange-800",
  "bg-teal-100 text-teal-800"
]

// Emojis disponíveis para novas categorias
const availableEmojis = ["📝", "📌", "📊", "📈", "📅", "🔍", "🧩", "🌟", "🎯", "🔔", "🏆", "✨", "🛠️", "📚", "🗂️"]

interface CategoryContextProps {
  categories: Category[]
  addCategory: (name: string, emoji?: string) => void
  deleteCategory: (name: string) => void
  getRandomColorAndEmoji: () => { color: string, emoji: string }
}

const CategoryContext = createContext<CategoryContextProps | undefined>(undefined)

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories)

  const getRandomColorAndEmoji = () => {
    const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)]
    const randomEmoji = availableEmojis[Math.floor(Math.random() * availableEmojis.length)]
    
    return { color: randomColor, emoji: randomEmoji }
  }

  const addCategory = (name: string, emoji?: string) => {
    if (!name || categories.find(cat => cat.name === name)) {
      return
    }
    
    const { color, emoji: randomEmoji } = getRandomColorAndEmoji()
    
    setCategories([...categories, { 
      name, 
      emoji: emoji || randomEmoji, 
      color 
    }])
  }
  
  const deleteCategory = (name: string) => {
    setCategories(categories.filter(cat => cat.name !== name))
  }

  return (
    <CategoryContext.Provider value={{ categories, addCategory, deleteCategory, getRandomColorAndEmoji }}>
      {children}
    </CategoryContext.Provider>
  )
}

export function useCategories() {
  const context = useContext(CategoryContext)
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider')
  }
  return context
} 