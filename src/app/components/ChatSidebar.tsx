'use client'

import { useState } from 'react'

export default function ChatSidebar() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Olá! Sou o assistente da ORUM AI. Como posso ajudar você hoje?' }
  ])
  const [input, setInput] = useState("")
  const [open, setOpen] = useState(true)

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    setMessages([...messages, { role: 'user', content: input }])
    setInput("")
  }

  if (!open) return null

  return (
    <aside className="w-[350px] bg-white border-l flex flex-col h-screen">
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <span className="font-semibold">Assistente ORUM AI</span>
        <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-800">Fechar Chat</button>
      </div>
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`self-${msg.role === 'user' ? 'end' : 'start'} max-w-[80%]`}>
            <div className={`rounded-lg px-4 py-2 ${msg.role === 'user' ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-800'}`}>{msg.content}</div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="flex gap-2 p-4 border-t">
        <input
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Digite sua mensagem..."
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button type="submit" className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium">Enviar</button>
      </form>
    </aside>
  )
} 