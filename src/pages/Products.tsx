import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Filter, Grid, List, Search } from 'lucide-react';
import { useStore } from '../store/useStore';
import { products, categories } from '../data/products';
import ProductCard from '../components/ProductCard';
import ProductFiltersComponent, { ProductFilters } from '../components/ProductFilters';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

const Products = () => {
  const { selectedCategory, setSelectedCategory } = useStore();
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ProductFilters>({
    categories: [],
    priceRange: [0, 5000],
    features: [],
    rating: 0,
    inStock: false,
  });
  const navigate = useNavigate();

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    if (filters.categories.length > 0) {
      filtered = filtered.filter(product => 
        filters.categories.includes(product.category)
      );
    }

    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 5000) {
      filtered = filtered.filter(product => 
        product.price >= filters.priceRange[0] && 
        product.price <= filters.priceRange[1]
      );
    }

    if (filters.features.length > 0) {
      filtered = filtered.filter(product => {
        if (!product.features) return false;
        return filters.features.some(feature => {
          switch (feature) {
            case 'Antibiotic Residue Free':
              return product.features?.antibioticResidueFree;
            case 'Artisanal Cut':
              return product.features?.artisanalCut;
            case 'Temperature Controlled':
              return product.features?.temperatureControlled;
            case 'Vacuum Packed':
              return product.features?.hygienicallyVacuumPacked;
            case 'Free Range':
              return product.features?.humanlyRaised;
            default:
              return false;
          }
        });
      });
    }

    if (filters.rating > 0) {
      filtered = filtered.filter(product => 
        (product.rating || 0) >= filters.rating
      );
    }

    if (filters.inStock) {
      filtered = filtered.filter(product => product.inStock);
    }

    return filtered;
  }, [products, selectedCategory, searchTerm, filters]);

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      default:
        return a.name.localeCompare(b.name);
    }
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div 
        className="bg-muted/30 py-16"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 text-center">
          <h1 className="heading-lg mb-4">Premium Meat Selection</h1>
          <p className="body-text text-muted-foreground max-w-2xl mx-auto">
            Discover our wide range of premium quality meats, sourced from the finest farms and delivered fresh to your door.
          </p>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <ProductFiltersComponent
              onFiltersChange={setFilters}
              categories={categories}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Controls */}
            <motion.div 
              className="space-y-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter & Controls */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                {/* Category Filters */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        selectedCategory === category
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {/* Sort & View Controls */}
                <div className="flex items-center space-x-4">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-border rounded-lg bg-background"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Rating</option>
                  </select>

                  <div className="flex items-center border border-border rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'} transition-colors`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'} transition-colors`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Results Count */}
            <motion.p 
              className="body-text text-muted-foreground mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Showing {sortedProducts.length} products
              {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            </motion.p>

            {/* Products Grid */}
            <motion.div 
              className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              {sortedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ProductCard
                    product={product}
                    onViewDetail={() => navigate(`/product/${product.slug}`)}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Empty State */}
        {sortedProducts.length === 0 && (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Filter className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="heading-md mb-2">No products found</h3>
            <p className="body-text text-muted-foreground mb-6">
              Try adjusting your filters or browse all categories.
            </p>
            <button 
              onClick={() => setSelectedCategory('All')}
              className="btn-primary"
            >
              View All Products
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Products;