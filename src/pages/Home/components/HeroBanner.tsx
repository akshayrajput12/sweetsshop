import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import heroImage from '../../../assets/hero-meat-display.jpg';

const HeroBanner = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-hero-gradient min-h-[600px] flex items-center overflow-hidden">
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Content */}
        <motion.div 
          className="space-y-6 text-center lg:text-left"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1 
            className="heading-xl text-foreground"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Welcome to{' '}
            <span className="text-primary">Premium</span>{' '}
            Meat Delivery
          </motion.h1>
          
          <motion.p 
            className="heading-md text-muted-foreground max-w-lg mx-auto lg:mx-0"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Avail exciting offers, only for you! Fresh, premium quality meat delivered straight to your doorstep.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <button 
              onClick={() => navigate('/products')}
              className="btn-primary group"
            >
              Shop Now
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button className="btn-outline group">
              <Play className="w-4 h-4 mr-2" />
              Watch Video
            </button>
          </motion.div>

          {/* Price Banner */}
          <motion.div 
            className="inline-flex items-center bg-card rounded-lg p-4 shadow-soft"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="text-center">
              <p className="caption text-muted-foreground">Starting from</p>
              <div className="flex items-center space-x-2">
                <span className="heading-md line-through text-muted-foreground">$29.99</span>
                <span className="heading-lg font-bold text-primary">$19.99</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Image */}
        <motion.div 
          className="relative"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="relative">
            <motion.img
              src={heroImage}
              alt="Premium meat selection"
              className="w-full h-auto rounded-2xl shadow-large"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            />
            
            {/* Floating Elements */}
            <motion.div 
              className="absolute -top-4 -right-4 bg-accent text-accent-foreground px-4 py-2 rounded-full caption font-medium shadow-medium"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              🔥 Fresh Today
            </motion.div>
            
            <motion.div 
              className="absolute -bottom-4 -left-4 bg-success text-success-foreground px-4 py-2 rounded-full caption font-medium shadow-medium"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              ✅ Free Delivery
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-16 h-16 bg-accent/20 rounded-full"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>
    </section>
  );
};

export default HeroBanner;