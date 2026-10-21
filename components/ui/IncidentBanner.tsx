"use client";

import { useState } from "react";
import { AlertTriangle, XCircle, Wrench, X } from "lucide-react";

export type BannerVariant = "warning" | "error" | "maintenance";

export type BannerProps = {
  variant: BannerVariant;
  message: string;
  /** When true the user can dismiss the banner */
  dismissible?: boolean;
  /** Callback fired after the banner is dismissed */
  onDismiss?: () => void;
};

const VARIANT_STYLES: Record<BannerVariant, { bg: string; text: string; border: string }> = {
  warning: {
    bg: "bg-yellow-50",
    text: "text-yellow-800",
    border: "border-yellow-300",
  },
  error: {
    bg: "bg-red-50",
    text: "text-red-800",
    border: "border-red-300",
  },
  maintenance: {
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-300",
  },
};

const VARIANT_ICONS: Record<BannerVariant, React.ElementType> = {
  warning: AlertTriangle,
  error: XCircle,
  maintenance: Wrench,
};

const VARIANT_LABELS: Record<BannerVariant, string> = {
  warning: "Warning",
  error: "Error",
  maintenance: "Maintenance",
};

export function IncidentBanner({ variant, message, dismissible = false, onDismiss }: BannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const styles = VARIANT_STYLES[variant];
  const Icon = VARIANT_ICONS[variant];

  if (dismissed) return null;

  function handleDismiss() {
    setDismissed(true);
    onDismiss?.();
  }

  return (
    <div
      role="alert"
      aria-label={`${VARIANT_LABELS[variant]}: ${message}`}
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 ${styles.bg} ${styles.text} ${styles.border}`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <span className="flex-1 text-sm font-medium">{message}</span>
      {dismissible && (
        <button
          aria-label="Dismiss banner"
          onClick={handleDismiss}
          className="shrink-0 opacity-70 hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
