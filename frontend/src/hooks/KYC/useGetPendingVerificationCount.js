import { useState, useCallback } from "react"
import { toast } from "react-toastify"
import useContract from "../useContract"
import ABI from "../../abis/KYCManager.json"

const useGetPendingVerificationCount = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const contractAddress = import.meta.env.VITE_APP_KYC_MANAGER_ADDRESS
  const { contract } = useContract(contractAddress, ABI)

  const getPendingVerificationCount = useCallback(async () => {
    if (!contract) {
      toast.error("Contract is not available")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const count = await contract.getPendingVerificationCount()
      return count.toNumber()
    } catch (err) {
      console.error("Error getting pending verification count:", err)
      toast.error(`Error: ${err.message || "An unknown error occurred."}`)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [contract])

  return { getPendingVerificationCount, loading, error }
}

export default useGetPendingVerificationCount