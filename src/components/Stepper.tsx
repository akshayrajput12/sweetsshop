import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

const Stepper = ({ steps, currentStep, className }: StepperProps) => {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all font-serif",
                    {
                      "bg-[#8B2131] border-[#8B2131] text-white shadow-md": isActive || isCompleted,
                      "bg-white border-[#E6D5B8] text-[#5D4037]": !isActive && !isCompleted,
                    }
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{stepNumber}</span>
                  )}
                </div>

                {/* Step Label */}
                <div className="text-center mt-2 max-w-[120px]">
                  <div
                    className={cn(
                      "text-sm font-medium tracking-wide font-serif",
                      {
                        "text-[#8B2131]": isActive || isCompleted,
                        "text-[#5D4037]": !isActive && !isCompleted,
                      }
                    )}
                  >
                    {step.title}
                  </div>
                  {step.description && (
                    <div className={cn("text-xs mt-1", {
                      "text-[#8B2131]/80": isActive,
                      "text-[#5D4037]/70": !isActive
                    })}>
                      {step.description}
                    </div>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-4 transition-colors",
                    {
                      "bg-[#8B2131]": stepNumber < currentStep,
                      "bg-[#E6D5B8]": stepNumber >= currentStep,
                    }
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;