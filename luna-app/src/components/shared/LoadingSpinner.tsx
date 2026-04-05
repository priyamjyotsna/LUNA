import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function LoadingSpinner({
  className,
  label = "Loading",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <Loader2
      className={cn("size-6 animate-spin text-primary", className)}
      aria-label={label}
      role="status"
    />
  );
}
