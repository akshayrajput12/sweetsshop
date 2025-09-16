import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  PlusCircle, 
  Trash2, 
  Save, 
  AlertCircle,
  Star
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string | null;
  image_url: string | null;
  text: string;
  rating: number | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const Testimonials = () => {
  const supabaseClient = supabase;
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState({
    name: '',
    role: '',
    company: '',
    image_url: '',
    text: '',
    rating: 5,
    is_active: true,
    sort_order: 0
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Testimonial | null>(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseClient
        .from('testimonials')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch testimonials',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestimonial = async () => {
    try {
      setSaving(true);
      const { error } = await supabaseClient
        .from('testimonials')
        .insert([{
          name: newTestimonial.name,
          role: newTestimonial.role,
          company: newTestimonial.company || null,
          image_url: newTestimonial.image_url || null,
          text: newTestimonial.text,
          rating: newTestimonial.rating,
          is_active: newTestimonial.is_active,
          sort_order: newTestimonial.sort_order || testimonials.length + 1
        }]);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Testimonial created successfully'
      });
      
      setNewTestimonial({
        name: '',
        role: '',
        company: '',
        image_url: '',
        text: '',
        rating: 5,
        is_active: true,
        sort_order: 0
      });
      
      fetchTestimonials();
    } catch (error) {
      console.error('Error creating testimonial:', error);
      toast({
        title: 'Error',
        description: 'Failed to create testimonial',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTestimonial = async () => {
    if (!editData) return;
    
    try {
      setSaving(true);
      const { error } = await supabaseClient
        .from('testimonials')
        .update({
          name: editData.name,
          role: editData.role,
          company: editData.company,
          image_url: editData.image_url,
          text: editData.text,
          rating: editData.rating,
          is_active: editData.is_active,
          sort_order: editData.sort_order
        })
        .eq('id', editData.id);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Testimonial updated successfully'
      });
      
      setEditingId(null);
      setEditData(null);
      fetchTestimonials();
    } catch (error) {
      console.error('Error updating testimonial:', error);
      toast({
        title: 'Error',
        description: 'Failed to update testimonial',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    try {
      const { error } = await supabaseClient
        .from('testimonials')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Testimonial deleted successfully'
      });
      
      fetchTestimonials();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete testimonial',
        variant: 'destructive'
      });
    }
  };

  const startEditing = (testimonial: Testimonial) => {
    setEditingId(testimonial.id);
    setEditData({ ...testimonial });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditData(null);
  };

  const moveTestimonial = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = testimonials.findIndex(testimonial => testimonial.id === id);
    if (currentIndex === -1) return;
    
    let newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= testimonials.length) return;
    
    const updatedTestimonials = [...testimonials];
    const temp = updatedTestimonials[currentIndex].sort_order;
    updatedTestimonials[currentIndex].sort_order = updatedTestimonials[newIndex].sort_order;
    updatedTestimonials[newIndex].sort_order = temp;
    
    setTestimonials(updatedTestimonials);
    
    try {
      // Update both testimonials in database
      const { error } = await supabaseClient
        .from('testimonials')
        .update({ sort_order: updatedTestimonials[currentIndex].sort_order })
        .eq('id', updatedTestimonials[currentIndex].id);
      
      if (error) throw error;
      
      const { error: error2 } = await supabaseClient
        .from('testimonials')
        .update({ sort_order: updatedTestimonials[newIndex].sort_order })
        .eq('id', updatedTestimonials[newIndex].id);
      
      if (error2) throw error2;
    } catch (error) {
      console.error('Error updating sort order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update sort order',
        variant: 'destructive'
      });
      fetchTestimonials(); // Revert to original order
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Testimonials</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Testimonial</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Enter customer name"
                value={newTestimonial.name}
                onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Input
                id="role"
                placeholder="Enter customer role"
                value={newTestimonial.role}
                onChange={(e) => setNewTestimonial({ ...newTestimonial, role: e.target.value })}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                placeholder="Enter company name"
                value={newTestimonial.company}
                onChange={(e) => setNewTestimonial({ ...newTestimonial, company: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                placeholder="Enter image URL"
                value={newTestimonial.image_url}
                onChange={(e) => setNewTestimonial({ ...newTestimonial, image_url: e.target.value })}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <div className="flex items-center space-x-2">
                {renderStars(newTestimonial.rating || 0)}
                <Input
                  id="rating"
                  type="number"
                  min="1"
                  max="5"
                  value={newTestimonial.rating}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, rating: parseInt(e.target.value) || 0 })}
                  className="w-20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sort_order">Sort Order</Label>
              <Input
                id="sort_order"
                type="number"
                min="0"
                value={newTestimonial.sort_order || ''}
                onChange={(e) => setNewTestimonial({ ...newTestimonial, sort_order: parseInt(e.target.value) || 0 })}
                className="w-32"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="text">Testimonial Text *</Label>
            <Textarea
              id="text"
              placeholder="Enter testimonial text"
              value={newTestimonial.text}
              onChange={(e) => setNewTestimonial({ ...newTestimonial, text: e.target.value })}
              rows={4}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={newTestimonial.is_active}
              onCheckedChange={(checked) => setNewTestimonial({ ...newTestimonial, is_active: checked })}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>
          
          <Button onClick={handleCreateTestimonial} disabled={saving}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {saving ? 'Adding...' : 'Add Testimonial'}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Existing Testimonials</h2>
        
        {testimonials.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="mx-auto h-12 w-12" />
            <p className="mt-2">No testimonials found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="overflow-hidden">
                <CardContent className="p-4">
                  {editingId === testimonial.id && editData ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Name *</Label>
                        <Input
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Role *</Label>
                        <Input
                          value={editData.role}
                          onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Company</Label>
                        <Input
                          value={editData.company || ''}
                          onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Image URL</Label>
                        <Input
                          value={editData.image_url || ''}
                          onChange={(e) => setEditData({ ...editData, image_url: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Rating</Label>
                        <div className="flex items-center space-x-2">
                          {renderStars(editData.rating || 0)}
                          <Input
                            type="number"
                            min="1"
                            max="5"
                            value={editData.rating || ''}
                            onChange={(e) => setEditData({ ...editData, rating: parseInt(e.target.value) || 0 })}
                            className="w-20"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Sort Order</Label>
                        <Input
                          type="number"
                          min="0"
                          value={editData.sort_order}
                          onChange={(e) => setEditData({ ...editData, sort_order: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Testimonial Text *</Label>
                        <Textarea
                          value={editData.text}
                          onChange={(e) => setEditData({ ...editData, text: e.target.value })}
                          rows={3}
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={editData.is_active}
                          onCheckedChange={(checked) => setEditData({ ...editData, is_active: checked })}
                        />
                        <Label>Active</Label>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button onClick={handleUpdateTestimonial} size="sm" disabled={saving}>
                          <Save className="mr-2 h-4 w-4" />
                          {saving ? 'Saving...' : 'Save'}
                        </Button>
                        <Button variant="outline" onClick={cancelEditing} size="sm">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <img
                          src={testimonial.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=random`}
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=random`;
                          }}
                        />
                        <div>
                          <h3 className="font-medium">{testimonial.name}</h3>
                          <p className="text-sm text-muted-foreground">{testimonial.role}{testimonial.company ? `, ${testimonial.company}` : ''}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {renderStars(testimonial.rating || 0)}
                        <span className="text-sm text-muted-foreground ml-1">({testimonial.rating}/5)</span>
                      </div>
                      
                      <p className="text-sm line-clamp-3">{testimonial.text}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${testimonial.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {testimonial.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Order: {testimonial.sort_order}
                          </span>
                        </div>
                        
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => startEditing(testimonial)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteTestimonial(testimonial.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => moveTestimonial(testimonial.id, 'up')}
                          disabled={testimonials.findIndex(t => t.id === testimonial.id) === 0}
                        >
                          ↑
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => moveTestimonial(testimonial.id, 'down')}
                          disabled={testimonials.findIndex(t => t.id === testimonial.id) === testimonials.length - 1}
                        >
                          ↓
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Testimonials;