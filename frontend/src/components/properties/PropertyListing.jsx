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
import useFetchProperties from "../../hooks/useFetchProperties";
import { ethers } from "ethers";
import { toast } from "react-toastify";

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
    imageUrls: [],
    listingFee: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [uploading, setUploading] = useState(false);

  const addProperty = useCreateProperty();
  const properties = useFetchProperties();

  useEffect(() => {
    if (properties && properties.length > 0) {
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
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
            parseFloat(property.listingFee) >= parseFloat(filters.minPrice)) &&
          (filters.maxPrice === "" ||
            parseFloat(property.listingFee) <= parseFloat(filters.maxPrice)) &&
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
    setNewProperty((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "estoken");

    try {
      setUploading(true);
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dn2ed9k6p/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      setNewProperty((prev) => ({
        ...prev,
        imageUrls: [...prev.imageUrls, data.secure_url],
      }));

      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handlePropertyCreation = async () => {
    try {
      const { name, location, tokenId, imageUrls, listingFee } = newProperty;

      if (imageUrls.length === 0) {
        toast.error("Please upload at least one image.");
        return;
      }

      const createdPropertyId = await addProperty(
        name,
        location,
        tokenId,
        imageUrls,
        listingFee
      );

      setNewProperty({
        name: "",
        location: "",
        tokenId: "",
        imageUrls: [],
        listingFee: "",
      });

      toast.success(`Property created successfully with ID: ${createdPropertyId}`);
    } catch (error) {
      console.error("Error creating property:", error);
      toast.error(`Failed to create property: ${error.message || "Unknown error"}`);
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
                <Label htmlFor="imageUrls">Upload Images</Label>
                <Input
                  id="imageUrls"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="col-span-3"
                />
                {uploading && <p>Uploading...</p>}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="listingFee">Listing Fee (ETH)</Label>
                <Input
                  id="listingFee"
                  name="listingFee"
                  value={newProperty.listingFee}
                  onChange={handleNewPropertyChange}
                  className="col-span-3"
                  placeholder="Enter fee in ETH"
                  type="number"
                  step="0.000000000000000001"
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
            <Label htmlFor="minPrice">Min Price (ETH)</Label>
            <Input
              id="minPrice"
              type="number"
              placeholder="Min Price in ETH"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
              step="0.000000000000000001"
            />
          </div>
          <div>
            <Label htmlFor="maxPrice">Max Price (ETH)</Label>
            <Input
              id="maxPrice"
              type="number"
              placeholder="Max Price in ETH"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              step="0.000000000000000001"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}

