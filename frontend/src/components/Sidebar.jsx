import React from 'react'
import { useSidebar } from './SidebarProvider'
import { Home, Building, Coins, BarChart2, ShoppingCart, Bell, Settings, ChevronLeft, ChevronRight } from 'lucide-react'

const menuItems = [
  { icon: Home, label: 'Dashboard', section: 'dashboard' },
  { icon: Building, label: 'Properties', section: 'properties' },
  { icon: Coins, label: 'Tokenization', section: 'tokenization' },
  { icon: BarChart2, label: 'Rental Income', section: 'rental' },
  { icon: ShoppingCart, label: 'Marketplace', section: 'marketplace' },
  { icon: Bell, label: 'Notifications', section: 'notifications' },
  { icon: Settings, label: 'Settings', section: 'settings' },
]

function Sidebar({ setActiveSection }) {
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar()

  return (
    <aside className={`bg-gray-800 text-white transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
      <div className="flex items-center justify-between p-4">
        <h2 className={`text-2xl font-bold transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
          estoken
        </h2>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-full hover:bg-gray-700">
          {isSidebarOpen ? <ChevronLeft /> : <ChevronRight />}
        </button>
      </div>
      <nav className="mt-8">
        {menuItems.map((item, index) => (
          <a
            key={index}
            href="#"
            onClick={() => setActiveSection(item.section)}
            className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
          >
            <item.icon className="h-6 w-6" />
            <span className={`ml-4 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
              {item.label}
            </span>
          </a>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar

