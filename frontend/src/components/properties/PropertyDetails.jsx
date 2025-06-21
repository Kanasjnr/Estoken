"use client"

import { useParams } from "react-router-dom"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import usePropertyWithOracle from "../../hooks/Properties/usePropertyWithOracle"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { MapPin, Coins, DollarSign, TrendingUp, ArrowUpDown, ChevronLeft, ChevronRight, Calendar, RefreshCw, Zap, AlertCircle } from "lucide-react"

const Loader = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="w-16 h-16 border-4 border-t-primary border-primary/30 rounded-full animate-spin"></div>
  </div>
)

export function PropertyDetails() {
  const { id } = useParams()
  const { 
    property, 
    totalRentalIncome, 
    loading, 
    propertyError, 
    requestPropertyValuationUpdate,
    oracleLoading,
    autoUpdateEnabled,
    setAutoUpdateEnabled,
    propertyEvents,
    getPropertyOracleStatus,
    lastOracleUpdate
  } = usePropertyWithOracle(id)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  const oracleStatus = getPropertyOracleStatus()
  const error = propertyError

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <DollarSign className="h-5 w-5 text-primary" />
                <div className="ml-3">
                  <p className="text-sm text-gray-500">Monthly Rental Income</p>
                  <p className="text-lg font-medium text-gray-800">{property.monthlyRentalIncome} XFI</p>
                </div>
              </div>
              <div className="flex items-center border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div className="ml-3">
                  <p className="text-sm text-gray-500">Total Rental Income</p>
                  <p className="text-lg font-medium text-gray-800">{totalRentalIncome} XFI</p>
                </div>
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
          <div className="p-4 border-b border-gray-200">
            <Badge
              variant={property.isActive ? "default" : "secondary"}
              className="text-lg px-4 py-1 font-semibold rounded"
            >
              {property.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>

          {/* Oracle Section */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                Oracle Valuation
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Auto-update</span>
                <Switch
                  checked={autoUpdateEnabled}
                  onCheckedChange={setAutoUpdateEnabled}
                />
              </div>
            </div>

            {/* Oracle Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center border border-gray-200 rounded-lg p-3">
                {oracleStatus.hasPendingRequests ? (
                  <RefreshCw className="h-4 w-4 text-blue-500 animate-spin mr-2" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                )}
                <div>
                  <p className="text-xs text-gray-500">Oracle Status</p>
                  <p className="text-sm font-medium">
                    {oracleStatus.hasPendingRequests ? 'Updating...' : 'Ready'}
                  </p>
                </div>
              </div>

              <div className="flex items-center border border-gray-200 rounded-lg p-3">
                <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                <div>
                  <p className="text-xs text-gray-500">Last Update</p>
                  <p className="text-sm font-medium">
                    {lastOracleUpdate 
                      ? new Date(lastOracleUpdate).toLocaleString()
                      : 'Never'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Oracle Actions */}
            <div className="flex space-x-2">
              <Button
                onClick={requestPropertyValuationUpdate}
                disabled={oracleLoading || !oracleStatus.canRequestUpdate}
                className="flex items-center"
              >
                {oracleLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Request Update
              </Button>
              
              {oracleStatus.failedRequests.length > 0 && (
                <div className="flex items-center text-red-500">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm">
                    {oracleStatus.failedRequests.length} failed request(s)
                  </span>
                </div>
              )}
            </div>

            {/* Recent Oracle Events */}
            {propertyEvents.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Oracle Activity</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {propertyEvents.slice(0, 3).map((event, index) => (
                    <div key={index} className="text-xs p-2 bg-gray-50 rounded border">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{event.name}</span>
                        <span className="text-gray-500">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      {event.name === 'PropertyValuationUpdated' && event.args.newValuation && (
                        <div className="text-gray-600 mt-1">
                          New valuation: {(Number(event.args.newValuation) / 1e18).toFixed(4)} XFI
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

