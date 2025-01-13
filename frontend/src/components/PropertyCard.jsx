import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import usePropertyDetails from '../hooks/usePropertyDetails'

export function PropertyCard({ property }) {
  const propertyDetails = usePropertyDetails(property.id)

  if (!propertyDetails) {
    return <div>Loading...</div>
  }

  return (
    <Card className="overflow-hidden">
      <img
        src={property.image || 'https://via.placeholder.com/300x200'}
        alt={propertyDetails.name}
        className="w-full h-48 object-cover"
      />
      <CardHeader>
        <CardTitle>{propertyDetails.name}</CardTitle>
        <CardDescription>{propertyDetails.location}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500">Token ID: {propertyDetails.tokenId}</p>
        <p className="text-sm text-gray-500">Active: {propertyDetails.isActive ? 'Yes' : 'No'}</p>
        <p className="text-sm text-gray-500">Valuation: {property.valuation}</p>
        <p className="text-sm text-gray-500">Token Price: {property.tokenPrice}</p>
        <p className="text-sm text-gray-500">Rental Yield: {property.rentalYield}</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Invest Now</Button>
      </CardFooter>
    </Card>
  )
}

