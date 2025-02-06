import { useState, useCallback } from "react"
import { toast } from "react-toastify"
import { useAppKitAccount } from "@reown/appkit/react"
import useContract from "../useContract"
import ABI from "../../abis/RealEstateToken.json"

const useGetInvestmentPortfolio = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [portfolio, setPortfolio] = useState(null)
  const { address, isConnected } = useAppKitAccount()
  const contractAddress = import.meta.env.VITE_APP_REAL_ESTATE_TOKEN_ADDRESS
  const { contract } = useContract(contractAddress, ABI)

  const getInvestmentPortfolio = useCallback(async () => {
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
      const result = await contract.getInvestmentPortfolio(address)
      const [propertyIds, shares] = result

      const portfolioData = propertyIds.map((id, index) => ({
        propertyId: id.toString(),
        shares: shares[index].toString(),
      }))

      setPortfolio(portfolioData)
    } catch (err) {
      console.error("Error fetching investment portfolio:", err)
      toast.error(`Error: ${err.message || "An unknown error occurred."}`)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [address, isConnected, contract])

  return { getInvestmentPortfolio, portfolio, loading, error }
}

export default useGetInvestmentPortfolio