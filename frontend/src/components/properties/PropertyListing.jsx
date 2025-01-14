import { useState, useEffect } from "react";
import { PropertyCard } from "./PropertyCard";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import useCreateProperty from "../../hooks/useCreateProperty";
import { useAppKitAccount } from "@reown/appkit/react";
import useFetchProperties from "../../hooks/useFetchProperties";

// Simple CSS spinner loader with message
const Loader = () => (
  <div className="flex justify-center items-center flex-col">
    <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
    <p className="mt-4 text-gray-600">Loading properties...</p>
  </div>
);

export function PropertyListing() {
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
    imageUrls: "",
    listingFee: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filteredProperties, setFilteredProperties] = useState([]);

  const addProperty = useCreateProperty();
  const { address } = useAppKitAccount();
  const properties = useFetchProperties();

  useEffect(() => {
    if (properties && properties.length > 0) {
      setTimeout(() => {
        setIsLoading(false);
      }, 5000); // Simulate loading for 5 seconds
    } else {
      setIsLoading(false);
    }
  }, [properties]);

  useEffect(() => {
    if (properties && properties.length > 0) {
      const filtered = properties.filter((property) => {
        return (
          property.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          (filters.location === "" ||
            property.location.toLowerCase().includes(filters.location.toLowerCase())) &&
          (filters.minPrice === "" ||
            parseFloat(property.tokenId) >= parseFloat(filters.minPrice)) &&
          (filters.maxPrice === "" ||
            parseFloat(property.tokenId) <= parseFloat(filters.maxPrice)) &&
          (filters.minYield === "" || parseFloat(property.isActive) >= parseFloat(filters.minYield))
        );
      });
      setFilteredProperties(filtered);
    }
  }, [properties, filters, searchTerm]);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleNewPropertyChange = (e) => {
    const { name, value } = e.target;
    setNewProperty({
      ...newProperty,
      [name]: value,
    });
  };

  const handlePropertyCreation = async () => {
    try {
      const { name, location, tokenId, imageUrls, listingFee } = newProperty;

      const imageUrlsArray = imageUrls
        .split(",")
        .map((url) => url.trim())
        .filter((url) => url);

      if (imageUrlsArray.length === 0) {
        alert("Please provide at least one valid image URL.");
        return;
      }

      const createdPropertyId = await addProperty(
        name,
        location,
        tokenId,
        imageUrlsArray,
        listingFee
      );

      setNewProperty({
        name: "",
        location: "",
        tokenId: "",
        imageUrls: "",
        listingFee: "",
      });

      alert(`Property created successfully with ID: ${createdPropertyId}`);
    } catch (error) {
      console.error("Error creating property:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Property Listings</h2>
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
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={newProperty.name}
                  onChange={handleNewPropertyChange}
                  className="col-span-3"
                  placeholder="Property name"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={newProperty.location}
                  onChange={handleNewPropertyChange}
                  className="col-span-3"
                  placeholder="Location"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tokenId">Token ID</Label>
                <Input
                  id="tokenId"
                  name="tokenId"
                  value={newProperty.tokenId}
                  onChange={handleNewPropertyChange}
                  className="col-span-3"
                  placeholder="Unique token ID"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="imageUrls">Image URLs</Label>
                <Input
                  id="imageUrls"
                  name="imageUrls"
                  value={newProperty.imageUrls}
                  onChange={handleNewPropertyChange}
                  className="col-span-3"
                  placeholder="Comma-separated image URLs (e.g., https://image1.jpg, https://image2.jpg)"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="listingFee">Listing Fee (optional)</Label>
                <Input
                  id="listingFee"
                  name="listingFee"
                  value={newProperty.listingFee}
                  onChange={handleNewPropertyChange}
                  className="col-span-3"
                  placeholder="Enter fee in wei (optional)"
                  type="number"
                />
              </div>
            </div>
            <Button onClick={handlePropertyCreation}>Create Property</Button>
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

      {isLoading ? (
        <Loader />
      ) : filteredProperties.length === 0 ? (
        <p className="text-center text-gray-600">No properties created yet</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
