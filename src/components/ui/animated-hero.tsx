import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight, PhoneCall, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const navigate = useNavigate();
  
  const titles = useMemo(
    () => ["delicious", "premium", "authentic", "artisanal", "irresistible"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full">
      <div className="container mx-auto">
        <div className="flex gap-8 py-10 lg:py-20 items-center justify-center flex-col">
          <div>
            <Button variant="secondary" size="sm" className="gap-4">
              New Collection <MoveRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular">
              <span className="text-white">Discover </span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold text-orange-500"
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
              <span className="text-white"> sweets</span>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-gray-300 max-w-2xl text-center">
              Indulge in our premium collection of traditional and artisanal sweets, crafted with love and the finest ingredients.
            </p>
          </div>
          <div className="flex flex-row gap-3">
            <Button 
              size="lg" 
              className="gap-4 bg-white text-black hover:bg-gray-200"
              variant="outline"
              onClick={() => navigate('/contact')}
            >
              Contact Us <PhoneCall className="w-4 h-4" />
            </Button>
            <Button 
              size="lg" 
              className="gap-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              onClick={() => navigate('/products')}
            >
              Shop Now <ShoppingCart className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };