import { useState, useEffect } from "react";
import { PropertyCard } from "./PropertyCard";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import useCreateProperty from "../hooks/useCreateProperty";
import { useAppKitAccount } from "@reown/appkit/react";
import propertyRegistryABI from "../abis/PropertyRegistry.json";
import { ethers } from "ethers";

export function PropertyListing() {
  const [properties, setProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    location: "",
    minPrice: "",
    maxPrice: "",
    minYield: "",
  });
  const [newProperty, setNewProperty] = useState({
    name: "",
    location: "",
    tokenId: "",
  });

  const addProperty = useCreateProperty();
  const { address } = useAppKitAccount();

  const propertyRegistryContractAddress = import.meta.env.VITE_PROPERTY_REGISTRY_ADDRESS;

  useEffect(() => {
    const fetchProperties = async () => {
      if (propertyRegistryContractAddress && address) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const contract = new ethers.Contract(
            propertyRegistryContractAddress,
            propertyRegistryABI,
            provider
          );

          const propertyCount = await contract.propertyCount();
          const fetchedProperties = [];
          for (let i = 1; i <= propertyCount; i++) {
            const propertyDetails = await contract.getProperty(i);
            fetchedProperties.push({
              id: i,
              name: propertyDetails[0],
              location: propertyDetails[1],
              tokenId: propertyDetails[2].toString(),
              isActive: propertyDetails[3],
              valuation: "$1,000,000",
              tokenPrice: "$100",
              rentalYield: "5%",
              image: "https://via.placeholder.com/300x200",
            });
          }
          setProperties(fetchedProperties);
        } catch (error) {
          console.error("Error fetching properties:", error);
        }
      }
    };

    fetchProperties();
  }, [propertyRegistryContractAddress, address]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleNewPropertyChange = (e) => {
    setNewProperty({
      ...newProperty,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateProperty = async () => {
    try {
      const { name, location, tokenId } = newProperty;
      await addProperty(propertyRegistryContractAddress, name, location, tokenId);

      // Fetch the newly created property
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        propertyRegistryContractAddress,
        propertyRegistryABI,
        provider
      );
      const propertyCount = await contract.propertyCount();
      const newPropertyDetails = await contract.getProperty(propertyCount);

      const newPropertyWithId = {
        id: propertyCount,
        name: newPropertyDetails[0],
        location: newPropertyDetails[1],
        tokenId: newPropertyDetails[2].toString(),
        isActive: newPropertyDetails[3],
        valuation: "$1,000,000",
        tokenPrice: "$100",
        rentalYield: "5%",
        image: "https://via.placeholder.com/300x200",
      };

      setProperties([...properties, newPropertyWithId]);
      setNewProperty({
        name: "",
        location: "",
        tokenId: "",
      });
    } catch (error) {
      console.error("Failed to create property:", error);
    }
  };

  const filteredProperties = properties.filter((property) => {
    return (
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filters.location === "" ||
        property.location.toLowerCase().includes(filters.location.toLowerCase())) &&
      (filters.minPrice === "" ||
        parseFloat(property.tokenPrice.replace("$", "")) >= parseFloat(filters.minPrice)) &&
      (filters.maxPrice === "" ||
        parseFloat(property.tokenPrice.replace("$", "")) <= parseFloat(filters.maxPrice)) &&
      (filters.minYield === "" || parseFloat(property.rentalYield) >= parseFloat(filters.minYield))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Property Listings</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Create Property</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Property</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={newProperty.name}
                  onChange={handleNewPropertyChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Location
                </Label>
                <Input
                  id="location"
                  name="location"
                  value={newProperty.location}
                  onChange={handleNewPropertyChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tokenId" className="text-right">
                  Token ID
                </Label>
                <Input
                  id="tokenId"
                  name="tokenId"
                  value={newProperty.tokenId}
                  onChange={handleNewPropertyChange}
                  className="col-span-3"
                />
              </div>
            </div>
            <Button onClick={handleCreateProperty}>Create Property</Button>
          </DialogContent>
        </Dialog>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="mb-4">
          <Label htmlFor="search">Search properties</Label>
          <Input
            id="search"
            type="text"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              type="text"
              placeholder="Location"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
            />
          </div>
          <div>
            <Label htmlFor="minPrice">Min Price</Label>
            <Input
              id="minPrice"
              type="number"
              placeholder="Min Price"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
            />
          </div>
          <div>
            <Label htmlFor="maxPrice">Max Price</Label>
            <Input
              id="maxPrice"
              type="number"
              placeholder="Max Price"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
            />
          </div>
          <div>
            <Label htmlFor="minYield">Min Yield %</Label>
            <Input
              id="minYield"
              type="number"
              placeholder="Min Yield %"
              name="minYield"
              value={filters.minYield}
              onChange={handleFilterChange}
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
}
