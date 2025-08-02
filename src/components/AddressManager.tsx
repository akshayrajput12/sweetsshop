import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, Edit2, Trash2, Home, Briefcase, MapIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import LocationPicker from './LocationPicker';

interface Address {
  id: string;
  name: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  phone?: string;
  type: 'home' | 'work' | 'other';
  is_default: boolean;
  latitude?: number;
  longitude?: number;
}

interface AddressManagerProps {
  onAddressSelect?: (address: Address) => void;
  selectedAddressId?: string;
  showSelector?: boolean;
}

const AddressManager = ({ onAddressSelect, selectedAddressId, showSelector = false }: AddressManagerProps) => {
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    phone: '',
    type: 'home' as 'home' | 'work' | 'other',
    is_default: false
  });

  const [deliveryLocation, setDeliveryLocation] = useState<{
    address: string;
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setAddresses((data || []).map(addr => ({...addr, type: addr.type as 'home' | 'work' | 'other'})));
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast({
        title: "Error",
        description: "Failed to fetch addresses.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to save addresses.",
          variant: "destructive",
        });
        return;
      }

      const addressData = {
        ...formData,
        user_id: user.id,
        latitude: deliveryLocation?.lat,
        longitude: deliveryLocation?.lng
      };

      if (editingAddress) {
        // Update existing address
        const { error } = await supabase
          .from('addresses')
          .update(addressData)
          .eq('id', editingAddress.id);

        if (error) throw error;
        
        toast({
          title: "Address updated!",
          description: "Your address has been updated successfully.",
        });
      } else {
        // Create new address
        const { error } = await supabase
          .from('addresses')
          .insert([addressData]);

        if (error) throw error;
        
        toast({
          title: "Address saved!",
          description: "Your address has been saved successfully.",
        });
      }

      // If this is set as default, update others
      if (formData.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .neq('id', editingAddress?.id || '');
      }

      fetchAddresses();
      resetForm();
    } catch (error) {
      console.error('Error saving address:', error);
      toast({
        title: "Error",
        description: "Failed to save address.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (addressId: string) => {
    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId);

      if (error) throw error;
      
      toast({
        title: "Address deleted",
        description: "Address has been removed successfully.",
      });
      
      fetchAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      toast({
        title: "Error",
        description: "Failed to delete address.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      name: address.name,
      address_line_1: address.address_line_1,
      address_line_2: address.address_line_2 || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      landmark: address.landmark || '',
      phone: address.phone || '',
      type: address.type,
      is_default: address.is_default
    });
    
    if (address.latitude && address.longitude) {
      setDeliveryLocation({
        address: `${address.address_line_1}, ${address.city}`,
        lat: address.latitude,
        lng: address.longitude
      });
    }
    
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      pincode: '',
      landmark: '',
      phone: '',
      type: 'home',
      is_default: false
    });
    setDeliveryLocation(null);
    setEditingAddress(null);
    setShowForm(false);
  };

  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'home': return <Home className="h-4 w-4" />;
      case 'work': return <Briefcase className="h-4 w-4" />;
      default: return <MapIcon className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-muted rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Delivery Addresses</h2>
        <Button onClick={() => setShowForm(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add New Address
        </Button>
      </div>

      {/* Address List */}
      {addresses.length > 0 && (
        <div className="space-y-3">
          {addresses.map((address) => (
            <Card 
              key={address.id} 
              className={`cursor-pointer transition-all ${
                selectedAddressId === address.id ? 'ring-2 ring-primary' : ''
              } ${showSelector ? 'hover:ring-1 hover:ring-muted-foreground' : ''}`}
              onClick={() => showSelector && onAddressSelect?.(address)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getAddressIcon(address.type)}
                      <span className="font-medium">{address.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {address.type.charAt(0).toUpperCase() + address.type.slice(1)}
                      </Badge>
                      {address.is_default && (
                        <Badge className="text-xs">Default</Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>{address.address_line_1}</p>
                      {address.address_line_2 && <p>{address.address_line_2}</p>}
                      <p>{address.city}, {address.state} - {address.pincode}</p>
                      {address.landmark && <p>Near {address.landmark}</p>}
                      {address.phone && <p>Phone: {address.phone}</p>}
                    </div>
                  </div>

                  {!showSelector && (
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(address)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(address.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No addresses message */}
      {addresses.length === 0 && !showForm && (
        <Card>
          <CardContent className="text-center py-8">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No addresses saved</h3>
            <p className="text-muted-foreground mb-4">
              Add a delivery address to get started
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Address
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Address Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Location Picker */}
              <div className="space-y-2">
                <Label>Delivery Location *</Label>
                <LocationPicker 
                  onLocationSelect={setDeliveryLocation}
                  initialLocation={deliveryLocation}
                />
              </div>

              {/* Address Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Address Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Home, Office"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Address Type</Label>
                  <Select value={formData.type} onValueChange={(value: 'home' | 'work' | 'other') => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Home</SelectItem>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_line_1">Address Line 1 *</Label>
                <Input
                  id="address_line_1"
                  value={formData.address_line_1}
                  onChange={(e) => setFormData({...formData, address_line_1: e.target.value})}
                  placeholder="House/Flat number, Building name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_line_2">Address Line 2</Label>
                <Input
                  id="address_line_2"
                  value={formData.address_line_2}
                  onChange={(e) => setFormData({...formData, address_line_2: e.target.value})}
                  placeholder="Street, Area"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    placeholder="City"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    placeholder="State"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                    placeholder="6-digit pincode"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="landmark">Landmark</Label>
                  <Input
                    id="landmark"
                    value={formData.landmark}
                    onChange={(e) => setFormData({...formData, landmark: e.target.value})}
                    placeholder="Nearby landmark"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="Contact number"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_default"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({...formData, is_default: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="is_default">Set as default address</Label>
              </div>

              <div className="flex space-x-4">
                <Button type="submit" className="flex-1">
                  {editingAddress ? 'Update Address' : 'Save Address'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AddressManager;