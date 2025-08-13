import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../../store/useStore';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Grid3X3, ChevronLeft, ChevronRight } from 'lucide-react';

const CategoriesCarousel = () => {
  const { setSelectedCategory } = useStore();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // Fetch categories with product counts
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true);

      if (categoriesError) throw categoriesError;

      // Fetch product counts for each category
      const categoriesWithCounts = await Promise.all(
        (categoriesData || []).map(async (category) => {
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id)
            .eq('is_active', true);
          
          return {
            ...category,
            productCount: count || 0
          };
        })
      );

      setCategories(categoriesWithCounts);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    navigate('/products');
  };

  // Mobile carousel controls
  const itemsPerView = 2; // Show 2 items per row on mobile
  const maxIndex = Math.max(0, categories.length - itemsPerView);

  const nextSlide = () => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
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
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center bg-primary/10 text-primary px-6 py-3 rounded-full text-sm font-semibold mb-6">
            <Grid3X3 className="w-4 h-4 mr-2" />
            Browse Categories
          </div>
          
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-secondary mb-6">
            Shop by{' '}
            <span className="text-primary">Categories</span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Everything you need in bulk! Explore our wide selection of products across all categories 
            at wholesale prices with guaranteed quality.
          </p>
        </motion.div>

        {/* Desktop Grid */}
        <motion.div 
          className="hidden md:grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8 mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gray-200"></div>
                  <div className="h-5 bg-gray-200 rounded-full w-3/4 mx-auto mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded-full w-1/2 mx-auto"></div>
                </div>
              </div>
            ))
          ) : (
            categories.map((category: any) => (
              <motion.button
                key={category.id}
                variants={itemVariants}
                className="group"
                onClick={() => handleCategoryClick(category.name)}
                whileHover={{ scale: 1.05, y: -8 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="bg-white rounded-3xl p-8 text-center shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group-hover:border-primary/30">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center overflow-hidden bg-muted group-hover:bg-primary/10 transition-all duration-300">
                    {category.image_url ? (
                      <img 
                        src={category.image_url} 
                        alt={category.name}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary rounded-2xl">
                        {category.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-bold text-secondary group-hover:text-primary transition-colors text-lg mb-2">
                    {category.name}
                  </h3>
                  
                  <p className="text-sm text-gray-500">
                    {category.productCount || 0} products
                  </p>
                </div>
              </motion.button>
            ))
          )}
        </motion.div>

        {/* Mobile Carousel */}
        <div className="md:hidden mb-20">
          {/* Carousel Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-gray-600">
              {currentIndex + 1}-{Math.min(currentIndex + itemsPerView, categories.length)} of {categories.length}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={prevSlide}
                disabled={currentIndex === 0}
                className={`p-2 rounded-full border transition-colors ${
                  currentIndex === 0
                    ? 'border-gray-300 text-gray-300 cursor-not-allowed'
                    : 'border-primary text-primary hover:bg-primary hover:text-white'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                disabled={currentIndex >= maxIndex}
                className={`p-2 rounded-full border transition-colors ${
                  currentIndex >= maxIndex
                    ? 'border-gray-300 text-gray-300 cursor-not-allowed'
                    : 'border-primary text-primary hover:bg-primary hover:text-white'
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Carousel Container */}
          <div className="overflow-hidden">
            <motion.div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{ 
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
              }}
            >
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="w-1/2 flex-shrink-0 px-2">
                    <div className="animate-pulse bg-white rounded-3xl p-6 text-center shadow-sm border border-gray-100">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-200"></div>
                      <div className="h-4 bg-gray-200 rounded-full w-3/4 mx-auto mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded-full w-1/2 mx-auto"></div>
                    </div>
                  </div>
                ))
              ) : (
                categories.map((category: any) => (
                  <motion.div
                    key={category.id}
                    className="w-1/2 flex-shrink-0 px-2"
                  >
                    <button
                      onClick={() => handleCategoryClick(category.name)}
                      className="w-full bg-white rounded-3xl p-6 text-center shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary/30"
                    >
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center overflow-hidden bg-muted">
                        {category.image_url ? (
                          <img 
                            src={category.image_url} 
                            alt={category.name}
                            className="w-full h-full object-cover rounded-2xl"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary rounded-2xl">
                            {category.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      
                      <h3 className="font-bold text-secondary text-base mb-1">
                        {category.name}
                      </h3>
                      
                      <p className="text-xs text-gray-500">
                        {category.productCount || 0} products
                      </p>
                    </button>
                  </motion.div>
                ))
              )}
            </motion.div>
          </div>
        </div>


      </div>
    </section>
  );
};

export default CategoriesCarousel;