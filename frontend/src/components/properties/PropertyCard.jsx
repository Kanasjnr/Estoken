import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import usePropertyDetails from '../../hooks/usePropertyDetails';
import { ethers } from "ethers";
import PropertyDetails from './PropertyDetails';

export function PropertyCard({ property }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { propertyDetails, isLoading, error } = usePropertyDetails(property.id);

  useEffect(() => {
    if (propertyDetails?.imageUrls?.length > 0) {
      setCurrentImageIndex(0);
    }
  }, [propertyDetails]);

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardContent>Loading property details...</CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="overflow-hidden">
        <CardContent>Error loading property details: {error.message}</CardContent>
      </Card>
    );
  }

  const details = propertyDetails || property;

  const nextImage = () => {
    if (details.imageUrls && details.imageUrls.length > 1) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % details.imageUrls.length);
    }
  };

  const prevImage = () => {
    if (details.imageUrls && details.imageUrls.length > 1) {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + details.imageUrls.length) % details.imageUrls.length);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{details.name}</CardTitle>
        <CardDescription>{details.location}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4">
          <img
            src={property.imageUrls && property.imageUrls.length > 0 
              ? property.imageUrls[currentImageIndex] 
              : 'https://via.placeholder.com/300x200'}
            alt={`${property.name} - Image ${currentImageIndex + 1}`}
            className="w-full h-48 object-cover rounded-md"
          />
          {property.imageUrls && property.imageUrls.length > 1 && (
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
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Token ID: {details.tokenId}</p>
          <p className="text-sm text-gray-500">Active: {details.isActive ? 'Yes' : 'No'}</p>
          <p className="text-sm text-gray-500">Listing Fee: {property.listingFee ? ethers.formatEther(property.listingFee.toString()) : '0'} ETH</p>
        </div>
      </CardContent>
      <CardFooter>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full">View Details</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{details.name}</DialogTitle>
            </DialogHeader>
            <PropertyDetails propertyId={property.id} />
            <p>Listing Fee: {property.listingFee ? ethers.formatEther(property.listingFee.toString()) : '0'} ETH</p>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}

