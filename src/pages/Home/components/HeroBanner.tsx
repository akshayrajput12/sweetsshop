import React from 'react';
import { Hero } from '@/components/ui/animated-hero';
import Image from '/src/assets/hero.webp'

const HeroBanner = () => {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={Image} 
          alt="SuperSweets Background" 
          className="w-full h-full object-cover"
        />
      </div>

      <div className="container mx-auto px-4 py-8 lg:py-12 relative z-10">
        <div className="flex justify-center items-center min-h-[60vh]">
          {/* Centered Animated Hero */}
          <div className="flex items-center justify-center w-full">
            <Hero />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;