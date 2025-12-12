import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Instagram, Sparkles } from 'lucide-react';

interface InstagramPost {
  id: string;
  embed_html: string;
  caption: string;
}

const InstagramCarousel = () => {
  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [api, setApi] = useState<CarouselApi | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchInstagramPosts();
  }, []);

  const fetchInstagramPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('instagram_posts')
        .select('id, embed_html, caption')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setInstagramPosts(data || []);
    } catch (error) {
      console.error('Error fetching Instagram posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Set up the API reference
  useEffect(() => {
    if (!api) {
      return;
    }

    // Auto-scroll functionality
    const startAutoScroll = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        if (api) {
          api.scrollNext();
        }
      }, 4000); // Auto-scroll every 4 seconds
    };

    startAutoScroll();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [api]);

  // Load Instagram embed script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//www.instagram.com/embed.js';
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      if (window.instgrm) {
        // @ts-ignore
        window.instgrm.Embeds.process();
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [instagramPosts]);

  if (loading) {
    return (
      <section className="py-24 bg-[#FFFDF7] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-[#8B2131] mb-4 block">
              @RAJLUXMI
            </span>
            <div className="flex items-center justify-center gap-2 mb-4">
              <h2 className="text-3xl md:text-5xl font-serif text-[#2C1810]">
                Trending on Instagram
              </h2>
            </div>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B2131]"></div>
          </div>
        </div>
      </section>
    );
  }

  if (instagramPosts.length === 0) {
    return null;
  }

  return (
    <section className="py-24 bg-[#FFFDF7] relative overflow-hidden">
      {/* Royal Background Accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FFEBE8] rounded-full filter blur-[100px] opacity-60 pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#E6D5B8] rounded-full filter blur-[100px] opacity-30 pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

      <div className="max-w-[1600px] mx-auto px-6 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-12 h-[1px] bg-[#8B2131]"></span>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#8B2131]">Social Media</span>
            <span className="w-12 h-[1px] bg-[#8B2131]"></span>
          </div>

          <h2 className="text-4xl md:text-6xl font-serif text-[#2C1810] mb-6">
            Follow Our Delightful Journey
          </h2>

          <p className="text-lg text-[#5D4037] max-w-2xl mx-auto font-light leading-relaxed">
            Join our community of sweet lovers and stay updated with our latest creations
          </p>
        </motion.div>

        {/* Instagram Carousel */}
        <div className="max-w-7xl mx-auto">
          <Carousel
            setApi={setApi}
            opts={{
              align: "center",
              loop: true,
            }}
            className="w-full"
            onMouseEnter={() => {
              if (intervalRef.current) clearInterval(intervalRef.current);
            }}
            onMouseLeave={() => {
              if (intervalRef.current) clearInterval(intervalRef.current);
              intervalRef.current = setInterval(() => {
                if (api) api.scrollNext();
              }, 4000);
            }}
          >
            <CarouselContent className="-ml-4">
              {instagramPosts.map((post) => (
                <CarouselItem key={post.id} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <motion.div
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-[#F5E6D3] h-full"
                    whileHover={{ y: -5 }}
                  >
                    <div className="relative group">
                      <div className="aspect-square overflow-hidden bg-gray-50 flex items-center justify-center">
                        <div dangerouslySetInnerHTML={{ __html: post.embed_html }} className="w-full h-full flex items-center justify-center [&>iframe]:!w-full [&>iframe]:!h-full [&>iframe]:!border-0" />
                        {/* Overlay for interaction hint */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
                      </div>
                    </div>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Custom Navigation */}
            <div className="hidden md:block">
              <CarouselPrevious className="left-[-50px] w-12 h-12 border-[#E6D5B8] bg-transparent hover:bg-[#8B2131] hover:text-white hover:border-[#8B2131] transition-all duration-300 text-[#2C1810]" />
              <CarouselNext className="right-[-50px] w-12 h-12 border-[#E6D5B8] bg-transparent hover:bg-[#8B2131] hover:text-white hover:border-[#8B2131] transition-all duration-300 text-[#2C1810]" />
            </div>
          </Carousel>
        </div>

        {/* Instagram Profile Link */}
        <div className="text-center mt-16">
          <a
            href="https://www.instagram.com/rajluxmi"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 bg-[#2C1810] text-white px-8 py-3 rounded-none text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#8B2131] transition-all duration-300"
          >
            <Instagram className="w-4 h-4" />
            <span>Follow @rajluxmi</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default InstagramCarousel;