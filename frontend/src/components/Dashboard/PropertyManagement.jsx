"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  useAllProperties, 
  useGetProperty, 
  useUpdateProperty,
  usePropertyAutomation
} from "../../hooks/Properties";
import { Building, Edit3, RefreshCw, Bot, Settings } from "lucide-react";

const PropertyManagement = () => {
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [updateForm, setUpdateForm] = useState({
    name: "",
    location: "",
    description: "",
    pricePerShare: "",
    isActive: true
  });

  const [autoUpdateEnabled, setAutoUpdateEnabledState] = useState(false);
  const [needsUpdate, setNeedsUpdate] = useState(false);

  const { properties, loading: propertiesLoading, error: propertiesError } = useAllProperties();
  const { property } = useGetProperty(selectedPropertyId);
  const { updateProperty, loading: updateLoading } = useUpdateProperty();
  
  // Add automation hook
  const {
    setAutoUpdateEnabled,
    isAutoUpdateEnabled,
    shouldUpdateProperty,
    loading: automationLoading
  } = usePropertyAutomation();

  // Debug logging
  useEffect(() => {
    console.log("PropertyManagement Debug:", {
      propertiesLoading,
      propertiesError,
      properties,
      propertiesCount: properties?.length || 0,
      contractAddress: import.meta.env.VITE_APP_REAL_ESTATE_TOKEN_ADDRESS,
      chainId: import.meta.env.VITE_CHAIN_ID,
      allEnvVars: import.meta.env
    });
  }, [propertiesLoading, propertiesError, properties]);

  // Update form when property is selected
  useEffect(() => {
    if (property) {
      setUpdateForm({
        name: property.name || "",
        location: property.location || "",
        description: property.description || "",
        pricePerShare: property.pricePerShare || "",
        isActive: property.isActive || true
      });

      
      // Check automation status for selected property
      checkAutomationStatus();
    }
  }, [property, selectedPropertyId]);
  
  const checkAutomationStatus = async () => {
    if (!selectedPropertyId) return;
    
    try {
      const [enabled, shouldUpdate] = await Promise.all([
        isAutoUpdateEnabled(selectedPropertyId),
        shouldUpdateProperty(selectedPropertyId)
      ]);
      setAutoUpdateEnabledState(enabled);
      setNeedsUpdate(shouldUpdate);
    } catch (error) {
      console.error('Error checking automation status:', error);
    }
  };

  const handleToggleAutomation = async (enabled) => {
    if (!selectedPropertyId) return;
    
    try {
      await setAutoUpdateEnabled(selectedPropertyId, enabled);
      setAutoUpdateEnabledState(enabled);
    } catch (error) {
      console.error('Error toggling automation:', error);
    }
  };

  const handleUpdateProperty = async () => {
    if (!selectedPropertyId || !updateForm.name || !updateForm.pricePerShare) return;
    
    try {
      await updateProperty(
        selectedPropertyId,
        updateForm.name,
        updateForm.location,
        updateForm.description,
        updateForm.pricePerShare,
        updateForm.isActive
      );
    } catch (error) {
      console.error("Failed to update property:", error);
    }
  };



  if (propertiesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        Loading properties...
      </div>
    );
  }

  if (propertiesError) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-6">
          <Building className="h-8 w-8 mr-3 text-blue-500" />
          <h1 className="text-3xl font-bold text-gray-900">Property Management</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-red-500 mb-2">Error loading properties</div>
              <div className="text-sm text-gray-600">{propertiesError}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!properties || properties.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-6">
          <Building className="h-8 w-8 mr-3 text-blue-500" />
          <h1 className="text-3xl font-bold text-gray-900">Property Management</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Building className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Found</h3>
              <p className="text-gray-600">
                No properties are currently available for management. Please tokenize some properties first.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center mb-6">
        <Building className="h-8 w-8 mr-3 text-blue-500" />
        <h1 className="text-3xl font-bold text-gray-900">Property Management</h1>
      </div>

      {/* Property Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Property</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a property to manage" />
            </SelectTrigger>
            <SelectContent>
              {properties?.map((prop) => (
                <SelectItem key={prop.id} value={prop.id.toString()}>
                  {prop.name} - {prop.location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedPropertyId && property && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Property Information Update */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Edit3 className="h-5 w-5 mr-2" />
                Update Property Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Property Name</Label>
                <Input
                  id="name"
                  value={updateForm.name}
                  onChange={(e) => setUpdateForm({...updateForm, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={updateForm.location}
                  onChange={(e) => setUpdateForm({...updateForm, location: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={updateForm.description}
                  onChange={(e) => setUpdateForm({...updateForm, description: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pricePerShare">Price Per Share (ETH)</Label>
                <Input
                  id="pricePerShare"
                  type="number"
                  step="0.0001"
                  value={updateForm.pricePerShare}
                  onChange={(e) => setUpdateForm({...updateForm, pricePerShare: e.target.value})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Property Active</Label>
                <Switch
                  id="isActive"
                  checked={updateForm.isActive}
                  onCheckedChange={(checked) => setUpdateForm({...updateForm, isActive: checked})}
                />
              </div>
              
              <Button 
                onClick={handleUpdateProperty}
                disabled={updateLoading}
                className="w-full"
              >
                {updateLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Edit3 className="h-4 w-4 mr-2" />}
                Update Property
              </Button>
            </CardContent>
          </Card>



          {/* Property Automation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bot className="h-5 w-5 mr-2 text-purple-600" />
                Property Automation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Settings className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium">Auto-Update Valuation</p>
                    <p className="text-sm text-gray-500">
                      {autoUpdateEnabled 
                        ? 'Automatically update property valuation every 24 hours using Chainlink Automation'
                        : 'Enable to automatically update property valuation using Chainlink Automation'
                      }
                    </p>
                  </div>
                </div>
                <Switch
                  checked={autoUpdateEnabled}
                  onCheckedChange={handleToggleAutomation}
                  disabled={automationLoading}
                />
              </div>
              
              {autoUpdateEnabled && (
                <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r">
                  <p className="text-sm text-blue-800">
                    <strong>Automation Active:</strong> This property will be automatically updated 
                    when the conditions are met (24-hour interval and significant market changes).
                  </p>
                  {needsUpdate && (
                    <p className="text-sm text-orange-800 mt-1">
                      <strong>Status:</strong> Property is eligible for automatic update.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {property && (
        <Card>
          <CardHeader>
            <CardTitle>Current Property Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-500">Total Shares</p>
                <p className="text-lg font-semibold">{property.totalShares}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-500">Available Shares</p>
                <p className="text-lg font-semibold">{property.availableShares}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-500">Status</p>
                <Badge variant={property.isActive ? "default" : "secondary"}>
                  {property.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PropertyManagement; 