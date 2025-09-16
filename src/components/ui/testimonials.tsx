import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { fetchTestimonials, Testimonial } from "@/data/testimonials";

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        const data = await fetchTestimonials();
        setTestimonials(data);
      } catch (error) {
        console.error("Error loading testimonials:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTestimonials();
  }, []);

  if (loading) {
    return (
      <section className="my-20 relative bg-gradient-to-br from-white to-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center max-w-[540px] mx-auto">
            <div className="flex justify-center">
              <div className="border py-1 px-4 rounded-full text-sm font-medium bg-white shadow-sm">Testimonials</div>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mt-5 text-center text-gray-900">
              What our customers say
            </h2>
            <p className="text-center mt-5 text-gray-600 max-w-md">
              Hear from fitness enthusiasts who have transformed their health with our premium supplements.
            </p>
          </div>

          <div className="flex justify-center gap-4 md:gap-6 mt-16 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
            <div className="flex flex-col gap-6 pb-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-6 rounded-3xl border shadow-lg shadow-primary/10 max-w-xs w-full bg-white animate-pulse">
                  <div className="h-20 bg-gray-200 rounded mb-4"></div>
                  <div className="flex items-center gap-2 mt-5">
                    <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                    <div className="flex flex-col">
                      <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

  const firstColumn = testimonials.slice(0, 3);
  const secondColumn = testimonials.slice(3, 6);
  const thirdColumn = testimonials.slice(6, 9);

  return (
    <section className="my-20 relative bg-gradient-to-br from-white to-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
        >
          <div className="flex justify-center">
            <div className="border py-1 px-4 rounded-full text-sm font-medium bg-white shadow-sm">Testimonials</div>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mt-5 text-center text-gray-900">
            What our customers say
          </h2>
          <p className="text-center mt-5 text-gray-600 max-w-md">
            Hear from fitness enthusiasts who have transformed their health with our premium supplements.
          </p>
        </motion.div>

        <div className="flex justify-center gap-4 md:gap-6 mt-16 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;