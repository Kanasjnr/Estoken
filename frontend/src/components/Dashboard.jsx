import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import DashboardContent from './DashboardContent'
import PropertyListing from './PropertyListing'
import PropertyTokenization from './PropertyTokenization'
import RentalIncome from './RentalIncome'
import Marketplace from './Marketplace'
import Notifications from './Notifications'

function Dashboard() {
  const [activeSection, setActiveSection] = useState('dashboard')

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardContent />
      case 'properties':
        return <PropertyListing />
      case 'tokenization':
        return <PropertyTokenization />
      case 'rental':
        return <RentalIncome />
      case 'marketplace':
        return <Marketplace />
      default:
        return <DashboardContent />
    }
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar setActiveSection={setActiveSection} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-900">
          {renderContent()}
        </main>
      </div>
      <Notifications />
    </div>
  )
}

export default Dashboard

