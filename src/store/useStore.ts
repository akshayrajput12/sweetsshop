import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ... existing interfaces ...

interface Store {
  // Cart
  cartItems: CartItem[];
  isCartOpen: boolean;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;

  // Products
  products: Product[];
  selectedCategory: string;
  setProducts: (products: Product[]) => void;
  setSelectedCategory: (category: string) => void;

  // User
  isAuthenticated: boolean;
  user: null | { name: string; email: string };
  login: (user: { name: string; email: string }) => void;
  logout: () => void;
}

// Load cart items from localStorage on initial load
const loadCartFromLocalStorage = (): CartItem[] => {
  if (typeof window !== 'undefined') {
    try {
      const storedCart = localStorage.getItem('cartItems');
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  }
  return [];
};

// Save cart items to localStorage
const saveCartToLocalStorage = (cartItems: CartItem[]): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // Cart state
      cartItems: loadCartFromLocalStorage(),
      isCartOpen: false,

      // Cart actions
      addToCart: (product) => {
        const { cartItems } = get();
        const existingItem = cartItems.find(item => item.id === product.id);
        
        let updatedCartItems;
        if (existingItem) {
          updatedCartItems = cartItems.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          updatedCartItems = [...cartItems, { ...product, quantity: 1 }];
        }
        
        set({ cartItems: updatedCartItems });
        saveCartToLocalStorage(updatedCartItems);
      },

      removeFromCart: (productId) => {
        const updatedCartItems = get().cartItems.filter(item => item.id !== productId);
        set({ cartItems: updatedCartItems });
        saveCartToLocalStorage(updatedCartItems);
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        
        const updatedCartItems = get().cartItems.map(item =>
          item.id === productId
            ? { ...item, quantity }
            : item
        );
        
        set({ cartItems: updatedCartItems });
        saveCartToLocalStorage(updatedCartItems);
      },

      clearCart: () => {
        set({ cartItems: [] });
        saveCartToLocalStorage([]);
      },
      
      toggleCart: () => set({ isCartOpen: !get().isCartOpen }),

      // Products state
      products: [],
      selectedCategory: 'All',
      setProducts: (products) => set({ products }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),

      // User state
      isAuthenticated: false,
      user: null,
      login: (user) => set({ isAuthenticated: true, user }),
      logout: () => set({ isAuthenticated: false, user: null }),
    }),
    {
      name: 'sweetsshop-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        cartItems: state.cartItems,
        // We only persist cart items, not the entire state
      }),
    }
  )
);