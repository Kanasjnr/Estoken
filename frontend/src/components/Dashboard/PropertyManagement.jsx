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
  useUpdatePropertyValuation,
  useUpdateRentalIncome,
  useRequestValuationUpdate
} from "../../hooks/Properties";
import { Building, DollarSign, Edit3, RefreshCw, Zap } from "lucide-react";

const PropertyManagement = () => {
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [updateForm, setUpdateForm] = useState({
    name: "",
    location: "",
    description: "",
    pricePerShare: "",
    isActive: true
  });
  const [valuationUpdate, setValuationUpdate] = useState("");
  const [rentalIncomeUpdate, setRentalIncomeUpdate] = useState("");
  const [oracleParams, setOracleParams] = useState({
    location: "",
    size: "2000"
  });

  const { properties, loading: propertiesLoading, error: propertiesError } = useAllProperties();
  const { property } = useGetProperty(selectedPropertyId);
  const { updateProperty, loading: updateLoading } = useUpdateProperty();
  const { updatePropertyValuation, loading: valuationLoading } = useUpdatePropertyValuation();
  const { updateRentalIncome, loading: rentalLoading } = useUpdateRentalIncome();
  const { requestValuationUpdate, loading: oracleLoading } = useRequestValuationUpdate();

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
      setOracleParams({
        location: property.location || "",
        size: property.description?.match(/(\d+)\s*sq\s*ft/i)?.[1] || "2000"
      });
    }
  }, [property]);

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

  const handleUpdateValuation = async () => {
    if (!selectedPropertyId || !valuationUpdate) return;
    
    try {
      await updatePropertyValuation(selectedPropertyId, valuationUpdate);
      setValuationUpdate("");
    } catch (error) {
      console.error("Failed to update valuation:", error);
    }
  };

  const handleUpdateRentalIncome = async () => {
    if (!selectedPropertyId || !rentalIncomeUpdate) return;
    
    try {
      await updateRentalIncome(selectedPropertyId, rentalIncomeUpdate);
      setRentalIncomeUpdate("");
    } catch (error) {
      console.error("Failed to update rental income:", error);
    }
  };

  const handleOracleValuationRequest = async () => {
    if (!selectedPropertyId || !oracleParams.location) return;
    
    try {
      await requestValuationUpdate(
        selectedPropertyId, 
        oracleParams.location, 
        oracleParams.size
      );
    } catch (error) {
      console.error("Failed to request Oracle valuation:", error);
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
                <Label htmlFor="pricePerShare">Price Per Share (XFI)</Label>
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

          {/* Valuation and Rental Updates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Financial Updates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Manual Valuation Update */}
              <div className="space-y-2">
                <Label htmlFor="valuation">Update Valuation (XFI)</Label>
                <div className="flex space-x-2">
                  <Input
                    id="valuation"
                    type="number"
                    step="0.0001"
                    value={valuationUpdate}
                    onChange={(e) => setValuationUpdate(e.target.value)}
                    placeholder="New valuation"
                  />
                  <Button 
                    onClick={handleUpdateValuation}
                    disabled={valuationLoading || !valuationUpdate}
                  >
                    {valuationLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Update"}
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Current: {property.currentValuation} XFI
                </p>
              </div>

              {/* Rental Income Update */}
              <div className="space-y-2">
                <Label htmlFor="rental">Update Monthly Rental Income (XFI)</Label>
                <div className="flex space-x-2">
                  <Input
                    id="rental"
                    type="number"
                    step="0.0001"
                    value={rentalIncomeUpdate}
                    onChange={(e) => setRentalIncomeUpdate(e.target.value)}
                    placeholder="New rental income"
                  />
                  <Button 
                    onClick={handleUpdateRentalIncome}
                    disabled={rentalLoading || !rentalIncomeUpdate}
                  >
                    {rentalLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Update"}
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Current: {property.monthlyRentalIncome} XFI
                </p>
              </div>

              {/* Oracle Valuation Request */}
              <div className="border-t pt-4">
                <Label className="flex items-center mb-3">
                  <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                  Oracle Valuation Request
                </Label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="space-y-2">
                    <Label htmlFor="oracleLocation">Location</Label>
                    <Input
                      id="oracleLocation"
                      value={oracleParams.location}
                      onChange={(e) => setOracleParams({...oracleParams, location: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="oracleSize">Size (sq ft)</Label>
                    <Input
                      id="oracleSize"
                      value={oracleParams.size}
                      onChange={(e) => setOracleParams({...oracleParams, size: e.target.value})}
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleOracleValuationRequest}
                  disabled={oracleLoading || !oracleParams.location}
                  variant="outline"
                  className="w-full"
                >
                  {oracleLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  Request Oracle Valuation
                </Button>
              </div>
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <div className="text-center p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-500">Created</p>
                <p className="text-sm font-medium">{property.creationTimestamp}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PropertyManagement; 