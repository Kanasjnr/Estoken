import { useState, useEffect } from "react";
import { PropertyCard } from "./PropertyCard";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import useCreateProperty from "../../hooks/useCreateProperty";
import { useAppKitAccount } from "@reown/appkit/react";
import useFetchProperties from "../../hooks/useFetchProperties";
import usePropertyDetails from "../../hooks/usePropertyDetails";

export function PropertyListing() {
  // State management for property list, search term, filters, etc.
  const [propertyDetailsList, setPropertyDetailsList] = useState([]);
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

  // Hooks to handle property creation and data fetching
  const addProperty = useCreateProperty();
  const { address } = useAppKitAccount();
  const propertyIds = useFetchProperties();

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      setIsLoading(true);
      const detailsList = await Promise.all(
        propertyIds.map(async (id) => {
          const details = await usePropertyDetails(id);
          return details;
        })
      );
      setPropertyDetailsList(detailsList.filter(Boolean));
      setIsLoading(false);
    };

    if (propertyIds.length > 0) {
      fetchPropertyDetails();
    }
  }, [propertyIds]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle changes in the filter inputs
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  // Handle changes in the property creation form
  const handleNewPropertyChange = (e) => {
    const { name, value } = e.target;
    setNewProperty({
      ...newProperty,
      [name]: value,
    });
  };

  // Handle property creation form submission
  const handlePropertyCreation = async () => {
    try {
      const { name, location, tokenId, imageUrls, listingFee } = newProperty;
      await addProperty(name, location, tokenId, imageUrls.split(','), listingFee);
      setNewProperty({ name: "", location: "", tokenId: "", imageUrls: "", listingFee: "" });
    } catch (error) {
      console.error("Error creating property:", error);
    }
  };

  // Apply search term and filter to properties list
  const filteredProperties = propertyDetailsList.filter((property) => {
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
      {/* Header Section */}
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
              {/* Property Form */}
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
                  placeholder="Comma separated image URLs"
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
            {/* Create Property Button */}
            <Button onClick={handlePropertyCreation}>Create Property</Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter Section */}
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
          {/* Filters */}
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

      {/* Property Cards Section */}
      {isLoading ? (
        <p>Loading properties...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.tokenId} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
