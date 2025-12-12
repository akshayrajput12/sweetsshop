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

  // Add thumbnail navigation function
  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
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
    <div className="min-h-screen bg-[#FFFDF7] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 mb-8 text-sm text-[#5D4037]">
          <Link to="/" className="hover:text-[#8B2131] transition-colors">Home</Link>
          <span className="text-[#E6D5B8]">/</span>
          <Link to="/products" className="hover:text-[#8B2131] transition-colors">Products</Link>
          <span className="text-[#E6D5B8]">/</span>
          <span className="text-[#8B2131] font-medium">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-20">
          {/* Image Section */}
          <div className="space-y-6">
            <div className="relative aspect-square bg-white rounded-sm overflow-hidden border border-[#E6D5B8] shadow-sm group">
              <img
                src={product.images?.[currentImageIndex] || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Category Badge */}
              <div className="absolute top-4 left-4">
                <Badge className="bg-[#8B2131] text-white hover:bg-[#6d1a26] border-none rounded-none px-4 py-1.5 font-serif tracking-wider uppercase text-xs">
                  {product.categories?.name || 'Mithai'}
                </Badge>
              </div>
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`flex-shrink-0 w-24 h-24 bg-white border transition-all duration-300 ${currentImageIndex === index
                        ? 'border-[#8B2131] opacity-100 ring-1 ring-[#8B2131]'
                        : 'border-[#E6D5B8] opacity-60 hover:opacity-100'
                      }`}
                  >
                    <img src={image} alt={`Thumbnail ${index}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="flex flex-col">
            <div className="mb-4">
              {product.stock_quantity > 0 ? (
                <span className="text-emerald-700 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-700 animate-pulse"></span> In Stock
                </span>
              ) : (
                <span className="text-red-700 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-700"></span> Out of Stock
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#2C1810] leading-tight mb-6">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-4 mb-8 border-b border-[#E6D5B8] pb-8">
              <span className="text-3xl font-serif text-[#8B2131]">
                {formatPrice(product.price)}
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-lg text-[#5D4037]/60 line-through font-serif decoration-[#8B2131]/30">
                  {formatPrice(product.original_price)}
                </span>
              )}
              {discountPercentage > 0 && (
                <span className="text-xs font-bold text-[#8B2131] border border-[#8B2131] px-2 py-1 uppercase tracking-wider">
                  {discountPercentage}% Save
                </span>
              )}
            </div>

            <div className="prose prose-brown max-w-none mb-10">
              <p className={`text-[#5D4037] text-lg leading-relaxed font-light ${isDescriptionExpanded ? '' : 'line-clamp-4'}`}>
                {product.description}
              </p>
              {product.description?.length > 150 && (
                <button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="text-[#8B2131] text-xs font-bold uppercase tracking-widest mt-4 hover:underline underline-offset-4 flex items-center gap-1"
                >
                  {isDescriptionExpanded ? 'Read Less' : 'Read More'}
                  {isDescriptionExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-8 mb-12">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex items-center border border-[#E6D5B8] p-1 w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-12 h-12 flex items-center justify-center text-[#2C1810] hover:bg-[#F5E6D3] transition-colors disabled:opacity-30"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-16 text-center font-serif text-xl text-[#2C1810]">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={product.stock_quantity <= quantity}
                    className="w-12 h-12 flex items-center justify-center text-[#2C1810] hover:bg-[#F5E6D3] transition-colors disabled:opacity-30"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-1 gap-4">
                  <Button
                    onClick={handleAddToCart}
                    disabled={product.stock_quantity === 0}
                    className="flex-1 bg-[#2C1810] hover:bg-[#8B2131] text-white h-[56px] rounded-none uppercase tracking-[0.2em] font-medium text-sm transition-all duration-300 shadow-md hover:shadow-xl"
                  >
                    {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>

                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`w-[56px] h-[56px] border border-[#E6D5B8] flex items-center justify-center transition-all duration-300 ${isFavorite ? 'bg-[#8B2131] border-[#8B2131] text-white' : 'text-[#2C1810] hover:border-[#8B2131] hover:text-[#8B2131]'}`}
                  >
                    <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Accordion Sections */}
            <div className="divide-y divide-[#E6D5B8] border-t border-[#E6D5B8]">
              {/* Features */}
              <div className="py-5">
                <button onClick={() => toggleSection('features')} className="flex items-center justify-between w-full text-left group">
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-[#8B2131]" />
                    <span className="font-serif text-lg text-[#2C1810] group-hover:text-[#8B2131] transition-colors">Premium Features</span>
                  </div>
                  {expandedSections.features ? <Minus className="w-4 h-4 text-[#8B2131]" /> : <Plus className="w-4 h-4 text-[#8B2131]" />}
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${expandedSections.features ? 'mt-6 max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="grid grid-cols-1 gap-3">
                    {product.features?.map((feature: string, index: number) => (
                      <div key={index} className="flex items-center gap-3 text-sm text-[#5D4037]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8B2131]"></span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div className="py-5">
                <button onClick={() => toggleSection('specifications')} className="flex items-center justify-between w-full text-left group">
                  <div className="flex items-center gap-3">
                    <Info className="w-5 h-5 text-[#8B2131]" />
                    <span className="font-serif text-lg text-[#2C1810] group-hover:text-[#8B2131] transition-colors">Product Details</span>
                  </div>
                  {expandedSections.specifications ? <Minus className="w-4 h-4 text-[#8B2131]" /> : <Plus className="w-4 h-4 text-[#8B2131]" />}
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${expandedSections.specifications ? 'mt-6 max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="space-y-4 bg-[#FFF8F0] p-6 rounded-sm border border-[#E6D5B8]/30">
                    {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm border-b border-[#E6D5B8]/20 pb-2 last:border-0 last:pb-0">
                        <span className="text-[#5D4037]/80 capitalize font-medium">{key.replace('_', ' ')}</span>
                        <span className="text-[#2C1810] font-sans">{value as string}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm border-b border-[#E6D5B8]/20 pb-2">
                      <span className="text-[#5D4037]/80 capitalize font-medium">SKU</span>
                      <span className="text-[#2C1810] font-sans">{product.sku}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="py-5">
                <button onClick={() => toggleSection('details')} className="flex items-center justify-between w-full text-left group">
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-[#8B2131]" />
                    <span className="font-serif text-lg text-[#2C1810] group-hover:text-[#8B2131] transition-colors">Delivery & Care</span>
                  </div>
                  {expandedSections.details ? <Minus className="w-4 h-4 text-[#8B2131]" /> : <Plus className="w-4 h-4 text-[#8B2131]" />}
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${expandedSections.details ? 'mt-6 max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="flex gap-4 p-4 items-start">
                    <div className="flex-1 text-sm text-[#5D4037] leading-relaxed">
                      <p className="mb-2"><strong>Freshness Guaranteed:</strong> We prepare orders fresh upon confirmation.</p>
                      <p><strong>Shipping:</strong> Standard delivery within 3-5 business days.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-[#E6D5B8] pt-20">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#8B2131] mb-3 block">You May Also Like</span>
                <h2 className="text-3xl md:text-5xl font-serif text-[#2C1810]">Curated Suggestions</h2>
              </div>
              <div className="flex gap-3">
                <button onClick={prevRelatedSlide} disabled={!canGoPrevRelated} className="w-12 h-12 border border-[#E6D5B8] flex items-center justify-center text-[#2C1810] hover:bg-[#8B2131] hover:text-white hover:border-[#8B2131] transition-all duration-300 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#2C1810]">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={nextRelatedSlide} disabled={!canGoNextRelated} className="w-12 h-12 border border-[#E6D5B8] flex items-center justify-center text-[#2C1810] hover:bg-[#8B2131] hover:text-white hover:border-[#8B2131] transition-all duration-300 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#2C1810]">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-hidden -mx-3">
              <div
                className="flex transition-transform duration-700 ease-out"
                style={{
                  transform: `translateX(-${relatedCurrentIndex * (100 / itemsPerView)}%)`,
                  width: `${(relatedProducts.length / itemsPerView) * 100}%`
                }}
              >
                {relatedProducts.map((relatedProduct: any) => (
                  <div
                    key={relatedProduct.id}
                    className="px-3"
                    style={{ width: `${100 / relatedProducts.length}%` }}
                  >
                    <ProductCard
                      product={{
                        ...relatedProduct,
                        image: relatedProduct.images?.[0] || '/placeholder.svg',
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;