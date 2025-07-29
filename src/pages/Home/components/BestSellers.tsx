import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../../../components/ProductCard';
import { supabase } from '@/integrations/supabase/client';

const BestSellers = () => {
  const navigate = useNavigate();
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBestSellers();
  }, []);

  const fetchBestSellers = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_bestseller', true)
        .eq('is_active', true)
        .limit(8);

      if (error) throw error;
      setBestSellers(data || []);
    } catch (error) {
      console.error('Error fetching bestsellers:', error);
    } finally {
      setLoading(false);
    }
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
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="heading-lg mb-4">Bestsellers</h2>
          <p className="body-text text-muted-foreground max-w-2xl mx-auto">
            Most popular products near you! Discover our customer favorites and premium selections.
          </p>
        </motion.div>

        {/* Products Grid */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {loading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-muted h-48 rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))
          ) : (
            bestSellers.map((product: any) => (
              <motion.div key={product.id} variants={itemVariants}>
                <ProductCard 
                  product={{
                    ...product,
                    image: product.images?.[0] || '/placeholder.svg',
                    slug: product.sku || product.id
                  }}
                  onViewDetail={() => navigate(`/product/${product.sku || product.id}`)}
                />
              </motion.div>
            ))
          )}
        </motion.div>

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
      </div>
    </section>
  );
};

export default BestSellers;