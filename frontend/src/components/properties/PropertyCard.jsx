import { useState, useEffect } from 'react';
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Users,
  Building,
  TrendingUp,
  DollarSign,
  Bot,
  Clock,
  AlertCircle
} from "lucide-react"
import { usePropertyAutomation } from '../../hooks/Properties';
import { Switch } from '../ui/switch';
import usePropertyWithOracle from '../../hooks/Properties/usePropertyWithOracle';

export function PropertyCard({ property, onClick, showAutomation = false }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [needsUpdate, setNeedsUpdate] = useState(false);
  
  const {
    setAutoUpdateEnabled: setAutoUpdate,
    isAutoUpdateEnabled,
    shouldUpdateProperty
  } = usePropertyAutomation();

  // Get simulated valuation for this property
  const { getSimulatedValuation } = usePropertyWithOracle(property?.id);
  const simulatedValuation = getSimulatedValuation();

  useEffect(() => {
    if (showAutomation && property?.id) {
      checkAutomationStatus();
    }
  }, [property?.id, showAutomation]);

  const checkAutomationStatus = async () => {
    try {
      const [enabled, shouldUpdate] = await Promise.all([
        isAutoUpdateEnabled(property.id),
        shouldUpdateProperty(property.id)
      ]);
      setAutoUpdateEnabled(enabled);
      setNeedsUpdate(shouldUpdate);
    } catch (error) {
      console.error('Error checking automation status:', error);
    }
  };

  const handleAutomationToggle = async (enabled) => {
    setLoading(true);
    try {
      await setAutoUpdate(property.id, enabled);
      setAutoUpdateEnabled(enabled);
    } catch (error) {
      console.error('Error toggling automation:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value) => {
    if (typeof value === 'string') return value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Use simulated valuation if available, otherwise use property valuation
  const displayCurrentValuation = simulatedValuation ? 
    simulatedValuation.newValuation : 
    property.currentValuation;
    
  const displayMonthlyRent = simulatedValuation ? 
    (parseFloat(simulatedValuation.newValuation) * 0.005).toFixed(4) : 
    property.monthlyRentalIncome;

  const nextImage = () => {
    if (property.imageUrls && property.imageUrls.length > 1) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % property.imageUrls.length)
    }
  }

  const prevImage = () => {
    if (property.imageUrls && property.imageUrls.length > 1) {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + property.imageUrls.length) % property.imageUrls.length)
    }
  }

  return (
    <Card className="group relative w-full max-w-sm mx-auto overflow-hidden transition-all duration-300 hover:shadow-xl">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg font-semibold line-clamp-1">
              {property.name}
            </CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            {property.isActive ? (
              <Badge variant="success" className="text-xs">
                Active
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                Inactive
              </Badge>
            )}
            {showAutomation && (
              <Badge 
                variant={autoUpdateEnabled ? "default" : "outline"} 
                className="text-xs flex items-center gap-1"
              >
                <Bot className="h-3 w-3" />
                {autoUpdateEnabled ? 'Auto' : 'Manual'}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <AnimatePresence initial={false}>
          <motion.img
            key={currentImageIndex}
            src={property.imageUrls?.[currentImageIndex] || "/placeholder.svg?height=400&width=600"}
            alt={`${property.name} - Image ${currentImageIndex + 1}`}
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onClick={onClick}
          />
        </AnimatePresence>
        {property.imageUrls?.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white"
              onClick={prevImage}
              aria-label="Previous Image"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white"
              onClick={nextImage}
              aria-label="Next Image"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {property.imageUrls?.map((_, index) => (
            <span
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                index === currentImageIndex ? "bg-white scale-125" : "bg-white/50"
              }`}
            />
          ))}
        </div>
        {needsUpdate && showAutomation && (
          <div className="absolute top-2 right-2">
            <Badge variant="destructive" className="text-xs flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Needs Update
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-xl font-bold truncate">{property.name}</h2>
          <Badge variant="secondary" className="text-xs px-2 py-1">
            {property.totalShares} Shares
          </Badge>
        </div>
        <div className="flex items-center text-muted-foreground text-sm mb-4">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="truncate">{property.location}</span>
        </div>
        <Separator className="my-4" />
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            <div>
              <p className="text-xs text-muted-foreground">Current Value</p>
              <p className="text-sm font-semibold">{formatValue(displayCurrentValuation)}</p>
            </div>
          </div>
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
            <div>
              <p className="text-xs text-muted-foreground">Monthly Rent</p>
              <p className="text-sm font-semibold">{formatValue(displayMonthlyRent)}</p>
            </div>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="flex items-center justify-center text-sm">
          <div className="text-gray-600">
            <span>{property.totalShares} shares</span>
          </div>
        </div>
      </CardContent>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-1" />
            <span>
              <strong>{property.currentInvestors}</strong> investors
            </span>
          </div>
          <Link to={`/dashboard/properties/${property.id}`} className="w-1/2">
            <Button className="w-full text-sm" variant="default">
              View Details
            </Button>
          </Link>
        </div>
      </CardHeader>

      {/* Automation Controls */}
      {showAutomation && (
        <>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Auto-Update</p>
                <p className="text-xs text-gray-500">
                  {autoUpdateEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
            <Switch
              checked={autoUpdateEnabled}
              onCheckedChange={handleAutomationToggle}
              disabled={loading}
            />
          </div>
          
          {autoUpdateEnabled && (
            <div className="flex items-center text-xs text-gray-500 mt-2">
              <Clock className="h-3 w-3 mr-1" />
              Updates every 24 hours
              {needsUpdate && (
                <Badge variant="outline" className="ml-2 text-xs">
                  Next update pending
                </Badge>
              )}
            </div>
          )}
        </>
      )}
    </Card>
  )
}
