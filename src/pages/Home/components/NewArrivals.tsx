import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, Star, ArrowRight } from 'lucide-react';
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
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  if (newArrivals.length === 0 && !loading) {
    return null; // Don't show section if no new arrivals
  }

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-10 right-10 w-64 h-64 bg-accent/5 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-10 left-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Enhanced Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
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
        </motion.div>

        {/* Enhanced Carousel Controls */}
        {!loading && newArrivals.length > itemsPerView && (
          <motion.div 
            className="flex items-center justify-between mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-100">
                <Sparkles className="w-4 h-4 text-accent fill-current" />
                <span className="text-sm font-medium text-gray-700">
                  {currentIndex + 1}-{Math.min(currentIndex + itemsPerView, newArrivals.length)} of {newArrivals.length} new products
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <motion.button
                onClick={prevSlide}
                disabled={!canGoPrev}
                className={`p-3 rounded-2xl border-2 transition-all duration-200 ${
                  canGoPrev 
                    ? 'border-accent text-accent hover:bg-accent hover:text-white shadow-lg hover:shadow-xl' 
                    : 'border-gray-200 text-gray-300 cursor-not-allowed'
                }`}
                whileHover={canGoPrev ? { scale: 1.05 } : {}}
                whileTap={canGoPrev ? { scale: 0.95 } : {}}
              >
                <ChevronLeft className="w-6 h-6" />
              </motion.button>
              <motion.button
                onClick={nextSlide}
                disabled={!canGoNext}
                className={`p-3 rounded-2xl border-2 transition-all duration-200 ${
                  canGoNext 
                    ? 'border-accent text-accent hover:bg-accent hover:text-white shadow-lg hover:shadow-xl' 
                    : 'border-gray-200 text-gray-300 cursor-not-allowed'
                }`}
                whileHover={canGoNext ? { scale: 1.05 } : {}}
                whileTap={canGoNext ? { scale: 0.95 } : {}}
              >
                <ChevronRight className="w-6 h-6" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Enhanced Products Carousel */}
        <div className="relative overflow-hidden rounded-3xl">
          <motion.div 
            className="flex transition-transform duration-500 ease-out"
            style={{ 
              transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            }}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
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
                <motion.div 
                  key={product.id} 
                  className="flex-shrink-0 px-4" 
                  style={{ width: `${100 / itemsPerView}%` }}
                  variants={itemVariants}
                >
                  <ProductCard 
                    product={{
                      ...product,
                      image: product.images?.[0] || '/placeholder.svg',
                      slug: product.sku || product.id
                    }}
                    onViewDetail={() => navigate(`/product/${product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`)}
                    onQuickView={() => handleQuickView(product)}
                  />
                </motion.div>
              ))
            )}
          </motion.div>
        </div>

        {/* Enhanced CTA Section */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="bg-accent/5 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-accent/20 shadow-xl">
            <h3 className="text-2xl md:text-3xl font-bold text-secondary mb-4">
              Don't miss out on the latest arrivals!
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Be the first to get your hands on our newest bulk products with exclusive launch prices.
            </p>
            <motion.button 
              onClick={() => navigate('/products?filter=new_arrivals')}
              className="group bg-accent hover:bg-accent/90 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-xl"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-center">
                View All New Arrivals
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
          </div>
        </motion.div>

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