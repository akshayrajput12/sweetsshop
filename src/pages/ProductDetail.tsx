import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Star, Plus, Minus, ShoppingCart, Heart, Clock, 
  ChevronLeft, ChevronRight, Package, Truck, Shield, Award,
  Info, CheckCircle, MapPin, Calendar, Zap, Leaf
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useStore } from '@/store/useStore';
import { formatPrice, calculateDiscount } from '@/utils/currency';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/integrations/supabase/client';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const { addToCart } = useStore();

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const fetchProduct = async () => {
    try {
      // Try to find product by SKU first, then by ID
      let { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(name)
        `)
        .eq('sku', slug)
        .eq('is_active', true)
        .single();

      if (error && error.code === 'PGRST116') {
        // If not found by SKU, try by ID
        ({ data, error } = await supabase
          .from('products')
          .select(`
            *,
            categories(name)
          `)
          .eq('id', slug)
          .eq('is_active', true)
          .single());
      }

      if (error) throw error;
      setProduct(data);

      // Fetch related products if product found
      if (data?.category_id) {
        fetchRelatedProducts(data.category_id, data.id);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (categoryId: string, productId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryId)
        .neq('id', productId)
        .eq('is_active', true)
        .limit(5);

      if (error) throw error;
      setRelatedProducts(data || []);
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="aspect-square bg-muted rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
      addToCart({
        ...product,
        image: product.images?.[0] || '/placeholder.svg',
        slug: product.sku || product.id,
        category: product.categories?.name || 'Unknown',
        inStock: product.stock_quantity > 0
      });
    }
  };

  const discountPercentage = product.original_price
    ? calculateDiscount(product.original_price, product.price)
    : 0;

  const nextImage = () => {
    if (product.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  const getFeatureIcon = (feature: string) => {
    const lowerFeature = feature.toLowerCase();
    if (lowerFeature.includes('bulk') || lowerFeature.includes('wholesale')) return Package;
    if (lowerFeature.includes('delivery') || lowerFeature.includes('fast')) return Truck;
    if (lowerFeature.includes('quality') || lowerFeature.includes('premium')) return Award;
    if (lowerFeature.includes('eco') || lowerFeature.includes('organic')) return Leaf;
    if (lowerFeature.includes('energy') || lowerFeature.includes('efficient')) return Zap;
    if (lowerFeature.includes('certified') || lowerFeature.includes('safe')) return Shield;
    return CheckCircle;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 mb-6 text-sm">
        <Link to="/" className="text-primary hover:underline">Home</Link>
        <span className="text-muted-foreground">/</span>
        <Link to="/products" className="text-primary hover:underline">Products</Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-muted-foreground">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
            <img
              src={product.images?.[currentImageIndex] || '/placeholder.svg'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            
            {/* BulkBuyStore Badge */}
            <div className="absolute top-4 left-4 bg-white rounded-full p-2 shadow-md">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-xs font-bold">B</span>
              </div>
            </div>

            {/* Navigation arrows - only show if multiple images */}
            {product.images && product.images.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-muted transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-muted transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Image indicators */}
            {product.images && product.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {product.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Thumbnail Images */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(0, 4).map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                    index === currentImageIndex ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <Button variant="ghost" size="sm" onClick={() => setIsFavorite(!isFavorite)}>
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>
            
            <div className="flex items-center space-x-2 mb-4">
              <Badge variant="secondary">
                {product.categories?.name || 'General'}
              </Badge>
              {product.is_bestseller && (
                <Badge variant="default" className="bg-orange-500">
                  <Star className="w-3 h-3 mr-1" />
                  Bestseller
                </Badge>
              )}
              {product.stock_quantity > 0 ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  In Stock
                </Badge>
              ) : (
                <Badge variant="destructive">
                  Out of Stock
                </Badge>
              )}
            </div>

            {/* Product Quick Info */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {product.weight && (
                <div className="flex items-center space-x-2 text-sm">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{product.weight}</span>
                </div>
              )}
              {product.pieces && (
                <div className="flex items-center space-x-2 text-sm">
                  <Info className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{product.pieces}</span>
                </div>
              )}
              {product.serves && (
                <div className="flex items-center space-x-2 text-sm">
                  <Award className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{product.serves} Units</span>
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Price */}
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-4xl font-bold text-foreground">
                {formatPrice(product.price)}
              </span>
              {product.original_price && product.original_price > product.price && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    MRP {formatPrice(product.original_price)}
                  </span>
                  <Badge variant="destructive">
                    {discountPercentage}% OFF
                  </Badge>
                </>
              )}
            </div>

            <p className="text-xs text-muted-foreground mb-4">(inclusive of all taxes)</p>

            {/* Bulk Benefits */}
            <div className="flex items-center space-x-2 text-primary text-sm mb-6 bg-primary/10 p-3 rounded-lg">
              <Package className="w-4 h-4" />
              <span className="font-medium">Bulk Shopping Benefits - Wholesale Prices!</span>
            </div>

            {/* Delivery Info */}
            <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
              <Truck className="w-4 h-4" />
              <span>Fast delivery available</span>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center space-x-4">
            <span className="font-medium">Quantity:</span>
            <div className="flex items-center border rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="px-4 py-2 font-medium">{quantity}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
                disabled={quantity >= product.stock_quantity}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <span className="text-sm text-muted-foreground">
              ({product.stock_quantity} available)
            </span>
          </div>

          {/* Add to Cart Button */}
          <Button
            className="w-full py-3 text-lg font-medium"
            onClick={handleAddToCart}
            disabled={product.stock_quantity <= 0}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            {product.stock_quantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </div>

      {/* Product Information Tabs */}
      <div className="mb-8">
        <Tabs defaultValue="features" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="storage">Storage & Info</TabsTrigger>
            <TabsTrigger value="company">Company Info</TabsTrigger>
          </TabsList>

          {/* Features Tab */}
          <TabsContent value="features" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5" />
                  <span>Product Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {product.features && Array.isArray(product.features) && product.features.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.features.map((feature, index) => {
                      const IconComponent = getFeatureIcon(feature);
                      return (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                          <IconComponent className="w-5 h-5 text-primary flex-shrink-0" />
                          <span className="text-sm font-medium">{feature}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No specific features listed for this product.</p>
                    <p className="text-sm">Contact us for more details about this bulk product.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Specifications Tab */}
          <TabsContent value="specifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Info className="w-5 h-5" />
                  <span>Product Specifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {product.nutritional_info && Object.keys(product.nutritional_info).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(product.nutritional_info).map(([key, value]) => {
                      if (!value) return null;
                      
                      const formatKey = (key: string) => {
                        return key
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^./, str => str.toUpperCase())
                          .replace('_', ' ');
                      };

                      return (
                        <div key={key} className="space-y-2">
                          <div className="text-sm font-medium text-muted-foreground">
                            {formatKey(key)}
                          </div>
                          <div className="text-lg font-semibold">
                            {value}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Info className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No detailed specifications available.</p>
                    <p className="text-sm">Contact us for technical specifications.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Storage & Info Tab */}
          <TabsContent value="storage" className="mt-6">
            <div className="space-y-6">
              {/* Storage Instructions */}
              {product.storage_instructions && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="w-5 h-5" />
                      <span>Storage Instructions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {product.storage_instructions}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Product Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="w-5 h-5" />
                    <span>Product Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.sku && (
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-muted-foreground">SKU</div>
                        <div className="font-mono text-sm bg-muted px-2 py-1 rounded">
                          {product.sku}
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">Stock Status</div>
                      <div className={`text-sm font-medium ${
                        product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {product.stock_quantity > 0 
                          ? `${product.stock_quantity} units available` 
                          : 'Out of stock'
                        }
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">Category</div>
                      <div className="text-sm">
                        {product.categories?.name || 'General Products'}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">Added</div>
                      <div className="text-sm">
                        {new Date(product.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Company Info Tab */}
          <TabsContent value="company" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Company Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {product.marketing_info && Object.keys(product.marketing_info).length > 0 ? (
                  <div className="space-y-4">
                    {product.marketing_info.marketedBy && (
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-muted-foreground">Marketed By</div>
                        <div className="font-medium">{product.marketing_info.marketedBy}</div>
                      </div>
                    )}

                    {(product.marketing_info.address || product.marketing_info.city || product.marketing_info.state) && (
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-muted-foreground">Address</div>
                        <div className="text-sm text-muted-foreground">
                          {[
                            product.marketing_info.address,
                            product.marketing_info.city,
                            product.marketing_info.state
                          ].filter(Boolean).join(', ')}
                        </div>
                      </div>
                    )}

                    {product.marketing_info.fssaiLicense && (
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-muted-foreground">FSSAI License</div>
                        <div className="font-mono text-sm bg-muted px-2 py-1 rounded inline-block">
                          {product.marketing_info.fssaiLicense}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Company information not available.</p>
                    <p className="text-sm">Contact BulkBuyStore for supplier details.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Related Bulk Products</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((relatedProduct: any) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={{
                    ...relatedProduct,
                    image: relatedProduct.images?.[0] || '/placeholder.svg',
                    slug: relatedProduct.sku || relatedProduct.id,
                    category: relatedProduct.categories?.name || 'General'
                  }}
                  onViewDetail={() => navigate(`/product/${relatedProduct.sku || relatedProduct.id}`)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Back to Products Button */}
      <div className="mt-8 text-center">
        <Button variant="outline" onClick={() => navigate('/products')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to All Products
        </Button>
      </div>
    </div>
  );
};

export default ProductDetail;