import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useAppKitAccount } from "@reown/appkit/react";
import useContract from "../useContract";
import ABI from "../../abis/RealEstateToken.json";

const useGetInvestmentPortfolio = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const { address, isConnected } = useAppKitAccount();
  const contractAddress = import.meta.env.VITE_APP_REAL_ESTATE_TOKEN_ADDRESS;
  const { contract } = useContract(contractAddress, ABI);

  console.log("Contract instance:", contract); // Log contract instance
  console.log("Connected address:", address); // Log connected address

  const getInvestmentPortfolio = useCallback(async () => {
    if (!address || !isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!contract) {
      // toast.error("Contract is not available");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Fetching investment portfolio for address:", address); // Log fetching process
      const result = await contract.getInvestmentPortfolio(address);
      console.log("Raw result from contract:", result); // Log raw result

      const [propertyIds, shares] = result;
      console.log("Property IDs:", propertyIds); // Log property IDs
      console.log("Shares:", shares); // Log shares

      // Ensure propertyIds and shares are arrays
      if (!Array.isArray(propertyIds) || !Array.isArray(shares)) {
        throw new Error("Invalid data format returned from contract");
      }

      // Map the propertyIds and shares to the portfolio data
      const portfolioData = propertyIds.map((id, index) => ({
        propertyId: id.toString(),
        shares: shares[index].toString(),
      }));

      console.log("Processed portfolio data:", portfolioData); // Log processed data
      setPortfolio(portfolioData);
    } catch (err) {
      console.error("Error fetching investment portfolio:", err); // Log error
      toast.error(`Error: ${err.message || "An unknown error occurred."}`);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [address, isConnected, contract]);

  return { getInvestmentPortfolio, portfolio, loading, error };
};

export default useGetInvestmentPortfolio;