import { access } from "node:fs/promises";
import { searchIllustrations } from "../src/lib/illustration-search.js";
import { ILLUSTRATION_FILES } from "../src/lib/illustration-files.generated.js";

const cases = [
  ["תפוחים", /apple/],
  ["שוקולד", /chocolate|cocoa/],
  ["מקרר", /fridge/],
  ["דבק", /glue/],
  ["ביסקוויטים", /biscuit|cookie/],
];

for (const [query, expected] of cases) {
  const matches = searchIllustrations(query, "material");
  if (!matches.length || !matches.some((path) => expected.test(path))) throw new Error(`Missing matches for ${query}`);
  await Promise.all(matches.map((file) => access(`public${file}`)));
  const metadata = new Map(ILLUSTRATION_FILES.map((file) => [file.path, file]));
  for (const file of matches) {
    const info = metadata.get(file);
    if (info?.width && info?.height && (info.width < 96 || info.height < 96 || info.width / info.height > 2.2 || info.width / info.height < 0.45)) {
      throw new Error(`Broken/cropped material candidate for ${query}: ${file}`);
    }
    if (/(?:hero|cover|step|preview|worksheet|logo|banner)/i.test(file)) throw new Error(`Non-material result for ${query}: ${file}`);
  }
  console.log(`${query}: ${matches.length} valid matches`);
}
