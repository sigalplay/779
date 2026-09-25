import{c as s,u as c,j as d}from"./index-BCTGxko1.js";import{u as p,P as l}from"./use-media-query-CN6gsvaz.js";/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=s("Copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);function k({value:o,className:n}){const a=p(l),{t:i}=c(),e=a&&/^https?:\/\//i.test(String(o||"").trim()),r=t=>{t.preventDefault(),window.location.assign(String(o).trim())};return d.jsx("input",{readOnly:!0,value:o,className:e?`${n} mobile-openable-board-link`:n,onFocus:e?void 0:t=>t.target.select(),onClick:e?r:void 0,onKeyDown:e?t=>(t.key==="Enter"||t.key===" ")&&r(t):void 0,role:e?"link":void 0,tabIndex:e?0:void 0,title:e?i("פתיחת הלוח","Open the board"):void 0,"aria-label":e?i("פתיחת הקישור ללוח","Open the board link"):void 0})}export{h as C,k as S};
