import { Badge } from "@/components/ui/badge";
import type { OnboardingStatus } from "@/types";
import { CheckCircle2, CircleDashed, Circle } from "lucide-react";

interface OnboardingBadgeProps {
  status: OnboardingStatus;
  showIcon?: boolean;
}

export default function OnboardingBadge({ status, showIcon = true }: OnboardingBadgeProps) {
  const config = {
    completed: {
      label: "Completed",
      variant: "success" as const,
      icon: CheckCircle2,
    },
    in_progress: {
      label: "In Progress",
      variant: "warning" as const,
      icon: CircleDashed,
    },
    not_started: {
      label: "Not Started",
      variant: "default" as const,
      icon: Circle,
    },
  };

  const { label, variant, icon: Icon } = config[status];

  return (
    <Badge variant={variant} className="gap-1 px-2.5 py-1">
      {showIcon && <Icon className="h-3 w-3" />}
      {label}
    </Badge>
  );
}
