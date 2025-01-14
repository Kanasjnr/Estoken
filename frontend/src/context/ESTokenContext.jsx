import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import usePropertyToken from '../hooks/usePropertyToken';
import useMarketplace from '../hooks/useMarketplace';
import useRentalIncomeDispenser from '../hooks/useRentalIncomeDispenser';
import { toast } from "react-toastify";

const ESTokenContext = createContext();

export const useESToken = () => {
  const context = useContext(ESTokenContext);
  if (!context) {
    throw new Error('useESToken must be used within an ESTokenProvider');
  }
  return context;
};

export const ESTokenProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { address } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();

  const { mint, balanceOf } = usePropertyToken();
  const { createListing, buyTokens } = useMarketplace();
  const { distributeRentalIncome, claimIncome, getUnclaimedIncome } = useRentalIncomeDispenser();

  useEffect(() => {
    if (address && Number(chainId) === Number(chainId.id)) {
      setIsInitialized(true);
    } else {
      setIsInitialized(false);
    }
  }, [address, chainId]);

  useEffect(() => {
    if (!isInitialized) {
      toast.warn("Please connect to base sepolia Testnet to use this application");
    }
  }, [isInitialized]);

  const mintTokens = useCallback(async (amount, data) => {
    if (!isInitialized) {
      toast.error("Please connect to base sepolia Testnet");
      return;
    }
    return mint(amount, data);
  }, [isInitialized, mint]);

  const getTokenBalance = useCallback(async (tokenId) => {
    if (!isInitialized) {
      toast.error("Please connect to base sepolia Testnet");
      return;
    }
    return balanceOf(tokenId);
  }, [isInitialized, balanceOf]);

  const createMarketListing = useCallback(async (tokenId, amount, pricePerToken) => {
    if (!isInitialized) {
      toast.error("Please connect to base sepolia Testnet");
      return;
    }
    return createListing(tokenId, amount, pricePerToken);
  }, [isInitialized, createListing]);

  const purchaseTokens = useCallback(async (listingId, amount, value) => {
    if (!isInitialized) {
      toast.error("Please connect to base sepolia Testnet");
      return;
    }
    return buyTokens(listingId, amount, value);
  }, [isInitialized, buyTokens]);

  const distributeIncome = useCallback(async (tokenId, amount) => {
    if (!isInitialized) {
      toast.error("Please connect to base sepolia Testnet");
      return;
    }
    return distributeRentalIncome(tokenId, amount);
  }, [isInitialized, distributeRentalIncome]);

  const claimRentalIncome = useCallback(async (tokenId) => {
    if (!isInitialized) {
      toast.error("Please connect to base sepolia Testnet");
      return;
    }
    return claimIncome(tokenId);
  }, [isInitialized, claimIncome]);

  const getUnclaimedRentalIncome = useCallback(async (tokenId) => {
    if (!isInitialized) {
      toast.error("Please connect to base sepolia Testnet");
      return;
    }
    return getUnclaimedIncome(tokenId);
  }, [isInitialized, getUnclaimedIncome]);

  
  const contextValue = {
    isInitialized,
    address,
    chainId,
    mintTokens,
    getTokenBalance,
    createMarketListing,
    purchaseTokens,
    distributeIncome,
    claimRentalIncome,
    getUnclaimedRentalIncome,
    
  };

  return (
    <ESTokenContext.Provider value={contextValue}>
      {children}
    </ESTokenContext.Provider>
  );
};

