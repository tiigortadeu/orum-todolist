import Sidebar from './components/Sidebar'
import TaskBoard from './components/TaskBoard'
import ChatSidebar from './components/ChatSidebar'

export default function Home() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <TaskBoard />
      </main>
      <ChatSidebar />
    </div>
  )
} 