import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Truck, Clock, Award } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Premium Quality',
    description: 'Only the finest cuts from trusted farms, ensuring exceptional taste and freshness in every order.',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Same-day delivery available with temperature-controlled vehicles to maintain optimal freshness.',
  },
  {
    icon: Clock,
    title: '24/7 Support',
    description: 'Round-the-clock customer support to assist you with orders, questions, and special requests.',
  },
  {
    icon: Award,
    title: 'Satisfaction Guaranteed',
    description: '100% satisfaction guarantee with easy returns and refunds if you\'re not completely happy.',
  },
];

const WhyChooseUs = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="heading-lg mb-4">Why Choose MeatE?</h2>
          <p className="body-text text-muted-foreground max-w-2xl mx-auto">
            We're committed to delivering the best meat shopping experience with unmatched quality and service.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="text-center group"
            >
              <motion.div 
                className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                whileHover={{ scale: 1.1 }}
              >
                <feature.icon className="w-8 h-8" />
              </motion.div>
              
              <h3 className="heading-md mb-3 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              
              <p className="body-text text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="bg-muted/50 rounded-2xl p-8 md:p-12">
            <h3 className="heading-lg mb-4">Ready to Experience Premium Quality?</h3>
            <p className="body-text text-muted-foreground mb-6 max-w-xl mx-auto">
              Join thousands of satisfied customers who trust MeatE for their premium meat needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary">
                Start Shopping
              </button>
              <button className="btn-outline">
                Learn More
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUs;