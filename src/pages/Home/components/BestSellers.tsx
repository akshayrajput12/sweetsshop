import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, TrendingUp, Star, ArrowRight } from 'lucide-react';
import ProductCard from '../../../components/ProductCard';
import QuickViewModal from '../../../components/QuickViewModal';
import { supabase } from '@/integrations/supabase/client';

const BestSellers = () => {
  const navigate = useNavigate();
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  useEffect(() => {
    fetchBestSellers();
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
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
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

  return (
    <section className="py-20 bg-gradient-to-br from-white via-gray-50 to-blue-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-10 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-10 left-10 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl"
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
          <div className="inline-flex items-center bg-primary/10 text-primary px-6 py-3 rounded-full text-sm font-semibold mb-6">
            <TrendingUp className="w-4 h-4 mr-2" />
            Customer Favorites
          </div>
          
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-secondary mb-6">
            Our{' '}
            <span className="text-primary">Bestsellers</span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover the products our customers love most! These top-rated items offer unbeatable quality, 
            amazing bulk prices, and have earned thousands of 5-star reviews.
          </p>
        </motion.div>

        {/* Enhanced Carousel Controls */}
        {!loading && bestSellers.length > itemsPerView && (
          <motion.div 
            className="flex items-center justify-between mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-100">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium text-gray-700">
                  {currentIndex + 1}-{Math.min(currentIndex + itemsPerView, bestSellers.length)} of {bestSellers.length} products
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <motion.button
                onClick={prevSlide}
                disabled={!canGoPrev}
                className={`p-3 rounded-2xl border-2 transition-all duration-200 ${
                  canGoPrev 
                    ? 'border-primary text-primary hover:bg-primary hover:text-white shadow-lg hover:shadow-xl' 
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
                    ? 'border-primary text-primary hover:bg-primary hover:text-white shadow-lg hover:shadow-xl' 
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
              bestSellers.map((product: any) => (
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
                    onViewDetail={() => navigate(`/product/${product.sku || product.id}`)}
                    onQuickView={() => handleQuickView(product)}
                  />
                </motion.div>
              ))
            )}
          </motion.div>
        </div>

        {/* Simple CTA Section */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <motion.button 
            onClick={() => navigate('/products')}
            className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            View All Products
          </motion.button>
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

export default BestSellers;