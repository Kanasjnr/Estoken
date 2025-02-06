import { PropertyCard } from './PropertyCard';
import { PropertySearch } from './PropertySearch';
import useAllProperties from '../../hooks/Properties/useAllProperties';

const Loader = () => (
  <div className="flex justify-center items-center flex-col">
    <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
    <p className="mt-4 text-gray-600">Loading properties...</p>
  </div>
);

export function PropertyGrid() {
  const { properties, loading, error, searchProperties } = useAllProperties();

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PropertySearch onSearch={searchProperties} />
      
      {properties.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No properties found matching your criteria
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
