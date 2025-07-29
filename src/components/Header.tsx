import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, Search, MapPin, LogOut } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '../hooks/useLocation';
import { motion } from 'framer-motion';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const { cartItems, toggleCart } = useStore();
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const userLocation = useLocation();
  
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