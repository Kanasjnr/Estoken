import { useState, useCallback } from "react"
import { toast } from "react-toastify"
import useContract from "./useContract"
import ABI from "../abis/RealEstateToken.json"

const useAllProperties = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const contractAddress = import.meta.env.VITE_APP_REAL_ESTATE_TOKEN_ADDRESS
  const { contract } = useContract(contractAddress, ABI)

  const getAllProperties = useCallback(async () => {
    if (!contract) {
      toast.error("Contract is not available")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const properties = await contract.getAllProperties()
      return properties
    } catch (err) {
        console.error("Error claiming rental income:", err)
        toast.error(`Error: ${err.message || "An unknown error occurred."}`)
        setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [contract])

  return { getAllProperties, loading, error }
}

export default useAllProperties