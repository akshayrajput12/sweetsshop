import { CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Shield, Clock } from 'lucide-react';
import { validatePaymentMethod } from '@/utils/validation';
import { toNumber } from '@/utils/settingsHelpers';

interface CheckoutPaymentProps {
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  settings: any;
  total: number;
  onNext: () => void;
  onPrev: () => void;
}

const CheckoutPayment = ({ 
  paymentMethod, 
  setPaymentMethod, 
  settings, 
  total, 
  onNext, 
  onPrev 
}: CheckoutPaymentProps) => {
  const handleNext = () => {
    const paymentValidation = validatePaymentMethod(paymentMethod, total, settings);
    if (!paymentValidation.isValid) {
      // Show error message
      return;
    }
    onNext();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          Payment Method
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
          {/* Pay Online Option */}
          {settings.razorpay_enabled && (
            <div className="relative">
              <div className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
                <RadioGroupItem value="online" id="online" />
                <Label htmlFor="online" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-base">Pay Online</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {[
                          settings.card_enabled && 'Credit/Debit Card',
                          settings.upi_enabled && 'UPI',
                          settings.netbanking_enabled && 'Net Banking'
                        ].filter(Boolean).join(', ')}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {settings.card_enabled && (
                        <>
                          <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                            VISA
                          </div>
                          <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">
                            MC
                          </div>
                        </>
                      )}
                      {settings.upi_enabled && (
                        <div className="w-8 h-5 bg-orange-500 rounded text-white text-xs flex items-center justify-center font-bold">
                          UPI
                        </div>
                      )}
                    </div>
                  </div>
                </Label>
              </div>
              {paymentMethod === 'online' && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">
                      Secure payment powered by Razorpay
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cash on Delivery Option */}
          {settings.cod_enabled && total <= Number(settings.cod_threshold) && (
            <div className="relative">
              <div className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
                <RadioGroupItem value="cod" id="cod" />
                <Label htmlFor="cod" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-base">Cash on Delivery</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Pay when your order is delivered
                        {Number(settings.cod_charge) > 0 && (
                          <span className="text-orange-600 font-medium">
                            {' '}+ {settings.currency_symbol}{Number(settings.cod_charge).toFixed(2)} COD fee
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-2xl">💵</div>
                  </div>
                </Label>
              </div>
              {paymentMethod === 'cod' && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-700">
                      Please keep exact change ready for faster delivery
                      {Number(settings.cod_charge) > 0 && (
                        <span className="block mt-1 font-medium">
                          COD fee: {settings.currency_symbol}{Number(settings.cod_charge).toFixed(2)} will be added to your total
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* COD Not Available Message */}
          {settings.cod_enabled && total > Number(settings.cod_threshold) && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-orange-700">
                  Cash on Delivery not available for orders above {settings.currency_symbol}{Number(settings.cod_threshold).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </RadioGroup>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onPrev} size="lg" className="px-8">
            Back to Address
          </Button>
          <Button
            onClick={handleNext}
            size="lg"
            className="px-8"
          >
            Review Order
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CheckoutPayment;