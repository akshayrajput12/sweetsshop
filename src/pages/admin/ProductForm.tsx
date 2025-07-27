import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Product, ProductFeatures, NutritionalInfo, MarketingInfo } from '@/store/useStore';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface ProductFormProps {
  product?: Product;
  isEdit?: boolean;
}

const ProductForm = ({ product, isEdit = false }: ProductFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: product?.name || '',
    price: product?.price || 0,
    originalPrice: product?.originalPrice || 0,
    category: product?.category || '',
    weight: product?.weight || '',
    pieces: product?.pieces || '',
    description: product?.description || '',
    nutrition: product?.nutrition || '',
    serves: product?.serves || 1,
    storageInstructions: product?.storageInstructions || '',
    inStock: product?.inStock ?? true,
    image: product?.image || '',
    rating: product?.rating || 4.5,
    slug: product?.slug || ''
  });

  const [nutritionalInfo, setNutritionalInfo] = useState<NutritionalInfo>({
    totalEnergy: product?.nutritionalInfo?.totalEnergy || '',
    carbohydrate: product?.nutritionalInfo?.carbohydrate || '',
    fat: product?.nutritionalInfo?.fat || '',
    protein: product?.nutritionalInfo?.protein || ''
  });

  const [marketingInfo, setMarketingInfo] = useState<MarketingInfo>({
    marketedBy: product?.marketingInfo?.marketedBy || '',
    address: product?.marketingInfo?.address || '',
    city: product?.marketingInfo?.city || '',
    state: product?.marketingInfo?.state || '',
    fssaiLicense: product?.marketingInfo?.fssaiLicense || ''
  });

  const [features, setFeatures] = useState<ProductFeatures>({
    humanlyRaised: product?.features?.humanlyRaised || false,
    handSelected: product?.features?.handSelected || false,
    temperatureControlled: product?.features?.temperatureControlled || false,
    artisanalCut: product?.features?.artisanalCut || false,
    hygienicallyVacuumPacked: product?.features?.hygienicallyVacuumPacked || false,
    netWeightOfPreppedMeat: product?.features?.netWeightOfPreppedMeat || false,
    qualityAndFoodsafetyChecks: product?.features?.qualityAndFoodsafetyChecks || false,
    mixOfOffalOrgans: product?.features?.mixOfOffalOrgans || false,
    antibioticResidueFree: product?.features?.antibioticResidueFree || false
  });

  const categories = ['Chicken', 'Beef', 'Seafood', 'Pork', 'Lamb', 'Ready to Cook'];

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleInputChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'name' && { slug: generateSlug(value) })
    }));
  };

  const handleFeatureChange = (feature: keyof ProductFeatures, checked: boolean) => {
    setFeatures(prev => ({ ...prev, [feature]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.price) {
      toast({
        title: "Missing required fields",
        description: "Please fill in name, category, and price.",
        variant: "destructive",
      });
      return;
    }

    const productData: Product = {
      id: product?.id || `prod_${Date.now()}`,
      name: formData.name!,
      price: Number(formData.price),
      originalPrice: Number(formData.originalPrice) || Number(formData.price),
      category: formData.category!,
      weight: formData.weight!,
      pieces: formData.pieces,
      description: formData.description,
      nutrition: formData.nutrition,
      serves: Number(formData.serves) || 1,
      storageInstructions: formData.storageInstructions,
      inStock: formData.inStock!,
      image: formData.image || '/api/placeholder/300/300',
      rating: Number(formData.rating) || 4.5,
      slug: formData.slug || generateSlug(formData.name!),
      nutritionalInfo,
      marketingInfo,
      features
    };

    console.log(isEdit ? 'Updating product:' : 'Creating product:', productData);
    
    toast({
      title: isEdit ? "Product updated!" : "Product created!",
      description: `${productData.name} has been ${isEdit ? 'updated' : 'added'} successfully.`,
    });
    
    navigate('/admin/products');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate('/admin/products')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
        <h1 className="text-3xl font-bold">
          {isEdit ? 'Edit Product' : 'Add New Product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="product-url-slug"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter product description"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nutrition">Nutrition Information</Label>
                <Textarea
                  id="nutrition"
                  value={formData.nutrition}
                  onChange={(e) => handleInputChange('nutrition', e.target.value)}
                  placeholder="Enter nutrition information"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="storage">Storage Instructions</Label>
                <Textarea
                  id="storage"
                  value={formData.storageInstructions}
                  onChange={(e) => handleInputChange('storageInstructions', e.target.value)}
                  placeholder="Enter storage instructions"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Inventory */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', Number(e.target.value))}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="originalPrice">Original Price (₹)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => handleInputChange('originalPrice', Number(e.target.value))}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rating">Rating</Label>
                  <Input
                    id="rating"
                    type="number"
                    value={formData.rating}
                    onChange={(e) => handleInputChange('rating', Number(e.target.value))}
                    placeholder="4.5"
                    min="0"
                    max="5"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight</Label>
                  <Input
                    id="weight"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    placeholder="e.g., 500g, 1kg"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pieces">Pieces</Label>
                  <Input
                    id="pieces"
                    value={formData.pieces}
                    onChange={(e) => handleInputChange('pieces', e.target.value)}
                    placeholder="e.g., 6-8 pieces"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serves">Serves</Label>
                  <Input
                    id="serves"
                    type="number"
                    value={formData.serves}
                    onChange={(e) => handleInputChange('serves', Number(e.target.value))}
                    placeholder="1"
                    min="1"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inStock"
                  checked={formData.inStock}
                  onCheckedChange={(checked) => handleInputChange('inStock', checked)}
                />
                <Label htmlFor="inStock">In Stock</Label>
              </div>
            </CardContent>
          </Card>

          {/* Product Features */}
          <Card>
            <CardHeader>
              <CardTitle>Product Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(features).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={key}
                      checked={value}
                      onCheckedChange={(checked) => handleFeatureChange(key as keyof ProductFeatures, checked as boolean)}
                    />
                    <Label htmlFor={key} className="text-sm">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Image */}
          <Card>
            <CardHeader>
              <CardTitle>Product Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  placeholder="Enter image URL"
                />
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">
                  Drag & drop an image or click to browse
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PNG, JPG up to 10MB
                </p>
              </div>

              {formData.image && (
                <div className="relative">
                  <img
                    src={formData.image}
                    alt="Product preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => handleInputChange('image', '')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Nutritional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Nutritional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="totalEnergy">Total Energy</Label>
                <Input
                  id="totalEnergy"
                  value={nutritionalInfo.totalEnergy}
                  onChange={(e) => setNutritionalInfo({...nutritionalInfo, totalEnergy: e.target.value})}
                  placeholder="e.g., 165 kcal"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="protein">Protein</Label>
                <Input
                  id="protein"
                  value={nutritionalInfo.protein}
                  onChange={(e) => setNutritionalInfo({...nutritionalInfo, protein: e.target.value})}
                  placeholder="e.g., 25g"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fat">Fat</Label>
                <Input
                  id="fat"
                  value={nutritionalInfo.fat}
                  onChange={(e) => setNutritionalInfo({...nutritionalInfo, fat: e.target.value})}
                  placeholder="e.g., 8g"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="carbohydrate">Carbohydrate</Label>
                <Input
                  id="carbohydrate"
                  value={nutritionalInfo.carbohydrate}
                  onChange={(e) => setNutritionalInfo({...nutritionalInfo, carbohydrate: e.target.value})}
                  placeholder="e.g., 0g"
                />
              </div>
            </CardContent>
          </Card>

          {/* Marketing Information */}
          <Card>
            <CardHeader>
              <CardTitle>Marketing Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="marketedBy">Marketed By</Label>
                <Input
                  id="marketedBy"
                  value={marketingInfo.marketedBy}
                  onChange={(e) => setMarketingInfo({...marketingInfo, marketedBy: e.target.value})}
                  placeholder="Company name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={marketingInfo.address}
                  onChange={(e) => setMarketingInfo({...marketingInfo, address: e.target.value})}
                  placeholder="Company address"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={marketingInfo.city}
                    onChange={(e) => setMarketingInfo({...marketingInfo, city: e.target.value})}
                    placeholder="City"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={marketingInfo.state}
                    onChange={(e) => setMarketingInfo({...marketingInfo, state: e.target.value})}
                    placeholder="State"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fssaiLicense">FSSAI License</Label>
                <Input
                  id="fssaiLicense"
                  value={marketingInfo.fssaiLicense}
                  onChange={(e) => setMarketingInfo({...marketingInfo, fssaiLicense: e.target.value})}
                  placeholder="FSSAI license number"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Button type="submit" className="w-full">
                  {isEdit ? 'Update Product' : 'Create Product'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/admin/products')}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;