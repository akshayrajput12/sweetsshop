import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingCart, Truck, Shield, Star, Package, Users, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroBanner = () => {
  const navigate = useNavigate();

  const stats = [
    { icon: Users, value: '10K+', label: 'Happy Customers' },
    { icon: Package, value: '5000+', label: 'Products' },
    { icon: TrendingUp, value: '50%', label: 'Savings' },
  ];

  const features = [
    { icon: Truck, text: 'Free Delivery on Bulk Orders' },
    { icon: Shield, text: 'Quality Guaranteed' },
    { icon: Star, text: 'Premium Products' },
  ];

  return (
    <section className="relative bg-white py-16 lg:py-24 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
          alt="Bulk Shopping Background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="container mx-auto px-4 relative z-20">
        <div className="max-w-6xl mx-auto">
          {/* Main Content */}
          <div className="text-center mb-12">
            {/* Badge */}
            <motion.div 
              className="inline-flex items-center bg-white/90 backdrop-blur-sm text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              India's #1 Bulk Shopping Platform
            </motion.div>

            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-6"
            >
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                Buy in{' '}
                <span className="text-primary">Bulk</span>
                <br />
                Save{' '}
                <span className="text-accent">More</span>
              </h1>
            </motion.div>
            
            {/* Subtitle */}
            <motion.p 
              className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Your trusted partner for bulk groceries, wholesale products, and everything your business needs. 
              Get wholesale prices with guaranteed quality and fast delivery.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.button 
                onClick={() => navigate('/products')}
                className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Start Bulk Shopping
                  <ArrowRight className="w-5 h-5 ml-2" />
                </div>
              </motion.button>
              
              <motion.button 
                onClick={() => navigate('/about')}
                className="bg-white text-secondary px-8 py-3 rounded-xl font-semibold text-base border-2 border-secondary hover:bg-secondary hover:text-white shadow-lg transition-all duration-200"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-center">
                  Learn More
                  <ArrowRight className="w-5 h-5 ml-2" />
                </div>
              </motion.button>
            </motion.div>

            {/* Features */}
            <motion.div 
              className="flex flex-wrap justify-center gap-6 mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {features.map((feature, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-center space-x-3 bg-muted px-6 py-4 rounded-2xl"
                  whileHover={{ scale: 1.05, y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <feature.icon className="w-5 h-5 text-primary" />
                  <span className="font-medium text-secondary">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Simple Stats Text */}
            <motion.div 
              className="flex flex-wrap justify-center gap-8 text-white/90"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              {stats.map((stat, index) => (
                <motion.div 
                  key={index} 
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;