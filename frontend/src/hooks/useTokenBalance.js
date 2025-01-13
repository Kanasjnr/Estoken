import { useState, useEffect } from 'react';
import useContract from './useContract';
import propertyTokenABI from '../abis/PropertyToken.json';
import { useAppKitProvider } from "@reown/appkit/react";

const useTokenBalance = (tokenId) => {
  const [balance, setBalance] = useState('0');
  const { walletProvider } = useAppKitProvider("eip155");
  const propertyTokenContract = useContract(import.meta.env.PROPERTY_TOKEN_ADDRESS, propertyTokenABI);

  useEffect(() => {
    const fetchBalance = async () => {
      if (propertyTokenContract && walletProvider) {
        try {
          const address = await walletProvider.request({ method: 'eth_requestAccounts' });
          const tokenBalance = await propertyTokenContract.balanceOf(address[0], tokenId);
          setBalance(tokenBalance.toString());
        } catch (error) {
          console.error('Error fetching token balance:', error);
        }
      }
    };

    fetchBalance();
  }, [propertyTokenContract, walletProvider, tokenId]);

  return balance;
};

export default useTokenBalance;

