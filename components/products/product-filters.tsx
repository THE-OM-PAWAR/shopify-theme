'use client';

interface ProductFiltersProps {
  onFilterChange: (filters: any) => void;
  filters: any;
}

export function ProductFilters({ onFilterChange, filters }: ProductFiltersProps) {
  const sizeOptions = ['Small', 'Medium', 'Large', 'Extra Large'];
  const typeOptions = ['Modern', 'Classic', 'Rustic', 'Minimalist'];
  const priceRanges = [
    { label: 'Under $25', min: 0, max: 25 },
    { label: '$25 - $50', min: 25, max: 50 },
    { label: '$50 - $100', min: 50, max: 100 },
    { label: 'Over $100', min: 100, max: Infinity },
  ];

  const handleSizeChange = (size: string) => {
    const newSizes = filters.sizes?.includes(size)
      ? filters.sizes.filter((s: string) => s !== size)
      : [...(filters.sizes || []), size];
    
    onFilterChange({ ...filters, sizes: newSizes });
  };

  const handleTypeChange = (type: string) => {
    const newTypes = filters.types?.includes(type)
      ? filters.types.filter((t: string) => t !== type)
      : [...(filters.types || []), type];
    
    onFilterChange({ ...filters, types: newTypes });
  };

  const handlePriceChange = (range: any) => {
    onFilterChange({ ...filters, priceRange: range });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-6">Filters</h3>
      
      {/* Size Filter */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Size</h4>
        <div className="space-y-2">
          {sizeOptions.map((size) => (
            <label key={size} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.sizes?.includes(size) || false}
                onChange={() => handleSizeChange(size)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">{size}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Type Filter */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Style</h4>
        <div className="space-y-2">
          {typeOptions.map((type) => (
            <label key={type} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.types?.includes(type) || false}
                onChange={() => handleTypeChange(type)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
        <div className="space-y-2">
          {priceRanges.map((range) => (
            <label key={range.label} className="flex items-center">
              <input
                type="radio"
                name="priceRange"
                checked={
                  filters.priceRange?.min === range.min &&
                  filters.priceRange?.max === range.max
                }
                onChange={() => handlePriceChange(range)}
                className="border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <button
        onClick={() => onFilterChange({})}
        className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
      >
        Clear All Filters
      </button>
    </div>
  );
}