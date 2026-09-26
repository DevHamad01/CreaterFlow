import { readFileSync } from "node:fs";
const lines=readFileSync("src/index.css","utf8").split(/\r?\n/);
function blk(re){const s=lines.findIndex(l=>re.test(l));const o=[];for(let i=s+1;i<lines.length;i++){if(/^\s*\}/.test(lines[i]))break;o.push(lines[i]);}return o.join("\n");}
const parse=b=>Object.fromEntries([...b.matchAll(/--([\w-]+):\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/g)].map(m=>[m[1],[+m[2],+m[3],+m[4]]]));
const rgb=([h,s,l])=>{const S=s/100,G=l/100,c=(1-Math.abs(2*G-1))*S,hp=(((h%360)+360)%360)/60,x=c*(1-Math.abs((hp%2)-1));let r=0,g=0,b=0;if(hp<1)[r,g,b]=[c,x,0];else if(hp<2)[r,g,b]=[x,c,0];else if(hp<3)[r,g,b]=[0,c,x];else if(hp<4)[r,g,b]=[0,x,c];else if(hp<5)[r,g,b]=[x,0,c];else[r,g,b]=[c,0,x];const m=G-c/2;return[(r+m)*255,(g+m)*255,(b+m)*255];};
const lum=v=>{const f=n=>{n/=255;return n<=0.03928?n/12.92:Math.pow((n+0.055)/1.055,2.4)};const[r,g,b]=v.map(f);return .2126*r+.7152*g+.0722*b};
const R=(a,b)=>{const[x,y]=[lum(rgb(a)),lum(rgb(b))].sort((p,q)=>q-p);return (x+.05)/(y+.05)};
const L=parse(blk(/^\s*:root\s*\{/)),D=parse(blk(/^\s*\.dark\s*\{/));
// pairs that ARE actually rendered in the code
const RENDERED=[
 ["mint text on brand surface","mint","primary",4.5],
 ["primary-fg on brand surface","primary-foreground","primary",4.5],
 ["iris-fg on iris","iris-foreground","iris",4.5],
 ["success on card","success","card",4.5],
 ["warning on card","warning","card",4.5],
 ["danger on card","danger","card",4.5],
 ["muted-fg on card","muted-foreground","card",4.5],
 ["muted-fg on background","muted-foreground","background",4.5],
 ["foreground on card","foreground","card",4.5],
 ["primary text on card","primary","card",4.5],
 ["input on card","input","card",3],
 ["ring on background","ring","background",3],
 ["sidebar-fg on sidebar-bg","sidebar-foreground","sidebar-background",4.5],
];
for(const[name,T]of[["LIGHT",L],["DARK",D]]){
  console.log(`\n===== ${name} =====`);
  let bad=0;
  for(const[label,fg,bg,min]of RENDERED){
    if(!T[fg]||!T[bg])continue;
    const r=R(T[fg],T[bg]); const ok=r>=min; if(!ok)bad++;
    console.log(`${ok?"PASS":"FAIL"}  ${r.toFixed(2).padStart(5)} (min ${min})  ${label}`);
  }
  console.log(`-- ${bad} failing`);
}
