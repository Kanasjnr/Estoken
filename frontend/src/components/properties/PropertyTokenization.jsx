import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2 } from 'lucide-react'
import usePropertyToken from '../../hooks/usePropertyToken'
import useFetchProperties from '../../hooks/useFetchProperties'

export function PropertyTokenization() {
  const [selectedPropertyId, setSelectedPropertyId] = useState('')
  const [tokenSupply, setTokenSupply] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const { mint } = usePropertyToken()
  const properties = useFetchProperties()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    if (!selectedPropertyId || !tokenSupply) {
      setError("Please fill in all fields")
      setIsLoading(false)
      return
    }

    try {
      const selectedProperty = properties.find(p => p.id === selectedPropertyId)
      if (!selectedProperty) {
        throw new Error("Selected property not found")
      }

      await mint({
        ...selectedProperty,
        tokenSupply: tokenSupply,
      })
      setSuccess(true)
      setSelectedPropertyId('')
      setTokenSupply('')
    } catch (err) {
      setError(err.message || "An error occurred while tokenizing the property.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Tokenize Existing Property</CardTitle>
        <CardDescription>Select an existing property and provide tokenization details.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="propertyId">Select Property</Label>
            <Select
              value={selectedPropertyId}
              onValueChange={setSelectedPropertyId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a property" />
              </SelectTrigger>
              <SelectContent>
                {properties.length === 0 ? (
                  <SelectItem value="loading">Loading properties...</SelectItem>
                ) : (
                  properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name} - {property.location}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">Choose the property you want to tokenize.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tokenSupply">Token Supply</Label>
            <Input
              id="tokenSupply"
              placeholder="Enter token supply"
              value={tokenSupply}
              onChange={(e) => setTokenSupply(e.target.value)}
            />
            <p className="text-sm text-gray-500">The total number of tokens to be issued for this property.</p>
          </div>
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
      <CardFooter>
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert>
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>Property has been successfully tokenized!</AlertDescription>
          </Alert>
        )}
      </CardFooter>
    </Card>
  )
}

export default PropertyTokenization

