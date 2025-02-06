

import { useState, useCallback } from "react"
import { toast } from "react-toastify"
import { useAppKitAccount } from "@reown/appkit/react"
import useContract from "../useContract"
import ABI from "../../abis/KYCManager.json"

const useSubmitKYC = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { address, isConnected } = useAppKitAccount()
  const contractAddress = import.meta.env.VITE_APP_KYC_MANAGER_ADDRESS
  const { contract } = useContract(contractAddress, ABI)

  const submitKYC = useCallback(
    async (name, email, nationality, idNumber, idImage) => {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        toast.error("MetaMask is not installed")
        return
      }

      // Ensure wallet is connected
      // if (!address || !isConnected) {
      //   toast.error("Please connect your wallet")
      //   return
      // }

      // Check if contract is available
      // if (!contract) {
      //   toast.error("Contract is not available")
      //   return
      // }

      setLoading(true)
      setError(null)

      try {
        // Ensure user has granted permission for transactions
        await window.ethereum.request({ method: "eth_requestAccounts" })

        // Log contract and user details for debugging
        console.log("Submitting KYC:", { name, email, nationality, idNumber, idImage })
        console.log("Contract Address:", contractAddress)
        console.log("Wallet Address:", address)

        // Submit KYC data to the contract
        const tx = await contract.submitKYC(name, email, nationality, idNumber, idImage)
        const receipt = await tx.wait()

        if (receipt.status === 1) {
          toast.success("KYC submitted successfully!")
          return receipt.transactionHash
        } else {
          throw new Error("Transaction failed")
        }
      } catch (err) {
        console.error("Error submitting KYC:", err)
        // toast.error(`Error: ${err.message || "An unknown error occurred."}`)
        setError(err.message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [address, isConnected, contract],
  )

  return { submitKYC, loading, error }
}

export default useSubmitKYC
