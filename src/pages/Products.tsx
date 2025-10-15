import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Filter, Grid, List, Search, Cookie, X, Candy } from 'lucide-react';
import { useStore } from '../store/useStore';
import ProductCard from '../components/ProductCard';
import ProductFiltersComponent, { ProductFilters } from '../components/ProductFilters';
import { Input } from '@/components/ui/input';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { scrollToTopInstant } from '@/utils/scrollToTop';
import { Button } from '@/components/ui/button';

const Products = () => {
  const { selectedCategory, setSelectedCategory } = useStore();
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>({
    categories: [],
    priceRange: [0, 10000],
    features: [],
    rating: 0,
    inStock: false,
    isBestseller: false,
    sortBy: 'name',
  });
  
  // Pagination states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastProductRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    scrollToTopInstant();
    // Check if category is passed in URL query params
    const queryParams = new URLSearchParams(location.search);
    const categoryParam = queryParams.get('category');
    if (categoryParam && categories.includes(categoryParam)) {
      setSelectedCategory(categoryParam);
    }
    fetchProducts();
    fetchCategories();
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setProducts([]);
    fetchProducts(1);
  }, [selectedCategory, searchTerm, filters]);

  const fetchProducts = async (pageNum = 1) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      // First, get the total count
      let countQuery = supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Apply category filter if not 'All'
      if (selectedCategory !== 'All') {
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('id')
          .eq('name', selectedCategory)
          .single();

        if (!categoryError && categoryData) {
          countQuery = countQuery.eq('category_id', categoryData.id);
        }
      }

      // Apply search term filter
      if (searchTerm) {
        countQuery = countQuery.ilike('name', `%${searchTerm}%`);
      }

      // Apply additional filters
      if (filters.categories.length > 0) {
        // This would require a more complex query with OR logic
        // For now, we'll just use the first category filter
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('id')
          .eq('name', filters.categories[0])
          .single();

        if (!categoryError && categoryData) {
          countQuery = countQuery.eq('category_id', categoryData.id);
        }
      }

      if (filters.priceRange[0] > 0) {
        countQuery = countQuery.gte('price', filters.priceRange[0]);
      }

      if (filters.priceRange[1] < 10000) {
        countQuery = countQuery.lte('price', filters.priceRange[1]);
      }

      if (filters.inStock) {
        countQuery = countQuery.gt('stock_quantity', 0);
      }

      if (filters.isBestseller) {
        countQuery = countQuery.eq('is_bestseller', true);
      }

      const { count, error: countError } = await countQuery;
      
      if (!countError) {
        setTotalProducts(count || 0);
      }

      // Now fetch the paginated data
      let query = supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .eq('is_active', true)
        .range((pageNum - 1) * 10, pageNum * 10 - 1);

      // Apply category filter if not 'All'
      if (selectedCategory !== 'All') {
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('id')
          .eq('name', selectedCategory)
          .single();

        if (!categoryError && categoryData) {
          query = query.eq('category_id', categoryData.id);
        }
      }

      // Apply search term filter
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      // Apply additional filters
      if (filters.categories.length > 0) {
        // This would require a more complex query with OR logic
        // For now, we'll just use the first category filter
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('id')
          .eq('name', filters.categories[0])
          .single();

        if (!categoryError && categoryData) {
          query = query.eq('category_id', categoryData.id);
        }
      }

      if (filters.priceRange[0] > 0) {
        query = query.gte('price', filters.priceRange[0]);
      }

      if (filters.priceRange[1] < 10000) {
        query = query.lte('price', filters.priceRange[1]);
      }

      if (filters.inStock) {
        query = query.gt('stock_quantity', 0);
      }

      if (filters.isBestseller) {
        query = query.eq('is_bestseller', true);
      }

      // Apply sorting
      const sortOption = filters.sortBy || sortBy;
      switch (sortOption) {
        case 'name-desc':
          query = query.order('name', { ascending: false });
          break;
        case 'price-low':
          query = query.order('price', { ascending: true });
          break;
        case 'price-high':
          query = query.order('price', { ascending: false });
          break;
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'bestseller':
          query = query.order('is_bestseller', { ascending: false });
          break;
        default:
          query = query.order('name', { ascending: true });
      }

      const { data, error } = await query;

      if (error) throw error;

      if (pageNum === 1) {
        setProducts(data || []);
      } else {
        setProducts(prev => [...prev, ...(data || [])]);
      }

      // Check if we have more products
      setHasMore(data?.length === 10);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
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

  // Since we're doing server-side filtering, we don't need client-side filtering
  const filteredProducts = products;

  // Since we're doing server-side sorting, we don't need client-side sorting
  const sortedProducts = filteredProducts;

  const loadMore = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage);
    }
  }, [page, hasMore, isLoadingMore]);

  const lastProductElementRef = useCallback((node: HTMLDivElement) => {
    if (loading || isLoadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, isLoadingMore, hasMore, loadMore]);

  // Special category icons
  const getCategoryIcon = (category: string) => {
    if (category === 'Mithai') {
      return <Candy className="w-4 h-4" />;
    }
    return <Cookie className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(25_95%_90%)] via-white to-[hsl(25_95%_90%)] relative">
      
      {/* Overlay */}
      {showFilters && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowFilters(false)}
        />
      )}

      {/* Sliding Filter Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          showFilters ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 h-full overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Filter className="w-5 h-5 mr-2 text-primary" />
              Filters
            </h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <ProductFiltersComponent
            onFiltersChange={setFilters}
            categories={categories}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">

          {/* Products Section */}
          <div className="flex-1 bg-white rounded-2xl shadow-lg border border-orange-100 p-6">
            {/* Search and Controls */}
            <motion.div
              className="space-y-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search sweets by name, description, or features..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filters and Filter Button */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-3">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-sm flex items-center gap-2 ${
                        selectedCategory === category
                          ? 'bg-gradient-to-r from-primary to-[hsl(0_84%_60%)] text-white shadow-lg transform scale-105'
                          : 'bg-white text-gray-700 hover:bg-primary/5 hover:text-destructive border border-gray-200 hover:border-primary/20'
                      }`}
                    >
                      {getCategoryIcon(category)}
                      {category}
                    </button>
                  ))}
                </div>
                <Button
                  onClick={() => setShowFilters(true)}
                  className="flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </Button>
              </div>
            </motion.div>

            {/* Results Info */}
            <motion.div
              className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-primary/5 to-[hsl(0_84%_60%)/5] rounded-xl border border-primary/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <p className="text-gray-700 font-medium">
                Showing <span className="font-bold text-destructive">{products.length}</span> of <span className="font-bold text-destructive">{totalProducts}</span> sweets
                {selectedCategory !== 'All' && (
                  <span className="text-gray-600"> in <span className="font-semibold text-destructive">{selectedCategory}</span></span>
                )}
              </p>
              {sortedProducts.length > 0 && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Cookie className="w-4 h-4" />
                  <span>Premium quality sweets</span>
                </div>
              )}
            </motion.div>

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
                <>
                  {sortedProducts.map((product: any, index) => (
                    <motion.div
                      key={product.id}
                      ref={index === sortedProducts.length - 1 ? lastProductElementRef : null}
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
                  ))}
                  {isLoadingMore && (
                    <div className="col-span-full flex justify-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  )}
                </>
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
            <h3 className="heading-md mb-2">No sweets found</h3>
            <p className="body-text text-muted-foreground mb-6">
              Try adjusting your filters or browse all categories.
            </p>
            <button
              onClick={() => setSelectedCategory('All')}
              className="btn-primary"
            >
              View All Sweets
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Products;