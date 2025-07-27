import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
  image: string;
}

const AdminCategories = () => {
  const navigate = useNavigate();
  // Sample categories data
  const categories: Category[] = [
    {
      id: '1',
      name: 'Chicken',
      description: 'Fresh chicken products including breasts, thighs, and whole chicken',
      productCount: 15,
      status: 'active',
      createdAt: '2024-01-15',
      image: '/src/assets/product-chicken.jpg'
    },
    {
      id: '2',
      name: 'Beef',
      description: 'Premium beef cuts including steaks, ground beef, and roasts',
      productCount: 12,
      status: 'active',
      createdAt: '2024-01-10',
      image: '/src/assets/product-steak.jpg'
    },
    {
      id: '3',
      name: 'Seafood',
      description: 'Fresh seafood including fish, prawns, and shellfish',
      productCount: 8,
      status: 'active',
      createdAt: '2024-01-08',
      image: '/src/assets/product-seafood.jpg'
    },
    {
      id: '4',
      name: 'Pork',
      description: 'Quality pork products including chops, bacon, and sausages',
      productCount: 6,
      status: 'inactive',
      createdAt: '2024-01-05',
      image: '/src/assets/product-chicken.jpg'
    },
    {
      id: '5',
      name: 'Lamb',
      description: 'Tender lamb cuts for special occasions',
      productCount: 4,
      status: 'active',
      createdAt: '2024-01-03',
      image: '/src/assets/product-steak.jpg'
    }
  ];

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Button onClick={() => navigate('/admin/categories/add')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              {categories.filter(c => c.status === 'active').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.reduce((sum, cat) => sum + cat.productCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(categories.reduce((sum, cat) => sum + cat.productCount, 0) / categories.length)}
            </div>
            <p className="text-xs text-muted-foreground">Per category</p>
          </CardContent>
        </Card>
      </div>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Categories List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="flex items-center space-x-3">
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-sm text-muted-foreground">ID: {category.id}</p>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm text-muted-foreground truncate">
                      {category.description}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {category.productCount} products
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(category.status)}>
                      {category.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{category.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate(`/admin/categories/edit/${category.id}`)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCategories;