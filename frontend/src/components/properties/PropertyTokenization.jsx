import React, { useState } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from 'lucide-react';
import { toast } from "react-toastify";
import usePropertyTokenization from "../../hooks/usePropertyTokenization";
import useFetchProperties from "../../hooks/useFetchProperties";

export function PropertyTokenization() {
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [valuation, setValuation] = useState("");
  const [tokenPrice, setTokenPrice] = useState("");
  const [rentalYield, setRentalYield] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [tokenSupply, setTokenSupply] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { tokenizeProperty } = usePropertyTokenization();
  const properties = useFetchProperties();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Validate inputs
      if (!selectedPropertyId || !valuation || !tokenPrice || !rentalYield || !propertyType || !tokenSupply) {
        throw new Error("All fields are required");
      }

      if (parseFloat(valuation) <= 0 || parseFloat(tokenPrice) <= 0 || parseFloat(rentalYield) <= 0) {
        throw new Error("Numeric values must be greater than 0");
      }

      if (parseInt(tokenSupply) <= 0) {
        throw new Error("Token supply must be greater than 0");
      }

      const result = await tokenizeProperty(
        selectedPropertyId,
        valuation,
        tokenPrice,
        rentalYield,
        propertyType,
        tokenSupply
      );

      if (result) {
        toast.success("Property tokenized successfully");
        // Reset form
        setSelectedPropertyId("");
        setValuation("");
        setTokenPrice("");
        setRentalYield("");
        setPropertyType("");
        setTokenSupply("");
      }
    } catch (err) {
      console.error("Error in tokenizing property:", err);
      setError(err.message || "Failed to tokenize property");
      toast.error(err.message || "Failed to tokenize property");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Tokenize Existing Property</CardTitle>
        <CardDescription>
          Select an existing property and provide tokenization details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="propertyId">Select Property</Label>
            <Select
              value={selectedPropertyId}
              onValueChange={(value) => setSelectedPropertyId(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a property" />
              </SelectTrigger>
              <SelectContent>
                {properties.length === 0 ? (
                  <SelectItem value="loading">Loading properties...</SelectItem>
                ) : (
                  properties.map((property) => (
                    <SelectItem key={property.id} value={property.id.toString()}>
                      {property.name} - {property.location}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="valuation">Property Valuation (ETH)</Label>
            <Input
              id="valuation"
              placeholder="Enter property valuation in ETH"
              value={valuation}
              onChange={(e) => setValuation(e.target.value)}
              type="number"
              step="0.000000000000000001"
              min="0"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tokenPrice">Token Price (ETH)</Label>
            <Input
              id="tokenPrice"
              placeholder="Enter token price in ETH"
              value={tokenPrice}
              onChange={(e) => setTokenPrice(e.target.value)}
              type="number"
              step="0.000000000000000001"
              min="0"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rentalYield">Rental Yield (%)</Label>
            <Input
              id="rentalYield"
              placeholder="Enter rental yield percentage"
              value={rentalYield}
              onChange={(e) => setRentalYield(e.target.value)}
              type="number"
              step="0.01"
              min="0"
              max="100"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="propertyType">Property Type</Label>
            <Select
              value={propertyType}
              onValueChange={setPropertyType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Residential">Residential</SelectItem>
                <SelectItem value="Commercial">Commercial</SelectItem>
                <SelectItem value="Industrial">Industrial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tokenSupply">Token Supply</Label>
            <Input
              id="tokenSupply"
              placeholder="Enter token supply"
              value={tokenSupply}
              onChange={(e) => setTokenSupply(e.target.value)}
              type="number"
              min="1"
              required
            />
          </div>
          {error && <div className="text-red-500">{error}</div>}
          <Button type="submit" disabled={isLoading || properties.length === 0}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Tokenizing...
              </>
            ) : (
              "Tokenize Property"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}

export default PropertyTokenization;