import { Link } from 'react-router-dom'
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function PropertyCard({ property }) {
  return (
    <Card className="overflow-hidden">
      <img src={property.image} alt={property.name} className="w-full h-48 object-cover" />
      <CardContent className="p-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{property.name}</h3>
        <p className="text-gray-600 mb-2">Location: {property.location}</p>
        <p className="text-gray-600 mb-2">Valuation: {property.valuation}</p>
        <p className="text-gray-600 mb-2">Token Price: {property.tokenPrice}</p>
        <p className="text-gray-600">Rental Yield: {property.rentalYield}</p>
      </CardContent>
      <CardFooter className="bg-gray-50 p-4 flex justify-between">
        <Button asChild variant="outline">
          <Link to={`/dashboard/properties/${property.id}`}>
            View Details
          </Link>
        </Button>
        <Button>Buy Tokens</Button>
      </CardFooter>
    </Card>
  )
}

