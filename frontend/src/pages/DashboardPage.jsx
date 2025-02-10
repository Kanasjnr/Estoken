import { Routes, Route } from "react-router-dom"
import { Sidebar } from "../components/Dashboard/Sidebar"
import { Header } from "../components/Dashboard/Header"
import InvestmentPortfolio from "../components/Dashboard/InvestmentPortfolio"
import { PropertyGrid } from "../components/properties/PropertyGrid"
import { PropertyDetails } from "../components/properties/PropertyDetails"
import PropertyTokenization from "../components/properties/PropertyTokenization"
import  RentalIncome  from "../components/Dashboard/RentalIncome"
import PropertyTokenPurchase from "../components/Dashboard/PropertyTokenPurchase"
import { KYCStatus } from "../components/KYC/KYCStatus"
import { KYCSubmissionForm } from "../components/KYC/KYCSubmissionForm"
import { KYCVerificationList } from "../components/KYC/KYCVerificationList"
import NFTViewer from "../components/Dashboard/NFTViewer"
// import Notifications from "../components/Dashboard/Notifications"

function DashboardPage() {
  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-100">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<InvestmentPortfolio />} />
              <Route path="/properties" element={<PropertyGrid />} />
              <Route path="/properties/:id" element={<PropertyDetails />} />
              <Route path="/tokenization" element={<PropertyTokenization />} />
              <Route path="/marketplace" element={<PropertyTokenPurchase />} />
              <Route path="/rental" element={<RentalIncome />} />
              <Route path="/nfts" element={<NFTViewer />} />

              <Route
                path="/kyc"
                element={
                  <div className="space-y-8">
                    <KYCStatus />
                    <KYCSubmissionForm />
                    <KYCVerificationList />
                  </div>
                }
              />
            </Routes>
          </div>
        </main>
      </div>
      {/* <Notifications /> */}
    </div>
  )
}

export default DashboardPage