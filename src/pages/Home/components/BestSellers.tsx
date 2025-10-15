import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, TrendingUp, Star, Candy } from 'lucide-react';
import ProductCard from '../../../components/ProductCard';
import QuickViewModal from '../../../components/QuickViewModal';
import { supabase } from '@/integrations/supabase/client';

const BestSellers = () => {
  const navigate = useNavigate();
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  useEffect(() => {
    fetchBestSellers();
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-scroll carousel with manual override
  const [autoScroll, setAutoScroll] = useState(true);
  const [lastManualAction, setLastManualAction] = useState(0);

  useEffect(() => {
    if (bestSellers.length > itemsPerView && autoScroll) {
      const interval = setInterval(() => {
        // Pause auto-scroll for 10 seconds after manual action
        if (Date.now() - lastManualAction < 10000) return;
        
        setCurrentIndex(prev => {
          const maxIndex = bestSellers.length - itemsPerView;
          return prev >= maxIndex ? 0 : prev + 1;
        });
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [bestSellers, itemsPerView, autoScroll, lastManualAction]);

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

  const fetchBestSellers = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_bestseller', true)
        .eq('is_active', true)
        .limit(12);

      if (error) throw error;
      setBestSellers(data || []);
    } catch (error) {
      console.error('Error fetching bestsellers:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    if (currentIndex < bestSellers.length - itemsPerView) {
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

  const canGoNext = currentIndex < bestSellers.length - itemsPerView;
  const canGoPrev = currentIndex > 0;

  const handleQuickView = (product: any) => {
    setQuickViewProduct({
      ...product,
      image: product.images?.[0] || '/placeholder.svg',
      slug: product.sku || product.id
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

  return (
    <section className="py-12 bg-gradient-to-br from-white via-gray-50 to-[hsl(25_95%_90%)] relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-red-500/5 rounded-full blur-3xl opacity-20"></div>
      </div>

      {/* Added max-width container with proper padding and margins */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Enhanced Section Header */}
        {/* Improved responsive font sizing */}
        <div className="text-center mb-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-secondary mb-4 font-raleway">
            Top{' '}
            <span className="bg-gradient-to-r from-primary to-[hsl(0_84%_60%)] bg-clip-text text-transparent">
              Selling Sweets
            </span>
          </h2>
        </div>

        {/* Enhanced Carousel Controls */}
        {!loading && bestSellers.length > itemsPerView && (
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-100 font-raleway">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                {/* Improved responsive font sizing */}
                <span className="text-xs sm:text-sm font-medium text-gray-700 font-raleway">
                  {currentIndex + 1}-{Math.min(currentIndex + itemsPerView, bestSellers.length)} of {bestSellers.length} products
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={prevSlide}
                disabled={!canGoPrev}
                className={`p-2 rounded-full border-2 transition-all duration-200 font-raleway ${
                  canGoPrev 
                    ? 'border-primary text-primary hover:bg-primary hover:text-white shadow-lg hover:shadow-xl hover:scale-105' 
                    : 'border-gray-200 text-gray-300 cursor-not-allowed'
                }`}
              >
                {/* Improved responsive icon sizing */}
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                disabled={!canGoNext}
                className={`p-2 rounded-full border-2 transition-all duration-200 font-raleway ${
                  canGoNext 
                    ? 'border-primary text-primary hover:bg-primary hover:text-white shadow-lg hover:shadow-xl hover:scale-105' 
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
        {!loading && bestSellers.length > itemsPerView && (
          <div className="flex justify-center mb-8 space-x-2">
            {Array.from({ length: Math.ceil(bestSellers.length / itemsPerView) }).map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index * itemsPerView);
                  setLastManualAction(Date.now());
                }}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 font-raleway ${
                  Math.floor(currentIndex / itemsPerView) === index
                    ? 'bg-primary w-6 sm:w-8'
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
          ) : bestSellers.length > 0 ? (
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ 
                  transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                }}
              >
                {bestSellers.map((product) => (
                  <div 
                    key={product.id} 
                    className="flex-shrink-0 px-2 w-full sm:w-1/2 lg:w-1/4"
                  >
                    <ProductCard 
                      product={{
                        ...product,
                        image: product.images?.[0] || '/placeholder.svg',
                        slug: product.sku || product.id
                      }} 
                      onQuickView={(product) => handleQuickView(product)}
                      onViewDetail={() => handleViewDetail(product)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <Candy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-500 mb-2 font-raleway">No bestsellers available</h3>
              <p className="text-gray-400 font-raleway">Check back later for our top-selling products</p>
            </div>
          )}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/products')}
            className="bg-gradient-to-r from-primary to-[hsl(0_84%_60%)] hover:from-[hsl(25_95%_48%)] hover:to-[hsl(0_80%_55%)] text-white px-6 py-3 rounded-full font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 font-raleway"
          >
            View All Sweets
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

export default BestSellers;