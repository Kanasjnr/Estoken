import { useState, useCallback } from "react"
import { toast } from "react-toastify"
import { useAppKitAccount } from "@reown/appkit/react"
import useContract from "../useContract"
import ABI from "../../abis/RealEstateToken.json"

const useClaimRentalIncome = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { address, isConnected } = useAppKitAccount()
  const contractAddress = import.meta.env.VITE_APP_REAL_ESTATE_TOKEN_ADDRESS
  const { contract } = useContract(contractAddress, ABI)

  const claimRentalIncome = useCallback(
    async (propertyId) => {
      if (!address || !isConnected) {
        toast.error("Please connect your wallet")
        return
      }

      if (!contract) {
        toast.error("Contract is not initialized. Please refresh and try again.")
        return
      }

      setLoading(true)
      setError(null)

      try {
        // First, check if there's any rental income to claim
        const rentalIncome = await contract.calculateRentalIncome(propertyId, 1)
        console.log("Rental Income:", rentalIncome) // Debugging log

        // Convert to BigInt for comparison
        if (BigInt(rentalIncome) === BigInt(0)) {
          toast.error("No rental income to claim for this property.")
          return
        }

        // If there's income to claim, proceed with the transaction
        const tx = await contract.claimRentalIncome(propertyId)
        const receipt = await tx.wait()

        if (receipt.status === 1) {
          toast.success("Rental income claimed successfully!")
          return receipt.transactionHash
        } else {
          throw new Error("Transaction failed")
        }
      } catch (err) {
        console.error("Error claiming rental income:", err)

        let errorMessage = "An unknown error occurred."
        if (err.code === "CALL_EXCEPTION") {
          errorMessage = "Transaction reverted. You can try claiming your monthly rental income again."
        } else if (err.reason) {
          errorMessage = err.reason
        } else if (err.message) {
          errorMessage = err.message
        }

        toast.error(`Error: ${errorMessage}`)
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [address, isConnected, contract],
  )

  return { claimRentalIncome, loading, error }
}

export default useClaimRentalIncome

