import { useState } from 'react';
import { User, Phone, Mail, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validateContactInfo } from '@/utils/validation';

interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}

interface CheckoutContactInfoProps {
  customerInfo: ContactInfo;
  setCustomerInfo: (info: ContactInfo) => void;
  onNext: () => void;
}

const CheckoutContactInfo = ({ customerInfo, setCustomerInfo, onNext }: CheckoutContactInfoProps) => {
  const [contactErrors, setContactErrors] = useState<string[]>([]);

  const handleNext = () => {
    const validation = validateContactInfo(customerInfo);
    if (!validation.isValid) {
      setContactErrors(validation.errors);
      return;
    }
    setContactErrors([]);
    onNext();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="h-5 w-5 mr-2" />
          Contact Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Full Name *
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={customerInfo.name}
                onChange={(e) => {
                  setCustomerInfo({...customerInfo, name: e.target.value});
                  // Clear errors when user starts typing
                  if (contactErrors.length > 0) {
                    setContactErrors([]);
                  }
                }}
                className={`pl-10 h-12 ${contactErrors.some(e => e.includes('name') || e.includes('Name')) ? 'border-red-500' : ''}`}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone Number *
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={customerInfo.phone}
                onChange={(e) => {
                  setCustomerInfo({...customerInfo, phone: e.target.value});
                  if (contactErrors.length > 0) {
                    setContactErrors([]);
                  }
                }}
                className={`pl-10 h-12 ${contactErrors.some(e => e.includes('phone') || e.includes('Phone')) ? 'border-red-500' : ''}`}
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email Address *
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={customerInfo.email}
              onChange={(e) => {
                setCustomerInfo({...customerInfo, email: e.target.value});
                if (contactErrors.length > 0) {
                  setContactErrors([]);
                }
              }}
              className={`pl-10 h-12 ${contactErrors.some(e => e.includes('email') || e.includes('Email')) ? 'border-red-500' : ''}`}
              required
            />
          </div>
        </div>

        {/* Validation Errors */}
        {contactErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="h-5 w-5 text-red-600 mt-0.5">⚠️</div>
              <div>
                <h4 className="font-medium text-red-900 text-sm mb-1">
                  Please fix the following errors:
                </h4>
                <ul className="text-red-700 text-sm space-y-1">
                  {contactErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 text-sm">
                Your information is secure
              </h4>
              <p className="text-blue-700 text-sm mt-1">
                We use your contact details only for order updates and delivery coordination.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleNext} size="lg" className="px-8">
            Continue to Location
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CheckoutContactInfo;