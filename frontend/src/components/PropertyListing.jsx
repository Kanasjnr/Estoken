// import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const properties = [
  { id: 1, name: "Luxury Apartment", location: "New York", valuation: "$1,000,000", tokenPrice: "$100", rentalYield: "5%" },
  { id: 2, name: "Beach House", location: "Miami", valuation: "$750,000", tokenPrice: "$75", rentalYield: "4.5%" },
  { id: 3, name: "Mountain Cabin", location: "Aspen", valuation: "$500,000", tokenPrice: "$50", rentalYield: "3.8%" },
]

function PropertyListing() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Property Listings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <Card key={property.id}>
            <CardHeader>
              <CardTitle>{property.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Location: {property.location}</p>
              <p>Valuation: {property.valuation}</p>
              <p>Token Price: {property.tokenPrice}</p>
              <p>Rental Yield: {property.rentalYield}</p>
              <div className="mt-4 flex justify-between">
                <Button variant="outline">View Details</Button>
                <Button>Buy Tokens</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default PropertyListing

