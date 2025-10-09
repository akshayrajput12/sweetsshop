import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../../store/useStore';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Grid3X3, ChevronLeft, ChevronRight, Candy, Heart, Zap, Apple, Package, Shirt, Sparkles } from 'lucide-react';

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

  // Carousel controls
  const itemsPerView = window.innerWidth < 768 ? 2 : 4; // 2 items on mobile, 4 on desktop
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
    if (lowerName.includes('traditional') || lowerName.includes('classic')) return Candy;
    if (lowerName.includes('chocolate') || lowerName.includes('truffle')) return Heart;
    if (lowerName.includes('fusion') || lowerName.includes('modern')) return Zap;
    if (lowerName.includes('dry fruits') || lowerName.includes('nuts')) return Apple;
    if (lowerName.includes('gift') || lowerName.includes('box')) return Package;
    if (lowerName.includes('seasonal') || lowerName.includes('special')) return Sparkles;
    return Candy; // Default icon
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
    <section className="py-12 bg-[#b4c6b2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-4">
            <div className="text-2xl">🌸</div>
            <h2 className="text-3xl md:text-4xl font-serif italic font-bold text-[#7a2c1d]">
              Flavours for <em>Every</em> Moment
            </h2>
            <div className="text-2xl">🌸</div>
          </div>
        </motion.div>

        {/* Carousel Controls */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className={`p-3 rounded-full transition-colors ${
              currentIndex === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-[#7a2c1d] hover:bg-[#a9c0b0]'
            }`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
            className={`p-3 rounded-full transition-colors ${
              currentIndex >= maxIndex
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-[#7a2c1d] hover:bg-[#a9c0b0]'
            }`}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
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
              Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="flex-shrink-0 px-2 w-1/4 md:w-1/4">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#a9c0b0] mb-4"></div>
                    <div className="h-6 bg-[#a9c0b0] rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-[#a9c0b0] rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : (
              categories.map((category: any) => {
                const IconComponent = getCategoryIcon(category.name);
                return (
                  <div
                    key={category.id}
                    className="flex-shrink-0 px-2 w-1/2 md:w-1/4"
                  >
                    <button
                      className="w-full focus:outline-none flex flex-col items-center group"
                      onClick={() => handleCategoryClick(category.name)}
                    >
                      <motion.div 
                        className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-[#a9c0b0] mb-4 flex items-center justify-center overflow-hidden shadow-lg group-hover:rounded-full transition-all duration-300"
                        whileHover={{ scale: 0.9 }}
                      >
                        {category.image_url ? (
                          <img 
                            src={category.image_url} 
                            alt={category.name}
                            className="w-full h-full object-cover group-hover:rounded-full transition-all duration-300"
                          />
                        ) : (
                          <div className="text-white">
                            <IconComponent className="w-10 h-10 md:w-12 md:h-12 mx-auto" />
                          </div>
                        )}
                      </motion.div>
                      <h3 className="text-lg md:text-xl font-serif text-center text-[#7a2c1d] font-medium mb-1">
                        {category.name}
                      </h3>
                      <p className="text-center text-gray-700 text-sm">
                        {category.productCount || 0} products
                      </p>
                    </button>
                  </div>
                );
              })
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CategoriesCarousel;