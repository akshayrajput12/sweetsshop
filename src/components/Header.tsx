import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, Search, LogOut, X, Home, Package, Info, Phone } from 'lucide-react';
import logoImage from '../assets/logo.png';
import { useStore } from '../store/useStore';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/hooks/useSettings';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import SearchSidebar from './SearchSidebar';

interface HeaderProps {
  isAdminRoute?: boolean;
}

const Header: React.FC<HeaderProps> = ({ isAdminRoute = false }) => {
  // Don't render header content for admin routes
  if (isAdminRoute) {
    return null;
  }

  const { settings } = useSettings();
  const { cartItems, toggleCart } = useStore();
  const { user, isAdmin, signOut, profile } = useAuth();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
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
      {/* Marquee Text for Bulk Orders */}
      {settings?.store_phone && (
        <div className="bg-primary text-primary-foreground py-2 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap text-lg font-semibold inline-block">
            <span className="mx-4">For Bulk Order Call - {settings.store_phone}</span>
            <span className="mx-4">For Bulk Order Call - {settings.store_phone}</span>
            <span className="mx-4">For Bulk Order Call - {settings.store_phone}</span>
            <span className="mx-4">For Bulk Order Call - {settings.store_phone}</span>
            <span className="mx-4">For Bulk Order Call - {settings.store_phone}</span>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-24 md:h-32">
          {/* Logo - Increased size */}
          <motion.div
            className="flex items-center space-x-2 flex-shrink-0"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
              <img 
                src={logoImage} 
                alt="Sweet Delights Logo" 
                className="w-32 h-32 md:w-28 md:h-28 object-contain hidden xs:block"
              />
              <div className="xs:hidden flex items-center">
                <motion.span 
                  className="text-2xl text-primary lobster-font logo-glow"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  whileHover={{ 
                    scale: 1.05,
                    textShadow: "0 0 8px rgba(153, 146, 74, 0.8)",
                    transition: { duration: 0.3 }
                  }}
                >
                  SuperSweets
                </motion.span>
              </div>
              <div className="hidden xs:block">
                <motion.span 
                  className="text-3xl md:text-4xl font-bold text-primary lobster-font logo-glow"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 0.6,
                    delay: 0.1,
                    type: "spring",
                    stiffness: 200
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    textShadow: "0 0 15px rgba(74, 74, 153, 0.9)",
                    transition: { duration: 0.3 }
                  }}
                >
                  Sweet Delights
                </motion.span>
                <motion.div 
                  className="text-sm md:text-base text-muted-foreground -mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  Premium Sweets & Desserts
                </motion.div>
              </div>
            </Link>
          </motion.div>

          {/* Spacer for layout */}
          <div className="hidden sm:flex flex-1 justify-center">
            {/* Desktop Navigation */}
            <nav className="flex items-center space-x-8">
              <Link to="/" className="body-text text-lg hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/products" className="body-text text-lg hover:text-primary transition-colors">
                Sweets
              </Link>
              <Link to="/about" className="body-text text-lg hover:text-primary transition-colors">
                About
              </Link>
              <Link to="/contact" className="body-text text-lg hover:text-primary transition-colors">
                Contact
              </Link>
            </nav>
          </div>

          {/* Right Section - Adjusted for mobile */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            {/* Search */}
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-2 md:p-3 hover:bg-muted rounded-lg transition-colors"
            >
              <Search className="w-6 h-6 md:w-7 md:h-7" />
            </button>

            {/* Cart */}
            <button 
              onClick={toggleCart}
              className="relative p-2 md:p-3 hover:bg-muted rounded-lg transition-colors"
            >
              <ShoppingCart className="w-6 h-6 md:w-7 md:h-7" />
              {cartItemsCount > 0 && (
                <motion.span 
                  className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-6 h-6 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  {cartItemsCount > 99 ? '99+' : cartItemsCount}
                </motion.span>
              )}
            </button>

            {/* User - Desktop */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="hidden md:flex items-center space-x-2 p-2 md:p-3 hover:bg-muted rounded-lg transition-colors">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground text-base md:text-lg font-medium">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden lg:block body-text max-w-32 truncate text-lg">{user.email}</span>
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
                className="hidden md:flex p-2 md:p-3 hover:bg-muted rounded-lg transition-colors"
              >
                <User className="w-6 h-6 md:w-7 md:h-7" />
              </button>
            )}

            {/* Mobile Menu Button */}
            <button 
              onClick={toggleMobileMenu}
              className="p-2 md:p-3 hover:bg-muted rounded-lg transition-colors md:hidden"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6 md:w-7 md:h-7" /> : <Menu className="w-6 h-6 md:w-7 md:h-7" />}
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
              
              {/* Mobile Menu - Sliding from bottom to top */}
              <motion.div
                className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50 md:hidden"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              >
                <div className="container mx-auto px-4 py-4 max-h-[70vh] overflow-y-auto">
                  {/* Mobile Header with Logo and Icons - Reordered layout */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b">
                    {/* Menu Button (Hamburger) */}
                    <button 
                      onClick={toggleMobileMenu}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>

                    {/* Logo - Updated to show logo on mobile menu header */}
                    <Link to="/" className="flex items-center space-x-2 flex-shrink-0" onClick={closeMobileMenu}>
                      <img 
                        src={logoImage} 
                        alt="Sweet Delights Logo" 
                        className="w-16 h-16 object-contain"
                      />
                      <div className="hidden xs:block">
                        <motion.span 
                          className="text-xl font-bold text-primary lobster-font logo-glow"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.4 }}
                          whileHover={{ 
                            scale: 1.05,
                            textShadow: "0 0 8px rgba(74, 74, 153, 0.8)",
                            transition: { duration: 0.3 }
                          }}
                        >
                          Sweet Delights
                        </motion.span>
                      </div>
                    </Link>

                    <div className="flex items-center space-x-2">
                      {/* Search */}
                      <button 
                        onClick={() => {
                          setIsSearchOpen(true);
                          closeMobileMenu();
                        }}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                      >
                        <Search className="w-5 h-5" />
                      </button>

                      {/* Cart */}
                      <button 
                        onClick={toggleCart}
                        className="relative p-2 hover:bg-muted rounded-lg transition-colors"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        {cartItemsCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {cartItemsCount > 99 ? '99+' : cartItemsCount}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <nav className="space-y-2 mb-4">
                    <motion.button
                      onClick={() => handleNavigation('/')}
                      className="flex items-center space-x-3 w-full p-3 hover:bg-muted rounded-lg transition-colors text-left"
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Home className="w-5 h-5 text-primary" />
                      <span className="font-medium">Home</span>
                    </motion.button>
                    
                    <motion.button
                      onClick={() => handleNavigation('/products')}
                      className="flex items-center space-x-3 w-full p-3 hover:bg-muted rounded-lg transition-colors text-left"
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Package className="w-5 h-5 text-primary" />
                      <span className="font-medium">Sweets</span>
                    </motion.button>
                    
                    <motion.button
                      onClick={() => handleNavigation('/about')}
                      className="flex items-center space-x-3 w-full p-3 hover:bg-muted rounded-lg transition-colors text-left"
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Info className="w-5 h-5 text-primary" />
                      <span className="font-medium">About</span>
                    </motion.button>
                    
                    <motion.button
                      onClick={() => handleNavigation('/contact')}
                      className="flex items-center space-x-3 w-full p-3 hover:bg-muted rounded-lg transition-colors text-left"
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Phone className="w-5 h-5 text-primary" />
                      <span className="font-medium">Contact</span>
                    </motion.button>
                  </nav>

                  {/* User Section - Mobile */}
                  {user ? (
                    <motion.div 
                      className="border-t pt-4 space-y-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
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
                        onClick={signOut}
                        className="flex items-center space-x-3 w-full p-3 hover:bg-muted rounded-lg transition-colors text-left text-destructive"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      className="border-t pt-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <button
                        onClick={() => handleNavigation('/auth')}
                        className="flex items-center justify-center space-x-2 w-full p-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        <User className="w-5 h-5" />
                        <span className="font-medium">Sign In / Register</span>
                      </button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Search Sidebar */}
        <SearchSidebar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      </div>
    </motion.header>
  );
};

export default Header;