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
    year: "1999",
    title: "The Beginning",
    description: "Our journey started in a small kitchen with a passion for traditional sweets and authentic flavors.",
    image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&h=400&fit=crop"
  },
  {
    year: "2003",
    title: "First Launch",
    description: "We opened our first retail outlet, bringing our homemade delicacies to the local community.",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&h=400&fit=crop"
  },
  {
    year: "2007",
    title: "Expansion",
    description: "With growing popularity, we expanded to multiple locations across the city.",
    image: "https://images.unsplash.com/photo-1551783743-65384d0a48da?w=400&h=400&fit=crop"
  },
  {
    year: "2012",
    title: "Recognition",
    description: "Awarded 'Best Sweet Shop' by the regional food council for our exceptional quality.",
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=400&fit=crop"
  },
  {
    year: "2016",
    title: "Global Reach",
    description: "Our products began reaching international markets, spreading the taste of tradition worldwide.",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop"
  },
  {
    year: "2019",
    title: "Rebranding",
    description: "We refreshed our brand identity to reflect our modern approach while honoring our heritage.",
    image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&h=400&fit=crop"
  },
  {
    year: "2022",
    title: "Innovation",
    description: "Launched our online store and introduced new fusion recipes to delight younger generations.",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&h=400&fit=crop"
  },
  {
    year: "2025",
    title: "Future Vision",
    description: "Committed to sustainable practices and expanding our reach to more communities globally.",
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=400&fit=crop"
  }
];

const BrandStory = () => {
  // Crazy shapes for cards
  const cardShapes = [
    "polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)", // Parallelogram
    "polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)", // Reversed parallelogram
    "polygon(0% 15%, 15% 15%, 15% 0%, 85% 0%, 85% 15%, 100% 15%, 100% 85%, 85% 85%, 85% 100%, 15% 100%, 15% 85%, 0% 85%)", // Frame
    "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)", // Octagon
    "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)", // Pentagon
    "polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)", // Trapezoid
    "polygon(0% 0%, 100% 0%, 100% 75%, 75% 75%, 75% 100%, 50% 75%, 0% 75%)", // House shape
    "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)", // Octagonal
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
            From a small kitchen to a beloved brand, our journey has been as sweet as our creations
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
                      className="relative h-[450px] overflow-hidden border-0 shadow-2xl"
                      style={{ 
                        clipPath: cardShapes[index % cardShapes.length],
                      }}
                    >
                      {/* Enhanced gradient background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-amber-50/70 to-rose-50/70"></div>
                      
                      {/* Decorative elements */}
                      <div className="absolute -top-8 -right-8 w-32 h-32 bg-amber-200 rounded-full mix-blend-soft-light filter blur-2xl opacity-30"></div>
                      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-rose-200 rounded-full mix-blend-soft-light filter blur-2xl opacity-30"></div>
                      
                      {/* Image with enhanced styling */}
                      <div className="relative h-2/5 w-full overflow-hidden">
                        <div 
                          className="absolute inset-0 bg-cover bg-center"
                          style={{ backgroundImage: `url(${item.image})` }}
                        ></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-amber-900/20 to-transparent"></div>
                      </div>
                      
                      {/* Content */}
                      <CardContent className="relative p-6 h-3/5 flex flex-col justify-between">
                        {/* Year badge with enhanced styling */}
                        <div className="flex justify-center -mt-8 z-10">
                          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold text-lg shadow-lg transform rotate-3 border-4 border-white">
                            {item.year}
                          </div>
                        </div>
                        
                        <div className="text-center mt-2">
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