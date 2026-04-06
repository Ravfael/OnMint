import React from "react";
import { Check } from "lucide-react";

export interface MintProgressBarProps {
  currentStep: number;
}

const STEPS = ["Upload Image", "Upload Metadata", "Confirm Wallet", "Minting"];

export function MintProgressBar({ currentStep }: MintProgressBarProps) {
  return (
    <div className="w-full max-w-3xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between w-full">
        {STEPS.map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <React.Fragment key={label}>
              {/* Step Circle */}
              <div className="relative flex flex-col items-center flex-shrink-0">
                <div
                  className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all duration-300 ${
                    isCompleted ? "bg-green-500 text-white" : isActive ? "bg-[#6c63ff] text-white animate-pulse shadow-[0_0_15px_rgba(108,99,255,0.5)]" : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {isCompleted ? <Check size={20} className="sm:w-6 sm:h-6" strokeWidth={3} /> : <span className="font-bold text-sm sm:text-base">{stepNumber}</span>}
                </div>

                {/* Step Label */}
                <span
                  className={`absolute top-12 sm:top-14 mt-1 text-xs sm:text-sm font-medium whitespace-nowrap ${isActive ? "text-black dark:text-white" : isCompleted ? "text-black dark:text-white" : "text-gray-500 dark:text-gray-400"}`}
                >
                  {label}
                </span>
              </div>

              {/* Connecting Line */}
              {index < STEPS.length - 1 && <div className={`flex-1 h-1 mx-2 sm:mx-4 rounded transition-colors duration-300 ${isCompleted ? "bg-[#6c63ff] dark:bg-green-500" : "bg-gray-200 dark:bg-gray-700"}`} />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
