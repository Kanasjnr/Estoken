import { useState, useEffect } from "react";
import useContract from "./useContract";
import propertyRegistryABI from "../abis/PropertyRegistry.json";

const useFetchProperties = () => {
  const [properties, setProperties] = useState([]);
  const propertyRegistryContract = useContract(import.meta.env.PROPERTY_REGISTRY_ADDRESS, propertyRegistryABI);

  useEffect(() => {
    const fetchProperties = async () => {
      if (propertyRegistryContract) {
        try {
          const propertyCount = await propertyRegistryContract.getPropertyCount();
          const propertyIds = Array.from({ length: propertyCount.toNumber() }, (_, i) => i + 1); // Assuming IDs start from 1
          setProperties(propertyIds);
        } catch (error) {
          console.error("Error fetching properties:", error);
        }
      }
    };

    fetchProperties();
  }, [propertyRegistryContract]);

  return properties;
};

export default useFetchProperties;
