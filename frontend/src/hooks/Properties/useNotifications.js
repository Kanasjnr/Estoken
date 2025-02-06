import { useState, useEffect, useCallback } from "react"
import { toast } from "react-toastify"
import { ethers } from "ethers"
import { useAppKitAccount } from "@reown/appkit/react"
import useSignerOrProvider from "../useSignerOrProvider"
import ABI from "../../abis/RealEstateToken.json"

const useNotifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [contract, setContract] = useState(null)
  const { address, isConnected } = useAppKitAccount()
  const { signer } = useSignerOrProvider()

  const addNotification = useCallback((message) => {
    const newNotification = {
      message,
      timestamp: new Date().toLocaleString(),
    }
    setNotifications((prev) => [newNotification, ...prev])
    toast.info(message)
  }, [])

  useEffect(() => {
    const initializeContract = () => {
      if (!address || !isConnected || !signer) {
        return null
      }
      const contractAddress = import.meta.env.VITE_APP_ESTOKEN_ADDRESS
      return new ethers.Contract(contractAddress, ABI, signer)
    }

    const newContract = initializeContract()
    setContract(newContract)

    if (newContract) {
      const handleRentalIncomeUpdated = (propertyId, totalRentalIncome) => {
        addNotification(
          `Rental income for property ${propertyId} updated to ${ethers.formatEther(totalRentalIncome)} ETH`,
        )
      }

      const handlePropertyTokenized = (propertyId, name, location, totalShares, pricePerShare) => {
        addNotification(
          `New property "${name}" in ${location} tokenized. Total shares: ${totalShares}, Price per share: ${ethers.formatEther(pricePerShare)} ETH`,
        )
      }

      const handleTokenSharesPurchased = (propertyId, buyer, amount, totalPrice) => {
        addNotification(
          `${amount} shares of property ${propertyId} purchased for ${ethers.formatEther(totalPrice)} ETH`,
        )
      }

      newContract.on("RentalIncomeUpdated", handleRentalIncomeUpdated)
      newContract.on("PropertyTokenized", handlePropertyTokenized)
      newContract.on("TokenSharesPurchased", handleTokenSharesPurchased)
    }

    return () => {
      if (newContract) {
        newContract.removeAllListeners()
      }
    }
  }, [address, isConnected, signer, addNotification])

  const simulateRentalIncomeUpdate = useCallback(
    async (propertyId) => {
      if (!address || !isConnected) {
        toast.error("Please connect your wallet")
        return
      }

      if (!signer) {
        toast.error("Signer is not available")
        return
      }

      setLoading(true)
      setError(null)

      try {
        if (!contract) throw new Error("Contract initialization failed")

        const tx = await contract.updateRentalIncome(propertyId)
        const receipt = await tx.wait()

        if (receipt.status === 1) {
          addNotification("Rental income updated successfully!")
          return receipt.hash
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
    [contract, addNotification, address, isConnected, signer],
  )

  return { notifications, simulateRentalIncomeUpdate, loading, error, contract }
}

export default useNotifications

