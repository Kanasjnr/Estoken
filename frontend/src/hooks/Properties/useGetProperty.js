"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import useContract from "../useContract"
import ABI from "../../abis/RealEstateToken.json"

const useGetProperty = (propertyId) => {
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalRentalIncome, setTotalRentalIncome] = useState("0")
  const { contract, error: contractError } = useContract(import.meta.env.VITE_APP_REAL_ESTATE_TOKEN_ADDRESS, ABI)

  useEffect(() => {
    if (!contract || contractError) {
      console.error("Contract not initialized or has an error")
      setError(contractError?.message || "Contract not initialized")
      setLoading(false)
      return
    }

    if (!propertyId) {
      console.error("Property ID is undefined")
      setError("Property ID is undefined")
      setLoading(false)
      return
    }

    const fetchProperty = async () => {
      setLoading(true)
      setError(null)

      try {
        const info = await contract.getPropertyInfo(propertyId)
        const financials = await contract.getPropertyFinancials(propertyId)
        const availableShares = await contract.getAvailableShares(propertyId)

        // Calculate total rental income based on the monthly rental income and time passed
        const monthsPassed = Math.floor((Date.now() / 1000 - Number(info.creationTimestamp)) / (30 * 24 * 60 * 60))
        const totalIncome = Number(ethers.formatEther(info.monthlyRentalIncome)) * monthsPassed
        const totalIncomeInEther = totalIncome.toFixed(4)

        setProperty({
          id: propertyId,
          name: info.name,
          location: info.location,
          description: info.description,
          imageUrls: info.imageUrls,
          totalShares: info.totalShares.toString(),
          availableShares: availableShares.toString(),
          pricePerShare: ethers.formatEther(info.pricePerShare),
          initialValuation: ethers.formatEther(info.initialValuation),
          currentValuation: ethers.formatEther(info.currentValuation),
          creationTimestamp: new Date(Number(info.creationTimestamp) * 1000).toLocaleString(),
          accumulatedRentalIncomePerShare: ethers.formatEther(financials.accumulatedRentalIncomePerShare),
          lastRentalUpdate: new Date(Number(financials.lastRentalUpdate) * 1000).toLocaleString(),
          isActive: financials.isActive,
          monthlyRentalIncome: ethers.formatEther(info.monthlyRentalIncome),
        })

        setTotalRentalIncome(totalIncomeInEther)
      } catch (err) {
        console.error("Error fetching property:", err)
        setError("Error fetching property: " + err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProperty()
  }, [propertyId, contract, contractError])

  return { property, totalRentalIncome, loading, error }
}

export default useGetProperty

