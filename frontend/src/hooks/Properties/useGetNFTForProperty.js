import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useAppKitAccount } from "@reown/appkit/react";
import useContract from "../useContract";
import ABI from "../../abis/RealEstateToken.json";

const useGetNFTForProperty = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nftData, setNftData] = useState({ tokenId: null, shares: null }); // Updated state to store both tokenId and shares
  const { address, isConnected } = useAppKitAccount();
  const contractAddress = import.meta.env.VITE_APP_REAL_ESTATE_TOKEN_ADDRESS;
  const { contract } = useContract(contractAddress, ABI);

  const getNFTForProperty = useCallback(
    async (propertyId, owner) => {
      if (!contract) {
        // toast.error("Contract is not available");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await contract.getNFTForProperty(propertyId, owner);
        const tokenId = result[0].toString(); // Extract tokenId
        const shares = result[1].toString(); // Extract shares
        setNftData({ tokenId, shares }); // Update state with both tokenId and shares
        return { tokenId, shares }; // Return both tokenId and shares
      } catch (err) {
        console.error("Error getting NFT for property:", err);
        const errorMessage =
          err.reason || err.message || "An unknown error occurred.";
        toast.error(`Error: ${errorMessage}`);
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [contract]
  );

  return { getNFTForProperty, nftData, loading, error };
};

export default useGetNFTForProperty;
