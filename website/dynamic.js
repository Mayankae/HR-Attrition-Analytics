/* Dynamic / interactive layer: global filters, live parameters, explorer, what-if predictor, animation */
const KK=()=>+(($('#kk')||{}).value||3),KS=()=>Array.from({length:KK()},(_,i)=>i),TD=()=>+(($('#td')||{}).value||3),TS=()=>+(($('#sp')||{}).value||70),
PAL=['#e5484d99','#2f5bea99','#1f9d6b99','#f5a623aa','#9b59b6aa','#16a2b8aa'];
let XS={q:'',k:null,d:1,p:0},PM=null,XD={};
const uniq=c=>[...new Set(ALL.map(r=>r[c]))].sort((a,b)=>a>b?1:-1),mode=c=>{const g={};ALL.forEach(r=>g[r[c]]=(g[r[c]]||0)+1);return Object.keys(g).sort((a,b)=>g[b]-g[a])[0]};
function flt(rows){const a=$('#fa'),b=$('#fb2'),lo=$('#fl1'),hi=$('#fl2'),k=KF[0];return rows.filter(r=>(!a||!a.value||String(r[FA()])==a.value)&&(!b||!b.value||String(r[FB()])==b.value)&&(!lo||lo.value===''||r[k]>=+lo.value)&&(!hi||hi.value===''||r[k]<=+hi.value))}
function pTrain(){const mm={};CONT.forEach(c=>{const v=ALL.map(r=>r[c]);mm[c]=[Math.min(...v),Math.max(...v)]});
const bin=(c,v)=>{if(!CONT.includes(c))return String(v);const[a,b]=mm[c],w=(b-a)/3||1;return['Low','Mid','High'][Math.max(0,Math.min(2,Math.floor((v-a)/w)))]};
const m={Yes:{n:0,c:{}},No:{n:0,c:{}}};ALL.forEach(r=>{const z=m[isY(r)?'Yes':'No'];z.n++;COLS.forEach(c=>{const k=c+'='+bin(c,r[c]);z.c[k]=(z.c[k]||0)+1})});
PM={m,bin,src:ALL};XD={};COLS.forEach(c=>XD[c]=NUM.includes(c)?Math.round(mean(ALL,r=>r[c])):mode(c))}
function pRisk(row){const{m,bin}=PM,s={Yes:Math.log(m.Yes.n/ALL.length),No:Math.log(m.No.n/ALL.length)},con=[];
COLS.forEach(c=>{const k=c+'='+bin(c,row[c]),ly=Math.log(((m.Yes.c[k]||0)+1)/(m.Yes.n+4)),ln=Math.log(((m.No.c[k]||0)+1)/(m.No.n+4));s.Yes+=ly;s.No+=ln;con.push([c+' = '+bin(c,row[c]),ly-ln])});
return{p:1/(1+Math.exp(s.No-s.Yes)),con:con.sort((a,b)=>b[1]-a[1])}}
const FORM=()=>TOPA(8).map(c=>{if(!CONT.includes(c))return[c,'s'];const v=ALL.map(r=>r[c]),lo=Math.min(...v),hi=Math.max(...v),sp=hi-lo;return[c,'r',Math.floor(lo),Math.ceil(hi),sp>200?Math.round(sp/100):sp>20?1:.1]});
function xpred(){if(!PM||PM.src!==ALL)pTrain();const row={...XD};FORM().forEach(([c,t])=>{const e=$('#i_'+sid(c));if(!e||e.value==='')return;row[c]=NUM.includes(c)?+e.value:e.value;if(t=='r')$('#v_'+sid(c)).textContent=e.value});
const{p,con}=pRisk(row),pc=Math.round(p*100),lv=pc<30?'Low':pc<55?'Medium':'High',col=pc<30?'var(--gn)':pc<55?'#f5a623':'var(--rd)';
const sim=ALL.filter(r=>r.OverTime==row.OverTime&&r.JobLevel==row.JobLevel&&r.MaritalStatus==row.MaritalStatus),sy=sim.filter(isY).length;
$('#pk').textContent=pc+'% · '+lv+' risk';$('#pk').style.color=col;$('#pb').style.width=pc+'%';$('#pb').style.background=col;
$('#pd2').innerHTML=`<p>Similar employees (same overtime, job level, marital status): <b>${sim.length}</b>, of whom <b>${fx(100*sy/(sim.length||1))}%</b> left.</p><b>Risk drivers</b><ul>${con.slice(0,3).map(x=>`<li class="y">${x[0]}</li>`).join('')}</ul><b>Protective factors</b><ul>${con.slice(-2).reverse().map(x=>`<li class="n">${x[0]}</li>`).join('')}</ul>`}
function xdraw(){const ks=Object.keys(ALL[0]);let rows=F.filter(r=>!XS.q||Object.values(r).some(v=>String(v).toLowerCase().includes(XS.q)));if(XS.k)rows=[...rows].sort((a,b)=>(a[XS.k]>b[XS.k]?1:-1)*XS.d);
const pg=Math.max(1,Math.ceil(rows.length/15));XS.p=Math.min(XS.p,pg-1);
$('#dt').innerHTML=`<table><tr>${ks.map(k=>`<th style="cursor:pointer" data-k="${k}">${k}${XS.k==k?(XS.d>0?' ▲':' ▼'):''}</th>`).join('')}</tr>${rows.slice(XS.p*15,XS.p*15+15).map(r=>`<tr>${ks.map(k=>`<td class="${k=='Attrition'&&r[k]=='Yes'?'y':''}">${r[k]}</td>`).join('')}</tr>`).join('')}</table>`;
$('#pg').textContent=`Page ${XS.p+1} / ${pg} · ${rows.length} rows`;document.querySelectorAll('#dt th').forEach(t=>t.onclick=()=>{XS.d=XS.k==t.dataset.k?-XS.d:1;XS.k=t.dataset.k;xdraw()})}
function countUp(){document.querySelectorAll('#kp .kv').forEach(e=>{const m=e.textContent.match(/^([^\d]*)([\d,]*\.?\d+)(.*)$/);if(!m)return;const to=+m[2].replace(/,/g,''),dec=(m[2].split('.')[1]||'').length,t0=performance.now();
(function s(t){const k=Math.min(1,(t-t0)/700),v=to*(1-Math.pow(1-k,3));e.textContent=m[1]+v.toLocaleString(undefined,{minimumFractionDigits:dec,maximumFractionDigits:dec})+m[3];if(k<1)requestAnimationFrame(s)})(t0)})}
function afterRender(){$('#fc').textContent=`Showing ${F.length.toLocaleString()} of ${ALL.length.toLocaleString()} employees`;countUp();xdraw();xpred();if(window.extraRender)extraRender()}
function extraShell(){pTrain();buildFilters();$('#app').insertAdjacentHTML('beforeend',`<section class="pn" id="p8"><div class="c"><div class="sc"><input id="q" placeholder="Search any value…"><button id="ex" class="p">Export filtered CSV</button><span class="mu">Click a column header to sort</span></div><div id="dt"></div><div class="sc"><button id="pv1">‹ Prev</button><button id="pv2">Next ›</button><span id="pg" class="mu"></span></div></div></section>
<section class="pn" id="p9"><div class="g"><div class="c"><h3>What-if: describe an employee</h3><div id="pf"></div></div><div class="c"><h3>Predicted attrition risk</h3><div class="kv" id="pk"></div><div class="bar"><i id="pb"></i></div><div id="pd2"></div></div></div></section>`);
$('#pf').innerHTML=FORM().map(([c,t,a,b,s])=>t=='r'?`<label class="fl">${c}: <b id="v_${sid(c)}"></b><input type="range" id="i_${sid(c)}" min="${a}" max="${b}" step="${s}" value="${XD[c]}"></label>`:`<label class="fl">${c}<select id="i_${sid(c)}">${uniq(c).map(v=>`<option ${v==XD[c]?'selected':''}>${v}</option>`).join('')}</select></label>`).join('');
FORM().forEach(([c])=>{$('#i_'+sid(c)).oninput=xpred});
[['td','tdv'],['sp','spv'],['kk','kv']].forEach(([i,v])=>{const e=$('#'+i);e.oninput=()=>$('#'+v).textContent=e.value;e.onchange=()=>render()});
$('#q').oninput=e=>{XS.q=e.target.value.toLowerCase();XS.p=0;xdraw()};$('#pv1').onclick=()=>{XS.p=Math.max(0,XS.p-1);xdraw()};$('#pv2').onclick=()=>{XS.p++;xdraw()};
$('#ex').onclick=()=>{const ks=Object.keys(F[0]),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([[ks.join(','),...F.map(r=>ks.map(k=>r[k]).join(','))].join('\n')],{type:'text/csv'}));a.download='filtered_data.csv';a.click()};if(window.extraShell2)extraShell2()}
function buildFilters(){const sel=(id,c)=>`<select id="${id}" onchange="render()"><option value="">${c}: all</option>${uniq(c).map(v=>`<option>${v}</option>`).join('')}</select>`,k=KF[0],v=ALL.map(r=>r[k]);
$('#fb').innerHTML=sel('fa',FA())+sel('fb2',FB())+`<label>${k} <input type="number" id="fl1" placeholder="${Math.min(...v)}" onchange="render()"> – <input type="number" id="fl2" placeholder="${Math.max(...v)}" onchange="render()"></label><button onclick="resetF()">Reset filters</button><button onclick="toggleTheme()">🌓 Theme</button><span id="fc" class="mu"></span>`}
function resetF(){['fa','fb2','fl1','fl2'].forEach(i=>$('#'+i).value='');render()}
function toggleTheme(){const d=document.documentElement,dk=(d.dataset.theme||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'))=='dark';d.dataset.theme=dk?'light':'dark';const c=getComputedStyle(d);Chart.defaults.color=c.getPropertyValue('--tx');Chart.defaults.borderColor=c.getPropertyValue('--bd');render()}
