import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div 
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center sm:text-left mb-6 sm:mb-0">
            <h2 className="heading-lg mb-4">Bestsellers</h2>
            <p className="body-text text-muted-foreground max-w-2xl">
              Most popular products near you! Discover our customer favorites and premium selections.
            </p>
          </div>
          
          {/* Carousel Controls */}
          {!loading && bestSellers.length > itemsPerView && (
            <div className="flex items-center space-x-4">
              {/* Position Indicator */}
              <div className="text-sm text-gray-500">
                {currentIndex + 1}-{Math.min(currentIndex + itemsPerView, bestSellers.length)} of {bestSellers.length}
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={prevSlide}
                  disabled={!canGoPrev}
                  className={`p-2 rounded-full border transition-colors ${
                    canGoPrev 
                      ? 'border-primary text-primary hover:bg-primary hover:text-white' 
                      : 'border-gray-300 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextSlide}
                  disabled={!canGoNext}
                  className={`p-2 rounded-full border transition-colors ${
                    canGoNext 
                      ? 'border-primary text-primary hover:bg-primary hover:text-white' 
                      : 'border-gray-300 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Products Carousel */}
        <div className="relative overflow-hidden">
          <motion.div 
            className="flex transition-transform duration-300 ease-in-out"
            style={{ 
              transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            }}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {loading ? (
              // Loading skeleton
              Array.from({ length: itemsPerView }).map((_, index) => (
                <div key={index} className="flex-shrink-0 px-3" style={{ width: `${100 / itemsPerView}%` }}>
                  <div className="animate-pulse">
                    <div className="bg-muted h-48 rounded-lg mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              bestSellers.map((product: any) => (
                <motion.div 
                  key={product.id} 
                  className="flex-shrink-0 px-3" 
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

        {/* View All Button */}
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <button 
            onClick={() => navigate('/products')}
            className="btn-outline"
          >
            View All Products
          </button>
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