import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Star, Eye, Heart, ShoppingCart } from 'lucide-react';
import { Product } from '../store/useStore';
import { useStore } from '../store/useStore';
import { formatPrice } from '../utils/currency';

interface ProductCardProps {
  product: Product;
  onViewDetail?: () => void;
  onQuickView?: () => void;
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
    onQuickView?.();
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

  return (
    <motion.div
      className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
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
          className="w-full h-56 object-cover transition-all duration-500"
          animate={{ scale: isHovered ? 1.1 : 1 }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Action Buttons Overlay */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {onQuickView && (
            <motion.button
              onClick={handleQuickView}
              className="bg-white/95 backdrop-blur-sm hover:bg-white text-gray-800 p-3 rounded-full shadow-lg border border-white/20"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Eye className="w-5 h-5" />
            </motion.button>
          )}
          
          <motion.button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="bg-primary/95 backdrop-blur-sm hover:bg-primary text-white p-3 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed border border-primary/20"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ShoppingCart className="w-5 h-5" />
          </motion.button>
        </motion.div>
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          {/* Discount Badge */}
          {discount > 0 && (
            <motion.div 
              className="bg-accent text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              -{discount}%
            </motion.div>
          )}
          
          {/* Wishlist Button */}
          <motion.button
            onClick={handleLike}
            className={`p-2 rounded-full backdrop-blur-sm border transition-all duration-200 ${
              isLiked 
                ? 'bg-red-500 text-white border-red-500' 
                : 'bg-white/80 text-gray-600 border-white/20 hover:bg-white'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </motion.button>
        </div>

        {/* Stock Status Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-gray-800 font-semibold">Out of Stock</span>
            </div>
          </div>
        )}

        {/* Image Indicators */}
        {hasMultipleImages && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {images.slice(0, 3).map((_, index) => (
              <motion.div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentImageIndex ? 'bg-white scale-125' : 'bg-white/60'
                }`}
                whileHover={{ scale: 1.2 }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-5 space-y-3">
        {/* Product Name */}
        <h3 className="font-semibold text-secondary group-hover:text-primary transition-colors line-clamp-2 text-lg leading-tight">
          {product.name}
        </h3>

        {/* Product Description */}
        {product.description && (
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Weight & Pieces */}
        {(product.weight || product.pieces) && (
          <div className="flex items-center space-x-2 text-gray-500 text-sm">
            {product.weight && <span className="bg-muted px-2 py-1 rounded-md font-medium">{product.weight}</span>}
            {product.pieces && <span className="bg-muted px-2 py-1 rounded-md font-medium">{product.pieces}</span>}
          </div>
        )}

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating) 
                      ? 'fill-accent text-accent' 
                      : 'text-gray-300'
                  }`} 
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 font-medium">{product.rating}</span>
          </div>
        )}

        {/* Price Section */}
        <div className="flex items-center justify-between pt-2">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-secondary">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            {discount > 0 && (
              <div className="text-sm text-primary font-medium">
                Save {formatPrice(product.originalPrice - product.price)}
              </div>
            )}
          </div>

          {/* Quick Add Button */}
          <motion.button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="bg-primary hover:bg-primary-hover text-white p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200"
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