"use client";

import { CheckCircle, ArrowRight, DollarSign } from "lucide-react";
import { useCompanyStore } from "@/stores/company";

interface StepFundingProps {
  onNext: () => void;
  onBack: () => void;
}

export default function StepFunding({ onNext, onBack }: StepFundingProps) {
  const company = useCompanyStore((s) => s.company);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Funding Readiness</h2>
        <p className="text-sm text-gray-500 mt-2">
          You are almost ready to run your first payroll!
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="mt-1 flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">Company & Wallet Configured</h3>
            <p className="text-sm text-gray-500 mt-1">
              Your admin wallet and company profile are set up successfully.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="mt-1 flex-shrink-0">
            <DollarSign className="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">Fund Your Treasury</h3>
            <p className="text-sm text-gray-500 mt-1">
              Before running payroll, ensure your Treasury Wallet has sufficient USDC.
            </p>
            {company?.treasury && (
              <div className="mt-3 p-3 bg-gray-50 border border-gray-100 rounded-md">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Treasury Address</p>
                <p className="text-sm font-mono text-gray-900 break-all">{company.treasury}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Go to Dashboard
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
