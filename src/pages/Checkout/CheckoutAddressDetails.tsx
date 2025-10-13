import { useState, useEffect } from 'react';
import { MapPin, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { validateAddressDetails } from '@/utils/validation';
import { formatCurrency, meetsThreshold, toNumber } from '@/utils/settingsHelpers';
import { delhiveryService, PICKUP_LOCATION } from '@/utils/delhivery';

interface AddressDetails {
  plotNumber: string;
  buildingName: string;
  street: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  addressType: 'home' | 'work' | 'other';
  saveAs: string;
}

interface SavedAddress {
  id: string;
  name: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  type: string;
  is_default: boolean;
}

interface CheckoutAddressDetailsProps {
  addressDetails: AddressDetails;
  setAddressDetails: (details: AddressDetails) => void;
  savedAddresses: SavedAddress[];
  selectedAddress: SavedAddress | null;
  setSelectedAddress: (address: SavedAddress | null) => void;
  useExistingAddress: boolean;
  setUseExistingAddress: (use: boolean) => void;
  showAddressForm: boolean;
  setShowAddressForm: (show: boolean) => void;
  settings: any;
  subtotal: number;
  currentUser: any;
  onNext: () => void;
  onPrev: () => void;
  estimatedDeliveryFee: number | null;
  setEstimatedDeliveryFee: (fee: number | null) => void;
  estimatedDeliveryTime: string | null;
  setEstimatedDeliveryTime: (time: string | null) => void;
  cartItems: any[];
}

const CheckoutAddressDetails = ({
  addressDetails,
  setAddressDetails,
  savedAddresses,
  selectedAddress,
  setSelectedAddress,
  useExistingAddress,
  setUseExistingAddress,
  showAddressForm,
  setShowAddressForm,
  settings,
  subtotal,
  currentUser,
  onNext,
  onPrev,
  estimatedDeliveryFee,
  setEstimatedDeliveryFee,
  estimatedDeliveryTime,
  setEstimatedDeliveryTime,
  cartItems
}: CheckoutAddressDetailsProps) => {
  const [addressErrors, setAddressErrors] = useState<string[]>([]);
  
  // Simple pincode to coordinates mapping for major cities in India
  const PINCODE_COORDINATES: Record<string, { lat: number; lng: number; city: string; state: string }> = {
    // Delhi NCR
    '110001': { lat: 28.6139, lng: 77.2090, city: 'Delhi', state: 'Delhi' },
    '110002': { lat: 28.6139, lng: 77.2090, city: 'Delhi', state: 'Delhi' },
    '110003': { lat: 28.6139, lng: 77.2090, city: 'Delhi', state: 'Delhi' },
    '110021': { lat: 28.6139, lng: 77.2090, city: 'Delhi', state: 'Delhi' },
    '110022': { lat: 28.6139, lng: 77.2090, city: 'Delhi', state: 'Delhi' },
    
    // Mumbai
    '400001': { lat: 19.0760, lng: 72.8777, city: 'Mumbai', state: 'Maharashtra' },
    '400002': { lat: 19.0760, lng: 72.8777, city: 'Mumbai', state: 'Maharashtra' },
    '400003': { lat: 19.0760, lng: 72.8777, city: 'Mumbai', state: 'Maharashtra' },
    
    // Bangalore
    '560001': { lat: 12.9716, lng: 77.5946, city: 'Bangalore', state: 'Karnataka' },
    '560002': { lat: 12.9716, lng: 77.5946, city: 'Bangalore', state: 'Karnataka' },
    '560003': { lat: 12.9716, lng: 77.5946, city: 'Bangalore', state: 'Karnataka' },
    
    // Chennai
    '600001': { lat: 13.0827, lng: 80.2707, city: 'Chennai', state: 'Tamil Nadu' },
    '600002': { lat: 13.0827, lng: 80.2707, city: 'Chennai', state: 'Tamil Nadu' },
    
    // Kolkata
    '700001': { lat: 22.5726, lng: 88.3639, city: 'Kolkata', state: 'West Bengal' },
    '700002': { lat: 22.5726, lng: 88.3639, city: 'Kolkata', state: 'West Bengal' },
    
    // Hyderabad
    '500001': { lat: 17.3850, lng: 78.4867, city: 'Hyderabad', state: 'Telangana' },
    '500002': { lat: 17.3850, lng: 78.4867, city: 'Hyderabad', state: 'Telangana' },
    
    // Pune
    '411001': { lat: 18.5204, lng: 73.8567, city: 'Pune', state: 'Maharashtra' },
    '411002': { lat: 18.5204, lng: 73.8567, city: 'Pune', state: 'Maharashtra' },
    
    // Ahmedabad
    '380001': { lat: 23.0225, lng: 72.5714, city: 'Ahmedabad', state: 'Gujarat' },
    '380002': { lat: 23.0225, lng: 72.5714, city: 'Ahmedabad', state: 'Gujarat' },
    
    // Jaipur
    '302001': { lat: 26.9124, lng: 75.7873, city: 'Jaipur', state: 'Rajasthan' },
    '302002': { lat: 26.9124, lng: 75.7873, city: 'Jaipur', state: 'Rajasthan' },
    
    // Default fallback (Delhi coordinates)
    'default': { lat: 28.6139, lng: 77.2090, city: 'Delhi', state: 'Delhi' }
  };

  // Get approximate coordinates for a pincode
  const getCoordinatesForPincode = (pincode: string): { lat: number; lng: number; city: string; state: string } => {
    // Clean the pincode
    const cleanPincode = pincode.replace(/\D/g, '').slice(0, 6);
    
    // Return coordinates if found, otherwise return default
    return PINCODE_COORDINATES[cleanPincode] || PINCODE_COORDINATES['default'];
  };

  const handleSavedAddressSelect = (address: SavedAddress) => {
    setSelectedAddress(address);
    setUseExistingAddress(true);

    // Pre-fill address details from saved address
    setAddressDetails({
      plotNumber: address.address_line_1.split(',')[0] || '',
      buildingName: '',
      street: address.address_line_2 || '',
      landmark: address.landmark || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode,
      addressType: address.type as 'home' | 'work' | 'other',
      saveAs: address.type === 'other' ? address.name : ''
    });
  };

  // Estimate delivery fee when address details change
  useEffect(() => {
    const estimateDeliveryFee = async () => {
      // Only estimate if we have a pincode and city/state
      if (addressDetails.pincode && addressDetails.city && addressDetails.state) {
        try {
          // Get customer coordinates from pincode
          const customerCoords = getCoordinatesForPincode(addressDetails.pincode);
          
          // Calculate total weight of items in cart (considering quantity)
          let totalWeight = 0;
          cartItems.forEach(item => {
            // Extract numeric weight from string (e.g., "500g" -> 0.5kg, "1kg" -> 1kg)
            const weightMatch = item.weight.match(/(\d+(?:\.\d+)?)\s*(g|kg)/i);
            if (weightMatch) {
              const value = parseFloat(weightMatch[1]);
              const unit = weightMatch[2].toLowerCase();
              // Convert to kg and multiply by quantity
              const weightInKg = unit === 'g' ? value / 1000 : value;
              totalWeight += weightInKg * item.quantity;
            }
          });
          
          // Display the actual weight to the user but use buffered weight for API calculations
          const displayWeight = Math.max(1, totalWeight); // Display actual weight with minimum 1kg
          const bufferedWeight = Math.max(1, totalWeight * 1.2); // Use 20% buffer for API calculations
          
          // Estimate delivery pricing using Delhivery API
          const estimate = await delhiveryService.estimateDeliveryPricing(
            PICKUP_LOCATION.pincode || '110001',
            addressDetails.pincode,
            subtotal,
            bufferedWeight // weight in kg with 20% buffer for API
          );
          
          // Set estimated delivery time
          setEstimatedDeliveryTime(estimate.estimated_delivery_time);
          
          // Check if order qualifies for free delivery
          const freeDeliveryThreshold = toNumber(settings.free_delivery_threshold);
          if (subtotal >= freeDeliveryThreshold && estimate.serviceability) {
            setEstimatedDeliveryFee(0);
          } else {
            setEstimatedDeliveryFee(estimate.shipping_charges);
          }
        } catch (error) {
          console.error('Error estimating delivery fee:', error);
          // Fallback to standard delivery charge
          setEstimatedDeliveryTime('2-5 business days');
          const freeDeliveryThreshold = toNumber(settings.free_delivery_threshold);
          if (subtotal >= freeDeliveryThreshold) {
            setEstimatedDeliveryFee(0);
          } else {
            setEstimatedDeliveryFee(toNumber(settings.delivery_charge));
          }
        }
      } else {
        // Reset estimated delivery fee if we don't have complete address
        setEstimatedDeliveryFee(null);
      }
    };
    
    estimateDeliveryFee();
  }, [addressDetails, subtotal, settings, cartItems]);

  const handleNext = () => {
    // Validate city, state, and pincode first
    if (!addressDetails.city || !addressDetails.state || !addressDetails.pincode) {
      // Show error message
      return;
    }
    
    if (!useExistingAddress) {
      const validation = validateAddressDetails(addressDetails);
      if (!validation.isValid) {
        setAddressErrors(validation.errors);
        return;
      }
    }
    setAddressErrors([]);
    onNext();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Complete Address Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Delivery Information */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-900 text-sm">
                Fast Delivery Available
              </h4>
              <p className="text-orange-700 text-sm mt-1">
                Get your bulk orders delivered within 2-3 business days nationwide.
                {!meetsThreshold(subtotal, settings.free_delivery_threshold) && (
                  <span className="block mt-1 font-medium">
                    Add {formatCurrency(toNumber(settings.free_delivery_threshold) - subtotal, settings.currency_symbol)} more for FREE delivery!
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Saved Addresses Section */}
        {savedAddresses.length > 0 && !useExistingAddress && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Use Saved Address</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddressForm(true)}
              >
                Add New Address
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {savedAddresses.map((address) => (
                <div
                  key={address.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedAddress?.id === address.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleSavedAddressSelect(address)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm">{address.name}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {address.type.charAt(0).toUpperCase() + address.type.slice(1)}
                        </span>
                        {address.is_default && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {address.address_line_1}
                        {address.address_line_2 && `, ${address.address_line_2}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {address.city}, {address.state} - {address.pincode}
                      </p>
                      {address.landmark && (
                        <p className="text-xs text-gray-500">Near {address.landmark}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => setShowAddressForm(true)}
                className="text-primary"
              >
                + Add New Address Instead
              </Button>
            </div>
          </div>
        )}

        {/* Show address form if no saved addresses or user wants to add new */}
        {(savedAddresses.length === 0 || showAddressForm || useExistingAddress) && (
          <>
            {useExistingAddress && (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-800">
                    Using saved address: {selectedAddress?.name}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setUseExistingAddress(false);
                    setSelectedAddress(null);
                    setShowAddressForm(true);
                  }}
                  className="text-green-700 hover:text-green-800"
                >
                  Change
                </Button>
              </div>
            )}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 text-sm">
                Delivery Address
              </h4>
              <p className="text-blue-700 text-sm mt-1">
                {addressDetails.city && addressDetails.state && addressDetails.pincode 
                  ? `${addressDetails.city}, ${addressDetails.state} - ${addressDetails.pincode}`
                  : 'Please fill in your city, state, and pincode above'
                }
              </p>
              {estimatedDeliveryFee !== null && estimatedDeliveryTime && (
                <div className="text-blue-700 text-sm mt-2">
                  <span className="font-medium">Estimated Delivery:</span> {estimatedDeliveryTime} 
                  <span className="font-medium">({formatCurrency(estimatedDeliveryFee, settings.currency_symbol)})</span>
                </div>
              )}
              {estimatedDeliveryFee === null && addressDetails.pincode && (
                <div className="text-blue-700 text-sm mt-2 flex items-center">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                  Calculating delivery charges...
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="plotNumber" className="text-sm font-medium">
              Plot/House Number *
            </Label>
            <Input
              id="plotNumber"
              type="text"
              placeholder="e.g., 123, A-45"
              value={addressDetails.plotNumber}
              onChange={(e) => setAddressDetails({...addressDetails, plotNumber: e.target.value})}
              className="h-12"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buildingName" className="text-sm font-medium">
              Building/Society Name
            </Label>
            <Input
              id="buildingName"
              type="text"
              placeholder="e.g., Green Valley Apartments"
              value={addressDetails.buildingName}
              onChange={(e) => setAddressDetails({...addressDetails, buildingName: e.target.value})}
              className="h-12"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="street" className="text-sm font-medium">
            Street/Area *
          </Label>
          <Input
            id="street"
            type="text"
            placeholder="e.g., MG Road, Sector 15"
            value={addressDetails.street}
            onChange={(e) => setAddressDetails({...addressDetails, street: e.target.value})}
            className="h-12"
            required
          />
        </div>

        {/* City, State, and Pincode */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city" className="text-sm font-medium">
              City *
            </Label>
            <Input
              id="city"
              type="text"
              placeholder="Enter your city"
              value={addressDetails.city}
              onChange={(e) => setAddressDetails({...addressDetails, city: e.target.value})}
              className="h-12"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state" className="text-sm font-medium">
              State *
            </Label>
            <Input
              id="state"
              type="text"
              placeholder="Enter your state"
              value={addressDetails.state}
              onChange={(e) => setAddressDetails({...addressDetails, state: e.target.value})}
              className="h-12"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pincode" className="text-sm font-medium">
              Pincode *
            </Label>
            <Input
              id="pincode"
              type="text"
              placeholder="Enter 6-digit pincode"
              value={addressDetails.pincode}
              onChange={(e) => setAddressDetails({...addressDetails, pincode: e.target.value})}
              className="h-12"
              maxLength={6}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="landmark" className="text-sm font-medium">
            Nearby Landmark
          </Label>
          <Input
            id="landmark"
            type="text"
            placeholder="e.g., Near Metro Station"
            value={addressDetails.landmark}
            onChange={(e) => setAddressDetails({...addressDetails, landmark: e.target.value})}
            className="h-12"
          />
        </div>

        {/* Address saving options - only show for authenticated users */}
        {currentUser && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Save this address as</Label>
            <RadioGroup
              value={addressDetails.addressType}
              onValueChange={(value: 'home' | 'work' | 'other') =>
                setAddressDetails({...addressDetails, addressType: value})
              }
              className="flex space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="home" id="home" />
                <Label htmlFor="home" className="cursor-pointer">🏠 Home</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="work" id="work" />
                <Label htmlFor="work" className="cursor-pointer">🏢 Work</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other" className="cursor-pointer">📍 Other</Label>
              </div>
            </RadioGroup>

            {addressDetails.addressType === 'other' && (
              <Input
                placeholder="Enter custom name (e.g., Friend's Place)"
                value={addressDetails.saveAs}
                onChange={(e) => setAddressDetails({...addressDetails, saveAs: e.target.value})}
                className="h-12 mt-2"
              />
            )}
          </div>
        )}

        {/* Save Address Option - only show for authenticated users */}
        {currentUser && !useExistingAddress && (
          <div className="flex items-center space-x-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <input
              type="checkbox"
              id="saveAddress"
              checked={true}
              readOnly
              className="rounded"
            />
            <Label htmlFor="saveAddress" className="text-sm text-blue-800">
              Save this address to your profile for future orders
              {savedAddresses.length >= 3 && (
                <span className="block text-xs text-orange-600 mt-1">
                  ⚠️ You have reached the maximum limit of 3 saved addresses
                </span>
              )}
            </Label>
          </div>
        )}
        </>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onPrev} size="lg" className="px-8">
            Back to Contact
          </Button>
          <Button
            onClick={handleNext}
            disabled={
              useExistingAddress 
                ? !selectedAddress || !addressDetails.city || !addressDetails.state || !addressDetails.pincode
                : !addressDetails.plotNumber || !addressDetails.street || !addressDetails.city || !addressDetails.state || !addressDetails.pincode
            }
            size="lg"
            className="px-8"
          >
            Continue to Payment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CheckoutAddressDetails;