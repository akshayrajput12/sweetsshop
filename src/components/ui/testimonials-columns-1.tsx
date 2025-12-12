"use client";
import React from "react";
import { motion } from "framer-motion";
import { Testimonial } from "@/data/testimonials";

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {/* Create two sets of testimonials for infinite scrolling effect */}
        {[...new Array(2)].map((_, index) => (
          // Using a div instead of React.Fragment to avoid prop warnings
          <div key={`testimonial-set-${index}`}>
            {props.testimonials.map(({ id, text, image, name, role, company }, i) => {
              const key = `testimonial-${index}-${i}`;
              return (
                <div
                  key={key}
                  className="p-8 rounded-xl border border-[#F5E6D3] shadow-sm hover:shadow-md transition-shadow duration-300 max-w-xs w-full bg-white flex flex-col justify-between"
                >
                  <div className="relative">
                    {/* Quote Icon */}
                    <span className="absolute -top-4 -left-2 text-6xl text-[#E6D5B8] opacity-30 font-serif leading-none">"</span>
                    <p className="text-[#5D4037] relative z-10 italic leading-relaxed pt-4 font-light">{text}</p>
                  </div>

                  <div className="flex items-center gap-4 mt-8 pt-6 border-t border-[#F5E6D3]/50">
                    <img
                      width={48}
                      height={48}
                      src={image}
                      alt={name}
                      className="h-12 w-12 rounded-full object-cover border border-[#E6D5B8]"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
                      }}
                    />
                    <div className="flex flex-col">
                      <div className="font-serif font-medium text-lg text-[#2C1810]">{name}</div>
                      <div className="text-xs uppercase tracking-wider text-[#8B2131] opacity-80">
                        {role}{company ? `, ${company}` : ''}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </motion.div>
    </div>
  );
};