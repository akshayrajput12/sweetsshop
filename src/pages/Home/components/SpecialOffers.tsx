import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Tag, Copy, Clock, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const SpecialOffers = () => {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [currentCouponIndex, setCurrentCouponIndex] = useState(0);

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Auto-rotate coupons every 4 seconds
  useEffect(() => {
    if (coupons.length > 1) {
      const interval = setInterval(() => {
        setCurrentCouponIndex(prev => (prev + 1) % coupons.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [coupons.length]);

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('is_active', true)
        .gte('valid_until', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    // You could add a toast notification here
  };

  const nextCoupon = () => {
    setCurrentCouponIndex(prev => (prev + 1) % coupons.length);
  };

  const prevCoupon = () => {
    setCurrentCouponIndex(prev => (prev - 1 + coupons.length) % coupons.length);
  };

  return (
    <section className="py-12 bg-gradient-to-br from-secondary via-secondary/95 to-secondary/90">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center bg-white/20 text-white px-6 py-3 rounded-full text-sm font-semibold mb-6">
            <Tag className="w-4 h-4 mr-2" />
            Limited Time Offers
          </div>
          
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
            Special{' '}
            <span className="text-accent">Deals</span>
          </h2>
          
          <p className="text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
            Don't miss out on these amazing deals! Save big on your bulk purchases.
          </p>
        </motion.div>

        {/* Dynamic Promotional Banner with Coupon Carousel */}
        <motion.div 
          className="relative rounded-2xl p-6 md:p-8 text-center shadow-xl overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm z-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80" 
              alt="Sale Background"
              className="w-full h-full object-cover rounded-3xl"
            />
          </div>

          <div className="relative z-20 text-white">
            {/* Dynamic Coupon Carousel */}
            {coupons.length > 0 ? (
              <div className="mb-8">
                <div className="flex items-center justify-center gap-4 mb-6">
                  {coupons.length > 1 && (
                    <button
                      onClick={prevCoupon}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  )}
                  
                  <motion.div
                    key={currentCouponIndex}
                    className="bg-white/20 backdrop-blur-sm px-6 py-4 rounded-xl border border-white/30 min-w-72"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center justify-center space-x-3 mb-2">
                      <Tag className="w-5 h-5" />
                      <span className="font-bold text-2xl">{coupons[currentCouponIndex]?.code}</span>
                      <button
                        onClick={() => copyToClipboard(coupons[currentCouponIndex]?.code)}
                        className="p-1 hover:bg-white/20 rounded transition-colors"
                        title="Copy code"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-base opacity-90 mb-2">{coupons[currentCouponIndex]?.description}</p>
                    <div className="flex items-center justify-center space-x-2 text-sm opacity-75">
                      <Clock className="w-3 h-3" />
                      <span>Valid until {new Date(coupons[currentCouponIndex]?.valid_until).toLocaleDateString()}</span>
                    </div>
                  </motion.div>
                  
                  {coupons.length > 1 && (
                    <button
                      onClick={nextCoupon}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Coupon Indicators */}
                {coupons.length > 1 && (
                  <div className="flex justify-center space-x-2 mb-6">
                    {coupons.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentCouponIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentCouponIndex ? 'bg-white scale-125' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="mb-6">
                <h3 className="text-2xl md:text-3xl font-bold mb-3">
                  Amazing Deals Coming Soon!
                </h3>
                <p className="text-lg opacity-90">
                  Stay tuned for exclusive offers and discounts on bulk purchases.
                </p>
              </div>
            )}
            
            <motion.button 
              onClick={() => navigate('/products')}
              className="bg-accent hover:bg-accent/90 text-white px-8 py-3 rounded-xl font-semibold text-base transition-colors shadow-lg"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center justify-center">
                Shop Now & Save
                <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SpecialOffers;