import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useStore } from "./store/useStore";
import { products } from "./data/products";

// Layout
import Header from "./components/Header";
import CartSidebar from "./components/CartSidebar";

// Pages
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Footer from "./components/Footer";

// Admin
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";

const queryClient = new QueryClient();

const App = () => {
  const setProducts = useStore((state: any) => state.setProducts);

  useEffect(() => {
    // Initialize products in store
    if (setProducts) {
      setProducts(products);
    }
  }, [setProducts]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Header />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<div className="p-8 text-center">Products Management - Coming Soon</div>} />
                <Route path="categories" element={<div className="p-8 text-center">Categories Management - Coming Soon</div>} />
                <Route path="orders" element={<div className="p-8 text-center">Orders Management - Coming Soon</div>} />
                <Route path="customers" element={<div className="p-8 text-center">Customers Management - Coming Soon</div>} />
                <Route path="analytics" element={<div className="p-8 text-center">Analytics - Coming Soon</div>} />
                <Route path="bestsellers" element={<div className="p-8 text-center">Best Sellers Management - Coming Soon</div>} />
                <Route path="settings" element={<div className="p-8 text-center">Settings - Coming Soon</div>} />
              </Route>
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
            <CartSidebar />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
