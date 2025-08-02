import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Star } from 'lucide-react';
import { Product } from '../store/useStore';
import { useStore } from '../store/useStore';
import { formatPrice } from '../utils/currency';

interface ProductCardProps {
  product: Product;
  onViewDetail?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetail }) => {
  const addToCart = useStore((state) => state.addToCart);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  };

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      className="card-product"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onViewDetail}
      layout
    >
      {/* Image Container */}
      <div className="relative overflow-hidden rounded-lg mb-4">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-accent text-accent-foreground px-2 py-1 rounded-full caption font-medium">
            {discount}% OFF
          </div>
        )}

        {/* Stock Status */}
        {(product.stock_quantity !== undefined && product.stock_quantity <= 0) && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-medium">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-2">
        <h3 className="heading-md font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {product.name}
        </h3>

        {/* Weight & Pieces */}
        <div className="flex items-center space-x-2 text-muted-foreground caption">
          <span>{product.weight}</span>
          {product.pieces && (
            <>
              <span>•</span>
              <span>{product.pieces}</span>
            </>
          )}
        </div>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 fill-accent text-accent" />
            <span className="caption text-muted-foreground">{product.rating}</span>
          </div>
        )}

        {/* Price & Add Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            <span className="heading-md font-semibold text-primary">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="body-text text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <motion.button
            onClick={handleAddToCart}
            disabled={product.stock_quantity !== undefined && product.stock_quantity <= 0}
            className="bg-primary hover:bg-primary-hover text-primary-foreground p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;