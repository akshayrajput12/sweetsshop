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
    // Add bordered frame around the card
    <motion.div
      className="group cursor-pointer bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border-2 border-gray-200 hover:border-primary"
      whileHover={{ y: -12 }}
      whileTap={{ scale: 0.98 }}
      onClick={onViewDetail}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      layout
    >
      {/* Image Container with decorative elements */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Decorative corner elements */}
        <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-primary rounded-bl-3xl opacity-20"></div>
        <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-primary rounded-br-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-primary rounded-tl-3xl opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-primary rounded-tr-3xl opacity-20"></div>
        
        <motion.img
          src={images[currentImageIndex] || product.image}
          alt={product.name}
          className="w-full h-64 object-cover transition-all duration-700"
          animate={{ scale: isHovered ? 1.05 : 1 }}
        />
        
        {/* Minimal Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Floating Action Button */}
        <motion.button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="absolute bottom-4 right-4 bg-white hover:bg-gray-50 text-gray-800 p-3 rounded-2xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 opacity-0 group-hover:opacity-100"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ y: 20 }}
          animate={{ y: isHovered ? 0 : 20 }}
          transition={{ duration: 0.3 }}
        >
          <ShoppingCart className="w-5 h-5" />
        </motion.button>
        
        {/* Top Elements */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          {/* Discount Badge */}
          {discount > 0 && (
            <motion.div 
              className="bg-gradient-to-r from-primary to-[hsl(0_84%_60%)] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm"
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring" }}
            >
              -{discount}%
            </motion.div>
          )}
          
          {/* Wishlist Button */}
          <motion.button
            onClick={handleLike}
            className={`p-2.5 rounded-full backdrop-blur-md transition-all duration-300 ${
              isLiked 
                ? 'bg-red-500 text-white shadow-lg' 
                : 'bg-white/80 text-gray-600 hover:bg-white shadow-md'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </motion.button>
        </div>

        {/* Stock Status Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-medium">
              Out of Stock
            </div>
          </div>
        )}

        {/* Quick View Button */}
        {onQuickView && (
          <motion.button
            onClick={handleQuickView}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm hover:bg-white text-gray-800 px-4 py-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Eye className="w-4 h-4 mr-2 inline" />
            Quick View
          </motion.button>
        )}
      </div>

      {/* Product Info */}
      <div className="p-6 space-y-4">
        {/* Product Name */}
        <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 text-lg leading-tight">
          {product.name}
        </h3>

        {/* Product Description */}
        {product.description && (
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Rating & Reviews */}
        {product.rating && (
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-0.5">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating) 
                      ? 'fill-yellow-400 text-yellow-400' 
                      : 'text-gray-200'
                  }`} 
                />
              ))}
            </div>
            <span className="text-sm text-gray-500 font-medium">({product.rating})</span>
          </div>
        )}

        {/* Weight & Pieces */}
        {(product.weight || product.pieces) && (
          <div className="flex items-center space-x-2">
            {product.weight && (
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                {product.weight}
              </span>
            )}
            {product.pieces && (
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                {product.pieces}
              </span>
            )}
          </div>
        )}

        {/* Price Section with "Inc. GST" */}
        <div className="flex items-center justify-between pt-2">
          <div className="space-y-1">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-gray-900">
                {formatPriceWithGST(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-base text-gray-400 line-through">
                  {formatPriceWithGST(product.originalPrice)}
                </span>
              )}
            </div>
            {discount > 0 && (
              <div className="text-sm text-destructive font-semibold">
                Save {formatPrice(product.originalPrice - product.price)}
              </div>
            )}
          </div>

          {/* Add to Cart Button positioned on the right side */}
          <motion.button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white p-3 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;