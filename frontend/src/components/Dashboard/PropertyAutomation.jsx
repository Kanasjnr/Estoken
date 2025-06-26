import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert } from '../ui/alert';
import { usePropertyAutomation, useAutomationEvents, useAllProperties } from '../../hooks/Properties';
import PropertyCardWithAutomation from '../properties/PropertyCardWithAutomation';
import { Clock, Settings, Activity, AlertTriangle, CheckCircle } from 'lucide-react';

const PropertyAutomation = () => {
  const [automationConfig, setAutomationConfig] = useState(null);
  const [propertiesNeedingUpdate, setPropertiesNeedingUpdate] = useState([]);
  
  const {
    loading: automationLoading,
    error: automationError,
    getPropertiesNeedingUpdate,
    getAutomationConfig
  } = usePropertyAutomation();

  const { events: automationEvents } = useAutomationEvents();
  const { properties, loading: propertiesLoading, fetchProperties } = useAllProperties();

  // Load automation configuration and properties needing updates
  useEffect(() => {
    const loadAutomationData = async () => {
      try {
        const [config, needingUpdate] = await Promise.all([
          getAutomationConfig(),
          getPropertiesNeedingUpdate()
        ]);
        setAutomationConfig(config);
        setPropertiesNeedingUpdate(needingUpdate);
      } catch (error) {
        console.error('Error loading automation data:', error);
      }
    };

    loadAutomationData();
    fetchProperties();
  }, [getAutomationConfig, getPropertiesNeedingUpdate, fetchProperties]);



  const formatInterval = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    return `${hours} hours`;
  };

  const formatTimestamp = (timestamp) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleString();
  };

  const recentEvents = automationEvents
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);

  if (propertiesLoading || automationLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading automation settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Property Automation</h1>
          <p className="text-gray-600 mt-1">
            Manage automated property valuation updates using Chainlink Automation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium">
            {propertiesNeedingUpdate.length} properties need updates
          </span>
        </div>
      </div>

      {automationError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <div className="text-red-800">
            <strong>Error:</strong> {automationError}
          </div>
        </Alert>
      )}

      {/* Automation Configuration */}
      {automationConfig && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Automation Configuration
            </CardTitle>
            <CardDescription>
              Current Chainlink Automation settings for property updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-blue-600 bg-blue-100 rounded-lg p-2" />
                <div>
                  <p className="text-sm text-gray-600">Update Interval</p>
                  <p className="font-semibold">{formatInterval(automationConfig.updateInterval)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-green-600 bg-green-100 rounded-lg p-2" />
                <div>
                  <p className="text-sm text-gray-600">Max Updates Per Batch</p>
                  <p className="font-semibold">{automationConfig.maxUpdatesPerUpkeep}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-purple-600 bg-purple-100 rounded-lg p-2" />
                <div>
                  <p className="text-sm text-gray-600">Last Update</p>
                  <p className="font-semibold text-sm">
                    {formatTimestamp(automationConfig.lastUpdateTime)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Property Automation Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Property Auto-Update Settings</CardTitle>
          <CardDescription>
            Enable or disable automatic valuation updates for your properties
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties?.map((property) => (
                              <PropertyCardWithAutomation
                  key={property.id}
                  property={property}
                  showAutomation={true}
                  onClick={() => console.log('Property clicked:', property.id)}
                />
            ))}
            {(!properties || properties.length === 0) && (
              <div className="col-span-full">
                <p className="text-gray-500 text-center py-8">
                  No properties found. Tokenize a property to enable automation.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Automation Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Automation Activity</CardTitle>
          <CardDescription>
            Latest automation events and property updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentEvents.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    event.name === 'PropertyUpdateTriggered' ? 'bg-green-500' :
                    event.name === 'AutoUpdateEnabled' ? 'bg-blue-500' : 'bg-purple-500'
                  }`} />
                  <div>
                    <p className="font-medium text-sm">
                      {event.name === 'PropertyUpdateTriggered' && 'Property Update Triggered'}
                      {event.name === 'AutoUpdateEnabled' && 'Auto-Update Settings Changed'}
                      {event.name === 'AutomationConfigUpdated' && 'Automation Config Updated'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {event.args?.propertyId && `Property #${event.args.propertyId}`}
                      {event.args?.enabled !== undefined && ` - ${event.args.enabled ? 'Enabled' : 'Disabled'}`}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </Badge>
              </div>
            ))}
            {recentEvents.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No recent automation activity
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyAutomation; 