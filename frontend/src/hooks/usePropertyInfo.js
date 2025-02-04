import { useState, useCallback } from "react"
import { toast } from "react-toastify"
import useContract from "./useContract"
import ABI from "../abis/RealEstateToken.json"

const usePropertyInfo = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const contractAddress = import.meta.env.VITE_APP_REAL_ESTATE_TOKEN_ADDRESS
  const { contract } = useContract(contractAddress, ABI)

  const getPropertyInfo = useCallback(
    async (propertyId) => {
      if (!contract) {
        toast.error("Contract is not available")
        return
      }

      setLoading(true)
      setError(null)

      try {
        const info = await contract.getPropertyInfo(propertyId)
        return {
          name: info[0],
          location: info[1],
          totalShares: info[2],
          pricePerShare: info[3],
        }
      } catch (err) {
        console.error("Error getting property info:", err)
        toast.error(`Error: ${err.message || "An unknown error occurred."}`)
        setError(err.message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [contract],
  )

  return { getPropertyInfo, loading, error }
}

export default usePropertyInfo