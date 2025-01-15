import { useState, useEffect } from "react";
import useContract from "./useContract";
import propertyRegistryABI from "../abis/PropertyRegistry.json";

const useFetchProperties = () => {
  const [properties, setProperties] = useState([]);
  const propertyRegistryContract = useContract(
    import.meta.env.VITE_APP_PROPERTY_REGISTRY_ADDRESS,
    propertyRegistryABI
  );

  useEffect(() => {
    const fetchAllProperties = async () => {
      if (!propertyRegistryContract) return;

      try {
        const propertyIds = await propertyRegistryContract.getAllProperties();

        const propertyDetails = await Promise.all(
          propertyIds.map(async (id) => {
            try {
              const property = await propertyRegistryContract.getProperty(id);
              return {
                id: id.toString(), 
                name: property[0], 
                location: property[1], 
                tokenId: property[2].toString(), 
                isActive: property[3], 
                imageUrls: property[4],
                listingFee: property[5].toString(), 
              };
            } catch (error) {
              console.error(`Error fetching details for property ID ${id}:`, error);
              return null;
            }
          })
        );

        setProperties(propertyDetails.filter((property) => property !== null));
      } catch (error) {
        console.error("Error fetching properties:", error);
      }
    };

    fetchAllProperties();
  }, [propertyRegistryContract]);

  return properties;
};

export default useFetchProperties;
