import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../../store/useStore';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Grid3X3, ChevronLeft, ChevronRight, Candy, Heart, Zap, Apple, Package, Shirt, Sparkles, Star, Gift } from 'lucide-react';

const CategoriesCarousel = () => {
  const { setSelectedCategory } = useStore();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // Touch/swipe support
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

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

      // Sort categories by product count (descending)
      const sortedCategories = categoriesWithCounts.sort((a, b) => b.productCount - a.productCount);
      
      setCategories(sortedCategories);
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

  // Touch event handlers for swipe functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const touchMove = e.targetTouches[0].clientX;
    const diff = touchStart - touchMove;
    setDragOffset(diff);
    
    // Prevent scrolling while swiping
    e.preventDefault();
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    const diff = touchStart - touchEnd;
    
    // Swipe threshold - adjust as needed
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe left - go to next slide
        nextSlide();
      } else {
        // Swipe right - go to previous slide
        prevSlide();
      }
    }
    
    setDragOffset(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setTouchStart(e.clientX);
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const diff = touchStart - e.clientX;
    setDragOffset(diff);
    
    // Prevent text selection while dragging
    e.preventDefault();
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    const diff = touchStart - touchEnd;
    
    // Swipe threshold - adjust as needed
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe left - go to next slide
        nextSlide();
      } else {
        // Swipe right - go to previous slide
        prevSlide();
      }
    }
    
    setDragOffset(0);
  };

  // Update touchEnd when dragOffset changes
  useEffect(() => {
    setTouchEnd(touchStart - dragOffset);
  }, [dragOffset, touchStart]);

  // Map category names to icons
  const getCategoryIcon = (categoryName: string) => {
    const lowerName = categoryName.toLowerCase();
    if (lowerName.includes('traditional') || lowerName.includes('classic')) return Candy;
    if (lowerName.includes('chocolate') || lowerName.includes('truffle')) return Heart;
    if (lowerName.includes('fusion') || lowerName.includes('modern')) return Zap;
    if (lowerName.includes('dry fruits') || lowerName.includes('nuts')) return Apple;
    if (lowerName.includes('gift') || lowerName.includes('box')) return Package;
    if (lowerName.includes('seasonal') || lowerName.includes('special') || lowerName.includes('festival')) return Gift;
    if (lowerName.includes('mithai')) return Star;
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
    <section className="py-16 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <Sparkles className="text-yellow-500 w-8 h-8 animate-bounce" />
            <h2 className="text-4xl md:text-5xl font-serif italic font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Sweet Categories
            </h2>
            <Sparkles className="text-yellow-500 w-8 h-8 animate-bounce" />
          </div>
        </motion.div>

        {/* Carousel Controls */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className={`p-4 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg ${
              currentIndex === 0
                ? 'text-gray-400 cursor-not-allowed bg-gray-200'
                : 'text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600'
            }`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="flex space-x-2">
            {Array.from({ length: Math.ceil(categories.length / itemsPerView) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index * itemsPerView)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  Math.floor(currentIndex / itemsPerView) === index
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
            className={`p-4 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg ${
              currentIndex >= maxIndex
                ? 'text-gray-400 cursor-not-allowed bg-gray-200'
                : 'text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600'
            }`}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Carousel Container */}
        <div 
          ref={carouselRef}
          className="overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <motion.div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ 
              transform: `translateX(calc(-${currentIndex * (100 / itemsPerView)}% - ${dragOffset}px))`,
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
          >
            {loading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="flex-shrink-0 px-2 w-1/2 md:w-1/4">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gradient-to-br from-pink-200 to-purple-200 mb-4 shadow-xl"></div>
                    <div className="h-6 bg-gradient-to-r from-pink-200 to-purple-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : (
              categories.map((category: any) => {
                const IconComponent = getCategoryIcon(category.name);
                return (
                  <div
                    key={category.id}
                    className="flex-shrink-0 px-3 w-1/2 md:w-1/4"
                  >
                    <button
                      className="w-full focus:outline-none flex flex-col items-center group"
                      onClick={() => handleCategoryClick(category.name)}
                    >
                      <motion.div 
                        className="w-36 h-36 md:w-44 md:h-44 rounded-3xl bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200 mb-6 flex items-center justify-center overflow-hidden shadow-2xl border-4 border-white transform transition-all duration-300 hover:scale-105 hover:rotate-3"
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {category.image_url ? (
                          <img 
                            src={category.image_url} 
                            alt={category.name}
                            className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
                          />
                        ) : (
                          <div className="text-white bg-gradient-to-br from-pink-500 to-purple-500 w-full h-full flex items-center justify-center">
                            <IconComponent className="w-16 h-16 md:w-20 md:h-20 mx-auto" />
                          </div>
                        )}
                        <div className="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 rounded-full w-10 h-10 flex items-center justify-center font-bold shadow-lg">
                          !
                        </div>
                      </motion.div>
                      <h3 className="text-2xl md:text-3xl font-serif text-center text-gray-800 font-bold mb-2 group-hover:text-purple-600 transition-colors duration-300">
                        {category.name}
                      </h3>
                      <div className="bg-white px-4 py-1 rounded-full shadow-md">
                        <p className="text-center text-gray-700 text-lg font-medium">
                          {category.productCount || 0} items
                        </p>
                      </div>
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