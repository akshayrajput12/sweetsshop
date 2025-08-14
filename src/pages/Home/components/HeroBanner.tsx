import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingCart, Apple, Shirt, Sparkles, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroBanner = () => {
  const navigate = useNavigate();

  const categories = [
    { 
      icon: Apple, 
      title: 'Fresh Produce', 
      subtitle: 'Farm-fresh vegetables & fruits',
      color: 'from-orange-400 to-orange-600',
      image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=300&fit=crop&crop=center'
    },
    { 
      icon: Package, 
      title: 'Aromatic Spices', 
      subtitle: 'Authentic Indian masalas',
      color: 'from-red-400 to-red-600',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=300&fit=crop&crop=center'
    },
    { 
      icon: Shirt, 
      title: 'Ethnic Wear', 
      subtitle: 'Traditional Indian apparel',
      color: 'from-blue-400 to-blue-600',
      image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=300&fit=crop&crop=center'
    },
    { 
      icon: Sparkles, 
      title: 'Handicrafts', 
      subtitle: 'Exquisite handmade decor',
      color: 'from-purple-400 to-purple-600',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center'
    }
  ];

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-green-200/30 to-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-orange-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-16 lg:py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div 
              className="inline-flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-2 rounded-full text-sm font-medium shadow-lg"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              ✨ YOUR ONLINE INDIAN MARKETPLACE
            </motion.div>

            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Discover the{' '}
                <br />
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Authentic
                </span>
                <br />
                Treasures of India
              </h1>
            </motion.div>
            
            {/* Subtitle */}
            <motion.p 
              className="text-xl text-gray-600 leading-relaxed max-w-lg font-light"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              From aromatic spices to handcrafted apparel, find all your favorite Indian products in one place. We bring the heart of India to your doorstep.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <motion.button 
                onClick={() => navigate('/products')}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-2xl font-semibold text-base shadow-xl hover:shadow-2xl transition-all duration-300"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Shop Now
                </div>
              </motion.button>
              
              <motion.button 
                onClick={() => navigate('/products')}
                className="bg-white text-gray-700 px-8 py-4 rounded-2xl font-semibold text-base border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-lg transition-all duration-300"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Explore Categories
              </motion.button>
            </motion.div>

            {/* Hero Image for Mobile */}
            <motion.div
              className="lg:hidden mt-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <img 
                src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&h=400&fit=crop&crop=center"
                alt="Indian Marketplace"
                className="w-full h-64 object-cover rounded-3xl shadow-2xl"
              />
            </motion.div>
          </motion.div>

          {/* Right Content - Category Grid */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hidden lg:grid grid-cols-2 gap-4"
          >
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.03, y: -8 }}
                className="group relative overflow-hidden bg-white rounded-3xl cursor-pointer transition-all duration-500 shadow-lg hover:shadow-2xl border border-gray-100"
                onClick={() => navigate('/products')}
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img 
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-80 group-hover:opacity-70 transition-opacity duration-300`}></div>
                </div>

                {/* Content */}
                <div className="relative z-10 p-6 h-40 flex flex-col justify-end">
                  <div className="mb-3 opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                    <category.icon className="w-8 h-8 text-white mb-2" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-1 group-hover:translate-y-[-2px] transition-transform duration-300">
                    {category.title}
                  </h3>
                  <p className="text-white/90 text-sm font-medium group-hover:translate-y-[-2px] transition-transform duration-300">
                    {category.subtitle}
                  </p>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;