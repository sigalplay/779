import fs from "node:fs";
import path from "node:path";
import { parse } from "@babel/parser";
import traverseModule from "@babel/traverse";

const traverse = traverseModule.default;
const root = path.resolve("src");
const files = [];
function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full);
    else if (/\.(?:js|jsx|ts|tsx)$/.test(name)) files.push(full);
  }
}
walk(root);
const found = new Map();
const add = (value, file, line, kind) => {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!/[\u0590-\u05ff]/.test(text)) return;
  if (!found.has(text)) found.set(text, []);
  found.get(text).push(`${path.relative(root, file)}:${line}:${kind}`);
};
for (const file of files) {
  const code = fs.readFileSync(file, "utf8");
  let ast;
  try { ast = parse(code, { sourceType: "module", plugins: ["jsx", "typescript"] }); }
  catch { continue; }
  traverse(ast, {
    StringLiteral(p) { add(p.node.value, file, p.node.loc?.start.line || 0, "string"); },
    TemplateElement(p) { add(p.node.value.raw, file, p.node.loc?.start.line || 0, "template"); },
    JSXText(p) { add(p.node.value, file, p.node.loc?.start.line || 0, "jsx"); },
  });
}
const rows = [...found.entries()].sort((a, b) => a[0].localeCompare(b[0], "he"));
fs.writeFileSync("hebrew-ui-audit.json", JSON.stringify(Object.fromEntries(rows), null, 2));
console.log(`${rows.length} unique Hebrew strings across ${files.length} source files`);
