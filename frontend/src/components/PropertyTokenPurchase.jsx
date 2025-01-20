import  { useState } from "react"
import useAllProperties from "../hooks/useAllProperties"
import useGetProperty from "../hooks/useGetProperty"
import useBuyTokens from "../hooks/useBuyTokens"
import { ethers } from "ethers"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

const PropertyTokenPurchase = () => {
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [purchaseAmount, setPurchaseAmount] = useState("")
  const [purchaseStatus, setPurchaseStatus] = useState(null)

  const { properties, loading: propertiesLoading, error: propertiesError } = useAllProperties()
  const { property, loading: propertyLoading, error: propertyError } = useGetProperty(selectedProperty)
  const { buyTokens, loading: buyLoading, error: buyError } = useBuyTokens()

  const handlePropertySelect = (propertyId) => {
    setSelectedProperty(propertyId)
    setPurchaseAmount("")
    setPurchaseStatus(null)
    console.log(`Selected Property ID: ${propertyId}`)
  }

  const handlePurchase = async () => {
    console.log(`Attempting purchase for Property ID: ${selectedProperty} with Amount: ${purchaseAmount}`)

    if (!selectedProperty || !purchaseAmount || !property || isNaN(purchaseAmount) || Number(purchaseAmount) <= 0) {
      setPurchaseStatus("Error: Invalid inputs. Please try again.")
      console.log("Error: Invalid inputs")
      return
    }

    try {
      const success = await buyTokens(
        selectedProperty,
        ethers.BigNumber.from(purchaseAmount),
        property.pricePerShare.toString(),
      )

      if (success) {
        setPurchaseStatus("Success: Tokens purchased successfully!")
        console.log("Tokens purchased successfully")
      } else {
        setPurchaseStatus("Error: Failed to purchase tokens. Please try again.")
        console.log("Error: Failed to purchase tokens")
      }
    } catch (error) {
      setPurchaseStatus(`Error: ${error.message}`)
      console.log(`Error: ${error.message}`)
    }
  }

  if (propertiesLoading) {
    console.log("Loading properties...")
    return <div className="text-center p-4">Loading properties...</div>
  }

  if (propertiesError) {
    console.log(`Error loading properties: ${propertiesError}`)
    return <div className="text-center p-4 text-red-500">Error: {propertiesError}</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Property Token Marketplace</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((prop) => (
          <Card
            key={prop.id}
            className={`cursor-pointer transition-all duration-300 ${selectedProperty === prop.id ? "ring-2 ring-primary" : ""}`}
            onClick={() => handlePropertySelect(prop.id)}
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
              <p className="font-semibold">Price per token: {prop.pricePerShare} ETH</p>
              <p>Available tokens: {prop.totalShares}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedProperty && property && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Purchase Tokens for {property.name}</CardTitle>
            <CardDescription>Enter the number of tokens you want to purchase</CardDescription>
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
                />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  Total Cost:{" "}
                  {purchaseAmount
                    ? `${(Number(purchaseAmount) * Number(property.pricePerShare)).toFixed(4)} ETH`
                    : "0 ETH"}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handlePurchase} disabled={buyLoading || !purchaseAmount} className="w-full">
              {buyLoading ? "Processing..." : "Purchase Tokens"}
            </Button>
          </CardFooter>
        </Card>
      )}

      {purchaseStatus && (
        <div
          className={`mt-4 p-4 rounded-md ${purchaseStatus.startsWith("Success") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          {purchaseStatus}
        </div>
      )}

      {buyError && <div className="mt-4 p-4 rounded-md bg-red-100 text-red-800">Error: {buyError}</div>}
    </div>
  )
}

export default PropertyTokenPurchase

