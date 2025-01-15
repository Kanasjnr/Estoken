import { useState, useEffect } from "react";
import useContract from "./useContract";
import propertyRegistryABI from "../abis/PropertyRegistry.json";

const usePropertyDetails = (propertyId) => {
  const [propertyDetails, setPropertyDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const propertyRegistryContract = useContract(
    import.meta.env.VITE_APP_PROPERTY_REGISTRY_ADDRESS,
    propertyRegistryABI
  );

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      if (propertyRegistryContract && propertyId) {
        try {
          setIsLoading(true);
          const details = await propertyRegistryContract.getProperty(propertyId);
    
          const formattedDetails = {
            name: details[0],
            location: details[1],
            id: details[2],
            isActive: details[3],
            images: details[4],
            fee: details[5],
            owner: details[6],
          };
    
          console.log(formattedDetails);
          setPropertyDetails(formattedDetails);
        } catch (error) {
          console.error("Error fetching property details:", error);
          setError(error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    

    fetchPropertyDetails();
  }, [propertyRegistryContract, propertyId]);

  return { propertyDetails, isLoading, error };
};

export default usePropertyDetails;
