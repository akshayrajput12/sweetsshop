import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Star, Eye, Heart, ShoppingCart } from 'lucide-react';
import { Product } from '../store/useStore';
import { useStore } from '../store/useStore';
import { formatPrice } from '../utils/currency';

interface ProductCardProps {
  product: Product;
  onViewDetail?: () => void;
  onQuickView?: (product?: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetail, onQuickView }) => {
  const addToCart = useStore((state) => state.addToCart);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const images = product.images || [product.image];
  const hasMultipleImages = images.length > 1;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickView?.(product);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (hasMultipleImages) {
      setCurrentImageIndex(1);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCurrentImageIndex(0);
  };

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const isOutOfStock = product.stock_quantity !== undefined && product.stock_quantity <= 0;

  // Format price with "Inc. GST" text
  const formatPriceWithGST = (price: number): string => {
    return `${formatPrice(price)} Inc. GST`;
  };

  return (
    // Updated to remove borders and border effects
    <motion.div
      className="group cursor-pointer bg-white rounded-lg overflow-hidden transition-all duration-300"
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.98 }}
      onClick={onViewDetail}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      layout
    >
      {/* Image Container */}
      <div className="relative overflow-hidden bg-gray-50">
        <motion.img
          src={images[currentImageIndex] || product.image}
          alt={product.name}
          className="w-full h-64 object-cover transition-all duration-700"
          animate={{ scale: isHovered ? 1.05 : 1 }}
        />
        
        {/* Minimal Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Floating Action Button */}
        <motion.button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="absolute bottom-3 right-3 bg-white hover:bg-gray-50 text-gray-800 p-2 rounded-full shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 opacity-0 group-hover:opacity-100"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ y: 10 }}
          animate={{ y: isHovered ? 0 : 10 }}
          transition={{ duration: 0.3 }}
        >
          <ShoppingCart className="w-4 h-4" />
        </motion.button>
        
        {/* Top Elements */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          {/* Discount Badge */}
          {discount > 0 && (
            <motion.div 
              className="bg-destructive text-white px-2 py-1 rounded-full text-xs font-bold shadow-sm"
              initial={{ scale: 0, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring" }}
            >
              -{discount}%
            </motion.div>
          )}
          
          {/* Wishlist Button */}
          <motion.button
            onClick={handleLike}
            className={`p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
              isLiked 
                ? 'bg-red-500 text-white shadow-md' 
                : 'bg-white/80 text-gray-600 hover:bg-white shadow-sm'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
          </motion.button>
        </div>

        {/* Stock Status Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-medium">
              Out of Stock
            </div>
          </div>
        )}

        {/* Quick View Button */}
        {onQuickView && (
          <motion.button
            onClick={handleQuickView}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 px-3 py-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Eye className="w-3 h-3 mr-1 inline" />
            Quick View
          </motion.button>
        )}
      </div>

      {/* Product Info - Centered below image */}
      <div className="p-4 text-center space-y-3">
        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 text-base leading-tight">
          {product.name}
        </h3>

        {/* Rating & Reviews */}
        {product.rating && (
          <div className="flex items-center justify-center space-x-1">
            <div className="flex items-center space-x-0.5">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating) 
                      ? 'fill-yellow-400 text-yellow-400' 
                      : 'text-gray-200'
                  }`} 
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 font-medium">({product.rating})</span>
          </div>
        )}

        {/* Price Section with "Inc. GST" */}
        <div className="flex items-center justify-center">
          <div className="space-y-1">
            <div className="flex items-baseline justify-center space-x-1">
              <span className="text-lg font-bold text-gray-900">
                {formatPriceWithGST(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  {formatPriceWithGST(product.originalPrice)}
                </span>
              )}
            </div>
            {discount > 0 && (
              <div className="text-xs text-destructive font-semibold">
                Save {formatPrice(product.originalPrice - product.price)}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;