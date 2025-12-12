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
    <Card className="border-[#E6D5B8] bg-[#FFFDF7] shadow-sm">
      <CardHeader className="border-b border-[#E6D5B8]">
        <CardTitle className="flex items-center text-[#2C1810] font-serif tracking-wide">
          <CreditCard className="h-5 w-5 mr-2 text-[#8B2131]" />
          Payment Method
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
          {/* Pay Online Option */}
          {settings.razorpay_enabled && (
            <div className="relative">
              <div className={`flex items-center space-x-3 p-4 border rounded-sm transition-all cursor-pointer ${paymentMethod === 'online' ? 'border-[#8B2131] bg-[#FFF8F0]' : 'border-[#E6D5B8] hover:border-[#8B2131]/50'}`}>
                <RadioGroupItem value="online" id="online" className="text-[#8B2131]" />
                <Label htmlFor="online" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-base text-[#2C1810]">Pay Online</div>
                      <div className="text-sm text-[#5D4037] mt-1">
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
                          <div className="w-8 h-5 bg-[#1A365D] rounded text-white text-xs flex items-center justify-center font-bold">
                            VISA
                          </div>
                          <div className="w-8 h-5 bg-[#C53030] rounded text-white text-xs flex items-center justify-center font-bold">
                            MC
                          </div>
                        </>
                      )}
                      {settings.upi_enabled && (
                        <div className="w-8 h-5 bg-[#C05621] rounded text-white text-xs flex items-center justify-center font-bold">
                          UPI
                        </div>
                      )}
                    </div>
                  </div>
                </Label>
              </div>
              {paymentMethod === 'online' && (
                <div className="mt-3 p-3 bg-[#F0FFF4] border border-[#C6F6D5] rounded-sm">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-[#2F855A]" />
                    <span className="text-sm text-[#22543D] font-medium">
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
              <div className={`flex items-center space-x-3 p-4 border rounded-sm transition-all cursor-pointer ${paymentMethod === 'cod' ? 'border-[#8B2131] bg-[#FFF8F0]' : 'border-[#E6D5B8] hover:border-[#8B2131]/50'}`}>
                <RadioGroupItem value="cod" id="cod" className="text-[#8B2131]" />
                <Label htmlFor="cod" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-base text-[#2C1810]">Cash on Delivery</div>
                      <div className="text-sm text-[#5D4037] mt-1">
                        Pay when your royal treats arrive
                        {Number(settings.cod_charge) > 0 && (
                          <span className="text-[#C53030] font-medium">
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
                <div className="mt-3 p-3 bg-[#EBF8FF] border border-[#BEE3F8] rounded-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-[#2B6CB0]" />
                    <span className="text-sm text-[#2C5282]">
                      Please keep exact change ready for faster delivery
                      {Number(settings.cod_charge) > 0 && (
                        <span className="block mt-1 font-medium text-[#2A4365]">
                          COD fee used to handle cash payments
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
            <div className="p-4 bg-[#FFFAF0] border border-[#FEEBC8] rounded-sm">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-[#C05621]" />
                <span className="text-sm text-[#9C4221]">
                  Cash on Delivery not available for orders above {settings.currency_symbol}{Number(settings.cod_threshold).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </RadioGroup>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onPrev} size="lg" className="px-8 border-[#E6D5B8] text-[#5D4037] hover:bg-[#FFF8F0]">
            Back to Address
          </Button>
          <Button
            onClick={handleNext}
            size="lg"
            className="px-8 bg-[#8B2131] hover:bg-[#701a26] text-white"
          >
            Review Order
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CheckoutPayment;