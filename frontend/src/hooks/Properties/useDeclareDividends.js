import { useState, useCallback } from "react"
import { toast } from "react-toastify"
import { ethers } from "ethers"
import { useAppKitAccount } from "@reown/appkit/react"
import useContract from "../useContract"
import ABI from "../../abis/RealEstateToken.json"

const useDeclareDividends = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { address, isConnected } = useAppKitAccount()
  const contractAddress = import.meta.env.VITE_APP_REAL_ESTATE_TOKEN_ADDRESS
  const { contract } = useContract(contractAddress, ABI)

  const declareDividends = useCallback(
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
        const amountInWei = ethers.parseUnits(amount.toString(), "ether")
        const tx = await contract.declareDividends(propertyId, { value: amountInWei })
        const receipt = await tx.wait()

        if (receipt.status === 1) {
          toast.success("Dividends declared successfully!")
          return receipt.transactionHash
        } else {
          throw new Error("Transaction failed")
        }
      } catch (err) {
        console.error("Error declaring dividends:", err)
        toast.error(`Error: ${err.message || "An unknown error occurred."}`)
        setError(err.message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [address, isConnected, contract],
  )

  return { declareDividends, loading, error }
}

export default useDeclareDividends

