import  { useState } from 'react'

export function PropertyTokenization() {
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
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Tokenize Your Property</h2>
      <form onSubmit={handleTokenize} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Property Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={propertyDetails.name}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={propertyDetails.location}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="valuation" className="block text-sm font-medium text-gray-700">Valuation</label>
          <input
            type="text"
            id="valuation"
            name="valuation"
            value={propertyDetails.valuation}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="rentalIncome" className="block text-sm font-medium text-gray-700">Expected Rental Income</label>
          <input
            type="text"
            id="rentalIncome"
            name="rentalIncome"
            value={propertyDetails.rentalIncome}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="tokenSupply" className="block text-sm font-medium text-gray-700">Token Supply</label>
          <input
            type="text"
            id="tokenSupply"
            name="tokenSupply"
            value={propertyDetails.tokenSupply}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200"
        >
          Tokenize Property
        </button>
      </form>
    </div>
  )
}

export default PropertyTokenization

