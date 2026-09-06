import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const DialogContext = React.createContext(null);

export function Dialog({ open, onOpenChange, children }) {
  return <DialogContext.Provider value={{ open, setOpen: onOpenChange }}>{children}</DialogContext.Provider>;
}

export function DialogTrigger({ asChild, children }) {
  const ctx = React.useContext(DialogContext);
  if (!ctx) return children;
  const onClick = (e) => {
    children.props.onClick?.(e);
    ctx.setOpen(true);
  };
  if (asChild) return React.cloneElement(children, { onClick });
  return (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  );
}

export function DialogContent({ children, className, dir = "rtl" }) {
  const ctx = React.useContext(DialogContext);

  React.useEffect(() => {
    if (!ctx?.open) return;
    const onKey = (e) => e.key === "Escape" && ctx.setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [ctx?.open, ctx]);

  if (!ctx) return null;

  return createPortal(
    <AnimatePresence>
      {ctx.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir={dir}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => ctx.setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-xl",
              className,
            )}
          >
            <button
              type="button"
              onClick={() => ctx.setOpen(false)}
              aria-label="סגור"
              className="absolute left-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function DialogHeader({ children }) {
  return <div className="mb-4 pe-6">{children}</div>;
}
export function DialogTitle({ children }) {
  return <h2 className="font-display text-xl font-bold">{children}</h2>;
}
export function DialogFooter({ children, className }) {
  return <div className={cn("mt-5 flex items-center justify-end gap-2", className)}>{children}</div>;
}
