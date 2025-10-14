import React from 'react';
import { Button } from '@/components/ui/button';
import { MoveRight, PhoneCall, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import heroImage from '@/assets/hero.png';
import BgImage from '@/assets/hero.webp';
import { motion } from 'framer-motion';

const CuratedGiftingHero = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative min-h-[60vh] md:min-h-[70vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={BgImage} 
          alt="Curated Gifting by Anand" 
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Overlay to enhance text readability - darker overlay */}
      <div className="absolute inset-0 bg-black/50 z-10"></div>

      <div className="container mx-auto px-4 py-8 lg:py-12 h-full relative z-20">
        <div className="flex flex-col lg:flex-row items-center justify-between min-h-[50vh] md:min-h-[60vh] gap-6">
          {/* Left Section - Hero Image - Hidden on mobile */}
          <div className="hidden lg:flex flex-1 w-full justify-center">
            <motion.div 
              className="relative w-full max-w-lg h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden shadow-2xl"
              whileHover={{
                scale: 1.03,
                borderRadius: "50%",
                transition: { duration: 0.5 }
              }}
            >
              <img 
                src={heroImage} 
                alt="Curated Gifting by Anand" 
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
          
          {/* Right Section - Text & CTA */}
          <div className="flex-1 w-full flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="max-w-lg space-y-4">
              <motion.div 
                className="inline-block"
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.3 }
                }}
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
              >
                Curated <span className="text-amber-400">Gifting</span> by SuperSweets
              </motion.h1>
              
              <motion.p 
                className="text-base md:text-lg text-gray-200 leading-relaxed"
                whileHover={{
                  scale: 1.01,
                  transition: { duration: 0.3 }
                }}
              >
                Exquisite handcrafted sweets and delicacies, thoughtfully arranged in elegant gift boxes for your most cherished moments.
              </motion.p>
              
              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <motion.div
                  whileHover={{
                    scale: 1.05,
                    transition: { duration: 0.3 }
                  }}
                  whileTap={{ scale: 0.95 }}
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
                >
                  <Button 
                    size="default" 
                    className="gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-6 py-4 text-base rounded-xl"
                    onClick={() => navigate('/products')}
                  >
                    View Collection <ShoppingCart className="w-4 h-4" />
                  </Button>
                </motion.div>
              </div>
              
              <motion.div 
                className="pt-4 text-gray-300 italic text-sm"
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
              >
                "Crafted with tradition, presented with elegance"
              </motion.div>
            </div>
          </div>
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
      
      {/* Wave SVG at the bottom of the hero section */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
          <path 
            fill="#b4c6b2" 
            fillOpacity="1" 
            d="M0,0L48,48C96,96,192,192,288,197.3C384,203,480,117,576,85.3C672,53,768,75,864,112C960,149,1056,203,1152,197.3C1248,192,1344,128,1392,96L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
    </section>
  );
};

export default CuratedGiftingHero;