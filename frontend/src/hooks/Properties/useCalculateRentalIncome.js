"use client"

import { useState, useCallback, useEffect } from "react"
import { ethers } from "ethers"
import { toast } from "react-toastify"
import useContract from "../useContract"
import ABI from "../../abis/RealEstateToken.json"

const useCalculateRentalIncome = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [rentalIncome, setRentalIncome] = useState(null)
  const contractAddress = import.meta.env.VITE_APP_REAL_ESTATE_TOKEN_ADDRESS
  const { contract, isLoading: isContractLoading } = useContract(contractAddress, ABI)

  const calculateRentalIncome = useCallback(
    async (propertyId, numberOfShares) => {
      if (!contract) {
        console.error("Contract is not initialized")
        toast.error("Unable to connect to the contract. Please try again later.")
        return
      }

      setLoading(true)
      setError(null)

      try {
        const result = await contract.calculateRentalIncome(propertyId, numberOfShares)
        setRentalIncome(ethers.formatEther(result))
        return ethers.formatEther(result)
      } catch (err) {
        console.error("Error calculating rental income:", err)
        const errorMessage = err.reason || err.message || "An unknown error occurred."
        toast.error(`Error: ${errorMessage}`)
        setError(errorMessage)
        return "0.0"
      } finally {
        setLoading(false)
      }
    },
    [contract],
  )

  useEffect(() => {
    setLoading(isContractLoading)
  }, [isContractLoading])

  return { calculateRentalIncome, rentalIncome, loading, error }
}

export default useCalculateRentalIncome

