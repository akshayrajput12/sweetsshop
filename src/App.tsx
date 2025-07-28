import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
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
import AdminProducts from "./pages/admin/Products";
import AdminCategories from "./pages/admin/Categories";
import AdminOrders from "./pages/admin/Orders";
import AdminCustomers from "./pages/admin/Customers";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminBestSellers from "./pages/admin/BestSellers";
import ProductForm from "./pages/admin/ProductForm";
import CategoryForm from "./pages/admin/CategoryForm";
import CouponForm from "./pages/admin/CouponForm";
import AdminCoupons from "./pages/admin/Coupons";
import AdminSettings from "./pages/admin/Settings";
import AdminOrderDetail from "./pages/admin/OrderDetail";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-background">
      {!isAdminRoute && <Header />}
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
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="bestsellers" element={<AdminBestSellers />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="products/add" element={<ProductForm />} />
          <Route path="products/edit/:id" element={<ProductForm isEdit={true} />} />
          <Route path="categories/add" element={<CategoryForm />} />
          <Route path="categories/edit/:id" element={<CategoryForm isEdit={true} />} />
          <Route path="coupons/add" element={<CouponForm />} />
          <Route path="coupons/edit/:id" element={<CouponForm isEdit={true} />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
        </Route>

        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <CartSidebar />}
    </div>
  );
};

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
          <ScrollToTop />
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
