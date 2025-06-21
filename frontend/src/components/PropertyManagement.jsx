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
} from "../hooks/Properties";
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

  const { properties, loading: propertiesLoading } = useAllProperties();
  const { property } = useGetProperty(selectedPropertyId);
  const { updateProperty, loading: updateLoading } = useUpdateProperty();
  const { updatePropertyValuation, loading: valuationLoading } = useUpdatePropertyValuation();
  const { updateRentalIncome, loading: rentalLoading } = useUpdateRentalIncome();
  const { requestValuationUpdate, loading: oracleLoading } = useRequestValuationUpdate();

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

  if (propertiesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        Loading properties...
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
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PropertyManagement; 