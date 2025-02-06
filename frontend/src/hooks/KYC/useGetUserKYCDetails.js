import { useState, useCallback } from "react"
import { toast } from "react-toastify"
import { useAppKitAccount } from "@reown/appkit/react"
import useContract from "../useContract"
import ABI from "../../abis/KYCManager.json"

const useGetUserKYCDetails = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { address, isConnected } = useAppKitAccount()
  const contractAddress = import.meta.env.VITE_APP_KYC_MANAGER_ADDRESS
  const { contract } = useContract(contractAddress, ABI)

  const getUserKYCDetails = useCallback(
    async (userAddress) => {
      if (!address || !isConnected) {
        toast.error("Please connect your wallet")
        return
      }

      // if (!contract) {
      //   toast.error("Contract is not available")
      //   return
      // }

      setLoading(true)
      setError(null)

      try {
        const details = await contract.getUserKYCDetails(userAddress)
        return {
          name: details[0],
          email: details[1],
          nationality: details[2],
          idNumber: details[3],
          idImage: details[4],
          isVerified: details[5],
        }
      } catch (err) {
        console.error("Error getting user KYC details:", err)
        // toast.error(`Error: ${err.message || "An unknown error occurred."}`)
        setError(err.message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [address, isConnected, contract],
  )

  return { getUserKYCDetails, loading, error }
}

export default useGetUserKYCDetails