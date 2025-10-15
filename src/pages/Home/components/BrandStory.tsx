import React from 'react';
import { motion, easeOut, Variants } from 'framer-motion';
import { Heart, Award, Users, Leaf } from 'lucide-react';

const BrandStory = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: easeOut
      }
    }
  };

  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut" as any
    }
  };

  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/10">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-10 left-10 w-64 h-64 bg-amber-200 rounded-full mix-blend-soft-light filter blur-3xl opacity-30"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{
            duration: 6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-10 right-10 w-64 h-64 bg-rose-200 rounded-full mix-blend-soft-light filter blur-3xl opacity-30"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.35, 0.3],
          }}
          transition={{
            duration: 7,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.div 
            className="inline-block mb-4"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="border py-1 px-4 rounded-full text-sm font-medium bg-white shadow-sm">Our Journey</div>
          </motion.div>
          
          <motion.h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
          >
            The <span className="text-secondary">Sweet</span> Story
          </motion.h2>
          
          <motion.p 
            className="text-lg text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            From a small kitchen to a beloved brand, our journey has been as sweet as our creations
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Story Card 1 */}
          <motion.div 
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center relative overflow-hidden"
            variants={itemVariants}
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-rose-50 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            <motion.div 
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600 mb-6 relative z-10"
              animate={{
                y: [0, -10, 0],
                transition: {
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut" as any
                }
              }}
            >
              <Heart className="w-8 h-8" />
            </motion.div>
            <h3 className="text-xl font-bold mb-3 relative z-10">The Beginning</h3>
            <p className="text-gray-600 relative z-10">
              It all started with a passion for traditional sweets and a desire to bring authentic flavors to our community.
            </p>
          </motion.div>

          {/* Story Card 2 */}
          <motion.div 
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center relative overflow-hidden"
            variants={itemVariants}
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50 to-amber-50 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            <motion.div 
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 text-rose-600 mb-6 relative z-10"
              animate={{
                y: [0, -10, 0],
                transition: {
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut" as any,
                  delay: 0.5
                }
              }}
            >
              <Award className="w-8 h-8" />
            </motion.div>
            <h3 className="text-xl font-bold mb-3 relative z-10">Craftsmanship</h3>
            <p className="text-gray-600 relative z-10">
              We perfected our recipes using time-honored techniques passed down through generations of master confectioners.
            </p>
          </motion.div>

          {/* Story Card 3 */}
          <motion.div 
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center relative overflow-hidden"
            variants={itemVariants}
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-amber-50 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            <motion.div 
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-6 relative z-10"
              animate={{
                y: [0, -10, 0],
                transition: {
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut" as any,
                  delay: 1
                }
              }}
            >
              <Leaf className="w-8 h-8" />
            </motion.div>
            <h3 className="text-xl font-bold mb-3 relative z-10">Quality Focus</h3>
            <p className="text-gray-600 relative z-10">
              We source only the finest ingredients, ensuring every sweet meets our rigorous standards for taste and quality.
            </p>
          </motion.div>

          {/* Story Card 4 */}
          <motion.div 
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center relative overflow-hidden"
            variants={itemVariants}
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-rose-50 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            <motion.div 
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 text-purple-600 mb-6 relative z-10"
              animate={{
                y: [0, -10, 0],
                transition: {
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut" as any,
                  delay: 1.5
                }
              }}
            >
              <Users className="w-8 h-8" />
            </motion.div>
            <h3 className="text-xl font-bold mb-3 relative z-10">Community Love</h3>
            <p className="text-gray-600 relative z-10">
              Our customers' smiles and satisfaction drive us to innovate and create new delightful experiences every day.
            </p>
          </motion.div>
        </motion.div>

        <motion.div 
          className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-8 md:p-12 shadow-xl text-white relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjxjaXJjbGUgY3g9IjAlIiBjeT0iMCUiIHI9IjEwIiBmaWxsPSIjZmZmZmZmIi8+PGNpcmNsZSBjeD0iMTAwJSIgY3k9IjEwMCUiIHI9IjEwIiBmaWxsPSIjZmZmZmZmIi8+PGNpcmNsZSBjeD0iMTAwJSIgY3k9IjAlIiByPSIxMCIgZmlsbD0iI2ZmZmZmZiIvPjxjaXJjbGUgY3g9IjAlIiBjeT0iMTAwJSIgcj0iMTAiIGZpbGw9IiNmZmZmZmYiLz48L3N2Zz4=')] opacity-20"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <motion.h3 
              className="text-2xl md:text-3xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
            >
              Our Promise to You
            </motion.h3>
            
            <motion.p 
              className="text-lg mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              Every sweet we create carries our commitment to tradition, quality, and the joy of sharing something truly special with you and your loved ones.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 text-xl font-semibold">
                <span>— The SuperSweets Family</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BrandStory;