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
        // Fetch all property IDs
        const propertyIds = await propertyRegistryContract.getAllProperties();

        // Fetch details for each property
        const propertyDetails = await Promise.all(
          propertyIds.map(async (id) => {
            try {
              const property = await propertyRegistryContract.getProperty(id);
              return {
                id: id.toString(), // Convert BigNumber to string for better compatibility
                name: property[0], // Property name
                location: property[1], // Property location
                tokenId: property[2].toString(), // Convert tokenId to string
                isActive: property[3], // Whether the property is active
                imageUrls: property[4],
                listingFee: property[5].toString(), // Comma-separated image URLs
              };
            } catch (error) {
              console.error(`Error fetching details for property ID ${id}:`, error);
              return null;
            }
          })
        );

        // Filter out null entries (failed fetches) and update state
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
