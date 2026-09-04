import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function Checkbox({ id, checked, onCheckedChange, className }) {
  return (
    <button
      id={id}
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "flex h-7 w-7 min-h-7 min-w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
        checked ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background",
        className,
      )}
    >
      {checked ? <Check className="h-4 w-4" strokeWidth={3} /> : null}
    </button>
  );
}
