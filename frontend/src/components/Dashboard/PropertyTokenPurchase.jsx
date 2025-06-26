import { useState, useEffect } from "react"
import useAllProperties from "../../hooks/Properties/useAllProperties"
import usePropertyWithOracle from "../../hooks/Properties/usePropertyWithOracle"
import useBuyTokens from "../../hooks/Properties/useBuyTokenShares"
import { Card, CardContent, CardDescription, CardHeader, CardTitle,CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Zap, TrendingUp, AlertCircle, Clock } from "lucide-react"
import { ethers } from "ethers"

// Component to display individual property with oracle support
const PropertyCardWithOracle = ({ prop, selectedProperty, onSelect }) => {
  const { getSimulatedValuation } = usePropertyWithOracle(prop.id);
  const simulatedValuation = getSimulatedValuation();

  // Use simulated valuation if available, otherwise use property valuation
  const displayCurrentValuation = simulatedValuation ? 
    simulatedValuation.newValuation : 
    prop.currentValuation;

  return (
    <Card
      className={`cursor-pointer transition-all duration-300 ${selectedProperty === prop.id ? "ring-2 ring-primary" : ""}`}
      onClick={() => onSelect(prop.id)}
      aria-label={`Select property ${prop.name}`}
    >
      <CardHeader>
        <CardTitle>{prop.name}</CardTitle>
        <CardDescription>{prop.location}</CardDescription>
      </CardHeader>
      <CardContent>
        <img
          src={prop.imageUrls[0] || "/placeholder.svg?height=200&width=300"}
          alt={prop.name}
          className="w-full h-48 object-cover rounded-md mb-4"
        />
        <p className="text-sm text-gray-600 mb-2">{prop.description}</p>
        <div className="space-y-1">
          <p className="font-semibold">Price per token: {prop.pricePerShare} ETH</p>
          <p>Available tokens: {prop.availableShares}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-gray-500">Current Valuation:</span>
            <span className="text-sm font-medium">
              {displayCurrentValuation} ETH
              {simulatedValuation && (
                <span className="text-xs text-green-600 ml-1">(Updated)</span>
              )}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const PropertyTokenPurchase = () => {
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [purchaseAmount, setPurchaseAmount] = useState("")
  const [purchaseStatus, setPurchaseStatus] = useState(null)
  const [localProperties, setLocalProperties] = useState([])

  const {
    properties,
    loading: propertiesLoading,
    error: propertiesError,
    refetch: refetchProperties,
  } = useAllProperties()
  const { 
    property, 
    oracleData,
    getPropertyOracleStatus,
    lastOracleUpdate,
    loading: propertyLoading 
  } = usePropertyWithOracle(selectedProperty)
  const { buyTokens, loading: buyLoading, error: buyError } = useBuyTokens()

  useEffect(() => {
    if (properties) {
      setLocalProperties(properties)
    }
  }, [properties])

  const handlePropertySelect = (propertyId) => {
    setSelectedProperty(propertyId)
    setPurchaseAmount("")
    setPurchaseStatus(null)
    console.log(`Selected Property ID: ${propertyId}`)
  }

  const handlePurchase = async () => {
    console.log(`Attempting purchase for Property ID: ${selectedProperty} with Amount: ${purchaseAmount}`)
    console.log(`Property details:`, property)

    if (!selectedProperty || !purchaseAmount || !property || isNaN(purchaseAmount) || Number(purchaseAmount) <= 0) {
      setPurchaseStatus("Error: Invalid inputs. Please try again.")
      console.log("Error: Invalid inputs", { selectedProperty, purchaseAmount, property })
      return
    }

    if (!Number.isInteger(Number(purchaseAmount))) {
      setPurchaseStatus("Error: Amount must be a whole number.")
      return
    }

    try {
      const success = await buyTokens(selectedProperty, Math.floor(Number(purchaseAmount)), property.pricePerShare)

      if (success) {
        setPurchaseStatus("Success: Tokens purchased successfully!")
        console.log("Tokens purchased successfully")

        // Update local state to reflect the purchase
        setLocalProperties((prevProperties) =>
          prevProperties.map((prop) =>
            prop.id === selectedProperty
              ? { ...prop, availableShares: (Number(prop.availableShares) - Number(purchaseAmount)).toString() }
              : prop,
          ),
        )

        refetchProperties()
      } else {
        setPurchaseStatus("Error: Failed to purchase tokens. Please try again.")
        console.log("Error: Failed to purchase tokens")
      }
    } catch (error) {
      const userFriendlyError = error.message.includes("insufficient funds")
        ? "Error: Insufficient funds in your wallet."
        : error.message.includes("gas")
          ? "Error: Gas limit too low or insufficient XFI for gas."
          : `Error: ${error.message}`

      console.log(userFriendlyError)
    }
  }

  if (propertiesLoading) {
    console.log("Loading properties...")
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-4 text-xl font-medium text-blue-600">Loading properties...</p>
      </div>
    )
  }

  if (propertiesError) {
    console.log(`Error loading properties: ${propertiesError}`)
    return <div className="text-center p-4 text-red-500">Error: {propertiesError}</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Property Token Marketplace</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {localProperties.map((prop) => (
          <PropertyCardWithOracle
            key={prop.id}
            prop={prop}
            selectedProperty={selectedProperty}
            onSelect={handlePropertySelect}
          />
        ))}
      </div>

      {selectedProperty && property && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Purchase Tokens for {property.name}</span>
              {lastOracleUpdate && (
                <Badge variant="outline" className="flex items-center">
                  <Zap className="h-3 w-3 mr-1" />
                  Oracle Updated
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Enter the number of tokens you want to purchase</CardDescription>
            {lastOracleUpdate && (
              <div className="flex items-center text-sm text-gray-500 mt-2">
                <Clock className="h-4 w-4 mr-1" />
                Last valuation update: {new Date(lastOracleUpdate).toLocaleString()}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div>
                <Label htmlFor="purchaseAmount">Number of Tokens</Label>
                <Input
                  id="purchaseAmount"
                  type="number"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value)}
                  placeholder="Enter amount"
                  aria-invalid={purchaseAmount <= 0 || !Number.isInteger(Number(purchaseAmount))}
                  aria-describedby="purchaseAmountError"
                />
                {purchaseAmount <= 0 || !Number.isInteger(Number(purchaseAmount)) ? (
                  <span id="purchaseAmountError" className="text-sm text-red-500">
                    Please enter a valid whole number greater than zero.
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-gray-600">
                Total Cost:{" "}
                {purchaseAmount && property?.pricePerShare
                  ? `${(Number(purchaseAmount) * Number((property.pricePerShare))).toFixed(4)} ETH`
                  : "0 ETH"}
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handlePurchase}
              disabled={
                buyLoading || !purchaseAmount || purchaseAmount <= 0 || !Number.isInteger(Number(purchaseAmount))
              }
              className="w-full"
            >
              {buyLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </div>
              ) : (
                "Purchase Tokens"
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {purchaseStatus && (
        <div
          className={`mt-4 p-4 rounded-md ${purchaseStatus.startsWith("Success") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
          role="alert"
        >
          {purchaseStatus}
        </div>
      )}

      {buyError && <div className="mt-4 p-4 rounded-md bg-red-100 text-red-800">Error: {buyError}</div>}
    </div>
  )
}

export default PropertyTokenPurchase