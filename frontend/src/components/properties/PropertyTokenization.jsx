"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useESToken } from "@/context/ESTokenContext"
import useTokenizeProperty from "../../hooks/Properties/useTokenizeProperty"
import { toast } from "react-toastify"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Loader2, Upload, ImageIcon, DollarSign, Hash, MapPin, Info, X } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"

const PropertyTokenization = () => {
  const { isInitialized } = useESToken()
  const { tokenizeProperty, loading, error } = useTokenizeProperty()

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    imageUrls: [],
    totalShares: "",
    pricePerShare: "",
    initialValuation: "",
    monthlyRentalIncome: "",
  })

  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [advancedMode, setAdvancedMode] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    try {
      setUploading(true)
      setUploadProgress(0)
      const uploadedUrls = await Promise.all(
        files.map(async (file, index) => {
          const formData = new FormData()
          formData.append("file", file)
          formData.append("upload_preset", "estoken")

          const response = await fetch("https://api.cloudinary.com/v1_1/dn2ed9k6p/image/upload", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) throw new Error("Failed to upload image")
          const data = await response.json()
          setUploadProgress(((index + 1) / files.length) * 100)
          return data.secure_url
        }),
      )

      setFormData((prevState) => ({
        ...prevState,
        imageUrls: [...prevState.imageUrls, ...uploadedUrls],
      }))

      toast.success("Images uploaded successfully!")
    } catch (error) {
      console.error("Error uploading images:", error)
      toast.error("Failed to upload images. Please try again.")
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleRemoveImage = (index) => {
    setFormData((prevState) => ({
      ...prevState,
      imageUrls: prevState.imageUrls.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isInitialized) {
      toast.error("Please connect to Base Sepolia Testnet")
      return
    }

    if (formData.imageUrls.length === 0) {
      toast.error("Please upload at least one image.")
      return
    }

    try {
      await tokenizeProperty(
        formData.name,
        formData.location,
        formData.description,
        formData.imageUrls,
        formData.totalShares,
        formData.pricePerShare,
        formData.initialValuation,
        formData.monthlyRentalIncome,
      )

      setFormData({
        name: "",
        location: "",
        description: "",
        imageUrls: [],
        totalShares: "",
        pricePerShare: "",
        initialValuation: "",
        monthlyRentalIncome: "",
      })

      // Success toast is handled in the hook
    } catch (err) {
      // Error handling is done in the hook, so we don't need to do anything here
      console.error("Error tokenizing property:", err)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="max-w-4xl mx-auto mt-10 bg-white text-gray-900 border-none shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 p-8">
          <CardTitle className="text-4xl font-bold mb-2">Tokenize Your Property</CardTitle>
          <CardDescription className="text-xl text-gray-700">
            Transform your real estate into digital assets
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <ScrollArea className="h-[60vh] pr-4">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-lg font-semibold text-gray-700">
                    Property Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="text-lg bg-gray-100 border-gray-300 focus:border-blue-500 text-gray-900"
                    placeholder="Luxurious Downtown Condo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-lg font-semibold text-gray-700">
                    Location
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      className="text-lg pl-10 bg-gray-100 border-gray-300 focus:border-blue-500 text-gray-900"
                      placeholder="123 Crypto Street, Blockchain City"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-lg font-semibold text-gray-700">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="text-lg bg-gray-100 border-gray-300 focus:border-blue-500 text-gray-900"
                  placeholder="Describe your property in detail..."
                />
              </div>
              <div className="space-y-4">
                <Label htmlFor="images" className="text-lg font-semibold text-gray-700">
                  Property Images
                </Label>
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1">
                    <Input
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="text-lg bg-gray-100 border-gray-300 focus:border-blue-500 text-gray-900"
                    />
                    <ImageIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  </div>
                  {uploading && <Loader2 className="animate-spin text-blue-500" />}
                </div>
                {uploading && <Progress value={uploadProgress} className="w-full mt-2" />}
                {formData.imageUrls.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {formData.imageUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url || "/placeholder.svg"}
                          alt={`Uploaded ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="advanced-mode" checked={advancedMode} onCheckedChange={setAdvancedMode} />
                <Label htmlFor="advanced-mode" className="text-lg font-semibold text-gray-700">
                  Advanced Mode
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-gray-500 cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-gray-100 text-gray-900">
                      <p>Enable to set custom share details</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <AnimatePresence>
                {advancedMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8 overflow-hidden"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="totalShares" className="text-lg font-semibold text-gray-700">
                        Total Shares
                      </Label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        <Input
                          id="totalShares"
                          name="totalShares"
                          type="number"
                          value={formData.totalShares}
                          onChange={handleInputChange}
                          required
                          className="text-lg pl-10 bg-gray-100 border-gray-300 focus:border-blue-500 text-gray-900"
                          placeholder="1000"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pricePerShare" className="text-lg font-semibold text-gray-700">
                        Price Per Share (XFI)
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        <Input
                          id="pricePerShare"
                          name="pricePerShare"
                          type="number"
                          step="0.000001"
                          value={formData.pricePerShare}
                          onChange={handleInputChange}
                          required
                          className="text-lg pl-10 bg-gray-100 border-gray-300 focus:border-blue-500 text-gray-900"
                          placeholder="0.01"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="initialValuation" className="text-lg font-semibold text-gray-700">
                        Initial Valuation (XFI)
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        <Input
                          id="initialValuation"
                          name="initialValuation"
                          type="number"
                          step="0.000001"
                          value={formData.initialValuation}
                          onChange={handleInputChange}
                          required
                          className="text-lg pl-10 bg-gray-100 border-gray-300 focus:border-blue-500 text-gray-900"
                          placeholder="100"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="monthlyRentalIncome" className="text-lg font-semibold text-gray-700">
                        Monthly Rental Income (XFI)
                      </Label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        <Input
                          id="monthlyRentalIncome"
                          name="monthlyRentalIncome"
                          type="number"
                          step="0.000001"
                          value={formData.monthlyRentalIncome}
                          onChange={handleInputChange}
                          required
                          className="text-lg pl-10 bg-gray-100 border-gray-300 focus:border-blue-500 text-gray-900"
                          placeholder="1"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </ScrollArea>
        </CardContent>
        <CardFooter className="bg-gray-100 p-8">
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || uploading}
            className="w-full text-lg py-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white transition-all duration-300 transform hover:scale-105"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                Tokenizing Property...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-6 w-6" />
                Tokenize Property
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-4xl mx-auto mt-4 p-4 bg-red-900 border-l-4 border-red-500 text-white rounded-lg"
        >
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </motion.div>
      )}
    </motion.div>
  )
}

export default PropertyTokenization

