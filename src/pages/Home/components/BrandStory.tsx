import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselPrevious, 
  CarouselNext 
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';

// Timeline data with images
const timelineData = [
  {
    year: "1975",
    title: "A Sweet Dream",
    description: "The idea of creating authentic, traditional sweets was born in the heart of our founder, envisioning a legacy of taste and tradition.",
    image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&h=400&fit=crop"
  },
  {
    year: "1977",
    title: "First Sweet Shop",
    description: "With passion and dedication, we opened our first retail outlet, bringing homemade delicacies to the local community.",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&h=400&fit=crop"
  },
  {
    year: "1985",
    title: "Growing Popularity",
    description: "Our commitment to quality and authentic flavors gained recognition, leading to expansion across the region.",
    image: "https://images.unsplash.com/photo-1551783743-65384d0a48da?w=400&h=400&fit=crop"
  },
  {
    year: "1995",
    title: "Regional Recognition",
    description: "Awarded 'Best Sweet Shop' by the regional food council for our exceptional quality and traditional recipes.",
    image: "https://images.unsplash.com/photo-1565911220-e15b29be8c8f?w=400&h=400&fit=crop"
  },
  {
    year: "2005",
    title: "Citywide Presence",
    description: "With growing popularity, we expanded to multiple locations across the city, serving more sweet lovers.",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop"
  },
  {
    year: "2015",
    title: "Modern Brand Identity",
    description: "We refreshed our brand identity to reflect our modern approach while honoring our rich heritage.",
    image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&h=400&fit=crop"
  },
  {
    year: "2020",
    title: "Digital Transformation",
    description: "Launched our online store and introduced new fusion recipes to delight younger generations while preserving tradition.",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&h=400&fit=crop"
  },
  {
    year: "2025",
    title: "48+ Years of Excellence",
    description: "With over four decades of experience, we continue our commitment to quality, tradition, and innovation in every sweet.",
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=400&fit=crop"
  }
];

const BrandStory = () => {
  // Updated modern shapes for cards with smoother edges
  const cardShapes = [
    "polygon(10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px), 0 10px)", // Rounded rectangle
    "polygon(20px 0, calc(100% - 20px) 0, 100% 20px, 100% calc(100% - 20px), calc(100% - 20px) 100%, 20px 100%, 0 calc(100% - 20px), 0 20px)", // More rounded rectangle
    "polygon(0 0, 100% 0, 100% 70%, 70% 70%, 70% 100%, 0 100%)", // Modern L-shape
    "polygon(0 0, 100% 0, 100% 100%, 30% 100%, 30% 70%, 0 70%)", // Reversed L-shape
    "polygon(15px 0, calc(100% - 15px) 0, 100% 15px, 100% calc(100% - 15px), calc(100% - 15px) 100%, 15px 100%, 0 calc(100% - 15px), 0 15px)", // Soft rectangle
    "polygon(0 0, 100% 0, 100% 100%, 25% 100%, 25% 75%, 0 75%)", // Step shape
    "polygon(0 0, 100% 0, 100% 75%, 80% 75%, 80% 100%, 0 100%)", // Reversed step
    "polygon(25px 0, calc(100% - 25px) 0, 100% 25px, 100% calc(100% - 25px), calc(100% - 25px) 100%, 25px 100%, 0 calc(100% - 25px), 0 25px)", // Very rounded rectangle
  ];

  return (
    <section className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-amber-50 to-rose-50">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-200 rounded-full mix-blend-soft-light filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-rose-200 rounded-full mix-blend-soft-light filter blur-3xl opacity-20"></div>
      </div>
      
      {/* Section header */}
      <div className="container mx-auto px-4 pt-20 pb-10 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <div className="border py-1 px-4 rounded-full text-sm font-medium bg-white/80 shadow-sm backdrop-blur-sm">
              Our Journey
            </div>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            The <span className="text-secondary">Sweet</span> Story
          </h2>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            From a dream in 1975 to a legacy of over 48 years, our journey has been as sweet as our creations
          </p>
        </div>
      </div>
      
      {/* Carousel Container */}
      <div className="container mx-auto px-4 relative">
        <Carousel
          opts={{
            align: "start",
            loop: false, // Changed to false to prevent circular loop
            dragFree: true,
            slidesToScroll: 1,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {timelineData.map((item, index) => (
              <CarouselItem key={index} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card 
                      className="relative h-auto min-h-[450px] overflow-hidden border-0 shadow-2xl flex flex-col"
                      style={{ 
                        clipPath: cardShapes[index % cardShapes.length],
                      }}
                    >
                      {/* Enhanced gradient background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-amber-50/70 to-rose-50/70"></div>
                      
                      {/* Decorative elements */}
                      <div className="absolute -top-8 -right-8 w-32 h-32 bg-amber-200 rounded-full mix-blend-soft-light filter blur-2xl opacity-30"></div>
                      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-rose-200 rounded-full mix-blend-soft-light filter blur-2xl opacity-30"></div>
                      
                      {/* Image with enhanced styling - Modified to show image in shape */}
                      <div className="relative h-2/5 w-full flex items-center justify-center p-4">
                        <div 
                          className="w-full h-full bg-cover bg-center rounded-2xl"
                          style={{ 
                            backgroundImage: `url(${item.image})`,
                            clipPath: cardShapes[index % cardShapes.length],
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-amber-900/20 to-transparent rounded-2xl"></div>
                        </div>
                      </div>
                      
                      {/* Content - Adjusted to prevent text cropping */}
                      <CardContent className="relative p-6 flex flex-col flex-grow">
                        {/* Year badge with enhanced styling */}
                        <div className="flex justify-center -mt-8 z-10">
                          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold text-lg shadow-lg transform rotate-3 border-4 border-white">
                            {item.year}
                          </div>
                        </div>
                        
                        <div className="text-center mt-2 flex-grow flex flex-col justify-center">
                          <h3 className="text-2xl font-bold mb-3 text-gray-800 drop-shadow-sm">
                            {item.title}
                          </h3>
                          <p className="text-gray-600 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                        
                        {/* Decorative bottom element */}
                        <div className="flex justify-center pt-4">
                          <div className="w-16 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"></div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex -left-12 bg-white/80 hover:bg-white border-amber-200" />
          <CarouselNext className="hidden sm:flex -right-12 bg-white/80 hover:bg-white border-amber-200" />
        </Carousel>
        
        {/* Progress indicator for mobile */}
        <div className="md:hidden absolute bottom-8 left-0 right-0 flex justify-center z-20">
          <div className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
            <div className="text-sm font-medium text-gray-700">Swipe to explore our journey</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandStory;