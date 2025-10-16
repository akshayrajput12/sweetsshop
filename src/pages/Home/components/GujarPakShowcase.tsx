import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Award, Leaf, Clock, Users } from 'lucide-react';
import gujarpak from "../../../assets/gujarpak.webp"

const GujarPakShowcase = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-200 to-red-200 rounded-full blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-amber-200 to-orange-200 rounded-full blur-3xl opacity-20 transform -translate-x-1/2 translate-y-1/2"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-yellow-300 rounded-full blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Product Image Section */}
          <div className="lg:w-1/2 flex justify-center">
            <div className="relative">
              {/* Main Product Image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white transform rotate-3 hover:rotate-0 transition-transform duration-700">
                <img 
                  src={gujarpak} 
                  alt="Gujar Pak - Our Signature Sweet" 
                  className="w-full h-96 md:h-[500px] object-cover"
                />
              </div>
              
              {/* Floating Badges */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2 rounded-full font-bold shadow-lg transform rotate-12 animate-bounce">
                <div className="flex items-center">
                  <Award className="w-5 h-5 mr-1" />
                  <span>Premium</span>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white text-amber-700 px-6 py-2 rounded-full font-bold shadow-lg transform -rotate-12">
                <div className="flex items-center">
                  <Leaf className="w-5 h-5 mr-1" />
                  <span>Organic</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Product Details Section */}
          <div className="lg:w-1/2 space-y-8">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 px-4 py-1.5 rounded-full text-sm font-bold mb-6">
                <Star className="w-4 h-4 mr-1 fill-current" />
                <span>Our Signature Sweet</span>
              </div>
              
              {/* Title */}
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 font-serif mb-4">
                Gujar <span className="text-amber-600">Pak</span>
              </h2>
              
              {/* Rating */}
              <div className="flex items-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-amber-500 fill-current" />
                ))}
                <span className="ml-2 text-gray-600 font-medium">4.9 (128 Reviews)</span>
              </div>
              
              {/* Description */}
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Experience the rich heritage of Gujarat with our signature sweet, Gujar Pak. 
                Made with the finest ingredients and traditional recipes passed down through generations, 
                this delectable treat offers an exquisite blend of flavors that will transport you 
                straight to the heart of Gujarat. Each bite is a celebration of authentic craftsmanship 
                and culinary excellence.
              </p>
              
              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-amber-100 shadow-sm">
                  <div className="bg-amber-100 p-3 rounded-lg mr-4">
                    <Leaf className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Organic Ingredients</p>
                    <p className="text-sm text-gray-600">Natural & Pure</p>
                  </div>
                </div>
                <div className="flex items-center bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-amber-100 shadow-sm">
                  <div className="bg-amber-100 p-3 rounded-lg mr-4">
                    <Award className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Artisanal Craft</p>
                    <p className="text-sm text-gray-600">Handmade with Love</p>
                  </div>
                </div>
                <div className="flex items-center bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-amber-100 shadow-sm">
                  <div className="bg-amber-100 p-3 rounded-lg mr-4">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Fresh Daily</p>
                    <p className="text-sm text-gray-600">Made Fresh Everyday</p>
                  </div>
                </div>
                <div className="flex items-center bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-amber-100 shadow-sm">
                  <div className="bg-amber-100 p-3 rounded-lg mr-4">
                    <Users className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Family Recipe</p>
                    <p className="text-sm text-gray-600">3 Generations of Expertise</p>
                  </div>
                </div>
              </div>
              
              {/* CTA Button */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/products" 
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center group"
                >
                  <ShoppingCart className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                  Shop Now
                </Link>
                
                <Link 
                  to="/products" 
                  className="border-2 border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 flex items-center justify-center"
                >
                  Explore Collection
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GujarPakShowcase;