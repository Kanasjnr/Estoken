import { useState, useCallback } from "react"
import { toast } from "react-toastify"
import useContract from "../useContract"
import ABI from "../../abis/RealEstateToken.json"

const useUserProperties = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const contractAddress = import.meta.env.VITE_APP_REAL_ESTATE_TOKEN_ADDRESS
  const { contract } = useContract(contractAddress, ABI)

  const getUserProperties = useCallback(
    async (userAddress) => {
      if (!contract) {
        toast.error("Contract is not available")
        return
      }

      setLoading(true)
      setError(null)

      try {
        const properties = await contract.getUserProperties(userAddress)
        return properties
      } catch (err) {
        console.error("Error getting user properties:", err)
        toast.error(`Error: ${err.message || "An unknown error occurred."}`)
        setError(err.message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [contract],
  )

  return { getUserProperties, loading, error }
}

export default useUserProperties