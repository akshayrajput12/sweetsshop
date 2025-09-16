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
  Eye
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface InstagramPost {
  id: string;
  embed_html: string;
  caption: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const InstagramPosts = () => {
  const supabaseClient = supabase;
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newPost, setNewPost] = useState({
    embed_html: '',
    caption: '',
    is_active: true,
    sort_order: 0
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<InstagramPost | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseClient
        .from('instagram_posts')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching Instagram posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch Instagram posts',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    try {
      setSaving(true);
      const { error } = await supabaseClient
        .from('instagram_posts')
        .insert([{
          embed_html: newPost.embed_html,
          caption: newPost.caption,
          is_active: newPost.is_active,
          sort_order: newPost.sort_order || posts.length + 1
        }]);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Instagram post created successfully'
      });
      
      setNewPost({
        embed_html: '',
        caption: '',
        is_active: true,
        sort_order: 0
      });
      
      fetchPosts();
    } catch (error) {
      console.error('Error creating Instagram post:', error);
      toast({
        title: 'Error',
        description: 'Failed to create Instagram post',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePost = async () => {
    if (!editData) return;
    
    try {
      setSaving(true);
      const { error } = await supabaseClient
        .from('instagram_posts')
        .update({
          embed_html: editData.embed_html,
          caption: editData.caption,
          is_active: editData.is_active,
          sort_order: editData.sort_order
        })
        .eq('id', editData.id);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Instagram post updated successfully'
      });
      
      setEditingId(null);
      setEditData(null);
      fetchPosts();
    } catch (error) {
      console.error('Error updating Instagram post:', error);
      toast({
        title: 'Error',
        description: 'Failed to update Instagram post',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      const { error } = await supabaseClient
        .from('instagram_posts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Instagram post deleted successfully'
      });
      
      fetchPosts();
    } catch (error) {
      console.error('Error deleting Instagram post:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete Instagram post',
        variant: 'destructive'
      });
    }
  };

  const startEditing = (post: InstagramPost) => {
    setEditingId(post.id);
    setEditData({ ...post });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditData(null);
  };

  const movePost = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = posts.findIndex(post => post.id === id);
    if (currentIndex === -1) return;
    
    let newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= posts.length) return;
    
    const updatedPosts = [...posts];
    const temp = updatedPosts[currentIndex].sort_order;
    updatedPosts[currentIndex].sort_order = updatedPosts[newIndex].sort_order;
    updatedPosts[newIndex].sort_order = temp;
    
    setPosts(updatedPosts);
    
    try {
      // Update both posts in database
      const { error } = await supabaseClient
        .from('instagram_posts')
        .update({ sort_order: updatedPosts[currentIndex].sort_order })
        .eq('id', updatedPosts[currentIndex].id);
      
      if (error) throw error;
      
      const { error: error2 } = await supabaseClient
        .from('instagram_posts')
        .update({ sort_order: updatedPosts[newIndex].sort_order })
        .eq('id', updatedPosts[newIndex].id);
      
      if (error2) throw error2;
    } catch (error) {
      console.error('Error updating sort order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update sort order',
        variant: 'destructive'
      });
      fetchPosts(); // Revert to original order
    }
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
        <h1 className="text-3xl font-bold">Instagram Posts</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Instagram Post</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="embed_html">Embed HTML</Label>
              <Textarea
                id="embed_html"
                placeholder="Paste Instagram embed HTML here"
                value={newPost.embed_html}
                onChange={(e) => setNewPost({ ...newPost, embed_html: e.target.value })}
                rows={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caption">Caption</Label>
              <Textarea
                id="caption"
                placeholder="Enter caption for the post"
                value={newPost.caption}
                onChange={(e) => setNewPost({ ...newPost, caption: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={newPost.is_active}
                onCheckedChange={(checked) => setNewPost({ ...newPost, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sort_order">Sort Order</Label>
              <Input
                id="sort_order"
                type="number"
                min="0"
                value={newPost.sort_order || ''}
                onChange={(e) => setNewPost({ ...newPost, sort_order: parseInt(e.target.value) || 0 })}
                className="w-32"
              />
            </div>
          </div>
          
          <Button onClick={handleCreatePost} disabled={saving}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {saving ? 'Adding...' : 'Add Post'}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Existing Posts</h2>
        
        {posts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="mx-auto h-12 w-12" />
            <p className="mt-2">No Instagram posts found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card key={post.id} className="overflow-hidden">
                <CardContent className="p-4">
                  {editingId === post.id && editData ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Embed HTML</Label>
                        <Textarea
                          value={editData.embed_html}
                          onChange={(e) => setEditData({ ...editData, embed_html: e.target.value })}
                          rows={4}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Caption</Label>
                        <Textarea
                          value={editData.caption}
                          onChange={(e) => setEditData({ ...editData, caption: e.target.value })}
                          rows={2}
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={editData.is_active}
                          onCheckedChange={(checked) => setEditData({ ...editData, is_active: checked })}
                        />
                        <Label>Active</Label>
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
                      
                      <div className="flex space-x-2">
                        <Button onClick={handleUpdatePost} size="sm" disabled={saving}>
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
                      <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                        <div 
                          className="w-full h-full flex items-center justify-center p-2"
                          dangerouslySetInnerHTML={{ __html: post.embed_html }} 
                        />
                      </div>
                      
                      <p className="text-sm line-clamp-2">{post.caption}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${post.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {post.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Order: {post.sort_order}
                          </span>
                        </div>
                        
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => startEditing(post)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeletePost(post.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => movePost(post.id, 'up')}
                          disabled={posts.findIndex(p => p.id === post.id) === 0}
                        >
                          ↑
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => movePost(post.id, 'down')}
                          disabled={posts.findIndex(p => p.id === post.id) === posts.length - 1}
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

export default InstagramPosts;