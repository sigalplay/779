import fs from "node:fs";
import { parse } from "@babel/parser";
const code=fs.readFileSync("src/pages/TherapistRecipes.jsx","utf8");
const ast=parse(code,{sourceType:"module",plugins:["jsx"]});
const val=n=>n?.type==="StringLiteral"?n.value:n?.type==="NumericLiteral"?n.value:null;
const prop=(o,k)=>o.properties?.find(p=>p.key?.name===k||p.key?.value===k)?.value;
const arr=n=>(n?.elements||[]).map(o=>({n:val(prop(o,"n")),text:val(prop(o,"text"))}));
let out=[];
for(const n of ast.program.body){
 const d=n.type==="ExportNamedDeclaration"?n.declaration:n;
 if(d?.type!=="VariableDeclaration")continue;
 for(const x of d.declarations)if(x.id?.name==="RECIPES")out=(x.init.elements||[]).map(o=>({id:val(prop(o,"id")),title:val(prop(o,"title")),duration:val(prop(o,"duration")),ingredients:arr(prop(o,"ingredients")).map(x=>x.text),tools:arr(prop(o,"tools")).map(x=>x.text),steps:arr(prop(o,"steps")).map(x=>x.text)}));
}
console.log(JSON.stringify(out,null,2));
