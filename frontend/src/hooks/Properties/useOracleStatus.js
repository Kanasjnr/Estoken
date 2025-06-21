"use client";

import { useState, useEffect, useCallback } from "react";
import useContract from "../useContract";
import OracleABI from "../../abis/RealEstateOracle.json";

const useOracleStatus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [oracleData, setOracleData] = useState({
    lastRequestId: null,
    lastResponse: null,
    lastError: null,
    subscriptionId: null,
    gasLimit: null
  });
  
  const contractAddress = import.meta.env.VITE_APP_REAL_ESTATE_ORACLE_ADDRESS;
  const { contract } = useContract(contractAddress, OracleABI);

  const fetchOracleStatus = useCallback(async () => {
    if (!contract) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [lastRequestId, lastResponse, lastError, subscriptionId, gasLimit] = await Promise.all([
        contract.s_lastRequestId(),
        contract.getLatestResponse(),
        contract.getLatestError(),
        contract.s_subscriptionId(),
        contract.gasLimit()
      ]);

      setOracleData({
        lastRequestId: lastRequestId.toString(),
        lastResponse: lastResponse,
        lastError: lastError,
        subscriptionId: subscriptionId.toString(),
        gasLimit: gasLimit.toString()
      });
    } catch (err) {
      console.error("Error fetching oracle status:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [contract]);

  useEffect(() => {
    fetchOracleStatus();
  }, [fetchOracleStatus]);

  const refreshStatus = useCallback(() => {
    fetchOracleStatus();
  }, [fetchOracleStatus]);

  return { 
    oracleData, 
    loading, 
    error, 
    refreshStatus 
  };
};

export default useOracleStatus; 