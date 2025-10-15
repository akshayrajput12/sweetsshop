import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Candy, Sparkles, ShoppingCart, Plus } from 'lucide-react';
import ProductCard from '../../../components/ProductCard';
import QuickViewModal from '../../../components/QuickViewModal';
import { supabase } from '@/integrations/supabase/client';
import { useStore } from '@/store/useStore';

// Define the Product interface locally since it's not exported from useStore
interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  weight?: string;
  pieces?: string;
  description?: string;
  stock_quantity?: number;
  slug: string;
  inStock: boolean;
  isBestSeller: boolean;
}

const MithaiSpecials = () => {
  const navigate = useNavigate();
  const { addToCart } = useStore();
  const [mithaiProducts, setMithaiProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);

  useEffect(() => {
    fetchMithaiProducts();
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-scroll carousel with manual override
  const [autoScroll, setAutoScroll] = useState(true);
  const [lastManualAction, setLastManualAction] = useState(0);

  useEffect(() => {
    if (mithaiProducts.length > itemsPerView && autoScroll) {
      const interval = setInterval(() => {
        // Pause auto-scroll for 10 seconds after manual action
        if (Date.now() - lastManualAction < 10000) return;
        
        setCurrentIndex(prev => {
          const maxIndex = mithaiProducts.length - itemsPerView;
          return prev >= maxIndex ? 0 : prev + 1;
        });
      }, 4500);

      return () => clearInterval(interval);
    }
  }, [mithaiProducts, itemsPerView, autoScroll, lastManualAction]);

  const handleResize = () => {
    if (window.innerWidth < 640) {
      setItemsPerView(1);
    } else if (window.innerWidth < 768) {
      setItemsPerView(2);
    } else if (window.innerWidth < 1024) {
      setItemsPerView(3);
    } else {
      setItemsPerView(4);
    }
  };

  const fetchMithaiProducts = async () => {
    try {
      // First, get the Mithai category ID (case-insensitive)
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .ilike('name', 'mithai')
        .single();

      if (categoryError) {
        console.error('Error fetching Mithai category:', categoryError);
        setLoading(false);
        return;
      }

      if (!categoryData) {
        console.log('Mithai category not found');
        setLoading(false);
        return;
      }

      // Then get products in that category
      const result = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryData.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(12); // Limit to 12 products

      if (result.error) throw result.error;
      
      // Transform to Product interface
      const filteredProducts = (result.data || [])
        .map((product: any) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.original_price,
          image: product.images?.[0] || '/placeholder.svg',
          images: product.images,
          category: product.category_id || 'Uncategorized',
          weight: product.weight,
          pieces: product.pieces,
          description: product.description,
          stock_quantity: product.stock_quantity,
          slug: product.id,
          inStock: product.stock_quantity !== undefined ? product.stock_quantity > 0 : true,
          isBestSeller: product.is_bestseller || false
        } as Product));
      
      setMithaiProducts(filteredProducts);
    } catch (error) {
      console.error('Error fetching Mithai products:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    if (currentIndex < mithaiProducts.length - itemsPerView) {
      setCurrentIndex(currentIndex + 1);
      setLastManualAction(Date.now());
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setLastManualAction(Date.now());
    }
  };

  // Touch/swipe support for mobile
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && canGoNext) {
      nextSlide();
    }
    if (isRightSwipe && canGoPrev) {
      prevSlide();
    }
  };

  const canGoNext = currentIndex < mithaiProducts.length - itemsPerView;
  const canGoPrev = currentIndex > 0;

  const handleQuickView = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    setQuickViewProduct({
      ...product,
      image: product.images?.[0] || '/placeholder.svg',
      slug: product.id
    });
    setIsQuickViewOpen(true);
  };

  const closeQuickView = () => {
    setIsQuickViewOpen(false);
    setQuickViewProduct(null);
  };

  // Function to handle navigation to product detail page
  const handleViewDetail = (product: any) => {
    const slug = product.sku || product.id;
    navigate(`/product/${slug}`);
  };

  // Function to add product to cart
  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    addToCart({
      ...product,
      image: product.images?.[0] || '/placeholder.svg',
      slug: product.id
    });
  };

  // Get the second image for hover effect, or fallback to the first
  const getHoverImage = (images: string[] | undefined) => {
    if (images && images.length > 1) {
      return images[1];
    }
    return images?.[0] || '/placeholder.svg';
  };

  if (mithaiProducts.length === 0 && !loading) {
    return null; // Don't show section if no mithai products
  }

  return (
    <section className="py-12 bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-200 to-red-200 rounded-full blur-3xl opacity-30 transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-amber-200 to-orange-200 rounded-full blur-3xl opacity-30 transform -translate-x-1/2 translate-y-1/2"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-yellow-300 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-red-300 rounded-full blur-3xl opacity-20 animate-pulse"></div>
      </div>

      {/* Added max-width container with proper padding and margins */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Enhanced Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent font-serif">
              Mithai Madness
            </h2>
            
          </div>
          
          <div className="w-32 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 mx-auto rounded-full mb-6"></div>
        </div>

        {/* Enhanced Carousel Controls */}
        {!loading && mithaiProducts.length > itemsPerView && (
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border-2 border-amber-200 font-bold">
                <Candy className="w-5 h-5 text-amber-600 fill-current animate-bounce" />
                <span className="text-sm sm:text-base font-bold text-amber-800">
                  {currentIndex + 1}-{Math.min(currentIndex + itemsPerView, mithaiProducts.length)} of {mithaiProducts.length} sweet treats
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={prevSlide}
                disabled={!canGoPrev}
                className={`p-3 rounded-full border-3 transition-all duration-300 transform hover:scale-110 ${
                  canGoPrev 
                    ? 'border-amber-500 text-amber-600 bg-white hover:bg-amber-500 hover:text-white shadow-xl' 
                    : 'border-gray-300 text-gray-400 cursor-not-allowed bg-gray-100'
                }`}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextSlide}
                disabled={!canGoNext}
                className={`p-3 rounded-full border-3 transition-all duration-300 transform hover:scale-110 ${
                  canGoNext 
                    ? 'border-amber-500 text-amber-600 bg-white hover:bg-amber-500 hover:text-white shadow-xl' 
                    : 'border-gray-300 text-gray-400 cursor-not-allowed bg-gray-100'
                }`}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* Carousel Indicators */}
        {!loading && mithaiProducts.length > itemsPerView && (
          <div className="flex justify-center mb-8 space-x-3">
            {Array.from({ length: Math.ceil(mithaiProducts.length / itemsPerView) }).map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index * itemsPerView);
                  setLastManualAction(Date.now());
                }}
                className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-500 transform hover:scale-125 ${
                  Math.floor(currentIndex / itemsPerView) === index
                    ? 'bg-gradient-to-r from-amber-500 to-red-500 w-8 sm:w-10 shadow-lg'
                    : 'bg-white border-2 border-amber-300 hover:bg-amber-100'
                }`}
              />
            ))}
          </div>
        )}

        {/* Product Carousel */}
        <div 
          className="relative"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-100 transform rotate-3">
                    <div className="h-64 bg-gradient-to-br from-amber-200 to-orange-200 rounded-t-3xl"></div>
                    <div className="p-6">
                      <div className="h-6 bg-gradient-to-r from-amber-200 to-orange-200 rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-gradient-to-r from-amber-100 to-orange-100 rounded w-1/2 mb-4"></div>
                      <div className="h-10 bg-gradient-to-r from-amber-300 to-orange-300 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : mithaiProducts.length > 0 ? (
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-700 ease-in-out"
                style={{ 
                  transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                }}
              >
                {mithaiProducts.map((product) => (
                  <div 
                    key={product.id} 
                    className="flex-shrink-0 px-2 w-full sm:w-1/2 lg:w-1/4"
                  >
                    {/* Enhanced Product Card with Mithai styling */}
                    <div 
                      className="bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-100 transform transition-all duration-300 hover:scale-105 hover:rotate-2 hover:shadow-2xl cursor-pointer flex flex-col h-full"
                      onClick={() => handleViewDetail(product)}
                    >
                      <div className="relative">
                        <div className="h-64 overflow-hidden">
                          <img 
                            src={hoveredProductId === product.id ? getHoverImage(product.images) : product.images?.[0] || '/placeholder.svg'} 
                            alt={product.name} 
                            className="w-full h-full object-cover transition-opacity duration-300"
                            onMouseEnter={() => setHoveredProductId(product.id)}
                            onMouseLeave={() => setHoveredProductId(null)}
                          />
                        </div>
                        {product.isBestSeller && (
                          <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                            BEST SELLER
                          </div>
                        )}
                        <div className="absolute bottom-4 right-4 bg-white rounded-full p-2 shadow-lg">
                          <Candy className="w-6 h-6 text-amber-600" />
                        </div>
                      </div>
                      
                      <div className="p-6 flex flex-col flex-grow">
                        <h3 className="text-xl font-bold text-gray-800 mb-2 font-serif line-clamp-2">{product.name}</h3>
                        
                        <div className="flex items-center mb-3">
                          <span className="text-2xl font-bold text-amber-700">₹{product.price}</span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-lg text-gray-500 line-through ml-2">₹{product.originalPrice}</span>
                          )}
                        </div>
                        
                        {product.weight && (
                          <p className="text-amber-700 font-medium mb-4">{product.weight}</p>
                        )}
                        
                        <div className="mt-auto">
                          <div className="flex space-x-2">
                            <button 
                              onClick={(e) => handleQuickView(e, product)}
                              className="flex-1 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-md flex items-center justify-center"
                            >
                              <span>Quick View</span>
                            </button>
                            <button 
                              onClick={(e) => handleAddToCart(e, product)}
                              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white p-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-md flex items-center justify-center"
                            >
                              <Plus className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-white/50 rounded-3xl backdrop-blur-sm">
              <Candy className="w-20 h-20 text-amber-400 mx-auto mb-6 animate-bounce" />
              <h3 className="text-2xl font-bold text-amber-800 mb-3">No mithai products available</h3>
              <p className="text-amber-600 mb-6">Check back later for delicious sweet treats</p>
              <button
                onClick={() => navigate('/products?category=Mithai')}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Explore All Sweets
              </button>
            </div>
          )}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/products?category=Mithai')}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-center justify-center">
              View All Mithai Products
            </div>
          </button>
        </div>
      </div>

      {/* Quick View Modal */}
      {isQuickViewOpen && quickViewProduct && (
        <QuickViewModal 
          product={quickViewProduct} 
          isOpen={isQuickViewOpen} 
          onClose={closeQuickView} 
        />
      )}
    </section>
  );
};

export default MithaiSpecials;