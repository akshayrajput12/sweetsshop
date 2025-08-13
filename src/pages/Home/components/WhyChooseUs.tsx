import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Truck, Clock, Award, ArrowRight, CheckCircle, Users, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const features = [
  {
    icon: Shield,
    title: 'Wholesale Prices',
    description: 'Get the best bulk prices directly from manufacturers and wholesalers. Save up to 50% on every purchase.',
    color: 'from-green-400 to-emerald-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600'
  },
  {
    icon: Truck,
    title: 'Free Bulk Delivery',
    description: 'Free delivery on orders above ₹2,000. Efficient logistics network ensures timely delivery nationwide.',
    color: 'from-blue-400 to-blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600'
  },
  {
    icon: Clock,
    title: '24/7 Support',
    description: 'Round-the-clock customer support to assist you with bulk orders, pricing, and business requirements.',
    color: 'from-purple-400 to-purple-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600'
  },
  {
    icon: Award,
    title: 'Quality Assured',
    description: 'All products are quality-checked and sourced from verified suppliers. 100% satisfaction guaranteed.',
    color: 'from-orange-400 to-red-500',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600'
  },
];

const WhyChooseUs = () => {
  const navigate = useNavigate();

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
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-10 left-10 w-96 h-96 bg-primary/3 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/3 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Enhanced Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center bg-gradient-to-r from-primary/10 to-blue-500/10 backdrop-blur-sm border border-primary/20 text-primary px-6 py-3 rounded-full text-sm font-semibold shadow-lg mb-6">
            <CheckCircle className="w-4 h-4 mr-2" />
            Why Choose Us
          </div>
          
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Why{' '}
            <span className="text-primary">BulkBuyStore</span>
            ?
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We're committed to delivering the best bulk shopping experience with unbeatable prices, 
            exceptional service, and guaranteed quality that you can trust.
          </p>
        </motion.div>

        {/* Enhanced Features Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative"
              whileHover={{ y: -8 }}
            >
              <div className="bg-white rounded-3xl p-8 text-center shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 group-hover:border-gray-200 relative overflow-hidden h-full">
                {/* Hover Gradient Overlay */}
                <div className={`absolute inset-0 ${feature.bgColor} opacity-0 group-hover:opacity-50 transition-opacity duration-300 rounded-3xl`} />
                
                <div className="relative z-10">
                  <motion.div 
                    className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <feature.icon className="w-10 h-10 text-white" />
                  </motion.div>
                  
                  <h3 className={`text-xl font-bold mb-4 group-hover:${feature.textColor} transition-colors`}>
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                    {feature.description}
                  </p>
                </div>

                {/* Decorative Corner */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced CTA Section */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="bg-gradient-to-br from-white via-gray-50 to-blue-50 rounded-3xl p-8 md:p-16 shadow-xl border border-gray-100 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center bg-gradient-to-r from-green-500/10 to-blue-500/10 backdrop-blur-sm border border-green-500/20 text-green-600 px-6 py-3 rounded-full text-sm font-semibold shadow-lg mb-8">
                <Users className="w-4 h-4 mr-2" />
                Join 10,000+ Happy Customers
              </div>

              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Ready to Start Saving with Bulk Shopping?
              </h3>
              
              <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                Join thousands of satisfied customers who trust BulkBuyStore for their bulk shopping needs 
                and enjoy wholesale savings on premium quality products.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <motion.button 
                  onClick={() => navigate('/products')}
                  className="group bg-primary hover:bg-primary-hover text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-xl"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-center">
                    <Zap className="w-6 h-6 mr-3" />
                    Start Shopping Now
                    <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.button>
                
                <motion.button 
                  onClick={() => navigate('/about')}
                  className="group bg-white text-gray-700 px-10 py-5 rounded-2xl font-bold text-lg border-2 border-gray-200 hover:border-primary hover:bg-gray-50 shadow-lg"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-center">
                    Learn More About Us
                    <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 group-hover:text-primary transition-all" />
                  </div>
                </motion.button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">10K+</div>
                  <div className="text-sm text-gray-600">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">5000+</div>
                  <div className="text-sm text-gray-600">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">50%</div>
                  <div className="text-sm text-gray-600">Average Savings</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUs;