import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MoveRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import hero2 from '@/assets/hero4.jpg';
import hero3 from '@/assets/hero3.jpg';
import hero1 from '@/assets/hero5.jpg';
import { motion, AnimatePresence } from 'framer-motion';

// Defined slider data with the requested headline as the primary slide
const sliderData = [
  {
    id: 1,
    title: "Rajalakshmi",
    subtitle: "Royal Sweets Crafted With Heritage",
    description: "Experience the authentic taste of royalty with our premium handcrafted sweets, made from generations-old recipes.",
    ctaText: "Shop Now",
    secondaryCta: "Explore Hampers",
    image: hero1
  },
  {
    id: 2,
    title: "Exquisite Gifting",
    subtitle: "The Art of Giving",
    description: "Curated gift boxes that exude elegance and taste, perfect for celebrating life's most precious moments.",
    ctaText: "View Collection",
    secondaryCta: "Custom Box",
    image: hero2
  },
  {
    id: 3,
    title: "Festive Collections",
    subtitle: "Celebrations Refined",
    description: "Elevate your festivities with our limited edition sweets, crafted to bring joy and grandeur to your home.",
    ctaText: "Shop Festive",
    secondaryCta: "Bulk Orders",
    image: hero3
  }
];

const CuratedGiftingHero = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % sliderData.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const currentSlideData = sliderData[currentSlide];

  return (
    <section className="relative min-h-[85vh] w-full overflow-hidden bg-hero-bg">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          className="absolute inset-0 z-0"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <img
            src={currentSlideData.image}
            alt={currentSlideData.title}
            className="w-full h-full object-cover"
            loading={currentSlide === 0 ? "eager" : "lazy"}
          />

          {/* Brand Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#190808]/90 via-[#421B1B]/40 to-transparent z-10" />
          <div className="absolute inset-0 bg-black/20 z-10" />
        </motion.div>
      </AnimatePresence>

      <div className="container mx-auto px-4 h-full relative z-20 flex flex-col justify-center min-h-[85vh]">
        <div className="max-w-4xl space-y-8 pt-20">
          {/* Badge/Subtitle */}
          <motion.div
            key={`sub-${currentSlideData.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center space-x-2 border-l-4 border-secondary pl-4"
          >
            <span className="text-secondary tracking-[0.2em] uppercase text-sm md:text-base font-semibold">
              {currentSlideData.subtitle}
            </span>
          </motion.div>

          {/* Title */}
          <motion.div
            key={`title-${currentSlideData.id}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-light text-white leading-tight font-sans">
              {currentSlideData.title}
            </h1>
          </motion.div>

          {/* Description */}
          <motion.p
            key={`desc-${currentSlideData.id}`}
            className="text-lg md:text-xl text-gray-200 max-w-2xl font-light leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {currentSlideData.description}
          </motion.p>

          {/* CTAs */}
          <motion.div
            key={`cta-${currentSlideData.id}`}
            className="flex flex-col sm:flex-row gap-4 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Button
              onClick={() => navigate('/products')}
              className="bg-primary hover:bg-primary-hover text-white text-lg px-8 py-6 rounded-none border border-primary transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              {currentSlideData.ctaText}
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate('/products?category=hampers')}
              className="bg-transparent border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-6 rounded-none transition-all duration-300"
            >
              {currentSlideData.secondaryCta} <MoveRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-12 right-4 md:right-12 flex space-x-3 z-30">
          {sliderData.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-1 transition-all duration-500 rounded-full ${index === currentSlide ? 'w-12 bg-secondary' : 'w-4 bg-white/30 hover:bg-white/60'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CuratedGiftingHero;