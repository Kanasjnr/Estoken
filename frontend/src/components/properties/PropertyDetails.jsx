"use client"

import { useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-toastify"
import usePropertyWithOracle from "../../hooks/Properties/usePropertyWithOracle"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { MapPin, Coins, DollarSign, TrendingUp, ArrowUpDown, ChevronLeft, ChevronRight, Calendar, RefreshCw, Zap, AlertCircle } from "lucide-react"
import { useAppKitAccount } from "@reown/appkit/react"
import { useCanRequestValuation } from "../../hooks/Properties"

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
    getPropertyOracleStatus,
    lastOracleUpdate,
    getSimulatedValuation
  } = usePropertyWithOracle(id)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { address } = useAppKitAccount()
  
  const oracleStatus = getPropertyOracleStatus()
  const simulatedValuation = getSimulatedValuation()
  const error = propertyError

  const { canRequestValuation } = useCanRequestValuation()
  
  // State for permission status
  const [permissionStatus, setPermissionStatus] = useState(null)
  
  // State for local valuation and rent tracking
  const [localCurrentValuation, setLocalCurrentValuation] = useState(null)
  const [localMonthlyRent, setLocalMonthlyRent] = useState(null)
  
  // State for enhanced valuation request form
  const [showValuationForm, setShowValuationForm] = useState(false)
  const [valuationFormData, setValuationFormData] = useState({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    squareFootage: '',
    useCustomApiKey: false,
    customApiKey: ''
  })
  
  // Initialize form data when property loads
  useEffect(() => {
    if (property) {
      // Try to parse the property location
      const locationParts = property.location?.split(',').map(part => part.trim()) || [];
      
      setValuationFormData(prev => ({
        ...prev,
        address: locationParts[0] || '',
        city: locationParts[1] || '',
        state: locationParts[2] || '',
        zipCode: locationParts[3] || '',
        squareFootage: property.size || property.squareFootage || ''
      }));
      
      // Initialize local valuation and rent with property values
      setLocalCurrentValuation(property.currentValuation);
      setLocalMonthlyRent(property.monthlyRentalIncome);
    }
  }, [property]);

  // Update local values when simulated valuation is available
  useEffect(() => {
    if (simulatedValuation) {
      const newValuationETH = (20000 / 3000).toFixed(4); // $20,000 to ETH
      const newMonthlyRent = (parseFloat(newValuationETH) * 0.005).toFixed(4); // 0.5% monthly
      
      setLocalCurrentValuation(newValuationETH);
      setLocalMonthlyRent(newMonthlyRent);
    }
  }, [simulatedValuation]);

  // Fetch user's permission status
  useEffect(() => {
    const fetchUserData = async () => {
      if (!address) {
        return;
      }
      
      try {
        const permissionCheck = await canRequestValuation()
        console.log('Permission check result:', permissionCheck);
        setPermissionStatus(permissionCheck)
      } catch (error) {
        console.error("Error fetching user data:", error)
        setPermissionStatus({
          canRequest: false,
          reason: "Error checking permissions: " + (error.message || "Unknown error"),
          isOwner: false
        })
      }
    }
    
    fetchUserData()
  }, [address, canRequestValuation])

  // Enhanced valuation form submit handler
  const handleValuationFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!permissionStatus?.canRequest) {
      toast.error(permissionStatus?.reason || 'Only admin can request valuation updates');
      return;
    }
    
    try {
      // Format the location string for the API
      const locationParts = [
        valuationFormData.address,
        valuationFormData.city,
        valuationFormData.state.toUpperCase()
      ];
      
      if (valuationFormData.zipCode) {
        locationParts.push(valuationFormData.zipCode);
      }
      
      const locationString = locationParts.filter(part => part.trim()).join(', ');
      const squareFootage = valuationFormData.squareFootage.toString();
      
      // Call the enhanced request function
      const result = await requestPropertyValuationUpdate(
        id,
        locationString,
        squareFootage,
        valuationFormData.useCustomApiKey ? valuationFormData.customApiKey : null
      );
      
      if (result) {
        toast.success('🎉 Valuation request submitted! Will be processed in 30 seconds.');
        setShowValuationForm(false); // Hide the form after successful submission
      }
    } catch (error) {
      console.error('Error submitting enhanced valuation request:', error);
      if (!error.isHandled) {
        toast.error('Failed to submit valuation request');
      }
    }
  };

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

  // Use local valuation and rent if they exist, otherwise fall back to property values
  // Priority: simulated valuation > local valuation > property valuation
  const displayCurrentValuation = simulatedValuation ? 
    simulatedValuation.newValuation : 
    (localCurrentValuation || property.currentValuation);
    
  const displayMonthlyRent = simulatedValuation ? 
    (parseFloat(simulatedValuation.newValuation) * 0.005).toFixed(4) : 
    (localMonthlyRent || property.monthlyRentalIncome);

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
                <p className="text-lg font-medium text-gray-800">{property.pricePerShare} ETH</p>
              </div>
            </div>
            <div className="flex items-center border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div className="ml-3">
                <p className="text-sm text-gray-500">Initial Valuation</p>
                <p className="text-lg font-medium text-gray-800">{property.initialValuation} ETH</p>
              </div>
            </div>
            <div className="flex items-center border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <ArrowUpDown className="h-5 w-5 text-primary" />
              <div className="ml-3">
                <p className="text-sm text-gray-500">Current Valuation</p>
                <p className="text-lg font-medium text-gray-800">
                  {displayCurrentValuation} ETH
                  {(simulatedValuation || (localCurrentValuation && localCurrentValuation !== property.currentValuation)) && (
                    <span className="text-sm text-green-600 ml-2">(Updated)</span>
                  )}
                </p>
              </div>
            </div>
             {/* Monthly Rental Income */}
          <div className="p-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <DollarSign className="h-5 w-5 text-primary" />
                <div className="ml-3">
                  <p className="text-sm text-gray-500">Monthly Rental Income</p>
                  <p className="text-lg font-medium text-gray-800">
                    {displayMonthlyRent} ETH
                    {(simulatedValuation || (localMonthlyRent && localMonthlyRent !== property.monthlyRentalIncome)) && (
                      <span className="text-sm text-green-600 ml-2">(Updated)</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div className="ml-3">
                  <p className="text-sm text-gray-500">Total Rental Income</p>
                  <p className="text-lg font-medium text-gray-800">{totalRentalIncome} ETH</p>
                </div>
              </div>
            </div>
          </div>
            <div className="flex items-center border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <Calendar className="h-5 w-5 text-primary" />
              <div className="ml-3">
                <p className="text-sm text-gray-500">Last Rental Update</p>
                <p className="text-lg font-medium text-gray-800">{property.lastRentalUpdate}</p>
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
                ) : oracleStatus.cooldownActive ? (
                  <AlertCircle className="h-4 w-4 text-orange-500 mr-2" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                )}
                <div>
                  <p className="text-xs text-gray-500">Oracle Status</p>
                  <p className="text-sm font-medium">
                    {oracleStatus.hasPendingRequests ? 'Processing...' : 
                     oracleStatus.cooldownActive ? 'Cooldown Active' : 'Ready'}
                  </p>
                </div>
              </div>

              <div className="flex items-center border border-gray-200 rounded-lg p-3">
                <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                <div>
                  <p className="text-xs text-gray-500">
                    {oracleStatus.cooldownActive ? 'Cooldown Remaining' : 'Last Update'}
                  </p>
                  <p className="text-sm font-medium">
                    {oracleStatus.cooldownActive ? 
                      `${Math.floor(oracleStatus.cooldownTimeRemaining / 60)}m ${oracleStatus.cooldownTimeRemaining % 60}s` :
                      (lastOracleUpdate ? new Date(lastOracleUpdate).toLocaleString() : 'Never')
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Oracle Actions */}
            <div className="flex space-x-2">
              <Button
                onClick={() => setShowValuationForm(!showValuationForm)}
                disabled={oracleLoading || !oracleStatus.canRequestUpdate || (permissionStatus && !permissionStatus.canRequest)}
                className="flex items-center"
                title={
                  permissionStatus && !permissionStatus.canRequest 
                    ? permissionStatus.reason 
                    : oracleStatus.cooldownActive
                      ? `Cooldown active: ${Math.floor(oracleStatus.cooldownTimeRemaining / 60)}m ${oracleStatus.cooldownTimeRemaining % 60}s remaining`
                      : oracleStatus.hasPendingRequests
                        ? "Request is being processed (30 seconds)"
                        : "Request property valuation update"
                }
              >
                {oracleLoading || oracleStatus.hasPendingRequests ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                {permissionStatus && !permissionStatus.canRequest 
                  ? "Admin Only" 
                  : oracleStatus.cooldownActive
                    ? `Cooldown (${Math.floor(oracleStatus.cooldownTimeRemaining / 60)}m)`
                    : oracleStatus.hasPendingRequests
                      ? "Processing..."
                      : showValuationForm ? "Hide Form" : "Request Update"
                }
              </Button>
            </div>

            {/* Enhanced Valuation Request Form */}
            {showValuationForm && (
              <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h4 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Request Property Valuation
                </h4>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Real Estate API Integration</p>
                      <p>This will fetch current market valuations from RentCast API using real estate data from 155M+ properties.</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleValuationFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        value={valuationFormData.address}
                        onChange={(e) => setValuationFormData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="123 Main Street"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        value={valuationFormData.city}
                        onChange={(e) => setValuationFormData(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="New York"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        value={valuationFormData.state}
                        onChange={(e) => setValuationFormData(prev => ({ ...prev, state: e.target.value.toUpperCase() }))}
                        placeholder="NY"
                        maxLength={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        value={valuationFormData.zipCode}
                        onChange={(e) => setValuationFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                        placeholder="10001"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Square Footage *
                    </label>
                    <input
                      type="number"
                      value={valuationFormData.squareFootage}
                      onChange={(e) => setValuationFormData(prev => ({ ...prev, squareFootage: e.target.value }))}
                      placeholder="2000"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={valuationFormData.useCustomApiKey}
                      onCheckedChange={(checked) => setValuationFormData(prev => ({ ...prev, useCustomApiKey: checked }))}
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Use Custom API Key
                    </label>
                  </div>
                  
                  {valuationFormData.useCustomApiKey && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        RentCast API Key *
                      </label>
                      <input
                        type="password"
                        value={valuationFormData.customApiKey}
                        onChange={(e) => setValuationFormData(prev => ({ ...prev, customApiKey: e.target.value }))}
                        placeholder="Enter your RentCast API key"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                      <p className="text-sm text-gray-600 mt-1">
                        Get your API key from <a href="https://api.rentcast.io/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">RentCast API</a>
                      </p>
                    </div>
                  )}
                  
                  <div className="p-3 bg-white rounded-lg border">
                    <p className="text-sm font-medium text-gray-700 mb-1">Request Preview:</p>
                    <p className="text-sm text-gray-600">
                      <strong>Address:</strong> {[valuationFormData.address, valuationFormData.city, valuationFormData.state, valuationFormData.zipCode].filter(Boolean).join(', ') || 'Please fill in address fields'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Size:</strong> {valuationFormData.squareFootage || 'N/A'} sq ft
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>API:</strong> {valuationFormData.useCustomApiKey ? 'Custom API Key' : 'Default API Key'}
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={oracleLoading}
                  >
                    {oracleLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Requesting Valuation...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Submit Valuation Request
                      </>
                    )}
                  </Button>
                </form>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

