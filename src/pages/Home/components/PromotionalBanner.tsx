import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import heroImage from '@/assets/hero.png';

const PromotionalBanner = () => {
  const navigate = useNavigate();

  return (
    <motion.div 
      className="relative h-96"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <img 
        src={heroImage} 
        alt="Sweet Deals Banner"
        className="w-full h-full object-cover absolute inset-0 z-0"
      />
    </motion.div>
  );
};

export default PromotionalBanner;