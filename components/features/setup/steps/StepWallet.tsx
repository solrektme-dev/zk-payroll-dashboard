"use client";

import { useEffect } from "react";
import { Wallet, AlertCircle } from "lucide-react";
import { useWalletStore } from "@/stores/walletStore";
import { useStellar } from "@/components/providers/StellarProvider";
import WalletConnect from "@/components/features/wallet/WalletConnect";

interface StepWalletProps {
  onNext: () => void;
}

export default function StepWallet({ onNext }: StepWalletProps) {
  const { isConnected } = useWalletStore();
  const { isFreighterInstalled } = useStellar();

  useEffect(() => {
    // If wallet is connected, they can proceed
    if (isConnected) {
      // Small delay for smooth UX transition if they just connected
      const timer = setTimeout(() => onNext(), 800);
      return () => clearTimeout(timer);
    }
  }, [isConnected, onNext]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Connect Your Wallet</h2>
        <p className="text-sm text-gray-500 mt-2">
          Your wallet acts as your admin identity. Connect Freighter to get started.
        </p>
      </div>

      {!isFreighterInstalled && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
          <div className="flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-amber-800">Freighter Wallet Not Found</h3>
              <p className="text-sm text-amber-700 mt-1">
                You need the Freighter browser extension to continue.
              </p>
              <a
                href="https://www.freighter.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Install Freighter &rarr;
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border border-gray-100 rounded-lg space-y-4">
        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
          <Wallet className="w-8 h-8 text-indigo-600" />
        </div>
        <p className="text-sm font-medium text-gray-700">
          {isConnected ? "Wallet Connected!" : "Awaiting Connection..."}
        </p>
        {!isConnected && <WalletConnect />}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!isConnected}
          className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
