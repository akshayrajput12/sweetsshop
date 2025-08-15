import { useState, useEffect } from 'react';
import { Mail, Phone, User, Calendar, MessageSquare, Eye, CheckCircle, Clock, AlertCircle } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

const AdminContactMessages = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
  }, [statusFilter]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      toast({
        title: "Error",
        description: "Failed to fetch contact messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMessageStatus = async (messageId: string, status: string, priority?: string) => {
    try {
      setUpdating(true);
      
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };
      
      if (priority) {
        updateData.priority = priority;
      }
      
      if (status === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('contact_messages')
        .update(updateData)
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Message status updated to ${status}`,
      });

      fetchMessages();
      if (selectedMessage?.id === messageId) {
        setSelectedMessage({ ...selectedMessage, status: status as any });
      }
    } catch (error) {
      console.error('Error updating message status:', error);
      toast({
        title: "Error",
        description: "Failed to update message status",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const updateAdminNotes = async (messageId: string) => {
    try {
      setUpdating(true);
      
      const { error } = await supabase
        .from('contact_messages')
        .update({ 
          admin_notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: "Notes Updated",
        description: "Admin notes have been saved",
      });

      fetchMessages();
      if (selectedMessage) {
        setSelectedMessage({ ...selectedMessage, admin_notes: adminNotes });
      }
    } catch (error) {
      console.error('Error updating admin notes:', error);
      toast({
        title: "Error",
        description: "Failed to update admin notes",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'closed': return <CheckCircle className="w-4 h-4 text-gray-500" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: messages.length,
    new: messages.filter(m => m.status === 'new').length,
    inProgress: messages.filter(m => m.status === 'in_progress').length,
    resolved: messages.filter(m => m.status === 'resolved').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Contact Messages</h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Messages</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Messages</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{message.name}</p>
                          <p className="text-sm text-muted-foreground">{message.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium truncate max-w-xs">{message.subject}</p>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(message.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(message.status)}
                            <span>{message.status.replace('_', ' ')}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(message.priority)}>
                          {message.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(message.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedMessage(message);
                            setAdminNotes(message.admin_notes || '');
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Message Details */}
        <div>
          {selectedMessage ? (
            <Card>
              <CardHeader>
                <CardTitle>Message Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Customer</Label>
                  <div className="mt-1">
                    <p className="font-medium">{selectedMessage.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Mail className="w-3 h-3 mr-1" />
                      {selectedMessage.email}
                    </p>
                    {selectedMessage.phone && (
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {selectedMessage.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Subject</Label>
                  <p className="mt-1">{selectedMessage.subject}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Message</Label>
                  <p className="mt-1 text-sm bg-gray-50 p-3 rounded-md">
                    {selectedMessage.message}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Select
                      value={selectedMessage.status}
                      onValueChange={(value) => updateMessageStatus(selectedMessage.id, value)}
                      disabled={updating}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Priority</Label>
                    <Select
                      value={selectedMessage.priority}
                      onValueChange={(value) => updateMessageStatus(selectedMessage.id, selectedMessage.status, value)}
                      disabled={updating}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Admin Notes</Label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add internal notes about this message..."
                    rows={3}
                    className="mt-1"
                  />
                  <Button
                    onClick={() => updateAdminNotes(selectedMessage.id)}
                    disabled={updating}
                    size="sm"
                    className="mt-2"
                  >
                    {updating ? 'Saving...' : 'Save Notes'}
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground">
                  <p>Created: {new Date(selectedMessage.created_at).toLocaleString()}</p>
                  <p>Updated: {new Date(selectedMessage.updated_at).toLocaleString()}</p>
                  {selectedMessage.resolved_at && (
                    <p>Resolved: {new Date(selectedMessage.resolved_at).toLocaleString()}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a message to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminContactMessages;