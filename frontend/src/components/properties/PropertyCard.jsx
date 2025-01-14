import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import usePropertyDetails from '../../hooks/usePropertyDetails';

export function PropertyCard({ property }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const propertyDetails = usePropertyDetails(property.id);
  
  // Fallback to an empty array for imageUrls if it's undefined or null
  const imageUrls = propertyDetails?.imageUrls || [];

  useEffect(() => {
    if (imageUrls.length > 0) {
      setCurrentImageIndex(0); // Reset image index when property details change
    }
  }, [imageUrls]);

  if (!propertyDetails) {
    return <div>Loading...</div>;
  }

  const nextImage = () => {
    if (imageUrls.length > 1) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
    }
  };

  const prevImage = () => {
    if (imageUrls.length > 1) {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + imageUrls.length) % imageUrls.length);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{propertyDetails.name}</CardTitle>
        <CardDescription>{propertyDetails.location}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <img
            src={imageUrls[currentImageIndex] || 'https://via.placeholder.com/300x200'}
            alt={`${propertyDetails.name} - Image ${currentImageIndex + 1}`}
            className="w-full h-48 object-cover rounded-md"
          />
          {imageUrls.length > 1 && (
            <>
              <Button className="absolute left-2 top-1/2 transform -translate-y-1/2" onClick={prevImage}>
                ←
              </Button>
              <Button className="absolute right-2 top-1/2 transform -translate-y-1/2" onClick={nextImage}>
                →
              </Button>
            </>
          )}
        </div>
        <p className="text-sm text-gray-500">Token ID: {propertyDetails.tokenId}</p>
        <p className="text-sm text-gray-500">Active: {propertyDetails.isActive ? 'Yes' : 'No'}</p>
        <p className="text-sm text-gray-500">Valuation: {propertyDetails.valuation}</p>
        <p className="text-sm text-gray-500">Token Price: {propertyDetails.tokenPrice}</p>
        <p className="text-sm text-gray-500">Rental Yield: {propertyDetails.rentalYield}</p>
      </CardContent>
      <CardFooter>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full">View Details</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{propertyDetails.name}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <p>Location: {propertyDetails.location}</p>
              <p>Token ID: {propertyDetails.tokenId}</p>
              <p>Listing Fee: {propertyDetails.listingFee} wei</p>
              <p>Status: {propertyDetails.isActive ? "Active" : "Inactive"}</p>
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
