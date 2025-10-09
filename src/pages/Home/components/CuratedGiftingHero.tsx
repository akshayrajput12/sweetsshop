import React from 'react';
import { Button } from '@/components/ui/button';
import { MoveRight, PhoneCall, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import heroImage from '@/assets/hero.png';
import BgImage from '@/assets/hero.webp';

const CuratedGiftingHero = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={BgImage} 
          alt="Curated Gifting by Anand" 
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Overlay to enhance text readability */}
      <div className="absolute inset-0 bg-[#0a1a45]/70 z-10"></div>

      <div className="container mx-auto px-4 py-8 lg:py-12 h-full relative z-20">
        <div className="flex flex-col lg:flex-row items-center justify-between min-h-[80vh] gap-8">
          {/* Left Section - Hero Image */}
          <div className="flex-1 w-full flex justify-center">
            <div className="relative w-full max-w-2xl h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={heroImage} 
                alt="Curated Gifting by Anand" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Right Section - Text & CTA */}
          <div className="flex-1 w-full flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="max-w-lg space-y-6">
              <div className="inline-block">
                <Button variant="secondary" size="sm" className="gap-2 bg-amber-500 hover:bg-amber-600 text-white">
                  Premium Collection <MoveRight className="w-4 h-4" />
                </Button>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
                Curated <span className="text-amber-400">Gifting</span> by SuperSweets
              </h1>
              
              <p className="text-lg md:text-xl text-gray-200 leading-relaxed">
                Exquisite handcrafted sweets and delicacies, thoughtfully arranged in elegant gift boxes for your most cherished moments.
              </p>
              
              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  className="gap-3 bg-white text-[#0a1a45] hover:bg-gray-100 font-semibold px-8 py-6 text-lg"
                  onClick={() => navigate('/contact')}
                >
                  Enquire Now <PhoneCall className="w-5 h-5" />
                </Button>
                <Button 
                  size="lg" 
                  className="gap-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-8 py-6 text-lg"
                  onClick={() => navigate('/products')}
                >
                  View Collection <ShoppingCart className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="pt-6 text-gray-300 italic">
                "Crafted with tradition, presented with elegance"
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-20"></div>
    </section>
  );
};

export default CuratedGiftingHero;