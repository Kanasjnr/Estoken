import { useParams } from "react-router-dom"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import useGetProperty from "../../hooks/useGetProperty"
import { formatEther } from "ethers"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Home, MapPin, Coins, Users, Calendar } from "lucide-react"

const Loader = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="w-16 h-16 border-4 border-t-primary border-primary/30 rounded-full animate-spin"></div>
  </div>
)

export function PropertyDetails() {
  const { id } = useParams()
  const { property, loading, error } = useGetProperty(id)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % (property?.imageUrls?.length || 1))
  }

  const prevImage = () => {
    setCurrentImageIndex(
      (prevIndex) => (prevIndex - 1 + (property?.imageUrls?.length || 1)) % (property?.imageUrls?.length || 1),
    )
  }

  if (loading) return <Loader />

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-red-500 text-xl font-medium">Error: {error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-xl font-medium">No property found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Image Carousel */}
          <div className="relative aspect-video">
            <AnimatePresence initial={false}>
              <motion.img
                key={currentImageIndex}
                src={property.imageUrls[currentImageIndex]}
                alt={`Property image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
            </AnimatePresence>
            <div className="absolute inset-0 flex items-center justify-between px-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={prevImage}
                className="bg-black/30 hover:bg-black/50 text-white"
                aria-label="Previous Image"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextImage}
                className="bg-black/30 hover:bg-black/50 text-white"
                aria-label="Next Image"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {property.imageUrls.map((_, index) => (
                <span
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentImageIndex ? "bg-white scale-125" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Property Details */}
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">{property.name}</h1>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-5 w-5 mr-2" />
                <span>{property.location}</span>
              </div>
            </div>

            <Separator />

            <p className="text-lg">{property.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <Home className="h-10 w-10 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Shares</p>
                      <p className="text-2xl font-bold">{property.totalShares}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <Users className="h-10 w-10 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Available Shares</p>
                      <p className="text-2xl font-bold">{property.availableShares}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <Coins className="h-10 w-10 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Price Per Share</p>
                      <p className="text-2xl font-bold">{formatEther(property.pricePerShare)} ETH</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <Calendar className="h-10 w-10 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Last Rental Update</p>
                      <p className="text-lg font-semibold">{property.lastRentalUpdate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-between items-center">
              <Badge variant={property.isActive ? "default" : "secondary"} className="text-lg px-3 py-1">
                {property.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

