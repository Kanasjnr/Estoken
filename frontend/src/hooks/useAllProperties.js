import { useState, useEffect, useCallback } from "react"
import { ethers } from "ethers"
import useContract from "./useContract"
import ABI from "../abis/RealEstateToken.json"

const useAllProperties = () => {
  const [properties, setProperties] = useState([])
  const [filteredProperties, setFilteredProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { contract, error: contractError } = useContract(import.meta.env.VITE_APP_ESTOKEN_ADDRESS, ABI)

  useEffect(() => {
    const fetchAllProperties = async () => {
      if (contractError) {
        setError(contractError)
        setLoading(false)
        return
      }

      if (!contract) {
        setError("Contract not initialized")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

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
              pricePerShare: ethers.formatEther(info.pricePerShare), // Convert wei to ETH
              accumulatedRentalIncomePerShare: ethers.formatEther(financials.accumulatedRentalIncomePerShare),
              lastRentalUpdate: new Date(Number(financials.lastRentalUpdate) * 1000).toLocaleString(),
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
    }

    fetchAllProperties()
  }, [contract, contractError])

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
          Number.parseFloat(property.accumulatedRentalIncomePerShare) >= Number.parseFloat(filters.minYield)

        return matchesSearch && matchesLocation && matchesMinPrice && matchesMaxPrice && matchesMinYield
      })

      setFilteredProperties(filtered)
    },
    [properties],
  )

  return { properties: filteredProperties, loading, error, searchProperties }
}

export default useAllProperties

