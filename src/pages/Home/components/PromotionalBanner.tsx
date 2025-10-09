import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Tag, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import heroImage from '@/assets/hero.png';

const PromotionalBanner = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Promotional Banner */}
        <motion.div 
          className="relative rounded-2xl overflow-hidden shadow-xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-black/50 z-10"></div>
            <img 
              src={heroImage} 
              alt="Sweet Deals Banner"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="relative z-20 p-8 md:p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between">
            <div className="text-center md:text-left mb-8 md:mb-0 md:max-w-lg">
              <motion.div 
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ 
                  scale: 1.05,
                  borderRadius: "12px",
                  transition: { duration: 0.3 }
                }}
              >
                <Tag className="w-4 h-4 text-white" />
                <span className="text-white font-medium">Limited Time Offer</span>
              </motion.div>
              
              <motion.h2 
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
              >
                Sweet Deals Await You
              </motion.h2>
              
              <motion.p 
                className="text-lg text-white/90 mb-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                whileHover={{ 
                  scale: 1.01,
                  transition: { duration: 0.3 }
                }}
              >
                Discover our exclusive collection of premium sweets with special discounts and offers. 
                Indulge in the finest delicacies crafted with love.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.3 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  className="gap-2 bg-white text-primary hover:bg-gray-100 text-base px-8 py-6 rounded-xl"
                  onClick={() => navigate('/products')}
                >
                  Shop Sweet Deals <ArrowRight className="w-5 h-5" />
                </Button>
              </motion.div>
            </div>
            
            <motion.div 
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              whileHover={{ 
                scale: 1.05,
                rotate: 2,
                transition: { duration: 0.4 }
              }}
            >
              <motion.div 
                className="relative w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20"
                whileHover={{ 
                  borderRadius: "50%",
                  rotate: 5,
                  transition: { duration: 0.5 }
                }}
              >
                <img 
                  src={heroImage} 
                  alt="Featured Sweet Offer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <motion.div 
                  className="absolute top-4 right-4 bg-destructive text-white px-3 py-1 rounded-full font-bold flex items-center gap-1"
                  whileHover={{ 
                    scale: 1.1,
                    borderRadius: "12px",
                    transition: { duration: 0.3 }
                  }}
                >
                  <Gift className="w-4 h-4" />
                  <span>30% OFF</span>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PromotionalBanner;