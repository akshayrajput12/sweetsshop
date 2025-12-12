import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Star, Eye, Heart, ShoppingBag } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatPrice } from '../utils/currency';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  images?: string[];
  weight?: string;
  pieces?: string;
  rating?: number;
  stock_quantity?: number;
  isBestSeller?: boolean;
  isNew?: boolean;
  features?: string[];
  [key: string]: any;
}

interface ProductCardProps {
  product: Product;
  onViewDetail?: () => void;
  onQuickView?: (product?: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetail, onQuickView }) => {
  const addToCart = useStore((state) => state.addToCart);
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Always use the first image as the primary image
  const primaryImage = product.images?.[0] || product.image || '/placeholder.svg';

  // Get the second image for hover effect, or fallback to the first
  const hoverImage = product.images && product.images.length > 1
    ? product.images[1]
    : primaryImage;

  const displayImage = isHovered ? hoverImage : primaryImage;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      ...product,
      image: primaryImage
    });
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickView?.(product);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const isOutOfStock = product.stock_quantity !== undefined && product.stock_quantity <= 0;

  const formatPriceWithGST = (price: number): string => {
    return `${formatPrice(price)}`;
  };

  return (
    <motion.div
      className="group cursor-pointer bg-[#FFFDF7] rounded-sm overflow-hidden border border-[#E6D5B8]/50 hover:border-[#8B2131]/30 hover:shadow-[0_10px_40px_-10px_rgba(44,24,16,0.15)] transition-all duration-700 relative"
      whileHover={{ y: -8 }}
      onClick={onViewDetail}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      aria-label={`Product card for ${product.name}`}
    >
      {/* Image Container - 4:5 Aspect Ratio */}
      <div className="relative aspect-[4/5] bg-[#FFF8F0] overflow-hidden">
        <motion.img
          src={displayImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-1000 ease-out"
          animate={{ scale: isHovered ? 1.05 : 1 }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-[#2C1810]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isBestSeller && (
            <span className="bg-[#2C1810] text-[#F9F5EB] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm shadow-sm border border-[#4A3728]">
              Best Seller
            </span>
          )}
          {product.isNew && (
            <span className="bg-[#8B2131] text-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm shadow-sm border border-[#A63446]">
              New Arrival
            </span>
          )}
          {discount > 0 && (
            <span className="bg-[#C53030] text-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm shadow-sm">
              -{discount}%
            </span>
          )}
        </div>

        {/* Quick Actions - Right Side */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 delay-75">
          <button
            onClick={handleLike}
            className={`p-2.5 rounded-full shadow-lg transition-colors border ${isLiked ? 'bg-[#8B2131] text-white border-[#8B2131]' : 'bg-white/95 text-[#2C1810] border-[#E6D5B8] hover:bg-[#8B2131] hover:text-white hover:border-[#8B2131]'
              }`}
            aria-label="Add to Wishlist"
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
          </button>

          {onQuickView && (
            <button
              onClick={handleQuickView}
              className="p-2.5 bg-white/95 text-[#2C1810] rounded-full shadow-lg border border-[#E6D5B8] hover:bg-[#8B2131] hover:text-white hover:border-[#8B2131] transition-colors"
              aria-label="Quick View"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Add to Cart - Full width bottom button on hover */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="w-full bg-[#8B2131]/95 backdrop-blur-sm text-white py-4 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.15em] font-medium hover:bg-[#701a26] disabled:opacity-75 disabled:cursor-not-allowed"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-5 text-center flex flex-col items-center gap-2">
        <h3 className="font-serif text-lg text-[#2C1810] line-clamp-1 group-hover:text-[#8B2131] transition-colors duration-300">
          {product.name}
        </h3>

        {/* Weight/Pieces if available could go here */}
        {product.weight && (
          <span className="text-xs text-[#5D4037]/70 uppercase tracking-wider font-light">
            {product.weight}
          </span>
        )}

        <div className="flex flex-col items-center gap-1 mt-1">
          <div className="flex items-center gap-3">
            <span className="text-base font-medium text-[#2C1810] font-sans">
              {formatPriceWithGST(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-[#5D4037]/50 line-through decoration-[#5D4037]/30">
                {formatPriceWithGST(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Subtle Rating */}
          {product.rating && (
            <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity duration-300 mt-1">
              <Star className="w-3 h-3 text-[#B8860B] fill-current" />
              <span className="text-xs text-[#5D4037] mt-0.5">{product.rating}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;