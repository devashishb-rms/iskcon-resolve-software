/* ===== Visitor site ===== */
const LOGO=`<svg width="30" height="26" viewBox="0 0 30 26" aria-hidden="true"><circle cx="11" cy="13" r="9" fill="none" stroke="var(--brand)" stroke-width="2.5"/><circle cx="19" cy="13" r="9" fill="none" stroke="var(--ink)" stroke-width="2.5"/></svg>`;
function siteView(r){
  const pages={home:pHome,book:pBook,how:pHow,think:pThink,serve:pServe,contact:pContact,urgent:pUrgent,privacy:pPrivacy,stories:pStories,survey:pSurvey};
  const body=isTicket(r)?pTicket(r.slice(7)):(pages[r]||pHome)();
  const note=S.lang!=='en'?`<div class="callout warn small" style="margin-bottom:1.25rem"><b class="t">Prototype note</b>Only the headline strings are translated here, and they have not been reviewed by a language owner. The real build localises every string and version-locks the consent copy across all five languages (see Behind the scenes → Build and open questions).</div>`:'';
  return `<header class="site"><div class="wrap bar">
    <a class="brand" href="#home">${LOGO}<span>ISKCON <b>Resolve</b></span></a>
    <nav class="main" aria-label="Main">${[['book','nav_talk'],['how','nav_how'],['think','nav_think'],['serve','nav_serve'],['contact','nav_contact']].map(([x,k],i)=>`<a href="#${x}" class="${i===0?'btn primary sm':''} ${r===x?'on':''}" ${r===x?'aria-current="page"':''}>${t(k)}</a>`).join('')}</nav>
    <label class="langsel"><span class="sr">Language</span><select id="langsel" data-model="lang" data-rerender data-focus="langsel" aria-label="Language">${UI_LANGS.map(([k,n])=>`<option value="${k}" ${S.lang===k?'selected':''}>${n}</option>`).join('')}</select></label>
  </div>${r!=='urgent'?`<div class="urgentstrip"><div class="wrap">${t('urgent_strip')} <a href="#urgent">${t('urgent_link')}</a></div></div>`:''}</header>
  <main class="page"><div class="wrap">${note}${body}</div></main>
  <footer class="site"><div class="wrap"><a href="#stories">Stories</a><a href="#urgent">Urgent help</a><a href="#privacy">Privacy</a><a href="#contact">For referrers</a><p style="margin-top:.7rem">ISKCON Resolve · confidential ombuds and conflict resolution for the ISKCON community worldwide · established 2002 under charter from the GBC. Prototype with fictional sample people and data.</p></div></footer>`;
}

/* ---------- Home (spec 5.1) ---------- */
function pHome(){return `
 <section class="hero"><div class="stack"><h1>${t('hero_h')}</h1>
  <p>${t('hero_p1')}</p><p>${t('hero_p2')}</p><p class="muted">${t('hero_p3')}</p>
  <p><a class="btn primary" href="#book">${t('cta_find')}</a></p></div>
  <aside class="promise" aria-labelledby="prom"><h2 id="prom">${t('conf_h')}</h2><p>${t('conf_p1')}</p><p class="limit">${t('conf_p2')}</p></aside></section>
 <section class="sec"><h2>Established 2002, under charter from the GBC</h2><p style="max-width:62ch">Independent of temple management. Our director founded the ombuds programmes at the US Department of the Interior and at Ashoka University, serves on the board of the International Ombudsman Association, and has trained over 400 mediators.</p></section>
 <section class="sec"><div class="cols3">
  <div><h3>You choose who you speak to</h3><p>See the whole panel, with their languages, where they are, and the communities they will not take matters from. Pick whoever feels right.</p></div>
  <div><h3>In your language, all the way through</h3><p>Choose a language at the top of the page and everything follows — the booking screens and your ticket. And you choose separately what language you want to speak in.</p></div>
  <div><h3>Nothing happens unless you decide it should</h3><p>An ombuds cannot rule on anything or make anyone do anything. That is what makes it safe to tell them things.</p></div></div></section>
 <section class="sec"><div class="grid g2"><div class="stack"><h2>We never ask who you are.</h2>
   <p>Some people are comfortable using their own name. Others are not, and have good reasons. Here you do not have to choose: there is nowhere to type a name, an email address or a phone number.</p></div>
  <div class="stack"><div class="card"><b>No name, no email, no phone.</b> We ask only which part of the world you are in and which language you would like to speak. Nothing else identifies you.</div>
   <div class="card"><b>A private link instead of an email.</b> When you book you get a ticket link. It holds your booking, a calendar file and the video link. It stays on your device. We cannot send it to you, so we cannot lose it to anyone else.</div>
   <div class="card"><b>Stay off camera.</b> Say so when you book. Your ombuds will know beforehand, and will stay on camera themselves unless you ask otherwise — so you are not speaking into the dark.</div>
   <p class="small muted">One practical thing: keep your ticket link. It is the only way back to your booking, and we have no way to find it for you.</p></div></div></section>`}

/* ---------- How it works (spec 5.2) ---------- */
function pHow(){return `<div class="stack-lg" style="max-width:760px"><div class="stack"><h1>It is an unfamiliar word for a simple thing.</h1>
 <p>An ombuds sits outside the structure. They do not work for your temple, your authority, or the person you are in conflict with. They do not work for the people who might investigate it either.</p>
 <p>Their job is to listen properly, help you see the situation more clearly, and set out what you could do next — including options you had not thought of, and the ones that involve doing nothing for now.</p></div>
 <div class="grid g2"><div class="card"><h3>What they will do</h3><ul><li>Listen, without needing you to prove anything.</li><li>Ask questions that help you think, not questions that build a case.</li><li>Explain what happens on each path available to you.</li><li>Tell you honestly if something is outside what they can help with.</li></ul></div>
 <div class="card"><h3>What they will not do</h3><ul><li>Investigate, gather evidence, or speak to anyone else.</li><li>Take sides, including yours.</li><li>Report to temple leadership, or to anyone.</li><li>Decide what happens next.</li></ul></div></div>
 <p>That last one matters most. People sometimes arrive hoping an ombuds will rule on things. They cannot. What they can do is make sure you know exactly what your choices are before you make one.</p>
 <section><h2>The four principles</h2><div class="grid g2" style="margin-top:.8rem">${[['Independence','We sit outside the management chain. We are not an arm of temple leadership.'],['Impartiality','We are for fair process, not for either side.'],['Confidentiality','We do not disclose, and ISKCON cannot make us. Including our own director.'],['Informality','No investigations, no records kept on ISKCON’s behalf, no binding decisions.']].map(([a,b])=>`<div class="card flat"><b>${a}.</b> ${b}</div>`).join('')}</div><p class="muted" style="margin-top:.8rem">Speaking with an ombuds is voluntary. Nobody should ever be required to.</p></section>
 <section><h2>Questions people ask</h2>${[['Who will know what I say — or that I came here at all?','Nobody. We keep no record that identifies you. Your ombuds keeps private notes while your matter is live and destroys them when it closes. We never ask for your name, email or phone number. What the system keeps is a number for you (anonymous-user-N), a number for the contact, your region and language, and the time. Thirty days after your last conversation the exact time is deleted too.'],['Can I do this in my own language?','Yes. Choose a language at the top of any page and the whole site follows — the questions, the booking screens and your ticket. What language you want to speak in is asked separately, because for many people it is not the same one.'],['Can I do this without you knowing who I am?','Yes, completely. You are never asked for a name, an email address or a phone number, so there is nothing to invent. You can also tick the box at booking to keep your camera off. Your ombuds will not know who you are until you choose to tell them.'],['What happens afterwards?','Whatever you decide. Most people leave with a clearer sense of their options and take a few weeks to think. Your ticket page then offers a short survey about how it went, and a way back to the same person. We cannot write to you, so nothing will arrive unasked. There is no limit on how many times you come back.'],['I am worried I might get emotional.','Most people do. It is an hour about something that has probably been sitting with you for a long time. There is nothing to apologise for, and your ombuds will not be surprised.'],['My situation is complicated. I do not know where to begin.','Then begin anywhere. You do not need to start at the beginning or tell it in order. Working out the shape of it is part of what the conversation is for.']].map(([q,a])=>`<details class="card" style="margin-top:.6rem"><summary><b>${q}</b></summary><p style="margin-top:.6rem">${a}</p></details>`).join('')}</section>
 <p><a class="btn primary" href="#book">${t('cta_find')}</a></p></div>`}

/* ---------- Booking flow (spec 2.2, 5.3) ---------- */
const initial=o=>[...o.name][0];
function profileCard(o,choose){
  const free=freeWithin(o);
  return `<article class="profile"><div class="avatar" style="background:${o.col}" aria-hidden="true">${esc(initial(o))}</div><div>
   <div class="row between"><h3>${esc(o.name)}</h3><span class="chip ${free?'':'warn'}">${free?`Usually free within ${free} days`:'No times in the next 5 weeks'}</span></div>
   <div class="row" style="gap:.35rem;margin-top:.35rem">${o.langs.map(l=>`<span class="chip brand">${LANGS[l]}</span>`).join('')}</div>
   <p class="bio">“${esc(o.bio)}”</p>
   <dl><dt>Based in</dt><dd>${esc((REG[o.reg]||{label:'—'}).label)}${o.show&&o.show.city&&o.city?', '+esc(o.city):''}</dd>
   <dt>Speaks with</dt><dd>${o.speaks==='women'?'Women':'Anyone'}</dd>
   ${o.skills&&o.skills.length?`<dt>Strengths</dt><dd>${o.skills.map(esc).join('; ')}</dd>`:''}${o.domains&&o.domains.length?`<dt>Background</dt><dd>${o.domains.map(esc).join('; ')}</dd>`:''}${o.yrs?`<dt>Experience</dt><dd>${esc(o.yrs)} years as a practising devotee${o.oyrs&&o.oyrs!=='none'?'; '+esc(o.oyrs)+' years helping people through disputes':'; new to this kind of work'}</dd>`:''}${o.show&&o.show.seva&&o.seva?`<dt>Role in ISKCON</dt><dd>${esc(o.seva)}</dd>`:''}${o.show&&o.show.temple&&o.temple?`<dt>Temple</dt><dd>${esc(o.temple)}</dd>`:''}
   <dt>Will not take matters from</dt><dd>${o.exR.map(r=>REG[r].label).join('; ')||'—'}</dd>
   <dt>Will not take matters about</dt><dd>${o.exT.join('; ')||'—'}</dd></dl>
   ${choose?`<div class="acts"><button class="btn primary" data-act="choose" data-id="${o.id}">Choose ${esc(o.name.split(' ')[0])}</button></div>`:''}</div></article>`}

function pBook(){
  const f=S.flow, idx={door:0,q:0,pick:1,conn:1,time:2,confirm:3}[f.step]??4;
  const labels=['Start','Choose a person','Choose a time','Confirm'];
  const views={door:vDoor,q:vQ,pick:vPick,conn:vConn,time:vTime,confirm:vConfirm};
  return `<ol class="stepsbar" aria-label="Progress">${labels.map((l,i)=>`<li class="${i===idx?'on':i<idx?'done':''}" ${i===idx?'aria-current="step"':''}>${l}</li>`).join('')}</ol>${(views[f.step]||vDoor)()}`;
}
function vDoor(){return `<div class="stack-lg"><h1>${t('door_h')}</h1>
 <div class="doors"><button class="door" data-act="door" data-d="browse"><h3>${t('door_see_h')}</h3><span>${t('door_see')}</span></button>
 <button class="door" data-act="door" data-d="narrow"><h3>${t('door_narrow_h')}</h3><span>${t('door_narrow')}</span></button></div>
 <div class="callout"><b class="t">What we will not ask</b>${t('door_note')}</div>
 <p class="small muted">Both doors are styled identically on purpose. The system only records which one you used, and whether it ended in a booking. That answer decides, at six months, whether the guided questionnaire earns its place.</p></div>`}
ACT.door=a=>{const f=S.flow;f.door=a.dataset.d;cnt('door_'+f.door);stage('s_door');
  if(f.door==='browse'){f.list=S.rot.map(id=>OM[id]).filter(isLive);f.step='pick'}else f.step='q'; render();window.scrollTo(0,0)};

function vQ(){const f=S.flow,q=f.q;return `<div class="stack-lg" style="max-width:640px"><h1>Three questions</h1>
 <p class="muted">The people who fit are worked out on your own device. Nothing you choose here leaves it.</p>
 <div class="field"><label for="q1">${t('q1')}</label><select id="q1" data-model="flow.q.lang">${Object.entries(LANGS).map(([k,n])=>`<option value="${k}" ${q.lang===k?'selected':''}>${n}</option>`).join('')}</select></div>
 <div class="field"><label for="q2">${t('q2')}</label><select id="q2" data-model="flow.q.region"><option value="">Choose…</option>${REGIONS.map(r=>`<option value="${r.id}" ${q.region===r.id?'selected':''}>${r.label}</option>`).join('')}</select>${f.err.region?`<span class="err">${f.err.region}</span>`:''}</div>
 <fieldset style="border:0;padding:0;margin:0"><legend class="legend">${t('q3')}</legend><div class="choices" style="margin-top:.5rem">${[['m','man'],['f','woman'],['np','nopref']].map(([v,k])=>`<label class="choice"><input type="radio" name="q3" value="${v}" data-model="flow.q.gender" ${q.gender===v?'checked':''}><span>${t(k)}</span></label>`).join('')}</div>${f.err.gender?`<span class="err">${f.err.gender}</span>`:''}</fieldset>
 <div class="row"><button class="btn quiet" data-act="toDoor">${t('back')}</button><button class="btn primary" data-act="match">Show me the people who fit</button></div></div>`}
ACT.toDoor=()=>{S.flow.step='door';S.flow.err={};render()};
ACT.match=()=>{const f=S.flow,q=f.q;f.err={};if(!q.region)f.err.region='Please choose the nearest region.';if(!q.gender)f.err.gender='Please choose one — “No preference” is a fine answer.';
  if(Object.keys(f.err).length){render();return}
  const before=NET; // acceptance test 6: no request may leave the browser while matching
  f.list=OMBUDS.filter(o=>o.langs.includes(q.lang)&&!o.exR.includes(q.region)&&(q.gender==='np'||o.g===q.gender)).sort((a,b)=>S.rot.indexOf(a.id)-S.rot.indexOf(b.id));
  f.matchNet=NET-before;
  cnt('q_lang_'+q.lang);cnt('q_reg_'+q.region);cnt('q_gen_'+q.gender); // three independent counters, never the combination
  stage('s_q');f.step='pick';render();window.scrollTo(0,0)};

function vPick(){const f=S.flow,list=f.list;
  return `<div class="stack-lg"><div class="stack"><h1>${f.door==='browse'?'The whole panel':'People who fit what you asked'}</h1>
  <div class="row"><span class="chip">${list.length} of ${OMBUDS.length} shown</span>${f.matchNet!==null&&f.door==='narrow'?`<span class="chip ok matchbadge">Matched on this device · ${f.matchNet} network requests</span>`:''}<span class="chip">Order rotates on every visit</span></div>
  <p class="small muted">Fictional sample people. In the live service each has a photograph and writes their own biography, which is shown as written and never machine-translated. Exclusions about where someone will not take matters from hide the profile; exclusions about subjects are shown, not applied, because applying them would mean asking what your matter is about.</p></div>
  ${list.length?`<div class="stack">${list.map(o=>profileCard(o,true)).join('')}</div>`:`<div class="callout warn"><b class="t">No one fits all three answers</b>Try a different language or region, or see the whole panel.<div class="row" style="margin-top:.7rem"><button class="btn" data-act="toDoor">Change my answers</button><button class="btn" data-act="showAll">See everyone</button></div></div>`}
  <div class="row"><button class="btn quiet" data-act="${f.door==='narrow'?'backToQ':'toDoor'}">${t('back')}</button></div></div>`}
ACT.backToQ=()=>{S.flow.step='q';render()};
ACT.showAll=()=>{const f=S.flow;f.list=S.rot.map(id=>OM[id]).filter(isLive);f.matchNet=null;render()};
ACT.choose=a=>{const f=S.flow;f.ombudsId=a.dataset.id;f.connShown=false;f.connection=null;stage('s_pick');f.step='conn';render();window.scrollTo(0,0)};

function vConn(){const f=S.flow,o=OM[f.ombudsId];
  const alts=f.connShown?(f.list.length>1?f.list:OMBUDS).filter(x=>x.id!==o.id&&x.langs.includes(f.q.lang)&&!x.exR.includes(f.q.region)).slice(0,2):[];
  return `<div class="stack-lg" style="max-width:700px"><h1>Do you know ${esc(o.name)}?</h1>
  <p>Not whether you have heard of them — whether you have a real connection. A shared temple, a spiritual family, a working relationship.</p>
  <p>It is not a rule, and you can go ahead either way. But a connection can make a confidential conversation harder for both of you, and it is easier to notice now than halfway through.</p>
  <div class="row"><button class="btn" data-act="conn" data-a="none">No connection</button><button class="btn" data-act="conn" data-a="some">Some connection</button><button class="btn" data-act="conn" data-a="rather">I would rather not say</button></div>
  ${f.connShown?`<div class="callout"><b class="t">That is completely fine</b>You can carry on. If you would rather speak to someone with no ties to your community, here are two others who fit what you asked for.
   <div class="stack" style="margin-top:.8rem">${alts.map(x=>`<div class="row between card" style="padding:.8rem 1rem"><span><b>${esc(x.name)}</b> · ${x.langs.map(l=>LANGS[l]).join(', ')}</span><button class="btn sm" data-act="switchTo" data-id="${x.id}">Choose ${esc(x.name.split(' ')[0])} instead</button></div>`).join('')||'<p>No one else fits what you asked for.</p>'}</div>
   <div class="row" style="margin-top:.8rem"><button class="btn primary" data-act="carryOn">Carry on with ${esc(o.name.split(' ')[0])}</button></div></div>`:''}
  <p class="small muted">This warns rather than blocks, and “I would rather not say” carries no consequence. The answer is counted, never the nature of the connection. The check exists because self-declared exclusions fail in exactly the cases that matter most.</p>
  <div class="row"><button class="btn quiet" data-act="backPick">${t('back')}</button></div></div>`}
ACT.conn=a=>{const f=S.flow;f.connection=a.dataset.a;cnt('conn_'+f.connection);
  if(f.connection==='some'){f.connShown=true;render();return}
  cnt('conn_continued');f.step='time';render();window.scrollTo(0,0)};
ACT.carryOn=()=>{cnt('conn_continued');S.flow.step='time';render();window.scrollTo(0,0)};
ACT.switchTo=a=>{const f=S.flow;cnt('conn_changed');f.ombudsId=a.dataset.id;f.connShown=false;f.connection='none';f.step='time';render();window.scrollTo(0,0)};
ACT.backPick=()=>{S.flow.step='pick';render()};

function vTime(){const f=S.flow,o=OM[f.ombudsId],all=slotsFor(o);
  const limit=Date.now()+f.weeks*7*DAY; const shown=all.filter(s=>s<limit);
  const days={};shown.forEach(s=>{(days[dayKey(s)]=days[dayKey(s)]||[]).push(s)});
  const first=o.name.split(' ')[0];
  return `<div class="stack-lg"><div class="stack"><h1>Choose a time with ${esc(o.name)}</h1>
   <p>Each conversation is 60 minutes, at least 48 hours from now. Times are shown in your time (${esc(myTZ())}) with ${esc(first)}’s alongside (${esc(o.tz)}).</p></div>
   ${shown.length?Object.keys(days).map(k=>`<div class="slotday"><h4>${esc(fmtL(days[k][0],loc(),O_DAY))}</h4><div class="slots">${days[k].map(s=>`<button class="slot" data-act="slot" data-s="${s}"><b>${esc(fmtL(s,loc(),O_T))}</b> your time<small>${esc(fmtU(s,o.off,loc(),O_T))} for ${esc(first)}</small></button>`).join('')}</div></div>`).join(''):`<div class="callout warn">No times fall in this window.</div>`}
   <div class="row">${f.weeks<5?`<button class="btn" data-act="moreWeeks">Show later weeks</button>`:'<span class="muted small">Showing the full 5-week horizon.</span>'}<button class="btn quiet" data-act="noSlot">I can’t find a time that suits</button></div>
   <p class="small muted">The directory showed “usually free within N days” rather than a live grid, so that choosing a person is about fit, not about who is quickest to book. The calendar appears only now, after you have chosen.</p>
   <div class="row"><button class="btn quiet" data-act="backPick">${t('back')}</button></div></div>`}
ACT.moreWeeks=()=>{S.flow.weeks=Math.min(5,S.flow.weeks+1);render()};
/* "I can't find a time": no inbox, no email. The visitor picks a reason from a fixed list, which is counted, and sees who else could see them sooner. */
const WHY=['No time with the person I chose','No time in my language','The time zones did not work','I needed less than 48 hours','Other'];
function noSlotHtml(){const f=S.flow,n=S.noSlot,alts=OMBUDS.filter(x=>x.id!==f.ombudsId&&x.langs.includes(f.q.lang)&&!x.exR.includes(f.q.region||'')).map(x=>[x,slotsFor(x)[0]]).filter(p=>p[1]).sort((a,b)=>a[1]-b[1]).slice(0,3);
  return `<h3>Nothing suits?</h3><p class="small muted" style="margin:.4rem 0 1rem">We have no way to write back to you, because we do not know who you are. So here is what we can do instead.</p>
  <h4>People who fit and have an earlier time</h4>${alts.length?`<div class="stack" style="margin:.5rem 0 1rem">${alts.map(([x,s])=>`<div class="row between card" style="padding:.7rem .9rem"><span><b>${esc(x.name)}</b><br><span class="small muted">next: ${esc(fmtL(s,loc(),{weekday:'short',day:'numeric',month:'short',hour:'numeric',minute:'2-digit'}))} your time</span></span><button class="btn sm" data-act="pickOther" data-id="${x.id}">See ${esc(x.name.split(' ')[0])}’s times</button></div>`).join('')}</div>`:'<p class="small" style="margin:.4rem 0 1rem">Nobody else who fits has a time in the next five weeks.</p>'}
  <h4>Tell us why, so we can add times</h4>${n.sent?`<div class="callout ok"><b class="t">Thank you</b>One reason was counted. Nothing was stored about you. Ombuds can open times up to five weeks ahead, so please look again in a few days.</div>`:`<div class="field"><label for="nsw">What stopped you?</label><select id="nsw" data-model="noSlot.why">${WHY.map(w=>`<option ${n.why===w?'selected':''}>${w}</option>`).join('')}</select></div><div class="row" style="margin-top:.6rem"><button class="btn primary sm" data-act="sendNoSlot">Count my reason</button></div><p class="small muted" style="margin-top:.4rem">A fixed list. No text box, no contact details.</p>`}`}
ACT.noSlot=()=>{S.noSlot={why:WHY[0],sent:false};modal(noSlotHtml())};
ACT.sendNoSlot=()=>{T_inc(S.tally.unmet,S.noSlot.why);S.noSlot.sent=true;modal(noSlotHtml())};
ACT.pickOther=a=>{const f=S.flow;f.ombudsId=a.dataset.id;f.connShown=false;f.connection=null;f.slot=null;f.weeks=2;S.modal=null;f.step='conn';render();window.scrollTo(0,0)};
ACT.slot=a=>{const f=S.flow;f.slot=+a.dataset.s;stage('s_time');f.step='confirm';render();window.scrollTo(0,0)};

function vConfirm(){const f=S.flow,d=f.d,o=OM[f.ombudsId],e=f.err,first=o.name.split(' ')[0];
  const lang=d.lang||(o.langs.includes(f.q.lang)?f.q.lang:o.langs[0]),region=d.region!==''?d.region:(f.q.region||'');
  return `<div class="stack-lg" style="max-width:700px"><h1>Check and confirm</h1>
  <div class="card"><div class="row between"><div><b>${esc(o.name)}</b><div class="muted small">${esc(fmtL(f.slot,loc(),{weekday:'long',day:'numeric',month:'long'}))} · <b>${esc(fmtL(f.slot,loc(),O_T))}</b> your time (${esc(myTZ())}) · ${esc(fmtU(f.slot,o.off,loc(),O_T))} for ${esc(first)}</div></div><button class="btn sm" data-act="backTime">Change time</button></div></div>
  <div class="callout"><b class="t">Nothing to type</b>We do not ask for your name, email address or phone number. When you confirm you get a private ticket link with your booking, a calendar file and the video link. It stays on your device.</div>
  <div class="fieldrow"><div class="field"><label for="d-lang">Language you would like to speak in</label><select id="d-lang" data-model="flow.d.lang">${o.langs.map(l=>`<option value="${l}" ${lang===l?'selected':''}>${LANGS[l]}</option>`).join('')}</select></div>
   <div class="field"><label for="d-reg">Roughly where in the world are you? <span class="muted">(optional)</span></label><select id="d-reg" data-model="flow.d.region"><option value="">Prefer not to say</option>${REGIONS.map(r=>`<option value="${r.id}" ${region===r.id?'selected':''}>${r.label}</option>`).join('')}</select></div></div>
  <fieldset style="border:0;padding:0;margin:0"><legend class="legend">Will anyone be joining you?</legend><div class="choices" style="margin-top:.5rem">${[['me','Just me'],['one','One person with me for support'],['few','A few of us, about the same thing']].map(([v,l])=>`<label class="choice"><input id="join-${v}" type="radio" name="join" value="${v}" data-model="flow.d.joining" data-rerender data-focus="join-${v}" ${d.joining===v?'checked':''}><span>${l}</span></label>`).join('')}</div>
   ${d.joining!=='me'?`<div class="callout warn" style="margin-top:.6rem"><b class="t">Please note</b>Your ombuds will not tell anyone what is said. But the other people on the call will hear all of it, and we cannot promise anything about what they do afterwards.</div>`:''}</fieldset>
  <label class="choice"><input type="checkbox" data-model="flow.d.camOff" ${d.camOff?'checked':''}><span><b>I would rather keep my camera off.</b><br><span class="muted">Your ombuds will know in advance, and will stay on camera themselves unless you ask otherwise — so you are not speaking into the dark.</span></span></label>
  <fieldset style="border:0;padding:0;margin:0"><legend class="legend">${t('trainee_h')}</legend><p class="muted" style="margin:.4rem 0 .6rem">${t('trainee_p')}</p><div class="choices">${[['yes','yes_fine'],['no','no_two']].map(([v,k])=>`<label class="choice"><input type="radio" name="tr" value="${v}" data-model="flow.d.trainee" ${d.trainee===v?'checked':''}><span>${t(k)}</span></label>`).join('')}</div>${e.trainee?`<span class="err">${e.trainee}</span>`:''}
   <p class="small muted" style="margin-top:.4rem">The reason for a “no” is never asked.</p></fieldset>
  <div class="field"><label for="d-heard">How did you hear about us? <span class="muted">(optional)</span></label><select id="d-heard" data-model="flow.d.heard"><option value="">Prefer not to say</option>${HEARD.map(h=>`<option ${d.heard===h?'selected':''}>${h}</option>`).join('')}</select></div>
  <p class="small muted">There is no box to type your situation into, on this page or any other.</p>
  <div class="row"><button class="btn quiet" data-act="backTime">${t('back')}</button><button class="btn primary" data-act="book">Confirm this conversation</button></div></div>`}
ACT.backTime=()=>{S.flow.step='time';render()};
ACT.book=()=>{const f=S.flow,d=f.d;f.err={};
  if(!d.trainee){f.err.trainee='Please choose one. Either answer is fine.';render();return}
  const o=OM[f.ombudsId];
  if(bookedSlots.has(o.id+':'+f.slot)){f.step='time';modal('<p>That time was just taken. Please choose another.</p>');return}
  const token=newToken(),lang=d.lang||(o.langs.includes(f.q.lang)?f.q.lang:o.langs[0]),region=d.region!==''?d.region:(f.q.region||'');
  const c=newContact({ombuds:o.id,slot:f.slot,region,lang,camOff:d.camOff,trainee:d.trainee,joining:d.joining,connection:f.connection||'none',door:f.door,heard:d.heard,token});
  S.staff.asOmbuds=o.id;cnt('s_booked');cnt('conv_'+f.door);
  const lg=f.q.lang;S.flow=freshFlow();S.flow.q.lang=lg;S.justBooked=token;
  go('ticket/'+token);window.scrollTo(0,0)};

/* ---------- The ticket: replaces the confirmation email. Everything the visitor needs, reachable only by whoever holds the link. ---------- */
const meetUrl=tk=>'https://meet.resolve.example/j/'+hash(tk).toString(36).slice(0,3).padEnd(3,'x')+'-'+hash(tk+'a').toString(36).slice(0,4).padEnd(4,'x')+'-'+hash(tk+'b').toString(36).slice(0,3).padEnd(3,'x');
function icsFor(c,tk){const p=n=>String(n).padStart(2,'0'),f=ms=>{const d=new Date(ms);return d.getUTCFullYear()+p(d.getUTCMonth()+1)+p(d.getUTCDate())+'T'+p(d.getUTCHours())+p(d.getUTCMinutes())+'00Z'};
  return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//ISKCON Resolve//Prototype//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT','UID:'+tk+'@resolve.example','DTSTAMP:'+f(Date.now()),'DTSTART:'+f(c.slot),'DTEND:'+f(c.slot+SLOT*60000),
   'SUMMARY:Conversation','DESCRIPTION:Join: '+meetUrl(tk),'URL:'+meetUrl(tk),'BEGIN:VALARM','TRIGGER:-PT30M','ACTION:DISPLAY','DESCRIPTION:Conversation in 30 minutes','END:VALARM','END:VEVENT','END:VCALENDAR'].join('\r\n')}
const ticketUrl=tk=>location.origin+location.pathname+'#ticket/'+tk;
function pTicket(tk){const c=S.byToken[th(tk)];
  if(!c||c.state==='generalised')return `<div class="stack-lg" style="max-width:640px"><h1>We cannot find this ticket.</h1><p>It may have been cancelled or deleted. Tickets are deleted 30 days after your last conversation, and we cannot recover one: we do not know who it belongs to.</p><div class="row"><a class="btn primary" href="#book">Book a conversation</a></div></div>`;
  const o=findOm(c.ombuds),u=userOf(c),first=o.name.split(' ')[0],he=o.g==='m'?'he':'she';
  const day=fmtL(c.slot,loc(),{weekday:'long',day:'numeric',month:'long'}),tm=fmtL(c.slot,loc(),O_T),theirs=fmtU(c.slot,o.off,loc(),O_T);
  const rows=`<table class="kept"><tbody><tr><td>${c.id}</td><td class="y">${esc(o.name)}, the time, camera ${c.camOff?'off':'on'}, trainee ${c.trainee==='yes'?'yes':'no'}, joining: ${c.joining}. The exact time is deleted 30 days after your last conversation.</td></tr><tr><td>${u.id}</td><td class="y">The region (${esc(u.region?REG[u.region].label:'not given')}) and language (${esc(LANGS[u.lang]||u.lang)}) you chose. Nothing else.</td></tr><tr><td>Counters</td><td class="y">Which door, the connection answer, a few separate tallies</td></tr><tr><td>Not stored</td><td class="n">Your name, email, phone number, or why you booked. Never asked.</td></tr></tbody></table>`;
  if(c.state==='cancelled')return `<div class="stack-lg" style="max-width:640px"><h1>This booking was cancelled.</h1><p>The time has been released. Nothing else was kept.</p><div class="row"><button class="btn primary" data-act="reschedTicket" data-t="${esc(tk)}">Choose another time with ${esc(first)}</button><a class="btn" href="#book">Start again</a></div></div>`;
  if(c.state==='held'||c.state==='done'){const done=S.device.surveyDone[c.tokenHash];
    return `<div class="stack-lg" style="max-width:700px"><div><h1>After the conversation</h1><p class="muted">During the hour the system does nothing: no recording, no transcript, no AI note-taker.</p></div>
    <div class="card stack"><h2>${done?'Thank you for the survey':'How did it go?'}</h2>${done?'<p>Your answers were added with nothing that links them to you or to this booking.</p>':`<p>Ten short questions, about two minutes. Nobody can tell which answers are yours.</p><div class="row"><button class="btn primary" data-act="openSurvey" data-t="${esc(tk)}">Take the survey</button></div>`}</div>
    <div class="card stack"><h2>Speak with ${esc(first)} again</h2><p>You will not have to explain anything twice, and you can come back as often as is useful. This is a new booking. The system cannot link it to this one, so tell ${esc(first)} you have spoken before.</p><div class="row"><button class="btn" data-act="reschedTicket" data-t="${esc(tk)}" data-new="1">Book another conversation</button></div></div>
    <div class="card stack"><h2>Delete this ticket now</h2><p class="small">It will stop working. If you would like it gone before the 30 days are up, this removes the ticket and the exact time at once.</p><div class="row"><button class="btn danger sm" data-act="deleteTicket" data-t="${esc(tk)}">Delete my ticket</button></div></div></div>`}
  const link=ticketUrl(tk),ics='data:text/calendar;charset=utf-8,'+encodeURIComponent(icsFor(c,tk)),ask=S.flow.confirmCancel===c.id;
  return `<div class="stack-lg" style="max-width:760px"><div><h1>You are booked.</h1><p class="muted">With ${esc(o.name)} on <b>${esc(day)}, ${esc(tm)}</b> your time (${esc(myTZ())}). It will be ${esc(theirs)} where ${he} is.</p></div>
  <div class="callout warn"><b class="t">Keep this link. It is your ticket.</b>We do not know who you are, so we cannot email it to you and we cannot find it again for you. Save it, add it to your calendar, or write it down.
   <div class="row" style="margin-top:.7rem;flex-wrap:nowrap"><input id="tkurl" class="mono" readonly value="${esc(link)}" style="flex:1;min-width:0;padding:.55rem;border:1.5px solid var(--line);border-radius:8px;background:var(--surface);color:var(--ink)" aria-label="Your ticket link"><button class="btn sm primary" data-act="copyTicket">Copy</button></div><span id="copymsg" class="small" role="status"></span></div>
  <div class="grid g2"><div class="card stack"><h3>Join the conversation</h3><p class="mono small" id="meetlink">${meetUrl(tk)}</p><p class="small muted">Works from any browser. Nothing to install. It opens ten minutes before the start. ${c.camOff?'You asked to keep your camera off.':''}</p></div>
   <div class="card stack"><h3>Add it to your calendar</h3><p class="small muted">A calendar file titled only “Conversation”, with a reminder 30 minutes before. It is made in your browser; nothing is sent anywhere.</p><div class="row"><a class="btn sm" id="icslink" download="conversation.ics" href="${ics}">Download .ics file</a></div></div></div>
  <div class="card"><h3>What will happen</h3><p>${he==='he'?'He':'She'} will spend the first few minutes explaining how this works and what ${he} can and cannot do. Then the time is yours. You do not need to have prepared anything, and you do not need to start at the beginning. In the last ten minutes ${he} will set out the options you have, so you leave with something concrete even if nothing is resolved.</p>
   <p style="margin-top:.6rem">If you need help before then, this is not an emergency service. <a href="#urgent">Urgent help</a></p></div>
  <div class="grid g2"><div class="card"><h3>What the system stored</h3>${rows}</div>
   <div class="card stack"><h3>What ${esc(first)} receives</h3><p class="small">A booking called <b>${c.id}</b> with the time and a per-booking video link (never a standing personal room). ${c.camOff?'<b>Camera off</b>, so stay on camera yourself unless asked otherwise. ':''}${c.trainee==='yes'?'A trainee may sit in silently. ':'No trainee. '}Nothing about the matter, and nothing that says who you are.</p>
    <h3 style="margin-top:.6rem">Change your mind</h3>${ask?`<div class="callout"><b class="t">Cancel this booking?</b>You do not have to give a reason, and nobody will ask.<div class="row" style="margin-top:.6rem"><button class="btn danger sm" data-act="cancelTicket" data-t="${esc(tk)}">Yes, cancel it</button><button class="btn sm quiet" data-act="keepTicket">Keep it</button></div></div>`:`<div class="row"><button class="btn sm" data-act="reschedTicket" data-t="${esc(tk)}">Choose another time</button><button class="btn sm danger" data-act="askCancel" data-id="${c.id}">Cancel</button></div>`}</div></div>
  <div class="callout"><b class="t">Prototype only</b>Skip ahead to the end of the conversation, or switch to Behind the scenes → Ombuds workspace to see this booking from the ombuds’s side.
   <div class="row" style="margin-top:.7rem"><button class="btn primary sm" data-act="simCall" data-t="${esc(tk)}">Skip ahead: the conversation happens</button><a class="btn sm" href="#staff-ombuds">Open the ombuds workspace</a><a class="btn sm quiet" href="#book" data-act="again">Start a new booking</a></div></div></div>`}
ACT.copyTicket=()=>{const el=$('#tkurl'),m=$('#copymsg');if(!el)return;el.select();let ok=false;try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(el.value);ok=true}else ok=document.execCommand('copy')}catch(e){}
  if(m)m.textContent=ok?'Copied. Paste it somewhere you will find it again.':'Select the link above and copy it.'};
ACT.askCancel=a=>{S.flow.confirmCancel=a.dataset.id;render()};
ACT.keepTicket=()=>{S.flow.confirmCancel=null;render()};
ACT.cancelTicket=a=>{const c=S.byToken[th(a.dataset.t)];if(!c)return;c.state='cancelled';bookedSlots.delete(c.ombuds+':'+c.slot);cnt('s_cancel');S.flow.confirmCancel=null;render()};
ACT.simCall=a=>{const c=S.byToken[th(a.dataset.t)];if(c&&c.state==='booked'){c.state='held'}render();window.scrollTo(0,0)};   // demo helper: the conversation has happened, the ombuds has not closed it yet
ACT.deleteTicket=a=>{const c=S.byToken[th(a.dataset.t)];if(!c)return;generalise(c);render();window.scrollTo(0,0)};
ACT.reschedTicket=a=>{const tk=a.dataset.t,c=S.byToken[th(tk)];if(!c)return;const u=userOf(c),o=findOm(c.ombuds),keepConn=c.connection;
  if(c.state==='booked'){c.state='cancelled';bookedSlots.delete(c.ombuds+':'+c.slot);cnt('s_cancel')}
  const f=freshFlow();f.q.lang=u.lang;f.q.region=u.region;f.q.gender='np';f.door=c.door;f.ombudsId=o.id;f.connection=keepConn;f.list=[o];f.step='time';f.d.region=u.region;f.d.lang=u.lang;f.d.camOff=c.camOff;f.d.joining=c.joining;f.d.trainee=c.trainee;S.flow=f;go('book');window.scrollTo(0,0)};
ACT.again=()=>{const lang=S.flow.q.lang;S.flow=freshFlow();S.flow.q.lang=lang;render();window.scrollTo(0,0)};

/* ---------- The Ombuds Services Survey: the ten questions of your Google Form. No key, week-rounded. ---------- */
ACT.openSurvey=a=>{S.sv={a:{},comment:'',err:'',ticket:a.dataset.t,done:false};go('survey');window.scrollTo(0,0)};
const PII_RX=/[\w.+-]+@[\w-]+\.[\w.-]+|(?:\+?\d[\d\s().-]{7,}\d)/;
function pSurvey(){const sv=S.sv;
  if(sv.done)return `<div class="stack-lg" style="max-width:640px"><h1>Thank you.</h1><div class="callout ok"><b class="t">What just happened</b>One row was added to the survey store: your answers and the week they arrived. No booking number, no contact, no exact time. Nobody, including us, can tell which row is yours.</div><div class="row">${sv.ticket?`<a class="btn" href="#ticket/${esc(sv.ticket)}">Back to your ticket</a>`:''}<a class="btn quiet" href="#home">Home</a></div></div>`;
  return `<div class="stack-lg" style="max-width:700px"><div><h1>Ombuds Services Survey</h1><p class="muted">Thank you for taking time to complete this survey. We value your feedback and want to hear from you. Results from this anonymous survey are used to improve how Ombuds services are delivered. Answer what you like; nothing here is linked to your booking.</p></div>
  ${SURVEY.map((q,i)=>`<fieldset class="svq"><legend class="legend">${i+1}. ${esc(q.t)}</legend><div class="row" style="margin-top:.45rem">${q.o.map((o,j)=>`<label class="choice" style="flex:1 1 ${q.o.length>5?'100%':'120px'}"><input type="radio" name="sv-${q.k}" value="${esc(o)}" data-act="svPick" data-k="${q.k}" ${sv.a[q.k]===o?'checked':''}><span>${esc(o)}</span></label>`).join('')}</div></fieldset>`).join('')}
  <div class="field"><label for="svc">10. ${esc(SV_COMMENT)} <span class="muted">(optional)</span></label><textarea id="svc" rows="4" data-model="sv.comment" style="font:inherit;padding:.65rem;border:1.5px solid var(--line);border-radius:10px;background:var(--surface);color:var(--ink);width:100%">${esc(sv.comment)}</textarea><span class="small muted">Please do not include your name, an email address or a phone number, or describe your situation. A comment is held until the annual review, then deleted.</span></div>
  ${sv.err?`<div class="callout bad" role="alert">${esc(sv.err)}</div>`:''}
  <div class="row"><button class="btn primary" data-act="subSurvey">Send my answers</button><span class="small muted">${Object.keys(sv.a).length} of 9 answered</span></div></div>`}
ACT.svPick=a=>{S.sv.a[a.dataset.k]=a.closest('label').querySelector('input').value;S.sv.err='';const y=window.scrollY;render();window.scrollTo(0,y)};
ACT.subSurvey=()=>{const sv=S.sv,n=Object.keys(sv.a).length,cm=(sv.comment||'').trim();
  if(!n&&!cm){sv.err='Please answer at least one question.';render();return}
  if(PII_RX.test(cm)){sv.err='Your comment looks like it contains an email address or a phone number. Please remove it: this survey is anonymous and we do not want to hold contact details.';render();return}
  S.survey.push({week:weekOf(nowD()),a:Object.assign({},sv.a),comment:cm||null}); // no key, no booking reference, week-rounded
  if(sv.ticket){const c=S.byToken[th(sv.ticket)];if(c)S.device.surveyDone[c.tokenHash]=true} // remembered by the visitor's browser only
  sv.done=true;sv.a={};sv.comment='';render();window.scrollTo(0,0)};

/* ---------- Self-guided pathway (spec 2.4, 5.9) ---------- */
const PATH={
 start:{q:'Who is involved?',key:'who',n:'1 of 4',opts:[['A peer, friend or colleague','peer','w'],['Someone with authority over me, or a leader','auth','w'],['A group, or a whole community','group','w']]},
 w:{q:'What would a good outcome look like?',key:'want',n:'2 of 4',opts:{peer:[['The relationship mended','repair'],['To be heard and understood','heard'],['An agreement on what happens next','decision'],['I do not know yet','unsure']],
   auth:[['A working relationship I can live with','repair'],['To be taken seriously','heard'],['A decision or behaviour reversed','decision'],['I do not know yet','unsure']],
   group:[['Everyone speaking to each other again','repair'],['My side understood by the group','heard'],['A ruling that settles it','decision'],['I do not know yet','unsure']]},next:'tried'},
 tried:{q:'Have you tried anything already?',key:'tried',n:'3 of 4',opts:[['Not yet','nothing','protect'],['I have spoken to them, or to someone, about it','talked','protect'],['It has been through a formal process or complaint','formal','protect']]},
 protect:{q:'Does anyone need protecting — you, or someone else?',key:'protect',n:'4 of 4',opts:[['Yes — someone may be unsafe or at risk','yes','end'],['Not that I know of','no','end'],['I am not sure','unsure','end']]}};
const ENDINGS={
 E1:['Take some time first','Nothing formal happens. You keep thinking, perhaps jot notes only for yourself, and choose a date to come back to it.','You do.','As long as you need — a few weeks is common.','Very little. Setting a date to revisit keeps “thinking” from turning into “avoiding”.','Delay can let a situation harden. If nobody is at risk, a few weeks rarely costs anything.'],
 E2:['Raise it yourself, prepared','You speak to the other person directly, having worked out what you want to say and what you would accept.','Both of you. Nobody rules.','One or two conversations, over days or weeks.','Courage, preparation, and a willingness to hear their side without answering at once.','It can sour things or escalate. An ombuds can help you prepare so it is less likely.'],
 E3:['A facilitated conversation','A neutral person carries messages between you, or sits with both of you, so each can say what they need to.','You both do.','Weeks, usually in several short steps.','The other person has to be willing. You may need to share more than feels comfortable at first.','The other person may decline. There is no penalty for either of you.'],
 E4:['Mediation','Both of you, in a conversation held by someone impartial, usually more than once. Voluntary — either of you can stop at any point, and declining is not held against you.','You both do. The mediator holds the process, never the outcome. If you reach an agreement, you write it. If you do not, nothing is imposed.','Several sessions over weeks.','Both of you willing to attend and to listen.','Without agreement nothing is imposed, so the situation may simply stay as it was.'],
 E5:['Arbitration','Both sides present their case and a third person decides the outcome. This is different from everything else on this page.','The arbitrator. You agree in advance to accept what they decide.','Weeks to months.','Accepting the outcome in advance, and a record of the decision, because somebody has to be able to act on it. It is not confidential in the way an ombuds conversation is.','You may be bound by a result you dislike. It suits situations that genuinely need a ruling and cannot get one any other way. It suits almost nothing else.'],
 E6:['Something outside ISKCON, or a protection route','Sometimes the right route is outside ISKCON altogether — a child protection authority, a lawyer, a doctor, a civil body. If a child or an adult at risk is in danger, contact your local authority or the police, and within ISKCON the Child Protection Office.','The authority or professional you go to.','Depends on the route. Start sooner rather than later.','Telling someone who can act. Your ombuds will say so plainly if that is what they think, and help you work out how to get there.','Waiting can leave someone unprotected. This is the one place where confidentiality has a limit.'],
 E7:['Pastoral support or a trusted adviser','A talk with a senior devotee, counsellor or friend who is outside the matter, for comfort and perspective rather than a decision.','You do.','Ongoing, at your pace.','Choosing someone with no stake in the outcome, and no connection to the other person.','Advice from someone close can come with an agenda, and what you say may travel. Choose carefully.']};
function endingOf(tg){ if(tg.protect==='yes')return'E6'; if(tg.want==='unsure')return'E1';
  const m={repair:{nothing:'E2',talked:'E3',formal:'E4'},heard:{nothing:'E7',talked:'E2',formal:'E3'},decision:{nothing:'E2',talked:'E4',formal:'E5'}};
  let e=m[tg.want][tg.tried]; if(tg.who==='group'&&e==='E2')e='E3'; if(tg.protect==='unsure'&&e==='E2')e='E7'; return e}
function pThink(){const P=S.pathState,nd=P.node;
  const head=`<div class="stack" style="max-width:720px"><h1>Work out your options without speaking to anyone</h1><p>Some people want to understand the landscape before they are ready to talk. This takes about five minutes and tells you what each path involves.</p><p class="muted">It is anonymous. We count how many people reach each ending and nothing else. There is no box to type in, and nothing you do here is stored.</p></div>`;
  if(nd==='end'){const e=endingOf(P.tags),E=ENDINGS[e];
    return `<div class="stack-lg">${head}<div class="card" style="max-width:720px"><span class="chip brand">Where this points</span><h2 style="margin:.5rem 0 1rem">${E[0]}</h2><dl class="endlist"><dt>What happens</dt><dd>${E[1]}</dd><dt>Who decides</dt><dd>${E[2]}</dd><dt>How long</dt><dd>${E[3]}</dd><dt>What it asks of you</dt><dd>${E[4]}</dd><dt>If it goes badly</dt><dd>${E[5]}</dd></dl></div>
    <div class="callout" style="max-width:720px"><p>This is a map, not advice, and it cannot see your situation. If any of it felt close, an hour with a person will get you further than another five minutes here.</p><p style="margin-top:.7rem"><a class="btn primary" href="#book">${t('cta_find')}</a></p></div>
    <div class="callout ok small" style="max-width:720px"><b class="t">What was recorded</b>One counter went up: “ending ${e}”. The sequence of your choices was never recorded.</div>
    <div class="row"><button class="btn quiet" data-act="pathRestart">Start again</button></div></div>`}
  const N=PATH[nd];let opts=N.opts; if(nd==='w')opts=N.opts[P.tags.who];
  return `<div class="stack-lg">${head}<fieldset class="card" style="max-width:720px;border:1px solid var(--line)"><legend class="chip">Question ${N.n}</legend><h2 style="margin:.4rem 0 1rem">${N.q}</h2><div class="pathq">${opts.map((o,i)=>`<button class="door" style="padding:.9rem 1.1rem" data-act="pathPick" data-i="${i}">${o[0]}</button>`).join('')}</div></fieldset>
  ${nd!=='start'?`<div class="row"><button class="btn quiet" data-act="pathRestart">Start again</button></div>`:''}</div>`}
ACT.pathPick=a=>{const P=S.pathState,nd=P.node,N=PATH[nd];const opts=nd==='w'?N.opts[P.tags.who]:N.opts;const o=opts[+a.dataset.i];
  P.tags[N.key]=o[1]; P.node=nd==='start'?'w':nd==='w'?'tried':nd==='tried'?'protect':'end';
  if(P.node==='end')cnt('path_'+endingOf(P.tags)); render();window.scrollTo(0,0)};
ACT.pathRestart=()=>{S.pathState={node:'start',tags:{}};render()};

/* ---------- Other pages ---------- */
function pServe(){return `<div class="stack-lg" style="max-width:720px"><h1>Serve as an ombuds</h1><p>The panel is volunteer, and turns over. If you are a calm listener who can stay neutral under pressure, we would like to hear from you.</p>
 <div class="card"><h3>What joining involves</h3><ul><li>One onboarding sitting: a domain address, two-step sign-in, photograph, biography, region and time zone.</li><li>Languages, to the depth needed for a distressing conversation. The question we ask out loud is “could you help someone who is crying in this language?”</li><li>Your monthly limit (2, 3, 4 or 6 conversations; three is the default, roughly four hours with preparation).</li><li>Three published exclusions: who you can speak with, which regions or bodies you will not take matters from, and which subjects you will not take on.</li><li>A named mentor, and three acknowledgements: your exclusions are published; all case notes are destroyed after the case; from the third conversation with the same visitor you speak to your mentor.</li></ul></div>
 <p class="small muted">Recruitment copy is not in the specification, so this page is a stand-in assembled from the onboarding section.</p></div>`}
function pContact(){return `<div class="stack-lg" style="max-width:820px"><h1>Contact</h1><p>Three routes, kept separate on purpose.</p>
 <div class="grid g3"><div class="card"><h3>Book a conversation</h3><p class="small">The usual way. Free, confidential, an hour.</p><p style="margin-top:.7rem"><a class="btn primary sm" href="#book">${t('cta_find')}</a></p></div>
  <div class="card"><h3>Nothing suits?</h3><p class="small">On the booking page choose “I can’t find a time”. You see who else has an earlier time. There is no email to write and nothing is stored about you.</p><p style="margin-top:.7rem"><a class="btn sm" href="#book">Go to booking</a></p></div>
  <div class="card"><h3>If something went wrong</h3><p class="small">A complaint about an ombuds, using the form below. No name or contact details needed.</p></div></div>
 <div class="card stack" id="concernform"><h3>If something went wrong</h3><p>Tell us here. It reaches one named person who is not your ombuds’s mentor and does not report to our director. There is no field for a name, an email address or a phone number, so it is anonymous.</p>
  ${S.concern.sent?`<div class="callout ok"><b class="t">Thank you</b>Your message was passed on. We cannot reply, because we do not know who you are. If the same thing comes up more than once, that is how we notice.</div>`:`<div class="field"><label for="cn-c">What kind of concern is it?</label><select id="cn-c" data-model="concern.cat"><option value="">Choose…</option>${CCAT.map(x=>`<option ${S.concern.cat===x?'selected':''}>${x}</option>`).join('')}</select></div>
  <div class="field"><label for="cn-t">What happened? <span class="muted">(optional, please keep it short)</span></label><textarea id="cn-t" rows="4" data-model="concern.text" style="font:inherit;padding:.65rem;border:1.5px solid var(--line);border-radius:10px;background:var(--surface);color:var(--ink);width:100%">${esc(S.concern.text)}</textarea><span class="small muted">Please do not include your name or contact details.</span></div>
  ${S.concern.err?`<div class="callout bad" role="alert">${esc(S.concern.err)}</div>`:''}<div class="row"><button class="btn primary" data-act="sendConcern">Send</button></div>`}
  <p style="margin-top:.6rem"><b>What we can do.</b> Listen properly. Speak to the ombuds. Notice if the same thing comes up more than once. Where it is serious, stand someone down.</p><p style="margin-top:.6rem"><b>What we cannot do, and we would rather say it now.</b> We cannot establish what was said in your conversation. Nobody recorded it and nobody took notes — which is the promise we made you, and it cuts both ways. We will not be able to tell you that we proved anything.</p></div>
 <section class="stack"><h2>For referrers</h2><h3>When to send someone here</h3><p>If someone brings you a difficulty you are part of, or that concerns your authority, or that they are clearly struggling to raise with you — that is the moment. Also: when you have listened well and got nowhere, when you are not sure you can stay neutral, and when what they need is time you do not have.</p>
  <h3>What you do</h3><p>Give them the link, or one of our cards. Tell them it is confidential and nothing gets back to you. Then step back.</p>
  <h3>What you will not be told</h3><p>Whether they went. What was said. What they decided to do. We know that is uncomfortable, particularly when you care about the outcome and feel responsible for the person. But a service that reports back to the people someone is in conflict with is not confidential, and everyone in the community would work that out quickly. Your not knowing is what makes it work.</p>
  <h3>What you can tell them</h3><p>It is free, confidential, and an hour. They choose who they speak to. Nobody will investigate or decide anything. Nothing will come back to the temple.</p>
  <div class="card flat"><b>Wallet card.</b> Front: <i>Somewhere to think it through. An hour, in confidence, with someone outside it all.</i> Back: URL · QR code · Free. Confidential. You choose who you speak to.</div></section></div>`}
ACT.sendConcern=()=>{const c=S.concern;if(!c.cat){c.err='Please choose what kind of concern it is.';render();return}
  if(PII_RX.test(c.text||'')){c.err='Your message looks like it contains an email address or a phone number. Please remove it. This form is anonymous and we do not want to hold contact details.';render();return}
  c.err='';S.inboxes.conc.push({id:'c'+Date.now(),from:'anonymous form, no contact kept',cat:c.cat,text:(c.text||'').trim()||'(category only)',gone:false});c.sent=true;render()};
function pUrgent(){return `<div class="stack-lg" style="max-width:720px"><h1>If you need help right now, this is not the right place.</h1>
 <p>We are honest about that rather than sorry about it. ISKCON Resolve books conversations at least two days ahead, with volunteers around the world. There is nobody waiting at this end tonight.</p>
 <p>If you or someone else is in danger, or you cannot keep yourself safe, contact your local emergency number.</p>
 <div class="card"><h3>If a child or an adult at risk is in danger</h3><p>Contact your local authority or the police. Within ISKCON, the Child Protection Office handles these matters directly — it is separate from this service and can be reached at <span class="chip warn">[contact to be supplied]</span>.</p></div>
 <div class="card"><h3>If you are in distress but not in danger</h3><p><span class="chip warn">[Regional helplines, listed by country, to be supplied]</span> These are staffed by people trained for exactly this, right now.</p></div>
 <div class="card"><h3>When you are ready</h3><p>We will still be here. Book when the moment is less sharp.</p></div></div>`}
function pStories(){return `<div class="stack-lg" style="max-width:760px"><h1>Stories</h1>
 <div class="grid g2">${[1,2,3,4].map(i=>`<div class="card flat"><span class="chip">Composite scenario ${i}</span><p class="small muted" style="margin-top:.5rem">Copy to be supplied by ISKCON Resolve. Each story will be clearly labelled as a composite, not a real case.</p></div>`).join('')}</div>
 <section class="stack"><h2>If a concern has been raised about you</h2><p>You may have heard that someone has spoken to an ombuds about a situation involving you. That is an unsettling thing to learn, and it is worth being clear about what it does and does not mean.</p><p>It does not mean a complaint has been made against you. It does not mean anyone is investigating. Nothing has been recorded, and nothing has been reported to anyone.</p><p>It means someone wanted to think through a difficult situation with a person outside it.</p>
 <h3>You can do the same</h3><p>This service is not for complainants. It is for anyone in a conflict, on any side of it. You can book your own conversation, in confidence, on the same terms — with a different ombuds, so neither conversation affects the other.</p>
 <h3>If mediation is suggested later</h3><p>It is voluntary. Nobody can require you to take part, and declining is not treated as an admission of anything.</p><p><a class="btn primary" href="#book">${t('cta_find')}</a></p></section>
 <p class="small muted">In the build plan this page is deliberately made after launch, once a quarter of real use has shown what people need from it.</p></div>`}
function pPrivacy(){const rows=[['Arrival','One anonymous page count; language chosen as a counter','Anything identifying. No session recording, no heatmaps, no ad tags.'],['Door chosen','Which door, and whether it ended in a booking','Which profiles were viewed, and in what order'],['Three questions','Three independent counters','The combination. Nothing leaves her device.'],['Connection check','The answer, and whether she continued or changed','What the connection was'],['Booking','A contact number (contact-M), an anonymous-user number (anonymous-user-N), the region and language chosen, the time. The exact time is deleted at 30 days.','Name, email, phone number — never asked'],['Trainee consent','Yes or no, against the booking','The reason for a no. Never asked.'],['The conversation','Nothing','Everything. No recording, transcript, or notes held by the organisation.'],['Closing','Fixed categories only: location, who, risk, issues, what the ombuds did','Free text of any kind'],['Survey','Ten fixed questions and an optional comment, week-rounded, unconnected to the booking','Anything that could reconnect the two']];
 return `<div class="stack-lg"><div class="stack" style="max-width:720px"><h1>Privacy, in plain words</h1><p>We would rather show you what we keep than ask you to trust a policy. This is every step, and what is and is not kept at it.</p></div>
 <div class="card scroll"><table class="kept"><thead><tr><th>Step</th><th>Kept</th><th>Not kept</th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${r[0]}</b></td><td class="y">${r[1]}</td><td class="n">${r[2]}</td></tr>`).join('')}</tbody></table></div>
 <div class="callout" style="max-width:720px"><b class="t">What confidential means here</b><p>${t('conf_p1')}</p><p style="margin-top:.6rem">${t('conf_p2')}</p></div><p class="small muted">The formal privacy notice would be linked here. Table content from the specification, section 4.2.</p></div>`}
