/* ===== Reference data taken from the build specification (sections 3.2, 3.3) ===== */
/* Regions follow the closing-form document (12 locations). "Elsewhere" is an addition of this prototype: the document has no home for the Middle East or Australasia. */
const REGIONS=[
 {id:'inN',label:'India North / Nepal',rep:'India'},{id:'inS',label:'India South / Sri Lanka',rep:'India'},
 {id:'inE',label:'India East / Bangladesh',rep:'India'},{id:'inW',label:'India West',rep:'India'},
 {id:'usc',label:'US and Canada',rep:'Americas'},{id:'lac',label:'Latin America',rep:'Americas'},
 {id:'eu',label:'Europe',rep:'Europe and Russia'},{id:'ru',label:'Russia',rep:'Europe and Russia'},
 {id:'af',label:'Africa',rep:'Africa'},
 {id:'cn',label:'China',rep:'Asia-Pacific'},{id:'sea',label:'South-East Asia',rep:'Asia-Pacific'},{id:'fe',label:'Far East / Taiwan',rep:'Asia-Pacific'},
 {id:'oth',label:'Elsewhere (e.g. Middle East, Australasia)',rep:'Elsewhere'}];
const REG=Object.fromEntries(REGIONS.map(r=>[r.id,r]));
const REP_REGIONS=['India','Americas','Europe and Russia','Africa','Asia-Pacific','Elsewhere'];
const LANGS={en:'English',hi:'Hindi',bn:'Bengali',es:'Spanish',ru:'Russian',pt:'Portuguese',ta:'Tamil',gu:'Gujarati'};
const UI_LANGS=[['en','English'],['hi','हिन्दी'],['bn','বাংলা'],['es','Español'],['ru','Русский']];
const LOCALE={en:'en-GB',hi:'hi-IN',bn:'bn-BD',es:'es-ES',ru:'ru-RU'};
/* Issue categories: the nine groups of the closing-form document, with its sub-issues (two duplicated sub-issues in the document are listed once). A case can touch several. */
const CATS=[
 ['Leadership and governance',['Leadership style','Abuse of authority','Decision-making','Favoritism','Conflict of interest','Transparency','Accountability','GBC/Regional/Temple authority issues']],
 ['Communication and relationships',['Miscommunication','Disrespect','Gossip or defamation','Breach of confidentiality','Cross-cultural misunderstandings','Social media conflicts']],
 ['Harassment and misconduct',['Bullying','Retaliation','Sexual harassment/assault','Emotional or psychological abuse','Spiritual abuse','Blackmailing','Discrimination','Intimidation']],
 ['Service and volunteer issues',['Service assignment','Role ambiguity','Service removal','Training/development','Resignation','Burnout','Recognition','Volunteer management']],
 ['Financial and legal',['Financial dealings','Donations','Compensation/benefits/retirement','Misuse of funds','Property issues','Intellectual property','Criminal activity','ISKCON law and policy']],
 ['Spiritual standards',['Guru–disciple issues','Standards of conduct','Scriptural interpretation','Sadhana','Deity worship','Guru groupism/canvassing','Vaishnava etiquette','Initiation-related concerns/blocking initiation']],
 ['Child protection and safeguarding',['Child protection','Vulnerable adults','Boundary violations','Safety concerns']],
 ['Facilities and environment',['Accommodations','Cleanliness','Security','Noise','Health and safety']],
 ['Organizational development',['Temple restructuring','Construction','Outreach strategy','Funding priorities','Organizational culture','Change management']]];
const ISSUES=[];CATS.forEach((c,i)=>c[1].forEach((s,j)=>ISSUES.push({code:i+'.'+j,cat:i,sub:s})));
const ISSUE=Object.fromEntries(ISSUES.map(x=>[x.code,x]));
const hasCat=(c,i)=>c.issues.some(k=>ISSUE[k].cat===i);
const VISITOR_CATS=['Top leadership','Middle leadership','Temple devotees / initiated congregation','Congregation','Employee','Public'];
/* Case resolution (section 10 of the document): what the ombuds did. Any number can apply. */
const SERVICES=['Information provided','Coaching','Shuttle diplomacy','Facilitated dialogue','Referral','Formal process','Listening (no option chosen)'];
/* Perceived or stated adverse impacts: optional, taken from the NASA tracker you attached. */
const IMPACTS=['Acute emotional health (increased stress, lowered morale)','Elevated emotional health (e.g. high stress, anxiety, depression)','Physical health (e.g. sleep, high blood pressure, panic attacks)','Damaging professional reputation','Impact on the organization’s reputation or relationships','Reduced engagement, effectiveness or service','Less team interaction, active avoidance','Seeking outside employment or leaving','Increased absenteeism','Impeding the mission (work not getting done)','Significant or unnecessary delay','Excessive time required by senior leaders','Work process or delivery (e.g. quality, delays)'];
const HEARD=['A friend','A temple leader','Someone who refers people (counsellor, teacher)','Social media','A web search','Other'];
const TOPIC_EXCL=['Sexual harassment/assault','Initiation-related concerns/blocking initiation','GBC/Regional/Temple authority issues','Financial dealings','Criminal activity'];
/* The Ombuds Services Survey (the Google Form you linked), question for question. Sent after the conversation. */
const AGREE=['Strongly disagree','Disagree','Neutral','Agree','Strongly agree'];
const SURVEY=[
 {k:'q1',t:'I received an appointment with the Ombuds in a timely manner',o:['Yes','No']},
 {k:'q2',t:'I trust the Ombuds to maintain confidentiality.',o:['Yes','No']},
 {k:'q3',t:'I felt comfortable discussing my issue with the Ombuds and was treated with respect.',o:AGREE},
 {k:'q4',t:'The Ombuds carefully listened to and understood my concerns.',o:AGREE},
 {k:'q5',t:'I would come back to the Ombuds and/or refer others for assistance.',o:AGREE},
 {k:'q6',t:'Because of my interactions with the Ombuds, I developed skills and/or learned approaches that might help me resolve future concerns.',o:AGREE},
 {k:'q7',t:'I was better able to manage my concern following the discussion with the Ombuds.',o:AGREE},
 {k:'q8',t:'The Ombuds helped me clearly identify and evaluate options to address my concerns.',o:AGREE},
 {k:'q9',t:'If you had not used the Ombuds Program for your concern, what other action would you have taken?',o:['Not have done anything / continue to struggle','Dealt with it on my own','Filed a complaint or formal grievance','Change position within our organization','Find another job','Other']}];
const SV_COMMENT='Please consider adding some additional feedback or comments. Often, this is where we learn the most from our Visitors.';

/* ===== Sample panel — fictional people, shown as written (bios are never machine-translated) ===== */
const OMBUDS=[
 {id:'o1',name:'Mahādeva Dāsa',g:'m',reg:'inW',off:330,tz:'India (UTC+5:30)',langs:['en','hi','gu'],limit:3,days:[2,4,6],start:18,n:2,exR:['inW'],exT:[],speaks:'anyone',col:'#0e5a66',w:3,
  bio:'I spent thirty years in temple management before I learned that listening is harder than deciding. I will not rush you.'},
 {id:'o2',name:'Sarasvatī Devī Dāsī',g:'f',reg:'usc',off:-300,tz:'US Eastern (UTC−5)',langs:['en','es'],limit:4,days:[1,3,6],start:19,n:2,exR:['usc'],exT:['Sexual harassment/assault'],speaks:'anyone',col:'#7a3e8f',w:4,
  bio:'A mediator by profession and a mother of three. I like quiet, concrete conversations that end with a next step.'},
 {id:'o3',name:'Nityānanda Dāsa',g:'m',reg:'inE',off:330,tz:'India (UTC+5:30)',langs:['bn','en','hi'],limit:3,days:[1,5,0],start:17,n:3,exR:['inE'],exT:['GBC/Regional/Temple authority issues'],speaks:'anyone',col:'#9a4a14',w:3,
  bio:'Bengali is my first language and the one I cry in. If that is yours too, we can begin there.'},
 {id:'o4',name:'Lalitā Devī Dāsī',g:'f',reg:'eu',off:60,tz:'Central Europe (UTC+1)',langs:['en','ru'],limit:2,days:[2,3,0],start:18,n:2,exR:['eu','ru'],exT:[],speaks:'women',col:'#1c6e4a',w:2,
  bio:'I work with women who feel unheard. I speak plainly and I do not mind silence.'},
 {id:'o5',name:'Govinda Dāsa',g:'m',reg:'oth',off:600,tz:'Australia East (UTC+10)',langs:['en'],limit:6,days:[1,2,3,4],start:19,n:2,exR:['oth'],exT:[],speaks:'anyone',col:'#2d5bb0',w:6,
  bio:'Former schoolteacher. I explain things in order, and I will tell you honestly when something is beyond what I can help with.'},
 {id:'o6',name:'Rādhikā Devī Dāsī',g:'f',reg:'inS',off:330,tz:'India (UTC+5:30)',langs:['ta','en','hi'],limit:3,days:[3,6,0],start:17,n:3,exR:['inS'],exT:['Initiation-related concerns/blocking initiation'],speaks:'anyone',col:'#a1306a',w:3,
  bio:'I have been on both sides of a temple dispute. That is why I stay on neither.'},
 {id:'o7',name:'Ananta Dāsa',g:'m',reg:'ru',off:180,tz:'Moscow (UTC+3)',langs:['ru','en'],limit:3,days:[2,4,5],start:18,n:2,exR:['ru'],exT:[],speaks:'anyone',col:'#4a5f7a',w:3,
  bio:'Говорю по-русски и по-английски. Можно начать с любого места: не обязательно по порядку.'},
 {id:'o8',name:'Mādhavī Devī Dāsī',g:'f',reg:'lac',off:-180,tz:'Brazil (UTC−3)',langs:['es','pt','en'],limit:4,days:[1,4,6],start:19,n:2,exR:['lac'],exT:['Financial dealings'],speaks:'anyone',col:'#b0561f',w:4,
  bio:'Trabajo con comunidades pequeñas, donde todos se conocen. Sé lo difícil que es hablar de eso.'},
 {id:'o9',name:'Śyāma Dāsa',g:'m',reg:'af',off:120,tz:'South Africa (UTC+2)',langs:['en'],limit:2,days:[3,5],start:18,n:2,exR:['af'],exT:[],speaks:'anyone',col:'#376a3a',w:0,
  bio:'I am newer to this work and I take few conversations. I give each one my full attention.'},
 {id:'o10',name:'Kaviraja Dāsa',g:'m',reg:'usc',off:-480,tz:'US Pacific (UTC−8)',langs:['en','es'],limit:3,days:[2,3,0],start:18,n:2,exR:['usc'],exT:['Criminal activity'],speaks:'anyone',col:'#6b4a2b',w:3,
  bio:'I come from a business background. I am good with numbers, contracts and awkward silences.'},
 {id:'o11',name:'Vṛndā Devī Dāsī',g:'f',reg:'oth',off:240,tz:'Gulf (UTC+4)',langs:['en','hi'],limit:3,days:[0,2,4],start:19,n:2,exR:['oth','inN'],exT:[],speaks:'anyone',col:'#8c2f3a',w:3,
  bio:'I live between two cultures, so I try not to assume yours.'},
 {id:'o12',name:'Candraśekhara Dāsa',g:'m',reg:'sea',off:420,tz:'Indonesia (UTC+7)',langs:['en','bn'],limit:2,days:[6,0],start:16,n:3,exR:['sea'],exT:['Sexual harassment/assault'],speaks:'anyone',col:'#2f6b78',w:0,
  bio:'Weekends only. I live far from most temples, which sometimes helps.'}];
const OM=Object.fromEntries(OMBUDS.map(o=>[o.id,o]));

/* ===== Onboarding vocabulary: controlled lists, so profiles stay comparable and nothing is free-typed that does not need to be ===== */
const SLOT=60,CYCLE=80; // a 60-minute conversation plus a 20-minute gap = one 80-minute cycle
const SKILLS=['Active listening','Mediation','Facilitated dialogue','Conflict de-escalation','Coaching','Trauma-aware listening','Cross-cultural communication','Pastoral care','Youth and student care','Marriage and family','Women’s concerns','Leadership and governance'];
const DOMAINS=['Temple management','Education','Law','Finance and accounting','Healthcare','Counselling and psychology','Business and entrepreneurship','IT and engineering','HR and people management','Social work','Arts and media','Retired or not currently working'];
const SEVAS=['Temple president','Temple vice-president','Regional secretary','GBC member or deputy','Counsellor','Mentor or siksha guru','Preacher and outreach','Educator','Temple devotee (full-time)','Congregation leader','Community leader','Householder (independent)','Retired from service','Other'];
const YRS=['<5','5–10','10–20','20+'], OYRS=['none','<2','2–5','5+'];
const LVL=[['','Not spoken'],['working','Working knowledge'],['fluent','Fluent'],['native','Native']];
const TZS=[['UTC−8','US Pacific (UTC−8)',-480],['UTC−6','US Central (UTC−6)',-360],['UTC−5','US Eastern (UTC−5)',-300],['UTC−3','Brazil (UTC−3)',-180],['UTC+0','UK and West Africa (UTC+0)',0],['UTC+1','Central Europe (UTC+1)',60],['UTC+2','South Africa (UTC+2)',120],['UTC+3','Moscow (UTC+3)',180],['UTC+4','Gulf (UTC+4)',240],['UTC+5:30','India (UTC+5:30)',330],['UTC+5:45','Nepal (UTC+5:45)',345],['UTC+6','Bangladesh (UTC+6)',360],['UTC+7','Indonesia (UTC+7)',420],['UTC+8','Singapore and Malaysia (UTC+8)',480],['UTC+10','Australia East (UTC+10)',600],['UTC+12','New Zealand (UTC+12)',720]].map(([k,label,off])=>({k,label,off}));
const DOW=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const WEEK_ORDER=[1,2,3,4,5,6,0]; // weeks start on Monday
const EXTRA={
 o1:{legal:'Mahesh Patel',seva:'Temple president',temple:'Ahmedabad temple',city:'Ahmedabad',skills:['Active listening','Mediation','Conflict de-escalation'],domains:['Temple management','Business and entrepreneurship'],yrs:'20+',oyrs:'2–5',lvl:{en:'fluent',hi:'native',gu:'native'},show:{seva:false,temple:false,city:false}},
 o2:{legal:'Sarah Jennings',seva:'Congregation leader',temple:'New York temple',city:'New York',skills:['Mediation','Facilitated dialogue','Women’s concerns'],domains:['Law','Counselling and psychology'],yrs:'10–20',oyrs:'5+',lvl:{en:'native',es:'fluent'},show:{seva:false,temple:false,city:false}},
 o3:{legal:'Nitai Chandra Ghosh',seva:'Regional secretary',temple:'Mayapur',city:'Mayapur',skills:['Active listening','Pastoral care','Cross-cultural communication'],domains:['Education','Temple management'],yrs:'20+',oyrs:'2–5',lvl:{bn:'native',en:'fluent',hi:'fluent'},show:{seva:true,temple:false,city:false}},
 o4:{legal:'Larisa Petrova',seva:'Counsellor',temple:'Vienna community',city:'Vienna',skills:['Trauma-aware listening','Women’s concerns','Active listening'],domains:['Counselling and psychology','Healthcare'],yrs:'10–20',oyrs:'2–5',lvl:{en:'fluent',ru:'native'},show:{seva:false,temple:false,city:false}},
 o5:{legal:'Gordon Hale',seva:'Educator',temple:'Melbourne temple',city:'Melbourne',skills:['Coaching','Active listening','Mediation'],domains:['Education'],yrs:'10–20',oyrs:'<2',lvl:{en:'native'},show:{seva:false,temple:false,city:true}},
 o6:{legal:'Radha Krishnan',seva:'Temple vice-president',temple:'Chennai temple',city:'Chennai',skills:['Mediation','Conflict de-escalation','Pastoral care'],domains:['Temple management','Social work'],yrs:'20+',oyrs:'5+',lvl:{ta:'native',en:'fluent',hi:'fluent'},show:{seva:false,temple:false,city:false}},
 o7:{legal:'Anton Volkov',seva:'Preacher and outreach',temple:'Moscow temple',city:'Moscow',skills:['Active listening','Cross-cultural communication'],domains:['IT and engineering'],yrs:'5–10',oyrs:'<2',lvl:{ru:'native',en:'fluent'},show:{seva:false,temple:false,city:false}},
 o8:{legal:'Marina Souza',seva:'Community leader',temple:'São Paulo community',city:'São Paulo',skills:['Pastoral care','Youth and student care','Cross-cultural communication'],domains:['Social work','Education'],yrs:'10–20',oyrs:'2–5',lvl:{es:'native',pt:'native',en:'fluent'},show:{seva:false,temple:false,city:false}},
 o9:{legal:'Samuel Dlamini',seva:'Temple devotee (full-time)',temple:'Johannesburg temple',city:'Johannesburg',skills:['Active listening'],domains:['Finance and accounting'],yrs:'<5',oyrs:'none',lvl:{en:'native'},show:{seva:false,temple:false,city:false}},
 o10:{legal:'Kevin Ross',seva:'Householder (independent)',temple:'Los Angeles temple',city:'Los Angeles',skills:['Mediation','Coaching'],domains:['Business and entrepreneurship','Law'],yrs:'10–20',oyrs:'2–5',lvl:{en:'native',es:'fluent'},show:{seva:false,temple:false,city:false}},
 o11:{legal:'Vrinda Nair',seva:'Counsellor',temple:'Dubai community',city:'Dubai',skills:['Cross-cultural communication','Active listening','Women’s concerns'],domains:['HR and people management'],yrs:'5–10',oyrs:'<2',lvl:{en:'native',hi:'fluent'},show:{seva:false,temple:false,city:false}},
 o12:{legal:'Chandra Wijaya',seva:'Householder (independent)',temple:'Bali community',city:'Bali',skills:['Coaching','Conflict de-escalation'],domains:['Arts and media','Business and entrepreneurship'],yrs:'5–10',oyrs:'none',lvl:{en:'fluent',bn:'native'},show:{seva:false,temple:false,city:false}}};
OMBUDS.forEach(o=>{Object.assign(o,EXTRA[o.id]);o.status='live';o.pending=null;o.draft=null;o.sim=true;o.fixed=[];o.skip={};o.ovr={};
  o.tpl={};o.days.forEach(d=>{o.tpl[d]=[[o.start*60,o.start*60+(o.n-1)*CYCLE+SLOT]]})});
const OMBUDS_SEED=JSON.stringify(OMBUDS);
const ONBOARD=[]; // invited, in review, or paused: never shown to visitors, never counted in reports
function resetPanel(){const s=JSON.parse(OMBUDS_SEED);OMBUDS.length=0;s.forEach(o=>OMBUDS.push(o));ONBOARD.length=0;
  Object.keys(OM).forEach(k=>delete OM[k]);OMBUDS.forEach(o=>{OM[o.id]=o})}
const isLive=o=>OMBUDS.includes(o);
const findOm=id=>OM[id]; // OM keeps everyone, including people on a break, so old bookings never lose their ombuds


/* ===== tiny seeded PRNG so every load of the demo looks the same ===== */
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const DAY=86400e3;
/* Monday 00:00 UTC of the week a moment falls in. Anything kept long-term is rounded to this. */
const weekOf=t=>{const x=new Date(t);x.setUTCHours(0,0,0,0);x.setUTCDate(x.getUTCDate()-((x.getUTCDay()+6)%7));return x.getTime()};

/* ===== Seed: a year of closed cases, conversations, anonymous users, contacts, surveys, counters =====
   scale (optional, from ?scale=N in the address) seeds N closed cases instead of 143, to show the app holding up at volume. */
function seedAll(S,scale){
  const R=mulberry(2002), pick=a=>a[Math.floor(R()*a.length)], wpick=(items,ws)=>{let t=ws.reduce((a,b)=>a+b,0),x=R()*t;for(let i=0;i<items.length;i++){x-=ws[i];if(x<0)return items[i]}return items[items.length-1]};
  const regW={inE:30,inW:18,inN:14,inS:10,usc:22,lac:7,eu:14,ru:7,oth:5,sea:6,af:6,cn:2,fe:2};
  let regs=[];
  if(scale){const k=Object.keys(regW),w=k.map(x=>regW[x]);for(let i=0;i<scale;i++)regs.push(wpick(k,w))}
  else{Object.entries(regW).forEach(([k,n])=>{for(let i=0;i<n;i++)regs.push(k)});
    for(let i=regs.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[regs[i],regs[j]]=[regs[j],regs[i]]}}
  const now=Date.now(); const cases=[],convs=[],touches=[];
  const catW=[20,28,14,22,16,20,4,5,6],svcW=[30,34,10,10,12,6,28];
  regs.forEach((rid,i)=>{
    const recent=R()<0.13; const closed=now-(recent?R()*30:30+R()*335)*DAY;
    const nconv=wpick([1,2,3,4,5,6],[60,22,10,5,2,1]);
    const om=wpick(OMBUDS,OMBUDS.map(o=>o.w));
    const first=closed-(nconv-1)*7*DAY-R()*3*DAY;
    const iss=new Set(),c0=wpick(CATS.map((c,k)=>k),catW);iss.add(c0+'.'+Math.floor(R()*CATS[c0][1].length));
    const extra=wpick([0,1,2,3],[50,30,15,5]);
    for(let k=0;k<extra;k++){const cc=R()<.55?c0:wpick(CATS.map((c,q)=>q),catW);iss.add(cc+'.'+Math.floor(R()*CATS[cc][1].length))}
    const svc=new Set([wpick(SERVICES,svcW)]);if(R()<.4)svc.add(wpick(SERVICES,svcW));if(R()<.12)svc.add(wpick(SERVICES,svcW));
    const imp=[];if(R()<.5){const n=1+Math.floor(R()*3);for(let k=0;k<n;k++){const v=pick(IMPACTS);if(!imp.includes(v))imp.push(v)}}
    const c={n:null,opened:first,closed,reg:rid,lang:pick(om.langs),door:R()<.55?'browse':'narrow',heard:pick(HEARD),conn:wpick(['none','some','rather'],[88,8,4]),
      camOff:R()<.3,trainee:wpick(['yes','no','na'],[12,70,18]),joining:wpick(['me','one','few'],[78,16,6]),
      vcat:wpick(VISITOR_CATS,[4,10,28,34,12,12]),issues:[...iss],services:[...svc],impacts:imp,
      risk:wpick(['low','medium','high'],[40,38,22]),nconv,hours:Math.round((nconv*1.4+R()*1.5)*2)/2,
      ombuds:om.id,visitors:1};
    c.visitors=c.joining==='me'?1:(c.joining==='one'?2:3+Math.floor(R()*2));
    cases.push(c);
    for(let k=1;k<=nconv;k++){const date=first+(k-1)*7*DAY;
      convs.push({ombuds:om.id,seq:k,date,took:wpick(['yes','no-show','cancelled late','technical failure'],[88,6,4,2]),
      wellbeing:wpick(['fine','heavy','at my limit'],[84,12,4]),mismatch:wpick(['no','excluded topic','undeclared connection'],[90,7,3]),
      direct:wpick(['no','open invitation','one specific thing'],[84,6,10]),camera:wpick(['both on','ombuds off','both off','audio only'],[58,24,12,6]),
      mentor:k>=3?wpick(['yes','will do','not yet'],[60,25,15]):null});
      touches.push({date,ombuds:om.id,region:rid,lang:c.lang,camOff:c.camOff,trainee:c.trainee,joining:c.joining,connection:c.conn,door:c.door,heard:c.heard})}
  });
  cases.sort((a,b)=>a.opened-b.opened); const seqByYear={};
  cases.forEach(c=>{const y=new Date(c.opened).getFullYear();seqByYear[y]=(seqByYear[y]||0)+1;c.n=y+'-'+String(seqByYear[y]).padStart(4,'0')});
  S.seqByYear=seqByYear; S.cases=cases; S.convs=convs;
  /* Anonymous users and contacts. The system cannot tell a returning visitor from a new one, so every contact gets the next
     contact-M and a fresh anonymous-user-N. Older contacts have already been generalised by the nightly job (no exact time, no ticket). */
  S.users=[];S.contacts=[];S.seq={u:0,m:0};
  touches.sort((a,b)=>a.date-b.date).forEach(t=>{const old=t.date<now-30*DAY;
    const u={n:++S.seq.u,id:'anonymous-user-'+S.seq.u,region:t.region,lang:t.lang};S.users.push(u);
    S.contacts.push({m:++S.seq.m,id:'contact-'+S.seq.m,user:u.n,ombuds:t.ombuds,slot:old?null:t.date,week:weekOf(t.date),last:t.date,tokenHash:old?null:'seed',
      state:old?'generalised':'done',caseNo:null,camOff:t.camOff,trainee:t.trainee,joining:t.joining,connection:t.connection,door:t.door,heard:t.heard,seeded:true})});
  // Survey: no key, week-rounded timestamps. One store, the ten questions of the Ombuds Services Survey.
  S.survey=[];
  const agw=[[2,3,9,38,48],[2,4,12,38,44],[3,5,14,36,42],[2,5,13,36,44],[4,8,18,34,36]];
  for(let i=0;i<150;i++){const a={};
    a.q1=wpick(['Yes','No'],[88,12]);a.q2=wpick(['Yes','No'],[92,8]);
    ['q3','q4','q5','q6','q7','q8'].forEach((k,j)=>a[k]=wpick(AGREE,agw[[0,0,1,3,4,2][j]]));
    a.q9=wpick(SURVEY[8].o,[22,24,14,10,10,20]);
    S.survey.push({week:weekOf(now-R()*180*DAY),a,comment:R()<.12?pick(['Thank you for listening.','It helped to talk to someone outside the temple.','I wish the next free time had been sooner.','The conversation gave me options I had not seen.']):null})}
  // Counters (anonymous tallies)
  S.counters={s_arrive:620,s_door:410,door_browse:250,door_narrow:160,s_q:120,s_pick:205,s_time:112,s_booked:82,s_cancel:6,conv_browse:45,conv_narrow:37,
    conn_none:70,conn_some:9,conn_rather:3,conn_continued:80,conn_changed:2,
    q_lang_en:55,q_lang_hi:22,q_lang_bn:14,q_lang_es:10,q_lang_ru:8,q_lang_pt:3,q_lang_ta:4,q_lang_gu:4,
    q_gen_m:38,q_gen_f:61,q_gen_np:21,
    site_en:380,site_hi:92,site_bn:61,site_es:48,site_ru:39,
    path_E1:28,path_E2:41,path_E3:22,path_E4:17,path_E5:6,path_E6:11,path_E7:19};
  const rq={inE:26,inW:15,inN:11,inS:8,usc:24,lac:6,eu:12,ru:6,oth:3,sea:5,af:4,cn:1,fe:1};Object.entries(rq).forEach(([k,v])=>S.counters['q_reg_'+k]=v);
}
