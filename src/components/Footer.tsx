import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import logoImage from '../assets/logo.png';
import { useSettings } from '@/hooks/useSettings';
import QRCodeComponent from './QRCode';

interface FooterProps {
  isAdminRoute?: boolean;
}

const Footer: React.FC<FooterProps> = ({ isAdminRoute = false }) => {
  // Don't render footer content for admin routes
  if (isAdminRoute) {
    return null;
  }

  const { settings, loading } = useSettings();

  // Show loading state or fallback values
  const contactInfo = {
    phone: settings?.store_phone || '+91 9996616153',
    email: settings?.store_email || 'contact@sweetdelights.fit',
    address: settings?.store_address || 'Shop number 5, Patel Nagar,\nHansi road, Patiala chowk,\nJIND (Haryana) 126102',
    storeName: settings?.store_name || 'Sweet Delights'
  };

  return (
    <footer className="bg-secondary text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img 
                src={logoImage} 
                alt="Sweet Delights Logo" 
                className="w-8 h-8 object-contain"
              />
              <h3 className="text-2xl font-bold text-primary">{contactInfo.storeName}</h3>
            </div>
            <p className="text-gray-300">
              Your premier destination for premium sweets and desserts. We bring the authentic taste of traditional sweets with a modern twist, delivered fresh to your doorstep.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 hover:text-primary cursor-pointer transition-colors" />
              <Twitter className="h-5 w-5 hover:text-primary cursor-pointer transition-colors" />
              <Instagram className="h-5 w-5 hover:text-primary cursor-pointer transition-colors" />
              <Youtube className="h-5 w-5 hover:text-primary cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/" className="block text-gray-300 hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/products" className="block text-gray-300 hover:text-primary transition-colors">
                All Sweets
              </Link>
              <Link to="/about" className="block text-gray-300 hover:text-primary transition-colors">
                About Us
              </Link>
              <Link to="/contact" className="block text-gray-300 hover:text-primary transition-colors">
                Contact Us
              </Link>
              <Link to="/cart" className="block text-gray-300 hover:text-primary transition-colors">
                Shopping Cart
              </Link>
            </div>
          </div>

          {/* Account & Services */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Account & Services</h4>
            <div className="space-y-2">
              <Link to="/profile" className="block text-gray-300 hover:text-primary transition-colors">
                My Account
              </Link>
              <Link to="/auth" className="block text-gray-300 hover:text-primary transition-colors">
                Login / Register
              </Link>
              <Link to="/checkout" className="block text-gray-300 hover:text-primary transition-colors">
                Checkout
              </Link>
              <Link to="/products?filter=bestsellers" className="block text-gray-300 hover:text-primary transition-colors">
                Bestsellers
              </Link>
              <Link to="/products?filter=new_arrivals" className="block text-gray-300 hover:text-primary transition-colors">
                New Arrivals
              </Link>
            </div>
          </div>

          {/* Sweet Categories */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Sweet Categories</h4>
            <div className="space-y-2">
              <Link to="/products" className="block text-gray-300 hover:text-primary transition-colors">
                Traditional Sweets
              </Link>
              <Link to="/products" className="block text-gray-300 hover:text-primary transition-colors">
                Fusion Desserts
              </Link>
              <Link to="/products" className="block text-gray-300 hover:text-primary transition-colors">
                Seasonal Specials
              </Link>
              <Link to="/products" className="block text-gray-300 hover:text-primary transition-colors">
                Gift Boxes
              </Link>
              <Link to="/products" className="block text-gray-300 hover:text-primary transition-colors">
                Vegan Options
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-gray-300">
                  {loading ? 'Loading...' : contactInfo.phone}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-gray-300">
                  {loading ? 'Loading...' : contactInfo.email}
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-primary mt-1" />
                <span className="text-gray-300">
                  {loading ? 'Loading...' : contactInfo.address.split('\n').map((line, index) => (
                    <span key={index}>
                      {line}
                      {index < contactInfo.address.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-sm">
              © 2024 {contactInfo.storeName}. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-6 mt-4 md:mt-0 items-center">
              <Link to="/about" className="text-gray-300 hover:text-primary text-sm transition-colors">
                About Us
              </Link>
              <Link to="/contact" className="text-gray-300 hover:text-primary text-sm transition-colors">
                Contact
              </Link>
              <Link to="/products" className="text-gray-300 hover:text-primary text-sm transition-colors">
                Sweets
              </Link>
              <Link to="/auth" className="text-gray-300 hover:text-primary text-sm transition-colors">
                Login
              </Link>
              <QRCodeComponent />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;