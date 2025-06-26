import { createContext, useState, useContext } from 'react'
import PropTypes from 'prop-types'

const SidebarContext = createContext()

export const useSidebarContext = () => useContext(SidebarContext)

export function SidebarProvider({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggle = () => setIsCollapsed(!isCollapsed)

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggle }}>
      {children}
    </SidebarContext.Provider>
  )
}

SidebarProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

