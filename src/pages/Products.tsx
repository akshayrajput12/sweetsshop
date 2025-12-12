import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Filter, Grid, List, Search, Cookie, X, Candy, ChevronLeft } from 'lucide-react';
import { useStore } from '../store/useStore';
import ProductCard from '../components/ProductCard';
import ProductFiltersComponent, { ProductFilters } from '../components/ProductFilters';
import { Input } from '@/components/ui/input';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { scrollToTopInstant } from '@/utils/scrollToTop';
import { Button } from '@/components/ui/button';

const Products = () => {
  const { selectedCategory, setSelectedCategory } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
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

  // Sync state with URL params
  useEffect(() => {
    scrollToTopInstant();
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      if (categoryParam !== 'All' && !filters.categories.includes(categoryParam)) {
        // If it's a main category controlled by store
        setSelectedCategory(categoryParam);
      }
    }
    fetchProducts();
    fetchCategories();
  }, []);

  // Sync filters to URL (Basic implementation)
  const updateURLParams = (newFilters: ProductFilters, category: string) => {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.set('category', category);
    if (newFilters.sortBy !== 'name') params.set('sort', newFilters.sortBy);
    if (newFilters.priceRange[0] > 0) params.set('minPrice', newFilters.priceRange[0].toString());
    if (newFilters.priceRange[1] < 10000) params.set('maxPrice', newFilters.priceRange[1].toString());

    // We don't want to flood history, so replace
    // setSearchParams(params, { replace: true }); 
    // Commented out to prevent aggressive URL updates impacting navigation history during extensive filtering
  };

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setProducts([]);
    fetchProducts(1);
    // updateURLParams(filters, selectedCategory);
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
      if (filters && filters.categories.length > 0) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .in('name', filters.categories);

        if (categoryData && categoryData.length > 0) {
          countQuery = countQuery.in('category_id', categoryData.map(c => c.id));
        }
      }

      if (filters.priceRange[0] > 0) countQuery = countQuery.gte('price', filters.priceRange[0]);
      if (filters.priceRange[1] < 10000) countQuery = countQuery.lte('price', filters.priceRange[1]);
      if (filters.inStock) countQuery = countQuery.gt('stock_quantity', 0);
      if (filters.isBestseller) countQuery = countQuery.eq('is_bestseller', true);

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

      // Apply same filters to query
      if (selectedCategory !== 'All') {
        const { data: categoryData } = await supabase.from('categories').select('id').eq('name', selectedCategory).single();
        if (categoryData) query = query.eq('category_id', categoryData.id);
      }

      if (searchTerm) query = query.ilike('name', `%${searchTerm}%`);

      if (filters && filters.categories.length > 0) {
        const { data: categoryData } = await supabase.from('categories').select('id').in('name', filters.categories);
        if (categoryData && categoryData.length > 0) query = query.in('category_id', categoryData.map(c => c.id));
      }

      if (filters.priceRange[0] > 0) query = query.gte('price', filters.priceRange[0]);
      if (filters.priceRange[1] < 10000) query = query.lte('price', filters.priceRange[1]);
      if (filters.inStock) query = query.gt('stock_quantity', 0);
      if (filters.isBestseller) query = query.eq('is_bestseller', true);

      // Apply sorting
      const sortOption = filters.sortBy || sortBy;
      switch (sortOption) {
        case 'name-desc': query = query.order('name', { ascending: false }); break;
        case 'price-low': query = query.order('price', { ascending: true }); break;
        case 'price-high': query = query.order('price', { ascending: false }); break;
        case 'rating': query = query.order('rating', { ascending: false }); break;
        case 'newest': query = query.order('created_at', { ascending: false }); break;
        case 'bestseller': query = query.order('is_bestseller', { ascending: false }); break;
        default: query = query.order('name', { ascending: true });
      }

      const { data, error } = await query;

      if (error) throw error;

      if (pageNum === 1) {
        setProducts(data || []);
      } else {
        setProducts(prev => [...prev, ...(data || [])]);
      }

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

  const sortedProducts = products;

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

  const getCategoryIcon = (category: string) => {
    if (category === 'Mithai') return <Candy className="w-4 h-4" />;
    return <Cookie className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-muted/30 relative">

      {/* Mobile Filters Drawer */}
      {showMobileFilters && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setShowMobileFilters(false)}
          />
          <div
            className={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${showMobileFilters ? 'translate-x-0' : '-translate-x-full'
              }`}
          >
            <div className="p-6 h-full overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <Filter className="w-5 h-5 mr-2 text-primary" />
                  Filters
                </h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
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
        </>
      )}

      {/* Main Content Layout */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Desktop Sidebar (Left) */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-border/50 shadow-sm">
                <h2 className="text-xl font-serif text-primary mb-6">Collection</h2>
                <ProductFiltersComponent
                  onFiltersChange={setFilters}
                  categories={categories}
                  className="space-y-6"
                />
              </div>
            </div>
          </aside>

          {/* Product Grid Area (Right/Center) */}
          <div className="flex-1">
            <div className="bg-white p-4 md:p-6 rounded-xl border border-border/50 shadow-sm mb-6">
              {/* Search & Mobile Filter Toggle */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search our royal collection..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-border/50"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Button
                    variant="outline"
                    onClick={() => setShowMobileFilters(true)}
                    className="flex-1 md:hidden flex items-center justify-center gap-2"
                  >
                    <Filter className="w-4 h-4" /> Filters
                  </Button>

                  <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                    <span className="font-medium text-gray-900">{totalProducts}</span> Products
                  </div>
                </div>
              </div>

              {/* Quick Categories (Optional, pill list) */}
              <div className="flex flex-wrap gap-2 mt-4 pb-2">
                {categories.slice(0, 6).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-xs px-3 py-1 rounded-full transition-colors ${selectedCategory === cat
                        ? 'bg-primary text-white'
                        : 'bg-muted text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            <motion.div
              className={`grid gap-6 ${viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1'
                }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {loading && products.length === 0 ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-muted h-[300px] rounded-xl mb-4"></div>
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
                      transition={{ duration: 0.5, delay: index * 0.05 }}
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
                </>
              )}
            </motion.div>

            {isLoadingMore && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            )}

            {!loading && totalProducts === 0 && (
              <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-border/50">
                <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-gray-900">No products found</h3>
                <p className="text-gray-500">Try adjusting your filters or search terms.</p>
                <Button
                  variant="link"
                  onClick={() => { setSelectedCategory('All'); setSearchTerm(''); }}
                  className="mt-4 text-primary"
                >
                  Clear Search
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;