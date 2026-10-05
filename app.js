const cl=x=>Math.max(0,Math.min(1,x)),$=id=>document.getElementById(id);
const S={view:0,sel:0,m:{temp:32,terrain:'Heavy rubble',dust:'High',dur:3,slots:2},dogs:[
{n:'Koda',age:6,rub:'High',heat:'Moderate',rec:'Slow',work:'High',st:'Fresh'},
{n:'Luna',age:3,rub:'Moderate',heat:'High',rec:'Fast',work:'Moderate',st:'Worked recently'},
{n:'Max',age:8,rub:'Moderate',heat:'Low',rec:'Moderate',work:'Low',st:'Fresh'},
{n:'Rio',age:4,rub:'Low',heat:'Moderate',rec:'Moderate',work:'Moderate',st:'Fresh'},
{n:'Nova',age:5,rub:'High',heat:'High',rec:'Fast',work:'Low',st:'Fresh'}]};
const T={'Open ground':.1,'Mixed debris':.5,'Heavy rubble':1},D={Low:.1,Moderate:.5,High:1},ST={'Fresh':0,'Worked recently':-12,'Still recovering':-25};
const HS={High:.6,Moderate:1,Low:1.4},RC={Fast:16,Moderate:11,Slow:7},RB={High:12,Moderate:6,Low:0},W={High:-18,Moderate:-8,Low:0};
function stress(){const t=cl(cl((S.m.temp-15)/25)*.3+T[S.m.terrain]*.3+D[S.m.dust]*.2+cl(S.m.dur/6)*.2);return{t,lv:t<.35?'Low':t<.6?'Moderate':t<.85?'High':'Critical'}}
const ready=d=>Math.round(cl((85+W[d.work]+(d.age>=7?-12:d.age>=5?-4:0)-stress().t*16*HS[d.heat]+ST[d.st])/100)*100);
function sim(){const s=stress().t,heavy=S.m.terrain==='Heavy rubble',N=S.m.slots,ds=S.dogs,Tt=S.m.dur*60;
let r=ds.map(ready),slot=Array(N).fill(-1),since=ds.map(()=>99),work=ds.map(()=>0),cover=[0,0,0],un=Array(N).fill(false),F=[],E=[];
const sc=i=>r[i]+(heavy?RB[ds[i].rub]:0)-(ds[i].age>=7?6:0);
for(let t=0;t<=Tt;t++){
for(let k=0;k<N;k++){const i=slot[k];
if(i>=0&&(r[i]<45||work[i]>=45)){E.push({t,out:1,m:`${ds[i].n} rotates out of Sector ${'ABC'[k]}: ${r[i]<45?'readiness fell to '+Math.round(r[i]):'45 min of continuous work'}.`});slot[k]=-1;since[i]=0;work[i]=0}
if(slot[k]<0){let b=-1;ds.forEach((d,j)=>{if(!slot.includes(j)&&r[j]>=(t?55:45)&&since[j]>=10&&(b<0||sc(j)>sc(b)))b=j});
if(b>=0){slot[k]=b;un[k]=false;const d=ds[b],w=['readiness '+Math.round(r[b])];if(heavy&&d.rub==='High')w.push('high rubble experience');if(d.heat==='High'&&s>=.55)w.push('strong heat tolerance');if(d.rec==='Fast')w.push('fast recovery');E.push({t,m:`${d.n} takes Sector ${'ABC'[k]}: ${w.join(', ')}.`})}
else if(!un[k]){un[k]=true;E.push({t,m:`Sector ${'ABC'[k]} uncovered: no dog above readiness 55. Consider a replacement dog.`})}}}
F.push({r:r.map(Math.round),slot:[...slot],cover:[...cover]});
for(let i=0;i<ds.length;i++){if(slot.includes(i)){r[i]=Math.max(0,r[i]-(14+26*s)*HS[ds[i].heat]/45);work[i]++}else{r[i]=Math.min(100,r[i]+RC[ds[i].rec]*(1-.3*s)/20);since[i]++}}
slot.forEach((i,k)=>{if(i>=0)cover[k]=Math.min(100,cover[k]+115/Tt)})}
return{F,E,T:Tt,N}}
function M(k,v){S.m[k]=v;if(k==='temp')$('vt').textContent=v+'°C';if(k==='dur')$('vd').textContent=v+' h';risk()}
function risk(){const s=stress();$('lv').textContent=s.lv;$('mt').style.width=Math.round(s.t*100)+'%'}
const opt=(a,v)=>a.map(x=>`<option${x===v?' selected':''}>${x}</option>`).join('');
function setup(){const m=S.m;$('app').innerHTML=`<div class="g"><div class="card"><h2>Mission conditions</h2>
<div class="f"><label>Temperature <b id="vt">${m.temp}°C</b></label><input type="range" min="10" max="45" value="${m.temp}" oninput="M('temp',+this.value)"></div>
<div class="f"><label>Search duration <b id="vd">${m.dur} h</b></label><input type="range" min="1" max="3" value="${m.dur}" oninput="M('dur',+this.value)"></div>
<div class="f"><label>Terrain</label><select onchange="M('terrain',this.value)">${opt(Object.keys(T),m.terrain)}</select></div>
<div class="f"><label>Dust level</label><select onchange="M('dust',this.value)">${opt(Object.keys(D),m.dust)}</select></div>
<div class="f"><label>Sectors searched at once</label><select onchange="M('slots',+this.value)">${opt([1,2,3],m.slots)}</select></div>
<div class="risk"><div><div style="font-size:13px;color:var(--mut)">Mission stress</div><div class="lv" id="lv"></div></div><div class="meter"><i id="mt"></i></div></div></div>
<div class="card"><h2>Available dogs</h2>${S.dogs.map((d,i)=>`<div class="dog"><div><h3>${d.n}</h3><p>Age ${d.age} · Rubble ${d.rub} · Heat ${d.heat} · Recovery ${d.rec} · Workload ${d.work}</p><button class="lk" onclick="S.dogs.splice(${i},1);setup()" aria-label="Remove ${d.n}">Remove</button></div>
<div class="f" style="margin:0"><label>Current state</label><select onchange="S.dogs[${i}].st=this.value">${opt(Object.keys(ST),d.st)}</select></div></div>`).join('')}
<div style="display:flex;justify-content:space-between;gap:10px;margin-top:14px;flex-wrap:wrap"><button class="btn g2" onclick="addPage()">+ Add dog</button>${S.dogs.length?`<button class="btn" onclick="S.view=1;plan()">Run simulation</button>`:`<span class="note" style="color:var(--mut)">Add at least one dog to run the simulation.</span>`}</div></div></div>`;risk()}
function addPage(){const L=['Low','Moderate','High'];$('app').innerHTML=`<div class="card" style="max-width:640px"><h2>Add a dog</h2><p class="note" style="color:var(--mut);margin:0 0 14px">Enter the dog's baseline. The simulation uses these values to decide who searches, rests and rotates.</p>
<div class="row2"><div class="f"><label>Name</label><input id="an" type="text" maxlength="14" placeholder="e.g. Ranger" style="width:100%;font:500 15px Barlow;padding:8px;border:1px solid var(--ln);border-radius:4px;background:var(--bg);color:var(--tx)"></div>
<div class="f"><label>Age (years)</label><input id="aa" type="number" min="1" max="14" value="4" style="width:100%;font:500 15px Barlow;padding:8px;border:1px solid var(--ln);border-radius:4px;background:var(--bg);color:var(--tx)"></div>
<div class="f"><label>Rubble experience</label><select id="ar">${opt(L,'Moderate')}</select></div>
<div class="f"><label>Heat tolerance</label><select id="ah">${opt(L,'Moderate')}</select></div>
<div class="f"><label>Recovery speed</label><select id="ac">${opt(['Slow','Moderate','Fast'],'Moderate')}</select></div>
<div class="f"><label>Recent workload</label><select id="aw">${opt(L,'Low')}</select></div>
<div class="f"><label>Current state</label><select id="as">${opt(Object.keys(ST),'Fresh')}</select></div></div>
<p id="ae" style="color:var(--or);font-weight:600;margin:0 0 10px"></p>
<div style="display:flex;justify-content:space-between"><button class="btn g2" onclick="setup()">Cancel</button><button class="btn" onclick="saveDog()">Add to team</button></div></div>`}
function saveDog(){const n=$('an').value.trim();if(!n){$('ae').textContent='Enter a name for the dog.';return}
if(S.dogs.some(d=>d.n.toLowerCase()===n.toLowerCase())){$('ae').textContent='A dog named '+n+' is already on the team.';return}
if(S.dogs.length>=8){$('ae').textContent='The team is full (8 dogs).';return}
S.dogs.push({n:n[0].toUpperCase()+n.slice(1),age:Math.max(1,Math.min(14,+$('aa').value||4)),rub:$('ar').value,heat:$('ah').value,rec:$('ac').value,work:$('aw').value,st:$('as').value});setup()}
let TM=null;const SEC=[{x:50,y:40,w:200,h:150},{x:310,y:40,w:240,h:130},{x:310,y:200,w:240,h:120}],RC0={x:30,y:225,w:240,h:75};
function mapSvg(q){return`<svg class="map" viewBox="0 0 600 380" role="img" aria-label="Virtual site map"><defs><pattern id="h" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="var(--or)" stroke-width="2" opacity="${(.12+.3*stress().t).toFixed(2)}"/></pattern></defs>
<path d="M0 335H600M280 0V380" stroke="var(--ln)" stroke-width="14" fill="none"/>
${SEC.map((z,k)=>`<rect id="z${k}" x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" fill="url(#h)" stroke="var(--mut)" stroke-dasharray="5 4" opacity="${k<q.N?1:.35}"/><rect x="${z.x}" y="${z.y+z.h-7}" width="${z.w}" height="7" fill="var(--tint)"/><rect id="g${k}" x="${z.x}" y="${z.y+z.h-7}" width="0" height="7" fill="var(--or)"/><text id="t${k}" x="${z.x+8}" y="${z.y+18}" font-size="13" font-weight="600">Sector ${'ABC'[k]}${k<q.N?'':' (not assigned)'}</text>`).join('')}
<rect x="${RC0.x}" y="${RC0.y}" width="${RC0.w}" height="${RC0.h}" fill="var(--bg)" stroke="var(--or)" stroke-dasharray="5 3"/><text x="${RC0.x+8}" y="${RC0.y+16}" font-size="12" font-weight="600">Rest area (shaded)</text>
<rect x="20" y="345" width="14" height="14" fill="var(--tx)"/><text x="40" y="357" font-size="12">Command post</text>
<path d="M440 360h50" stroke="var(--tx)" stroke-width="2"/><text x="465" y="354" text-anchor="middle" font-size="11">50 m</text><path d="M560 340l6 18l-6-4l-6 4z" fill="var(--tx)"/><text x="560" y="372" text-anchor="middle" font-size="11">N</text>
${S.dogs.map((d,j)=>`<g class="pin R" id="p${j}"><circle r="14"/><text class="i" y="5">${d.n[0]}</text><text class="n" y="29">${d.n}</text></g>`).join('')}</svg>`}
function gantt(q){const X=i=>60+i/q.T*520;let s='';
S.dogs.forEach((d,j)=>{const y=12+j*24;s+=`<text x="0" y="${y+12}" font-size="12" font-weight="600">${d.n}</text><rect x="60" y="${y}" width="520" height="16" fill="var(--tint)"/>`;
let a=-1,k0=-1;for(let i=0;i<=q.T+1;i++){const k=i<=q.T?q.F[i].slot.indexOf(j):-1;if(k!==k0){if(k0>=0)s+=`<rect x="${X(a)}" y="${y}" width="${X(i)-X(a)}" height="16" fill="var(--or)"/><text x="${(X(a)+X(i))/2}" y="${y+12}" font-size="11" text-anchor="middle" style="fill:#fff">${'ABC'[k0]}</text>`;a=i;k0=k}}});
for(let m=0;m<=q.T;m+=30)s+=`<text x="${X(m)}" y="${12+S.dogs.length*24+10}" font-size="11" text-anchor="middle">${m}</text>`;
return`<svg viewBox="0 0 600 ${S.dogs.length*24+30}" style="width:100%;display:block;overflow:visible" class="map">${s}<line id="ph" x1="60" x2="60" y1="6" y2="${S.dogs.length*24+14}" stroke="var(--tx)" stroke-width="2"/></svg>`}
function plan(){stop();const q=sim(),st=stress();S.q=q;S.t=0;S.sp=S.sp||4;
const cov=Math.round(q.F.filter(f=>f.slot.every(x=>x>=0)).length/q.F.length*100),rot=q.E.filter(e=>e.out).length;
$('app').innerHTML=`<div class="bar"><div><h2 style="margin:0 0 6px">Live rotation simulation</h2><span class="badge">Mission stress: ${st.lv}</span> <span class="badge">${q.N} sectors searched at once</span> <span class="badge">${rot} rotations</span> <span class="badge">${cov}% sector coverage</span></div><button class="btn g2" onclick="stop();S.view=0;setup()">Edit setup</button></div>
<div class="ctl"><button class="btn" id="pp" onclick="tog()">Pause</button><button class="btn g2" onclick="rst()">Restart</button><select id="sp" aria-label="Speed" onchange="S.sp=+this.value"><option value="4"${S.sp===4?' selected':''}>Normal speed</option><option value="10"${S.sp===10?' selected':''}>Fast</option><option value="25"${S.sp===25?' selected':''}>Very fast</option></select><input id="sl" type="range" min="0" max="${q.T}" value="0" aria-label="Time" oninput="seek(+this.value)"><b id="tm"></b></div>
<div class="g3"><div><div class="card">${mapSvg(q)}</div><div class="card" style="margin-top:16px"><h3 style="font-size:20px;margin-bottom:6px">Who searches when (minutes)</h3>${gantt(q)}</div></div>
<div><div class="card">${S.dogs.map((d,j)=>`<div class="dc" id="c${j}"><div class="h"><b>${d.n}</b><span class="st"></span></div><div class="meter"><i id="b${j}"></i><u style="left:45%"></u></div><div class="note" style="font-size:12px;color:var(--mut)">Readiness <span id="v${j}"></span> · rotate out below 45</div></div>`).join('')}</div>
<div class="card" style="margin-top:16px"><h3 style="font-size:20px;margin-bottom:4px">Rotation decisions</h3><ul id="log"></ul></div></div></div>
<p class="foot">Simulated on illustrative data. The plan is a suggestion; the team leader and handlers decide, and any sign of distress overrides it.</p>`;
S.pl=true;upd();run()}
function upd(){const q=S.q,i=Math.min(q.T,Math.floor(S.t)),f=q.F[i];$('tm').textContent='T+ '+i+' min';$('sl').value=i;
S.dogs.forEach((d,j)=>{const k=f.slot.indexOf(j);let x,y;if(k>=0){const z=SEC[k],a=S.t*.35+j*1.7;x=z.x+z.w/2+z.w*.3*Math.cos(a);y=z.y+z.h/2+z.h*.22*Math.sin(a*1.3)}else{x=RC0.x+28+j*46;y=RC0.y+38}
$('p'+j).style.transform=`translate(${x}px,${y}px)`;$('p'+j).setAttribute('class','pin '+(k>=0?'S':'R'));
$('c'+j).querySelector('.st').textContent=k>=0?'Searching · Sector '+'ABC'[k]:'Resting';$('c'+j).classList.toggle('on',k>=0);$('b'+j).style.width=f.r[j]+'%';$('v'+j).textContent=f.r[j]});
for(let k=0;k<q.N;k++){$('g'+k).setAttribute('width',SEC[k].w*f.cover[k]/100);$('t'+k).textContent='Sector '+'ABC'[k]+' · '+Math.round(f.cover[k])+'% searched'+(f.slot[k]<0?' · uncovered':'');$('z'+k).setAttribute('class',f.slot[k]<0?'un':'')}
const x=60+i/q.T*520;$('ph').setAttribute('x1',x);$('ph').setAttribute('x2',x);
$('log').innerHTML=q.E.filter(e=>e.t<=i).slice(-6).reverse().map(e=>`<li><b>${e.t} min</b> ${e.m}</li>`).join('')}
function run(){clearInterval(TM);TM=setInterval(()=>{S.t+=S.sp/10;if(S.t>=S.q.T){S.t=S.q.T;upd();stop();return}upd()},100)}
function stop(){clearInterval(TM);S.pl=false;const b=$('pp');if(b)b.textContent='Play'}
function tog(){if(S.pl)stop();else{if(S.t>=S.q.T)S.t=0;S.pl=true;$('pp').textContent='Pause';run()}}
function rst(){S.t=0;S.pl=true;$('pp').textContent='Pause';upd();run()}
function seek(v){S.t=v;upd()}
setup();
