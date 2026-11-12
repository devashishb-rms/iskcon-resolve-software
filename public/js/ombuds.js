/* ===== Ombuds onboarding: the admin panel (Behind the scenes) and the self-service screen (#me, built for a phone) =====
   Rule of thumb used throughout:
   - Availability, the monthly limit and taking a break take effect at once. They are the ombuds's own time.
   - Anything a visitor reads, or that decides who sees the profile, goes to the Project Manager for approval first.
   - The legal name is held for verification only. It is never part of the public profile and no visitor page reads it. */
const fm=m=>String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
const winText=w=>fm(w[0])+'–'+(w[1]===1440?'24:00':fm(w[1]));
const clone=x=>JSON.parse(JSON.stringify(x));
const FROMS=Array.from({length:37},(_,i)=>300+i*30), TOS=Array.from({length:37},(_,i)=>360+i*30);
const tzKeyOf=o=>(TZS.find(t=>t.off===o.off)||TZS[9]).k;
const COLS=['#0e5a66','#7a3e8f','#9a4a14','#1c6e4a','#2d5bb0','#a1306a','#4a5f7a','#b0561f'];
const fieldsOf=o=>clone({name:o.name||'',legal:o.legal||'',g:o.g||'',reg:o.reg||'',tz:tzKeyOf(o),speaks:o.speaks||'anyone',lvl:o.lvl||{},skills:o.skills||[],domains:o.domains||[],
  yrs:o.yrs||'',oyrs:o.oyrs||'',seva:o.seva||'',temple:o.temple||'',city:o.city||'',show:o.show||{seva:false,temple:false,city:false},
  exR:(o.exR||[]).filter(r=>r!==o.reg),exT:o.exT||[],bio:o.bio||''});
function applyFields(o,f){
  Object.assign(o,{name:f.name.trim(),legal:f.legal.trim(),g:f.g,reg:f.reg,speaks:f.speaks,lvl:clone(f.lvl),skills:[...f.skills],domains:[...f.domains],yrs:f.yrs,oyrs:f.oyrs,
    seva:f.seva,temple:f.temple.trim(),city:f.city.trim(),show:clone(f.show),exT:[...f.exT],bio:f.bio.trim()});
  o.langs=Object.keys(LANGS).filter(l=>['fluent','native'].includes(f.lvl[l])); // only “fluent” and “native” count for matching
  o.exR=[...new Set([f.reg,...f.exR].filter(Boolean))];                           // never shown to people from their own region
  const t=TZS.find(x=>x.k===f.tz)||TZS[9];o.off=t.off;o.tz=t.label;
}
function missing(f){const m=[];
  if(!f.name.trim())m.push('your name as devotees know you (diksha name)');if(!f.legal.trim())m.push('your legal name');if(!f.g)m.push('man or woman');
  if(!f.reg)m.push('your region');if(!Object.keys(LANGS).some(l=>['fluent','native'].includes(f.lvl[l])))m.push('at least one language you are fluent in');
  if(!f.skills.length)m.push('at least one skill');if(!f.yrs)m.push('years as a devotee');if(!f.oyrs)m.push('your experience helping with disputes');
  if(!f.seva)m.push('your current role or seva');if(f.bio.trim().length<40)m.push('a short introduction (at least 40 characters)');return m}
const changedFields=(o,f)=>{const cur=fieldsOf(o);return Object.keys(cur).filter(k=>JSON.stringify(cur[k])!==JSON.stringify(f[k]))};
const FIELD_LABEL={name:'Name (diksha)',legal:'Legal name',g:'Man or woman',reg:'Region',tz:'Time zone',speaks:'Speaks with',lvl:'Languages',skills:'Skills',domains:'Background',yrs:'Years as a devotee',oyrs:'Years helping with disputes',
  seva:'Current role or seva',temple:'Temple or community',city:'City',show:'Shown to visitors',exR:'Will not take matters from',exT:'Will not take matters about',bio:'Introduction'};
const showVal=(k,v)=>{if(k==='lvl')return Object.entries(v).filter(([,x])=>x).map(([l,x])=>`${LANGS[l]} (${x})`).join(', ')||'—';
  if(k==='show')return Object.entries(v).filter(([,x])=>x).map(([x])=>({seva:'role',temple:'temple',city:'city'}[x])).join(', ')||'nothing extra';
  if(k==='reg')return v?REG[v].label:'—';if(k==='exR')return v.map(r=>REG[r].label).join('; ')||'—';if(Array.isArray(v))return v.join('; ')||'—';if(k==='g')return {m:'man',f:'woman'}[v]||'—';return String(v||'—')};
const peopleAll=()=>[...OMBUDS,...ONBOARD];
const statusChip=o=>({live:['ok','Live'],invited:['warn','Invited'],review:['brand','Waiting for approval'],paused:['','On a break']}[o.status]||['',o.status]);
const typicalSlots=o=>Object.values(o.tpl||{}).reduce((a,w)=>a+startsOf(w).length,0);
function activate(o){const i=ONBOARD.indexOf(o);if(i>=0){ONBOARD.splice(i,1);OMBUDS.push(o)}o.status='live';if(!S.rot.includes(o.id))S.rot.push(o.id)}
/* The first time someone changes their availability, the demo's imaginary “already taken” slots are frozen, so new slots they open are really open. */
function touch(o){if(o.sim){const f=[];localDays(o).forEach(day=>{const key=dkey(day);startsOf(windowsFor(o,key,day.getUTCDay())).forEach(m=>{const id=o.id+':'+slotUtc(o,day,m);if(hash(id)%100<28)f.push(id)})});o.fixed=f;o.sim=false}}
function tryAdd(list,s,e){s=+s;e=+e;if(e-s<SLOT)return 'A window needs at least 60 minutes, because a conversation takes one hour.';
  for(const [a,b] of list)if(s<b+20&&e>a-20)return `That is too close to ${winText([a,b])}. Leave at least 20 minutes between windows, so there is a gap after each conversation.`;
  list.push([s,e]);list.sort((x,y)=>x[0]-y[0]);return null}

/* =================== Admin: onboarding =================== */
function sOnboard(){
  const all=peopleAll(),n=st=>all.filter(o=>o.status===st).length,queue=all.filter(o=>o.pending);
  const q=S.onb.mq,hits=OMBUDS.filter(o=>o.langs.includes(q.lang)&&!o.exR.includes(q.region)&&(q.gender==='np'||o.g===q.gender));
  const live=OMBUDS,cov=(arr,test)=>arr.map(x=>[x,live.filter(o=>test(o,x)).length]);
  const langCov=cov(Object.keys(LANGS),(o,l)=>o.langs.includes(l)),regCov=cov(REGIONS.map(r=>r.id),(o,r)=>o.reg===r),skCov=cov(SKILLS,(o,s)=>o.skills.includes(s)),dmCov=cov(DOMAINS,(o,s)=>o.domains.includes(s));
  const none=[...langCov.filter(x=>!x[1]).map(x=>LANGS[x[0]]),...regCov.filter(x=>!x[1]).map(x=>REG[x[0]].label)];
  const m=S.onb.msg;
  return `<div><h1>Ombuds onboarding</h1><p class="muted">Invite a new ombuds, review what people send in, and see who the panel covers. People fill in their own details on their phone; you approve what visitors will read.</p></div>
  <div class="row"><span class="chip brand">Tier: Project Manager</span><span class="chip ok">${n('live')} live</span><span class="chip warn">${n('invited')} invited</span><span class="chip ${queue.length?'brand':''}">${queue.length} waiting for approval</span><span class="chip">${n('paused')} on a break</span></div>
  <div class="card stack"><h2>Invite a new ombuds</h2>
   <p class="small muted">The invitation is an email with a private link. The person fills in everything else themselves. You never type their details for them, unless you choose to.</p>
   <div class="fieldrow"><div class="field"><label for="invn">Their name (for the email greeting)</label><input type="text" id="invn" data-model="onb.inv.name" value="${esc(S.onb.inv.name)}" autocomplete="off"></div>
   <div class="field"><label for="inve">Their email address</label><input type="email" id="inve" data-model="onb.inv.email" value="${esc(S.onb.inv.email)}" autocomplete="off"></div></div>
   <div class="row"><button class="btn primary" data-act="invite">Send invitation</button></div>
   ${m&&m.err?`<div class="callout bad" role="alert">${esc(m.err)}</div>`:''}
   ${m&&m.id?`<div class="callout ok" role="status"><b class="t">Invitation sent (simulated)</b><div class="email" style="margin-top:.6rem"><div class="hd"><div><b>To:</b> ${esc(m.email)}</div><div><b>Subject:</b> Your ISKCON Resolve ombuds profile</div></div><div class="bd"><p>Dear ${esc(m.name)}, please tell us about yourself and when you are free. It takes about ten minutes, and works on a phone: <span class="mono">…/#me</span></p><p>The link is private to you and works once you open it.</p></div></div>
    <div class="row" style="margin-top:.6rem"><button class="btn" data-act="openMe" data-id="${m.id}">Open it as ${esc(m.name)} would</button></div></div>`:''}</div>
  ${queue.length?`<div><h2>Waiting for your approval</h2><div class="stack">${queue.map(o=>reviewCard(o)).join('')}</div></div>`:`<div class="callout">Nothing is waiting for approval.</div>`}
  <div><h2>The panel</h2><p class="small muted">Legal names are visible on this page only. They appear nowhere on the visitor site, and mentors and other ombuds cannot see them.</p>
   <div class="scroll"><table class="t"><thead><tr><th>Name (diksha)</th><th>Legal name <span class="chip warn">admin only</span></th><th>Status</th><th>Languages</th><th>Based in</th><th>Role · temple</th><th>Complete</th><th>Times</th><th></th></tr></thead><tbody>
   ${all.map(o=>{const [c,l]=statusChip(o),f=o.draft||fieldsOf(o),mi=missing(o.status==='live'?fieldsOf(o):f).length,free=o.status==='live'?freeWithin(o):null;
    return `<tr data-id="${o.id}"><td><b>${esc(o.name||o.invitedAs||'—')}</b></td><td>${esc(o.legal||'—')}</td><td><span class="chip ${c}">${l}</span>${o.pending&&o.status==='live'?' <span class="chip brand">edit waiting</span>':''}</td>
    <td>${o.langs.length?o.langs.map(x=>LANGS[x]).join(', '):'—'}</td><td>${o.reg?esc(REG[o.reg].label):'—'}<div class="small muted">${esc(o.tz)}</div></td><td>${esc(o.seva||'—')}<div class="small muted">${esc(o.temple||'')}</div></td>
    <td>${mi?`<span class="chip warn">${mi} to do</span>`:'<span class="chip ok">complete</span>'}</td><td>${typicalSlots(o)} a week<div class="small muted">${o.status==='live'?(free?`next in ${free} days`:'no times'):'not live'}</div></td>
    <td><div class="stack" style="gap:.35rem"><button class="btn sm" data-act="openMe" data-id="${o.id}">Their screen</button><button class="btn sm" data-act="openMe" data-id="${o.id}" data-admin="1">Edit</button>${o.status==='live'?`<button class="btn sm quiet" data-act="pauseOm" data-id="${o.id}">Pause</button>`:o.status==='paused'?`<button class="btn sm quiet" data-act="resumeOm" data-id="${o.id}">Resume</button>`:''}</div></td></tr>`}).join('')}</tbody></table></div></div>
  <div><h2>Who the panel covers</h2><p class="small muted">Live ombuds only. A gap here means some visitors will meet an empty list: a recruitment signal.</p>
   ${none.length?`<div class="callout warn"><b class="t">Nobody yet for</b>${none.map(esc).join(', ')}</div>`:'<div class="callout ok">Every language and region has at least one person.</div>'}
   <div class="grid g2" style="margin-top:.8rem"><div class="card"><h3>Languages (fluent or native)</h3><div class="bars" style="margin-top:.5rem">${langCov.map(([l,v])=>bar3(LANGS[l],v,live.length,v?'':'warn')).join('')}</div></div>
   <div class="card"><h3>Where they are based</h3><div class="bars" style="margin-top:.5rem">${regCov.map(([r,v])=>bar3(REG[r].label,v,Math.max(3,...regCov.map(x=>x[1])),v?'':'warn')).join('')}</div></div>
   <div class="card"><h3>Skills</h3><div class="bars" style="margin-top:.5rem">${skCov.map(([s,v])=>bar3(s,v,live.length,v?'':'warn')).join('')}</div></div>
   <div class="card"><h3>Professional background</h3><div class="bars" style="margin-top:.5rem">${dmCov.map(([s,v])=>bar3(s,v,live.length,v?'':'warn')).join('')}</div></div></div></div>
  <div class="card stack"><h2>Check the matching</h2><p class="small muted">Try what a visitor would answer. This is exactly the filter the visitor site uses, run here so you can see whether a combination leaves someone with nobody to choose.</p>
   <div class="fieldrow">${fld('mq-l','Language','onb.mq.lang',Object.entries(LANGS),q.lang,1)}${fld('mq-r','Nearest region','onb.mq.region',REGIONS.map(r=>[r.id,r.label]),q.region,1)}${fld('mq-g','Wants to speak with','onb.mq.gender',[['np','No preference'],['m','A man'],['f','A woman']],q.gender,1)}</div>
   <div class="callout ${hits.length?'ok':'warn'}"><b class="t">${hits.length?hits.length+' '+(hits.length===1?'person':'people')+' would be shown':'Nobody would be shown'}</b>${hits.map(o=>esc(o.name)).join(' · ')||'This visitor would see an empty list and the “see everyone” option.'}</div></div>
  <div class="callout"><b class="t">How the details are used</b>The visitor sees three questions only: language, nearest region, and a man or a woman. Those three answers filter the list, using the languages, region and gender recorded here. Skills, background, experience and role are shown on each profile so the visitor can choose, but they do <b>not</b> filter, because filtering on them would mean asking what the matter is about before the call. The specification forbids that. <a href="#staff-build">Open question</a> if you want it changed.</div>`}
const bar3=(...a)=>bar(...a).replace('class="bar2"','class="bar2 stk"'); // label above the bar, for narrow cards
function reviewCard(o){const f=o.pending,ch=o.status==='live'?changedFields(o,f):Object.keys(FIELD_LABEL),cur=fieldsOf(o);
  return `<div class="card stack" data-review="${o.id}"><div class="row between"><div><b>${esc(f.name||o.invitedAs||'New ombuds')}</b> <span class="chip ${statusChip(o)[0]}">${statusChip(o)[1]}</span></div><span class="chip warn">Legal name: ${esc(f.legal||'—')} · admin only</span></div>
   <div class="scroll"><table class="t"><thead><tr><th>Field</th><th>Now</th><th>Proposed</th></tr></thead><tbody>${ch.map(k=>`<tr><td>${FIELD_LABEL[k]}</td><td>${o.status==='live'?esc(showVal(k,cur[k])):'—'}</td><td>${esc(showVal(k,f[k]))}</td></tr>`).join('')}</tbody></table></div>
   <div class="row"><button class="btn primary" data-act="approve" data-id="${o.id}">Approve${o.status==='live'?'':' and go live'}</button>
   <div class="field" style="min-width:230px;flex:1"><label for="sb-${o.id}" class="small">Or send back, because…</label><select id="sb-${o.id}" data-model="onb.reason.${o.id}">${['Please shorten your introduction','Please confirm your languages','Please complete the missing fields','The legal name does not match our records'].map(r=>`<option>${esc(r)}</option>`).join('')}</select></div>
   <button class="btn" data-act="sendBack" data-id="${o.id}">Send back</button></div></div>`}
ACT.invite=()=>{const i=S.onb.inv;if(!i.name.trim()){S.onb.msg={err:'Please give their name for the greeting.'};render();return}
  if(!/^\S+@\S+\.\S+$/.test(i.email.trim())){S.onb.msg={err:'That does not look like an email address.'};render();return}
  const id='o'+(Object.keys(OM).length+1),o={id,name:'',legal:'',g:'',reg:'',off:330,tz:'India (UTC+5:30)',langs:[],limit:2,days:[],start:18,n:2,exR:[],exT:[],speaks:'anyone',col:COLS[Object.keys(OM).length%COLS.length],w:0,bio:'',
    lvl:{},skills:[],domains:[],yrs:'',oyrs:'',seva:'',temple:'',city:'',show:{seva:false,temple:false,city:false},status:'invited',invitedAs:i.name.trim(),pending:null,draft:null,sim:false,fixed:[],skip:{},ovr:{},tpl:{}};
  ONBOARD.push(o);OM[id]=o;S.onb.msg={id,name:i.name.trim(),email:i.email.trim()};S.onb.inv={name:'',email:''};render()};
ACT.approve=a=>{const o=findOm(a.dataset.id);applyFields(o,o.pending);o.pending=null;o.draft=null;o.sentBack=null;if(o.status==='review'||o.status==='invited')activate(o);render()};
ACT.sendBack=a=>{const o=findOm(a.dataset.id),sel=document.getElementById('sb-'+o.id);o.sentBack=(sel&&sel.value)||'Please complete the missing fields';o.draft=o.pending;o.pending=null;if(o.status==='review')o.status='invited';render()};
ACT.pauseOm=a=>{const o=findOm(a.dataset.id);OMBUDS.splice(OMBUDS.indexOf(o),1);ONBOARD.push(o);o.status='paused';render()};
ACT.resumeOm=a=>{const o=findOm(a.dataset.id);activate(o);render()};
ACT.openMe=a=>{const o=findOm(a.dataset.id);S.me.id=o.id;S.me.asAdmin=!!a.dataset.admin;S.me.tab=o.status==='live'?'avail':'details';S.me.msg=null;S.me.errs=[];S.me.openDay=null;S.me.wk=0;location.hash='#me'};

/* =================== Self-service: built for a phone =================== */
function ensureForm(o){if(!o.draft)o.draft=fieldsOf(o.pending||o);S.me.form=o.draft}
function meView(){
  const o=findOm(S.me.id)||OMBUDS[0];S.me.id=o.id;ensureForm(o);const f=o.draft,[c,l]=statusChip(o),tab=S.me.tab;
  const tabs=[['avail','Availability'],['details','My details'],['preview','Preview']];
  return `<div class="me"><details class="card flat small protoctl"><summary><b>Prototype controls</b> (not part of the real screen)</summary><div class="stack" style="gap:.5rem;margin-top:.6rem"><div>In the live service this page opens from a private link in the invitation email, and shows only your own information.</div>
    <div class="fieldrow"><div class="field"><label for="meas">Open as</label><select id="meas" data-model="me.id" data-rerender data-focus="meas">${peopleAll().map(p=>`<option value="${p.id}" ${p.id===o.id?'selected':''}>${esc(p.name||p.invitedAs||p.id)} (${statusChip(p)[1].toLowerCase()})</option>`).join('')}</select></div>
    <label class="choice" style="align-self:end"><input type="checkbox" data-model="me.asAdmin" data-rerender ${S.me.asAdmin?'checked':''}><span>I am the Project Manager, editing for them</span></label></div></div></details>
   <header class="mehead"><div class="avatar" style="background:${o.col}" aria-hidden="true">${esc(initial(o)||'+')}</div><div><h1>${esc(o.name||'Welcome')}</h1><span class="chip ${c}">${l}</span>${S.me.asAdmin?' <span class="chip warn">Editing as Project Manager</span>':''}</div></header>
   ${o.status==='invited'&&!o.sentBack?`<div class="callout"><b class="t">Welcome${o.invitedAs?', '+esc(o.invitedAs):''}</b>Two short steps. Fill in <b>My details</b>, then say when you are free under <b>Availability</b>. Nothing is shown to visitors until the Project Manager approves it.</div>`:''}
   ${o.sentBack?`<div class="callout warn" role="status"><b class="t">Sent back</b>${esc(o.sentBack)}. Your answers are still here; change what you need and send again.</div>`:''}
   ${o.pending&&!S.me.asAdmin?`<div class="callout warn" role="status"><b class="t">Waiting for approval</b>${o.status==='live'?'Visitors still see your approved profile. Your changes go live once the Project Manager approves them.':'You will be told when you are live.'}</div>`:''}
   <div class="tabs" role="tablist">${tabs.map(([k,t])=>`<button role="tab" aria-selected="${tab===k}" class="${tab===k?'on':''}" data-act="meTab" data-t="${k}">${t}</button>`).join('')}</div>
   ${S.me.msg?`<div class="callout ok" role="status">${esc(S.me.msg)}</div>`:''}
   ${tab==='avail'?meAvail(o):tab==='details'?meDetails(o,f):mePreview(o,f)}</div>`}
ACT.meTab=a=>{S.me.tab=a.dataset.t;S.me.msg=null;render();window.scrollTo(0,0)};

/* ---- Availability ---- */
function weekDays(o,wk){const t=localDays(o,1)[0],off=(t.getUTCDay()+6)%7;return Array.from({length:7},(_,i)=>new Date(t.getTime()+(wk*7-off+i)*DAY))}
const dayLabel=(d,opt)=>new Intl.DateTimeFormat('en-GB',Object.assign({timeZone:'UTC'},opt)).format(d);
function chipsFor(o,day){
  const key=dkey(day),now=Date.now(),minT=now+48*3600e3,maxT=now+35*DAY,skip=(o.skip&&o.skip[key])||[],out=[],seen=new Set();
  startsOf(windowsFor(o,key,day.getUTCDay())).forEach(m=>{const utc=slotUtc(o,day,m),id=o.id+':'+utc;seen.add(utc);
    let st='on';if(bookedSlots.has(id)||simBusy(o,id))st='booked';else if(utc<now)st='past';else if(utc<minT)st='soon';else if(utc>maxT)st='far';else if(skip.includes(m))st='off';out.push({m,utc,st})});
  S.contacts.filter(b=>b.ombuds===o.id&&(b.state==='booked'||b.state==='held')&&b.slot).forEach(b=>{const loc=b.slot+o.off*60000;if(new Date(loc).toISOString().slice(0,10)===key&&!seen.has(b.slot))out.push({m:Math.round((loc%DAY)/60000),utc:b.slot,st:'booked'})});
  return out.sort((a,b)=>a.m-b.m)}
const chipHelp={on:'Open. Tap to close this time.',off:'Closed. Tap to open this time.',booked:'Booked. Cannot be changed.',soon:'Less than 48 hours away. Visitors cannot book it.',far:'More than 5 weeks away. Not yet open to visitors.',past:'In the past.'};
function meAvail(o){
  const open=slotsFor(o),v=S.me.view,wk=S.me.wk;
  const wkStart=weekDays(o,0)[0];
  const weekBtns=[0,1,2,3,4].map(i=>{const d=weekDays(o,i);return `<button class="wkbtn ${wk===i?'on':''}" data-act="meWk" data-i="${i}" aria-pressed="${wk===i}"><b>${i===0?'This week':i===1?'Next week':dayLabel(d[0],{day:'numeric',month:'short'})}</b><small>${dayLabel(d[0],{day:'numeric',month:'short'})}–${dayLabel(d[6],{day:'numeric',month:'short'})}</small></button>`}).join('');
  return `<div class="stack-lg"><div class="card stack" style="gap:.5rem"><div class="row between"><b id="opennow">${open.length} bookable ${open.length===1?'time':'times'} in the next 5 weeks</b><span class="chip ${open.length?'ok':'warn'}">${open.length?'Visible to visitors':'Visitors see “no times”'}</span></div>
    <p class="small muted">All times here are in your own time (${esc(o.tz)}); visitors see them in theirs. Each conversation is 60 minutes, followed by a 20-minute gap. Visitors can book a time no sooner than 48 hours ahead, and up to 5 weeks ahead.</p>
    ${S.me.asAdmin||o.status==='live'?'':'<p class="small"><b>Your availability goes live once your profile is approved.</b></p>'}</div>
   <div class="seg2" role="tablist"><button class="${v==='weeks'?'on':''}" data-act="meView" data-v="weeks" role="tab" aria-selected="${v==='weeks'}">Coming weeks</button><button class="${v==='typical'?'on':''}" data-act="meView" data-v="typical" role="tab" aria-selected="${v==='typical'}">My usual week</button></div>
   ${S.me.availMsg?`<div class="callout ${S.me.availMsg.err?'bad':'ok'}" role="status">${esc(S.me.availMsg.t)}</div>`:''}
   ${v==='weeks'?`<div class="wkbar" role="group" aria-label="Choose a week">${weekBtns}</div>${meWeek(o,wk)}
     <div class="card stack"><b>Repeat this week</b><div class="row"><div class="field" style="flex:1;min-width:9rem"><label for="copyn" class="small">Copy these exact times to the next</label><select id="copyn" data-model="me.copyN">${[1,2,3,4].map(n=>`<option value="${n}" ${+S.me.copyN===n?'selected':''}>${n} ${n===1?'week':'weeks'}</option>`).join('')}</select></div><button class="btn" data-act="meCopyWeek">Copy</button></div>
     <button class="btn danger" data-act="meAway">I am away this whole week</button></div>`:meTypical(o)}</div>`}
ACT.meView=a=>{S.me.view=a.dataset.v;S.me.availMsg=null;S.me.openDay=null;render()};
ACT.meWk=a=>{S.me.wk=+a.dataset.i;S.me.availMsg=null;S.me.openDay=null;render()};
function meWeek(o,wk){const days=weekDays(o,wk),todayKey=dkey(localDays(o,1)[0]);
  const hidden=days.filter(d=>dkey(d)<todayKey).length;
  return `<div class="stack">${hidden?`<p class="small muted">${hidden} earlier ${hidden===1?'day':'days'} this week not shown.</p>`:''}${days.filter(d=>dkey(d)>=todayKey).map(day=>{const key=dkey(day),past=false,chips=chipsFor(o,day),ws=windowsFor(o,key,day.getUTCDay()),isOpen=S.me.openDay===key,edited=!!(o.ovr[key]||(o.skip[key]||[]).length);
    return `<div class="card daycard ${past?'past':''}" data-date="${key}"><div class="row between"><h3>${dayLabel(day,{weekday:'long',day:'numeric',month:'short'})}</h3>${past?'<span class="chip">Past</span>':edited?'<span class="chip brand">Changed from usual</span>':''}</div>
     ${chips.length?`<div class="chips" role="group" aria-label="Times on ${dayLabel(day,{weekday:'long',day:'numeric',month:'long'})}">${chips.map(c=>{const can=c.st==='on'||c.st==='off';return `<button class="slotchip ${c.st}" ${can?`data-act="meSlot" data-date="${key}" data-m="${c.m}"`:'disabled'} data-state="${c.st}" aria-pressed="${c.st==='on'}" aria-label="${fm(c.m)} to ${fm(c.m+SLOT)}. ${chipHelp[c.st]}"><b>${fm(c.m)}</b><small>${c.st==='booked'?'booked':c.st==='soon'?'too soon':c.st==='far'?'later':c.st==='off'?'closed':c.st==='past'?'past':'open'}</small></button>`}).join('')}</div>`:`<p class="small muted">${past?'':'No times. Add hours below if you can be free.'}</p>`}
     ${past?'':`<div class="row"><button class="btn sm" data-act="meOpenDay" data-key="${key}" aria-expanded="${isOpen}">${isOpen?'Done':'Change hours'}</button>${ws.length||o.ovr[key]!==undefined?`<button class="btn sm quiet" data-act="meDayOff" data-key="${key}">Day off</button>`:''}${edited?`<button class="btn sm quiet" data-act="meReset" data-key="${key}">Back to my usual</button>`:''}</div>
     ${isOpen?winEditor(o,ws,'d',key,day.getUTCDay()):''}`}</div>`}).join('')}</div>`}
function winEditor(o,ws,kind,key,dow){const w=S.me.win;
  return `<div class="wineditor"><div class="chips">${ws.map((x,i)=>`<span class="winchip">${winText(x)} <small>${startsOf([x]).length} ${startsOf([x]).length===1?'time':'times'}</small><button class="x" data-act="meDelWin" data-kind="${kind}" data-key="${key}" data-dow="${dow}" data-i="${i}" aria-label="Remove ${winText(x)}">✕</button></span>`).join('')||'<span class="small muted">No hours yet.</span>'}</div>
   <div class="fieldrow"><div class="field"><label for="wf-${kind}${key}" class="small">Free from</label><select id="wf-${kind}${key}" data-model="me.win.from">${FROMS.map(m=>`<option value="${m}" ${+w.from===m?'selected':''}>${fm(m)}</option>`).join('')}</select></div>
   <div class="field"><label for="wt-${kind}${key}" class="small">until</label><select id="wt-${kind}${key}" data-model="me.win.to">${TOS.map(m=>`<option value="${m}" ${+w.to===m?'selected':''}>${m===1440?'24:00':fm(m)}</option>`).join('')}</select></div></div>
   <p class="small muted">The system fits as many 60-minute conversations as it can into these hours, with a 20-minute gap after each: ${startsOf([[+w.from,+w.to]]).map(fm).join(', ')||'none (needs at least 60 minutes)'}.</p>
   <button class="btn primary sm" data-act="meAddWin" data-kind="${kind}" data-key="${key}" data-dow="${dow}">Add these hours</button></div>`}
function winTarget(o,a){const dow=+a.dataset.dow,key=a.dataset.key;
  if(a.dataset.kind==='t'){o.tpl[dow]=o.tpl[dow]||[];return o.tpl[dow]}
  if(!o.ovr[key])o.ovr[key]=clone(o.tpl[dow]||[]);return o.ovr[key]}
ACT.meOpenDay=a=>{S.me.openDay=S.me.openDay===a.dataset.key?null:a.dataset.key;S.me.availMsg=null;render()};
ACT.meAddWin=a=>{const o=findOm(S.me.id);touch(o);const list=winTarget(o,a),err=tryAdd(list,S.me.win.from,S.me.win.to);
  if(err&&a.dataset.kind==='d'&&!(clone(list).length))delete o.ovr[a.dataset.key];S.me.availMsg=err?{err:1,t:err}:{t:'Hours added.'};render()};
ACT.meDelWin=a=>{const o=findOm(S.me.id);touch(o);const list=winTarget(o,a);list.splice(+a.dataset.i,1);S.me.availMsg=null;render()};
ACT.meSlot=a=>{const o=findOm(S.me.id);touch(o);const k=a.dataset.date,m=+a.dataset.m,sk=o.skip[k]=o.skip[k]||[];
  if(sk.includes(m))sk.splice(sk.indexOf(m),1);else sk.push(m);if(!sk.length)delete o.skip[k];S.me.availMsg=null;render();
  const el=document.querySelector(`.slotchip[data-date="${k}"][data-m="${m}"]`);if(el)el.focus()};
ACT.meDayOff=a=>{const o=findOm(S.me.id);touch(o);o.ovr[a.dataset.key]=[];delete o.skip[a.dataset.key];S.me.availMsg=null;render()};
ACT.meReset=a=>{const o=findOm(S.me.id);touch(o);delete o.ovr[a.dataset.key];delete o.skip[a.dataset.key];S.me.availMsg=null;render()};
ACT.meCopyWeek=()=>{const o=findOm(S.me.id);touch(o);const src=weekDays(o,S.me.wk),n=+S.me.copyN;let done=0;
  for(let k=1;k<=n;k++){const tgt=weekDays(o,S.me.wk+k);src.forEach((d,i)=>{const sk=dkey(d),tk=dkey(tgt[i]);if(o.ovr[sk])o.ovr[tk]=clone(o.ovr[sk]);else delete o.ovr[tk];
    if(o.skip[sk])o.skip[tk]=clone(o.skip[sk]);else delete o.skip[tk]});done++}
  S.me.availMsg={t:`Copied to the next ${done} ${done===1?'week':'weeks'}. Times beyond 5 weeks open to visitors as the calendar moves on.`};render()};
ACT.meAway=()=>{const o=findOm(S.me.id);touch(o);const todayKey=dkey(localDays(o,1)[0]);weekDays(o,S.me.wk).forEach(d=>{const k=dkey(d);if(k>=todayKey){o.ovr[k]=[];delete o.skip[k]}});S.me.availMsg={t:'This week is marked as away. Existing bookings stay.'};render()};
function meTypical(o){const w=S.me.win;
  return `<div class="stack"><p class="small muted">Your usual week repeats every week. Change a particular week under “Coming weeks”.</p>
   ${WEEK_ORDER.map(dow=>{const ws=o.tpl[dow]||[],id='t'+dow,isOpen=S.me.openDay===id;return `<div class="card daycard" data-dow="${dow}"><div class="row between"><h3>${DOW[dow]}</h3><span class="chip ${ws.length?'ok':''}">${startsOf(ws).length} ${startsOf(ws).length===1?'time':'times'}</span></div>
    <div class="chips">${ws.map((x,i)=>`<span class="winchip">${winText(x)} <small>${startsOf([x]).length} ${startsOf([x]).length===1?'time':'times'}</small><button class="x" data-act="meDelWin" data-kind="t" data-dow="${dow}" data-key="" data-i="${i}" aria-label="Remove ${winText(x)} on ${DOW[dow]}">✕</button></span>`).join('')||'<span class="small muted">Not available</span>'}</div>
    <div class="row"><button class="btn sm" data-act="meOpenDay" data-key="${id}" aria-expanded="${isOpen}">${isOpen?'Done':'Add hours'}</button></div>
    ${isOpen?winEditor(o,[],'t','',dow).replace(/<div class="chips">.*?<\/div>/s,''):''}</div>`}).join('')}
   <div class="card stack"><b>Same hours on other days</b><div class="fieldrow"><div class="field"><label for="apf" class="small">Copy the hours of</label><select id="apf" data-model="me.applyFrom">${WEEK_ORDER.map(d=>`<option value="${d}" ${+S.me.applyFrom===d?'selected':''}>${DOW[d]}</option>`).join('')}</select></div>
    <div class="field"><label for="apt" class="small">to</label><select id="apt" data-model="me.applyTo">${[['weekdays','Monday to Friday'],['weekend','Saturday and Sunday'],['all','Every day']].map(([k,l])=>`<option value="${k}" ${S.me.applyTo===k?'selected':''}>${l}</option>`).join('')}</select></div></div>
    <button class="btn" data-act="meApply">Copy</button></div></div>`}
ACT.meApply=()=>{const o=findOm(S.me.id);touch(o);const from=o.tpl[+S.me.applyFrom]||[],set={weekdays:[1,2,3,4,5],weekend:[6,0],all:[0,1,2,3,4,5,6]}[S.me.applyTo];
  set.forEach(d=>{if(d!==+S.me.applyFrom)o.tpl[d]=clone(from)});S.me.availMsg={t:'Copied.'};render()};

/* ---- My details ---- */
function pickRow(k,vals,cur){return `<div class="chips" role="group">${vals.map(v=>`<button type="button" class="pick ${cur.includes(v)?'on':''}" aria-pressed="${cur.includes(v)}" data-act="mePick" data-k="${k}" data-v="${esc(v)}">${esc(v)}</button>`).join('')}</div>`}
ACT.mePick=a=>{const arr=S.me.form[a.dataset.k],v=a.dataset.v;arr.includes(v)?arr.splice(arr.indexOf(v),1):arr.push(v);render()};
function meDetails(o,f){const miss=missing(f),own=S.me.errs;
  return `<div class="stack-lg">
   ${own&&own.length?`<div class="callout bad" role="alert"><b class="t">Please add</b>${own.map(esc).join('; ')}.</div>`:''}
   <fieldset class="card stack"><legend class="legend">Who you are</legend>
    <div class="field"><label for="f-name">Your name as devotees know you (diksha name)</label><input type="text" id="f-name" data-model="me.form.name" value="${esc(f.name)}" autocomplete="off"><span class="small muted">Shown to visitors.</span></div>
    <div class="field"><label for="f-legal">Your legal name</label><input type="text" id="f-legal" data-model="me.form.legal" value="${esc(f.legal)}" autocomplete="off"><span class="small muted"><b>Never shown to visitors.</b> Seen only by the Project Manager and Director, to confirm who you are.</span></div>
    <fieldset class="nofs"><legend class="legend small">Are you a man or a woman?</legend><div class="choices2">${[['m','A man'],['f','A woman']].map(([v,l])=>`<label class="choice"><input type="radio" name="f-g" value="${v}" data-model="me.form.g" ${f.g===v?'checked':''}><span>${l}</span></label>`).join('')}</div><span class="small muted">Visitors can ask to speak with a man or a woman. This is how that works.</span></fieldset>
    ${fld('f-speaks','You speak with','me.form.speaks',[['anyone','Anyone'],['women','Women only']],f.speaks)}</fieldset>
   <fieldset class="card stack"><legend class="legend">Where you are</legend>
    ${fld('f-reg','Your region','me.form.reg',[['','Choose…'],...REGIONS.map(r=>[r.id,r.label])],f.reg)}
    <div class="field"><label for="f-city">City</label><input type="text" id="f-city" data-model="me.form.city" value="${esc(f.city)}" autocomplete="off"></div>
    <div class="field"><label for="f-temple">Temple or community you are associated with</label><input type="text" id="f-temple" data-model="me.form.temple" value="${esc(f.temple)}" autocomplete="off"></div>
    ${fld('f-tz','Your time zone','me.form.tz',TZS.map(t=>[t.k,t.label]),f.tz)}
    <p class="small muted">Changing your time zone moves your availability with it.</p></fieldset>
   <fieldset class="card stack"><legend class="legend">Languages you can hold a hard conversation in</legend>
    <p class="small muted">Visitors are matched on “Fluent” and “Native”. “Working knowledge” is shown to nobody and counts for nothing.</p>
    <div class="langgrid">${Object.entries(LANGS).map(([k,n])=>`<label for="lv-${k}">${n}</label><select id="lv-${k}" data-model="me.form.lvl.${k}">${LVL.map(([v,l])=>`<option value="${v}" ${(f.lvl[k]||'')===v?'selected':''}>${l}</option>`).join('')}</select>`).join('')}</div></fieldset>
   <fieldset class="card stack"><legend class="legend">What you bring</legend>
    <div><b class="small">Skills</b>${pickRow('skills',SKILLS,f.skills)}</div>
    <div><b class="small">Professional background</b>${pickRow('domains',DOMAINS,f.domains)}</div>
    <div class="fieldrow">${fld('f-yrs','Years as a practising devotee','me.form.yrs',[['','Choose…'],...YRS],f.yrs)}${fld('f-oyrs','Years helping people through disputes (any setting)','me.form.oyrs',[['','Choose…'],...OYRS],f.oyrs)}</div></fieldset>
   <fieldset class="card stack"><legend class="legend">Your role in ISKCON</legend>
    ${fld('f-seva','Current role, designation or seva','me.form.seva',[['','Choose…'],...SEVAS],f.seva)}
    <div class="stack" style="gap:.4rem"><b class="small">Show these on my public profile?</b>${[['seva','My role'],['temple','My temple or community'],['city','My city']].map(([k,l])=>`<label class="choice"><input type="checkbox" data-model="me.form.show.${k}" ${f.show[k]?'checked':''}><span>${l}</span></label>`).join('')}<span class="small muted">Off by default: some visitors prefer someone who is not known in their community. The Project Manager always sees them.</span></div></fieldset>
   <fieldset class="card stack"><legend class="legend">Who you will not see matters from</legend>
    <div><b class="small">Regions (your own is always included)</b>${pickRow('exR',REGIONS.filter(r=>r.id!==f.reg).map(r=>r.id),f.exR).replace(/data-v="([^"]+)">[^<]*</g,(m,id)=>`data-v="${id}">${esc(REG[id].label)}<`)}</div>
    <div><b class="small">Subjects you cannot take</b>${pickRow('exT',TOPIC_EXCL,f.exT)}<span class="small muted">Shown on your profile as a notice. They are never applied to filter visitors, because applying them would mean asking what the matter is about.</span></div>
    <div class="field"><label for="f-limit">Most conversations you can take in a month</label><select id="f-limit" data-limit="${o.id}">${[1,2,3,4,5,6,8].map(n=>`<option value="${n}" ${+o.limit===n?'selected':''}>${n}</option>`).join('')}</select><span class="small muted">This takes effect straight away.</span></div></fieldset>
   <fieldset class="card stack"><legend class="legend">A short introduction</legend>
    <div class="field"><label for="f-bio" class="small">In your own words, in your own language. It is shown as you write it and never machine-translated.</label><textarea id="f-bio" rows="5" maxlength="500" data-model="me.form.bio">${esc(f.bio)}</textarea><span class="small muted">40 to 500 characters.</span></div></fieldset>
   <div class="stack">${S.me.asAdmin?'<p class="small muted">As Project Manager, saving applies at once.</p>':'<p class="small muted">Visitors see your changes once the Project Manager approves them. Availability and your monthly limit do not need approval.</p>'}
    <div class="row"><button class="btn primary" data-act="meSubmit">${S.me.asAdmin?'Save':o.status==='live'?'Send my changes for approval':'Send for approval'}</button><button class="btn quiet" data-act="meDiscard">Discard my edits</button></div>
    ${miss.length?`<p class="small muted">Still to fill in: ${miss.map(esc).join('; ')}.</p>`:''}</div></div>`}
ACT.meSubmit=()=>{const o=findOm(S.me.id),f=o.draft,miss=missing(f);S.me.msg=null;
  if(miss.length){S.me.errs=miss;render();return}S.me.errs=[];
  if(+o.limit<1)o.limit=2;
  if(S.me.asAdmin){applyFields(o,f);o.pending=null;o.draft=null;if(o.status==='review'||o.status==='invited')activate(o);S.me.msg='Saved.'}
  else if(o.status==='live'&&!changedFields(o,f).length){S.me.msg='Nothing has changed.'}
  else{o.pending=clone(f);o.draft=null;o.sentBack=null;if(o.status==='invited')o.status='review';S.me.msg='Sent. The Project Manager will look at it. You will hear back.'}
  render();window.scrollTo(0,0)};
ACT.meDiscard=()=>{const o=findOm(S.me.id);o.draft=null;S.me.errs=[];S.me.msg='Edits discarded.';render()};

/* ---- Preview ---- */
function mePreview(o,f){const t=Object.assign({},o);applyFields(t,f);t.status='live';
  return `<div class="stack-lg"><p class="small muted">This is how a visitor sees you on the list${o.status==='live'&&JSON.stringify(fieldsOf(o))!==JSON.stringify(f)?', once your changes are approved':''}.</p>
   <div class="previewcard">${profileCard(t,false)}</div>
   <div class="card stack"><h3>Who sees what</h3><div class="scroll"><table class="t"><tbody>
    <tr><td><b>Visitors</b></td><td>Your name, languages, region, introduction, skills, background, experience, and the notices about regions and subjects${f.show.seva||f.show.temple||f.show.city?', plus what you chose to show':''}.</td></tr>
    <tr><td><b>Project Manager and Director</b></td><td>All of the above, and your legal name, role, temple and city.</td></tr>
    <tr><td><b>Nobody else</b></td><td>Other ombuds, mentors and developers do not see your legal name.</td></tr></tbody></table></div></div>
   <div class="card stack"><h3>When you will be shown</h3>${t.langs.length&&t.reg?`<p>To a visitor who asks for <b>${t.langs.map(l=>LANGS[l]).join(', ')}</b>, from anywhere except <b>${t.exR.map(r=>REG[r].label).join('; ')}</b>${f.g?`, who wants ${f.g==='m'?'a man':'a woman'} or has no preference`:''}.</p>`:'<p class="muted">Add a language and a region and this will fill in.</p>'}</div></div>`}

/* Test hook: the whole public profile a visitor can ever read, derived the same way the cards are. */
function publicProfile(o){return{name:o.name,langs:o.langs,reg:o.reg,bio:o.bio,skills:o.skills,domains:o.domains,yrs:o.yrs,oyrs:o.oyrs,exR:o.exR,exT:o.exT,...(o.show.seva?{seva:o.seva}:{}),...(o.show.temple?{temple:o.temple}:{}),...(o.show.city?{city:o.city}:{})}}

document.addEventListener('change',e=>{const l=e.target.closest&&e.target.closest('[data-limit]');if(l){const p=findOm(l.dataset.limit);if(p)p.limit=+l.value}});
