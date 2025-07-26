import { Product } from '../store/useStore';
import heroMeatImage from '../assets/hero-meat-display.jpg';
import steakImage from '../assets/product-steak.jpg';
import chickenImage from '../assets/product-chicken.jpg';
import seafoodImage from '../assets/product-seafood.jpg';

export const products: Product[] = [
  {
    id: '1',
    name: 'Premium Ribeye Steak',
    price: 45.99,
    originalPrice: 52.99,
    image: steakImage,
    category: 'Beef',
    weight: '12 oz',
    pieces: '1 piece',
    rating: 4.8,
    description: 'Premium grade ribeye steak, aged to perfection with excellent marbling for maximum flavor and tenderness.',
    nutrition: 'High in protein, iron, and vitamin B12. Approximately 250 calories per 100g.',
    inStock: true,
  },
  {
    id: '2',
    name: 'Free-Range Chicken Breast',
    price: 18.99,
    originalPrice: 22.99,
    image: chickenImage,
    category: 'Chicken',
    weight: '2 lbs',
    pieces: '4 pieces',
    rating: 4.6,
    description: 'Fresh, free-range chicken breast from local farms. Tender, juicy, and perfect for healthy meals.',
    nutrition: 'Lean protein source, low in fat. Approximately 165 calories per 100g.',
    inStock: true,
  },
  {
    id: '3',
    name: 'Atlantic Salmon Fillet',
    price: 32.99,
    image: seafoodImage,
    category: 'Seafood',
    weight: '1.5 lbs',
    pieces: '2 fillets',
    rating: 4.7,
    description: 'Wild-caught Atlantic salmon, rich in omega-3 fatty acids and perfect for grilling or baking.',
    nutrition: 'High in omega-3 fatty acids and protein. Approximately 206 calories per 100g.',
    inStock: true,
  },
  {
    id: '4',
    name: 'Wagyu Beef Burger Patties',
    price: 28.99,
    originalPrice: 34.99,
    image: steakImage,
    category: 'Beef',
    weight: '2 lbs',
    pieces: '8 patties',
    rating: 4.9,
    description: 'Premium Wagyu beef burger patties, hand-formed and perfect for gourmet burgers.',
    nutrition: 'Rich in protein and iron. Approximately 250 calories per patty.',
    inStock: true,
  },
  {
    id: '5',
    name: 'Organic Chicken Thighs',
    price: 14.99,
    image: chickenImage,
    category: 'Chicken',
    weight: '3 lbs',
    pieces: '8 pieces',
    rating: 4.5,
    description: 'Organic, bone-in chicken thighs with skin. Perfect for slow cooking and roasting.',
    nutrition: 'Higher in fat than breast meat, rich in flavor. Approximately 209 calories per 100g.',
    inStock: true,
  },
  {
    id: '6',
    name: 'Jumbo Shrimp',
    price: 24.99,
    image: seafoodImage,
    category: 'Seafood',
    weight: '1 lb',
    pieces: '16-20 count',
    rating: 4.4,
    description: 'Large, fresh jumbo shrimp, peeled and deveined. Perfect for grilling, sautéing, or steaming.',
    nutrition: 'Low in calories, high in protein. Approximately 99 calories per 100g.',
    inStock: true,
  },
];

export const categories = [
  'All',
  'Beef',
  'Chicken',
  'Seafood',
  'Pork',
  'Lamb',
  'Ready to Cook'
];

export const bestSellers = products.slice(0, 4);