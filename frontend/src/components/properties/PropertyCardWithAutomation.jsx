import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { usePropertyAutomation } from '../../hooks/Properties';
import usePropertyWithOracle from '../../hooks/Properties/usePropertyWithOracle';
import { 
  Building, 
  MapPin, 
  TrendingUp, 
  DollarSign,
  Bot,
  Clock,
  AlertCircle
} from 'lucide-react';

const PropertyCardWithAutomation = ({ property, onClick, showAutomation = false }) => {
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
    if (!value || typeof value === 'string') return value || 'N/A';
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

  if (!property) {
    return null;
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg font-semibold line-clamp-1">
              {property.name || 'Unnamed Property'}
            </CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            {property.isActive ? (
              <Badge variant="default" className="text-xs bg-green-500">
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

      <CardContent className="pt-0">
        {/* Property Image */}
        <div className="relative mb-4">
          <img
            src={property.imageUrls?.[0] || '/api/placeholder/400/200'}
            alt={property.name || 'Property'}
            className="w-full h-48 object-cover rounded-lg cursor-pointer"
            onClick={onClick}
          />
          {needsUpdate && showAutomation && (
            <div className="absolute top-2 right-2">
              <Badge variant="destructive" className="text-xs flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Needs Update
              </Badge>
            </div>
          )}
        </div>

        {/* Property Details */}
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="line-clamp-1">{property.location || 'Location not specified'}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center text-sm">
              <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
              <div>
                <p className="text-xs text-gray-500">Current Value</p>
                <p className="font-semibold">
                  {formatValue(displayCurrentValuation)}
                </p>
              </div>
            </div>

            <div className="flex items-center text-sm">
              <DollarSign className="h-4 w-4 mr-2 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">Monthly Rent</p>
                <p className="font-semibold">
                  {formatValue(displayMonthlyRent)}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-600">
              <span>{property.totalShares || 0} shares</span>
            </div>
          </div>

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

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2">
            <Button
              onClick={onClick}
              className="flex-1"
              variant="outline"
              size="sm"
            >
              View Details
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                // Handle property management action
              }}
              className="flex-1"
              size="sm"
            >
              Manage
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCardWithAutomation; 