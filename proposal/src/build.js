const fs=require('fs'),path=require('path'),katex=require('katex');
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const [src,out,png]=process.argv.slice(2);
let body=fs.readFileSync(src,'utf8');
body=body.replace(/\$\$([\s\S]+?)\$\$/g,(_,m)=>katex.renderToString(m,{displayMode:true,throwOnError:true}))
         .replace(/\$([^$]+?)\$/g,(_,m)=>katex.renderToString(m,{throwOnError:true}));
const kcss='file://'+path.join(__dirname,'node_modules/katex/dist/katex.min.css');
const ccss=fs.readFileSync(path.join(path.dirname(src),'common.css'),'utf8');
const html=`<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${kcss}"><style>${ccss}</style></head><body>${body}</body></html>`;
const tmp=out.replace(/\.pdf$/,'.build.html');fs.writeFileSync(tmp,html);
(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('file://'+tmp);await p.waitForTimeout(500);
await p.pdf({path:out,format:'Letter',preferCSSPageSize:true,printBackground:true});
await p.emulateMedia({media:'print'});await p.setViewportSize({width:720,height:1056});
const h=await p.evaluate(()=>document.body.scrollHeight);console.log('content height px',h,'(limit',1056-0.8*96,')');
await p.screenshot({path:png,fullPage:true});await b.close();fs.unlinkSync(tmp);
const pages=(fs.readFileSync(out,'latin1').match(/\/Type\s*\/Page[^s]/g)||[]).length;console.log(path.basename(out),'pages:',pages);})();
