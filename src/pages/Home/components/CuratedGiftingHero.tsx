import React from 'react';
import { Button } from '@/components/ui/button';
import { MoveRight, PhoneCall, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BgImage from '@/assets/hero.webp';
import { motion } from 'framer-motion';

const CuratedGiftingHero = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative min-h-[50vh] md:min-h-[60vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <motion.img 
          src={BgImage} 
          alt="Curated Gifting by Anand" 
          className="w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8 }}
        />
      </div>
      
      {/* Overlay to enhance text readability - darker overlay */}
      <div className="absolute inset-0 bg-black/50 z-10"></div>

      <div className="container mx-auto px-4 py-8 lg:py-12 h-full relative z-20 flex flex-col items-center justify-center min-h-[50vh] md:min-h-[60vh]">
        <div className="max-w-2xl text-center space-y-6">
          <motion.div 
            className="inline-block"
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.3 }
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button variant="secondary" size="sm" className="gap-2 bg-amber-500 hover:bg-amber-600 text-white">
              Premium Collection <MoveRight className="w-4 h-4" />
            </Button>
          </motion.div>
          
          <motion.h1 
            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white"
            whileHover={{
              scale: 1.02,
              transition: { duration: 0.3 }
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Curated <span className="text-amber-400">Gifting</span> by SuperSweets
          </motion.h1>
          
          <motion.p 
            className="text-base md:text-lg text-gray-200 leading-relaxed"
            whileHover={{
              scale: 1.01,
              transition: { duration: 0.3 }
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Exquisite handcrafted sweets and delicacies, thoughtfully arranged in elegant gift boxes for your most cherished moments.
          </motion.p>
          
          <motion.div 
            className="pt-4 flex flex-col sm:flex-row gap-3 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <motion.div
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Button 
                size="default" 
                className="gap-2 bg-white text-[#0a1a45] hover:bg-gray-100 font-semibold px-6 py-4 text-base rounded-xl"
                onClick={() => navigate('/contact')}
              >
                Enquire Now <PhoneCall className="w-4 h-4" />
              </Button>
            </motion.div>
            <motion.div
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Button 
                size="default" 
                className="gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-6 py-4 text-base rounded-xl"
                onClick={() => navigate('/products')}
              >
                View Collection <ShoppingCart className="w-4 h-4" />
              </Button>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="pt-4 text-gray-300 italic text-sm"
            whileHover={{
              scale: 1.02,
              transition: { duration: 0.3 }
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            "Crafted with tradition, presented with elegance"
          </motion.div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <motion.div 
        className="absolute top-0 right-0 w-48 h-48 bg-amber-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-20"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute bottom-0 left-0 w-48 h-48 bg-rose-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-20"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.2, 0.25, 0.2],
        }}
        transition={{
          duration: 5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 1
        }}
      />
      
      {/* Wave SVG at the bottom of the hero section with reduced height and festival colors */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 160" className="w-full h-auto">
          <path 
            fill="url(#waveGradient)" 
            fillOpacity="1" 
            d="M0,0L48,48C96,96,192,192,288,197.3C384,203,480,117,576,85.3C672,53,768,75,864,112C960,149,1056,203,1152,197.3C1248,192,1344,128,1392,96L1440,64L1440,160L1392,160C1344,160,1248,160,1152,160C1056,160,960,160,864,160C768,160,672,160,576,160C480,160,384,160,288,160C192,160,96,160,48,160L0,160Z"
          ></path>
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f87171" /> {/* red-400 */}
              <stop offset="50%" stopColor="#fbbf24" /> {/* yellow-400 */}
              <stop offset="100%" stopColor="#f97316" /> {/* orange-400 */}
            </linearGradient>
          </defs>
        </svg>
      </div>
    </section>
  );
};

export default CuratedGiftingHero;