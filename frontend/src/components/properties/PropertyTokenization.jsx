import  { useState } from 'react';
import { useESToken } from '../../context/ESTokenContext';
import useTokenizeProperty from '../../hooks/useTokenizeProperty';
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, ImageIcon, DollarSign, Hash, MapPin } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";

const PropertyTokenization = () => {
  const { isInitialized } = useESToken();
  const { tokenizeProperty, loading, error } = useTokenizeProperty();

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    imageUrls: [],
    totalShares: '',
    pricePerShare: '',
  });

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [advancedMode, setAdvancedMode] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      setUploading(true);
      setUploadProgress(0);
      const uploadedUrls = await Promise.all(
        files.map(async (file, index) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', 'estoken');

          const response = await fetch(
            'https://api.cloudinary.com/v1_1/dn2ed9k6p/image/upload',
            {
              method: 'POST',
              body: formData,
            }
          );

          if (!response.ok) throw new Error('Failed to upload image');
          const data = await response.json();
          setUploadProgress(((index + 1) / files.length) * 100);
          return data.secure_url;
        })
      );

      setFormData((prevState) => ({
        ...prevState,
        imageUrls: [...prevState.imageUrls, ...uploadedUrls],
      }));

      toast.success('Images uploaded successfully!');
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isInitialized) {
      toast.error('Please connect to Base Sepolia Testnet');
      return;
    }

    if (formData.imageUrls.length === 0) {
      toast.error('Please upload at least one image.');
      return;
    }

    try {
      await tokenizeProperty(
        formData.name,
        formData.location,
        formData.description,
        formData.imageUrls,
        formData.totalShares,
        formData.pricePerShare
      );

      setFormData({
        name: '',
        location: '',
        description: '',
        imageUrls: [],
        totalShares: '',
        pricePerShare: '',
      });

      toast.success('Property tokenized successfully!');
    } catch (err) {
      console.error('Error tokenizing property:', err);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto mt-10 overflow-hidden">
      <CardHeader className="bg-purple-500 text-white">
        <CardTitle className="text-3xl font-bold">Tokenize Your Property</CardTitle>
        <CardDescription className="text-white/80">Transform your real estate into digital assets</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-lg font-semibold">Property Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="text-lg"
                placeholder="Luxurious Downtown Condo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-lg font-semibold">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="text-lg pl-10"
                  placeholder="123 Crypto Street, Blockchain City"
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-lg font-semibold">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="text-lg"
              placeholder="Describe your property in detail..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="images" className="text-lg font-semibold">Property Images</Label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="text-lg"
                />
                <ImageIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              {uploading && <Loader2 className="animate-spin text-purple-500" />}
            </div>
            {uploading && (
              <Progress value={uploadProgress} className="w-full mt-2" />
            )}
            {formData.imageUrls.length > 0 && (
              <div className="mt-2 text-sm text-muted-foreground">
                {formData.imageUrls.length} image(s) uploaded
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="advanced-mode"
              checked={advancedMode}
              onCheckedChange={setAdvancedMode}
            />
            <Label htmlFor="advanced-mode" className="text-lg font-semibold">Advanced Mode</Label>
          </div>
          {advancedMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="totalShares" className="text-lg font-semibold">Total Shares</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="totalShares"
                    name="totalShares"
                    type="number"
                    value={formData.totalShares}
                    onChange={handleInputChange}
                    required
                    className="text-lg pl-10"
                    placeholder="1000"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pricePerShare" className="text-lg font-semibold">Price Per Share (ETH)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="pricePerShare"
                    name="pricePerShare"
                    type="number"
                    step="0.000001"
                    value={formData.pricePerShare}
                    onChange={handleInputChange}
                    required
                    className="text-lg pl-10"
                    placeholder="0.01"
                  />
                </div>
              </div>
            </div>
          )}
          <Button
            type="submit"
            disabled={loading || uploading}
            className="w-full text-lg py-6 bg-purple-500  hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Tokenizing Property...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-5 w-5" />
                Tokenize Property
              </>
            )}
          </Button>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </CardContent>
    </Card>
  );
};

export default PropertyTokenization;