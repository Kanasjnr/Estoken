import { useState, useCallback } from "react"
import { toast } from "react-toastify"
import { useAppKitAccount } from "@reown/appkit/react"
import useContract from "../useContract"
import ABI from "../../abis/KYCManager.json"

const useVerifyKYC = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { address, isConnected } = useAppKitAccount()
  const contractAddress = import.meta.env.VITE_APP_KYC_MANAGER_ADDRESS
  const { contract } = useContract(contractAddress, ABI)

  const verifyKYC = useCallback(
    async (userAddress, status) => {
      // if (!address || !isConnected) {
      //   toast.error("Please connect your wallet")
      //   return
      // }

      // if (!contract) {
      //   toast.error("Contract is not available")
      //   return
      // }

      setLoading(true)
      setError(null)

      try {
        const tx = await contract.verifyKYC(userAddress, status)
        const receipt = await tx.wait()

        if (receipt.status === 1) {
          toast.success(`KYC ${status ? "verified" : "unverified"} successfully!`)
          return receipt.transactionHash
        } else {
          throw new Error("Transaction failed")
        }
      } catch (err) {
        console.error("Error verifying KYC:", err)
        // toast.error(`Error: ${err.message || "An unknown error occurred."}`)
        setError(err.message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [address, isConnected, contract],
  )

  return { verifyKYC, loading, error }
}

export default useVerifyKYC