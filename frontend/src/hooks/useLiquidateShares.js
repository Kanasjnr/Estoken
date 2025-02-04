import { useState, useCallback } from "react"
import { toast } from "react-toastify"
import { useAppKitAccount } from "@reown/appkit/react"
import useContract from "./useContract"
import ABI from "../abis/RealEstateToken.json"

const useLiquidateShares = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { address, isConnected } = useAppKitAccount()
  const contractAddress = import.meta.env.VITE_APP_REAL_ESTATE_TOKEN_ADDRESS
  const { contract } = useContract(contractAddress, ABI)

  const liquidateShares = useCallback(
    async (propertyId, amount) => {
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
        const tx = await contract.liquidateShares(propertyId, amount)
        const receipt = await tx.wait()

        if (receipt.status === 1) {
          toast.success("Shares liquidated successfully!")
          return receipt.transactionHash
        } else {
          throw new Error("Transaction failed")
        }
      } catch (err) {
        console.error("Error liquidating shares:", err)
        toast.error(`Error: ${err.message || "An unknown error occurred."}`)
        setError(err.message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [address, isConnected, contract],
  )

  return { liquidateShares, loading, error }
}

export default useLiquidateShares