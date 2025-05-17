'use client'

import { useState } from 'react'

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState('tasks')
  const [isExpanded, setIsExpanded] = useState(true)

  const menuItems = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'tasks', label: 'Tasks', icon: 'check_circle' },
    { id: 'folders', label: 'Folders', icon: 'folder' },
    { id: 'calendar', label: 'Calendar', icon: 'calendar_today' },
  ]

  return (
    <aside 
      className={`
        border-r border-gray-200 flex flex-col h-screen transition-all duration-300 ease-in-out
        ${isExpanded 
          ? 'w-64 bg-[#fbfbfa]' 
          : 'w-16 bg-[#fbfbfa]/50'
        }
      `}
    >
      {/* Header com perfil */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <img 
            src="https://randomuser.me/api/portraits/men/32.jpg" 
            alt="Profile" 
            className="w-8 h-8 rounded-full flex-shrink-0"
          />
          <div className={`
            flex-1 overflow-hidden transition-all duration-300 ease-in-out
            ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}
          `}>
            <div className="font-medium text-sm whitespace-nowrap">João Silva</div>
            <div className="text-xs text-gray-500 whitespace-nowrap">joao@example.com</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className={`
        overflow-hidden transition-all duration-300 ease-in-out
        ${isExpanded ? 'h-[72px] opacity-100' : 'h-0 opacity-0'}
      `}>
        <div className="px-4 py-4">
          <div className="relative">
            <span className="material-icons absolute left-3 top-2.5 text-gray-400">search</span>
            <input 
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-transparent rounded-lg text-sm focus:outline-none focus:border-gray-300"
            />
          </div>
        </div>
      </div>

      {/* Menu Navigation */}
      <nav className="flex-1 px-2 py-2">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveItem(item.id)}
                className={`
                  w-full flex items-center rounded-lg text-sm transition-colors relative
                  ${activeItem === item.id 
                    ? 'bg-gray-100 text-gray-900 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50'
                  }
                  ${isExpanded ? 'px-3 py-2' : 'p-2 justify-center'}
                `}
                title={!isExpanded ? item.label : ''}
              >
                <span className="material-icons text-xl flex-shrink-0">{item.icon}</span>
                <span className={`
                  ml-3 overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap
                  ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}
                `}>
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer com Toggle */}
      <div className="border-t border-gray-200 p-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center text-gray-400 hover:text-gray-600"
        >
          <span className="material-icons text-xl">
            {isExpanded ? 'chevron_left' : 'chevron_right'}
          </span>
        </button>
      </div>
    </aside>
  )
} 