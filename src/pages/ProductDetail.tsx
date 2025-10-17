import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  ArrowLeft, Star, Plus, Minus, ShoppingCart, Heart,
  ChevronLeft, ChevronRight, Package, Truck, Shield, Award,
  Info, CheckCircle, MapPin, Zap, Leaf, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/store/useStore';
import { formatPrice, calculateDiscount } from '@/utils/currency';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/integrations/supabase/client';
import { scrollToTopInstant } from '@/utils/scrollToTop';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [relatedCurrentIndex, setRelatedCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const [expandedSections, setExpandedSections] = useState({
    features: false,
    specifications: false,
    details: false
  });
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const { addToCart } = useStore();

  useEffect(() => {
    scrollToTopInstant();
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleResize = () => {
    if (window.innerWidth < 640) {
      setItemsPerView(1);
    } else if (window.innerWidth < 768) {
      setItemsPerView(2);
    } else if (window.innerWidth < 1024) {
      setItemsPerView(3);
    } else {
      setItemsPerView(4);
    }
  };

  const fetchProduct = async () => {
    try {
      let { data, error } = await supabase
        .from('products')
        .select(`*, categories(name)`)
        .eq('sku', slug)
        .eq('is_active', true)
        .single();

      if (error && error.code === 'PGRST116') {
        ({ data, error } = await supabase
          .from('products')
          .select(`*, categories(name)`)
          .eq('id', slug)
          .eq('is_active', true)
          .single());
      }

      if (error) throw error;
      setProduct(data);

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
        .limit(12);

      if (error) throw error;
      setRelatedProducts(data || []);
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  useEffect(() => {
    if (relatedProducts.length > itemsPerView) {
      const interval = setInterval(() => {
        setRelatedCurrentIndex(prev => {
          const maxIndex = relatedProducts.length - itemsPerView;
          return prev >= maxIndex ? 0 : prev + 1;
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [relatedProducts, itemsPerView]);

  const nextRelatedSlide = () => {
    if (relatedCurrentIndex < relatedProducts.length - itemsPerView) {
      setRelatedCurrentIndex(relatedCurrentIndex + 1);
    }
  };

  const prevRelatedSlide = () => {
    if (relatedCurrentIndex > 0) {
      setRelatedCurrentIndex(relatedCurrentIndex - 1);
    }
  };

  const canGoNextRelated = relatedCurrentIndex < relatedProducts.length - itemsPerView;
  const canGoPrevRelated = relatedCurrentIndex > 0;

  const toggleSection = (section: 'features' | 'specifications' | 'details') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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
        <Button onClick={() => navigate('/products')}>Back to Products</Button>
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 mb-8 text-sm bg-white rounded-xl p-4 shadow-sm border border-orange-100">
          <Link to="/" className="text-orange-600 hover:text-orange-700 font-medium hover:underline">Home</Link>
          <span className="text-gray-400">/</span>
          <Link to="/products" className="text-orange-600 hover:text-orange-700 font-medium hover:underline">Products</Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600 font-medium">{product.name}</span>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-orange-100 overflow-hidden mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Images */}
            <div className="space-y-4 -mt-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-orange-50 to-red-50 shadow-lg">
                <img
                  src={product.images?.[currentImageIndex] || '/placeholder.svg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />

                <div className="absolute top-2 left-4 bg-white rounded-2xl p-3 shadow-lg border border-orange-100">
                  <img 
                    src="/logo.png" 
                    alt="Brand Logo" 
                    className="w-10 h-10 object-contain"
                  />
                </div>

                {product.images && product.images.length > 1 && (
                  <>
                    <button onClick={prevImage} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-muted transition-colors">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={nextImage} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-muted transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-3xl font-bold">{product.name}</h1>
                  <Button variant="ghost" size="sm" onClick={() => setIsFavorite(!isFavorite)}>
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                </div>

                <div className="flex items-center flex-wrap gap-3 mb-6">
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 px-3 py-1.5 rounded-xl font-semibold">
                    {product.categories?.name || 'General'}
                  </Badge>
                  {product.is_bestseller && (
                    <Badge variant="default" className="bg-gradient-to-r from-yellow-500 to-orange-500 px-3 py-1.5 rounded-xl">
                      <Star className="w-3 h-3 mr-1" />
                      Bestseller
                    </Badge>
                  )}
                  {product.stock_quantity > 0 ? (
                    <Badge variant="default" className="bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1.5 rounded-xl">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      In Stock
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="px-3 py-1.5 rounded-xl">
                      Out of Stock
                    </Badge>
                  )}
                </div>

                {product.description && (
                  <div className="mb-4">
                    <p className={`text-muted-foreground leading-relaxed ${isDescriptionExpanded ? '' : 'line-clamp-3'}`}>
                      {product.description}
                    </p>
                    {product.description.length > 150 && (
                      <button 
                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                        className="mt-2 text-orange-600 hover:text-orange-700 font-medium text-sm"
                      >
                        {isDescriptionExpanded ? 'Show Less' : 'Read More'}
                      </button>
                    )}
                  </div>
                )}

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
              </div>  
            {/* Quantity and Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="font-medium">Quantity:</span>
                  <div className="flex items-center border border-orange-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-orange-50 transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 font-medium min-w-[3rem] text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 hover:bg-orange-50 transition-colors"
                      disabled={product.stock_quantity <= quantity}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={handleAddToCart}
                    disabled={product.stock_quantity === 0}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl py-3 font-semibold"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    className="px-6 border-orange-200 hover:bg-orange-50 rounded-xl"
                    onClick={() => navigate('/products')}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-orange-100">
                <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-xl">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                    <Truck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Fast Delivery</p>
                    <p className="text-xs text-muted-foreground">Same day delivery</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Quality Assured</p>
                    <p className="text-xs text-muted-foreground">Premium products</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Information Sections */}
        <div className="bg-white rounded-3xl shadow-xl border border-orange-100 overflow-hidden mb-8">
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6">Product Information</h2>
            
            {/* Features Section */}
            {product.features && product.features.length > 0 && (
              <div className="mb-6">
                <button
                  onClick={() => toggleSection('features')}
                  className="flex items-center justify-between w-full p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Award className="w-5 h-5 text-orange-600" />
                    <span className="font-semibold text-lg">Key Features</span>
                  </div>
                  {expandedSections.features ? (
                    <ChevronUp className="w-5 h-5 text-orange-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-orange-600" />
                  )}
                </button>
                
                {expandedSections.features && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {product.features.map((feature: string, index: number) => {
                        const IconComponent = getFeatureIcon(feature);
                        return (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                            <IconComponent className="w-5 h-5 text-orange-600" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Specifications Section */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="mb-6">
                <button
                  onClick={() => toggleSection('specifications')}
                  className="flex items-center justify-between w-full p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Info className="w-5 h-5 text-orange-600" />
                    <span className="font-semibold text-lg">Specifications</span>
                  </div>
                  {expandedSections.specifications ? (
                    <ChevronUp className="w-5 h-5 text-orange-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-orange-600" />
                  )}
                </button>
                
                {expandedSections.specifications && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between p-3 bg-white rounded-lg">
                          <span className="font-medium text-sm capitalize">{key.replace('_', ' ')}</span>
                          <span className="text-sm text-muted-foreground">{value as string}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Additional Details Section */}
            <div className="mb-6">
              <button
                onClick={() => toggleSection('details')}
                className="flex items-center justify-between w-full p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Package className="w-5 h-5 text-orange-600" />
                  <span className="font-semibold text-lg">Additional Details</span>
                </div>
                {expandedSections.details ? (
                  <ChevronUp className="w-5 h-5 text-orange-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-orange-600" />
                )}
              </button>
              
              {expandedSections.details && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <span className="font-medium text-sm">SKU</span>
                      <span className="text-sm text-muted-foreground">{product.sku}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <span className="font-medium text-sm">Stock Quantity</span>
                      <span className="text-sm text-muted-foreground">{product.stock_quantity} units</span>
                    </div>
                    {product.weight && (
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="font-medium text-sm">Weight</span>
                        <span className="text-sm text-muted-foreground">{product.weight}</span>
                      </div>
                    )}
                    {product.dimensions && (
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="font-medium text-sm">Dimensions</span>
                        <span className="text-sm text-muted-foreground">{product.dimensions}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl border border-orange-100 overflow-hidden">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Related Products</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={prevRelatedSlide}
                    disabled={!canGoPrevRelated}
                    className="p-2 rounded-full bg-orange-100 hover:bg-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-orange-600" />
                  </button>
                  <button
                    onClick={nextRelatedSlide}
                    disabled={!canGoNextRelated}
                    className="p-2 rounded-full bg-orange-100 hover:bg-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-orange-600" />
                  </button>
                </div>
              </div>

              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{
                    transform: `translateX(-${relatedCurrentIndex * (100 / itemsPerView)}%)`,
                    width: `${(relatedProducts.length / itemsPerView) * 100}%`
                  }}
                >
                  {relatedProducts.map((relatedProduct: any) => (
                    <div
                      key={relatedProduct.id}
                      className="px-2"
                      style={{ width: `${100 / relatedProducts.length}%` }}
                    >
                      <ProductCard product={relatedProduct} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;