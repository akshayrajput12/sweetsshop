import { supabase } from '@/integrations/supabase/client';

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string | null;
  image: string;
  text: string;
}

export const fetchTestimonials = async (): Promise<Testimonial[]> => {
  const { data, error } = await supabase
    .from('testimonials')
    .select('id, name, role, company, image_url, text')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }

  return data.map(testimonial => ({
    id: testimonial.id,
    name: testimonial.name,
    role: testimonial.role,
    company: testimonial.company,
    image: testimonial.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=random`,
    text: testimonial.text
  }));
};

export const testimonials = [
  {
    text: "The supplements have transformed my workout routine. I've seen incredible gains in energy and muscle recovery since I started using these products.",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop&crop=faces",
    name: "Alex Johnson",
    role: "Fitness Enthusiast",
  },
  {
    text: "As a personal trainer, I'm very selective about what I recommend to my clients. These supplements are top-notch quality and deliver real results.",
    image: "https://images.unsplash.com/photo-1567532939604-b6b5b0e1607d?w=150&h=150&fit=crop&crop=faces",
    name: "Sarah Williams",
    role: "Certified Trainer",
  },
  {
    text: "The protein powders taste amazing and mix perfectly. My clients love the variety of flavors and the quick delivery service.",
    image: "https://images.unsplash.com/photo-1563375853373-15b7816d3c3d?w=150&h=150&fit=crop&crop=faces",
    name: "Michael Chen",
    role: "Nutritionist",
  },
  {
    text: "I've tried many supplement brands, but this one stands out for its purity and effectiveness. My performance has improved significantly.",
    image: "https://images.unsplash.com/photo-1549476464-37392f717541?w=150&h=150&fit=crop&crop=faces",
    name: "Emma Rodriguez",
    role: "Marathon Runner",
  },
  {
    text: "The pre-workout gives me the energy boost I need without any jitters. It's become an essential part of my daily routine.",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=150&h=150&fit=crop&crop=faces",
    name: "David Thompson",
    role: "CrossFit Athlete",
  },
  {
    text: "Excellent customer service and fast shipping. The quality of the products matches the high standards I expect for my gym.",
    image: "https://images.unsplash.com/photo-1567532939604-b6b5b0e1607d?w=150&h=150&fit=crop&crop=faces",
    name: "Jennifer Park",
    role: "Gym Owner",
  },
  {
    text: "The vegan protein options are fantastic. As a plant-based athlete, it's hard to find quality supplements, but these exceed my expectations.",
    image: "https://images.unsplash.com/photo-1519351414974-61d8e594c5d6?w=150&h=150&fit=crop&crop=faces",
    name: "Ryan Kim",
    role: "Plant-Based Athlete",
  },
  {
    text: "I appreciate the transparent labeling and third-party testing. It gives me confidence that I'm putting quality products in my body.",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop&crop=faces",
    name: "Lisa Anderson",
    role: "Health Coach",
  },
  {
    text: "The BCAAs have helped with my recovery time between workouts. I feel less sore and can train more consistently now.",
    image: "https://images.unsplash.com/photo-1549476464-37392f717541?w=150&h=150&fit=crop&crop=faces",
    name: "James Wilson",
    role: "Bodybuilder",
  },
];