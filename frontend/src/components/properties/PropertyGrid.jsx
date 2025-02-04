import { PropertyCard } from './PropertyCard';
import { PropertySearch } from './PropertySearch';
import { useState, useEffect } from 'react';
import useAllProperties from '../../hooks/useAllProperties';

const Loader = () => (
  <div className="flex justify-center items-center flex-col">
    <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
    <p className="mt-4 text-gray-600">Loading properties...</p>
  </div>
);

export function PropertyGrid() {
  const { getAllProperties, loading, error } = useAllProperties();
  const [properties, setProperties] = useState([]);
  const [searchFilters, setSearchFilters] = useState({
    searchTerm: '',
    filters: {
      location: '',
      minPrice: '',
      maxPrice: '',
      minYield: ''
    }
  });

  useEffect(() => {
    // Only fetch properties once when the component mounts
    const fetchProperties = async () => {
      try {
        const fetchedProperties = await getAllProperties();
        if (Array.isArray(fetchedProperties)) {
          setProperties(fetchedProperties);
        } else {
          console.error('Invalid data format received:', fetchedProperties);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchProperties();
  }, []); // Empty dependency array ensures it runs only once on mount

  const handleSearch = (searchTerm, filters) => {
    // Update the filters without causing an infinite loop
    setSearchFilters({ searchTerm, filters });
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  const filteredProperties = (properties || []).filter(property => {
    const { location, minPrice, maxPrice, minYield } = searchFilters.filters;
    return (
      (location ? property.location.includes(location) : true) &&
      (minPrice ? property.pricePerShare >= minPrice : true) &&
      (maxPrice ? property.pricePerShare <= maxPrice : true) &&
      (minYield ? property.accumulatedRentalIncomePerShare >= minYield : true)
    );
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <PropertySearch onSearch={handleSearch} />
      {filteredProperties.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No properties found matching your criteria
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
