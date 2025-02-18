"use client"

import { useParams } from "react-router-dom"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import useGetProperty from "../../hooks/Properties/useGetProperty"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Coins, DollarSign, TrendingUp, ArrowUpDown, ChevronLeft, ChevronRight, Calendar } from "lucide-react"

const Loader = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="w-16 h-16 border-4 border-t-primary border-primary/30 rounded-full animate-spin"></div>
  </div>
)

export function PropertyDetails() {
  const { id } = useParams()
  const { property, totalRentalIncome, loading, error } = useGetProperty(id)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % (property?.imageUrls?.length || 1))
  }

  const prevImage = () => {
    setCurrentImageIndex(
      (prevIndex) => (prevIndex - 1 + (property?.imageUrls?.length || 1)) % (property?.imageUrls?.length || 1),
    )
  }

  if (loading) return <Loader />

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-red-500 text-xl font-medium">Error: {error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-xl font-medium">No property found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="overflow-hidden border border-gray-200 rounded-lg bg-white">
        <CardHeader className="p-4 border-b border-gray-200">
          <CardTitle className="text-3xl font-semibold text-gray-800">{property.name}</CardTitle>
          <div className="flex items-center text-gray-500 mt-1">
            <MapPin className="h-5 w-5 mr-2 text-primary" />
            <span className="text-lg">{property.location}</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Image Carousel */}
          <div className="relative aspect-video">
            <AnimatePresence initial={false}>
              <motion.img
                key={currentImageIndex}
                src={property.imageUrls[currentImageIndex]}
                alt={`Property image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
            </AnimatePresence>
            <div className="absolute inset-0 flex items-center justify-between px-4">
              <button
                onClick={prevImage}
                className="bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextImage}
                className="bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Property Description */}
          <div className="p-4 border-b border-gray-200">
            <p className="text-base text-gray-700">{property.description}</p>
          </div>

          {/* Stats Cards */}
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <Coins className="h-5 w-5 text-primary" />
              <div className="ml-3">
                <p className="text-sm text-gray-500">Total Shares</p>
                <p className="text-lg font-medium text-gray-800">{property.totalShares}</p>
              </div>
            </div>
            <div className="flex items-center border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div className="ml-3">
                <p className="text-sm text-gray-500">Available Shares</p>
                <p className="text-lg font-medium text-gray-800">{property.availableShares}</p>
              </div>
            </div>
            <div className="flex items-center border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <DollarSign className="h-5 w-5 text-primary" />
              <div className="ml-3">
                <p className="text-sm text-gray-500">Price Per Share</p>
                <p className="text-lg font-medium text-gray-800">{property.pricePerShare} XFI</p>
              </div>
            </div>
            <div className="flex items-center border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div className="ml-3">
                <p className="text-sm text-gray-500">Initial Valuation</p>
                <p className="text-lg font-medium text-gray-800">{property.initialValuation} XFI</p>
              </div>
            </div>
            <div className="flex items-center border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <ArrowUpDown className="h-5 w-5 text-primary" />
              <div className="ml-3">
                <p className="text-sm text-gray-500">Current Valuation</p>
                <p className="text-lg font-medium text-gray-800">{property.currentValuation} XFI</p>
              </div>
            </div>
             {/* Monthly Rental Income */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <DollarSign className="h-5 w-5 text-primary" />
              <div className="ml-3">
                <p className="text-sm text-gray-500">Monthly Rental Income</p>
                <p className="text-lg font-medium text-gray-800">{property.monthlyRentalIncome} XFI</p>
              </div>
            </div>
          </div>
            {/* <div className="flex items-center border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <DollarSign className="h-5 w-5 text-primary" />
              <div className="ml-3">
                <p className="text-sm text-gray-500">Accumulated Rental Income Per Share</p>
                <p className="text-lg font-medium text-gray-800">{property.accumulatedRentalIncomePerShare} XFI</p>
              </div>
            </div> */}
            <div className="flex items-center border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <Calendar className="h-5 w-5 text-primary" />
              <div className="ml-3">
                <p className="text-sm text-gray-500">Last Rental Update</p>
                <p className="text-lg font-medium text-gray-800">{property.lastRentalUpdate}</p>
              </div>
            </div>
            <div className="flex items-center border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <Calendar className="h-5 w-5 text-primary" />
              <div className="ml-3">
                <p className="text-sm text-gray-500">Creation Date</p>
                <p className="text-lg font-medium text-gray-800">{property.creationTimestamp}</p>
              </div>
            </div>
          </div>

         

         

          {/* Active Status */}
          <div className="p-4">
            <Badge
              variant={property.isActive ? "default" : "secondary"}
              className="text-lg px-4 py-1 font-semibold rounded"
            >
              {property.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

