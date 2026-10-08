/* Auto attribute detection + preprocessing engine (works on any CSV with a binary/low-cardinality target) */
let PP={dup:true,imp:true,cap:false},RAW=[],TGT='Attrition',POS='Yes',IDS=[],SCH={},PREP={},KF=[],M1T='',M1X=[],M2T='',M2X=[],MEAS='',TGOVR='';
const KI=n=>Array.from({length:n},(_,i)=>i),MISS=['','na','n/a','nan','null','?'],sid=c=>String(c).replace(/\W/g,'_');
function csvRows(t){const o=[];let r=[],f='',q=false;for(let i=0;i<t.length;i++){const c=t[i];if(q){if(c=='"'){if(t[i+1]=='"'){f+='"';i++}else q=false}else f+=c}else if(c=='"')q=true;else if(c==','){r.push(f);f=''}else if(c=='\n'||c=='\r'){if(c=='\r'&&t[i+1]=='\n')i++;r.push(f);f='';if(r.length>1||r[0]!=='')o.push(r);r=[]}else f+=c}if(f!==''||r.length){r.push(f);o.push(r)}return o}
function csvParse(t){const A=csvRows(t.trim()),h=A[0].map(s=>s.trim()),B=A.slice(1),na=v=>v==null||MISS.includes(String(v).trim().toLowerCase());
const nc=h.map((_,j)=>{const v=B.map(r=>r[j]).filter(x=>!na(x));return v.length>0&&v.filter(x=>!isNaN(+x)).length/v.length>=.95});
return B.map(r=>{const o={};h.forEach((k,j)=>{const x=r[j];o[k]=na(x)?null:nc[j]?(isNaN(+x)?null:+x):String(x).trim()});return o})}
const qt=(a,p)=>{const s=[...a].sort((x,y)=>x-y),i=(s.length-1)*p,l=Math.floor(i);return s[l]+(s[Math.ceil(i)]-s[l])*(i-l)};
function analyze(raw){const n0=raw.length,cols=Object.keys(raw[0]),cells0=n0*cols.length,S={};
cols.forEach(c=>{const v=raw.map(r=>r[c]).filter(x=>x!=null),d=new Set(v),num=v.length>0&&v.every(x=>typeof x=='number'),s=S[c]={miss:n0-v.length,dist:d.size,num,int:num&&v.every(Number.isInteger),vals:[...d]};
s.t=s.dist<=1?'constant':(s.dist/(v.length||1)>.98&&(!num||(s.int&&/id|key|index|num|no$|code|serial/i.test(c))))?'id':!num?(s.dist>50&&s.dist>.5*n0?'text':'categorical'):s.dist<=10?'ordinal':'continuous'});
IDS=cols.filter(c=>S[c].t=='id');const ok=cols.filter(c=>!['id','constant','text'].includes(S[c].t)),bin=ok.filter(c=>S[c].dist==2);
TGT=TGOVR&&ok.includes(TGOVR)?TGOVR:bin.find(c=>/attrition|churn|target|class|label|outcome|default|surviv|diagnos|left|status/i.test(c))||bin[bin.length-1]||ok.filter(c=>S[c].dist<=10).sort((a,b)=>S[a].dist-S[b].dist)[0]||ok[ok.length-1];
const cnt=v=>raw.filter(r=>r[TGT]===v).length;POS=S[TGT].vals.find(v=>/^(yes|y|true|1|churn|left|positive)$/i.test(String(v)))??[...S[TGT].vals].sort((a,b)=>cnt(a)-cnt(b))[0];
const pred=cols.filter(c=>c!=TGT&&!['id','constant','text'].includes(S[c].t));let rows=raw.map(r=>({...r})).filter(r=>r[TGT]!=null),imputed=0;
if(PP.imp){pred.forEach(c=>{if(!S[c].miss)return;let fill;if(S[c].num){const v=rows.map(r=>r[c]).filter(x=>x!=null).sort((a,b)=>a-b);fill=v[Math.floor(v.length/2)]}else{const g={};rows.forEach(r=>{if(r[c]!=null)g[r[c]]=(g[r[c]]||0)+1});fill=Object.keys(g).sort((a,b)=>g[b]-g[a])[0]}rows.forEach(r=>{if(r[c]==null){r[c]=fill;imputed++}})})}
else rows=rows.filter(r=>pred.every(c=>r[c]!=null));
let dups=0;if(PP.dup){const seen=new Set(),b=rows.length,k=cols.filter(c=>!IDS.includes(c));rows=rows.filter(r=>{const key=k.map(c=>r[c]).join('|');if(seen.has(key))return false;seen.add(key);return true});dups=b-rows.length}
const cont=pred.filter(c=>S[c].t=='continuous'),ob={};let oc=0;
cont.forEach(c=>{const v=rows.map(r=>r[c]),a=qt(v,.25),b=qt(v,.75),lo=a-1.5*(b-a),hi=b+1.5*(b-a);let k=0;rows.forEach(r=>{if(r[c]<lo||r[c]>hi){k++;if(PP.cap)r[c]=Math.min(hi,Math.max(lo,r[c]))}});ob[c]=k;oc+=k});
COLS.length=0;COLS.push(...pred);CONT.length=0;CONT.push(...cont);NUM.length=0;NUM.push(...pred.filter(c=>S[c].num));
const D0=disc(rows),b0=H(rows.filter(isY).length,rows.length),ig={};pred.forEach(c=>ig[c]=gain(D0,c,b0));S._ig=ig;SCH=S;
const byIG=a=>[...a].sort((x,y)=>ig[y]-ig[x]);KF=byIG(CONT.length>=3?CONT:[...CONT,...NUM.filter(c=>!CONT.includes(c))]).slice(0,3);while(KF.length<3)KF.push(KF[KF.length-1]||pred[0]);
const nm=NUM.length?NUM:pred,cor=(a,b)=>{const n=rows.length,x=rows.map(r=>r[a]),y=rows.map(r=>r[b]),mx=sum(x)/n,my=sum(y)/n;let p=0,u=0,w=0;for(let i=0;i<n;i++){p+=(x[i]-mx)*(y[i]-my);u+=(x[i]-mx)**2;w+=(y[i]-my)**2}return p/Math.sqrt(u*w||1)},
hub=c=>sum(nm.filter(o=>o!=c),o=>Math.abs(cor(c,o))),hs=[...nm].sort((a,b)=>hub(b)-hub(a)),top=(t,k,ex=[])=>{const l=nm.filter(o=>o!=t&&!ex.includes(o)).sort((a,b)=>Math.abs(cor(t,b))-Math.abs(cor(t,a))).slice(0,k);return l.length?l:[t]};
M1T=nm.find(c=>/income|salary|price|charge|amount|cost|revenue/i.test(c))||hs[0];M1X=top(M1T,3);
M2T=nm.find(c=>c!=M1T&&/tenure|years.?at|duration|months/i.test(c))||hs.find(c=>c!=M1T)||M1T;M2X=top(M2T,2);MEAS=M1T;
cols.forEach(c=>{S[c].role=c==TGT?'TARGET':S[c].t=='id'?'Ignored (identifier)':S[c].t=='constant'?'Ignored (constant)':S[c].t=='text'?'Ignored (free text)':'Predictor'});
PREP={n0,n1:rows.length,cols0:cols.length,cells0,ids:IDS.length,imputed,dups,rowsOther:n0-rows.length-dups,outCells:oc,outBy:ob,contN:cont.length,catN:pred.length-cont.length};return rows}
const DIMS=()=>{const d=COLS.filter(c=>!CONT.includes(c)&&SCH[c].dist<=12).sort((a,b)=>SCH._ig[b]-SCH._ig[a]);return d.length?d:[TGT]},FA=()=>DIMS()[0],FB=()=>DIMS()[1]||DIMS()[0],TOPA=k=>Object.entries(SCH._ig).sort((a,b)=>b[1]-a[1]).slice(0,k).map(x=>x[0]);
function starHTML(){const g=[[],[],[]];COLS.filter(c=>!CONT.includes(c)).forEach((c,i)=>g[i%3].push(c));return`<div class="box fact"><b>Fact_${TGT}</b>keys: ${IDS.concat('TimeKey').join(', ')}<br>measures: ${CONT.concat(TGT+' (count)').join(', ')}</div>`+g.map((x,i)=>`<div class="box"><b>Dim_${['Profile','Context','Behaviour'][i]}</b>${x.join(', ')||'—'}</div>`).join('')}
