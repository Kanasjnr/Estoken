import { useState, useEffect, useCallback } from "react"
import { ethers } from "ethers"
import useContract from "../useContract"
import ABI from "../../abis/RealEstateToken.json"

const useAllProperties = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [properties, setProperties] = useState([])
  const [filteredProperties, setFilteredProperties] = useState([])
  const contractAddress = import.meta.env.VITE_APP_REAL_ESTATE_TOKEN_ADDRESS
  const { contract } = useContract(contractAddress, ABI)

  const getAllProperties = useCallback(async () => {
    if (!contract) {
      return []
    }

    setLoading(true)
    setError(null)

    try {
      const totalProperties = await contract.getTotalProperties()
      const total = Number(totalProperties.toString())

      const fetchedProperties = []
      for (let i = 1; i <= total; i++) {
        try {
          const info = await contract.getPropertyInfo(i)
          const financials = await contract.getPropertyFinancials(i)
          const availableShares = await contract.getAvailableShares(i)

          fetchedProperties.push({
            id: i,
            name: info.name,
            location: info.location,
            description: info.description,
            imageUrls: info.imageUrls,
            totalShares: info.totalShares.toString(),
            availableShares: availableShares.toString(),
            pricePerShare: ethers.formatEther(info.pricePerShare),
            initialValuation: ethers.formatEther(info.initialValuation),
            currentValuation: ethers.formatEther(info.currentValuation),
            creationTimestamp: new Date(Number(info.creationTimestamp) * 1000).toLocaleDateString(),
            accumulatedRentalIncomePerShare: ethers.formatEther(financials.accumulatedRentalIncomePerShare),
            lastRentalUpdate: new Date(Number(financials.lastRentalUpdate) * 1000).toLocaleString(),
            monthlyRentalIncome: ethers.formatEther(info.monthlyRentalIncome), // Updated to use the new structure
            isActive: financials.isActive,
          })
        } catch (propertyError) {
          console.warn(`Error fetching property ${i}:`, propertyError)
        }
      }

      setProperties(fetchedProperties)
      setFilteredProperties(fetchedProperties)
    } catch (err) {
      console.error("Error fetching properties:", err)
      setError("Error fetching properties: " + err.message)
    } finally {
      setLoading(false)
    }
  }, [contract])

  useEffect(() => {
    getAllProperties()
  }, [getAllProperties])

  const searchProperties = useCallback(
    (searchTerm, filters) => {
      const filtered = properties.filter((property) => {
        const matchesSearch =
          property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.location.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesLocation =
          filters.location === "" || property.location.toLowerCase().includes(filters.location.toLowerCase())

        const matchesMinPrice =
          filters.minPrice === "" || Number.parseFloat(property.pricePerShare) >= Number.parseFloat(filters.minPrice)

        const matchesMaxPrice =
          filters.maxPrice === "" || Number.parseFloat(property.pricePerShare) <= Number.parseFloat(filters.maxPrice)

        const matchesMinYield =
          filters.minYield === "" ||
          Number.parseFloat(property.monthlyRentalIncome) >= Number.parseFloat(filters.minYield)

        return matchesSearch && matchesLocation && matchesMinPrice && matchesMaxPrice && matchesMinYield
      })

      setFilteredProperties(filtered)
    },
    [properties],
  )

  return { getAllProperties, loading, error, properties, filteredProperties, searchProperties }
}

export default useAllProperties

