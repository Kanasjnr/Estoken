import { useState, useCallback } from "react"
import { toast } from "react-toastify"
import { ethers } from "ethers"
import { useAppKitAccount } from "@reown/appkit/react"
import useContract from "../useContract"
import ABI from "../../abis/RealEstateToken.json"

const useCalculateDividends = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [dividends, setDividends] = useState("0")
  const { address, isConnected } = useAppKitAccount()
  const contractAddress = import.meta.env.VITE_APP_REAL_ESTATE_TOKEN_ADDRESS
  const { contract } = useContract(contractAddress, ABI)

  const calculateDividends = useCallback(
    async (propertyId, account) => {
      if (!contract) {
        toast.error("Contract is not available")
        return "0"
      }

      setLoading(true)
      setError(null)

      try {
        const result = await contract.calculateDividends(propertyId, account)
        const formattedDividends = ethers.formatEther(result)
        setDividends(formattedDividends)
        return formattedDividends
      } catch (err) {
        console.error("Error calculating dividends:", err)
        const errorMessage = err.reason || err.message || "An unknown error occurred."
        toast.error(`Error: ${errorMessage}`)
        setError(errorMessage)
        return "0"
      } finally {
        setLoading(false)
      }
    },
    [contract],
  )

  return { calculateDividends, dividends, loading, error }
}

export default useCalculateDividends

