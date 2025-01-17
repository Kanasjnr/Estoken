import  { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter } from 'lucide-react';

export function PropertySearch({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    minPrice: '',
    maxPrice: '',
    minYield: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    onSearch(searchTerm, filters);
  }, [searchTerm, filters, onSearch]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex space-x-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                id="search"
                name="search"
                placeholder="Search by name or location"
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
            <Button onClick={toggleFilters} variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="Filter by location"
                  value={filters.location}
                  onChange={handleFilterChange}
                />
              </div>
              <div>
                <Label htmlFor="minPrice" className="text-sm font-medium">Min Price (ETH)</Label>
                <Input
                  id="minPrice"
                  name="minPrice"
                  type="number"
                  min="0"
                  step="0.000000000000000001"
                  placeholder="Min Price in ETH"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                />
              </div>
              <div>
                <Label htmlFor="maxPrice" className="text-sm font-medium">Max Price (ETH)</Label>
                <Input
                  id="maxPrice"
                  name="maxPrice"
                  type="number"
                  min="0"
                  step="0.000000000000000001"
                  placeholder="Max Price in ETH"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                />
              </div>
              <div>
                <Label htmlFor="minYield" className="text-sm font-medium">Min Yield (%)</Label>
                <Input
                  id="minYield"
                  name="minYield"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Min Yield %"
                  value={filters.minYield}
                  onChange={handleFilterChange}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

PropertySearch.propTypes = {
  onSearch: PropTypes.func.isRequired,
};