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
        .limit(12);

      if (error) throw error;
      setRelatedProducts(data || []);
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  // Auto-scroll for related products
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
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-orange-50 to-red-50 shadow-lg">
                <img
                  src={product.images?.[currentImageIndex] || '/placeholder.svg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />

                {/* BulkBuyStore Badge */}
                <div className="absolute top-4 left-4 bg-white rounded-2xl p-3 shadow-lg border border-orange-100">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-sm font-bold">B</span>
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
                    {product.images.map((_: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(0, 4).map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${index === currentImageIndex ? 'border-primary' : 'border-transparent'
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
                <div className="flex items-center space-x-3 text-orange-700 text-sm mb-6 bg-gradient-to-r from-orange-100 to-red-100 p-4 rounded-2xl border border-orange-200">
                  <Package className="w-5 h-5" />
                  <span className="font-semibold">🎉 Bulk Shopping Benefits - Wholesale Prices!</span>
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
                className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={handleAddToCart}
                disabled={product.stock_quantity <= 0}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {product.stock_quantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
            </div>
          </div>
        </div>

        {/* Product Information - Collapsible Sections */}
        <div className="space-y-4 mb-8">
          {/* Product Features Dropdown */}
          {product.features && Array.isArray(product.features) && product.features.length > 0 && (
            <div className="bg-white rounded-3xl shadow-xl border border-orange-100 overflow-hidden">
              <button
                onClick={() => toggleSection('features')}
                className="w-full flex items-center justify-between p-6 hover:bg-orange-50 transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <Award className="w-6 h-6 text-orange-500" />
                  <h3 className="text-xl font-bold text-gray-900">Product Features</h3>
                </div>
                {expandedSections.features ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              {expandedSections.features && (
                <div className="px-6 pb-6 border-t border-orange-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    {product.features.map((feature: string, index: number) => {
                      const IconComponent = getFeatureIcon(feature);
                      return (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
                          <IconComponent className="w-5 h-5 text-orange-600 flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-700">{feature}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Product Specifications Dropdown */}
          {product.nutritional_info && Object.keys(product.nutritional_info).length > 0 && (
            <div className="bg-white rounded-3xl shadow-xl border border-orange-100 overflow-hidden">
              <button
                onClick={() => toggleSection('specifications')}
                className="w-full flex items-center justify-between p-6 hover:bg-orange-50 transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <Info className="w-6 h-6 text-orange-500" />
                  <h3 className="text-xl font-bold text-gray-900">Product Specifications</h3>
                </div>
                {expandedSections.specifications ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              {expandedSections.specifications && (
                <div className="px-6 pb-6 border-t border-orange-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {Object.entries(product.nutritional_info).map(([key, value]) => {
                      if (!value) return null;

                      const formatKey = (key: string) => {
                        return key
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^./, str => str.toUpperCase())
                          .replace('_', ' ');
                      };

                      return (
                        <div key={key} className="flex justify-between items-center p-3 bg-orange-50 rounded-xl border border-orange-100">
                          <div className="text-sm font-medium text-gray-700">
                            {formatKey(key)}
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            {String(value)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Product & Company Details Dropdown */}
          <div className="bg-white rounded-3xl shadow-xl border border-orange-100 overflow-hidden">
            <button
              onClick={() => toggleSection('details')}
              className="w-full flex items-center justify-between p-6 hover:bg-orange-50 transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <MapPin className="w-6 h-6 text-orange-500" />
                <h3 className="text-xl font-bold text-gray-900">Product & Company Details</h3>
              </div>
              {expandedSections.details ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            {expandedSections.details && (
              <div className="px-6 pb-6 border-t border-orange-100">
                <div className="space-y-4 mt-4">
                  {/* Product Details */}
                  <div className="grid grid-cols-1 gap-3">
                    {product.sku && (
                      <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl border border-orange-100">
                        <div className="text-sm font-medium text-gray-700">SKU</div>
                        <div className="font-mono text-sm font-semibold text-gray-900">
                          {product.sku}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl border border-orange-100">
                      <div className="text-sm font-medium text-gray-700">Stock Status</div>
                      <div className={`text-sm font-semibold ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.stock_quantity > 0
                          ? `${product.stock_quantity} units available`
                          : 'Out of stock'
                        }
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl border border-orange-100">
                      <div className="text-sm font-medium text-gray-700">Category</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {product.categories?.name || 'General Products'}
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl border border-orange-100">
                      <div className="text-sm font-medium text-gray-700">Added</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {new Date(product.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Storage Instructions */}
                    {product.storage_instructions && (
                      <div className="p-3 bg-orange-50 rounded-xl border border-orange-100">
                        <div className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <Shield className="w-4 h-4 mr-2" />
                          Storage Instructions
                        </div>
                        <div className="text-sm text-gray-600 leading-relaxed">
                          {product.storage_instructions}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Company Information */}
                  {product.marketing_info && Object.keys(product.marketing_info).length > 0 && (
                    <div className="border-t border-orange-200 pt-4 mt-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Company Information</h4>
                      <div className="space-y-3">
                        {product.marketing_info.marketedBy && (
                          <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl border border-orange-100">
                            <div className="text-sm font-medium text-gray-700">Marketed By</div>
                            <div className="text-sm font-semibold text-gray-900">{product.marketing_info.marketedBy}</div>
                          </div>
                        )}

                        {(product.marketing_info.address || product.marketing_info.city || product.marketing_info.state) && (
                          <div className="p-3 bg-orange-50 rounded-xl border border-orange-100">
                            <div className="text-sm font-medium text-gray-700 mb-1">Address</div>
                            <div className="text-sm text-gray-600">
                              {[
                                product.marketing_info.address,
                                product.marketing_info.city,
                                product.marketing_info.state
                              ].filter(Boolean).join(', ')}
                            </div>
                          </div>
                        )}

                        {product.marketing_info.fssaiLicense && (
                          <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl border border-orange-100">
                            <div className="text-sm font-medium text-gray-700">FSSAI License</div>
                            <div className="font-mono text-sm font-semibold text-gray-900">
                              {product.marketing_info.fssaiLicense}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              </div>
            )}
          </div>

          {/* Related Products Section with Carousel */}
          {relatedProducts.length > 0 && (
            <div className="bg-white rounded-3xl shadow-xl border border-orange-100 p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Related Bulk Products</h2>
                </div>

                {/* Carousel Controls */}
                {relatedProducts.length > itemsPerView && (
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={prevRelatedSlide}
                      disabled={!canGoPrevRelated}
                      className={`p-3 rounded-2xl border-2 transition-all duration-200 ${canGoPrevRelated
                        ? 'border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white shadow-lg hover:shadow-xl hover:scale-105'
                        : 'border-gray-200 text-gray-300 cursor-not-allowed'
                        }`}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextRelatedSlide}
                      disabled={!canGoNextRelated}
                      className={`p-3 rounded-2xl border-2 transition-all duration-200 ${canGoNextRelated
                        ? 'border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white shadow-lg hover:shadow-xl hover:scale-105'
                        : 'border-gray-200 text-gray-300 cursor-not-allowed'
                        }`}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                )}
              </div>

              {/* Carousel */}
              <div className="relative overflow-hidden rounded-3xl">
                <div
                  className="flex transition-transform duration-500 ease-out"
                  style={{
                    transform: `translateX(-${relatedCurrentIndex * (100 / itemsPerView)}%)`,
                  }}
                >
                  {relatedProducts.map((relatedProduct: any) => (
                    <div
                      key={relatedProduct.id}
                      className="flex-shrink-0 px-3"
                      style={{ width: `${100 / itemsPerView}%` }}
                    >
                      <ProductCard
                        product={{
                          ...relatedProduct,
                          image: relatedProduct.images?.[0] || '/placeholder.svg',
                          slug: relatedProduct.sku || relatedProduct.id,
                          category: relatedProduct.categories?.name || 'General'
                        }}
                        onViewDetail={() => navigate(`/product/${relatedProduct.sku || relatedProduct.id}`)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Back to Products Button */}
          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => navigate('/products')}
              className="px-8 py-3 rounded-2xl border-2 border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 font-semibold"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to All Products
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;