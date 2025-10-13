import { useState } from 'react';
import { User, MapPin, Truck, CreditCard, Shield, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/utils/currency';
import { toNumber, formatCurrency } from '@/utils/settingsHelpers';

interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}

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

interface CheckoutSummaryProps {
  customerInfo: ContactInfo;
  addressDetails: AddressDetails;
  paymentMethod: string;
  cartItems: any[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  codFee: number;
  discount: number;
  total: number;
  settings: any;
  isMinOrderMet: boolean;
  minOrderShortfall: number;
  isProcessingPayment: boolean;
  estimatedDeliveryFee: number | null;
  estimatedDeliveryTime: string | null;
  couponCode: string;
  setCouponCode: (code: string) => void;
  appliedCoupon: any;
  setAppliedCoupon: (coupon: any) => void;
  availableCoupons: any[];
  onPlaceOrder: () => void;
  onPrev: () => void;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
}

const CheckoutSummary = ({
  customerInfo,
  addressDetails,
  paymentMethod,
  cartItems,
  subtotal,
  tax,
  deliveryFee,
  codFee,
  discount,
  total,
  settings,
  isMinOrderMet,
  minOrderShortfall,
  isProcessingPayment,
  estimatedDeliveryFee,
  estimatedDeliveryTime,
  couponCode,
  setCouponCode,
  appliedCoupon,
  setAppliedCoupon,
  availableCoupons,
  onPlaceOrder,
  onPrev,
  onApplyCoupon,
  onRemoveCoupon
}: CheckoutSummaryProps) => {
  return (
    <div className="space-y-6">
      {/* Order Summary Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-green-600">
            <Shield className="h-5 w-5 mr-2" />
            Review Your Order
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Personal Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <User className="h-5 w-5 mr-2" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{customerInfo.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{customerInfo.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{customerInfo.phone}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <MapPin className="h-5 w-5 mr-2" />
            Delivery Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {addressDetails.plotNumber}
                  {addressDetails.buildingName && `, ${addressDetails.buildingName}`}
                </p>
                <p className="text-gray-600">
                  {addressDetails.street}
                  {addressDetails.landmark && `, Near ${addressDetails.landmark}`}
                </p>
                <p className="text-gray-600">
                  Pincode: {addressDetails.pincode}
                </p>
                <div className="flex items-center mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {addressDetails.addressType === 'home' ? '🏠 Home' :
                     addressDetails.addressType === 'work' ? '🏢 Work' :
                     `📍 ${addressDetails.saveAs || 'Other'}`}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
              <strong>Delivery Area:</strong> {addressDetails.city && addressDetails.state && addressDetails.pincode 
                ? `${addressDetails.city}, ${addressDetails.state} - ${addressDetails.pincode}`
                : 'Address details will appear here'
              }
            </div>
            {estimatedDeliveryFee !== null && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-green-800">Delivery Information</p>
                    <p className="text-xs text-green-700">Calculated using Delhivery API</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-800">
                      {estimatedDeliveryFee === 0 ? 'FREE' : formatPrice(estimatedDeliveryFee)}
                    </p>
                    <p className="text-xs text-green-700">{estimatedDeliveryTime}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Truck className="h-5 w-5 mr-2" />
            Order Items ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg bg-gray-50">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600">
                    {item.weight} • Qty: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{formatPrice(item.price * item.quantity)}</p>
                  <p className="text-sm text-gray-500">
                    {formatPrice(item.price)} each
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <CreditCard className="h-5 w-5 mr-2" />
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
              <div className="flex items-center space-x-3">
                {paymentMethod === 'cod' ? (
                  <>
                    <div className="text-2xl">💵</div>
                    <div>
                      <p className="font-medium">Cash on Delivery</p>
                      <p className="text-sm text-gray-600">Pay when your order is delivered</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-2xl">💳</div>
                    <div>
                      <p className="font-medium">Pay Online</p>
                      <p className="text-sm text-gray-600">Secure payment via Razorpay</p>
                    </div>
                  </>
                )}
              </div>
              <div className="text-right">
                <p className="font-bold text-xl text-green-600">{formatPrice(total)}</p>
              </div>
            </div>

            {/* Bill Breakdown */}
            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-gray-900">Bill Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Item Total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="text-green-600 font-medium">FREE</span>
                    ) : (
                      formatPrice(deliveryFee)
                    )}
                  </span>
                </div>
                {estimatedDeliveryTime && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Estimated Delivery Time</span>
                    <span>{estimatedDeliveryTime}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Taxes & Charges ({Number(settings.tax_rate || 0).toFixed(0)}%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                {paymentMethod === 'cod' && Number(settings.cod_charge) > 0 && (
                  <div className="flex justify-between">
                    <span>COD Fee</span>
                    <span>{formatPrice(codFee)}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount Applied</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Amount</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coupon Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="flex items-center">
                <Tag className="h-4 w-4 mr-2" />
                Apply Coupon
              </Label>
              
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4 text-green-600" />
                    <div>
                      <span className="text-sm font-medium text-green-800">
                        {appliedCoupon.code} Applied
                      </span>
                      <p className="text-xs text-green-600">
                        {appliedCoupon.description}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={onRemoveCoupon} className="text-green-700">
                    Remove
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <Button variant="outline" onClick={onApplyCoupon}>
                      Apply
                    </Button>
                  </div>
                  
                  {availableCoupons.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-600 font-medium">Available Coupons:</p>
                      <div className="space-y-1">
                        {availableCoupons.slice(0, 3).map((coupon) => (
                          <div
                            key={coupon.id}
                            className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded cursor-pointer hover:bg-blue-100"
                            onClick={() => {
                              setCouponCode(coupon.code);
                              onApplyCoupon();
                            }}
                          >
                            <div>
                              <span className="text-xs font-medium text-blue-800">
                                {coupon.code}
                              </span>
                              <p className="text-xs text-blue-600">
                                {coupon.description}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm" className="text-xs text-blue-700">
                              Apply
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <Separator />

            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            {/* Minimum Order Warning */}
            {subtotal < toNumber(settings.min_order_amount) && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-3">
                <div className="flex items-center space-x-2">
                  <span className="text-orange-600">⚠️</span>
                  <div>
                    <p className="text-sm text-orange-700 font-medium">
                      Minimum Order: {formatCurrency(settings.min_order_amount, settings.currency_symbol)}
                    </p>
                    <p className="text-xs text-orange-600">
                      Add {formatCurrency(toNumber(settings.min_order_amount) - subtotal, settings.currency_symbol)} more to proceed
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <Button variant="outline" onClick={onPrev} size="lg" className="px-8">
              Back to Payment
            </Button>
            <Button
              onClick={onPlaceOrder}
              size="lg"
              className="px-8 bg-green-600 hover:bg-green-700"
              disabled={isProcessingPayment || !isMinOrderMet}
            >
              {isProcessingPayment ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </div>
              ) : !isMinOrderMet ? (
                <div className="flex items-center space-x-2">
                  <span>Add {formatCurrency(minOrderShortfall, settings.currency_symbol)} More</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>{paymentMethod === 'cod' ? 'Place Order' : 'Pay Now'} {formatPrice(total)}</span>
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckoutSummary;