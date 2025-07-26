import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, Search } from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';

const Header = () => {
  const { cartItems, toggleCart, isAuthenticated, user } = useStore();
  const navigate = useNavigate();
  
  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <motion.header 
      className="bg-background shadow-soft sticky top-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">M</span>
            </div>
            <span className="heading-md text-primary">MeatE</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="body-text hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/products" className="body-text hover:text-primary transition-colors">
              Products
            </Link>
            <Link to="/about" className="body-text hover:text-primary transition-colors">
              About
            </Link>
            <Link to="/contact" className="body-text hover:text-primary transition-colors">
              Contact
            </Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button className="p-2 hover:bg-muted rounded-lg transition-colors hidden md:block">
              <Search className="w-5 h-5" />
            </button>

            {/* Cart */}
            <button 
              onClick={toggleCart}
              className="relative p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemsCount > 0 && (
                <motion.span 
                  className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  {cartItemsCount}
                </motion.span>
              )}
            </button>

            {/* User */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground text-sm font-medium">
                    {user?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden md:block body-text">{user?.name}</span>
              </div>
            ) : (
              <button 
                onClick={() => navigate('/auth')}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <User className="w-5 h-5" />
              </button>
            )}

            {/* Mobile Menu */}
            <button className="p-2 hover:bg-muted rounded-lg transition-colors md:hidden">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;