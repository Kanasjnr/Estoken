import { useState, useCallback } from "react"
import { toast } from "react-toastify"
import { ethers } from "ethers"
import { useAppKitAccount } from "@reown/appkit/react"
import useContract from "./useContract"
import ABI from "../abis/RealEstateToken.json"

const useUpdatePropertyValuation = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { address, isConnected } = useAppKitAccount()
  const contractAddress = import.meta.env.VITE_APP_REAL_ESTATE_TOKEN_ADDRESS
  const { contract } = useContract(contractAddress, ABI)

  const updatePropertyValuation = useCallback(
    async (propertyId, newValuation) => {
      if (!address || !isConnected) {
        toast.error("Please connect your wallet")
        return
      }

      if (!contract) {
        toast.error("Contract is not available")
        return
      }

      setLoading(true)
      setError(null)

      try {
        const newValuationInWei = ethers.parseUnits(newValuation.toString(), "ether")
        const tx = await contract.updatePropertyValuation(propertyId, newValuationInWei)
        const receipt = await tx.wait()

        if (receipt.status === 1) {
          toast.success("Property valuation updated successfully!")
          return receipt.transactionHash
        } else {
          throw new Error("Transaction failed")
        }
      } catch (err) {
        console.error("Error updating property valuation:", err)
        toast.error(`Error: ${err.message || "An unknown error occurred."}`)
        setError(err.message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [address, isConnected, contract],
  )

  return { updatePropertyValuation, loading, error }
}

export default useUpdatePropertyValuation