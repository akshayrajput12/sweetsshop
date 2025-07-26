import { useState } from 'react';
import { User, Mail, Phone, MapPin, Settings, Package, Heart, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useStore } from '@/store/useStore';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { user, logout } = useStore();
  const { toast } = useToast();
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+91 98765 43210',
    address: '123 Food Street, Mumbai, Maharashtra 400001'
  });

  const orders = [
    {
      id: 'ORD-001',
      date: '2024-01-15',
      status: 'Delivered',
      total: 2499,
      items: 3
    },
    {
      id: 'ORD-002',
      date: '2024-01-10',
      status: 'Processing',
      total: 1899,
      items: 2
    },
    {
      id: 'ORD-003',
      date: '2024-01-05',
      status: 'Delivered',
      total: 3299,
      items: 4
    }
  ];

  const addresses = [
    {
      id: 1,
      type: 'Home',
      address: '123 Food Street, Mumbai, Maharashtra 400001',
      isDefault: true
    },
    {
      id: 2,
      type: 'Office',
      address: '456 Business Park, Andheri, Mumbai, Maharashtra 400053',
      isDefault: false
    }
  ];

  const handleSaveProfile = () => {
    toast({
      title: "Profile updated!",
      description: "Your profile information has been saved.",
    });
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Please log in to view your profile</h1>
        <Button>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <h3 className="font-bold text-lg">{user.name}</h3>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
              
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Account Settings
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Package className="h-4 w-4 mr-2" />
                  Order History
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <MapPin className="h-4 w-4 mr-2" />
                  Addresses
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Heart className="h-4 w-4 mr-2" />
                  Wishlist
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payment Methods
                </Button>
              </div>
              
              <Separator className="my-4" />
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleLogout}
              >
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="addresses">Addresses</TabsTrigger>
              <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={profileData.address}
                        onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <Button onClick={handleSaveProfile}>Save Changes</Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">{order.id}</h3>
                            <p className="text-sm text-muted-foreground">
                              Ordered on {new Date(order.date).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge 
                            variant={order.status === 'Delivered' ? 'default' : 'secondary'}
                          >
                            {order.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm">{order.items} items</p>
                          <p className="font-bold">₹{order.total.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses">
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    Saved Addresses
                    <Button size="sm">Add New Address</Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div key={address.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold">{address.type}</h3>
                              {address.isDefault && (
                                <Badge variant="secondary">Default</Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground">{address.address}</p>
                          </div>
                          <div className="space-x-2">
                            <Button variant="outline" size="sm">Edit</Button>
                            <Button variant="destructive" size="sm">Delete</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Wishlist Tab */}
            <TabsContent value="wishlist">
              <Card>
                <CardHeader>
                  <CardTitle>My Wishlist</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
                    <p className="text-muted-foreground mb-4">
                      Save items you love to your wishlist
                    </p>
                    <Button>Continue Shopping</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;