import "./config/connection";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import { SidebarProvider } from './components/Dashboard/SidebarProvider'
import DashboardPage from './pages/DashboardPage'
import LandingPage from './pages/LandingPage'

function App() {
  return (
    <Router>
      <SidebarProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard/*" element={<DashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SidebarProvider>
    </Router>
  )
}

export default App

