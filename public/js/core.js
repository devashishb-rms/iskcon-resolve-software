/* ===== Core: state, helpers, router, network monitor, event delegation ===== */
const $=(s,el=document)=>el.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pct=(a,b)=>b?Math.round(100*a/b):0;
let S=null, NET=0;

/* Anything this app sends over the network is counted. The prototype never sends anything. */
(function(){
  try{const f=window.fetch;if(f)window.fetch=function(){NET++;return f.apply(this,arguments)};}catch(e){}
  try{const o=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.send=function(){NET++;return o.apply(this,arguments)};}catch(e){}
  try{if(navigator.sendBeacon){const b=navigator.sendBeacon.bind(navigator);navigator.sendBeacon=function(){NET++;return b.apply(null,arguments)}}}catch(e){}
  try{const W=window.WebSocket;if(W){window.WebSocket=function(){NET++;return new W(...arguments)}}}catch(e){}
})();

function freshFlow(){return{step:'door',door:null,q:{lang:S&&S.lang||'en',region:'',gender:''},list:[],ombudsId:null,connection:null,connShown:false,slot:null,weeks:2,
  d:{joining:'me',camOff:false,trainee:null,heard:'',region:'',lang:''},err:{},matchNet:null,reached:{}}}
/* ===== Anonymous users and contacts =====
   The system never learns who a visitor is, so it cannot tell a returning visitor from a new one. Every contact therefore gets
   the next contact-M and a fresh anonymous-user-N. Only the ombuds, who is in the conversation, can say "this is someone I have spoken to before". */
const th=t=>hash(t).toString(16)+hash(t+'~').toString(16);             // prototype stand-in for SHA-256 of the ticket token
const newToken=()=>{const a=new Uint8Array(12);crypto.getRandomValues(a);return [...a].map(x=>x.toString(16).padStart(2,'0')).join('')};
function newContact(o){
  const u={n:++S.seq.u,id:'anonymous-user-'+S.seq.u,region:o.region||'',lang:o.lang||'en'};S.users.push(u);
  const y=new Date().getFullYear();S.seqByYear[y]=(S.seqByYear[y]||0)+1;
  const c={m:++S.seq.m,id:'contact-'+S.seq.m,user:u.n,ombuds:o.ombuds,slot:o.slot,week:weekOf(o.slot),last:o.slot,tokenHash:th(o.token),state:'booked',
    caseNo:y+'-'+String(S.seqByYear[y]).padStart(4,'0'),camOff:!!o.camOff,trainee:o.trainee||'no',joining:o.joining||'me',connection:o.connection||'none',door:o.door||'narrow',heard:o.heard||'(not answered)'};
  S.contacts.push(c);S.byToken[c.tokenHash]=c;bookedSlots.add(o.ombuds+':'+o.slot);return c}
const userOf=c=>S.users.find(u=>u.n===c.user);
function init(){
  bookedSlots.clear();resetPanel();
  const sc=Math.min(100000,+(new URLSearchParams(location.search).get('scale'))||0);
  S={lang:'en',flow:null,staff:{asOmbuds:'o1',tab:{data:'contacts',annual:'cut'},role:'Director',tryAct:null,result:null,tests:{},qrvw:{cat:'',reg:'',vc:''},path:{},dayShift:0,pg:{}},
     me:{id:'o1',tab:'avail',view:'weeks',wk:0,openDay:null,msg:null,asAdmin:false,form:null,errs:[],win:{from:1080,to:1260},applyFrom:1,applyTo:'weekdays',copyN:1},onb:{inv:{name:'',email:''},msg:null,mq:{lang:'en',region:'inE',gender:'np'},reason:{}},
     inspector:false,modal:null,inbox:null,rot:null,pathState:{node:'start',tags:{}},release:{ver:{en:1,hi:1,bn:1,es:1,ru:1},base:1},checks:{},
     device:{surveyDone:{}},   // what the visitor's own browser remembers. The server never sees it.
     sv:{a:{},comment:'',err:''},concern:{cat:'',text:'',sent:false},scale:sc,byToken:{}};
  seedAll(S,sc); S.flow=freshFlow(); S.flow.q.lang='en';
  const R=mulberry(Date.now()&0xffff);S.rot=OMBUDS.map(o=>o.id).sort(()=>R()-.5);
  S.inboxes={conc:[{id:'c1',from:'anonymous form, no contact kept',text:'The ombuds seemed distracted for most of the call.',gone:false}]};
  S.tally={unmet:{},conc:{}};
  S.counters.s_arrive++; // this very load is an arrival
  const nowt=Date.now();
  // three upcoming conversations seeded for the demo ombuds workspace
  const addB=(oid,days,region,lang,camOff,tr,join,conn,hrs=18)=>{newContact({ombuds:oid,slot:nowt+days*DAY+hrs*3600e3,region,lang,camOff,trainee:tr,joining:join,connection:conn,door:'narrow',token:'seed'+oid+days})};
  addB('o1',3,'inN','hi',true,'no','me','none');
  addB('o1',6,'inE','bn',false,'yes','one','none',12);
  addB('o2',4,'lac','es',false,'no','me','rather',20);
}
function cnt(k,n=1){S.counters[k]=(S.counters[k]||0)+n; if(S.inspector)paintInspector()}
function stage(k){ if(!S.flow.reached[k]){S.flow.reached[k]=1;cnt(k)} }
const t=k=>(T[S.lang]&&T[S.lang][k])||T.en[k]||k;
const nowD=()=>Date.now()+S.staff.dayShift*DAY;

/* ===== formatting (localised) ===== */
const fmtU=(ms,off,loc,opts)=>new Intl.DateTimeFormat(loc,Object.assign({timeZone:'UTC'},opts)).format(new Date(ms+off*60000));
const fmtL=(ms,loc,opts)=>new Intl.DateTimeFormat(loc,opts).format(new Date(ms));
const loc=()=>LOCALE[S.lang]||'en-GB';
const O_DAY={weekday:'long',day:'numeric',month:'long'}, O_T={hour:'numeric',minute:'2-digit'};
const myTZ=()=>{try{return Intl.DateTimeFormat().resolvedOptions().timeZone||'your time zone'}catch(e){return 'your time zone'}};
const dayKey=ms=>fmtL(ms,'en-CA',{year:'numeric',month:'2-digit',day:'2-digit'});

/* ===== availability: 60-minute slots, 20-minute gap, 48h minimum notice, 5-week horizon ===== */
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0)}
const bookedSlots=new Set();
/* An ombuds opens "windows" (from–to, in their own time). Each window is cut into 80-minute cycles: a 60-minute slot, then a 20-minute gap.
   A typical week gives the default for each weekday; a date can carry its own windows (ovr) and single slots can be switched off (skip). */
const dkey=d=>d.toISOString().slice(0,10);
const windowsFor=(o,key,dow)=>(o.ovr&&o.ovr[key])||(o.tpl&&o.tpl[dow])||[];
function startsOf(ws){const out=[];ws.forEach(([s,e])=>{for(let m=s;m+SLOT<=e;m+=CYCLE)out.push(m)});return out.sort((a,b)=>a-b)}
const simBusy=(o,id)=>o.sim?hash(id)%100<28:(o.fixed||[]).includes(id); // demo: some slots already taken by other (imaginary) visitors
const localDays=(o,n=38)=>{const base=new Date(Date.now()+o.off*60000),a=[];for(let d=0;d<n;d++)a.push(new Date(Date.UTC(base.getUTCFullYear(),base.getUTCMonth(),base.getUTCDate()+d)));return a};
const slotUtc=(o,day,m)=>day.getTime()+m*60000-o.off*60000;
function slotsFor(o){
  const out=[],now=Date.now(),minT=now+48*3600e3,maxT=now+35*DAY;
  localDays(o).forEach(day=>{const key=dkey(day),skip=(o.skip&&o.skip[key])||[];
    startsOf(windowsFor(o,key,day.getUTCDay())).forEach(m=>{if(skip.includes(m))return;
      const utc=slotUtc(o,day,m);if(utc<minT||utc>maxT)return;const id=o.id+':'+utc;
      if(bookedSlots.has(id)||simBusy(o,id))return;out.push(utc)})});
  return out.sort((a,b)=>a-b);
}
const freeWithin=o=>{const s=slotsFor(o);return s.length?Math.max(2,Math.ceil((s[0]-Date.now())/DAY)):null};

/* ===== router ===== */
const ROUTES_PUBLIC=['home','book','how','think','serve','contact','urgent','privacy','stories'];
const isTicket=r=>r.startsWith('ticket/');
function route(){const h=(location.hash||'#home').slice(1);return h||'home'}
function go(r){if(location.hash!=='#'+r)location.hash='#'+r;render()}   // draw now; the hashchange that follows redraws the same page
function isStaff(r){return r.startsWith('staff')}
function render(){
  const r=route(); const app=$('#app'); if(!app)return;
  const me=r==='me', vis=!isStaff(r)&&!me;
  $('#demobar-seg').innerHTML=`<a href="#home" class="${vis?'on':''}">Visitor site</a><a href="#staff" class="${isStaff(r)?'on':''}">Behind the scenes</a><a href="#me" class="${me?'on':''}">Ombuds on a phone</a>`;
  $('#inspbtn').hidden=!vis;
  if(me) app.innerHTML=meView();
  else if(vis){ if(r==='home'&&!S.countedHome){S.countedHome=1}
    app.innerHTML=siteView(r);
  } else app.innerHTML=staffView(r);
  if(S.inspector)paintInspector();
  paintModal();
  document.title='ISKCON Resolve Prototype';
}
window.addEventListener('hashchange',()=>{render();window.scrollTo(0,0)});

/* ===== delegated events ===== */
const ACT={};
document.addEventListener('click',e=>{
  const a=e.target.closest('[data-act]'); if(!a)return;
  if(a.tagName==='A'&&!a.getAttribute('href'))e.preventDefault();
  const fn=ACT[a.dataset.act]; if(fn){fn(a,e)}
});
function setPath(obj,path,val){const p=path.split('.');let o=obj;for(let i=0;i<p.length-1;i++)o=o[p[i]];o[p[p.length-1]]=val}
document.addEventListener('input',e=>{const m=e.target.closest('[data-model]');if(!m)return;
  if(m.type==='checkbox')setPath(S,m.dataset.model,m.checked);else if(m.type!=='radio')setPath(S,m.dataset.model,m.value)});
document.addEventListener('change',e=>{const m=e.target.closest('[data-model]');if(!m)return;
  const v=m.type==='checkbox'?m.checked:m.value; setPath(S,m.dataset.model,v);
  if(m.dataset.model==='lang'){cnt('site_'+S.lang);S.flow.q.lang=LOCALE[S.lang]?S.lang:'en';document.documentElement.lang=S.lang}
  if(m.dataset.rerender!==undefined)render();
  if(m.dataset.rerender!==undefined&&m.dataset.focus){const el=document.getElementById(m.dataset.focus);if(el)el.focus()}
});
function modal(html){S.modal=html;paintModal()}
function paintModal(){let m=$('#modalhost');if(!m)return;m.innerHTML=S.modal?`<div class="modal" role="dialog" aria-modal="true" data-act="closeModalBg"><div>${S.modal}<div class="row" style="margin-top:1rem"><button class="btn primary" data-act="closeModal">Close</button></div></div></div>`:''}
ACT.closeModal=()=>{S.modal=null;paintModal()};
ACT.closeModalBg=(a,e)=>{if(e.target===a)ACT.closeModal()};
ACT.reset=()=>{init();history.replaceState(null,'',location.pathname+location.search);location.hash='#home';render();window.scrollTo(0,0)};

/* ===== privacy inspector (visitor side) ===== */
ACT.togInsp=()=>{S.inspector=!S.inspector;$('#insp').hidden=!S.inspector;if(S.inspector)paintInspector();$('#inspbtn').setAttribute('aria-expanded',S.inspector)};
function paintInspector(){
  const c=S.counters,g=k=>c[k]||0,rows=(arr)=>arr.map(([l,v])=>`<tr><td>${esc(l)}</td><td>${v}</td></tr>`).join('');
  const qs=Object.entries(LANGS).map(([k,l])=>['asked to speak '+l,g('q_lang_'+k)]);
  $('#insp').innerHTML=`<div class="row between"><h2 style="font-size:1.25rem">Privacy inspector</h2><button class="btn sm quiet" data-act="togInsp">Close</button></div>
  <p class="small muted">A window into what the system holds about a visit. This is a prototype aid, not part of the public site.</p>
  <h3>Requests this app has sent over the network</h3>
  <div class="row"><span class="bignum" id="netnum">${NET}</span><span class="small">No account, no cookie, no server call while you choose a person. Checked live: every fetch, XHR, beacon and WebSocket is counted.</span></div>
  <h3>What the system keeps while you browse</h3>
  <table><tbody>${rows([['arrivals (one anonymous page count)',g('s_arrive')],['chose “See everyone”',g('door_browse')],['chose “Help me narrow it down”',g('door_narrow')],['asked for a man',g('q_gen_m')],['asked for a woman',g('q_gen_f')],['no gender preference',g('q_gen_np')]].concat(qs.slice(0,5)))}</tbody></table>
  <p class="small muted" style="margin-top:.4rem">Each answer is its own counter. The combination of answers is never stored. Counters only ever go up; there is no row per visit.</p>
  <h3>Never kept</h3>
  <ul class="small" style="padding-left:1.1rem;margin:0"><li>which profiles you opened, or in what order</li><li>the combination of your three answers</li><li>the reason for a “no” to the trainee question (never asked)</li><li>what you say in the conversation (no recording, transcript or notes)</li></ul>
  <h3>Kept after booking</h3>
  <p class="small">One <b>contact-M</b> (when, with whom, your camera and trainee choices) and one <b>anonymous-user-N</b> (the region and language you chose). No name, no email, no phone number. Thirty days after your last conversation the exact time and your ticket are deleted.</p>
  <p class="small"><a href="#privacy">Read the short privacy note</a></p>`;
}
