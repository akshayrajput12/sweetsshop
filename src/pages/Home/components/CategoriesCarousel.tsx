import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../../store/useStore';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const CategoriesCarousel = () => {
  const { setSelectedCategory } = useStore();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      setCategories(data || []);
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
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="heading-lg mb-4">Shop by Categories</h2>
          <p className="body-text text-muted-foreground max-w-2xl mx-auto">
            Freshest meats and much more! Explore our wide selection of premium products.
          </p>
        </motion.div>

        {/* Categories Grid */}
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="card-elevated p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted"></div>
                  <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
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
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="card-elevated p-6 text-center hover:shadow-medium transition-all duration-200">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center overflow-hidden">
                    {category.image_url ? (
                      <img 
                        src={category.image_url} 
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center text-2xl">
                        {category.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                </div>
              </motion.button>
            ))
          )}
        </motion.div>

        {/* Promotional Banner */}
        <motion.div 
          className="mt-16 bg-primary text-primary-foreground rounded-2xl p-8 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h3 className="heading-md mb-2">Special Weekend Offer!</h3>
          <p className="body-text mb-4 opacity-90">
            Get 25% off on all categories. Use code WEEKEND25
          </p>
          <button className="bg-primary-foreground text-primary px-6 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors">
            Shop Now
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default CategoriesCarousel;