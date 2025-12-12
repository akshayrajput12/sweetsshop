import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, Search, Heart, X, ChevronDown, ChevronRight, LogOut } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  DropdownMenu as MobileDropdown,
  DropdownMenuContent as MobileDropdownContent,
  DropdownMenuItem as MobileDropdownItem,
  DropdownMenuTrigger as MobileDropdownTrigger,
} from '@/components/ui/dropdown-menu';
import SearchSidebar from './SearchSidebar';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/logo.png';

interface HeaderProps {
  isAdminRoute?: boolean;
}

const Header: React.FC<HeaderProps> = ({ isAdminRoute = false }) => {
  if (isAdminRoute) return null;

  const navigate = useNavigate();
  const { cartItems, toggleCart } = useStore();
  const { user, signOut, isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Dynamic Data States
  const [categories, setCategories] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);

  // Scroll handling
  const { scrollY } = useScroll();
  const headerHeight = useTransform(scrollY, [0, 100], ["auto", "auto"]);

  // Logo scale animation
  const logoScale = useTransform(scrollY, [0, 100], [1, 0.9]);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    fetchNavigationData();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchNavigationData = async () => {
    try {
      // 1. Fetch Categories
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (catData) setCategories(catData);

      // 2. Mock Collections (Adapted for Rajluxmi Sweets)
      const mockCollections = [
        { id: 'c1', name: "New Arrivals", slug: 'new-arrivals' },
        { id: 'c2', name: "Bestsellers", slug: 'bestsellers' },
        {
          id: 'c4',
          name: "Gifting",
          slug: 'gifting',
          subcategories: [
            { name: "Wedding Boxes", slug: "wedding-boxes" },
            { name: "Corporate", slug: "corporate" },
            { name: "Festival Packs", slug: "festival-packs" },
            { name: "Custom Hampers", slug: "custom-hampers" }
          ]
        }
      ];
      setCollections(mockCollections);
    } catch (error) {
      console.error("Error fetching nav data:", error);
    }
  };

  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Desktop Click Dropdown Component
  const DesktopNavDropdown = ({ title, items, onSelect }: { title: string, items: any[], onSelect: (slug: string) => void }) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger className="px-5 py-2.5 text-sm font-serif tracking-[0.15em] uppercase text-[#FAF9F6] hover:text-[#B38B46] flex items-center outline-none transition-colors border-b-2 border-transparent hover:border-[#B38B46]/30 pb-1 focus:outline-none focus:text-[#B38B46]">
          {title} <ChevronDown className="ml-2 w-4 h-4 transition-transform duration-300" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-[#FAF9F6] bg-opacity-100 border border-[#D4B6A2]/30 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-sm p-1 z-[60]">
          {items.map((item, idx) => (
            <DropdownMenuItem
              key={idx}
              onClick={() => onSelect(item.slug || item.name.toLowerCase())}
              className="text-left px-5 py-3 text-sm font-serif tracking-widest text-[#5C4638] focus:text-[#783838] focus:bg-[#E5D8C6]/20 transition-colors uppercase cursor-pointer"
            >
              {item.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const MobileMenuItem = ({ label, path, onClick, subItems }: { label: string; path?: string; onClick?: () => void, subItems?: any[] }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
      <div className="border-b border-[#D4B6A2]/20 last:border-0 bg-[#FAF9F6] bg-opacity-100">
        <button
          onClick={() => {
            if (subItems && subItems.length > 0) setIsExpanded(!isExpanded);
            else {
              if (path) navigate(path);
              if (onClick) onClick();
              setIsMobileMenuOpen(false);
            }
          }}
          className="flex items-center justify-between w-full py-5 px-6 text-left group"
        >
          <span className={`text-base font-serif tracking-widest uppercase transition-colors ${isExpanded ? 'text-[#B38B46]' : 'text-[#4A1C1F]'}`}>
            {label}
          </span>
          {subItems && subItems.length > 0 ? (
            <ChevronDown className={`w-5 h-5 text-[#D4B6A2] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
          ) : (
            <ChevronRight className="w-5 h-5 text-[#D4B6A2] opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          )}
        </button>
        <AnimatePresence>
          {isExpanded && subItems && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-[#E5D8C6]/10"
            >
              {subItems.map((sub, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    navigate(`/products?category=${sub.slug || sub.name.toLowerCase()}`);
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-4 px-10 text-sm font-serif tracking-widest uppercase text-[#5C4638] hover:text-[#B38B46] border-b border-[#D4B6A2]/10 last:border-0"
                >
                  {sub.name}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <>
      <motion.header
        className={`bg-[#783838] sticky top-0 z-40 transition-all duration-500 border-b border-[#B38B46]/20 lg:border-none ${isScrolled ? 'shadow-lg py-0' : 'py-3'}`}
        style={{ height: headerHeight }}
      >
        {/* Top Decorative Line for "Classy/Traditional" feel on Desktop */}
        <div className="hidden lg:block w-full h-[4px] bg-gradient-to-r from-transparent via-[#B38B46] to-transparent absolute top-0 opacity-60" />

        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-center relative h-28 lg:h-36">

            {/* LEFT: Search & Mobile Menu */}
            <div className="flex-1 flex justify-start items-center">
              <div className="lg:hidden mr-2">
                <button onClick={() => setIsMobileMenuOpen(true)} className="text-[#FAF9F6] p-2 hover:bg-white/10 rounded-full transition-colors">
                  <Menu className="w-7 h-7 stroke-[1.5px]" />
                </button>
              </div>
              <motion.button
                whileHover={{ scale: 1.05, color: '#B38B46' }}
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-[#FAF9F6] hover:text-[#B38B46] transition-colors flex items-center gap-3 group"
              >
                <Search className="w-6 h-6 stroke-[1.5px]" />
                <span className="hidden lg:inline text-xs font-serif tracking-[0.2em] uppercase group-hover:text-[#B38B46] transition-colors">Search</span>
              </motion.button>
            </div>

            {/* CENTER: Navigation & Logo */}
            <div className="flex-[4] flex justify-center items-center h-full">

              {/* Left Nav Links (Desktop) */}
              <nav className="hidden lg:flex items-center gap-8 xl:gap-12 justify-end flex-1 h-full">
                {collections.slice(0, 2).map((item) => (
                  <Link
                    key={item.id}
                    to={`/products?collection=${item.slug}`}
                    className="relative group px-2 py-1"
                  >
                    <span className="text-sm font-serif tracking-[0.15em] uppercase text-[#FAF9F6] group-hover:text-[#B38B46] transition-colors">
                      {item.name}
                    </span>
                    <span className="absolute bottom-0 left-1/2 w-0 h-[1px] bg-[#B38B46] transition-all duration-500 ease-out -translate-x-1/2 group-hover:w-full" />
                  </Link>
                ))}
              </nav>

              {/* Logo */}
              <div className="flex-shrink-0 mx-8 xl:mx-12 relative z-10 group">
                <Link to="/">
                  <div className="absolute inset-0 bg-[#B38B46]/20 blur-xl rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-1000" />
                  <motion.img
                    src={logo}
                    alt="Raj Luxmi"
                    className="h-32 md:h-40 lg:h-48 w-auto object-contain max-w-none transform group-hover:scale-105 transition-transform duration-700 ease-out drop-shadow-sm brightness-0 invert"
                    style={{ scale: logoScale }}
                  />
                </Link>
              </div>

              {/* Right Nav Links (Desktop) */}
              <nav className="hidden lg:flex items-center gap-8 xl:gap-12 justify-start flex-1 h-full">
                {/* Gifting Dropdown */}
                {collections[2] && (
                  <DesktopNavDropdown
                    title={collections[2].name}
                    items={collections[2].subcategories || []}
                    onSelect={(slug) => navigate(`/products?tag=${slug}`)}
                  />
                )}

                {/* Categories Dropdown */}
                <DesktopNavDropdown
                  title="Category"
                  items={categories}
                  onSelect={(slug) => navigate(`/products?category=${slug}`)}
                />
              </nav>

            </div>

            {/* RIGHT: Actions */}
            <div className="flex-1 flex justify-end items-center gap-4 lg:gap-8">
              <motion.button className="hidden md:block text-[#FAF9F6] hover:text-[#B38B46] transition-colors">
                <Heart className="w-6 h-6 lg:w-6 lg:h-6 stroke-[1.5px]" />
              </motion.button>

              {user ? (
                <MobileDropdown>
                  <MobileDropdownTrigger className="outline-none">
                    <motion.div whileHover={{ scale: 1.05 }} className="text-[#FAF9F6] hover:text-[#B38B46] transition-colors hidden md:block">
                      <User className="w-6 h-6 lg:w-6 lg:h-6 stroke-[1.5px]" />
                    </motion.div>
                    <div className="md:hidden text-[#FAF9F6]">
                      <User className="w-6 h-6 stroke-[1.5px]" onClick={() => navigate('/profile')} />
                    </div>
                  </MobileDropdownTrigger>
                  <MobileDropdownContent align="end" className="hidden md:block w-64 bg-[#FAF9F6] bg-opacity-100 border border-[#D4B6A2]/20 shadow-xl rounded-sm p-2">
                    {isAdmin && (
                      <MobileDropdownItem className="focus:bg-[#E5D8C6]/20 text-[#4A1C1F] cursor-pointer font-serif tracking-wide text-sm uppercase py-3" onClick={() => navigate('/admin')}>
                        Admin Dashboard
                      </MobileDropdownItem>
                    )}
                    <MobileDropdownItem className="focus:bg-[#E5D8C6]/20 text-[#4A1C1F] cursor-pointer font-serif tracking-wide text-sm uppercase py-3" onClick={() => navigate('/profile')}>
                      Profile
                    </MobileDropdownItem>
                    <MobileDropdownItem className="focus:bg-[#E5D8C6]/20 text-[#4A1C1F] cursor-pointer font-serif tracking-wide text-sm uppercase py-3" onClick={signOut}>
                      Sign Out
                    </MobileDropdownItem>
                  </MobileDropdownContent>
                </MobileDropdown>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => navigate('/auth')}
                  className="text-[#FAF9F6] hover:text-[#B38B46] transition-colors hidden md:block"
                >
                  <User className="w-6 h-6 lg:w-6 lg:h-6 stroke-[1.5px]" />
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={toggleCart}
                className="relative text-[#FAF9F6] hover:text-[#B38B46] transition-colors p-1"
              >
                <ShoppingCart className="w-6 h-6 lg:w-6 lg:h-6 stroke-[1.5px]" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#FAF9F6] text-[#783838] text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-sm font-serif">
                    {cartItemsCount}
                  </span>
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Bottom Double Line - Traditional Touch */}
        <div className="hidden lg:block w-full border-b border-[#B38B46]/20" />
        <div className="hidden lg:block w-full border-b-[3px] border-double border-[#B38B46]/10 mt-[2px]" />
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-[#4A1C1F]/60 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "tween", duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-[#FAF9F6] bg-opacity-100 z-50 shadow-2xl overflow-y-auto border-r border-[#D4B6A2]/20"
            >
              <div className="p-6 flex items-center justify-between border-b border-[#D4B6A2]/20 bg-[#FAF9F6]">
                <img src={logo} alt="Raj Luxmi" className="h-20 w-auto object-contain" />
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-[#5C4638] hover:bg-[#E5D8C6]/20 rounded-full">
                  <X className="w-7 h-7" />
                </button>
              </div>

              <div className="py-2">
                {collections.map(col => (
                  <MobileMenuItem
                    key={col.id}
                    label={col.name}
                    path={`/products?collection=${col.slug}`}
                    subItems={col.subcategories}
                  />
                ))}

                <MobileMenuItem
                  label="All Categories"
                  subItems={categories.map(c => ({ name: c.name, slug: c.name.toLowerCase() }))}
                />

                {user ? (
                  <div className="mt-8 px-6 pt-6 border-t border-[#D4B6A2]/20">
                    <button onClick={() => { navigate('/profile'); setIsMobileMenuOpen(false); }} className="flex items-center space-x-3 w-full py-3 text-[#4A1C1F] font-serif tracking-widest text-xs uppercase">
                      <User className="w-4 h-4" /> <span>Profile</span>
                    </button>
                    {isAdmin && (
                      <button onClick={() => { navigate('/admin'); setIsMobileMenuOpen(false); }} className="flex items-center space-x-3 w-full py-3 text-[#B38B46] font-serif tracking-widest text-xs uppercase">
                        <User className="w-4 h-4" /> <span>Admin</span>
                      </button>
                    )}
                    <button onClick={() => { signOut(); setIsMobileMenuOpen(false); }} className="flex items-center space-x-3 w-full py-3 text-[#5C4638] font-serif tracking-widest text-xs uppercase">
                      <LogOut className="w-4 h-4" /> <span>Log Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-6 mt-4">
                    <button
                      onClick={() => { navigate('/auth'); setIsMobileMenuOpen(false); }}
                      className="w-full bg-[#4A1C1F] text-[#FAF9F6] py-4 rounded-sm uppercase tracking-[0.2em] font-serif text-xs hover:bg-[#5C4638] transition-colors shadow-lg"
                    >
                      Login / Sign Up
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SearchSidebar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Header;
