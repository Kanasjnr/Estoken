import { useState } from 'react'
import { PropertyCard } from './PropertyCard'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const properties = [
  { 
    id: 1, 
    name: "Luxury Apartment", 
    location: "New York", 
    valuation: "$1,000,000", 
    tokenPrice: "$100", 
    rentalYield: "5%",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
  },
  { 
    id: 2, 
    name: "Beach House", 
    location: "Miami", 
    valuation: "$750,000", 
    tokenPrice: "$75", 
    rentalYield: "4.5%",
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
  },
  { 
    id: 3, 
    name: "Mountain Cabin", 
    location: "Aspen", 
    valuation: "$500,000", 
    tokenPrice: "$50", 
    rentalYield: "3.8%",
    image: "https://images.unsplash.com/photo-1518732714860-b62714ce0c59?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
  },
]

export function PropertyListing() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    location: '',
    minPrice: '',
    maxPrice: '',
    minYield: '',
  })

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    })
  }

  const filteredProperties = properties.filter(property => {
    return (
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filters.location === '' || property.location.toLowerCase().includes(filters.location.toLowerCase())) &&
      (filters.minPrice === '' || parseFloat(property.tokenPrice.replace('$', '')) >= parseFloat(filters.minPrice)) &&
      (filters.maxPrice === '' || parseFloat(property.tokenPrice.replace('$', '')) <= parseFloat(filters.maxPrice)) &&
      (filters.minYield === '' || parseFloat(property.rentalYield) >= parseFloat(filters.minYield))
    )
  })

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Property Listings</h2>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="mb-4">
          <Label htmlFor="search">Search properties</Label>
          <Input
            id="search"
            type="text"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              type="text"
              placeholder="Location"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
            />
          </div>
          <div>
            <Label htmlFor="minPrice">Min Price</Label>
            <Input
              id="minPrice"
              type="number"
              placeholder="Min Price"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
            />
          </div>
          <div>
            <Label htmlFor="maxPrice">Max Price</Label>
            <Input
              id="maxPrice"
              type="number"
              placeholder="Max Price"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
            />
          </div>
          <div>
            <Label htmlFor="minYield">Min Yield %</Label>
            <Input
              id="minYield"
              type="number"
              placeholder="Min Yield %"
              name="minYield"
              value={filters.minYield}
              onChange={handleFilterChange}
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  )
}

