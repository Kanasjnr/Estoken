"use client"

import React from "react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Building, Coins, BarChart2, ShoppingCart, Menu, UserCheck, Image } from "lucide-react"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Building, label: "Properties", path: "/dashboard/properties" },
  { icon: Coins, label: "Tokenization", path: "/dashboard/tokenization" },
  { icon: BarChart2, label: "Rental Income", path: "/dashboard/rental" },
  { icon: ShoppingCart, label: "Marketplace", path: "/dashboard/marketplace" },
  { icon: Image, label: "My NFTs", path: "/dashboard/nfts" },
  { icon: UserCheck, label: "KYC", path: "/dashboard/kyc" },
]

export function Sidebar() {
  const location = useLocation()
  const [expanded, setExpanded] = React.useState(true)
  const [isMobile, setIsMobile] = React.useState(false)

  // Handle responsive behavior
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      setExpanded(window.innerWidth >= 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && expanded && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20" onClick={() => setExpanded(false)} />
      )}

      <aside
        className={cn(
          "bg-gray-800 text-white shadow-lg transition-all duration-300 ease-in-out fixed md:static h-screen z-30",
          expanded ? "w-80" : "w-24",
          isMobile && !expanded && "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-6 py-6 border-b border-gray-700">
          <img
            src="/Logo.png"
            alt="Logo"
            className={cn("h-12 transition-all duration-300", expanded ? "opacity-100" : "opacity-0 w-0")}
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

        <nav className="mt-8 px-4">
          <ul className="space-y-3">
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center px-4 py-4 rounded-lg transition-all duration-200",
                    location.pathname === item.path
                      ? "bg-gray-700 text-blue-400"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white",
                    expanded ? "justify-start" : "justify-center",
                  )}
                >
                  <item.icon className="h-7 w-7 flex-shrink-0" />
                  <span
                    className={cn(
                      "ml-4 text-lg font-bold transition-all duration-300",
                      expanded ? "opacity-100" : "opacity-0 w-0 hidden",
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

      {/* Mobile toggle button */}
      {isMobile && !expanded && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setExpanded(true)}
          className="fixed bottom-6 right-6 z-30 bg-gray-800 text-white rounded-full p-3 shadow-lg hover:bg-gray-700"
        >
          <Menu className="h-7 w-7" />
        </Button>
      )}
    </>
  )
}

