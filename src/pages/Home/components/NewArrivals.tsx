import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import ProductCard from '../../../components/ProductCard';
import QuickViewModal from '../../../components/QuickViewModal';
import { supabase } from '@/integrations/supabase/client';

const NewArrivals = () => {
  const navigate = useNavigate();
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  useEffect(() => {
    fetchNewArrivals();
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [autoScroll, setAutoScroll] = useState(true);
  const [lastManualAction, setLastManualAction] = useState(0);

  useEffect(() => {
    if (newArrivals.length > itemsPerView && autoScroll) {
      const interval = setInterval(() => {
        if (Date.now() - lastManualAction < 10000) return;

        setCurrentIndex(prev => {
          const maxIndex = newArrivals.length - itemsPerView;
          return prev >= maxIndex ? 0 : prev + 1;
        });
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [newArrivals, itemsPerView, autoScroll, lastManualAction]);

  const handleResize = () => {
    if (window.innerWidth < 640) {
      setItemsPerView(1.2);
    } else if (window.innerWidth < 1024) {
      setItemsPerView(2.5);
    } else {
      setItemsPerView(4);
    }
  };

  const fetchNewArrivals = async () => {
    try {
      const result = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (result.error) throw result.error;

      // Filter for new arrivals specifically or just take latest
      const filteredProducts = (result.data || [])
        .filter((product: any) => product.new_arrival === true)
        .slice(0, 12);

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

  // Touch/swipe support
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50 && canGoNext) nextSlide();
    if (distance < -50 && canGoPrev) prevSlide();
  };

  const canGoNext = currentIndex < newArrivals.length - Math.floor(itemsPerView);
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

  const handleViewDetail = (product: any) => {
    const slug = product.sku || product.id;
    navigate(`/product/${slug}`);
  };

  return (
    <section className="py-24 bg-[#FFFDF7] relative overflow-hidden">
      {/* Background accent - Rajluxmi Theme */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFF8F0] rounded-full filter blur-[100px] opacity-60 pointer-events-none"></div>

      <div className="max-w-[1600px] mx-auto px-6 relative z-10">
        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 border-b border-[#E6D5B8] pb-6">
          <div>
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-[#8B2131] mb-4 block">Fresh from Kitchen</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#2C1810] leading-tight">
              New Arrivals
            </h2>
          </div>

          {/* Carousel Controls */}
          {!loading && newArrivals.length > itemsPerView && (
            <div className="flex items-center space-x-4">
              <button
                onClick={prevSlide}
                disabled={!canGoPrev}
                className={`w-12 h-12 flex items-center justify-center border border-[#E6D5B8] transition-all duration-300 rounded-full ${canGoPrev
                  ? 'bg-transparent text-[#2C1810] hover:bg-[#8B2131] hover:text-white hover:border-[#8B2131]'
                  : 'bg-transparent text-gray-300 cursor-not-allowed'
                  }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                disabled={!canGoNext}
                className={`w-12 h-12 flex items-center justify-center border border-[#E6D5B8] transition-all duration-300 rounded-full ${canGoNext
                  ? 'bg-transparent text-[#2C1810] hover:bg-[#8B2131] hover:text-white hover:border-[#8B2131]'
                  : 'bg-transparent text-gray-300 cursor-not-allowed'
                  }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Product Carousel */}
        <div
          className="relative"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-[#E6D5B8]/20 aspect-[4/5] w-full mb-4"></div>
                  <div className="h-4 bg-[#E6D5B8]/20 w-3/4 mb-2"></div>
                  <div className="h-4 bg-[#E6D5B8]/20 w-1/2"></div>
                </div>
              ))}
            </div>
          ) : newArrivals.length > 0 ? (
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-700 ease-out"
                style={{
                  transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                }}
              >
                {newArrivals.map((product) => (
                  <div
                    key={product.id}
                    className="flex-shrink-0 px-2 md:px-4"
                    style={{ width: `${100 / itemsPerView}%` }}
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
            <div className="text-center py-20 border border-[#E6D5B8]/20 p-8">
              <Sparkles className="w-12 h-12 text-[#E6D5B8] mx-auto mb-4" />
              <h3 className="text-xl font-serif text-[#2C1810] mb-2">No new arrivals yet</h3>
              <p className="text-[#5D4037] font-light">Check back soon for latest additions.</p>
            </div>
          )}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/products')}
            className="group inline-flex items-center gap-3 bg-[#2C1810] text-white px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#8B2131] transition-all duration-300"
          >
            View All Arrivals <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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