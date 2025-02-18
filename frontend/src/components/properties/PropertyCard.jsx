import { useState } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, ChevronRight, Home, MapPin, Coins, Users } from "lucide-react"

export function PropertyCard({ property }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const nextImage = () => {
    if (property.imageUrls && property.imageUrls.length > 1) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % property.imageUrls.length)
    }
  }

  const prevImage = () => {
    if (property.imageUrls && property.imageUrls.length > 1) {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + property.imageUrls.length) % property.imageUrls.length)
    }
  }

  return (
    <Card className="group relative w-full max-w-sm mx-auto overflow-hidden transition-all duration-300 hover:shadow-xl">
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <AnimatePresence initial={false}>
          <motion.img
            key={currentImageIndex}
            src={property.imageUrls?.[currentImageIndex] || "/placeholder.svg?height=400&width=600"}
            alt={`${property.name} - Image ${currentImageIndex + 1}`}
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        </AnimatePresence>
        {property.imageUrls?.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white"
              onClick={prevImage}
              aria-label="Previous Image"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white"
              onClick={nextImage}
              aria-label="Next Image"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {property.imageUrls?.map((_, index) => (
            <span
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                index === currentImageIndex ? "bg-white scale-125" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-xl font-bold truncate">{property.name}</h2>
          <Badge variant="secondary" className="text-xs px-2 py-1">
            {property.totalShares} Shares
          </Badge>
        </div>
        <div className="flex items-center text-muted-foreground text-sm mb-4">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="truncate">{property.location}</span>
        </div>
        <Separator className="my-4" />
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <Home className="h-5 w-5 mr-2 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Price per Share</p>
              <p className="text-sm font-semibold">{property.pricePerShare} XFI</p>
            </div>
          </div>
          
        </div>
      </CardContent>

      <CardFooter className="bg-muted p-4">
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-1" />
            <span>
              <strong>{property.currentInvestors}</strong> investors
            </span>
          </div>
          <Link to={`/dashboard/properties/${property.id}`} className="w-1/2">
            <Button className="w-full text-sm" variant="default">
              View Details
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
