import  { createContext, useState, useContext } from 'react'

const SidebarContext = createContext()

export const useSidebar = () => useContext(SidebarContext)

export function SidebarProvider({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <SidebarContext.Provider value={{ isSidebarOpen, setIsSidebarOpen }}>
      {children}
    </SidebarContext.Provider>
  )
}

