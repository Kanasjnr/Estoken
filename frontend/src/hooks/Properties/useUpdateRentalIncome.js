import { useState, useCallback } from "react"
import { toast } from "react-toastify"
import { ethers } from "ethers"
import { useAppKitAccount } from "@reown/appkit/react"
import useContract from "../useContract"
import ABI from "../../abis/RealEstateToken.json"

const useUpdateRentalIncome = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { address, isConnected } = useAppKitAccount()
  const contractAddress = import.meta.env.VITE_APP_REAL_ESTATE_TOKEN_ADDRESS
  const { contract } = useContract(contractAddress, ABI)

  const updateRentalIncome = useCallback(
    async (propertyId, totalRentalIncome) => {
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
        const totalRentalIncomeInWei = ethers.utils.parseEther(totalRentalIncome.toString())
        const tx = await contract.updateRentalIncome(propertyId, totalRentalIncomeInWei)
        const receipt = await tx.wait()

        if (receipt.status === 1) {
          toast.success("Rental income updated successfully!")
          return receipt.transactionHash
        } else {
          throw new Error("Transaction failed")
        }
      } catch (err) {
        console.error("Error updating rental income:", err)
        toast.error(`Error: ${err.message || "An unknown error occurred."}`)
        setError(err.message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [address, isConnected, contract],
  )

  return { updateRentalIncome, loading, error }
}

export default useUpdateRentalIncome