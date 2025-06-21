"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import useContract from "../useContract";
import ABI from "../../abis/RealEstateToken.json";

const useGetPropertyFinancials = (propertyId) => {
  const [financials, setFinancials] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { contract, error: contractError } = useContract(
    import.meta.env.VITE_APP_REAL_ESTATE_TOKEN_ADDRESS,
    ABI
  );

  const fetchFinancials = useCallback(async () => {
    if (!contract || contractError) {
      console.error("Contract not initialized or has an error");
      setError(contractError?.message || "Contract not initialized");
      setLoading(false);
      return;
    }

    if (!propertyId) {
      console.error("Property ID is undefined");
      setError("Property ID is undefined");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await contract.getPropertyFinancials(propertyId);
      
      setFinancials({
        accumulatedRentalIncomePerShare: ethers.formatEther(result.accumulatedRentalIncomePerShare),
        lastRentalUpdate: new Date(Number(result.lastRentalUpdate) * 1000).toLocaleString(),
        isActive: result.isActive,
      });
    } catch (err) {
      console.error("Error fetching property financials:", err);
      setError("Error fetching property financials: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [propertyId, contract, contractError]);

  useEffect(() => {
    fetchFinancials();
  }, [fetchFinancials]);

  const refreshFinancials = useCallback(() => {
    fetchFinancials();
  }, [fetchFinancials]);

  return { financials, loading, error, refreshFinancials };
};

export default useGetPropertyFinancials; 