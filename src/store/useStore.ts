import { create } from 'zustand';

export interface NutritionalInfo {
  totalEnergy: string;
  carbohydrate: string;
  fat: string;
  protein: string;
}

export interface MarketingInfo {
  marketedBy: string;
  address: string;
  city: string;
  state: string;
  fssaiLicense: string;
}

export interface ProductFeatures {
  humanlyRaised?: boolean;
  handSelected?: boolean;
  temperatureControlled?: boolean;
  artisanalCut?: boolean;
  hygienicallyVacuumPacked?: boolean;
  netWeightOfPreppedMeat?: boolean;
  qualityAndFoodsafetyChecks?: boolean;
  mixOfOffalOrgans?: boolean;
  antibioticResidueFree?: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  weight: string;
  pieces?: string;
  rating?: number;
  description?: string;
  nutrition?: string;
  nutritionalInfo?: NutritionalInfo;
  marketingInfo?: MarketingInfo;
  features?: ProductFeatures;
  storageInstructions?: string;
  storage_instructions?: string;
  inStock: boolean;
  stock_quantity?: number;
  slug: string;
  serves?: number;
  isBestSeller?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

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

export const useStore = create<Store>((set, get) => ({
  // Cart state
  cartItems: [],
  isCartOpen: false,

  // Cart actions
  addToCart: (product) => {
    const { cartItems } = get();
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      set({
        cartItems: cartItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      });
    } else {
      set({
        cartItems: [...cartItems, { ...product, quantity: 1 }]
      });
    }
  },

  removeFromCart: (productId) => {
    set({
      cartItems: get().cartItems.filter(item => item.id !== productId)
    });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    
    set({
      cartItems: get().cartItems.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      )
    });
  },

  clearCart: () => set({ cartItems: [] }),
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
}));