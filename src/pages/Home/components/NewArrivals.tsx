import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import ProductCard from '../../../components/ProductCard';
import QuickViewModal from '../../../components/QuickViewModal';
import { supabase } from '@/integrations/supabase/client';

const NewArrivals = () => {
  const navigate = useNavigate();
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
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
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('new_arrival', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) throw error;
      setNewArrivals(data || []);
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
      slug: product.sku || product.id
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
        <div className="absolute top-10 right-10 w-64 h-64 bg-accent/5 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Enhanced Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center bg-accent/10 text-accent px-6 py-3 rounded-full text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            Fresh Arrivals
          </div>
          
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-secondary mb-6">
            New{' '}
            <span className="text-accent">Arrivals</span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover the latest additions to our bulk collection! Fresh products, new brands, and exciting deals 
            that have just arrived in our warehouse.
          </p>
        </div>

        {/* Enhanced Carousel Controls */}
        {!loading && newArrivals.length > itemsPerView && (
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-100">
                <Sparkles className="w-4 h-4 text-accent fill-current" />
                <span className="text-sm font-medium text-gray-700">
                  {currentIndex + 1}-{Math.min(currentIndex + itemsPerView, newArrivals.length)} of {newArrivals.length} new products
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={prevSlide}
                disabled={!canGoPrev}
                className={`p-3 rounded-2xl border-2 transition-all duration-200 ${
                  canGoPrev 
                    ? 'border-accent text-accent hover:bg-accent hover:text-white shadow-lg hover:shadow-xl hover:scale-105' 
                    : 'border-gray-200 text-gray-300 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextSlide}
                disabled={!canGoNext}
                className={`p-3 rounded-2xl border-2 transition-all duration-200 ${
                  canGoNext 
                    ? 'border-accent text-accent hover:bg-accent hover:text-white shadow-lg hover:shadow-xl hover:scale-105' 
                    : 'border-gray-200 text-gray-300 cursor-not-allowed'
                }`}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* Carousel Indicators */}
        {!loading && newArrivals.length > itemsPerView && (
          <div className="flex justify-center space-x-2 mb-6">
            {Array.from({ length: Math.ceil(newArrivals.length / itemsPerView) }).map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index * itemsPerView);
                  setLastManualAction(Date.now());
                }}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  Math.floor(currentIndex / itemsPerView) === index
                    ? 'bg-accent scale-110'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}

        {/* Enhanced Products Carousel */}
        <div className="relative overflow-hidden rounded-3xl">
          <div 
            className="flex transition-transform duration-500 ease-out"
            style={{ 
              transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {loading ? (
              // Enhanced Loading skeleton
              Array.from({ length: itemsPerView }).map((_, index) => (
                <div key={index} className="flex-shrink-0 px-4" style={{ width: `${100 / itemsPerView}%` }}>
                  <div className="animate-pulse bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                    <div className="bg-gray-200 h-56"></div>
                    <div className="p-5 space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="flex justify-between items-center pt-2">
                        <div className="h-8 bg-gray-200 rounded w-20"></div>
                        <div className="h-10 w-10 bg-gray-200 rounded-xl"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              newArrivals.map((product: any) => (
                <div 
                  key={product.id} 
                  className="flex-shrink-0 px-4" 
                  style={{ width: `${100 / itemsPerView}%` }}
                >
                  <ProductCard 
                    product={{
                      ...product,
                      image: product.images?.[0] || '/placeholder.svg',
                      slug: product.sku || product.id
                    }}
                    onViewDetail={() => navigate(`/product/${product.sku || product.id}`)}
                    onQuickView={() => handleQuickView(product)}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Enhanced CTA Section */}
        <div className="text-center mt-10">
          <div className="bg-accent/5 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-accent/20 shadow-xl">
            <h3 className="text-2xl md:text-3xl font-bold text-secondary mb-4">
              Don't miss out on the latest arrivals!
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Be the first to get your hands on our newest bulk products with exclusive launch prices.
            </p>
            <button 
              onClick={() => navigate('/products?filter=new_arrivals')}
              className="group bg-accent hover:bg-accent/90 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-200"
            >
              <div className="flex items-center justify-center">
                View All New Arrivals
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </div>

        {/* Quick View Modal */}
        <QuickViewModal
          product={quickViewProduct}
          isOpen={isQuickViewOpen}
          onClose={closeQuickView}
        />
      </div>
    </section>
  );
};

export default NewArrivals;