import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, Grid, List, Search } from 'lucide-react';
import { useStore } from '../store/useStore';
import ProductCard from '../components/ProductCard';
import ProductFiltersComponent, { ProductFilters } from '../components/ProductFilters';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Products = () => {
  const { selectedCategory, setSelectedCategory } = useStore();
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ProductFilters>({
    categories: [],
    priceRange: [0, 5000],
    features: [],
    rating: 0,
    inStock: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .eq('is_active', true);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .eq('is_active', true);

      if (error) throw error;
      const categoryNames = data?.map(cat => cat.name) || [];
      setCategories(['All', ...categoryNames]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((product: any) => {
        // Check both direct category and category relationship
        return product.category?.name === selectedCategory || 
               product.categories?.name === selectedCategory ||
               (product.category_id && product.categories?.id === product.category_id && product.categories?.name === selectedCategory);
      });
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((product: any) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    if (filters.categories.length > 0) {
      filtered = filtered.filter((product: any) => 
        filters.categories.includes(product.category?.name) ||
        filters.categories.includes(product.categories?.name)
      );
    }

    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 5000) {
      filtered = filtered.filter((product: any) => 
        product.price >= filters.priceRange[0] && 
        product.price <= filters.priceRange[1]
      );
    }

    if (filters.inStock) {
      filtered = filtered.filter((product: any) => product.stock_quantity > 0);
    }

    return filtered;
  }, [products, selectedCategory, searchTerm, filters]);

  const sortedProducts = [...filteredProducts].sort((a: any, b: any) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
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
          <h1 className="heading-lg mb-4">Bulk Products for Every Need</h1>
          <p className="body-text text-muted-foreground max-w-2xl mx-auto">
            Discover our extensive range of bulk products across all categories, sourced directly from manufacturers at wholesale prices.
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
              {loading ? (
                // Loading skeleton
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-muted h-48 rounded-lg mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                ))
              ) : (
                sortedProducts.map((product: any, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <ProductCard
                      product={{
                        ...product,
                        image: product.images?.[0] || '/placeholder.svg',
                        slug: product.sku || product.id,
                        category: product.categories?.name || product.category?.name || 'General'
                      }}
                      onViewDetail={() => navigate(`/product/${product.sku || product.id}`)}
                    />
                  </motion.div>
                ))
              )}
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