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
    text: "The gulab jamuns are absolutely divine! They're the perfect balance of sweetness and texture. My family can't get enough of them.",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop&crop=faces",
    name: "Priya Sharma",
    role: "Sweet Enthusiast",
  },
  {
    text: "I ordered the assorted sweets box for Diwali and everyone was impressed. The quality and presentation were exceptional!",
    image: "https://images.unsplash.com/photo-1567532939604-b6b5b0e1607d?w=150&h=150&fit=crop&crop=faces",
    name: "Rajesh Patel",
    role: "Corporate Client",
  },
  {
    text: "As a vegan, I was thrilled to find such delicious plant-based sweets. The coconut ladoos are my new favorite treat!",
    image: "https://images.unsplash.com/photo-1563375853373-15b7816d3c3d?w=150&h=150&fit=crop&crop=faces",
    name: "Ananya Desai",
    role: "Vegan Food Blogger",
  },
  {
    text: "The chocolate truffle cake was the highlight of my daughter's birthday party. Everyone asked where I got it from!",
    image: "https://images.unsplash.com/photo-1549476464-37392f717541?w=150&h=150&fit=crop&crop=faces",
    name: "Meera Iyer",
    role: "Mother of Two",
  },
  {
    text: "I've tried sweets from many places, but Sweet Delights stands out for freshness and authentic taste. Their kaju katli is unmatched!",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=150&h=150&fit=crop&crop=faces",
    name: "Vikram Singh",
    role: "Food Critic",
  },
  {
    text: "Excellent customer service and fast delivery. The sweets arrived fresh and well-packaged. Will definitely order again!",
    image: "https://images.unsplash.com/photo-1567532939604-b6b5b0e1607d?w=150&h=150&fit=crop&crop=faces",
    name: "Sunita Reddy",
    role: "Regular Customer",
  },
  {
    text: "The seasonal fruit cake was a hit at our office party. Moist, flavorful, and beautifully decorated. Highly recommended!",
    image: "https://images.unsplash.com/photo-1519351414974-61d8e594c5d6?w=150&h=150&fit=crop&crop=faces",
    name: "Arjun Malhotra",
    role: "Event Planner",
  },
  {
    text: "I appreciate the transparent labeling and quality ingredients. It's clear that these sweets are made with care and love.",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop&crop=faces",
    name: "Kavita Nair",
    role: "Health-Conscious Parent",
  },
  {
    text: "The rasgullas are the best I've ever had - soft, spongy, and perfectly sweet. They remind me of my grandmother's recipe!",
    image: "https://images.unsplash.com/photo-1549476464-37392f717541?w=150&h=150&fit=crop&crop=faces",
    name: "Deepak Bose",
    role: "Bengali Cuisine Lover",
  },
];