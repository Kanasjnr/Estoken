import { Routes, Route } from "react-router-dom"
import { Sidebar } from "../components/Sidebar"
import { Header } from "../components/Header"
import  InvestmentPortfolio  from "../components/InvestmentPortfolio"
import { PropertyGrid } from "../components/properties/PropertyGrid"
import { PropertyDetails } from "../components/properties/PropertyDetails"
import PropertyTokenization  from "../components/properties/PropertyTokenization"
import { RentalIncome } from "../components/RentalIncome"
import PropertyTokenPurchase from "../components/PropertyTokenPurchase"

export function DashboardPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<InvestmentPortfolio />} />
            <Route path="/properties" element={<PropertyGrid />} />
            <Route path="/properties/:id" element={<PropertyDetails />} />
            <Route path="/tokenization" element={<PropertyTokenization />} />
            <Route path="/marketplace" element={<PropertyTokenPurchase />} />
            <Route path="/portfolio" element={<InvestmentPortfolio />} />
            <Route path="/rental" element={<RentalIncome />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default DashboardPage