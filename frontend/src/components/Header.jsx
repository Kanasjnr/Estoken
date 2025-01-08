import { Bell, User } from 'lucide-react'

function Header() {
  return (
    <header className="bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full hover:bg-gray-700">
          <Bell className="h-6 w-6" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-700">
          <User className="h-6 w-6" />
        </button>
      </div>
    </header>
  )
}

export default Header

