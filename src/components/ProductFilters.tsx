import { useState, useEffect } from 'react';
import { Filter, X, ChevronDown, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';

export interface ProductFilters {
  categories: string[];
  priceRange: [number, number];
  features: string[];
  rating: number;
  inStock: boolean;
  isBestseller: boolean;
  sortBy: string;
}

interface ProductFiltersProps {
  onFiltersChange: (filters: ProductFilters) => void;
  categories: string[];
  className?: string;
}

const ProductFiltersComponent = ({ onFiltersChange, categories, className = "" }: ProductFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>({
    categories: [],
    priceRange: [0, 10000],
    features: [],
    rating: 0,
    inStock: false,
    isBestseller: false,
    sortBy: 'name',
  });

  const [availableFeatures, setAvailableFeatures] = useState<string[]>([]);
  const [loadingFeatures, setLoadingFeatures] = useState(true);

  useEffect(() => {
    fetchAvailableFeatures();
  }, []);

  const fetchAvailableFeatures = async () => {
    try {
      const { data, error } = await supabase
        .from('product_features')
        .select('name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setAvailableFeatures(data?.map(f => f.name) || []);
    } catch (error) {
      console.error('Error fetching features:', error);
      // Fallback to comprehensive default features
      setAvailableFeatures([
        'Bulk Pack',
        'Wholesale Price',
        'Commercial Grade',
        'Energy Efficient',
        'Eco Friendly',
        'Premium Quality',
        'Fast Delivery',
        'Bulk Discount Available',
        'Restaurant Grade',
        'Long Shelf Life',
        'Temperature Controlled',
        'Quality Certified',
        'Hygienically Packed',
        'Antibiotic Free',
        'Organic',
        'Gluten Free',
        'Vegan',
        'Non-GMO',
        'Recyclable Packaging',
        'Made in India'
      ]);
    } finally {
      setLoadingFeatures(false);
    }
  };

  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    updateFilters({ categories: newCategories });
  };

  const toggleFeature = (feature: string) => {
    const newFeatures = filters.features.includes(feature)
      ? filters.features.filter(f => f !== feature)
      : [...filters.features, feature];
    updateFilters({ features: newFeatures });
  };

  const clearAllFilters = () => {
    const clearedFilters: ProductFilters = {
      categories: [],
      priceRange: [0, 10000],
      features: [],
      rating: 0,
      inStock: false,
      isBestseller: false,
      sortBy: 'name',
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) count++;
    if (filters.features.length > 0) count++;
    if (filters.rating > 0) count++;
    if (filters.inStock) count++;
    if (filters.isBestseller) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className={className}>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between"
        >
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount}</Badge>
            )}
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Filter Content */}
      <div className={`${isOpen ? 'block' : 'hidden'} lg:block`}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filters</CardTitle>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-sm"
                >
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Categories */}
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
                <span className="font-medium">Categories</span>
                <ChevronDown className="w-4 h-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 pt-2">
                {categories.filter(c => c !== 'All').map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={filters.categories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                    />
                    <label
                      htmlFor={`category-${category}`}
                      className="text-sm cursor-pointer"
                    >
                      {category}
                    </label>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Price Range */}
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
                <span className="font-medium">Price Range</span>
                <ChevronDown className="w-4 h-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <div className="space-y-4">
                  <Slider
                    min={0}
                    max={10000}
                    step={100}
                    value={filters.priceRange}
                    onValueChange={(value) => updateFilters({ priceRange: value as [number, number] })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>₹{filters.priceRange[0]}</span>
                    <span>₹{filters.priceRange[1]}</span>
                  </div>
                  {/* Quick price filters */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateFilters({ priceRange: [0, 1000] })}
                      className="text-xs"
                    >
                      Under ₹1,000
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateFilters({ priceRange: [1000, 3000] })}
                      className="text-xs"
                    >
                      ₹1,000 - ₹3,000
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateFilters({ priceRange: [3000, 5000] })}
                      className="text-xs"
                    >
                      ₹3,000 - ₹5,000
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateFilters({ priceRange: [5000, 10000] })}
                      className="text-xs"
                    >
                      Above ₹5,000
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Features */}
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
                <span className="font-medium">Product Features</span>
                <ChevronDown className="w-4 h-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 pt-2">
                {loadingFeatures ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-muted rounded animate-pulse" />
                        <div className="h-4 bg-muted rounded w-24 animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {availableFeatures.map((feature) => (
                      <div key={feature} className="flex items-center space-x-2">
                        <Checkbox
                          id={`feature-${feature}`}
                          checked={filters.features.includes(feature)}
                          onCheckedChange={() => toggleFeature(feature)}
                        />
                        <label
                          htmlFor={`feature-${feature}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {feature}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>

            {/* Rating */}
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
                <span className="font-medium">Customer Rating</span>
                <ChevronDown className="w-4 h-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 pt-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center space-x-2">
                    <Checkbox
                      id={`rating-${rating}`}
                      checked={filters.rating === rating}
                      onCheckedChange={(checked) => 
                        updateFilters({ rating: checked ? rating : 0 })
                      }
                    />
                    <label
                      htmlFor={`rating-${rating}`}
                      className="text-sm cursor-pointer flex items-center space-x-1"
                    >
                      <span>{rating}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < rating 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-muted-foreground">& up</span>
                    </label>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Additional Filters */}
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
                <span className="font-medium">Additional Filters</span>
                <ChevronDown className="w-4 h-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-2">
                {/* In Stock */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="in-stock"
                    checked={filters.inStock}
                    onCheckedChange={(checked) => updateFilters({ inStock: !!checked })}
                  />
                  <label htmlFor="in-stock" className="text-sm cursor-pointer">
                    In Stock Only
                  </label>
                </div>

                {/* Bestsellers */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="bestseller"
                    checked={filters.isBestseller}
                    onCheckedChange={(checked) => updateFilters({ isBestseller: !!checked })}
                  />
                  <label htmlFor="bestseller" className="text-sm cursor-pointer">
                    Bestsellers Only
                  </label>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Sort Options */}
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
                <span className="font-medium">Sort By</span>
                <ChevronDown className="w-4 h-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 pt-2">
                {[
                  { value: 'name', label: 'Name (A-Z)' },
                  { value: 'name-desc', label: 'Name (Z-A)' },
                  { value: 'price-low', label: 'Price: Low to High' },
                  { value: 'price-high', label: 'Price: High to Low' },
                  { value: 'rating', label: 'Customer Rating' },
                  { value: 'newest', label: 'Newest First' },
                  { value: 'bestseller', label: 'Bestsellers First' }
                ].map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`sort-${option.value}`}
                      checked={filters.sortBy === option.value}
                      onCheckedChange={(checked) => 
                        updateFilters({ sortBy: checked ? option.value : 'name' })
                      }
                    />
                    <label
                      htmlFor={`sort-${option.value}`}
                      className="text-sm cursor-pointer"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductFiltersComponent;