import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const CartSidebar = () => {
  const { 
    cartItems, 
    isCartOpen, 
    toggleCart, 
    updateQuantity, 
    removeFromCart 
  } = useStore();
  
  const navigate = useNavigate();

  // Dynamic settings from database
  const [settings, setSettings] = useState<Record<string, any>>({
    tax_rate: 18,
    delivery_charge: 50,
    free_delivery_threshold: 1000,
    currency_symbol: '₹'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['tax_rate', 'delivery_charge', 'free_delivery_threshold', 'currency_symbol']);

      if (error) throw error;

      const settingsObj: Record<string, any> = {};
      data?.forEach(setting => {
        try {
          settingsObj[setting.key] = typeof setting.value === 'string' 
            ? JSON.parse(setting.value) 
            : setting.value;
        } catch {
          settingsObj[setting.key] = setting.value;
        }
      });

      setSettings(prev => ({ ...prev, ...settingsObj }));
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const tax = subtotal * (settings.tax_rate / 100);
  const deliveryFee = subtotal >= settings.free_delivery_threshold ? 0 : settings.delivery_charge;
  const total = subtotal + tax + deliveryFee;

  const handleCheckout = () => {
    toggleCart();
    navigate('/cart');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
          />

          {/* Sidebar */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full max-w-md bg-background shadow-large z-50 flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="heading-lg">Your Cart</h2>
              <button
                onClick={toggleCart}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="heading-md mb-2">Your cart is empty</h3>
                  <p className="body-text text-muted-foreground">
                    Add some delicious items to get started!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.id}
                      className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg"
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground line-clamp-1">
                          {item.name}
                        </h4>
                        <p className="caption text-muted-foreground">
                          {item.weight} • {settings.currency_symbol}{item.price}
                        </p>
                        
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-background rounded transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          
                          <span className="body-text font-medium min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-background rounded transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="ml-auto p-1 hover:bg-destructive/20 hover:text-destructive rounded transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between body-text">
                    <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span>{settings.currency_symbol}{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between body-text">
                    <span>Tax ({settings.tax_rate}%)</span>
                    <span>{settings.currency_symbol}{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between body-text">
                    <span>Delivery Fee</span>
                    <span>
                      {deliveryFee === 0 ? (
                        <span className="text-green-600 font-medium">FREE</span>
                      ) : (
                        `${settings.currency_symbol}${deliveryFee.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  {deliveryFee > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Add {settings.currency_symbol}{(settings.free_delivery_threshold - subtotal).toFixed(2)} more for free delivery
                    </div>
                  )}
                  <div className="flex justify-between heading-md font-semibold pt-2 border-t">
                    <span>Total</span>
                    <span>{settings.currency_symbol}{total.toFixed(2)}</span>
                  </div>
                </div>

                <motion.button
                  onClick={handleCheckout}
                  className="w-full btn-primary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Proceed to Checkout
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;