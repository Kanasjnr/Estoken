import { useParams } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const properties = [
  { 
    id: 1, 
    name: "Luxury Apartment", 
    location: "New York", 
    valuation: "$1,000,000", 
    tokenPrice: "$100", 
    rentalYield: "5%",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    description: "A stunning luxury apartment in the heart of New York City with breathtaking views of the skyline.",
    totalTokens: 10000,
    soldTokens: 7500,
    monthlyRentalIncome: "$5,000",
    occupancyRate: "95%",
    propertyType: "Residential",
    yearBuilt: 2015,
    squareFootage: 2000,
  },
  // ... (add similar detailed data for other properties)
]

const performanceData = [
  { month: 'Jan', income: 4000 },
  { month: 'Feb', income: 3000 },
  { month: 'Mar', income: 5000 },
  { month: 'Apr', income: 4500 },
  { month: 'May', income: 4800 },
  { month: 'Jun', income: 5200 },
]

export function PropertyDetails() {
  const { id } = useParams()
  const property = properties.find(p => p.id === parseInt(id))

  if (!property) {
    return <div>Property not found</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">{property.name}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <img src={property.image} alt={property.name} className="w-full h-64 object-cover rounded-lg shadow-md" />
          <div className="mt-4 bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Property Details</h3>
            <p className="text-gray-600 mb-2">Location: {property.location}</p>
            <p className="text-gray-600 mb-2">Valuation: {property.valuation}</p>
            <p className="text-gray-600 mb-2">Token Price: {property.tokenPrice}</p>
            <p className="text-gray-600 mb-2">Rental Yield: {property.rentalYield}</p>
            <p className="text-gray-600 mb-2">Property Type: {property.propertyType}</p>
            <p className="text-gray-600 mb-2">Year Built: {property.yearBuilt}</p>
            <p className="text-gray-600 mb-2">Square Footage: {property.squareFootage} sq ft</p>
            <p className="text-gray-600">{property.description}</p>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Tokenization Status</h3>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Total Tokens:</span>
              <span className="font-semibold">{property.totalTokens}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Sold Tokens:</span>
              <span className="font-semibold">{property.soldTokens}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{width: `${(property.soldTokens / property.totalTokens) * 100}%`}}
              ></div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Performance Metrics</h3>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Monthly Rental Income:</span>
              <span className="font-semibold">{property.monthlyRentalIncome}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Occupancy Rate:</span>
              <span className="font-semibold">{property.occupancyRate}</span>
            </div>
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="income" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertyDetails

