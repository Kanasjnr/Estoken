import  { createContext, useContext, useState, useEffect } from 'react';
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
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

  useEffect(() => {
    if (address && Number(chainId) === Number(import.meta.env.VITE_CHAIN_ID)) {
      setIsInitialized(true);
    } else {
      setIsInitialized(false);
    }
  }, [address, chainId]);

  useEffect(() => {
    if (!isInitialized) {
      toast.warn("Please connect to CrossFi Testnet to use this application");
    }
  }, [isInitialized]);

  const contextValue = {
    isInitialized,
    address,
    chainId,
  };

  return (
    <ESTokenContext.Provider value={contextValue}>
      {children}
    </ESTokenContext.Provider>
  );
};