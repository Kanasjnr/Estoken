import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import usePropertyDetails from '../../hooks/usePropertyDetails';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function PropertyDetails() {
  const { id } = useParams();
  const { propertyDetails, loading, error } = usePropertyDetails(id);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  if (loading) {
    return <div className="text-center py-8">Loading property details...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  if (!propertyDetails) {
    return <div className="text-center py-8">No property details found</div>;
  }

  const nextImage = () => {
    if (propertyDetails.imageUrls?.length > 1) {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % propertyDetails.imageUrls.length
      );
    }
  };

  const prevImage = () => {
    if (propertyDetails.imageUrls?.length > 1) {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex - 1 + propertyDetails.imageUrls.length) % propertyDetails.imageUrls.length
      );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>{propertyDetails.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative aspect-video">
              <img
                src={propertyDetails.imageUrls?.[currentImageIndex] || '/placeholder.svg?height=400&width=600'}
                alt={`${propertyDetails.name} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              {propertyDetails.imageUrls?.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
            <div className="space-y-4">
              <p><span className="font-medium">Location:</span> {propertyDetails.location}</p>
              <p><span className="font-medium">Total Shares:</span> {propertyDetails.totalShares}</p>
              <p><span className="font-medium">Price per Share:</span> {propertyDetails.pricePerShare} ETH</p>
              <p><span className="font-medium">Status:</span> {propertyDetails.isActive ? "Active" : "Inactive"}</p>
              <p><span className="font-medium">Last Rental Update:</span> {propertyDetails.lastRentalUpdate}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Property Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{propertyDetails.description}</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="financials" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><span className="font-medium">Accumulated Rental Income per Share:</span> {propertyDetails.accumulatedRentalIncomePerShare} ETH</p>
                <p><span className="font-medium">Total Value:</span> {parseFloat(propertyDetails.pricePerShare) * parseFloat(propertyDetails.totalShares)} ETH</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}