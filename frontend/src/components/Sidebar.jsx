import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Building, Coins, BarChart2, ShoppingCart, Settings, Menu } from 'lucide-react'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Building, label: 'Properties', path: '/dashboard/properties' },
  { icon: Coins, label: 'Tokenization', path: '/dashboard/tokenization' },
  { icon: BarChart2, label: 'Rental Income', path: '/dashboard/rental' },
  { icon: ShoppingCart, label: 'Marketplace', path: '/dashboard/marketplace' },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
]

export function Sidebar() {
  const location = useLocation()
  const [expanded, setExpanded] = React.useState(true)

  return (
    <aside
      className={cn(
        "bg-gray-800 text-white shadow-lg transition-all duration-300 ease-in-out",
        expanded ? "w-80" : "w-24"
      )}
    >
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-700">
        <img
          src="/Logo.png"
          alt="Logo"
          className={cn(
            "h-12 transition-all duration-300",
            expanded ? "opacity-100" : "opacity-100" 
          )}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setExpanded(!expanded)}
          className="text-gray-400 hover:text-white"
        >
          <Menu className="h-8 w-8" />
        </Button>
      </div>

   
      <nav className="mt-6">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center px-6 py-4 text-lg font-semibold rounded-lg transition-all duration-200",
                  location.pathname === item.path
                    ? "bg-gray-700 text-blue-400"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                )}
              >
                <item.icon className="h-8 w-8" />
                <span
                  className={cn(
                    "ml-6 transition-opacity duration-300",
                    expanded ? "opacity-100" : "opacity-0"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      
    </aside>
  )
}
