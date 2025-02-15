"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAppKitAccount } from "@reown/appkit/react"
import useGetNFTForProperty from "../../hooks/Properties/useGetNFTForProperty"
import useAllProperties from "../../hooks/Properties/useAllProperties"
import { Building, MapPin, User, Share2, Clock, ChevronRight } from "lucide-react"

const NFTViewer = () => {
  const [userNFTs, setUserNFTs] = useState([])
  const [selectedNFT, setSelectedNFT] = useState(null)
  const [view, setView] = useState("grid")
  const { address, isConnected } = useAppKitAccount()
  const { getNFTForProperty, loading: nftLoading, error: nftError } = useGetNFTForProperty()
  const { properties, loading: propertiesLoading, error: propertiesError } = useAllProperties()

  useEffect(() => {
    const fetchUserNFTs = async () => {
      if (!isConnected || !properties || !address) return

      const nftPromises = properties.map(async (property) => {
        const nftData = await getNFTForProperty(property.id, address)
        if (nftData && nftData.tokenId !== "0") {
          return {
            nftData,
            property,
          }
        }
        return null
      })

      const nfts = await Promise.all(nftPromises)
      setUserNFTs(nfts.filter((nft) => nft !== null))
    }

    fetchUserNFTs()
  }, [isConnected, properties, address, getNFTForProperty])

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Connect Wallet</h2>
            <p className="text-gray-600">Please connect your wallet to view your property NFTs</p>
            <Button className="mt-4">Connect Wallet</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (nftLoading || propertiesLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <h3 className="text-xl font-semibold">Loading Your NFTs</h3>
        <p className="text-gray-600">Please wait while we fetch your property NFTs...</p>
      </div>
    )
  }

  if (nftError || propertiesError) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <User className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold">Error Loading NFTs</h2>
            <p className="text-gray-600">{nftError || propertiesError}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Property NFTs</h1>
          <p className="text-gray-600 mt-2">Manage your property ownership tokens</p>
        </div>
        <div className="flex gap-2">
          <Button variant={view === "grid" ? "default" : "outline"} size="sm" onClick={() => setView("grid")}>
            Grid
          </Button>
          <Button variant={view === "list" ? "default" : "outline"} size="sm" onClick={() => setView("list")}>
            List
          </Button>
        </div>
      </div>

      {userNFTs.length === 0 ? (
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Building className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">No NFTs Found</h2>
            <p className="text-gray-600 max-w-md">
              You do not own any property NFTs yet. Visit the marketplace to start investing in properties.
            </p>
            <Button className="mt-4">Browse Marketplace</Button>
          </CardContent>
        </Card>
      ) : (
        <div className={view === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          <AnimatePresence>
            {userNFTs.map((nft) => (
              <motion.div
                key={nft.nftData.tokenId}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  className={`group cursor-pointer transition-all duration-300 hover:shadow-xl ${
                    selectedNFT?.nftData.tokenId === nft.nftData.tokenId
                      ? "ring-2 ring-primary"
                      : "hover:ring-1 hover:ring-primary/50"
                  }`}
                  onClick={() => setSelectedNFT(nft)}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={nft.property.imageUrls[0] || "/placeholder.svg?height=300&width=400"}
                      alt={nft.property.name}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="bg-black/50 text-white backdrop-blur-sm">
                        NFT #{nft.nftData.tokenId}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{nft.property.name}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          {nft.property.location}
                        </CardDescription>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Ownership Share</p>
                        <p className="text-lg font-semibold flex items-center">
                          <Share2 className="w-4 h-4 mr-1" />
                          {nft.nftData.shares} Tokens
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {selectedNFT && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setSelectedNFT(null)}
            />
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="fixed top-0 right-0 w-full max-w-md h-full bg-white shadow-2xl overflow-y-auto z-50"
            >
              <div className="sticky top-0 bg-white z-10 p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">NFT Details</h2>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedNFT(null)}>
                    ×
                  </Button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <img
                  src={selectedNFT.property.imageUrls[0] || "/placeholder.svg?height=300&width=400"}
                  alt={selectedNFT.property.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold">{selectedNFT.property.name}</h3>
                    <p className="text-gray-600 flex items-center mt-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      {selectedNFT.property.location}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-gray-500">Token ID</p>
                        <p className="text-lg font-semibold">#{selectedNFT.nftData.tokenId}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-gray-500">Ownership</p>
                        <p className="text-lg font-semibold">{selectedNFT.nftData.shares} Tokens</p>
                      </CardContent>
                    </Card>
                  </div>
                  <Card>
                    <CardContent className="pt-6">
                      <h4 className="font-semibold mb-2">Property Description</h4>
                      <p className="text-gray-600">{selectedNFT.property.description}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <h4 className="font-semibold">Investment Details</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Purchase Date</span>
                          <span className="font-medium">{selectedNFT.property.creationTimestamp}</span>
                        </div>
                      
                        <div className="flex justify-between">
                          <span className="text-gray-600">Price Per Share</span>
                          <span className="font-medium">{selectedNFT.property.pricePerShare} XFI</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Next Payout</span>
                          <span className="font-medium flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {selectedNFT.property.lastRentalUpdate}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NFTViewer

