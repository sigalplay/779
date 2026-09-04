import { useEffect } from "react";
import { getLanguage } from "@/lib/language";

export function useRuntimeEnglishLoader() {
  useEffect(() => {
    let cleanup = null;
    let cancelled = false;
    const loadWhenNeeded = async () => {
      if (getLanguage() !== "en" || cleanup) return;
      const module = await import("@/lib/runtime-ui-en");
      if (!cancelled) cleanup = module.installRuntimeEnglish();
    };
    loadWhenNeeded();
    window.addEventListener("boo_language_change", loadWhenNeeded);
    return () => {
      cancelled = true;
      window.removeEventListener("boo_language_change", loadWhenNeeded);
      cleanup?.();
    };
  }, []);
}
