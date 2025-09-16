import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../../store/useStore';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Grid3X3, ChevronLeft, ChevronRight, Dumbbell, Heart, Zap, Apple, Package, Shirt, Sparkles } from 'lucide-react';

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

  // Map category names to icons
  const getCategoryIcon = (categoryName: string) => {
    const lowerName = categoryName.toLowerCase();
    if (lowerName.includes('protein') || lowerName.includes('supplement')) return Dumbbell;
    if (lowerName.includes('health') || lowerName.includes('wellness')) return Heart;
    if (lowerName.includes('energy') || lowerName.includes('pre-workout')) return Zap;
    if (lowerName.includes('nutrition') || lowerName.includes('vitamin')) return Apple;
    if (lowerName.includes('gear') || lowerName.includes('equipment')) return Package;
    if (lowerName.includes('apparel') || lowerName.includes('clothing')) return Shirt;
    return Sparkles; // Default icon
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
    <section className="py-12 bg-muted">
      {/* Added max-width container with proper padding and margins */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Removed "Browse Categories" badge */}
          
          {/* Improved responsive font sizing */}
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-secondary mb-4 font-raleway">
            Shop by{' '}
            <span className="text-primary">Categories</span>
          </h2>
          
          {/* Removed description paragraph */}
        </motion.div>

        {/* Desktop Grid */}
        {/* Improved responsive grid with better spacing */}
        <motion.div 
          className="hidden md:grid md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                {/* Reduced card size and removed card styling */}
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-gray-200"></div>
                  <div className="h-4 bg-gray-200 rounded-full w-3/4 mx-auto mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded-full w-1/2 mx-auto"></div>
                </div>
              </div>
            ))
          ) : (
            categories.map((category: any) => {
              const IconComponent = getCategoryIcon(category.name);
              return (
                <motion.button
                  key={category.id}
                  variants={itemVariants}
                  className="group"
                  onClick={() => handleCategoryClick(category.name)}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Reduced card size and removed card styling */}
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-xl flex items-center justify-center overflow-hidden bg-muted group-hover:bg-primary/10 transition-all duration-300">
                      {category.image_url ? (
                        <img 
                          src={category.image_url} 
                          alt={category.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary rounded-xl">
                          <IconComponent className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    
                    {/* Improved responsive font sizing */}
                    <h3 className="font-bold text-secondary group-hover:text-primary transition-colors text-sm md:text-base mb-1 font-raleway">
                      {category.name}
                    </h3>
                    
                    <p className="text-xs text-gray-500 font-raleway">
                      {category.productCount || 0} products
                    </p>
                  </div>
                </motion.button>
              );
            })
          )}
        </motion.div>

        {/* Mobile Carousel */}
        <div className="md:hidden mb-12">
          {/* Carousel Controls */}
          <div className="flex items-center justify-between mb-4">
            {/* Improved responsive font sizing */}
            <div className="text-xs sm:text-sm text-gray-600 font-raleway">
              {currentIndex + 1}-{Math.min(currentIndex + itemsPerView, categories.length)} of {categories.length}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={prevSlide}
                disabled={currentIndex === 0}
                className={`p-1 sm:p-2 rounded-full border transition-colors font-raleway ${
                  currentIndex === 0
                    ? 'border-gray-300 text-gray-300 cursor-not-allowed'
                    : 'border-primary text-primary hover:bg-primary hover:text-white'
                }`}
              >
                {/* Improved responsive icon sizing */}
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={nextSlide}
                disabled={currentIndex >= maxIndex}
                className={`p-1 sm:p-2 rounded-full border transition-colors font-raleway ${
                  currentIndex >= maxIndex
                    ? 'border-gray-300 text-gray-300 cursor-not-allowed'
                    : 'border-primary text-primary hover:bg-primary hover:text-white'
                }`}
              >
                {/* Improved responsive icon sizing */}
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
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
                  <div key={index} className="w-1/2 flex-shrink-0 px-1">
                    {/* Reduced card size and removed card styling */}
                    <div className="animate-pulse text-center">
                      <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-gray-200"></div>
                      <div className="h-3 bg-gray-200 rounded-full w-3/4 mx-auto mb-1"></div>
                      <div className="h-2 bg-gray-200 rounded-full w-1/2 mx-auto"></div>
                    </div>
                  </div>
                ))
              ) : (
                categories.map((category: any) => {
                  const IconComponent = getCategoryIcon(category.name);
                  return (
                    <motion.div
                      key={category.id}
                      className="w-1/2 flex-shrink-0 px-1"
                    >
                      <button
                        onClick={() => handleCategoryClick(category.name)}
                        className="w-full text-center font-raleway"
                      >
                        {/* Reduced card size and removed card styling */}
                        <div className="w-12 h-12 mx-auto mb-2 rounded-lg flex items-center justify-center overflow-hidden bg-muted">
                          {category.image_url ? (
                            <img 
                              src={category.image_url} 
                              alt={category.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary rounded-lg">
                              <IconComponent className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        
                        {/* Improved responsive font sizing */}
                        <h3 className="font-bold text-secondary text-xs sm:text-sm mb-1 font-raleway">
                          {category.name}
                        </h3>
                        
                        <p className="text-[10px] sm:text-xs text-gray-500 font-raleway">
                          {category.productCount || 0} products
                        </p>
                      </button>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          </div>
        </div>


      </div>
    </section>
  );
};

export default CategoriesCarousel;