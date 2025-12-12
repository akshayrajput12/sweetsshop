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
  isPincodeServiceable: boolean; // Add this prop
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
  onRemoveCoupon,
  isPincodeServiceable // Add this prop
}: CheckoutSummaryProps) => {
  return (
    <div className="space-y-6 font-sans text-[#2C1810]">
      {/* Order Summary Header */}
      <Card className="border-[#E6D5B8] bg-[#FFF8F0] shadow-sm">
        <CardHeader className="border-b border-[#E6D5B8]">
          <CardTitle className="flex items-center text-[#8B2131] font-serif tracking-wide">
            <Shield className="h-5 w-5 mr-2" />
            Review Your Order
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Personal Details */}
      <Card className="border-[#E6D5B8] shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="bg-[#FFFDF7] border-b border-[#E6D5B8] py-4">
          <CardTitle className="flex items-center text-lg text-[#2C1810] font-serif">
            <User className="h-5 w-5 mr-2 text-[#8B2131]" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-[#5D4037] mb-1">Name</p>
              <p className="font-medium text-[#2C1810]">{customerInfo.name}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-[#5D4037] mb-1">Email</p>
              <p className="font-medium text-[#2C1810]">{customerInfo.email}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-[#5D4037] mb-1">Phone</p>
              <p className="font-medium text-[#2C1810]">{customerInfo.phone}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Address */}
      <Card className="border-[#E6D5B8] shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="bg-[#FFFDF7] border-b border-[#E6D5B8] py-4">
          <CardTitle className="flex items-center text-lg text-[#2C1810] font-serif">
            <MapPin className="h-5 w-5 mr-2 text-[#8B2131]" />
            Delivery Address
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-2 h-2 bg-[#8B2131] rounded-full mt-2.5 shadow-[0_0_10px_#8B2131]"></div>
              <div className="flex-1">
                <p className="font-medium text-[#2C1810] text-lg">
                  {addressDetails.plotNumber}
                  {addressDetails.buildingName && `, ${addressDetails.buildingName}`}
                </p>
                <p className="text-[#5D4037] mt-1 leading-relaxed">
                  {addressDetails.street}
                  {addressDetails.landmark && `, Near ${addressDetails.landmark}`}
                </p>
                <p className="text-[#5D4037] font-medium mt-1">
                  Pincode: {addressDetails.pincode}
                </p>
                <div className="flex items-center mt-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-sm text-xs font-bold tracking-wider uppercase bg-[#E6D5B8]/30 text-[#8B2131] border border-[#E6D5B8]">
                    {addressDetails.addressType === 'home' ? 'Home' :
                      addressDetails.addressType === 'work' ? 'Work' :
                        (addressDetails.saveAs || 'Other')}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-sm text-[#5D4037] bg-[#FFF8F0] p-4 rounded-sm border border-[#E6D5B8]/50 italic">
              <strong>Delivery Area:</strong> {addressDetails.city && addressDetails.state && addressDetails.pincode
                ? `${addressDetails.city}, ${addressDetails.state} - ${addressDetails.pincode}`
                : 'Address details will appear here'
              }
            </div>

            <div className="bg-[#F0FFF4] border border-[#C6F6D5] rounded-sm p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-[#276749]">Delivery Estimate</p>
                  <p className="text-xs text-[#2F855A] mt-1">{estimatedDeliveryTime}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#22543D]">
                    {deliveryFee === 0 ? 'FREE DELIVERY' : formatPrice(deliveryFee)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card className="border-[#E6D5B8] shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="bg-[#FFFDF7] border-b border-[#E6D5B8] py-4">
          <CardTitle className="flex items-center text-lg text-[#2C1810] font-serif">
            <Truck className="h-5 w-5 mr-2 text-[#8B2131]" />
            Order Items ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex space-x-4 p-4 border border-[#E6D5B8]/50 rounded-sm bg-[#FFFDF7] hover:bg-[#FFF8F0] transition-colors">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-sm shadow-sm border border-[#E6D5B8]"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif font-medium text-[#2C1810] text-lg leading-tight">{item.name}</h3>
                    <p className="text-sm text-[#5D4037] mt-1">
                      {item.weight} • Qty: {item.quantity}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-[#8B2131]">{formatPrice(item.price * item.quantity)}</p>
                  <p className="text-xs text-[#5D4037] mt-1">
                    {formatPrice(item.price)} each
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Details */}
      <Card className="border-[#E6D5B8] shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="bg-[#FFFDF7] border-b border-[#E6D5B8] py-4">
          <CardTitle className="flex items-center text-lg text-[#2C1810] font-serif">
            <CreditCard className="h-5 w-5 mr-2 text-[#8B2131]" />
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between p-5 border border-[#E6D5B8] rounded-sm bg-[#FFF8F0]">
              <div className="flex items-center space-x-4">
                {paymentMethod === 'cod' ? (
                  <>
                    <div className="text-3xl">💵</div>
                    <div>
                      <p className="font-medium text-[#2C1810] text-lg">Cash on Delivery</p>
                      <p className="text-sm text-[#5D4037]">Pay when your royal treats arrive</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-3xl">💳</div>
                    <div>
                      <p className="font-medium text-[#2C1810] text-lg">Pay Online</p>
                      <p className="text-sm text-[#5D4037]">Secure payment via Razorpay</p>
                    </div>
                  </>
                )}
              </div>
              <div className="text-right">
                <p className="font-bold text-2xl text-[#8B2131] font-serif">{formatPrice(total)}</p>
              </div>
            </div>

            {/* Bill Breakdown */}
            <div className="border border-[#E6D5B8] rounded-sm p-6 space-y-3 bg-[#FFFDF7]">
              <h4 className="font-serif font-medium text-[#2C1810] text-lg border-b border-[#E6D5B8] pb-2 mb-3">Bill Details</h4>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-[#5D4037]">
                  <span>Item Total</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#5D4037]">
                  <span>Delivery Fee</span>
                  <span className="font-medium">
                    {deliveryFee === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      formatPrice(deliveryFee)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-[#5D4037] text-xs italic">
                  <span>Estimated Delivery Time</span>
                  <span>{estimatedDeliveryTime}</span>
                </div>
                <div className="flex justify-between text-[#5D4037]">
                  <span>Taxes & Charges ({Number(settings.tax_rate || 0).toFixed(0)}%)</span>
                  <span className="font-medium">{formatPrice(tax)}</span>
                </div>
                {paymentMethod === 'cod' && Number(settings.cod_charge) > 0 && (
                  <div className="flex justify-between text-[#5D4037]">
                    <span>COD Fee</span>
                    <span className="font-medium">{formatPrice(codFee)}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium bg-green-50 p-1 px-2 rounded-sm -mx-2">
                    <span>Discount Applied</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <Separator className="bg-[#E6D5B8] my-2" />
                <div className="flex justify-between font-serif font-bold text-xl text-[#2C1810] pt-1">
                  <span>Grand Total</span>
                  <span className="text-[#8B2131]">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coupon Section */}
      <Card className="border-[#E6D5B8] shadow-sm">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="flex items-center text-[#2C1810] font-medium">
                <Tag className="h-4 w-4 mr-2 text-[#8B2131]" />
                Apply Coupon
              </Label>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-4 bg-[#F0FFF4] border border-[#C6F6D5] rounded-sm">
                  <div className="flex items-center space-x-3">
                    <Tag className="h-5 w-5 text-[#38A169]" />
                    <div>
                      <span className="text-sm font-bold text-[#22543D] tracking-wider">
                        {appliedCoupon.code} APPLIED
                      </span>
                      <p className="text-xs text-[#2F855A] mt-0.5">
                        {appliedCoupon.description}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={onRemoveCoupon} className="text-[#C53030] hover:bg-[#FFF5F5] hover:text-[#9B2C2C]">
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
                      className="border-[#E6D5B8] focus:ring-[#8B2131] bg-[#FFFDF7]"
                    />
                    <Button variant="outline" onClick={onApplyCoupon} className="border-[#8B2131] text-[#8B2131] hover:bg-[#8B2131] hover:text-white transition-colors">
                      Apply
                    </Button>
                  </div>

                  {availableCoupons.length > 0 && (
                    <div className="space-y-2 mt-3">
                      <p className="text-xs text-[#5D4037] font-medium uppercase tracking-wide">Available Coupons:</p>
                      <div className="space-y-2">
                        {availableCoupons.slice(0, 3).map((coupon) => (
                          <div
                            key={coupon.id}
                            className="flex items-center justify-between p-3 bg-[#FFF8F0] border border-[#E6D5B8] rounded-sm cursor-pointer hover:bg-[#FFE8CC] transition-colors"
                            onClick={() => {
                              setCouponCode(coupon.code);
                              onApplyCoupon();
                            }}
                          >
                            <div>
                              <span className="text-xs font-bold text-[#8B2131] tracking-wider block">
                                {coupon.code}
                              </span>
                              <p className="text-xs text-[#5D4037] mt-0.5">
                                {coupon.description}
                              </p>
                            </div>
                            <span className="text-xs font-medium text-[#8B2131] underline">Apply</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <Separator className="bg-[#E6D5B8]" />

            <div className="flex justify-between font-serif font-bold text-xl text-[#2C1810]">
              <span>Total</span>
              <span className="text-[#8B2131]">{formatPrice(total)}</span>
            </div>

            {/* Minimum Order Warning */}
            {subtotal < toNumber(settings.min_order_amount) && (
              <div className="bg-orange-50 border border-orange-200 rounded-sm p-4 mt-3">
                <div className="flex items-center space-x-3">
                  <span className="text-orange-600 text-xl">⚠️</span>
                  <div>
                    <p className="text-sm text-orange-800 font-bold">
                      Minimum Order: {formatCurrency(settings.min_order_amount, settings.currency_symbol)}
                    </p>
                    <p className="text-xs text-orange-700 mt-1">
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
      <Card className="border-0 shadow-none bg-transparent">
        <CardContent className="pt-2 px-0">
          <div className="flex justify-between gap-4">
            <Button variant="outline" onClick={onPrev} size="lg" className="px-8 border-[#E6D5B8] hover:bg-[#FFF8F0] text-[#5D4037]">
              Back
            </Button>
            <Button
              onClick={onPlaceOrder}
              size="lg"
              className="flex-1 px-8 bg-[#8B2131] hover:bg-[#701a26] text-white font-medium tracking-wide shadow-lg hover:shadow-xl transition-all h-12 text-base uppercase"
              disabled={isProcessingPayment || !isMinOrderMet || !isPincodeServiceable}
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
              ) : !isPincodeServiceable ? (
                <div className="flex items-center space-x-2">
                  <span>Delivery Not Available</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2 w-full">
                  <Shield className="h-4 w-4 mr-2" />
                  <span>{paymentMethod === 'cod' ? 'Place Order' : 'Pay Now'} • {formatPrice(total)}</span>
                </div>
              )}
            </Button>
          </div>

          {/* Show message when delivery is not serviceable */}
          {!isPincodeServiceable && (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-sm text-center">
              <p className="text-orange-700">
                ⚠️ Delivery is not available to pincode {addressDetails.pincode}.
                <br />
                <button
                  onClick={() => window.location.href = '/contact'}
                  className="text-[#8B2131] hover:underline font-medium mt-1"
                >
                  Contact us for assistance
                </button>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckoutSummary;