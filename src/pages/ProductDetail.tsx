import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, Star, Plus, Minus, ShoppingCart, Heart, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 mb-6 text-sm">
        <Link to="/" className="text-blue-600 hover:underline">Home</Link>
        <span className="text-gray-400">/</span>
        <Link to="/products" className="text-blue-600 hover:underline">BestPicks</Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-600">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
            <img
              src={product.images?.[0] || '/placeholder.svg'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {/* Licious Badge */}
            <div className="absolute top-4 left-4 bg-white rounded-full p-2 shadow-md">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">L</span>
              </div>
            </div>
            {/* Navigation arrows */}
            <button className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
            <Badge variant="secondary" className="mb-4">
              {product.categories?.name || 'Unknown'}
            </Badge>

            {/* Product Details */}
            <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
              <div className="flex items-center space-x-1">
                <span className="font-medium">{product.weight}</span>
              </div>
              {product.pieces && (
                <div className="flex items-center space-x-1">
                  <span className="font-medium">{product.pieces}</span>
                </div>
              )}
              {product.serves && (
                <div className="flex items-center space-x-1">
                  <span className="font-medium">Serves {product.serves}</span>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-700 mb-4 leading-relaxed">
              {product.description}
            </p>

            <button className="text-blue-600 text-sm font-medium mb-6">
              Read more
            </button>

            {/* Price */}
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-3xl font-bold text-black">
                {formatPrice(product.price)}
              </span>
              {product.original_price && (
                <>
                  <span className="text-lg text-gray-500 line-through">
                    MRP {formatPrice(product.original_price)}
                  </span>
                  <Badge variant="destructive" className="bg-red-500">
                    {discountPercentage}% off
                  </Badge>
                </>
              )}
            </div>

            <p className="text-xs text-gray-500 mb-4">(incl. of all taxes)</p>

            {/* Safety Message */}
            <div className="flex items-center space-x-2 text-red-600 text-sm mb-6">
              <span>🔒</span>
              <span className="font-medium">Only the Safest Chicken!</span>
            </div>

            {/* Delivery Info */}
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
              <Clock className="w-4 h-4" />
              <span>Today in 30 mins</span>
            </div>
          </div>

          {/* Add Button */}
          <Button
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg font-medium"
            onClick={handleAddToCart}
            disabled={product.stock_quantity <= 0}
          >
            Add +
          </Button>
        </div>
      </div>

      {/* Product Information Tabs */}
      <div className="mb-8">
        <Tabs defaultValue="what-you-get" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="what-you-get">What you get</TabsTrigger>
            <TabsTrigger value="sourcing">Sourcing</TabsTrigger>
          </TabsList>

          <TabsContent value="what-you-get" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column - Features */}
              <div className="space-y-4">
                {product.features && (
                  <>
                    {product.features.humanlyRaised && (
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Chicken humanely raised in restricted bio-security zones</span>
                      </div>
                    )}
                    {product.features.handSelected && (
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Hand selected after age and weight calibration</span>
                      </div>
                    )}
                    {product.features.temperatureControlled && (
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Temperature controlled Between 4°C-8°C</span>
                      </div>
                    )}
                    {product.features.artisanalCut && (
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Artisanal cut</span>
                      </div>
                    )}
                    {product.features.antibioticResidueFree && (
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Antibiotic residue Free</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Right Column - Features */}
              <div className="space-y-4">
                {product.features && (
                  <>
                    {product.features.artisanalCut && (
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Artisanal Cuts</span>
                      </div>
                    )}
                    {product.features.hygienicallyVacuumPacked && (
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Hygienically vacuum-packed</span>
                      </div>
                    )}
                    {product.features.netWeightOfPreppedMeat && (
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Net weight of prepped meat only</span>
                      </div>
                    )}
                    {product.features.qualityAndFoodsafetyChecks && (
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">150+ quality and foodsafety Checks</span>
                      </div>
                    )}
                    {product.features.mixOfOffalOrgans && (
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Mix of Offal Organs</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Licious Box Image */}
            <div className="mt-8 flex justify-center">
              <div className="w-64 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <img
                  src={product.image}
                  alt="Licious packaging"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sourcing" className="mt-6">
            <div className="space-y-6">
              {/* Nutritional Information */}
              {product.nutritional_info && (
                <div>
                  <h3 className="font-semibold mb-4">Nutritional Information (Approx Values per 100 g)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Total Energy</div>
                      <div className="font-medium">{product.nutritional_info.totalEnergy}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Carbohydrate</div>
                      <div className="font-medium">{product.nutritional_info.carbohydrate}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Fat</div>
                      <div className="font-medium">{product.nutritional_info.fat}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Protein</div>
                      <div className="font-medium">{product.nutritional_info.protein}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Storage Instructions */}
              {product.storageInstructions && (
                <div>
                  <p className="text-sm text-gray-700">{product.storageInstructions}</p>
                </div>
              )}

              {/* Marketing Information */}
              {product.marketingInfo && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Marketed By:</h3>
                  <div className="text-sm text-gray-700">
                    <p>{product.marketingInfo.marketedBy}</p>
                    <p>{product.marketingInfo.address}</p>
                    <p>{product.marketingInfo.city}</p>
                    <p>{product.marketingInfo.state}</p>
                    <p className="mt-2">{product.marketingInfo.fssaiLicense}</p>
                  </div>
                  <button className="text-blue-600 text-sm font-medium">
                    Read Less
                  </button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* You may also like section */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-6">You may also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {relatedProducts.map((relatedProduct: any) => (
              <ProductCard
                key={relatedProduct.id}
                product={{
                  ...relatedProduct,
                  image: relatedProduct.images?.[0] || '/placeholder.svg',
                  slug: relatedProduct.sku || relatedProduct.id,
                  category: relatedProduct.categories?.name || 'Unknown'
                }}
                onViewDetail={() => navigate(`/product/${relatedProduct.sku || relatedProduct.id}`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;