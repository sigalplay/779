import { useEffect, useState } from "react";

export const PHONE_QUERY = "(max-width: 767px)";

// True while the media query matches, e.g. useMediaQuery("(max-width: 760px)").
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const list = window.matchMedia(query);
    const update = () => setMatches(list.matches);
    update();
    list.addEventListener?.("change", update);
    return () => list.removeEventListener?.("change", update);
  }, [query]);
  return matches;
}
