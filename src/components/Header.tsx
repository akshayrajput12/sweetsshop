import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, Search, MapPin, LogOut, X, Home, Package, Info, Phone } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '../hooks/useLocation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const Header = () => {
  const { cartItems, toggleCart } = useStore();
  const { user, isAdmin, signOut, profile } = useAuth();
  const navigate = useNavigate();
  const userLocation = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    closeMobileMenu();
  };

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
              <span className="text-primary-foreground font-bold text-lg">B</span>
            </div>
            <span className="heading-md text-primary">BulkBoxs</span>
          </Link>

          {/* Location Display */}
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="w-4 h-4 text-red-500" />
            <span className="text-muted-foreground">
              <span className="hidden sm:inline">
                {userLocation.loading ? 'Detecting...' : userLocation.city}
              </span>
              <span className="sm:hidden">
                {userLocation.loading ? '...' : userLocation.city.split(',')[0]}
              </span>
            </span>
          </div>

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
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-2 p-2 hover:bg-muted rounded-lg transition-colors">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground text-sm font-medium">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden md:block body-text">{user.email}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <User className="mr-2 h-4 w-4" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button 
                onClick={() => navigate('/auth')}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <User className="w-5 h-5" />
              </button>
            )}

            {/* Mobile Menu Button */}
            <button 
              onClick={toggleMobileMenu}
              className="p-2 hover:bg-muted rounded-lg transition-colors md:hidden"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeMobileMenu}
              />
              
              {/* Mobile Menu */}
              <motion.div
                className="fixed top-16 left-0 right-0 bg-background border-b shadow-lg z-50 md:hidden"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="container mx-auto px-4 py-4">
                  {/* Search Bar - Mobile */}
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <nav className="space-y-2 mb-4">
                    <button
                      onClick={() => handleNavigation('/')}
                      className="flex items-center space-x-3 w-full p-3 hover:bg-muted rounded-lg transition-colors text-left"
                    >
                      <Home className="w-5 h-5 text-primary" />
                      <span className="font-medium">Home</span>
                    </button>
                    
                    <button
                      onClick={() => handleNavigation('/products')}
                      className="flex items-center space-x-3 w-full p-3 hover:bg-muted rounded-lg transition-colors text-left"
                    >
                      <Package className="w-5 h-5 text-primary" />
                      <span className="font-medium">Products</span>
                    </button>
                    
                    <button
                      onClick={() => handleNavigation('/about')}
                      className="flex items-center space-x-3 w-full p-3 hover:bg-muted rounded-lg transition-colors text-left"
                    >
                      <Info className="w-5 h-5 text-primary" />
                      <span className="font-medium">About</span>
                    </button>
                    
                    <button
                      onClick={() => handleNavigation('/contact')}
                      className="flex items-center space-x-3 w-full p-3 hover:bg-muted rounded-lg transition-colors text-left"
                    >
                      <Phone className="w-5 h-5 text-primary" />
                      <span className="font-medium">Contact</span>
                    </button>
                  </nav>

                  {/* User Section - Mobile */}
                  {user ? (
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground font-medium">
                            {user.email?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{profile?.full_name || 'User'}</p>
                          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleNavigation('/profile')}
                        className="flex items-center space-x-3 w-full p-3 hover:bg-muted rounded-lg transition-colors text-left"
                      >
                        <User className="w-5 h-5 text-primary" />
                        <span className="font-medium">My Profile</span>
                      </button>
                      
                      {isAdmin && (
                        <button
                          onClick={() => handleNavigation('/admin')}
                          className="flex items-center space-x-3 w-full p-3 hover:bg-muted rounded-lg transition-colors text-left"
                        >
                          <User className="w-5 h-5 text-primary" />
                          <span className="font-medium">Admin Panel</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          signOut();
                          closeMobileMenu();
                        }}
                        className="flex items-center space-x-3 w-full p-3 hover:bg-red-50 text-red-600 rounded-lg transition-colors text-left"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </div>
                  ) : (
                    <div className="border-t pt-4">
                      <Button
                        onClick={() => handleNavigation('/auth')}
                        className="w-full"
                        size="lg"
                      >
                        <User className="w-5 h-5 mr-2" />
                        Sign In / Sign Up
                      </Button>
                    </div>
                  )}

                  {/* Location Info - Mobile */}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <span>
                        {userLocation.loading ? 'Detecting location...' : `Delivering to ${userLocation.city}`}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;