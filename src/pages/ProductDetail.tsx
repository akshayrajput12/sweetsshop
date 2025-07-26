import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, Star, Plus, Minus, ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/store/useStore';
import { formatPrice, calculateDiscount } from '@/utils/currency';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const { products, addToCart } = useStore();
  const product = products.find(p => p.slug === slug);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Button onClick={() => navigate('/products')}>
          Back to Products
        </Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  };

  const discountPercentage = product.originalPrice 
    ? calculateDiscount(product.originalPrice, product.price)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="p-0 h-auto"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <span className="text-muted-foreground">/</span>
        <span className="text-muted-foreground">{product.category}</span>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <Badge variant="secondary" className="mb-2">
              {product.category}
            </Badge>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            
            {/* Rating */}
            {product.rating && (
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span className="ml-1 font-medium">{product.rating}</span>
                </div>
                <span className="text-muted-foreground">(128 reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <Badge variant="destructive">
                    {discountPercentage}% OFF
                  </Badge>
                </>
              )}
            </div>

            {/* Weight & Pieces */}
            <div className="flex items-center space-x-4 text-muted-foreground mb-6">
              <span>Weight: {product.weight}</span>
              {product.pieces && <span>• {product.pieces}</span>}
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {product.inStock ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  In Stock
                </Badge>
              ) : (
                <Badge variant="destructive">
                  Out of Stock
                </Badge>
              )}
            </div>
          </div>

          {/* Quantity Selector */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="font-medium">Quantity:</span>
                  <div className="flex items-center border rounded-lg">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="px-4 py-2 font-medium">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Total</div>
                  <div className="font-bold text-lg">
                    {formatPrice(product.price * quantity)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button 
              className="flex-1" 
              size="lg"
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Add to Cart
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>

          {/* Product Details Accordion */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="description">
              <AccordionTrigger>Description</AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">{product.description}</p>
              </AccordionContent>
            </AccordionItem>
            
            {product.nutrition && (
              <AccordionItem value="nutrition">
                <AccordionTrigger>Nutrition Information</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">{product.nutrition}</p>
                </AccordionContent>
              </AccordionItem>
            )}
            
            <AccordionItem value="storage">
              <AccordionTrigger>Storage Instructions</AccordionTrigger>
              <AccordionContent>
                <div className="text-muted-foreground space-y-2">
                  <p>• Store in refrigerator at 0-4°C</p>
                  <p>• Use within 3 days of delivery</p>
                  <p>• Keep raw meat separate from other foods</p>
                  <p>• Do not refreeze once thawed</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="delivery">
              <AccordionTrigger>Delivery Information</AccordionTrigger>
              <AccordionContent>
                <div className="text-muted-foreground space-y-2">
                  <p>• Free delivery on orders above ₹999</p>
                  <p>• Same day delivery available</p>
                  <p>• Delivered in temperature-controlled packaging</p>
                  <p>• 100% freshness guarantee</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;