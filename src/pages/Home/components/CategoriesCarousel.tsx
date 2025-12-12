import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

interface Category {
  id: string;
  name: string;
  image_url: string;
  description: string;
}

const CategoriesCarousel = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [api, setApi] = useState<CarouselApi>();

  // Auto-scroll logic
  useEffect(() => {
    if (!api) return;

    const intervalId = setInterval(() => {
      api.scrollNext();
    }, 4000);

    return () => clearInterval(intervalId);
  }, [api]);

  // Fallback images matching the luxury sweets aesthetic
  const fallbacks = [
    'https://images.unsplash.com/photo-1599354607481-99c75a02797e?auto=format&fit=crop&q=80', // Sweets
    'https://images.unsplash.com/photo-1605196377314-e575aa975b9f?auto=format&fit=crop&q=80', // Ladoo
    'https://images.unsplash.com/photo-1517244683847-7456b63c5d69?auto=format&fit=crop&q=80', // Cake/Dessert
    'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&q=80', // Indian Sweets
    'https://images.unsplash.com/photo-1569383746724-6f1b88e9c906?auto=format&fit=crop&q=80', // Gulab Jamun
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category: Category) => {
    navigate(`/products?category=${category.name.toLowerCase()}`);
  };

  if (loading) {
    return (
      <section className="py-20 bg-[#FAF9F6]">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-40">
            <div className="w-8 h-8 border-2 border-[#783838] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-[#FAF9F6]">
      <div className="w-full max-w-[1800px] mx-auto px-4 md:px-8 lg:px-12">

        {/* Section Title - Minimal */}
        <div className="flex flex-col items-center justify-center mb-16 space-y-4">
          <span className="text-xs uppercase tracking-[0.3em] text-[#9B4E4E] font-medium">Curated For You</span>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#783838]">
            The Collections
          </h2>
          <div className="w-24 h-1 bg-[#B38B46]/30 mt-4"></div>
        </div>

        {/* Categories Carousel */}
        <div className="relative px-4 md:px-12">
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {categories.map((category, index) => (
                <CarouselItem key={category.id} className="pl-4 basis-[70%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                  >
                    <div
                      className="group relative h-[400px] md:h-[500px] overflow-hidden cursor-pointer rounded-sm"
                      onClick={() => handleCategoryClick(category)}
                    >
                      {/* Image */}
                      <div className="absolute inset-0 bg-gray-200">
                        <img
                          src={category.image_url || fallbacks[index % fallbacks.length]}
                          alt={category.name}
                          className="w-full h-full object-cover transition-transform duration-[1.5s] ease-in-out group-hover:scale-110"
                        />
                      </div>

                      {/* Overlay - Gradient always present for readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#2E1212]/80 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />

                      {/* Category Name */}
                      <div className="absolute bottom-8 left-0 right-0 text-center px-4">
                        <h3 className="font-serif text-[#FAF9F6] text-xl md:text-2xl tracking-wider transition-all duration-500 group-hover:-translate-y-2">
                          {category.name}
                        </h3>
                        <span className="inline-block mt-2 text-xs text-[#B38B46] uppercase tracking-widest opacity-0 transform translate-y-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
                          View Collection
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-12 border-[#D4B6A2]/30 bg-transparent hover:bg-[#783838] text-[#783838] hover:text-white transition-colors" />
            <CarouselNext className="hidden md:flex -right-12 border-[#D4B6A2]/30 bg-transparent hover:bg-[#783838] text-[#783838] hover:text-white transition-colors" />
          </Carousel>
        </div>

      </div>
    </section>
  );
};

export default CategoriesCarousel;