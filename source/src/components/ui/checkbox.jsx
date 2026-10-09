import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// The tap area is 44px (easy to hit with a finger on a phone) around a 32px circle; the negative
// margin keeps the row spacing as it was.
export function Checkbox({ id, checked, onCheckedChange, className, "aria-label": ariaLabel }) {
  return (
    <button
      id={id}
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={(event) => { event.stopPropagation(); onCheckedChange(!checked); }}
      className={cn(
        "group shrink-0 touch-manipulation rounded-full focus-visible:outline-none",
        className,
        "-m-1.5 flex h-11 w-11 min-h-11 min-w-11 items-center justify-center",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors group-focus-visible:ring-2 group-focus-visible:ring-sky",
          checked ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background group-hover:border-primary/60",
        )}
      >
        {checked ? <Check className="h-5 w-5" strokeWidth={3} /> : null}
      </span>
    </button>
  );
}
