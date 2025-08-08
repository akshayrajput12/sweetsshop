import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id?: string;
  name: string;
  price: number;
  original_price?: number;
  category_id?: string;
  weight?: string;
  pieces?: string;
  serves?: number;
  storage_instructions?: string;
  description?: string;
  stock_quantity?: number;
  is_active?: boolean;
  is_bestseller?: boolean;
  images?: string[];
  features?: any;
  nutritional_info?: any;
  marketing_info?: any;
  sku?: string;
}

interface ProductFormProps {
  product?: Product;
  isEdit?: boolean;
}

const ProductForm = ({ product: propProduct, isEdit = false }: ProductFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams();
  
  const [formData, setFormData] = useState<Product>({
    name: '',
    price: 0,
    original_price: 0,
    category_id: '',
    weight: '',
    description: '',
    stock_quantity: 0,
    is_active: true,
    is_bestseller: false,
    sku: '',
    pieces: '',
    serves: 0,
    storage_instructions: ''
  });

  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const [productSpecs, setProductSpecs] = useState({
    material: '',
    dimensions: '',
    weight_per_unit: '',
    brand: '',
    model: '',
    warranty: '',
    certification: '',
    origin: ''
  });

  const [availableFeatures, setAvailableFeatures] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');

  const [marketingInfo, setMarketingInfo] = useState({
    marketedBy: '',
    address: '',
    city: '',
    state: '',
    fssaiLicense: ''
  });

  useEffect(() => {
    fetchCategories();
    fetchAvailableFeatures();
    if (id && isEdit) {
      fetchProduct();
    } else if (propProduct) {
      setFormData(propProduct);
      setImages(propProduct.images || []);
    }
  }, [id, isEdit, propProduct]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchAvailableFeatures = async () => {
    try {
      const { data, error } = await supabase
        .from('product_features')
        .select('name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setAvailableFeatures(data?.map(f => f.name) || []);
    } catch (error) {
      console.error('Error fetching features:', error);
      // Fallback to default features if table doesn't exist yet
      setAvailableFeatures([
        'Bulk Pack',
        'Wholesale Price',
        'Commercial Grade',
        'Energy Efficient',
        'Eco Friendly',
        'Premium Quality',
        'Fast Delivery',
        'Bulk Discount Available'
      ]);
    }
  };

  const fetchProduct = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      setFormData(data);
      setImages(data.images || []);
      if (data.nutritional_info && typeof data.nutritional_info === 'object') {
        setProductSpecs(data.nutritional_info as any);
      }
      if (data.features && Array.isArray(data.features)) {
        setSelectedFeatures(data.features as string[]);
      } else if (data.features && typeof data.features === 'object') {
        // Convert old format to new format
        const oldFeatures = data.features as any;
        const convertedFeatures = Object.entries(oldFeatures)
          .filter(([_, value]) => value === true)
          .map(([key, _]) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()));
        setSelectedFeatures(convertedFeatures);
      }
      if (data.marketing_info && typeof data.marketing_info === 'object') {
        setMarketingInfo({ ...marketingInfo, ...(data.marketing_info as any) });
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: "Error",
        description: "Failed to fetch product details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    for (let i = 0; i < Math.min(files.length, 10 - images.length); i++) {
      const file = files[i];
      const imageUrl = await uploadImage(file);
      if (imageUrl) {
        newImages.push(imageUrl);
      }
    }

    if (newImages.length > 0) {
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = async (index: number) => {
    const imageUrl = images[index];
    
    try {
      // Extract file path from URL for deletion
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts.slice(pathParts.indexOf('products')).join('/');
      
      await supabase.storage
        .from('product-images')
        .remove([filePath]);
    } catch (error) {
      console.error('Error removing image:', error);
    }

    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const addNewFeature = async () => {
    if (!newFeature.trim()) return;
    
    try {
      // Try to add to database first
      const { error } = await supabase
        .from('product_features')
        .insert({ name: newFeature.trim(), is_active: true });
      
      if (error && !error.message.includes('relation "product_features" does not exist')) {
        throw error;
      }
      
      // Add to local state
      if (!availableFeatures.includes(newFeature.trim())) {
        setAvailableFeatures(prev => [...prev, newFeature.trim()].sort());
      }
      
      // Add to selected features
      if (!selectedFeatures.includes(newFeature.trim())) {
        setSelectedFeatures(prev => [...prev, newFeature.trim()]);
      }
      
      setNewFeature('');
      
      toast({
        title: "Feature added",
        description: `"${newFeature.trim()}" has been added to available features.`,
      });
    } catch (error) {
      console.error('Error adding feature:', error);
      // Still add to local state even if database fails
      if (!availableFeatures.includes(newFeature.trim())) {
        setAvailableFeatures(prev => [...prev, newFeature.trim()].sort());
      }
      if (!selectedFeatures.includes(newFeature.trim())) {
        setSelectedFeatures(prev => [...prev, newFeature.trim()]);
      }
      setNewFeature('');
    }
  };

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const removeFeatureFromAvailable = async (feature: string) => {
    try {
      // Try to remove from database
      const { error } = await supabase
        .from('product_features')
        .update({ is_active: false })
        .eq('name', feature);
      
      if (error && !error.message.includes('relation "product_features" does not exist')) {
        throw error;
      }
      
      // Remove from local state
      setAvailableFeatures(prev => prev.filter(f => f !== feature));
      setSelectedFeatures(prev => prev.filter(f => f !== feature));
      
      toast({
        title: "Feature removed",
        description: `"${feature}" has been removed from available features.`,
      });
    } catch (error) {
      console.error('Error removing feature:', error);
      toast({
        title: "Error",
        description: "Failed to remove feature. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category_id || !formData.price) {
      toast({
        title: "Missing required fields",
        description: "Please fill in name, category, and price.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const productData = {
        name: formData.name,
        price: Number(formData.price),
        original_price: Number(formData.original_price) || Number(formData.price),
        category_id: formData.category_id,
        weight: formData.weight,
        description: formData.description,
        stock_quantity: Number(formData.stock_quantity) || 0,
        is_active: formData.is_active,
        is_bestseller: formData.is_bestseller,
        images: images,
        features: selectedFeatures,
        nutritional_info: productSpecs,
        sku: formData.sku,
        pieces: formData.pieces,
        serves: Number(formData.serves) || 0,
        storage_instructions: formData.storage_instructions,
        marketing_info: marketingInfo
      };

      if (isEdit && id) {
        const { error } = await supabase
          .from('products')
          .update({
            ...productData,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (error) throw error;
      }

      toast({
        title: isEdit ? "Product updated!" : "Product created!",
        description: `${formData.name} has been ${isEdit ? 'updated' : 'added'} successfully.`,
      });
      
      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
                    value={formData.category_id}
                    onValueChange={(value) => handleInputChange('category_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  placeholder="Product SKU"
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
                  <Label htmlFor="original_price">Original Price (₹)</Label>
                  <Input
                    id="original_price"
                    type="number"
                    value={formData.original_price}
                    onChange={(e) => handleInputChange('original_price', Number(e.target.value))}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">Stock Quantity</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => handleInputChange('stock_quantity', Number(e.target.value))}
                    placeholder="0"
                    min="0"
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
                    placeholder="e.g., 8-10 pieces"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="units">Units/Quantity</Label>
                  <Input
                    id="units"
                    type="number"
                    value={formData.serves}
                    onChange={(e) => handleInputChange('serves', Number(e.target.value))}
                    placeholder="e.g., 50 (for bulk pack)"
                    min="0"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_bestseller"
                    checked={formData.is_bestseller}
                    onCheckedChange={(checked) => handleInputChange('is_bestseller', checked)}
                  />
                  <Label htmlFor="is_bestseller">Mark as Best Seller</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Features */}
          <Card>
            <CardHeader>
              <CardTitle>Product Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add New Feature */}
              <div className="space-y-2">
                <Label>Add New Feature</Label>
                <div className="flex gap-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Enter new feature name"
                    onKeyPress={(e) => e.key === 'Enter' && addNewFeature()}
                  />
                  <Button type="button" onClick={addNewFeature} disabled={!newFeature.trim()}>
                    Add
                  </Button>
                </div>
              </div>

              {/* Available Features */}
              <div className="space-y-4">
                <Label>Available Features</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto border rounded-lg p-4">
                  {availableFeatures.map((feature) => (
                    <div key={feature} className="flex items-center justify-between space-x-2 p-2 hover:bg-muted rounded">
                      <div className="flex items-center space-x-2 flex-1">
                        <Checkbox
                          id={feature}
                          checked={selectedFeatures.includes(feature)}
                          onCheckedChange={() => toggleFeature(feature)}
                        />
                        <Label htmlFor={feature} className="text-sm cursor-pointer flex-1">
                          {feature}
                        </Label>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFeatureFromAvailable(feature)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Features Preview */}
              {selectedFeatures.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Features ({selectedFeatures.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedFeatures.map((feature) => (
                      <Badge key={feature} variant="secondary" className="flex items-center gap-1">
                        {feature}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFeature(feature)}
                          className="h-4 w-4 p-0 hover:bg-transparent"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images (Max 10)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="images">Upload Images</Label>
                <input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('images')?.click()}
                  disabled={images.length >= 10 || uploadingImage}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadingImage ? 'Uploading...' : `Upload Images (${images.length}/10)`}
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={() => removeImage(index)}
                      disabled={uploadingImage}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    {index === 0 && (
                      <Badge className="absolute bottom-1 left-1 text-xs">Primary</Badge>
                    )}
                  </div>
                ))}
              </div>

              {images.length === 0 && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    Upload product images
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG up to 10MB each, max 10 images
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Product Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="material">Material</Label>
                  <Input
                    id="material"
                    value={productSpecs.material}
                    onChange={(e) => setProductSpecs({...productSpecs, material: e.target.value})}
                    placeholder="e.g., Plastic, Metal, Cotton"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dimensions">Dimensions</Label>
                  <Input
                    id="dimensions"
                    value={productSpecs.dimensions}
                    onChange={(e) => setProductSpecs({...productSpecs, dimensions: e.target.value})}
                    placeholder="e.g., 30x20x15 cm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight_per_unit">Weight per Unit</Label>
                  <Input
                    id="weight_per_unit"
                    value={productSpecs.weight_per_unit}
                    onChange={(e) => setProductSpecs({...productSpecs, weight_per_unit: e.target.value})}
                    placeholder="e.g., 500g, 2kg"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={productSpecs.brand}
                    onChange={(e) => setProductSpecs({...productSpecs, brand: e.target.value})}
                    placeholder="e.g., Samsung, Nike"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={productSpecs.model}
                    onChange={(e) => setProductSpecs({...productSpecs, model: e.target.value})}
                    placeholder="e.g., Model XYZ-123"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="warranty">Warranty</Label>
                  <Input
                    id="warranty"
                    value={productSpecs.warranty}
                    onChange={(e) => setProductSpecs({...productSpecs, warranty: e.target.value})}
                    placeholder="e.g., 1 year, 6 months"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="certification">Certification</Label>
                  <Input
                    id="certification"
                    value={productSpecs.certification}
                    onChange={(e) => setProductSpecs({...productSpecs, certification: e.target.value})}
                    placeholder="e.g., ISO 9001, CE, FDA"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="origin">Country of Origin</Label>
                  <Input
                    id="origin"
                    value={productSpecs.origin}
                    onChange={(e) => setProductSpecs({...productSpecs, origin: e.target.value})}
                    placeholder="e.g., India, China, USA"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Storage & Marketing Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storage_instructions">Storage Instructions</Label>
                <Textarea
                  id="storage_instructions"
                  value={formData.storage_instructions}
                  onChange={(e) => handleInputChange('storage_instructions', e.target.value)}
                  placeholder="e.g., Store frozen at -18°C or below"
                  rows={2}
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Marketing Information</h3>
                
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
                  <Input
                    id="address"
                    value={marketingInfo.address}
                    onChange={(e) => setMarketingInfo({...marketingInfo, address: e.target.value})}
                    placeholder="Company address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    placeholder="FSSAI License number"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Button type="submit" className="w-full" disabled={loading || uploadingImage}>
                  {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/admin/products')}
                  disabled={loading}
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