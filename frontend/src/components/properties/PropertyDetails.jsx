import { useParams } from "react-router-dom";
import { useState } from "react";
import useGetProperty from "../../hooks/useGetProperty";
import { formatEther } from "ethers";

// Loader component
const Loader = () => (
  <div className="flex justify-center items-center flex-col">
    <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
    <p className="mt-4 text-gray-600">Loading details...</p>
  </div>
);

export function PropertyDetails() {
  const { id } = useParams();
  const { property, loading, error } = useGetProperty(id);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex(
      (prevIndex) => (prevIndex + 1) % (property?.imageUrls?.length || 1)
    );
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prevIndex) =>
        (prevIndex - 1 + (property?.imageUrls?.length || 1)) %
        (property?.imageUrls?.length || 1)
    );
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="text-center text-red-500 text-xl font-medium">
        Error: {error}
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center text-xl font-medium">No property found.</div>
    );
  }

  return (
    <div className="space-y-8 p-6 max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl">
      {/* Property Header */}
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900">
          {property.name}
        </h1>
        <p className="text-xl text-gray-600">{property.location}</p>
      </div>

      {/* Image Carousel */}
      {property.imageUrls.length > 0 && (
        <div className="relative group">
          <img
            src={property.imageUrls[currentImageIndex]}
            alt={`Property image ${currentImageIndex + 1}`}
            className="w-full h-80 object-cover rounded-2xl shadow-lg transition-transform duration-500 ease-in-out transform group-hover:scale-105"
          />
          <div className="absolute inset-0 flex items-center justify-between px-4">
            <button
              onClick={prevImage}
              className="bg-gray-800 text-white p-3 rounded-full opacity-75 hover:opacity-100 transition-opacity"
              aria-label="Previous Image"
            >
              &larr;
            </button>
            <button
              onClick={nextImage}
              className="bg-gray-800 text-white p-3 rounded-full opacity-75 hover:opacity-100 transition-opacity"
              aria-label="Next Image"
            >
              &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Property Details */}
      <div className="space-y-6">
        <p className="text-lg text-gray-700">
          <span className="font-semibold">Description:</span>{" "}
          {property.description}
        </p>
        <div className="grid grid-cols-2 gap-4 text-lg text-gray-700">
          <p>
            <span className="font-semibold">Total Shares:</span>{" "}
            {property.totalShares}
          </p>
          <p>
            <span className="font-semibold">Available Shares:</span>{" "}
            {property.availableShares}
          </p>
          <p>
            <span className="font-semibold">Price Per Share:</span>{" "}
            {formatEther(property.pricePerShare)} ETH
          </p>
          <p>
            <span className="font-semibold">Last Rental Update:</span>{" "}
            {property.lastRentalUpdate}
          </p>
          <p>
            <span className="font-semibold">Status:</span>{" "}
            {property.isActive ? "Active" : "Inactive"}
          </p>
        </div>
      </div>
    </div>
  );
}
