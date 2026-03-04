import{r as c,a as Wt,R as Vt,b as Ht}from"./vendor-Dpv31O69.js";var et={exports:{}},ue={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Bt=c,Ut=Symbol.for("react.element"),Gt=Symbol.for("react.fragment"),$t=Object.prototype.hasOwnProperty,Zt=Bt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,Xt={key:!0,ref:!0,__self:!0,__source:!0};function tt(e,t,r){var n,a={},o=null,i=null;r!==void 0&&(o=""+r),t.key!==void 0&&(o=""+t.key),t.ref!==void 0&&(i=t.ref);for(n in t)$t.call(t,n)&&!Xt.hasOwnProperty(n)&&(a[n]=t[n]);if(e&&e.defaultProps)for(n in t=e.defaultProps,t)a[n]===void 0&&(a[n]=t[n]);return{$$typeof:Ut,type:e,key:o,ref:i,props:a,_owner:Zt.current}}ue.Fragment=Gt;ue.jsx=tt;ue.jsxs=tt;et.exports=ue;var k=et.exports;function q(e,t,{checkForDefaultPrevented:r=!0}={}){return function(a){if(e==null||e(a),r===!1||!a.defaultPrevented)return t==null?void 0:t(a)}}function Kt(e,t){typeof e=="function"?e(t):e!=null&&(e.current=t)}function rt(...e){return t=>e.forEach(r=>Kt(r,t))}function B(...e){return c.useCallback(rt(...e),e)}var Re=c.forwardRef((e,t)=>{const{children:r,...n}=e,a=c.Children.toArray(r),o=a.find(Qt);if(o){const i=o.props.children,s=a.map(h=>h===o?c.Children.count(i)>1?c.Children.only(null):c.isValidElement(i)?i.props.children:null:h);return k.jsx(Ee,{...n,ref:t,children:c.isValidElement(i)?c.cloneElement(i,void 0,s):null})}return k.jsx(Ee,{...n,ref:t,children:r})});Re.displayName="Slot";var Ee=c.forwardRef((e,t)=>{const{children:r,...n}=e;if(c.isValidElement(r)){const a=er(r);return c.cloneElement(r,{...Jt(n,r.props),ref:t?rt(t,a):a})}return c.Children.count(r)>1?c.Children.only(null):null});Ee.displayName="SlotClone";var Yt=({children:e})=>k.jsx(k.Fragment,{children:e});function Qt(e){return c.isValidElement(e)&&e.type===Yt}function Jt(e,t){const r={...t};for(const n in t){const a=e[n],o=t[n];/^on[A-Z]/.test(n)?a&&o?r[n]=(...s)=>{o(...s),a(...s)}:a&&(r[n]=a):n==="style"?r[n]={...a,...o}:n==="className"&&(r[n]=[a,o].filter(Boolean).join(" "))}return{...e,...r}}function er(e){var n,a;let t=(n=Object.getOwnPropertyDescriptor(e.props,"ref"))==null?void 0:n.get,r=t&&"isReactWarning"in t&&t.isReactWarning;return r?e.ref:(t=(a=Object.getOwnPropertyDescriptor(e,"ref"))==null?void 0:a.get,r=t&&"isReactWarning"in t&&t.isReactWarning,r?e.props.ref:e.props.ref||e.ref)}function tr(e,t){const r=c.createContext(t),n=o=>{const{children:i,...s}=o,h=c.useMemo(()=>s,Object.values(s));return k.jsx(r.Provider,{value:h,children:i})};n.displayName=e+"Provider";function a(o){const i=c.useContext(r);if(i)return i;if(t!==void 0)return t;throw new Error(`\`${o}\` must be used within \`${e}\``)}return[n,a]}function rr(e,t=[]){let r=[];function n(o,i){const s=c.createContext(i),h=r.length;r=[...r,i];const u=y=>{var m;const{scope:v,children:g,...x}=y,d=((m=v==null?void 0:v[e])==null?void 0:m[h])||s,f=c.useMemo(()=>x,Object.values(x));return k.jsx(d.Provider,{value:f,children:g})};u.displayName=o+"Provider";function p(y,v){var d;const g=((d=v==null?void 0:v[e])==null?void 0:d[h])||s,x=c.useContext(g);if(x)return x;if(i!==void 0)return i;throw new Error(`\`${y}\` must be used within \`${o}\``)}return[u,p]}const a=()=>{const o=r.map(i=>c.createContext(i));return function(s){const h=(s==null?void 0:s[e])||o;return c.useMemo(()=>({[`__scope${e}`]:{...s,[e]:h}}),[s,h])}};return a.scopeName=e,[n,nr(a,...t)]}function nr(...e){const t=e[0];if(e.length===1)return t;const r=()=>{const n=e.map(a=>({useScope:a(),scopeName:a.scopeName}));return function(o){const i=n.reduce((s,{useScope:h,scopeName:u})=>{const y=h(o)[`__scope${u}`];return{...s,...y}},{});return c.useMemo(()=>({[`__scope${t.scopeName}`]:i}),[i])}};return r.scopeName=t.scopeName,r}var ar=["a","button","div","form","h2","h3","img","input","label","li","nav","ol","p","span","svg","ul"],I=ar.reduce((e,t)=>{const r=c.forwardRef((n,a)=>{const{asChild:o,...i}=n,s=o?Re:t;return typeof window<"u"&&(window[Symbol.for("radix-ui")]=!0),k.jsx(s,{...i,ref:a})});return r.displayName=`Primitive.${t}`,{...e,[t]:r}},{});function or(e,t){e&&Wt.flushSync(()=>e.dispatchEvent(t))}function V(e){const t=c.useRef(e);return c.useEffect(()=>{t.current=e}),c.useMemo(()=>(...r)=>{var n;return(n=t.current)==null?void 0:n.call(t,...r)},[])}function sr(e,t=globalThis==null?void 0:globalThis.document){const r=V(e);c.useEffect(()=>{const n=a=>{a.key==="Escape"&&r(a)};return t.addEventListener("keydown",n,{capture:!0}),()=>t.removeEventListener("keydown",n,{capture:!0})},[r,t])}var ir="DismissableLayer",Se="dismissableLayer.update",cr="dismissableLayer.pointerDownOutside",lr="dismissableLayer.focusOutside",qe,nt=c.createContext({layers:new Set,layersWithOutsidePointerEventsDisabled:new Set,branches:new Set}),Le=c.forwardRef((e,t)=>{const{disableOutsidePointerEvents:r=!1,onEscapeKeyDown:n,onPointerDownOutside:a,onFocusOutside:o,onInteractOutside:i,onDismiss:s,...h}=e,u=c.useContext(nt),[p,y]=c.useState(null),v=(p==null?void 0:p.ownerDocument)??(globalThis==null?void 0:globalThis.document),[,g]=c.useState({}),x=B(t,E=>y(E)),d=Array.from(u.layers),[f]=[...u.layersWithOutsidePointerEventsDisabled].slice(-1),m=d.indexOf(f),w=p?d.indexOf(p):-1,C=u.layersWithOutsidePointerEventsDisabled.size>0,M=w>=m,S=ur(E=>{const L=E.target,T=[...u.branches].some(W=>W.contains(L));!M||T||(a==null||a(E),i==null||i(E),E.defaultPrevented||s==null||s())},v),R=hr(E=>{const L=E.target;[...u.branches].some(W=>W.contains(L))||(o==null||o(E),i==null||i(E),E.defaultPrevented||s==null||s())},v);return sr(E=>{w===u.layers.size-1&&(n==null||n(E),!E.defaultPrevented&&s&&(E.preventDefault(),s()))},v),c.useEffect(()=>{if(p)return r&&(u.layersWithOutsidePointerEventsDisabled.size===0&&(qe=v.body.style.pointerEvents,v.body.style.pointerEvents="none"),u.layersWithOutsidePointerEventsDisabled.add(p)),u.layers.add(p),We(),()=>{r&&u.layersWithOutsidePointerEventsDisabled.size===1&&(v.body.style.pointerEvents=qe)}},[p,v,r,u]),c.useEffect(()=>()=>{p&&(u.layers.delete(p),u.layersWithOutsidePointerEventsDisabled.delete(p),We())},[p,u]),c.useEffect(()=>{const E=()=>g({});return document.addEventListener(Se,E),()=>document.removeEventListener(Se,E)},[]),k.jsx(I.div,{...h,ref:x,style:{pointerEvents:C?M?"auto":"none":void 0,...e.style},onFocusCapture:q(e.onFocusCapture,R.onFocusCapture),onBlurCapture:q(e.onBlurCapture,R.onBlurCapture),onPointerDownCapture:q(e.onPointerDownCapture,S.onPointerDownCapture)})});Le.displayName=ir;var dr="DismissableLayerBranch",at=c.forwardRef((e,t)=>{const r=c.useContext(nt),n=c.useRef(null),a=B(t,n);return c.useEffect(()=>{const o=n.current;if(o)return r.branches.add(o),()=>{r.branches.delete(o)}},[r.branches]),k.jsx(I.div,{...e,ref:a})});at.displayName=dr;function ur(e,t=globalThis==null?void 0:globalThis.document){const r=V(e),n=c.useRef(!1),a=c.useRef(()=>{});return c.useEffect(()=>{const o=s=>{if(s.target&&!n.current){let h=function(){ot(cr,r,u,{discrete:!0})};const u={originalEvent:s};s.pointerType==="touch"?(t.removeEventListener("click",a.current),a.current=h,t.addEventListener("click",a.current,{once:!0})):h()}else t.removeEventListener("click",a.current);n.current=!1},i=window.setTimeout(()=>{t.addEventListener("pointerdown",o)},0);return()=>{window.clearTimeout(i),t.removeEventListener("pointerdown",o),t.removeEventListener("click",a.current)}},[t,r]),{onPointerDownCapture:()=>n.current=!0}}function hr(e,t=globalThis==null?void 0:globalThis.document){const r=V(e),n=c.useRef(!1);return c.useEffect(()=>{const a=o=>{o.target&&!n.current&&ot(lr,r,{originalEvent:o},{discrete:!1})};return t.addEventListener("focusin",a),()=>t.removeEventListener("focusin",a)},[t,r]),{onFocusCapture:()=>n.current=!0,onBlurCapture:()=>n.current=!1}}function We(){const e=new CustomEvent(Se);document.dispatchEvent(e)}function ot(e,t,r,{discrete:n}){const a=r.originalEvent.target,o=new CustomEvent(e,{bubbles:!1,cancelable:!0,detail:r});t&&a.addEventListener(e,t,{once:!0}),n?or(a,o):a.dispatchEvent(o)}var oa=Le,sa=at,le=globalThis!=null&&globalThis.document?c.useLayoutEffect:()=>{},pr="Portal",st=c.forwardRef((e,t)=>{var s;const{container:r,...n}=e,[a,o]=c.useState(!1);le(()=>o(!0),[]);const i=r||a&&((s=globalThis==null?void 0:globalThis.document)==null?void 0:s.body);return i?Vt.createPortal(k.jsx(I.div,{...n,ref:t}),i):null});st.displayName=pr;function fr(e,t){return c.useReducer((r,n)=>t[r][n]??r,e)}var he=e=>{const{present:t,children:r}=e,n=yr(t),a=typeof r=="function"?r({present:n.isPresent}):c.Children.only(r),o=B(n.ref,vr(a));return typeof r=="function"||n.isPresent?c.cloneElement(a,{ref:o}):null};he.displayName="Presence";function yr(e){const[t,r]=c.useState(),n=c.useRef({}),a=c.useRef(e),o=c.useRef("none"),i=e?"mounted":"unmounted",[s,h]=fr(i,{mounted:{UNMOUNT:"unmounted",ANIMATION_OUT:"unmountSuspended"},unmountSuspended:{MOUNT:"mounted",ANIMATION_END:"unmounted"},unmounted:{MOUNT:"mounted"}});return c.useEffect(()=>{const u=re(n.current);o.current=s==="mounted"?u:"none"},[s]),le(()=>{const u=n.current,p=a.current;if(p!==e){const v=o.current,g=re(u);e?h("MOUNT"):g==="none"||(u==null?void 0:u.display)==="none"?h("UNMOUNT"):h(p&&v!==g?"ANIMATION_OUT":"UNMOUNT"),a.current=e}},[e,h]),le(()=>{if(t){let u;const p=t.ownerDocument.defaultView??window,y=g=>{const d=re(n.current).includes(g.animationName);if(g.target===t&&d&&(h("ANIMATION_END"),!a.current)){const f=t.style.animationFillMode;t.style.animationFillMode="forwards",u=p.setTimeout(()=>{t.style.animationFillMode==="forwards"&&(t.style.animationFillMode=f)})}},v=g=>{g.target===t&&(o.current=re(n.current))};return t.addEventListener("animationstart",v),t.addEventListener("animationcancel",y),t.addEventListener("animationend",y),()=>{p.clearTimeout(u),t.removeEventListener("animationstart",v),t.removeEventListener("animationcancel",y),t.removeEventListener("animationend",y)}}else h("ANIMATION_END")},[t,h]),{isPresent:["mounted","unmountSuspended"].includes(s),ref:c.useCallback(u=>{u&&(n.current=getComputedStyle(u)),r(u)},[])}}function re(e){return(e==null?void 0:e.animationName)||"none"}function vr(e){var n,a;let t=(n=Object.getOwnPropertyDescriptor(e.props,"ref"))==null?void 0:n.get,r=t&&"isReactWarning"in t&&t.isReactWarning;return r?e.ref:(t=(a=Object.getOwnPropertyDescriptor(e,"ref"))==null?void 0:a.get,r=t&&"isReactWarning"in t&&t.isReactWarning,r?e.props.ref:e.props.ref||e.ref)}function mr({prop:e,defaultProp:t,onChange:r=()=>{}}){const[n,a]=gr({defaultProp:t,onChange:r}),o=e!==void 0,i=o?e:n,s=V(r),h=c.useCallback(u=>{if(o){const y=typeof u=="function"?u(e):u;y!==e&&s(y)}else a(u)},[o,e,a,s]);return[i,h]}function gr({defaultProp:e,onChange:t}){const r=c.useState(e),[n]=r,a=c.useRef(n),o=V(t);return c.useEffect(()=>{a.current!==n&&(o(n),a.current=n)},[n,a,o]),r}function it(e){var t,r,n="";if(typeof e=="string"||typeof e=="number")n+=e;else if(typeof e=="object")if(Array.isArray(e)){var a=e.length;for(t=0;t<a;t++)e[t]&&(r=it(e[t]))&&(n&&(n+=" "),n+=r)}else for(r in e)e[r]&&(n&&(n+=" "),n+=r);return n}function ia(){for(var e,t,r=0,n="",a=arguments.length;r<a;r++)(e=arguments[r])&&(t=it(e))&&(n&&(n+=" "),n+=t);return n}/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const br=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),ct=(...e)=>e.filter((t,r,n)=>!!t&&t.trim()!==""&&n.indexOf(t)===r).join(" ").trim();/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var kr={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xr=c.forwardRef(({color:e="currentColor",size:t=24,strokeWidth:r=2,absoluteStrokeWidth:n,className:a="",children:o,iconNode:i,...s},h)=>c.createElement("svg",{ref:h,...kr,width:t,height:t,stroke:e,strokeWidth:n?Number(r)*24/Number(t):r,className:ct("lucide",a),...s},[...i.map(([u,p])=>c.createElement(u,p)),...Array.isArray(o)?o:[o]]));/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const l=(e,t)=>{const r=c.forwardRef(({className:n,...a},o)=>c.createElement(xr,{ref:o,iconNode:t,className:ct(`lucide-${br(e)}`,n),...a}));return r.displayName=`${e}`,r};/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ca=l("Activity",[["path",{d:"M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",key:"169zse"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const la=l("ArrowLeft",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const da=l("ArrowRight",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ua=l("ArrowUpRight",[["path",{d:"M7 7h10v10",key:"1tivn9"}],["path",{d:"M7 17 17 7",key:"1vkiza"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ha=l("Award",[["path",{d:"m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526",key:"1yiouv"}],["circle",{cx:"12",cy:"8",r:"6",key:"1vp47v"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const pa=l("BadgeDollarSign",[["path",{d:"M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z",key:"3c2336"}],["path",{d:"M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8",key:"1h4pet"}],["path",{d:"M12 18V6",key:"zqpxq5"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const fa=l("BookOpen",[["path",{d:"M12 7v14",key:"1akyts"}],["path",{d:"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",key:"ruj8y"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ya=l("Book",[["path",{d:"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20",key:"k3hazp"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const va=l("BrainCircuit",[["path",{d:"M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z",key:"l5xja"}],["path",{d:"M9 13a4.5 4.5 0 0 0 3-4",key:"10igwf"}],["path",{d:"M6.003 5.125A3 3 0 0 0 6.401 6.5",key:"105sqy"}],["path",{d:"M3.477 10.896a4 4 0 0 1 .585-.396",key:"ql3yin"}],["path",{d:"M6 18a4 4 0 0 1-1.967-.516",key:"2e4loj"}],["path",{d:"M12 13h4",key:"1ku699"}],["path",{d:"M12 18h6a2 2 0 0 1 2 2v1",key:"105ag5"}],["path",{d:"M12 8h8",key:"1lhi5i"}],["path",{d:"M16 8V5a2 2 0 0 1 2-2",key:"u6izg6"}],["circle",{cx:"16",cy:"13",r:".5",key:"ry7gng"}],["circle",{cx:"18",cy:"3",r:".5",key:"1aiba7"}],["circle",{cx:"20",cy:"21",r:".5",key:"yhc1fs"}],["circle",{cx:"20",cy:"8",r:".5",key:"1e43v0"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ma=l("Brain",[["path",{d:"M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z",key:"l5xja"}],["path",{d:"M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z",key:"ep3f8r"}],["path",{d:"M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4",key:"1p4c4q"}],["path",{d:"M17.599 6.5a3 3 0 0 0 .399-1.375",key:"tmeiqw"}],["path",{d:"M6.003 5.125A3 3 0 0 0 6.401 6.5",key:"105sqy"}],["path",{d:"M3.477 10.896a4 4 0 0 1 .585-.396",key:"ql3yin"}],["path",{d:"M19.938 10.5a4 4 0 0 1 .585.396",key:"1qfode"}],["path",{d:"M6 18a4 4 0 0 1-1.967-.516",key:"2e4loj"}],["path",{d:"M19.967 17.484A4 4 0 0 1 18 18",key:"159ez6"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ga=l("Briefcase",[["path",{d:"M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16",key:"jecpp"}],["rect",{width:"20",height:"14",x:"2",y:"6",rx:"2",key:"i6l2r4"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ba=l("Building2",[["path",{d:"M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z",key:"1b4qmf"}],["path",{d:"M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2",key:"i71pzd"}],["path",{d:"M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2",key:"10jefs"}],["path",{d:"M10 6h4",key:"1itunk"}],["path",{d:"M10 10h4",key:"tcdvrf"}],["path",{d:"M10 14h4",key:"kelpxr"}],["path",{d:"M10 18h4",key:"1ulq68"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ka=l("Building",[["rect",{width:"16",height:"20",x:"4",y:"2",rx:"2",ry:"2",key:"76otgf"}],["path",{d:"M9 22v-4h6v4",key:"r93iot"}],["path",{d:"M8 6h.01",key:"1dz90k"}],["path",{d:"M16 6h.01",key:"1x0f13"}],["path",{d:"M12 6h.01",key:"1vi96p"}],["path",{d:"M12 10h.01",key:"1nrarc"}],["path",{d:"M12 14h.01",key:"1etili"}],["path",{d:"M16 10h.01",key:"1m94wz"}],["path",{d:"M16 14h.01",key:"1gbofw"}],["path",{d:"M8 10h.01",key:"19clt8"}],["path",{d:"M8 14h.01",key:"6423bh"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xa=l("Calculator",[["rect",{width:"16",height:"20",x:"4",y:"2",rx:"2",key:"1nb95v"}],["line",{x1:"8",x2:"16",y1:"6",y2:"6",key:"x4nwl0"}],["line",{x1:"16",x2:"16",y1:"14",y2:"18",key:"wjye3r"}],["path",{d:"M16 10h.01",key:"1m94wz"}],["path",{d:"M12 10h.01",key:"1nrarc"}],["path",{d:"M8 10h.01",key:"19clt8"}],["path",{d:"M12 14h.01",key:"1etili"}],["path",{d:"M8 14h.01",key:"6423bh"}],["path",{d:"M12 18h.01",key:"mhygvu"}],["path",{d:"M8 18h.01",key:"lrp35t"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const wa=l("Calendar",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ma=l("Camera",[["path",{d:"M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z",key:"1tc9qg"}],["circle",{cx:"12",cy:"13",r:"3",key:"1vg3eu"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ca=l("ChartColumn",[["path",{d:"M3 3v16a2 2 0 0 0 2 2h16",key:"c24i48"}],["path",{d:"M18 17V9",key:"2bz60n"}],["path",{d:"M13 17V5",key:"1frdt8"}],["path",{d:"M8 17v-3",key:"17ska0"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ea=l("ChartLine",[["path",{d:"M3 3v16a2 2 0 0 0 2 2h16",key:"c24i48"}],["path",{d:"m19 9-5 5-4-4-3 3",key:"2osh9i"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Sa=l("ChartNoAxesColumn",[["line",{x1:"18",x2:"18",y1:"20",y2:"10",key:"1xfpm4"}],["line",{x1:"12",x2:"12",y1:"20",y2:"4",key:"be30l9"}],["line",{x1:"6",x2:"6",y1:"20",y2:"14",key:"1r4le6"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Aa=l("ChartPie",[["path",{d:"M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z",key:"pzmjnu"}],["path",{d:"M21.21 15.89A10 10 0 1 1 8 2.83",key:"k2fpak"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Pa=l("Check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ra=l("ChevronDown",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const La=l("ChevronLeft",[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const za=l("ChevronRight",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Na=l("ChevronUp",[["path",{d:"m18 15-6-6-6 6",key:"153udz"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ta=l("CircleAlert",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Oa=l("CircleCheckBig",[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Da=l("CircleCheck",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ia=l("CircleX",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ja=l("Circle",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _a=l("ClipboardCheck",[["rect",{width:"8",height:"4",x:"8",y:"2",rx:"1",ry:"1",key:"tgr4d6"}],["path",{d:"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",key:"116196"}],["path",{d:"m9 14 2 2 4-4",key:"df797q"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Fa=l("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const qa=l("Code",[["polyline",{points:"16 18 22 12 16 6",key:"z7tu5w"}],["polyline",{points:"8 6 2 12 8 18",key:"1eg1df"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Wa=l("Combine",[["path",{d:"M10 18H5a3 3 0 0 1-3-3v-1",key:"ru65g8"}],["path",{d:"M14 2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2",key:"e30een"}],["path",{d:"M20 2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2",key:"2ahx8o"}],["path",{d:"m7 21 3-3-3-3",key:"127cv2"}],["rect",{x:"14",y:"14",width:"8",height:"8",rx:"2",key:"1b0bso"}],["rect",{x:"2",y:"2",width:"8",height:"8",rx:"2",key:"1x09vl"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Va=l("Compass",[["path",{d:"m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z",key:"9ktpf1"}],["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ha=l("Copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ba=l("Cpu",[["rect",{width:"16",height:"16",x:"4",y:"4",rx:"2",key:"14l7u7"}],["rect",{width:"6",height:"6",x:"9",y:"9",rx:"1",key:"5aljv4"}],["path",{d:"M15 2v2",key:"13l42r"}],["path",{d:"M15 20v2",key:"15mkzm"}],["path",{d:"M2 15h2",key:"1gxd5l"}],["path",{d:"M2 9h2",key:"1bbxkp"}],["path",{d:"M20 15h2",key:"19e6y8"}],["path",{d:"M20 9h2",key:"19tzq7"}],["path",{d:"M9 2v2",key:"165o2o"}],["path",{d:"M9 20v2",key:"i2bqo8"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ua=l("Crown",[["path",{d:"M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z",key:"1vdc57"}],["path",{d:"M5 21h14",key:"11awu3"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ga=l("Database",[["ellipse",{cx:"12",cy:"5",rx:"9",ry:"3",key:"msslwz"}],["path",{d:"M3 5V19A9 3 0 0 0 21 19V5",key:"1wlel7"}],["path",{d:"M3 12A9 3 0 0 0 21 12",key:"mv7ke4"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $a=l("DollarSign",[["line",{x1:"12",x2:"12",y1:"2",y2:"22",key:"7eqyqh"}],["path",{d:"M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",key:"1b0p4s"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Za=l("Download",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"7 10 12 15 17 10",key:"2ggqvy"}],["line",{x1:"12",x2:"12",y1:"15",y2:"3",key:"1vk2je"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Xa=l("Ellipsis",[["circle",{cx:"12",cy:"12",r:"1",key:"41hilf"}],["circle",{cx:"19",cy:"12",r:"1",key:"1wjl8i"}],["circle",{cx:"5",cy:"12",r:"1",key:"1pcz8c"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ka=l("ExternalLink",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ya=l("Eye",[["path",{d:"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",key:"1nclc0"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Qa=l("Facebook",[["path",{d:"M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",key:"1jg4f8"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ja=l("FileDown",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M12 18v-6",key:"17g6i2"}],["path",{d:"m9 15 3 3 3-3",key:"1npd3o"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const eo=l("FileSpreadsheet",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M8 13h2",key:"yr2amv"}],["path",{d:"M14 13h2",key:"un5t4a"}],["path",{d:"M8 17h2",key:"2yhykz"}],["path",{d:"M14 17h2",key:"10kma7"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const to=l("FileText",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ro=l("Filter",[["polygon",{points:"22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3",key:"1yg77f"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const no=l("Folder",[["path",{d:"M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",key:"1kt360"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ao=l("Globe",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",key:"13o1zl"}],["path",{d:"M2 12h20",key:"9i4pu4"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const oo=l("GraduationCap",[["path",{d:"M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z",key:"j76jl0"}],["path",{d:"M22 10v6",key:"1lu8f3"}],["path",{d:"M6 12.5V16a6 3 0 0 0 12 0v-3.5",key:"1r8lef"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const so=l("Handshake",[["path",{d:"m11 17 2 2a1 1 0 1 0 3-3",key:"efffak"}],["path",{d:"m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4",key:"9pr0kb"}],["path",{d:"m21 3 1 11h-2",key:"1tisrp"}],["path",{d:"M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3",key:"1uvwmv"}],["path",{d:"M3 4h8",key:"1ep09j"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const io=l("Hash",[["line",{x1:"4",x2:"20",y1:"9",y2:"9",key:"4lhtct"}],["line",{x1:"4",x2:"20",y1:"15",y2:"15",key:"vyu0kd"}],["line",{x1:"10",x2:"8",y1:"3",y2:"21",key:"1ggp8o"}],["line",{x1:"16",x2:"14",y1:"3",y2:"21",key:"weycgp"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const co=l("HeartHandshake",[["path",{d:"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",key:"c3ymky"}],["path",{d:"M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66",key:"4oyue0"}],["path",{d:"m18 15-2-2",key:"60u0ii"}],["path",{d:"m15 18-2-2",key:"6p76be"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const lo=l("House",[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"1d0kgt"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const uo=l("Image",[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",ry:"2",key:"1m3agn"}],["circle",{cx:"9",cy:"9",r:"2",key:"af1f0g"}],["path",{d:"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21",key:"1xmnt7"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ho=l("Info",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const po=l("Instagram",[["rect",{width:"20",height:"20",x:"2",y:"2",rx:"5",ry:"5",key:"2e1cvw"}],["path",{d:"M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z",key:"9exkf1"}],["line",{x1:"17.5",x2:"17.51",y1:"6.5",y2:"6.5",key:"r4j83e"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const fo=l("Layers",[["path",{d:"m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z",key:"8b97xw"}],["path",{d:"m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65",key:"dd6zsq"}],["path",{d:"m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65",key:"ep9fru"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const yo=l("LayoutDashboard",[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const vo=l("LayoutTemplate",[["rect",{width:"18",height:"7",x:"3",y:"3",rx:"1",key:"f1a2em"}],["rect",{width:"9",height:"7",x:"3",y:"14",rx:"1",key:"jqznyg"}],["rect",{width:"5",height:"7",x:"16",y:"14",rx:"1",key:"q5h2i8"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const mo=l("Lightbulb",[["path",{d:"M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5",key:"1gvzjb"}],["path",{d:"M9 18h6",key:"x1upvd"}],["path",{d:"M10 22h4",key:"ceow96"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const go=l("Linkedin",[["path",{d:"M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z",key:"c2jq9f"}],["rect",{width:"4",height:"12",x:"2",y:"9",key:"mk3on5"}],["circle",{cx:"4",cy:"4",r:"2",key:"bt5ra8"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const bo=l("ListChecks",[["path",{d:"m3 17 2 2 4-4",key:"1jhpwq"}],["path",{d:"m3 7 2 2 4-4",key:"1obspn"}],["path",{d:"M13 6h8",key:"15sg57"}],["path",{d:"M13 12h8",key:"h98zly"}],["path",{d:"M13 18h8",key:"oe0vm4"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ko=l("LoaderCircle",[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xo=l("Lock",[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const wo=l("LogOut",[["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}],["polyline",{points:"16 17 21 12 16 7",key:"1gabdz"}],["line",{x1:"21",x2:"9",y1:"12",y2:"12",key:"1uyos4"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Mo=l("Mail",[["rect",{width:"20",height:"16",x:"2",y:"4",rx:"2",key:"18n3k1"}],["path",{d:"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7",key:"1ocrg3"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Co=l("Map",[["path",{d:"M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z",key:"169xi5"}],["path",{d:"M15 5.764v15",key:"1pn4in"}],["path",{d:"M9 3.236v15",key:"1uimfh"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Eo=l("Megaphone",[["path",{d:"m3 11 18-5v12L3 14v-3z",key:"n962bs"}],["path",{d:"M11.6 16.8a3 3 0 1 1-5.8-1.6",key:"1yl0tm"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const So=l("Menu",[["line",{x1:"4",x2:"20",y1:"12",y2:"12",key:"1e0a9i"}],["line",{x1:"4",x2:"20",y1:"6",y2:"6",key:"1owob3"}],["line",{x1:"4",x2:"20",y1:"18",y2:"18",key:"yk5zj1"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ao=l("MessageCircle",[["path",{d:"M7.9 20A9 9 0 1 0 4 16.1L2 22Z",key:"vv11sd"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Po=l("MessageSquareCode",[["path",{d:"M10 7.5 8 10l2 2.5",key:"xb17xw"}],["path",{d:"m14 7.5 2 2.5-2 2.5",key:"5rap1v"}],["path",{d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",key:"1lielz"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ro=l("MessageSquare",[["path",{d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",key:"1lielz"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Lo=l("Microscope",[["path",{d:"M6 18h8",key:"1borvv"}],["path",{d:"M3 22h18",key:"8prr45"}],["path",{d:"M14 22a7 7 0 1 0 0-14h-1",key:"1jwaiy"}],["path",{d:"M9 14h2",key:"197e7h"}],["path",{d:"M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z",key:"1bmzmy"}],["path",{d:"M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3",key:"1drr47"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const zo=l("Minus",[["path",{d:"M5 12h14",key:"1ays0h"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const No=l("MonitorPlay",[["path",{d:"M10 7.75a.75.75 0 0 1 1.142-.638l3.664 2.249a.75.75 0 0 1 0 1.278l-3.664 2.25a.75.75 0 0 1-1.142-.64z",key:"1pctta"}],["path",{d:"M12 17v4",key:"1riwvh"}],["path",{d:"M8 21h8",key:"1ev6f3"}],["rect",{x:"2",y:"3",width:"20",height:"14",rx:"2",key:"x3v2xh"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const To=l("Monitor",[["rect",{width:"20",height:"14",x:"2",y:"3",rx:"2",key:"48i651"}],["line",{x1:"8",x2:"16",y1:"21",y2:"21",key:"1svkeh"}],["line",{x1:"12",x2:"12",y1:"17",y2:"21",key:"vw1qmm"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Oo=l("MousePointer2",[["path",{d:"M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z",key:"edeuup"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Do=l("MousePointerClick",[["path",{d:"M14 4.1 12 6",key:"ita8i4"}],["path",{d:"m5.1 8-2.9-.8",key:"1go3kf"}],["path",{d:"m6 12-1.9 2",key:"mnht97"}],["path",{d:"M7.2 2.2 8 5.1",key:"1cfko1"}],["path",{d:"M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z",key:"s0h3yz"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Io=l("Network",[["rect",{x:"16",y:"16",width:"6",height:"6",rx:"1",key:"4q2zg0"}],["rect",{x:"2",y:"16",width:"6",height:"6",rx:"1",key:"8cvhb9"}],["rect",{x:"9",y:"2",width:"6",height:"6",rx:"1",key:"1egb70"}],["path",{d:"M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3",key:"1jsf9p"}],["path",{d:"M12 12V8",key:"2874zd"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const jo=l("OctagonAlert",[["path",{d:"M12 16h.01",key:"1drbdi"}],["path",{d:"M12 8v4",key:"1got3b"}],["path",{d:"M15.312 2a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586l-4.688-4.688A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2z",key:"1fd625"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _o=l("PanelRight",[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["path",{d:"M15 3v18",key:"14nvp0"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Fo=l("PenTool",[["path",{d:"M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z",key:"nt11vn"}],["path",{d:"m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18",key:"15qc1e"}],["path",{d:"m2.3 2.3 7.286 7.286",key:"1wuzzi"}],["circle",{cx:"11",cy:"11",r:"2",key:"xmgehs"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const qo=l("Pen",[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Wo=l("Pencil",[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}],["path",{d:"m15 5 4 4",key:"1mk7zo"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Vo=l("Phone",[["path",{d:"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",key:"foiqr5"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ho=l("Plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Bo=l("Presentation",[["path",{d:"M2 3h20",key:"91anmk"}],["path",{d:"M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3",key:"2k9sn8"}],["path",{d:"m7 21 5-5 5 5",key:"bip4we"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Uo=l("RefreshCw",[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Go=l("Repeat",[["path",{d:"m17 2 4 4-4 4",key:"nntrym"}],["path",{d:"M3 11v-1a4 4 0 0 1 4-4h14",key:"84bu3i"}],["path",{d:"m7 22-4-4 4-4",key:"1wqhfi"}],["path",{d:"M21 13v1a4 4 0 0 1-4 4H3",key:"1rx37r"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $o=l("Rocket",[["path",{d:"M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z",key:"m3kijz"}],["path",{d:"m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z",key:"1fmvmk"}],["path",{d:"M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0",key:"1f8sc4"}],["path",{d:"M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5",key:"qeys4"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Zo=l("RotateCcw",[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Xo=l("Save",[["path",{d:"M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",key:"1c8476"}],["path",{d:"M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7",key:"1ydtos"}],["path",{d:"M7 3v4a1 1 0 0 0 1 1h7",key:"t51u73"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ko=l("Search",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Yo=l("Send",[["path",{d:"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",key:"1ffxy3"}],["path",{d:"m21.854 2.147-10.94 10.939",key:"12cjpa"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Qo=l("Settings",[["path",{d:"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",key:"1qme2f"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Jo=l("Share2",[["circle",{cx:"18",cy:"5",r:"3",key:"gq8acd"}],["circle",{cx:"6",cy:"12",r:"3",key:"w7nqdw"}],["circle",{cx:"18",cy:"19",r:"3",key:"1xt0gg"}],["line",{x1:"8.59",x2:"15.42",y1:"13.51",y2:"17.49",key:"47mynk"}],["line",{x1:"15.41",x2:"8.59",y1:"6.51",y2:"10.49",key:"1n3mei"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const es=l("ShieldAlert",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"M12 8v4",key:"1got3b"}],["path",{d:"M12 16h.01",key:"1drbdi"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ts=l("ShieldCheck",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const rs=l("Shield",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ns=l("Smartphone",[["rect",{width:"14",height:"20",x:"5",y:"2",rx:"2",ry:"2",key:"1yt0o3"}],["path",{d:"M12 18h.01",key:"mhygvu"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const as=l("SquarePen",[["path",{d:"M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",key:"1m0v6g"}],["path",{d:"M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",key:"ohrbg2"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const os=l("SquarePlay",[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["path",{d:"m9 8 6 4-6 4Z",key:"f1r3lt"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ss=l("Star",[["path",{d:"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",key:"r04s7s"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const is=l("Target",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["circle",{cx:"12",cy:"12",r:"6",key:"1vlfrh"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const cs=l("Terminal",[["polyline",{points:"4 17 10 11 4 5",key:"akl6gq"}],["line",{x1:"12",x2:"20",y1:"19",y2:"19",key:"q2wloq"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ls=l("Trash2",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ds=l("TrendingDown",[["polyline",{points:"22 17 13.5 8.5 8.5 13.5 2 7",key:"1r2t7k"}],["polyline",{points:"16 17 22 17 22 11",key:"11uiuu"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const us=l("TrendingUp",[["polyline",{points:"22 7 13.5 15.5 8.5 10.5 2 17",key:"126l90"}],["polyline",{points:"16 7 22 7 22 13",key:"kwv8wd"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const hs=l("TriangleAlert",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ps=l("Trophy",[["path",{d:"M6 9H4.5a2.5 2.5 0 0 1 0-5H6",key:"17hqa7"}],["path",{d:"M18 9h1.5a2.5 2.5 0 0 0 0-5H18",key:"lmptdp"}],["path",{d:"M4 22h16",key:"57wxv0"}],["path",{d:"M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22",key:"1nw9bq"}],["path",{d:"M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22",key:"1np0yb"}],["path",{d:"M18 2H6v7a6 6 0 0 0 12 0V2Z",key:"u46fv3"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const fs=l("Twitter",[["path",{d:"M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z",key:"pff0z6"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ys=l("Upload",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"17 8 12 3 7 8",key:"t8dd8p"}],["line",{x1:"12",x2:"12",y1:"3",y2:"15",key:"widbto"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const vs=l("UserCheck",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["polyline",{points:"16 11 18 13 22 9",key:"1pwet4"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ms=l("UserX",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["line",{x1:"17",x2:"22",y1:"8",y2:"13",key:"3nzzx3"}],["line",{x1:"22",x2:"17",y1:"8",y2:"13",key:"1swrse"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const gs=l("User",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const bs=l("Users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75",key:"1da9ce"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ks=l("Video",[["path",{d:"m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5",key:"ftymec"}],["rect",{x:"2",y:"6",width:"14",height:"12",rx:"2",key:"158x01"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xs=l("Wallet",[["path",{d:"M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1",key:"18etb6"}],["path",{d:"M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4",key:"xoc0q4"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ws=l("WandSparkles",[["path",{d:"m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72",key:"ul74o6"}],["path",{d:"m14 7 3 3",key:"1r5n42"}],["path",{d:"M5 6v4",key:"ilb8ba"}],["path",{d:"M19 14v4",key:"blhpug"}],["path",{d:"M10 2v2",key:"7u0qdc"}],["path",{d:"M7 8H3",key:"zfb6yr"}],["path",{d:"M21 16h-4",key:"1cnmox"}],["path",{d:"M11 3H9",key:"1obp7u"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ms=l("Wrench",[["path",{d:"M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",key:"cbrjhi"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Cs=l("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Es=l("Youtube",[["path",{d:"M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17",key:"1q2vi4"}],["path",{d:"m10 15 5-3-5-3z",key:"1jp15x"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ss=l("Zap",[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",key:"1xq2db"}]]),ze="-",wr=e=>{const t=Cr(e),{conflictingClassGroups:r,conflictingClassGroupModifiers:n}=e;return{getClassGroupId:i=>{const s=i.split(ze);return s[0]===""&&s.length!==1&&s.shift(),lt(s,t)||Mr(i)},getConflictingClassGroupIds:(i,s)=>{const h=r[i]||[];return s&&n[i]?[...h,...n[i]]:h}}},lt=(e,t)=>{var i;if(e.length===0)return t.classGroupId;const r=e[0],n=t.nextPart.get(r),a=n?lt(e.slice(1),n):void 0;if(a)return a;if(t.validators.length===0)return;const o=e.join(ze);return(i=t.validators.find(({validator:s})=>s(o)))==null?void 0:i.classGroupId},Ve=/^\[(.+)\]$/,Mr=e=>{if(Ve.test(e)){const t=Ve.exec(e)[1],r=t==null?void 0:t.substring(0,t.indexOf(":"));if(r)return"arbitrary.."+r}},Cr=e=>{const{theme:t,prefix:r}=e,n={nextPart:new Map,validators:[]};return Sr(Object.entries(e.classGroups),r).forEach(([o,i])=>{Ae(i,n,o,t)}),n},Ae=(e,t,r,n)=>{e.forEach(a=>{if(typeof a=="string"){const o=a===""?t:He(t,a);o.classGroupId=r;return}if(typeof a=="function"){if(Er(a)){Ae(a(n),t,r,n);return}t.validators.push({validator:a,classGroupId:r});return}Object.entries(a).forEach(([o,i])=>{Ae(i,He(t,o),r,n)})})},He=(e,t)=>{let r=e;return t.split(ze).forEach(n=>{r.nextPart.has(n)||r.nextPart.set(n,{nextPart:new Map,validators:[]}),r=r.nextPart.get(n)}),r},Er=e=>e.isThemeGetter,Sr=(e,t)=>t?e.map(([r,n])=>{const a=n.map(o=>typeof o=="string"?t+o:typeof o=="object"?Object.fromEntries(Object.entries(o).map(([i,s])=>[t+i,s])):o);return[r,a]}):e,Ar=e=>{if(e<1)return{get:()=>{},set:()=>{}};let t=0,r=new Map,n=new Map;const a=(o,i)=>{r.set(o,i),t++,t>e&&(t=0,n=r,r=new Map)};return{get(o){let i=r.get(o);if(i!==void 0)return i;if((i=n.get(o))!==void 0)return a(o,i),i},set(o,i){r.has(o)?r.set(o,i):a(o,i)}}},dt="!",Pr=e=>{const{separator:t,experimentalParseClassName:r}=e,n=t.length===1,a=t[0],o=t.length,i=s=>{const h=[];let u=0,p=0,y;for(let f=0;f<s.length;f++){let m=s[f];if(u===0){if(m===a&&(n||s.slice(f,f+o)===t)){h.push(s.slice(p,f)),p=f+o;continue}if(m==="/"){y=f;continue}}m==="["?u++:m==="]"&&u--}const v=h.length===0?s:s.substring(p),g=v.startsWith(dt),x=g?v.substring(1):v,d=y&&y>p?y-p:void 0;return{modifiers:h,hasImportantModifier:g,baseClassName:x,maybePostfixModifierPosition:d}};return r?s=>r({className:s,parseClassName:i}):i},Rr=e=>{if(e.length<=1)return e;const t=[];let r=[];return e.forEach(n=>{n[0]==="["?(t.push(...r.sort(),n),r=[]):r.push(n)}),t.push(...r.sort()),t},Lr=e=>({cache:Ar(e.cacheSize),parseClassName:Pr(e),...wr(e)}),zr=/\s+/,Nr=(e,t)=>{const{parseClassName:r,getClassGroupId:n,getConflictingClassGroupIds:a}=t,o=[],i=e.trim().split(zr);let s="";for(let h=i.length-1;h>=0;h-=1){const u=i[h],{modifiers:p,hasImportantModifier:y,baseClassName:v,maybePostfixModifierPosition:g}=r(u);let x=!!g,d=n(x?v.substring(0,g):v);if(!d){if(!x){s=u+(s.length>0?" "+s:s);continue}if(d=n(v),!d){s=u+(s.length>0?" "+s:s);continue}x=!1}const f=Rr(p).join(":"),m=y?f+dt:f,w=m+d;if(o.includes(w))continue;o.push(w);const C=a(d,x);for(let M=0;M<C.length;++M){const S=C[M];o.push(m+S)}s=u+(s.length>0?" "+s:s)}return s};function Tr(){let e=0,t,r,n="";for(;e<arguments.length;)(t=arguments[e++])&&(r=ut(t))&&(n&&(n+=" "),n+=r);return n}const ut=e=>{if(typeof e=="string")return e;let t,r="";for(let n=0;n<e.length;n++)e[n]&&(t=ut(e[n]))&&(r&&(r+=" "),r+=t);return r};function Or(e,...t){let r,n,a,o=i;function i(h){const u=t.reduce((p,y)=>y(p),e());return r=Lr(u),n=r.cache.get,a=r.cache.set,o=s,s(h)}function s(h){const u=n(h);if(u)return u;const p=Nr(h,r);return a(h,p),p}return function(){return o(Tr.apply(null,arguments))}}const A=e=>{const t=r=>r[e]||[];return t.isThemeGetter=!0,t},ht=/^\[(?:([a-z-]+):)?(.+)\]$/i,Dr=/^\d+\/\d+$/,Ir=new Set(["px","full","screen"]),jr=/^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/,_r=/\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/,Fr=/^(rgba?|hsla?|hwb|(ok)?(lab|lch))\(.+\)$/,qr=/^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/,Wr=/^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/,D=e=>Z(e)||Ir.has(e)||Dr.test(e),j=e=>K(e,"length",Xr),Z=e=>!!e&&!Number.isNaN(Number(e)),ve=e=>K(e,"number",Z),Q=e=>!!e&&Number.isInteger(Number(e)),Vr=e=>e.endsWith("%")&&Z(e.slice(0,-1)),b=e=>ht.test(e),_=e=>jr.test(e),Hr=new Set(["length","size","percentage"]),Br=e=>K(e,Hr,pt),Ur=e=>K(e,"position",pt),Gr=new Set(["image","url"]),$r=e=>K(e,Gr,Yr),Zr=e=>K(e,"",Kr),J=()=>!0,K=(e,t,r)=>{const n=ht.exec(e);return n?n[1]?typeof t=="string"?n[1]===t:t.has(n[1]):r(n[2]):!1},Xr=e=>_r.test(e)&&!Fr.test(e),pt=()=>!1,Kr=e=>qr.test(e),Yr=e=>Wr.test(e),Qr=()=>{const e=A("colors"),t=A("spacing"),r=A("blur"),n=A("brightness"),a=A("borderColor"),o=A("borderRadius"),i=A("borderSpacing"),s=A("borderWidth"),h=A("contrast"),u=A("grayscale"),p=A("hueRotate"),y=A("invert"),v=A("gap"),g=A("gradientColorStops"),x=A("gradientColorStopPositions"),d=A("inset"),f=A("margin"),m=A("opacity"),w=A("padding"),C=A("saturate"),M=A("scale"),S=A("sepia"),R=A("skew"),E=A("space"),L=A("translate"),T=()=>["auto","contain","none"],W=()=>["auto","hidden","clip","visible","scroll"],fe=()=>["auto",b,t],P=()=>[b,t],Ie=()=>["",D,j],ee=()=>["auto",Z,b],je=()=>["bottom","center","left","left-bottom","left-top","right","right-bottom","right-top","top"],te=()=>["solid","dashed","dotted","double","none"],_e=()=>["normal","multiply","screen","overlay","darken","lighten","color-dodge","color-burn","hard-light","soft-light","difference","exclusion","hue","saturation","color","luminosity"],ye=()=>["start","end","center","between","around","evenly","stretch"],Y=()=>["","0",b],Fe=()=>["auto","avoid","all","avoid-page","page","left","right","column"],O=()=>[Z,b];return{cacheSize:500,separator:":",theme:{colors:[J],spacing:[D,j],blur:["none","",_,b],brightness:O(),borderColor:[e],borderRadius:["none","","full",_,b],borderSpacing:P(),borderWidth:Ie(),contrast:O(),grayscale:Y(),hueRotate:O(),invert:Y(),gap:P(),gradientColorStops:[e],gradientColorStopPositions:[Vr,j],inset:fe(),margin:fe(),opacity:O(),padding:P(),saturate:O(),scale:O(),sepia:Y(),skew:O(),space:P(),translate:P()},classGroups:{aspect:[{aspect:["auto","square","video",b]}],container:["container"],columns:[{columns:[_]}],"break-after":[{"break-after":Fe()}],"break-before":[{"break-before":Fe()}],"break-inside":[{"break-inside":["auto","avoid","avoid-page","avoid-column"]}],"box-decoration":[{"box-decoration":["slice","clone"]}],box:[{box:["border","content"]}],display:["block","inline-block","inline","flex","inline-flex","table","inline-table","table-caption","table-cell","table-column","table-column-group","table-footer-group","table-header-group","table-row-group","table-row","flow-root","grid","inline-grid","contents","list-item","hidden"],float:[{float:["right","left","none","start","end"]}],clear:[{clear:["left","right","both","none","start","end"]}],isolation:["isolate","isolation-auto"],"object-fit":[{object:["contain","cover","fill","none","scale-down"]}],"object-position":[{object:[...je(),b]}],overflow:[{overflow:W()}],"overflow-x":[{"overflow-x":W()}],"overflow-y":[{"overflow-y":W()}],overscroll:[{overscroll:T()}],"overscroll-x":[{"overscroll-x":T()}],"overscroll-y":[{"overscroll-y":T()}],position:["static","fixed","absolute","relative","sticky"],inset:[{inset:[d]}],"inset-x":[{"inset-x":[d]}],"inset-y":[{"inset-y":[d]}],start:[{start:[d]}],end:[{end:[d]}],top:[{top:[d]}],right:[{right:[d]}],bottom:[{bottom:[d]}],left:[{left:[d]}],visibility:["visible","invisible","collapse"],z:[{z:["auto",Q,b]}],basis:[{basis:fe()}],"flex-direction":[{flex:["row","row-reverse","col","col-reverse"]}],"flex-wrap":[{flex:["wrap","wrap-reverse","nowrap"]}],flex:[{flex:["1","auto","initial","none",b]}],grow:[{grow:Y()}],shrink:[{shrink:Y()}],order:[{order:["first","last","none",Q,b]}],"grid-cols":[{"grid-cols":[J]}],"col-start-end":[{col:["auto",{span:["full",Q,b]},b]}],"col-start":[{"col-start":ee()}],"col-end":[{"col-end":ee()}],"grid-rows":[{"grid-rows":[J]}],"row-start-end":[{row:["auto",{span:[Q,b]},b]}],"row-start":[{"row-start":ee()}],"row-end":[{"row-end":ee()}],"grid-flow":[{"grid-flow":["row","col","dense","row-dense","col-dense"]}],"auto-cols":[{"auto-cols":["auto","min","max","fr",b]}],"auto-rows":[{"auto-rows":["auto","min","max","fr",b]}],gap:[{gap:[v]}],"gap-x":[{"gap-x":[v]}],"gap-y":[{"gap-y":[v]}],"justify-content":[{justify:["normal",...ye()]}],"justify-items":[{"justify-items":["start","end","center","stretch"]}],"justify-self":[{"justify-self":["auto","start","end","center","stretch"]}],"align-content":[{content:["normal",...ye(),"baseline"]}],"align-items":[{items:["start","end","center","baseline","stretch"]}],"align-self":[{self:["auto","start","end","center","stretch","baseline"]}],"place-content":[{"place-content":[...ye(),"baseline"]}],"place-items":[{"place-items":["start","end","center","baseline","stretch"]}],"place-self":[{"place-self":["auto","start","end","center","stretch"]}],p:[{p:[w]}],px:[{px:[w]}],py:[{py:[w]}],ps:[{ps:[w]}],pe:[{pe:[w]}],pt:[{pt:[w]}],pr:[{pr:[w]}],pb:[{pb:[w]}],pl:[{pl:[w]}],m:[{m:[f]}],mx:[{mx:[f]}],my:[{my:[f]}],ms:[{ms:[f]}],me:[{me:[f]}],mt:[{mt:[f]}],mr:[{mr:[f]}],mb:[{mb:[f]}],ml:[{ml:[f]}],"space-x":[{"space-x":[E]}],"space-x-reverse":["space-x-reverse"],"space-y":[{"space-y":[E]}],"space-y-reverse":["space-y-reverse"],w:[{w:["auto","min","max","fit","svw","lvw","dvw",b,t]}],"min-w":[{"min-w":[b,t,"min","max","fit"]}],"max-w":[{"max-w":[b,t,"none","full","min","max","fit","prose",{screen:[_]},_]}],h:[{h:[b,t,"auto","min","max","fit","svh","lvh","dvh"]}],"min-h":[{"min-h":[b,t,"min","max","fit","svh","lvh","dvh"]}],"max-h":[{"max-h":[b,t,"min","max","fit","svh","lvh","dvh"]}],size:[{size:[b,t,"auto","min","max","fit"]}],"font-size":[{text:["base",_,j]}],"font-smoothing":["antialiased","subpixel-antialiased"],"font-style":["italic","not-italic"],"font-weight":[{font:["thin","extralight","light","normal","medium","semibold","bold","extrabold","black",ve]}],"font-family":[{font:[J]}],"fvn-normal":["normal-nums"],"fvn-ordinal":["ordinal"],"fvn-slashed-zero":["slashed-zero"],"fvn-figure":["lining-nums","oldstyle-nums"],"fvn-spacing":["proportional-nums","tabular-nums"],"fvn-fraction":["diagonal-fractions","stacked-fractons"],tracking:[{tracking:["tighter","tight","normal","wide","wider","widest",b]}],"line-clamp":[{"line-clamp":["none",Z,ve]}],leading:[{leading:["none","tight","snug","normal","relaxed","loose",D,b]}],"list-image":[{"list-image":["none",b]}],"list-style-type":[{list:["none","disc","decimal",b]}],"list-style-position":[{list:["inside","outside"]}],"placeholder-color":[{placeholder:[e]}],"placeholder-opacity":[{"placeholder-opacity":[m]}],"text-alignment":[{text:["left","center","right","justify","start","end"]}],"text-color":[{text:[e]}],"text-opacity":[{"text-opacity":[m]}],"text-decoration":["underline","overline","line-through","no-underline"],"text-decoration-style":[{decoration:[...te(),"wavy"]}],"text-decoration-thickness":[{decoration:["auto","from-font",D,j]}],"underline-offset":[{"underline-offset":["auto",D,b]}],"text-decoration-color":[{decoration:[e]}],"text-transform":["uppercase","lowercase","capitalize","normal-case"],"text-overflow":["truncate","text-ellipsis","text-clip"],"text-wrap":[{text:["wrap","nowrap","balance","pretty"]}],indent:[{indent:P()}],"vertical-align":[{align:["baseline","top","middle","bottom","text-top","text-bottom","sub","super",b]}],whitespace:[{whitespace:["normal","nowrap","pre","pre-line","pre-wrap","break-spaces"]}],break:[{break:["normal","words","all","keep"]}],hyphens:[{hyphens:["none","manual","auto"]}],content:[{content:["none",b]}],"bg-attachment":[{bg:["fixed","local","scroll"]}],"bg-clip":[{"bg-clip":["border","padding","content","text"]}],"bg-opacity":[{"bg-opacity":[m]}],"bg-origin":[{"bg-origin":["border","padding","content"]}],"bg-position":[{bg:[...je(),Ur]}],"bg-repeat":[{bg:["no-repeat",{repeat:["","x","y","round","space"]}]}],"bg-size":[{bg:["auto","cover","contain",Br]}],"bg-image":[{bg:["none",{"gradient-to":["t","tr","r","br","b","bl","l","tl"]},$r]}],"bg-color":[{bg:[e]}],"gradient-from-pos":[{from:[x]}],"gradient-via-pos":[{via:[x]}],"gradient-to-pos":[{to:[x]}],"gradient-from":[{from:[g]}],"gradient-via":[{via:[g]}],"gradient-to":[{to:[g]}],rounded:[{rounded:[o]}],"rounded-s":[{"rounded-s":[o]}],"rounded-e":[{"rounded-e":[o]}],"rounded-t":[{"rounded-t":[o]}],"rounded-r":[{"rounded-r":[o]}],"rounded-b":[{"rounded-b":[o]}],"rounded-l":[{"rounded-l":[o]}],"rounded-ss":[{"rounded-ss":[o]}],"rounded-se":[{"rounded-se":[o]}],"rounded-ee":[{"rounded-ee":[o]}],"rounded-es":[{"rounded-es":[o]}],"rounded-tl":[{"rounded-tl":[o]}],"rounded-tr":[{"rounded-tr":[o]}],"rounded-br":[{"rounded-br":[o]}],"rounded-bl":[{"rounded-bl":[o]}],"border-w":[{border:[s]}],"border-w-x":[{"border-x":[s]}],"border-w-y":[{"border-y":[s]}],"border-w-s":[{"border-s":[s]}],"border-w-e":[{"border-e":[s]}],"border-w-t":[{"border-t":[s]}],"border-w-r":[{"border-r":[s]}],"border-w-b":[{"border-b":[s]}],"border-w-l":[{"border-l":[s]}],"border-opacity":[{"border-opacity":[m]}],"border-style":[{border:[...te(),"hidden"]}],"divide-x":[{"divide-x":[s]}],"divide-x-reverse":["divide-x-reverse"],"divide-y":[{"divide-y":[s]}],"divide-y-reverse":["divide-y-reverse"],"divide-opacity":[{"divide-opacity":[m]}],"divide-style":[{divide:te()}],"border-color":[{border:[a]}],"border-color-x":[{"border-x":[a]}],"border-color-y":[{"border-y":[a]}],"border-color-s":[{"border-s":[a]}],"border-color-e":[{"border-e":[a]}],"border-color-t":[{"border-t":[a]}],"border-color-r":[{"border-r":[a]}],"border-color-b":[{"border-b":[a]}],"border-color-l":[{"border-l":[a]}],"divide-color":[{divide:[a]}],"outline-style":[{outline:["",...te()]}],"outline-offset":[{"outline-offset":[D,b]}],"outline-w":[{outline:[D,j]}],"outline-color":[{outline:[e]}],"ring-w":[{ring:Ie()}],"ring-w-inset":["ring-inset"],"ring-color":[{ring:[e]}],"ring-opacity":[{"ring-opacity":[m]}],"ring-offset-w":[{"ring-offset":[D,j]}],"ring-offset-color":[{"ring-offset":[e]}],shadow:[{shadow:["","inner","none",_,Zr]}],"shadow-color":[{shadow:[J]}],opacity:[{opacity:[m]}],"mix-blend":[{"mix-blend":[..._e(),"plus-lighter","plus-darker"]}],"bg-blend":[{"bg-blend":_e()}],filter:[{filter:["","none"]}],blur:[{blur:[r]}],brightness:[{brightness:[n]}],contrast:[{contrast:[h]}],"drop-shadow":[{"drop-shadow":["","none",_,b]}],grayscale:[{grayscale:[u]}],"hue-rotate":[{"hue-rotate":[p]}],invert:[{invert:[y]}],saturate:[{saturate:[C]}],sepia:[{sepia:[S]}],"backdrop-filter":[{"backdrop-filter":["","none"]}],"backdrop-blur":[{"backdrop-blur":[r]}],"backdrop-brightness":[{"backdrop-brightness":[n]}],"backdrop-contrast":[{"backdrop-contrast":[h]}],"backdrop-grayscale":[{"backdrop-grayscale":[u]}],"backdrop-hue-rotate":[{"backdrop-hue-rotate":[p]}],"backdrop-invert":[{"backdrop-invert":[y]}],"backdrop-opacity":[{"backdrop-opacity":[m]}],"backdrop-saturate":[{"backdrop-saturate":[C]}],"backdrop-sepia":[{"backdrop-sepia":[S]}],"border-collapse":[{border:["collapse","separate"]}],"border-spacing":[{"border-spacing":[i]}],"border-spacing-x":[{"border-spacing-x":[i]}],"border-spacing-y":[{"border-spacing-y":[i]}],"table-layout":[{table:["auto","fixed"]}],caption:[{caption:["top","bottom"]}],transition:[{transition:["none","all","","colors","opacity","shadow","transform",b]}],duration:[{duration:O()}],ease:[{ease:["linear","in","out","in-out",b]}],delay:[{delay:O()}],animate:[{animate:["none","spin","ping","pulse","bounce",b]}],transform:[{transform:["","gpu","none"]}],scale:[{scale:[M]}],"scale-x":[{"scale-x":[M]}],"scale-y":[{"scale-y":[M]}],rotate:[{rotate:[Q,b]}],"translate-x":[{"translate-x":[L]}],"translate-y":[{"translate-y":[L]}],"skew-x":[{"skew-x":[R]}],"skew-y":[{"skew-y":[R]}],"transform-origin":[{origin:["center","top","top-right","right","bottom-right","bottom","bottom-left","left","top-left",b]}],accent:[{accent:["auto",e]}],appearance:[{appearance:["none","auto"]}],cursor:[{cursor:["auto","default","pointer","wait","text","move","help","not-allowed","none","context-menu","progress","cell","crosshair","vertical-text","alias","copy","no-drop","grab","grabbing","all-scroll","col-resize","row-resize","n-resize","e-resize","s-resize","w-resize","ne-resize","nw-resize","se-resize","sw-resize","ew-resize","ns-resize","nesw-resize","nwse-resize","zoom-in","zoom-out",b]}],"caret-color":[{caret:[e]}],"pointer-events":[{"pointer-events":["none","auto"]}],resize:[{resize:["none","y","x",""]}],"scroll-behavior":[{scroll:["auto","smooth"]}],"scroll-m":[{"scroll-m":P()}],"scroll-mx":[{"scroll-mx":P()}],"scroll-my":[{"scroll-my":P()}],"scroll-ms":[{"scroll-ms":P()}],"scroll-me":[{"scroll-me":P()}],"scroll-mt":[{"scroll-mt":P()}],"scroll-mr":[{"scroll-mr":P()}],"scroll-mb":[{"scroll-mb":P()}],"scroll-ml":[{"scroll-ml":P()}],"scroll-p":[{"scroll-p":P()}],"scroll-px":[{"scroll-px":P()}],"scroll-py":[{"scroll-py":P()}],"scroll-ps":[{"scroll-ps":P()}],"scroll-pe":[{"scroll-pe":P()}],"scroll-pt":[{"scroll-pt":P()}],"scroll-pr":[{"scroll-pr":P()}],"scroll-pb":[{"scroll-pb":P()}],"scroll-pl":[{"scroll-pl":P()}],"snap-align":[{snap:["start","end","center","align-none"]}],"snap-stop":[{snap:["normal","always"]}],"snap-type":[{snap:["none","x","y","both"]}],"snap-strictness":[{snap:["mandatory","proximity"]}],touch:[{touch:["auto","none","manipulation"]}],"touch-x":[{"touch-pan":["x","left","right"]}],"touch-y":[{"touch-pan":["y","up","down"]}],"touch-pz":["touch-pinch-zoom"],select:[{select:["none","text","all","auto"]}],"will-change":[{"will-change":["auto","scroll","contents","transform",b]}],fill:[{fill:[e,"none"]}],"stroke-w":[{stroke:[D,j,ve]}],stroke:[{stroke:[e,"none"]}],sr:["sr-only","not-sr-only"],"forced-color-adjust":[{"forced-color-adjust":["auto","none"]}]},conflictingClassGroups:{overflow:["overflow-x","overflow-y"],overscroll:["overscroll-x","overscroll-y"],inset:["inset-x","inset-y","start","end","top","right","bottom","left"],"inset-x":["right","left"],"inset-y":["top","bottom"],flex:["basis","grow","shrink"],gap:["gap-x","gap-y"],p:["px","py","ps","pe","pt","pr","pb","pl"],px:["pr","pl"],py:["pt","pb"],m:["mx","my","ms","me","mt","mr","mb","ml"],mx:["mr","ml"],my:["mt","mb"],size:["w","h"],"font-size":["leading"],"fvn-normal":["fvn-ordinal","fvn-slashed-zero","fvn-figure","fvn-spacing","fvn-fraction"],"fvn-ordinal":["fvn-normal"],"fvn-slashed-zero":["fvn-normal"],"fvn-figure":["fvn-normal"],"fvn-spacing":["fvn-normal"],"fvn-fraction":["fvn-normal"],"line-clamp":["display","overflow"],rounded:["rounded-s","rounded-e","rounded-t","rounded-r","rounded-b","rounded-l","rounded-ss","rounded-se","rounded-ee","rounded-es","rounded-tl","rounded-tr","rounded-br","rounded-bl"],"rounded-s":["rounded-ss","rounded-es"],"rounded-e":["rounded-se","rounded-ee"],"rounded-t":["rounded-tl","rounded-tr"],"rounded-r":["rounded-tr","rounded-br"],"rounded-b":["rounded-br","rounded-bl"],"rounded-l":["rounded-tl","rounded-bl"],"border-spacing":["border-spacing-x","border-spacing-y"],"border-w":["border-w-s","border-w-e","border-w-t","border-w-r","border-w-b","border-w-l"],"border-w-x":["border-w-r","border-w-l"],"border-w-y":["border-w-t","border-w-b"],"border-color":["border-color-s","border-color-e","border-color-t","border-color-r","border-color-b","border-color-l"],"border-color-x":["border-color-r","border-color-l"],"border-color-y":["border-color-t","border-color-b"],"scroll-m":["scroll-mx","scroll-my","scroll-ms","scroll-me","scroll-mt","scroll-mr","scroll-mb","scroll-ml"],"scroll-mx":["scroll-mr","scroll-ml"],"scroll-my":["scroll-mt","scroll-mb"],"scroll-p":["scroll-px","scroll-py","scroll-ps","scroll-pe","scroll-pt","scroll-pr","scroll-pb","scroll-pl"],"scroll-px":["scroll-pr","scroll-pl"],"scroll-py":["scroll-pt","scroll-pb"],touch:["touch-x","touch-y","touch-pz"],"touch-x":["touch"],"touch-y":["touch"],"touch-pz":["touch"]},conflictingClassGroupModifiers:{"font-size":["leading"]}}},As=Or(Qr);var Jr=Ht.useId||(()=>{}),en=0;function me(e){const[t,r]=c.useState(Jr());return le(()=>{r(n=>n??String(en++))},[e]),t?`radix-${t}`:""}var ge="focusScope.autoFocusOnMount",be="focusScope.autoFocusOnUnmount",Be={bubbles:!1,cancelable:!0},tn="FocusScope",ft=c.forwardRef((e,t)=>{const{loop:r=!1,trapped:n=!1,onMountAutoFocus:a,onUnmountAutoFocus:o,...i}=e,[s,h]=c.useState(null),u=V(a),p=V(o),y=c.useRef(null),v=B(t,d=>h(d)),g=c.useRef({paused:!1,pause(){this.paused=!0},resume(){this.paused=!1}}).current;c.useEffect(()=>{if(n){let d=function(C){if(g.paused||!s)return;const M=C.target;s.contains(M)?y.current=M:F(y.current,{select:!0})},f=function(C){if(g.paused||!s)return;const M=C.relatedTarget;M!==null&&(s.contains(M)||F(y.current,{select:!0}))},m=function(C){if(document.activeElement===document.body)for(const S of C)S.removedNodes.length>0&&F(s)};document.addEventListener("focusin",d),document.addEventListener("focusout",f);const w=new MutationObserver(m);return s&&w.observe(s,{childList:!0,subtree:!0}),()=>{document.removeEventListener("focusin",d),document.removeEventListener("focusout",f),w.disconnect()}}},[n,s,g.paused]),c.useEffect(()=>{if(s){Ge.add(g);const d=document.activeElement;if(!s.contains(d)){const m=new CustomEvent(ge,Be);s.addEventListener(ge,u),s.dispatchEvent(m),m.defaultPrevented||(rn(cn(yt(s)),{select:!0}),document.activeElement===d&&F(s))}return()=>{s.removeEventListener(ge,u),setTimeout(()=>{const m=new CustomEvent(be,Be);s.addEventListener(be,p),s.dispatchEvent(m),m.defaultPrevented||F(d??document.body,{select:!0}),s.removeEventListener(be,p),Ge.remove(g)},0)}}},[s,u,p,g]);const x=c.useCallback(d=>{if(!r&&!n||g.paused)return;const f=d.key==="Tab"&&!d.altKey&&!d.ctrlKey&&!d.metaKey,m=document.activeElement;if(f&&m){const w=d.currentTarget,[C,M]=nn(w);C&&M?!d.shiftKey&&m===M?(d.preventDefault(),r&&F(C,{select:!0})):d.shiftKey&&m===C&&(d.preventDefault(),r&&F(M,{select:!0})):m===w&&d.preventDefault()}},[r,n,g.paused]);return k.jsx(I.div,{tabIndex:-1,...i,ref:v,onKeyDown:x})});ft.displayName=tn;function rn(e,{select:t=!1}={}){const r=document.activeElement;for(const n of e)if(F(n,{select:t}),document.activeElement!==r)return}function nn(e){const t=yt(e),r=Ue(t,e),n=Ue(t.reverse(),e);return[r,n]}function yt(e){const t=[],r=document.createTreeWalker(e,NodeFilter.SHOW_ELEMENT,{acceptNode:n=>{const a=n.tagName==="INPUT"&&n.type==="hidden";return n.disabled||n.hidden||a?NodeFilter.FILTER_SKIP:n.tabIndex>=0?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP}});for(;r.nextNode();)t.push(r.currentNode);return t}function Ue(e,t){for(const r of e)if(!an(r,{upTo:t}))return r}function an(e,{upTo:t}){if(getComputedStyle(e).visibility==="hidden")return!0;for(;e;){if(t!==void 0&&e===t)return!1;if(getComputedStyle(e).display==="none")return!0;e=e.parentElement}return!1}function on(e){return e instanceof HTMLInputElement&&"select"in e}function F(e,{select:t=!1}={}){if(e&&e.focus){const r=document.activeElement;e.focus({preventScroll:!0}),e!==r&&on(e)&&t&&e.select()}}var Ge=sn();function sn(){let e=[];return{add(t){const r=e[0];t!==r&&(r==null||r.pause()),e=$e(e,t),e.unshift(t)},remove(t){var r;e=$e(e,t),(r=e[0])==null||r.resume()}}}function $e(e,t){const r=[...e],n=r.indexOf(t);return n!==-1&&r.splice(n,1),r}function cn(e){return e.filter(t=>t.tagName!=="A")}var ke=0;function ln(){c.useEffect(()=>{const e=document.querySelectorAll("[data-radix-focus-guard]");return document.body.insertAdjacentElement("afterbegin",e[0]??Ze()),document.body.insertAdjacentElement("beforeend",e[1]??Ze()),ke++,()=>{ke===1&&document.querySelectorAll("[data-radix-focus-guard]").forEach(t=>t.remove()),ke--}},[])}function Ze(){const e=document.createElement("span");return e.setAttribute("data-radix-focus-guard",""),e.tabIndex=0,e.style.outline="none",e.style.opacity="0",e.style.position="fixed",e.style.pointerEvents="none",e}var N=function(){return N=Object.assign||function(t){for(var r,n=1,a=arguments.length;n<a;n++){r=arguments[n];for(var o in r)Object.prototype.hasOwnProperty.call(r,o)&&(t[o]=r[o])}return t},N.apply(this,arguments)};function vt(e,t){var r={};for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(e!=null&&typeof Object.getOwnPropertySymbols=="function")for(var a=0,n=Object.getOwnPropertySymbols(e);a<n.length;a++)t.indexOf(n[a])<0&&Object.prototype.propertyIsEnumerable.call(e,n[a])&&(r[n[a]]=e[n[a]]);return r}function dn(e,t,r){if(r||arguments.length===2)for(var n=0,a=t.length,o;n<a;n++)(o||!(n in t))&&(o||(o=Array.prototype.slice.call(t,0,n)),o[n]=t[n]);return e.concat(o||Array.prototype.slice.call(t))}var ie="right-scroll-bar-position",ce="width-before-scroll-bar",un="with-scroll-bars-hidden",hn="--removed-body-scroll-bar-size";function xe(e,t){return typeof e=="function"?e(t):e&&(e.current=t),e}function pn(e,t){var r=c.useState(function(){return{value:e,callback:t,facade:{get current(){return r.value},set current(n){var a=r.value;a!==n&&(r.value=n,r.callback(n,a))}}}})[0];return r.callback=t,r.facade}var fn=typeof window<"u"?c.useLayoutEffect:c.useEffect,Xe=new WeakMap;function yn(e,t){var r=pn(null,function(n){return e.forEach(function(a){return xe(a,n)})});return fn(function(){var n=Xe.get(r);if(n){var a=new Set(n),o=new Set(e),i=r.current;a.forEach(function(s){o.has(s)||xe(s,null)}),o.forEach(function(s){a.has(s)||xe(s,i)})}Xe.set(r,e)},[e]),r}function vn(e){return e}function mn(e,t){t===void 0&&(t=vn);var r=[],n=!1,a={read:function(){if(n)throw new Error("Sidecar: could not `read` from an `assigned` medium. `read` could be used only with `useMedium`.");return r.length?r[r.length-1]:e},useMedium:function(o){var i=t(o,n);return r.push(i),function(){r=r.filter(function(s){return s!==i})}},assignSyncMedium:function(o){for(n=!0;r.length;){var i=r;r=[],i.forEach(o)}r={push:function(s){return o(s)},filter:function(){return r}}},assignMedium:function(o){n=!0;var i=[];if(r.length){var s=r;r=[],s.forEach(o),i=r}var h=function(){var p=i;i=[],p.forEach(o)},u=function(){return Promise.resolve().then(h)};u(),r={push:function(p){i.push(p),u()},filter:function(p){return i=i.filter(p),r}}}};return a}function gn(e){e===void 0&&(e={});var t=mn(null);return t.options=N({async:!0,ssr:!1},e),t}var mt=function(e){var t=e.sideCar,r=vt(e,["sideCar"]);if(!t)throw new Error("Sidecar: please provide `sideCar` property to import the right car");var n=t.read();if(!n)throw new Error("Sidecar medium not found");return c.createElement(n,N({},r))};mt.isSideCarExport=!0;function bn(e,t){return e.useMedium(t),mt}var gt=gn(),we=function(){},pe=c.forwardRef(function(e,t){var r=c.useRef(null),n=c.useState({onScrollCapture:we,onWheelCapture:we,onTouchMoveCapture:we}),a=n[0],o=n[1],i=e.forwardProps,s=e.children,h=e.className,u=e.removeScrollBar,p=e.enabled,y=e.shards,v=e.sideCar,g=e.noIsolation,x=e.inert,d=e.allowPinchZoom,f=e.as,m=f===void 0?"div":f,w=e.gapMode,C=vt(e,["forwardProps","children","className","removeScrollBar","enabled","shards","sideCar","noIsolation","inert","allowPinchZoom","as","gapMode"]),M=v,S=yn([r,t]),R=N(N({},C),a);return c.createElement(c.Fragment,null,p&&c.createElement(M,{sideCar:gt,removeScrollBar:u,shards:y,noIsolation:g,inert:x,setCallbacks:o,allowPinchZoom:!!d,lockRef:r,gapMode:w}),i?c.cloneElement(c.Children.only(s),N(N({},R),{ref:S})):c.createElement(m,N({},R,{className:h,ref:S}),s))});pe.defaultProps={enabled:!0,removeScrollBar:!0,inert:!1};pe.classNames={fullWidth:ce,zeroRight:ie};var kn=function(){if(typeof __webpack_nonce__<"u")return __webpack_nonce__};function xn(){if(!document)return null;var e=document.createElement("style");e.type="text/css";var t=kn();return t&&e.setAttribute("nonce",t),e}function wn(e,t){e.styleSheet?e.styleSheet.cssText=t:e.appendChild(document.createTextNode(t))}function Mn(e){var t=document.head||document.getElementsByTagName("head")[0];t.appendChild(e)}var Cn=function(){var e=0,t=null;return{add:function(r){e==0&&(t=xn())&&(wn(t,r),Mn(t)),e++},remove:function(){e--,!e&&t&&(t.parentNode&&t.parentNode.removeChild(t),t=null)}}},En=function(){var e=Cn();return function(t,r){c.useEffect(function(){return e.add(t),function(){e.remove()}},[t&&r])}},bt=function(){var e=En(),t=function(r){var n=r.styles,a=r.dynamic;return e(n,a),null};return t},Sn={left:0,top:0,right:0,gap:0},Me=function(e){return parseInt(e||"",10)||0},An=function(e){var t=window.getComputedStyle(document.body),r=t[e==="padding"?"paddingLeft":"marginLeft"],n=t[e==="padding"?"paddingTop":"marginTop"],a=t[e==="padding"?"paddingRight":"marginRight"];return[Me(r),Me(n),Me(a)]},Pn=function(e){if(e===void 0&&(e="margin"),typeof window>"u")return Sn;var t=An(e),r=document.documentElement.clientWidth,n=window.innerWidth;return{left:t[0],top:t[1],right:t[2],gap:Math.max(0,n-r+t[2]-t[0])}},Rn=bt(),X="data-scroll-locked",Ln=function(e,t,r,n){var a=e.left,o=e.top,i=e.right,s=e.gap;return r===void 0&&(r="margin"),`
  .`.concat(un,` {
   overflow: hidden `).concat(n,`;
   padding-right: `).concat(s,"px ").concat(n,`;
  }
  body[`).concat(X,`] {
    overflow: hidden `).concat(n,`;
    overscroll-behavior: contain;
    `).concat([t&&"position: relative ".concat(n,";"),r==="margin"&&`
    padding-left: `.concat(a,`px;
    padding-top: `).concat(o,`px;
    padding-right: `).concat(i,`px;
    margin-left:0;
    margin-top:0;
    margin-right: `).concat(s,"px ").concat(n,`;
    `),r==="padding"&&"padding-right: ".concat(s,"px ").concat(n,";")].filter(Boolean).join(""),`
  }
  
  .`).concat(ie,` {
    right: `).concat(s,"px ").concat(n,`;
  }
  
  .`).concat(ce,` {
    margin-right: `).concat(s,"px ").concat(n,`;
  }
  
  .`).concat(ie," .").concat(ie,` {
    right: 0 `).concat(n,`;
  }
  
  .`).concat(ce," .").concat(ce,` {
    margin-right: 0 `).concat(n,`;
  }
  
  body[`).concat(X,`] {
    `).concat(hn,": ").concat(s,`px;
  }
`)},Ke=function(){var e=parseInt(document.body.getAttribute(X)||"0",10);return isFinite(e)?e:0},zn=function(){c.useEffect(function(){return document.body.setAttribute(X,(Ke()+1).toString()),function(){var e=Ke()-1;e<=0?document.body.removeAttribute(X):document.body.setAttribute(X,e.toString())}},[])},Nn=function(e){var t=e.noRelative,r=e.noImportant,n=e.gapMode,a=n===void 0?"margin":n;zn();var o=c.useMemo(function(){return Pn(a)},[a]);return c.createElement(Rn,{styles:Ln(o,!t,a,r?"":"!important")})},Pe=!1;if(typeof window<"u")try{var ne=Object.defineProperty({},"passive",{get:function(){return Pe=!0,!0}});window.addEventListener("test",ne,ne),window.removeEventListener("test",ne,ne)}catch{Pe=!1}var U=Pe?{passive:!1}:!1,Tn=function(e){return e.tagName==="TEXTAREA"},kt=function(e,t){if(!(e instanceof Element))return!1;var r=window.getComputedStyle(e);return r[t]!=="hidden"&&!(r.overflowY===r.overflowX&&!Tn(e)&&r[t]==="visible")},On=function(e){return kt(e,"overflowY")},Dn=function(e){return kt(e,"overflowX")},Ye=function(e,t){var r=t.ownerDocument,n=t;do{typeof ShadowRoot<"u"&&n instanceof ShadowRoot&&(n=n.host);var a=xt(e,n);if(a){var o=wt(e,n),i=o[1],s=o[2];if(i>s)return!0}n=n.parentNode}while(n&&n!==r.body);return!1},In=function(e){var t=e.scrollTop,r=e.scrollHeight,n=e.clientHeight;return[t,r,n]},jn=function(e){var t=e.scrollLeft,r=e.scrollWidth,n=e.clientWidth;return[t,r,n]},xt=function(e,t){return e==="v"?On(t):Dn(t)},wt=function(e,t){return e==="v"?In(t):jn(t)},_n=function(e,t){return e==="h"&&t==="rtl"?-1:1},Fn=function(e,t,r,n,a){var o=_n(e,window.getComputedStyle(t).direction),i=o*n,s=r.target,h=t.contains(s),u=!1,p=i>0,y=0,v=0;do{var g=wt(e,s),x=g[0],d=g[1],f=g[2],m=d-f-o*x;(x||m)&&xt(e,s)&&(y+=m,v+=x),s instanceof ShadowRoot?s=s.host:s=s.parentNode}while(!h&&s!==document.body||h&&(t.contains(s)||t===s));return(p&&(Math.abs(y)<1||!a)||!p&&(Math.abs(v)<1||!a))&&(u=!0),u},ae=function(e){return"changedTouches"in e?[e.changedTouches[0].clientX,e.changedTouches[0].clientY]:[0,0]},Qe=function(e){return[e.deltaX,e.deltaY]},Je=function(e){return e&&"current"in e?e.current:e},qn=function(e,t){return e[0]===t[0]&&e[1]===t[1]},Wn=function(e){return`
  .block-interactivity-`.concat(e,` {pointer-events: none;}
  .allow-interactivity-`).concat(e,` {pointer-events: all;}
`)},Vn=0,G=[];function Hn(e){var t=c.useRef([]),r=c.useRef([0,0]),n=c.useRef(),a=c.useState(Vn++)[0],o=c.useState(bt)[0],i=c.useRef(e);c.useEffect(function(){i.current=e},[e]),c.useEffect(function(){if(e.inert){document.body.classList.add("block-interactivity-".concat(a));var d=dn([e.lockRef.current],(e.shards||[]).map(Je),!0).filter(Boolean);return d.forEach(function(f){return f.classList.add("allow-interactivity-".concat(a))}),function(){document.body.classList.remove("block-interactivity-".concat(a)),d.forEach(function(f){return f.classList.remove("allow-interactivity-".concat(a))})}}},[e.inert,e.lockRef.current,e.shards]);var s=c.useCallback(function(d,f){if("touches"in d&&d.touches.length===2||d.type==="wheel"&&d.ctrlKey)return!i.current.allowPinchZoom;var m=ae(d),w=r.current,C="deltaX"in d?d.deltaX:w[0]-m[0],M="deltaY"in d?d.deltaY:w[1]-m[1],S,R=d.target,E=Math.abs(C)>Math.abs(M)?"h":"v";if("touches"in d&&E==="h"&&R.type==="range")return!1;var L=Ye(E,R);if(!L)return!0;if(L?S=E:(S=E==="v"?"h":"v",L=Ye(E,R)),!L)return!1;if(!n.current&&"changedTouches"in d&&(C||M)&&(n.current=S),!S)return!0;var T=n.current||S;return Fn(T,f,d,T==="h"?C:M,!0)},[]),h=c.useCallback(function(d){var f=d;if(!(!G.length||G[G.length-1]!==o)){var m="deltaY"in f?Qe(f):ae(f),w=t.current.filter(function(S){return S.name===f.type&&(S.target===f.target||f.target===S.shadowParent)&&qn(S.delta,m)})[0];if(w&&w.should){f.cancelable&&f.preventDefault();return}if(!w){var C=(i.current.shards||[]).map(Je).filter(Boolean).filter(function(S){return S.contains(f.target)}),M=C.length>0?s(f,C[0]):!i.current.noIsolation;M&&f.cancelable&&f.preventDefault()}}},[]),u=c.useCallback(function(d,f,m,w){var C={name:d,delta:f,target:m,should:w,shadowParent:Bn(m)};t.current.push(C),setTimeout(function(){t.current=t.current.filter(function(M){return M!==C})},1)},[]),p=c.useCallback(function(d){r.current=ae(d),n.current=void 0},[]),y=c.useCallback(function(d){u(d.type,Qe(d),d.target,s(d,e.lockRef.current))},[]),v=c.useCallback(function(d){u(d.type,ae(d),d.target,s(d,e.lockRef.current))},[]);c.useEffect(function(){return G.push(o),e.setCallbacks({onScrollCapture:y,onWheelCapture:y,onTouchMoveCapture:v}),document.addEventListener("wheel",h,U),document.addEventListener("touchmove",h,U),document.addEventListener("touchstart",p,U),function(){G=G.filter(function(d){return d!==o}),document.removeEventListener("wheel",h,U),document.removeEventListener("touchmove",h,U),document.removeEventListener("touchstart",p,U)}},[]);var g=e.removeScrollBar,x=e.inert;return c.createElement(c.Fragment,null,x?c.createElement(o,{styles:Wn(a)}):null,g?c.createElement(Nn,{gapMode:e.gapMode}):null)}function Bn(e){for(var t=null;e!==null;)e instanceof ShadowRoot&&(t=e.host,e=e.host),e=e.parentNode;return t}const Un=bn(gt,Hn);var Mt=c.forwardRef(function(e,t){return c.createElement(pe,N({},e,{ref:t,sideCar:Un}))});Mt.classNames=pe.classNames;var Gn=function(e){if(typeof document>"u")return null;var t=Array.isArray(e)?e[0]:e;return t.ownerDocument.body},$=new WeakMap,oe=new WeakMap,se={},Ce=0,Ct=function(e){return e&&(e.host||Ct(e.parentNode))},$n=function(e,t){return t.map(function(r){if(e.contains(r))return r;var n=Ct(r);return n&&e.contains(n)?n:(console.error("aria-hidden",r,"in not contained inside",e,". Doing nothing"),null)}).filter(function(r){return!!r})},Zn=function(e,t,r,n){var a=$n(t,Array.isArray(e)?e:[e]);se[r]||(se[r]=new WeakMap);var o=se[r],i=[],s=new Set,h=new Set(a),u=function(y){!y||s.has(y)||(s.add(y),u(y.parentNode))};a.forEach(u);var p=function(y){!y||h.has(y)||Array.prototype.forEach.call(y.children,function(v){if(s.has(v))p(v);else try{var g=v.getAttribute(n),x=g!==null&&g!=="false",d=($.get(v)||0)+1,f=(o.get(v)||0)+1;$.set(v,d),o.set(v,f),i.push(v),d===1&&x&&oe.set(v,!0),f===1&&v.setAttribute(r,"true"),x||v.setAttribute(n,"true")}catch(m){console.error("aria-hidden: cannot operate on ",v,m)}})};return p(t),s.clear(),Ce++,function(){i.forEach(function(y){var v=$.get(y)-1,g=o.get(y)-1;$.set(y,v),o.set(y,g),v||(oe.has(y)||y.removeAttribute(n),oe.delete(y)),g||y.removeAttribute(r)}),Ce--,Ce||($=new WeakMap,$=new WeakMap,oe=new WeakMap,se={})}},Xn=function(e,t,r){r===void 0&&(r="data-aria-hidden");var n=Array.from(Array.isArray(e)?e:[e]),a=Gn(e);return a?(n.push.apply(n,Array.from(a.querySelectorAll("[aria-live]"))),Zn(n,a,r,"aria-hidden")):function(){return null}},Ne="Dialog",[Et,Ps]=rr(Ne),[Kn,z]=Et(Ne),St=e=>{const{__scopeDialog:t,children:r,open:n,defaultOpen:a,onOpenChange:o,modal:i=!0}=e,s=c.useRef(null),h=c.useRef(null),[u=!1,p]=mr({prop:n,defaultProp:a,onChange:o});return k.jsx(Kn,{scope:t,triggerRef:s,contentRef:h,contentId:me(),titleId:me(),descriptionId:me(),open:u,onOpenChange:p,onOpenToggle:c.useCallback(()=>p(y=>!y),[p]),modal:i,children:r})};St.displayName=Ne;var At="DialogTrigger",Pt=c.forwardRef((e,t)=>{const{__scopeDialog:r,...n}=e,a=z(At,r),o=B(t,a.triggerRef);return k.jsx(I.button,{type:"button","aria-haspopup":"dialog","aria-expanded":a.open,"aria-controls":a.contentId,"data-state":De(a.open),...n,ref:o,onClick:q(e.onClick,a.onOpenToggle)})});Pt.displayName=At;var Te="DialogPortal",[Yn,Rt]=Et(Te,{forceMount:void 0}),Lt=e=>{const{__scopeDialog:t,forceMount:r,children:n,container:a}=e,o=z(Te,t);return k.jsx(Yn,{scope:t,forceMount:r,children:c.Children.map(n,i=>k.jsx(he,{present:r||o.open,children:k.jsx(st,{asChild:!0,container:a,children:i})}))})};Lt.displayName=Te;var de="DialogOverlay",zt=c.forwardRef((e,t)=>{const r=Rt(de,e.__scopeDialog),{forceMount:n=r.forceMount,...a}=e,o=z(de,e.__scopeDialog);return o.modal?k.jsx(he,{present:n||o.open,children:k.jsx(Qn,{...a,ref:t})}):null});zt.displayName=de;var Qn=c.forwardRef((e,t)=>{const{__scopeDialog:r,...n}=e,a=z(de,r);return k.jsx(Mt,{as:Re,allowPinchZoom:!0,shards:[a.contentRef],children:k.jsx(I.div,{"data-state":De(a.open),...n,ref:t,style:{pointerEvents:"auto",...n.style}})})}),H="DialogContent",Nt=c.forwardRef((e,t)=>{const r=Rt(H,e.__scopeDialog),{forceMount:n=r.forceMount,...a}=e,o=z(H,e.__scopeDialog);return k.jsx(he,{present:n||o.open,children:o.modal?k.jsx(Jn,{...a,ref:t}):k.jsx(ea,{...a,ref:t})})});Nt.displayName=H;var Jn=c.forwardRef((e,t)=>{const r=z(H,e.__scopeDialog),n=c.useRef(null),a=B(t,r.contentRef,n);return c.useEffect(()=>{const o=n.current;if(o)return Xn(o)},[]),k.jsx(Tt,{...e,ref:a,trapFocus:r.open,disableOutsidePointerEvents:!0,onCloseAutoFocus:q(e.onCloseAutoFocus,o=>{var i;o.preventDefault(),(i=r.triggerRef.current)==null||i.focus()}),onPointerDownOutside:q(e.onPointerDownOutside,o=>{const i=o.detail.originalEvent,s=i.button===0&&i.ctrlKey===!0;(i.button===2||s)&&o.preventDefault()}),onFocusOutside:q(e.onFocusOutside,o=>o.preventDefault())})}),ea=c.forwardRef((e,t)=>{const r=z(H,e.__scopeDialog),n=c.useRef(!1),a=c.useRef(!1);return k.jsx(Tt,{...e,ref:t,trapFocus:!1,disableOutsidePointerEvents:!1,onCloseAutoFocus:o=>{var i,s;(i=e.onCloseAutoFocus)==null||i.call(e,o),o.defaultPrevented||(n.current||(s=r.triggerRef.current)==null||s.focus(),o.preventDefault()),n.current=!1,a.current=!1},onInteractOutside:o=>{var h,u;(h=e.onInteractOutside)==null||h.call(e,o),o.defaultPrevented||(n.current=!0,o.detail.originalEvent.type==="pointerdown"&&(a.current=!0));const i=o.target;((u=r.triggerRef.current)==null?void 0:u.contains(i))&&o.preventDefault(),o.detail.originalEvent.type==="focusin"&&a.current&&o.preventDefault()}})}),Tt=c.forwardRef((e,t)=>{const{__scopeDialog:r,trapFocus:n,onOpenAutoFocus:a,onCloseAutoFocus:o,...i}=e,s=z(H,r),h=c.useRef(null),u=B(t,h);return ln(),k.jsxs(k.Fragment,{children:[k.jsx(ft,{asChild:!0,loop:!0,trapped:n,onMountAutoFocus:a,onUnmountAutoFocus:o,children:k.jsx(Le,{role:"dialog",id:s.contentId,"aria-describedby":s.descriptionId,"aria-labelledby":s.titleId,"data-state":De(s.open),...i,ref:u,onDismiss:()=>s.onOpenChange(!1)})}),k.jsxs(k.Fragment,{children:[k.jsx(ta,{titleId:s.titleId}),k.jsx(na,{contentRef:h,descriptionId:s.descriptionId})]})]})}),Oe="DialogTitle",Ot=c.forwardRef((e,t)=>{const{__scopeDialog:r,...n}=e,a=z(Oe,r);return k.jsx(I.h2,{id:a.titleId,...n,ref:t})});Ot.displayName=Oe;var Dt="DialogDescription",It=c.forwardRef((e,t)=>{const{__scopeDialog:r,...n}=e,a=z(Dt,r);return k.jsx(I.p,{id:a.descriptionId,...n,ref:t})});It.displayName=Dt;var jt="DialogClose",_t=c.forwardRef((e,t)=>{const{__scopeDialog:r,...n}=e,a=z(jt,r);return k.jsx(I.button,{type:"button",...n,ref:t,onClick:q(e.onClick,()=>a.onOpenChange(!1))})});_t.displayName=jt;function De(e){return e?"open":"closed"}var Ft="DialogTitleWarning",[Rs,qt]=tr(Ft,{contentName:H,titleName:Oe,docsSlug:"dialog"}),ta=({titleId:e})=>{const t=qt(Ft),r=`\`${t.contentName}\` requires a \`${t.titleName}\` for the component to be accessible for screen reader users.

If you want to hide the \`${t.titleName}\`, you can wrap it with our VisuallyHidden component.

For more information, see https://radix-ui.com/primitives/docs/components/${t.docsSlug}`;return c.useEffect(()=>{e&&(document.getElementById(e)||console.error(r))},[r,e]),null},ra="DialogDescriptionWarning",na=({contentRef:e,descriptionId:t})=>{const n=`Warning: Missing \`Description\` or \`aria-describedby={undefined}\` for {${qt(ra).contentName}}.`;return c.useEffect(()=>{var o;const a=(o=e.current)==null?void 0:o.getAttribute("aria-describedby");t&&a&&(document.getElementById(t)||console.warn(n))},[n,e,t]),null},Ls=St,zs=Pt,Ns=Lt,Ts=zt,Os=Nt,Ds=Ot,Is=It,js=_t;export{ua as $,da as A,sa as B,Os as C,Is as D,za as E,ft as F,ja as G,lo as H,ca as I,us as J,Sa as K,ko as L,gs as M,xo as N,Ts as O,I as P,Qo as Q,oa as R,Re as S,hs as T,bs as U,So as V,go as W,Cs as X,po as Y,Es as Z,Mo as _,mr as a,Po as a$,la as a0,Ss as a1,rs as a2,Ko as a3,fa as a4,ts as a5,Oa as a6,Ha as a7,Da as a8,No as a9,Ia as aA,Va as aB,Wa as aC,so as aD,ks as aE,va as aF,$a as aG,ha as aH,xs as aI,pa as aJ,es as aK,vs as aL,ms as aM,co as aN,ma as aO,qa as aP,mo as aQ,Ms as aR,bo as aS,ho as aT,fs as aU,Qa as aV,Za as aW,ao as aX,wa as aY,_a as aZ,ps as a_,Zo as aa,Ta as ab,ds as ac,Ca as ad,is as ae,ro as af,Ro as ag,Lo as ah,Do as ai,$o as aj,Ya as ak,Oo as al,ns as am,Ba as an,cs as ao,Aa as ap,fo as aq,to as ar,Jo as as,Eo as at,ga as au,Fo as av,Ga as aw,jo as ax,xa as ay,Ea as az,he as b,vo as b0,ya as b1,os as b2,eo as b3,Io as b4,oo as b5,Go as b6,Ma as b7,Ho as b8,no as b9,io as bA,Uo as bB,To as bC,Fa as ba,Xa as bb,ls as bc,as as bd,Xo as be,uo as bf,ys as bg,qo as bh,Ka as bi,ka as bj,_o as bk,ws as bl,ba as bm,Ua as bn,La as bo,wo as bp,yo as bq,Wo as br,ss as bs,zo as bt,Co as bu,Yo as bv,Bo as bw,Ao as bx,Ja as by,Vo as bz,rr as c,V as d,q as e,st as f,le as g,or as h,ia as i,k as j,js as k,Ds as l,Ls as m,zs as n,Ns as o,Xn as p,ln as q,Mt as r,Le as s,As as t,B as u,me as v,Ra as w,Na as x,Pa as y,rt as z};
