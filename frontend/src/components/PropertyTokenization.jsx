import  { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function PropertyTokenization() {
  const [propertyDetails, setPropertyDetails] = useState({
    name: '',
    location: '',
    valuation: '',
    rentalIncome: '',
    tokenSupply: ''
  })

  const handleInputChange = (e) => {
    setPropertyDetails({
      ...propertyDetails,
      [e.target.name]: e.target.value
    })
  }

  const handleTokenize = (e) => {
    e.preventDefault()
    console.log('Tokenizing property:', propertyDetails)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Tokenize Your Property</h2>
      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTokenize} className="space-y-4">
            <div>
              <Label htmlFor="name">Property Name</Label>
              <Input id="name" name="name" value={propertyDetails.name} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" value={propertyDetails.location} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="valuation">Valuation</Label>
              <Input id="valuation" name="valuation" value={propertyDetails.valuation} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="rentalIncome">Expected Rental Income</Label>
              <Input id="rentalIncome" name="rentalIncome" value={propertyDetails.rentalIncome} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="tokenSupply">Token Supply</Label>
              <Input id="tokenSupply" name="tokenSupply" value={propertyDetails.tokenSupply} onChange={handleInputChange} />
            </div>
            <Button type="submit">Tokenize Property</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default PropertyTokenization

