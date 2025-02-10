import { useState, useCallback } from "react"
import { toast } from "react-toastify"
import { useAppKitAccount } from "@reown/appkit/react"
import useContract from "../useContract"
import ABI from "../../abis/RealEstateToken.json"

const useGetNFTForProperty = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [nftId, setNftId] = useState(null)
  const { address, isConnected } = useAppKitAccount()
  const contractAddress = import.meta.env.VITE_APP_REAL_ESTATE_TOKEN_ADDRESS
  const { contract } = useContract(contractAddress, ABI)

  const getNFTForProperty = useCallback(
    async (propertyId, owner) => {
      if (!contract) {
        toast.error("Contract is not available")
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const result = await contract.getNFTForProperty(propertyId, owner)
        setNftId(result.toString())
        return result.toString()
      } catch (err) {
        console.error("Error getting NFT for property:", err)
        const errorMessage = err.reason || err.message || "An unknown error occurred."
        toast.error(`Error: ${errorMessage}`)
        setError(errorMessage)
        return null
      } finally {
        setLoading(false)
      }
    },
    [contract],
  )

  return { getNFTForProperty, nftId, loading, error }
}

export default useGetNFTForProperty

