import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Filter, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/utils/currency';
import { useStore } from '@/store/useStore';

interface SearchSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchSidebar: React.FC<SearchSidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const addToCart = useStore((state) => state.addToCart);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      loadRecentSearches();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const debounceTimer = setTimeout(() => {
        performSearch();
      }, 300);
      return () => clearTimeout(debounceTimer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const performSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          categories (
            name
          )
        `)
        .eq('is_active', true)
        .ilike('name', `%${searchQuery}%`);

      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }

      const { data, error } = await query.limit(20);

      if (error) throw error;
      setSearchResults(data || []);
      
      // Save to recent searches
      saveRecentSearch(searchQuery);
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentSearches = () => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  };

  const saveRecentSearch = (query: string) => {
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleProductClick = (product: any) => {
    navigate(`/product/${product.sku || product.id}`);
    onClose();
  };

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    addToCart({
      ...product,
      image: product.images?.[0] || '/placeholder.svg'
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-900">Search Products</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  autoFocus
                />
              </div>

              {/* Category Filter */}
              <div className="mt-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Categories</option>
                  {categories.map((category: any) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {!searchQuery.trim() ? (
                /* Recent Searches & Suggestions */
                <div className="p-4">
                  {recentSearches.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900">Recent Searches</h3>
                        <button
                          onClick={clearRecentSearches}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="space-y-2">
                        {recentSearches.map((search, index) => (
                          <button
                            key={index}
                            onClick={() => setSearchQuery(search)}
                            className="flex items-center space-x-2 w-full p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <Search className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{search}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular Categories */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Popular Categories</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.slice(0, 6).map((category: any) => (
                        <button
                          key={category.id}
                          onClick={() => {
                            setSelectedCategory(category.id);
                            setSearchQuery('');
                            performSearch();
                          }}
                          className="p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <div className="font-medium text-sm text-gray-900">{category.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : loading ? (
                /* Loading State */
                <div className="p-4">
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="animate-pulse flex space-x-3">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : searchResults.length > 0 ? (
                /* Search Results */
                <div className="p-4">
                  <div className="mb-3">
                    <span className="text-sm text-gray-600">
                      {searchResults.length} results for "{searchQuery}"
                    </span>
                  </div>
                  <div className="space-y-3">
                    {searchResults.map((product: any) => (
                      <motion.div
                        key={product.id}
                        className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                        onClick={() => handleProductClick(product)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <img
                          src={product.images?.[0] || '/placeholder.svg'}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 line-clamp-2 text-sm">
                            {product.name}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {product.weight}
                            {product.pieces && ` • ${product.pieces}`}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-semibold text-primary">
                              {formatPrice(product.price)}
                            </span>
                            <button
                              onClick={(e) => handleAddToCart(e, product)}
                              className="p-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                            >
                              <Search className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : searchQuery.trim() && !loading ? (
                /* No Results */
                <div className="p-4 text-center">
                  <div className="text-gray-400 mb-2">
                    <Search className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">No products found</h3>
                  <p className="text-sm text-gray-600">
                    Try searching with different keywords or check the spelling
                  </p>
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50">
              <button
                onClick={() => {
                  navigate('/products');
                  onClose();
                }}
                className="w-full py-2 text-center text-primary hover:text-primary/80 font-medium transition-colors"
              >
                View All Products
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SearchSidebar;