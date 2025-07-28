import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  image: string;
  sortOrder: number;
  metaTitle?: string;
  metaDescription?: string;
}

interface CategoryFormProps {
  category?: Category;
  isEdit?: boolean;
}

const CategoryForm = ({ category, isEdit = false }: CategoryFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<Partial<Category>>({
    name: category?.name || '',
    description: category?.description || '',
    status: category?.status || 'active',
    image: category?.image || '',
    sortOrder: category?.sortOrder || 0,
    metaTitle: category?.metaTitle || '',
    metaDescription: category?.metaDescription || ''
  });

  const handleInputChange = (field: keyof Category, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description) {
      toast({
        title: "Missing required fields",
        description: "Please fill in name and description.",
        variant: "destructive",
      });
      return;
    }

    const categoryData: Category = {
      id: category?.id || `cat_${Date.now()}`,
      name: formData.name!,
      description: formData.description!,
      status: formData.status as 'active' | 'inactive',
      image: formData.image || '/api/placeholder/300/200',
      sortOrder: Number(formData.sortOrder) || 0,
      metaTitle: formData.metaTitle,
      metaDescription: formData.metaDescription
    };

    console.log(isEdit ? 'Updating category:' : 'Creating category:', categoryData);
    
    toast({
      title: isEdit ? "Category updated!" : "Category created!",
      description: `${categoryData.name} has been ${isEdit ? 'updated' : 'added'} successfully.`,
    });
    
    navigate('/admin/categories');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate('/admin/categories')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Categories
        </Button>
        <h1 className="text-3xl font-bold">
          {isEdit ? 'Edit Category' : 'Add New Category'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter category name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter category description"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => handleInputChange('sortOrder', Number(e.target.value))}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                  placeholder="SEO meta title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                  placeholder="SEO meta description"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Category Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image">Upload Image</Label>
                <input
                  id="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        const result = e.target?.result as string;
                        handleInputChange('image', result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('imageFile')?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Image
                </Button>
              </div>
              
              {!formData.image && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    Upload category image
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG up to 10MB
                  </p>
                </div>
              )}

              {formData.image && (
                <div className="relative">
                  <img
                    src={formData.image}
                    alt="Category preview"
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

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Button type="submit" className="w-full">
                  {isEdit ? 'Update Category' : 'Create Category'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/admin/categories')}
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

export default CategoryForm;