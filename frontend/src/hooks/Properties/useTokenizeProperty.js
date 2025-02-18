"use client"

import { useState, useCallback } from "react"
import { toast } from "react-toastify"
import { ethers } from "ethers"
import { useAppKitAccount } from "@reown/appkit/react"
import useContract from "../useContract"
import ABI from "../../abis/RealEstateToken.json"

const useTokenizeProperty = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { address, isConnected } = useAppKitAccount()
  const contractAddress = import.meta.env.VITE_APP_REAL_ESTATE_TOKEN_ADDRESS
  const { contract } = useContract(contractAddress, ABI)

  const tokenizeProperty = useCallback(
    async (
      name,
      location,
      description,
      imageUrls,
      totalShares,
      pricePerShare,
      initialValuation,
      monthlyRentalIncome,
    ) => {
      if (!address || !isConnected) {
        toast.error("Please connect your wallet")
        return
      }

      if (!contract) {
        return
      }

      setLoading(true)
      setError(null)

      try {
        if (!Array.isArray(imageUrls) || imageUrls.some((url) => typeof url !== "string")) {
          throw new Error("Invalid imageUrls: Must be an array of strings.")
        }

        if (!pricePerShare || !initialValuation || !monthlyRentalIncome) {
          throw new Error("Price per share, initial valuation, and monthly rental income must be provided.")
        }

        const pricePerShareInWei = ethers.parseUnits(pricePerShare.toString(), "ether")
        const initialValuationInWei = ethers.parseUnits(initialValuation.toString(), "ether")
        const monthlyRentalIncomeInWei = ethers.parseUnits(monthlyRentalIncome.toString(), "ether")

        const tx = await contract.tokenizeProperty(
          name,
          location,
          description,
          imageUrls,
          totalShares,
          pricePerShareInWei,
          initialValuationInWei,
          monthlyRentalIncomeInWei,
        )

        const receipt = await tx.wait()

        if (receipt.status === 1) {
          toast.success("Property tokenized successfully!")
          return receipt.transactionHash
        } else {
          throw new Error("Transaction failed")
        }
      } catch (err) {
        console.error("Error tokenizing property:", err)
        toast.error(`Error: ${err.message || "An unknown error occurred."}`)
        setError(err.message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [address, isConnected, contract],
  )

  return { tokenizeProperty, loading, error }
}

export default useTokenizeProperty

