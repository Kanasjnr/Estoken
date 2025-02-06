import { useState, useCallback } from "react"
import { toast } from "react-toastify"
import useContract from "../useContract"
import ABI from "../../abis/KYCManager.json"

const useIsUserVerified = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const contractAddress = import.meta.env.VITE_APP_KYC_MANAGER_ADDRESS
  const { contract } = useContract(contractAddress, ABI)

  const isUserVerified = useCallback(
    async (userAddress) => {
      // if (!contract) {
      //   toast.error("Contract is not available")
      //   return
      // }

      setLoading(true)
      setError(null)

      try {
        const isVerified = await contract.isUserVerified(userAddress)
        return isVerified
      } catch (err) {
        console.error("Error checking user verification:", err)
        // toast.error(`Error: ${err.message || "An unknown error occurred."}`)
        setError(err.message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [contract],
  )

  return { isUserVerified, loading, error }
}

export default useIsUserVerified