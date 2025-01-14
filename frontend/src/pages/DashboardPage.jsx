import { Routes, Route } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { Header } from '../components/Header'
import { DashboardContent } from '../components/DashboardContent'
import { PropertyListing } from '../components/properties/PropertyListing'
import { PropertyDetails } from '../components/properties/PropertyDetails'
import { PropertyTokenization } from '../components/properties/PropertyTokenization'
import { RentalIncome } from '../components/RentalIncome'
import { Marketplace } from '../components/Marketplace'

export function DashboardPage() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<DashboardContent />} />
            <Route path="/properties" element={<PropertyListing />} />
            <Route path="/properties/:id" element={<PropertyDetails />} />
            <Route path="/tokenization" element={<PropertyTokenization />} />
            <Route path="/rental" element={<RentalIncome />} />
            <Route path="/marketplace" element={<Marketplace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default DashboardPage

