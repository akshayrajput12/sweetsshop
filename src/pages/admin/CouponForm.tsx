import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, CalendarIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Coupon {
  id: string;
  code: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  usageLimit: number;
  usedCount: number;
  validFrom: Date;
  validUntil: Date;
  status: 'active' | 'inactive' | 'expired';
  isFirstTimeUser?: boolean;
  applicableCategories?: string[];
  excludedProducts?: string[];
}

interface CouponFormProps {
  coupon?: Coupon;
  isEdit?: boolean;
}

const CouponForm = ({ coupon, isEdit = false }: CouponFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<Partial<Coupon>>({
    code: coupon?.code || '',
    description: coupon?.description || '',
    type: coupon?.type || 'percentage',
    value: coupon?.value || 0,
    minOrderValue: coupon?.minOrderValue || 0,
    maxDiscountAmount: coupon?.maxDiscountAmount || 0,
    usageLimit: coupon?.usageLimit || 0,
    usedCount: coupon?.usedCount || 0,
    validFrom: coupon?.validFrom || new Date(),
    validUntil: coupon?.validUntil || new Date(),
    status: coupon?.status || 'active',
    isFirstTimeUser: coupon?.isFirstTimeUser || false,
    applicableCategories: coupon?.applicableCategories || [],
    excludedProducts: coupon?.excludedProducts || []
  });

  const categories = ['Chicken', 'Beef', 'Seafood', 'Pork', 'Lamb', 'Ready to Cook'];

  const handleInputChange = (field: keyof Coupon, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateCouponCode = () => {
    const prefix = formData.type === 'percentage' ? 'SAVE' : 'GET';
    const value = formData.value || 10;
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}${value}${random}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code || !formData.description || !formData.value) {
      toast({
        title: "Missing required fields",
        description: "Please fill in code, description, and discount value.",
        variant: "destructive",
      });
      return;
    }

    if (formData.validFrom && formData.validUntil && formData.validFrom >= formData.validUntil) {
      toast({
        title: "Invalid dates",
        description: "Valid until date must be after valid from date.",
        variant: "destructive",
      });
      return;
    }

    const couponData: Coupon = {
      id: coupon?.id || `coupon_${Date.now()}`,
      code: formData.code!,
      description: formData.description!,
      type: formData.type as 'percentage' | 'fixed',
      value: Number(formData.value),
      minOrderValue: Number(formData.minOrderValue) || 0,
      maxDiscountAmount: Number(formData.maxDiscountAmount) || 0,
      usageLimit: Number(formData.usageLimit) || 0,
      usedCount: Number(formData.usedCount) || 0,
      validFrom: formData.validFrom!,
      validUntil: formData.validUntil!,
      status: formData.status as 'active' | 'inactive' | 'expired',
      isFirstTimeUser: formData.isFirstTimeUser,
      applicableCategories: formData.applicableCategories,
      excludedProducts: formData.excludedProducts
    };

    console.log(isEdit ? 'Updating coupon:' : 'Creating coupon:', couponData);
    
    toast({
      title: isEdit ? "Coupon updated!" : "Coupon created!",
      description: `Coupon ${couponData.code} has been ${isEdit ? 'updated' : 'added'} successfully.`,
    });
    
    navigate('/admin/coupons');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate('/admin/coupons')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Coupons
        </Button>
        <h1 className="text-3xl font-bold">
          {isEdit ? 'Edit Coupon' : 'Add New Coupon'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Coupon Code *</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleInputChange('code', generateCouponCode())}
                    >
                      Generate
                    </Button>
                  </div>
                </div>

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
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter coupon description"
                  rows={3}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Discount Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Discount Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Discount Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleInputChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value">
                    Discount Value * {formData.type === 'percentage' ? '(%)' : '(₹)'}
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    value={formData.value}
                    onChange={(e) => handleInputChange('value', Number(e.target.value))}
                    placeholder="0"
                    min="0"
                    max={formData.type === 'percentage' ? 100 : undefined}
                    step={formData.type === 'percentage' ? 1 : 0.01}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minOrderValue">Min Order Value (₹)</Label>
                  <Input
                    id="minOrderValue"
                    type="number"
                    value={formData.minOrderValue}
                    onChange={(e) => handleInputChange('minOrderValue', Number(e.target.value))}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              {formData.type === 'percentage' && (
                <div className="space-y-2">
                  <Label htmlFor="maxDiscountAmount">Max Discount Amount (₹)</Label>
                  <Input
                    id="maxDiscountAmount"
                    type="number"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => handleInputChange('maxDiscountAmount', Number(e.target.value))}
                    placeholder="0 (No limit)"
                    min="0"
                  />
                  <p className="text-sm text-muted-foreground">
                    Leave 0 for no maximum discount limit
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Usage & Validity */}
          <Card>
            <CardHeader>
              <CardTitle>Usage & Validity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="usageLimit">Usage Limit</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => handleInputChange('usageLimit', Number(e.target.value))}
                    placeholder="0 (Unlimited)"
                    min="0"
                  />
                  <p className="text-sm text-muted-foreground">
                    Leave 0 for unlimited usage
                  </p>
                </div>

                {isEdit && (
                  <div className="space-y-2">
                    <Label htmlFor="usedCount">Used Count</Label>
                    <Input
                      id="usedCount"
                      type="number"
                      value={formData.usedCount}
                      onChange={(e) => handleInputChange('usedCount', Number(e.target.value))}
                      placeholder="0"
                      min="0"
                      readOnly
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valid From *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.validFrom && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.validFrom ? format(formData.validFrom, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.validFrom}
                        onSelect={(date) => handleInputChange('validFrom', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Valid Until *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.validUntil && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.validUntil ? format(formData.validUntil, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.validUntil}
                        onSelect={(date) => handleInputChange('validUntil', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isFirstTimeUser"
                  checked={formData.isFirstTimeUser}
                  onCheckedChange={(checked) => handleInputChange('isFirstTimeUser', checked)}
                />
                <Label htmlFor="isFirstTimeUser">Only for first-time users</Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Applicable Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Applicable Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select categories where this coupon can be applied. Leave empty for all categories.
              </p>
              
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cat-${category}`}
                      checked={formData.applicableCategories?.includes(category)}
                      onCheckedChange={(checked) => {
                        const current = formData.applicableCategories || [];
                        const updated = checked
                          ? [...current, category]
                          : current.filter(c => c !== category);
                        handleInputChange('applicableCategories', updated);
                      }}
                    />
                    <Label htmlFor={`cat-${category}`}>{category}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Coupon Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Coupon Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <strong>Code:</strong> {formData.code || 'Not set'}
              </div>
              <div className="text-sm">
                <strong>Type:</strong> {formData.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
              </div>
              <div className="text-sm">
                <strong>Value:</strong> {formData.value || 0}{formData.type === 'percentage' ? '%' : '₹'}
              </div>
              <div className="text-sm">
                <strong>Min Order:</strong> ₹{formData.minOrderValue || 0}
              </div>
              {formData.type === 'percentage' && formData.maxDiscountAmount && (
                <div className="text-sm">
                  <strong>Max Discount:</strong> ₹{formData.maxDiscountAmount}
                </div>
              )}
              <div className="text-sm">
                <strong>Usage Limit:</strong> {formData.usageLimit || 'Unlimited'}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Button type="submit" className="w-full">
                  {isEdit ? 'Update Coupon' : 'Create Coupon'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/admin/coupons')}
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

export default CouponForm;