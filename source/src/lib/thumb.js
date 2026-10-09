import { THUMB_SOURCES } from "@/lib/thumb-list";

// The small copy of a card picture (made by scripts/make-thumbs.mjs), or the original when it has none.
export function thumb(src) {
  if (!src || !THUMB_SOURCES.has(src)) return src;
  return src.replace(/^\/icon-bank\//, "/icon-bank/thumbs/").replace(/\.(png|jpg)$/, ".webp");
}
