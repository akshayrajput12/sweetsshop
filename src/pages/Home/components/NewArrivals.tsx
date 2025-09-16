import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Dumbbell } from 'lucide-react';
import ProductCard from '../../../components/ProductCard';
import QuickViewModal from '../../../components/QuickViewModal';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/store/useStore';

const NewArrivals = () => {
  const navigate = useNavigate();
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  useEffect(() => {
    fetchNewArrivals();
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-scroll carousel with manual override
  const [autoScroll, setAutoScroll] = useState(true);
  const [lastManualAction, setLastManualAction] = useState(0);

  useEffect(() => {
    if (newArrivals.length > itemsPerView && autoScroll) {
      const interval = setInterval(() => {
        // Pause auto-scroll for 10 seconds after manual action
        if (Date.now() - lastManualAction < 10000) return;
        
        setCurrentIndex(prev => {
          const maxIndex = newArrivals.length - itemsPerView;
          return prev >= maxIndex ? 0 : prev + 1;
        });
      }, 4500);

      return () => clearInterval(interval);
    }
  }, [newArrivals, itemsPerView, autoScroll, lastManualAction]);

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

  const fetchNewArrivals = async () => {
    try {
      // First, get all products and then filter for new arrivals on the client side
      // This avoids the type issue with the missing new_arrival field in generated types
      const result = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(20); // Get more products to filter from

      if (result.error) throw result.error;
      
      // Filter for new arrivals on the client side and transform to Product interface
      const filteredProducts = (result.data || [])
        .filter((product: any) => product.new_arrival === true) // Filter for new arrivals
        .slice(0, 12) // Limit to 12 new arrivals
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
          slug: product.id, // Use id as slug since sku might not exist
          inStock: product.stock_quantity !== undefined ? product.stock_quantity > 0 : true,
          isBestSeller: product.is_bestseller || false
        } as Product));
      
      setNewArrivals(filteredProducts);
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    if (currentIndex < newArrivals.length - itemsPerView) {
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

  const canGoNext = currentIndex < newArrivals.length - itemsPerView;
  const canGoPrev = currentIndex > 0;

  const handleQuickView = (product: any) => {
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

  if (newArrivals.length === 0 && !loading) {
    return null; // Don't show section if no new arrivals
  }

  return (
    <section className="py-12 bg-white relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-10 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-red-500/5 rounded-full blur-3xl opacity-20"></div>
      </div>

      {/* Added max-width container with proper padding and margins */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Enhanced Section Header */}
        {/* Improved responsive font sizing */}
        <div className="text-center mb-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-secondary mb-4 font-raleway">
            New{' '}
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Fitness Products
            </span>
          </h2>
          
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto font-raleway">
            Discover the latest additions to our fitness collection! Fresh supplements, new gear, and exciting products that have just arrived.
          </p>
        </div>

        {/* Enhanced Carousel Controls */}
        {!loading && newArrivals.length > itemsPerView && (
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-100 font-raleway">
                <Sparkles className="w-4 h-4 text-orange-500 fill-current" />
                {/* Improved responsive font sizing */}
                <span className="text-xs sm:text-sm font-medium text-gray-700 font-raleway">
                  {currentIndex + 1}-{Math.min(currentIndex + itemsPerView, newArrivals.length)} of {newArrivals.length} new products
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={prevSlide}
                disabled={!canGoPrev}
                className={`p-2 rounded-full border-2 transition-all duration-200 ${
                  canGoPrev 
                    ? 'border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white shadow-lg hover:shadow-xl hover:scale-105' 
                    : 'border-gray-200 text-gray-300 cursor-not-allowed'
                }`}
              >
                {/* Improved responsive icon sizing */}
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                disabled={!canGoNext}
                className={`p-2 rounded-full border-2 transition-all duration-200 ${
                  canGoNext 
                    ? 'border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white shadow-lg hover:shadow-xl hover:scale-105' 
                    : 'border-gray-200 text-gray-300 cursor-not-allowed'
                }`}
              >
                {/* Improved responsive icon sizing */}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Carousel Indicators */}
        {!loading && newArrivals.length > itemsPerView && (
          <div className="flex justify-center mb-8 space-x-2">
            {Array.from({ length: Math.ceil(newArrivals.length / itemsPerView) }).map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index * itemsPerView);
                  setLastManualAction(Date.now());
                }}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                  Math.floor(currentIndex / itemsPerView) === index
                    ? 'bg-orange-500 w-6 sm:w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
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
                  <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100">
                    <div className="h-64 bg-gray-200 rounded-t-3xl"></div>
                    <div className="p-6">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="h-10 bg-gray-200 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : newArrivals.length > 0 ? (
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ 
                  transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                }}
              >
                {newArrivals.map((product) => (
                  <div 
                    key={product.id} 
                    className="flex-shrink-0 px-2 w-full sm:w-1/2 lg:w-1/4"
                  >
                    <ProductCard 
                      product={{
                        ...product,
                        image: product.images?.[0] || '/placeholder.svg',
                        slug: product.id
                      }} 
                      onQuickView={handleQuickView}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <Dumbbell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-500 mb-2 font-raleway">No new arrivals available</h3>
              <p className="text-gray-400 font-raleway">Check back later for new fitness products</p>
            </div>
          )}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/products')}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-full font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 font-raleway"
          >
            View All New Products
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

export default NewArrivals;