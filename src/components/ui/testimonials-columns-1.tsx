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
          <React.Fragment key={`testimonial-set-${index}`}>
            {props.testimonials.map(({ id, text, image, name, role, company }, i) => {
              const key = `testimonial-${index}-${i}`;
              return (
                <div 
                  key={key}
                  className="p-6 rounded-3xl border shadow-lg shadow-primary/10 max-w-xs w-full bg-white"
                >
                  <div className="text-gray-700">{text}</div>
                  <div className="flex items-center gap-2 mt-5">
                    <img
                      width={40}
                      height={40}
                      src={image}
                      alt={name}
                      className="h-10 w-10 rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
                      }}
                    />
                    <div className="flex flex-col">
                      <div className="font-medium tracking-tight leading-5 text-gray-900">{name}</div>
                      <div className="leading-5 opacity-60 tracking-tight text-gray-600">
                        {role}{company ? `, ${company}` : ''}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
};