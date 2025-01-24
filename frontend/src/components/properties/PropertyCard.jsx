import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Home, MapPin, Coins, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export function PropertyCard({ property }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    if (property.imageUrls && property.imageUrls.length > 1) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % property.imageUrls.length);
    }
  };

  const prevImage = () => {
    if (property.imageUrls && property.imageUrls.length > 1) {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + property.imageUrls.length) % property.imageUrls.length);
    }
  };

  return (
    <Card className="relative w-full max-w-lg mx-auto sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
      {/* Image Section */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <motion.img
          key={currentImageIndex}
          src={property.imageUrls?.[currentImageIndex] || '/placeholder.svg?height=400&width=600'}
          alt={`${property.name} - Image ${currentImageIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-500"
        />
        {property.imageUrls?.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70"
              onClick={prevImage}
              aria-label="Previous Image"
            >
              <ChevronLeft className="h-6 w-6 text-white" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70"
              onClick={nextImage}
              aria-label="Next Image"
            >
              <ChevronRight className="h-6 w-6 text-white" />
            </Button>
            <div className="absolute bottom-4 left-4 flex space-x-1">
              {property.imageUrls.map((_, index) => (
                <span
                  key={index}
                  className={`w-2.5 h-2.5 rounded-full ${
                    index === currentImageIndex ? 'bg-white' : 'bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-lg sm:text-2xl font-bold mb-2">{property.name}</h2>
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 sm:h-5 w-4 sm:w-5 mr-2" />
              <span className="text-sm sm:text-base">{property.location}</span>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm sm:text-lg px-3 py-1">
            {property.totalShares} Shares
          </Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center">
            <Home className="h-5 sm:h-6 w-5 sm:w-6 mr-3 text-primary" />
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Price per Share</p>
              <p className="text-sm sm:text-lg font-semibold">{property.pricePerShare} ETH</p>
            </div>
          </div>
          <div className="flex items-center">
            <Coins className="h-5 sm:h-6 w-5 sm:w-6 mr-3 text-primary" />
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Rental Yield</p>
              <p className="text-sm sm:text-lg font-semibold">{property.accumulatedRentalIncomePerShare} ETH</p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-secondary p-4 sm:p-6">
        <div className="w-full flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex items-center">
            <Users className="h-4 sm:h-5 w-4 sm:w-5 mr-2 text-primary" />
            <span className="text-xs sm:text-sm">
              <strong>{property.currentInvestors}</strong> current investors
            </span>
          </div>
          <Link to={`/dashboard/properties/${property.id}`} className="w-full sm:w-1/2">
          <Button className="w-full text-sm sm:text-lg py-4 sm:py-6 hover:scale-105 transition-transform">
            <ChevronRight className="mr-2" />
            View Details
          </Button>
        </Link>

        </div>
      </CardFooter>
    </Card>
  );
}
