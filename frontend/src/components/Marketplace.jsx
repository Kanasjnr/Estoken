import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const marketplaceListings = [
  { id: 1, property: "Luxury Apartment", tokenPrice: "$105", quantity: 100, image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" },
  { id: 2, property: "Beach House", tokenPrice: "$80", quantity: 50, image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" },
  { id: 3, property: "Mountain Cabin", tokenPrice: "$55", quantity: 200, image: "https://images.unsplash.com/photo-1518732714860-b62714ce0c59?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" },
]

export function Marketplace() {
  const [listingDetails, setListingDetails] = useState({
    property: '',
    tokenPrice: '',
    quantity: ''
  })

  const handleInputChange = (e) => {
    setListingDetails({
      ...listingDetails,
      [e.target.name]: e.target.value
    })
  }

  const handleCreateListing = (e) => {
    e.preventDefault()
    console.log('Creating listing:', listingDetails)
  }

  const handleBuy = (listing) => {
    console.log('Buying from listing:', listing)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Marketplace</h2>
      <Card>
        <CardHeader>
          <CardTitle>Create Listing</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateListing} className="space-y-4">
            <div>
              <Label htmlFor="property">Property</Label>
              <Input
                id="property"
                name="property"
                value={listingDetails.property}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="tokenPrice">Token Price</Label>
              <Input
                id="tokenPrice"
                name="tokenPrice"
                value={listingDetails.tokenPrice}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                value={listingDetails.quantity}
                onChange={handleInputChange}
              />
            </div>
            <Button type="submit">Create Listing</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Available Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Token Price</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {marketplaceListings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <img src={listing.image} alt={listing.property} className="w-10 h-10 rounded-full object-cover" />
                      <span>{listing.property}</span>
                    </div>
                  </TableCell>
                  <TableCell>{listing.tokenPrice}</TableCell>
                  <TableCell>{listing.quantity}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleBuy(listing)}>Buy</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

