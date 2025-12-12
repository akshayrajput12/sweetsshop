import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import logoImage from '../assets/logo.png';
import { useSettings } from '@/hooks/useSettings';
import QRCodeComponent from './QRCode';
import { MarqueeAnimation } from '@/components/ui/marquee-effect';
import { Button } from '@/components/ui/button';

interface FooterProps {
  isAdminRoute?: boolean;
}

const Footer: React.FC<FooterProps> = ({ isAdminRoute = false }) => {
  if (isAdminRoute) {
    return null;
  }

  const { settings, loading } = useSettings();

  const contactInfo = {
    phone: settings?.store_phone || '+91 9996616153',
    email: settings?.store_email || 'contact@rajluxmi.com',
    address: settings?.store_address || 'Shop number 5, Patel Nagar,\nHansi road, Patiala chowk,\nJIND (Haryana) 126102',
    storeName: 'Raj Luxmi'
  };

  return (
    <footer className="bg-footer-bg text-white pt-0 mt-0">
      {/* Newsletter Section - Premium Accent Background */}
      <div className="bg-accent py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 max-w-6xl mx-auto">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-serif text-white mb-2">Join the Royal Club</h3>
              <p className="text-white/90">Subscribe to receive exclusive offers and updates on our latest collections.</p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-3 bg-white/90 text-primary w-full md:w-80 rounded-md outline-none focus:ring-2 focus:ring-primary"
              />
              <Button className="bg-primary hover:bg-primary-hover text-white px-6 py-6 rounded-md whitespace-nowrap">
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <img
                src={logoImage}
                alt="Raj Luxmi Logo"
                className="w-10 h-10 object-contain brightness-0 invert"
              />
              <div>
                <h3 className="text-xl font-medium tracking-wider text-secondary">Raj Luxmi</h3>
                <p className="text-xs text-gray-400 uppercase tracking-widest">Royal Sweets</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your premier destination for premium sweets and desserts. We bring the authentic taste of traditional sweets with a modern twist, delivered fresh to your doorstep.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-gray-400 hover:text-secondary cursor-pointer transition-colors" />
              <Twitter className="h-5 w-5 text-gray-400 hover:text-secondary cursor-pointer transition-colors" />
              <Instagram className="h-5 w-5 text-gray-400 hover:text-secondary cursor-pointer transition-colors" />
              <Youtube className="h-5 w-5 text-gray-400 hover:text-secondary cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-serif text-secondary">Explore</h4>
            <div className="space-y-3">
              <Link to="/" className="block text-gray-400 hover:text-white transition-colors">Home</Link>
              <Link to="/products" className="block text-gray-400 hover:text-white transition-colors">Our Collection</Link>
              <Link to="/about" className="block text-gray-400 hover:text-white transition-colors">Heritage</Link>
              <Link to="/contact" className="block text-gray-400 hover:text-white transition-colors">Contact Us</Link>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-6">
            <h4 className="text-lg font-serif text-secondary">Collections</h4>
            <div className="space-y-3">
              <Link to="/products?category=traditional" className="block text-gray-400 hover:text-white transition-colors">Traditional Sweets</Link>
              <Link to="/products?category=gift-boxes" className="block text-gray-400 hover:text-white transition-colors">Royal Gift Boxes</Link>
              <Link to="/products?category=festive" className="block text-gray-400 hover:text-white transition-colors">Festive Specials</Link>
              <Link to="/products?category=sugar-free" className="block text-gray-400 hover:text-white transition-colors">Sugar Free Delights</Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="text-lg font-serif text-secondary">Contact Us</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 group cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                  <Phone className="h-4 w-4 text-secondary" />
                </div>
                <span className="text-gray-300 text-sm group-hover:text-white transition-colors">
                  {loading ? '...' : contactInfo.phone}
                </span>
              </div>
              <div className="flex items-center space-x-3 group cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                  <Mail className="h-4 w-4 text-secondary" />
                </div>
                <span className="text-gray-300 text-sm group-hover:text-white transition-colors">
                  {loading ? '...' : contactInfo.email}
                </span>
              </div>
              <div className="flex items-start space-x-3 group">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mt-1 group-hover:bg-secondary/20 transition-colors">
                  <MapPin className="h-4 w-4 text-secondary" />
                </div>
                <span className="text-gray-300 text-sm leading-relaxed group-hover:text-white transition-colors">
                  {loading ? '...' : contactInfo.address}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 mt-16 pt-8">
          <MarqueeAnimation
            direction="left"
            baseVelocity={-1}
            className="text-gray-500 py-4 text-sm font-light tracking-widest uppercase hover:text-secondary transition-colors"
          >
            Royal Heritage • Authentic Taste • Premium Ingredients • Crafted with Love •
          </MarqueeAnimation>

          <div className="flex flex-col md:flex-row justify-between items-center mt-8">
            <p className="text-gray-500 text-sm">
              © 2025 Raj Luxmi. All rights reserved.
            </p>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-gray-500 hover:text-white text-sm">Privacy Policy</Link>
              <Link to="/terms" className="text-gray-500 hover:text-white text-sm">Terms of Service</Link>
              <QRCodeComponent />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;