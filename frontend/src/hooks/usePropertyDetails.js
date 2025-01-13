import { useState, useEffect } from 'react';
import useContract from './useContract';
import propertyRegistryABI from '../abis/PropertyRegistry.json';

const usePropertyDetails = (propertyId) => {
  const [propertyDetails, setPropertyDetails] = useState(null);
  const propertyRegistryContract = useContract(import.meta.env.PROPERTY_REGISTRY_ADDRESS, propertyRegistryABI);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      if (propertyRegistryContract && propertyId) {
        try {
          const details = await propertyRegistryContract.getProperty(propertyId);
          setPropertyDetails({
            name: details[0],
            location: details[1],
            tokenId: details[2].toString(),
            isActive: details[3]
          });
        } catch (error) {
          console.error('Error fetching property details:', error);
        }
      }
    };

    fetchPropertyDetails();
  }, [propertyRegistryContract, propertyId]);

  return propertyDetails;
};

export default usePropertyDetails;

