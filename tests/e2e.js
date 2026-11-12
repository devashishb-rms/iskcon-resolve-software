#!/usr/bin/env node
'use strict';
/* End-to-end tests for the ISKCON Resolve prototype.
   Starts the real server (with its strict CSP), drives the page in headless Chromium and asserts the
   behaviours the build specification asks for. Exit code 0 = all passed.
   Run:  npm install && npx playwright install chromium && npm test            */
const assert = require('assert');
const { chromium } = require('playwright');
const { createServer } = require('../server.js');

let passed = 0, failed = 0;
const failures = [];
async function test(name, fn) {
  try { await fn(); passed++; console.log('  ✔ ' + name); }
  catch (e) { failed++; failures.push([name, e]); console.log('  ✘ ' + name + '\n      ' + (e && e.message || e).split('\n')[0]); }
}
const hash = (page, h) => page.evaluate(x => { location.hash = '#' + x; }, h).then(() => page.waitForTimeout(40));

(async () => {
  const server = createServer();
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + server.address().port + '/';
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  page.setDefaultTimeout(8000);

  const problems = [];            // console errors, page errors, CSP violations
  let requestsAfterLoad = 0, loaded = false;
  page.on('pageerror', e => problems.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' || /Content Security Policy/i.test(m.text())) problems.push('console: ' + m.text()); });
  page.on('request', () => { if (loaded) requestsAfterLoad++; });

  await page.goto(base);
  await page.waitForLoadState('networkidle');
  loaded = true;

  console.log('\nVisitor site');
  await test('home page loads with the confidentiality promise above the fold', async () => {
    assert.strictEqual(await page.locator('h1').first().innerText(), 'Somewhere to think it through.');
    const promise = page.locator('.promise');
    assert.ok(await promise.isVisible());
    const box = await promise.boundingBox();
    assert.ok(box.y + 100 < 900, 'promise should start within the first screen');
    assert.match(await promise.innerText(), /Child Protection Office/);
  });

  await test('top navigation has five items and only the first is a styled button', async () => {
    assert.strictEqual(await page.locator('nav.main a').count(), 5);
    assert.strictEqual(await page.locator('nav.main a.btn.primary').count(), 1);
  });

  await test('narrowing down: filters in the browser, with zero network requests', async () => {
    await page.click('nav.main a.btn.primary');
    await page.click('[data-act=door][data-d=narrow]');
    await page.selectOption('#q2', 'inE');
    await page.check('input[name=q3][value=f]');
    const before = requestsAfterLoad, netBefore = await page.evaluate(() => NET);
    await page.click('[data-act=match]');
    assert.ok(await page.locator('.profile').count() > 0, 'some profiles should match');
    assert.strictEqual(requestsAfterLoad - before, 0, 'browser made network requests during matching');
    assert.strictEqual(await page.evaluate(() => NET) - netBefore, 0, 'app counted network calls during matching');
    assert.match(await page.locator('.matchbadge').innerText(), /0 network requests/);
  });

  await test('matching respects language, region exclusion and gender preference', async () => {
    const names = await page.locator('.profile h3').allInnerTexts();
    assert.ok(!names.includes('Nityānanda Dāsa'), 'a man must not appear when a woman was asked for');
    // India East visitor must not see someone who will not take matters from India East
    const ok = await page.evaluate(() => matchList({ lang: 'bn', region: 'inE', gender: 'np' }).every(o => !o.exR.includes('inE')));
    assert.ok(ok);
    const none = await page.evaluate(() => matchList({ lang: 'bn', region: 'inE', gender: 'np' }).map(o => o.id));
    assert.ok(!none.includes('o3'), 'Nityānanda excludes India East, so must be hidden for an India East visitor');
  });

  await test('answering the three questions increments three independent counters, never a combination', async () => {
    const keys = await page.evaluate(() => Object.keys(S.counters).filter(k => /^q_/.test(k)));
    assert.ok(keys.every(k => /^q_(lang|reg|gen)_[a-zA-Z]+$/.test(k)), 'no counter should combine two answers: ' + keys.join(','));
  });

  await test('connection check warns but does not block, and offers two alternatives', async () => {
    await page.click('.profile [data-act=choose]');
    await page.click('[data-act=conn][data-a=some]');
    assert.ok(await page.locator('[data-act=switchTo]').count() <= 2);
    assert.ok(await page.locator('[data-act=carryOn]').isVisible());
    await page.click('[data-act=carryOn]');
    assert.strictEqual(await page.locator('h1').innerText().then(t => /Choose a time/.test(t)), true);
  });

  await test('time slots: all at least 48 hours out and within five weeks', async () => {
    const slots = await page.locator('.slot').evaluateAll(els => els.map(e => +e.dataset.s));
    assert.ok(slots.length > 0);
    const now = Date.now();
    slots.forEach(s => { assert.ok(s >= now + 48 * 3600e3 - 1000, 'slot inside 48h'); assert.ok(s <= now + 35 * 86400e3, 'slot beyond 5 weeks'); });
  });

  await test('slots honour the 60-minute length plus 20-minute gap (80-minute cycle)', async () => {
    const gaps = await page.evaluate(() => { const out = []; OMBUDS.forEach(o => { const s = slotsFor(o); for (let i = 1; i < s.length; i++) if (s[i] - s[i - 1] < 86400e3) out.push((s[i] - s[i - 1]) / 60000); }); return out; });
    assert.ok(gaps.length > 0, 'expected some same-day slot pairs to compare');
    gaps.forEach(g => assert.ok(g >= 80, 'two slots closer than 80 minutes: ' + g));
  });

  let caseNo, firstContact, firstToken, firstOmbuds, seqBefore;
  await test('confirming needs a trainee answer, and no field anywhere asks for a name, email, phone or the matter', async () => {
    await page.click('.slot >> nth=0');
    assert.strictEqual(await page.locator('h1').innerText(), 'Check and confirm');
    await page.click('[data-act=book]');
    assert.ok(await page.locator('.err').count() >= 1, 'the trainee question should be required');
    const labels = (await page.locator('label, legend').allInnerTexts()).join(' ').toLowerCase();
    assert.ok(!/(your name|a name|e-?mail|phone|mobile|whatsapp|address|what happened|describe|reason for|topic|your situation|about your matter)/.test(labels), 'a form field appears to ask for personal details or the matter: ' + labels);
    assert.strictEqual(await page.locator('input[type=text], input[type=email], input[type=tel], textarea').count(), 0, 'no free-text box on the booking form');
    assert.match(await page.locator('.callout').first().innerText(), /do not ask for your name, email address or phone number/i);
  });

  await test('"I can’t find a time" counts a fixed reason and offers earlier times: no inbox, no email, nothing stored about the visitor', async () => {
    await page.click('[data-act=backTime]');
    await page.click('[data-act=noSlot]');
    const modal = page.locator('.modal');
    assert.ok(!/@/.test(await modal.innerText()), 'no email address in the modal');
    assert.strictEqual(await modal.locator('input[type=text], input[type=email], textarea').count(), 0);
    const before = await page.evaluate(() => JSON.stringify([S.users.length, S.contacts.length]));
    await modal.locator('select').selectOption('The time zones did not work');
    await modal.locator('[data-act=sendNoSlot]').click();
    assert.strictEqual(await page.evaluate(() => S.tally.unmet['The time zones did not work']), 1);
    assert.strictEqual(await page.evaluate(() => JSON.stringify([S.users.length, S.contacts.length])), before, 'no user or contact is created');
    await page.click('.modal [data-act=closeModal]');
    await page.click('.slot >> nth=0');
  });

  await test('completing a booking creates the next contact-M and anonymous-user-N, with no name or contact detail, and removes the slot', async () => {
    const slot = await page.evaluate(() => S.flow.slot); firstOmbuds = await page.evaluate(() => S.flow.ombudsId);
    seqBefore = await page.evaluate(() => ({ u: S.seq.u, m: S.seq.m, users: S.users.length, contacts: S.contacts.length }));
    await page.check('input[name=tr][value=no]');
    await page.click('[data-act=book]');
    assert.strictEqual(await page.locator('h1').innerText(), 'You are booked.');
    const h = await page.evaluate(() => location.hash); assert.match(h, /^#ticket\/[0-9a-f]{24}$/); firstToken = h.slice(8);
    const r = await page.evaluate(([b]) => { const c = S.contacts.find(x => x.m === b.m + 1); return { c: JSON.parse(JSON.stringify(c)), u: S.users.find(x => x.n === c.user), seq: S.seq, users: S.users.length, contacts: S.contacts.length } }, [seqBefore]);
    assert.strictEqual(r.c.id, 'contact-' + (seqBefore.m + 1)); assert.strictEqual(r.u.id, 'anonymous-user-' + (seqBefore.u + 1));
    assert.strictEqual(r.users, seqBefore.users + 1); assert.strictEqual(r.contacts, seqBefore.contacts + 1);
    assert.deepStrictEqual(Object.keys(r.u).sort(), ['id', 'lang', 'n', 'region'], 'an anonymous user holds a number, a region and a language, nothing else');
    assert.ok(!Object.keys(r.c).some(k => /name|email|phone|mobile|^contact$|address|ip/i.test(k)), 'the contact has no personal field: ' + Object.keys(r.c));
    assert.ok(await page.evaluate(([o, s]) => !slotsFor(OM[o]).includes(s), [firstOmbuds, slot]), 'booked slot should no longer be offered');
    caseNo = r.c.caseNo; firstContact = r.c.id; assert.match(caseNo, /^\d{4}-\d{4}$/);
  });

  await test('the ticket carries no reason for booking, says it cannot be recovered, and the calendar file says only “Conversation”', async () => {
    const t = await page.locator('main').innerText();
    assert.match(t, /Keep this link/i); assert.match(t, /cannot find it again/i);
    assert.ok(!/(harass|bully|complaint|dispute)/i.test(t));
    const dl = page.waitForEvent('download'); await page.click('#icslink'); const d = await dl;
    assert.strictEqual(d.suggestedFilename(), 'conversation.ics');
    const ics = require('fs').readFileSync(await d.path(), 'utf8');
    assert.match(ics, /BEGIN:VCALENDAR[\s\S]*SUMMARY:Conversation\r\n/); assert.match(ics, /DTSTART:\d{8}T\d{6}Z/); assert.match(ics, /DTEND:\d{8}T\d{6}Z/);
    const name = await page.evaluate(id => OM[S.contacts.find(c => c.id === id).ombuds].name.split(' ')[0], firstContact);
    assert.ok(!ics.includes(name), 'the calendar file must not name the ombuds');
    assert.ok(await page.evaluate(() => /^data:text\/calendar/.test(document.querySelector('#icslink').getAttribute('href'))), 'built in the browser, not fetched');
  });

  await test('a second contact gets the next numbers: the system cannot tell it is the same person', async () => {
    const before = await page.evaluate(() => ({ u: S.seq.u, m: S.seq.m }));
    await page.goto(base + '#book'); await page.click('[data-act=door][data-d=browse]'); await page.click('[data-act=choose] >> nth=1');
    await page.click('[data-act=conn][data-a=none]'); await page.click('.slot >> nth=1');
    await page.check('input[name=tr][value=yes]'); await page.click('[data-act=book]');
    const r = await page.evaluate(() => { const c = S.contacts[S.contacts.length - 1]; return { id: c.id, user: userOf(c).id, tok: location.hash.slice(8) } });
    assert.strictEqual(r.id, 'contact-' + (before.m + 1)); assert.strictEqual(r.user, 'anonymous-user-' + (before.u + 1));
    // cancelling releases the time and keeps the numbered rows, so sequences never reuse a number
    const key = await page.evaluate(() => { const c = S.contacts[S.contacts.length - 1]; return c.ombuds + ':' + c.slot });
    assert.ok(await page.evaluate(k => bookedSlots.has(k), key));
    await page.click('[data-act=askCancel]'); await page.click('[data-act=cancelTicket]');
    assert.match(await page.locator('h1').innerText(), /cancelled/i);
    assert.strictEqual(await page.evaluate(k => bookedSlots.has(k), key), false);
    assert.strictEqual(await page.evaluate(() => S.contacts[S.contacts.length - 1].state), 'cancelled');
    assert.strictEqual(await page.evaluate(() => S.seq.m), before.m + 1);
    await page.goto(base + '#ticket/' + firstToken);
  });

  await test('privacy inspector shows zero network requests', async () => {
    await page.click('#inspbtn');
    assert.strictEqual((await page.locator('#netnum').innerText()).trim(), '0');
    assert.match(await page.locator('#insp').innerText(), /No name, no email, no phone number/);
    await page.click('#insp [data-act=togInsp]');
  });

  await test('the Ombuds Services Survey has the ten questions, stores fixed answers with a week-rounded date and no key, and refuses contact details', async () => {
    await page.click('[data-act=simCall]');
    assert.match(await page.locator('h1').innerText(), /After the conversation/);
    await page.click('[data-act=openSurvey]');
    assert.strictEqual(await page.locator('fieldset.svq').count(), 9);
    assert.match(await page.locator('main').innerText(), /Please consider adding some additional feedback or comments/);
    assert.strictEqual(await page.locator('input[name="sv-q1"]').count(), 2, 'Q1 is yes/no');
    assert.strictEqual(await page.locator('input[name="sv-q3"]').count(), 5, 'Q3 is a five-point scale');
    assert.strictEqual(await page.locator('input[name="sv-q9"]').count(), 6);
    await page.click('[data-act=subSurvey]');
    assert.match(await page.locator('.callout.bad').innerText(), /at least one/);
    const before = await page.evaluate(() => S.survey.length);
    for (const k of ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9']) await page.locator(`input[name="sv-${k}"]`).first().check();
    await page.fill('#svc', 'Please call me on +91 98765 43210');
    await page.click('[data-act=subSurvey]');
    assert.match(await page.locator('.callout.bad').innerText(), /email address or a phone number/);
    assert.strictEqual(await page.evaluate(() => S.survey.length), before, 'nothing stored while a contact detail is present');
    await page.fill('#svc', 'It helped to talk.'); await page.click('[data-act=subSurvey]');
    const row = await page.evaluate(() => S.survey[S.survey.length - 1]);
    assert.strictEqual(await page.evaluate(() => S.survey.length) - before, 1);
    assert.deepStrictEqual(Object.keys(row).sort(), ['a', 'comment', 'week']);
    assert.deepStrictEqual(Object.keys(row.a).sort(), ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9']);
    assert.strictEqual(new Date(row.week).getUTCDay(), 1, 'timestamp must be rounded to a Monday');
    assert.strictEqual(await page.evaluate(() => scanKeys()), 0);
    assert.strictEqual(await page.evaluate(() => JSON.stringify(Object.keys(S.survey[S.survey.length - 1]))).then(s => /ticket|token|contact|user/.test(s)), false);
    await page.click('a:has-text("Back to your ticket")');
    await page.locator('h1', { hasText: 'After the conversation' }).waitFor();
    assert.match(await page.locator('main').innerText(), /Thank you for the survey/);
  });

  await test('self-guided pathway: no text input, counts only the ending, never the sequence', async () => {
    await hash(page, 'think');
    assert.strictEqual(await page.locator('input[type=text], textarea').count(), 0);
    const before = await page.evaluate(() => S.counters.path_E1 || 0);
    // peer -> unsure -> not yet -> not sure it is safe? choose "no"
    await page.click('.pathq .door >> nth=0');
    await page.click('.pathq .door >> nth=3');
    await page.click('.pathq .door >> nth=0');
    await page.click('.pathq .door >> nth=1');
    assert.match(await page.locator('h2').first().innerText(), /Take some time first/);
    assert.strictEqual(await page.evaluate(() => S.counters.path_E1) - before, 1);
    const dl = await page.locator('.endlist dt').allInnerTexts();
    assert.deepStrictEqual(dl, ['What happens', 'Who decides', 'How long', 'What it asks of you', 'If it goes badly']);
    assert.ok(await page.locator('main a.btn.primary[href="#book"]').isVisible(), 'every ending has the same door back to a person');
    // a protection answer always leads to the outside-ISKCON ending
    await page.click('[data-act=pathRestart]');
    await page.click('.pathq .door >> nth=1'); await page.click('.pathq .door >> nth=2'); await page.click('.pathq .door >> nth=2'); await page.click('.pathq .door >> nth=0');
    assert.match(await page.locator('h2').first().innerText(), /outside ISKCON/i);
    const allEndings = await page.evaluate(() => { const seen = new Set(); for (const who of ['peer', 'auth', 'group']) for (const want of ['repair', 'heard', 'decision', 'unsure']) for (const tried of ['nothing', 'talked', 'formal']) for (const protect of ['yes', 'no', 'unsure']) seen.add(endingOf({ who, want, tried, protect })); return [...seen].sort(); });
    assert.deepStrictEqual(allEndings, ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7']);
  });

  await test('language switch localises headline text and month names', async () => {
    await hash(page, 'home');
    for (const [lang, h1] of [['ru', 'Место, где можно всё обдумать.'], ['hi', 'सोचने-समझने के लिए एक जगह।'], ['bn', 'ভেবে দেখার জন্য একটি জায়গা।'], ['es', 'Un lugar para pensarlo con calma.']]) {
      await page.selectOption('#langsel', lang);
      assert.strictEqual(await page.locator('h1').first().innerText(), h1);
    }
    const m = await page.evaluate(() => fmtL(Date.UTC(2026, 4, 14, 12), 'ru-RU', { day: 'numeric', month: 'long', timeZone: 'UTC' }));
    assert.strictEqual(m, '14 мая');
    const hi = await page.evaluate(() => fmtL(Date.UTC(2026, 4, 14, 12), 'hi-IN', { month: 'long', timeZone: 'UTC' }));
    assert.strictEqual(hi, 'मई');
    await page.selectOption('#langsel', 'en');
  });

  console.log('\nBehind the scenes');
  await test('ombuds workspace shows only contact numbers and booking logistics: no name, no contact detail, no topic anywhere', async () => {
    await page.evaluate(id => { S.staff.asOmbuds = S.contacts.find(c => c.id === id).ombuds; }, firstContact);
    await hash(page, 'staff-ombuds');
    const heads = (await page.locator('table.t thead th').allInnerTexts()).join('|').toLowerCase();
    assert.ok(!/(topic|reason|subject matter|issue|name|email|phone|address)/.test(heads), heads);
    const row = page.locator('tr', { hasText: firstContact });
    assert.strictEqual(await row.count(), 1, 'the new booking must be visible to its ombuds');
    assert.match(await row.innerText(), /anonymous-user-\d+/);
    assert.ok(!/@/.test(await page.locator('table.t').innerText()), 'no email address anywhere in the workspace');
  });

  await test('another ombuds’s records are denied', async () => {
    await page.click('[data-act=otherRec]');
    assert.match(await page.locator('.callout.bad').innerText(), /Denied/);
  });

  await test('closing is four short steps of fixed choices, checks each step, confirms destroyed notes and prompts the mentor from the third conversation', async () => {
    await page.locator('tr', { hasText: firstContact }).locator('[data-act=openClose]').click();
    const form = page.locator('#closeform');
    assert.strictEqual(await form.locator('textarea, input[type=text]').count(), 0, 'closing form must have no free text');
    assert.strictEqual(await form.locator('.stepsbar li').count(), 4);
    assert.match(await form.innerText(), new RegExp(caseNo));
    // step 1: the case
    assert.strictEqual(await form.locator('#c-open').count(), 1); assert.strictEqual(await form.locator('#c-closed').count(), 1);
    assert.match(await form.locator('#c-days').innerText(), /^\d+$/, 'case days are worked out, not typed');
    assert.strictEqual(await form.locator('#c-reg option').count(), 14, 'twelve locations from the document, “Elsewhere”, and a prompt');
    assert.strictEqual(await form.locator('input[name=vc]').count(), 6);
    await page.click('[data-act=closeNext]');
    assert.match(await form.locator('.callout.bad').innerText(), /visitor category/);
    await page.selectOption('#c-reg', 'eu'); await page.selectOption('#c-vis', '2');
    await page.check('input[name=vc][value="Congregation"]'); await page.check('#r3');
    assert.match(await form.innerText(), /Recorded as\s*high/);
    await page.click('[data-act=closeNext]');
    // step 2: issues, several groups
    assert.match(await form.locator('h2').innerText(), /Closing record/);
    await page.click('[data-act=closeNext]');
    assert.match(await form.locator('.callout.bad').innerText(), /at least one issue/);
    assert.strictEqual(await form.locator('.acch').count(), 9, 'nine issue groups');
    await page.click('#acc-2'); await page.check('input[data-code="2.0"]');
    assert.strictEqual(await page.locator('input[data-code="2.0"]').isChecked(), true, 'the choice survives the redraw');
    await page.click('#acc-0'); await page.check('input[data-code="0.1"]');
    assert.deepStrictEqual(await page.evaluate(() => S.close.issues), ['0.1', '2.0']);
    await page.click('[data-act=closeNext]');
    // step 3: what the ombuds did
    assert.strictEqual(await form.locator('[data-act=togSvc]').count(), 7, 'seven case-resolution options');
    await page.click('[data-act=closeNext]');
    assert.match(await form.locator('.callout.bad').innerText(), /what you did/);
    await page.check('[data-act=togSvc][data-i="1"]'); await page.check('[data-act=togSvc][data-i="6"]');
    await page.click('#acc-imp'); assert.strictEqual(await form.locator('[data-act=togImp]').count(), 13); await page.check('[data-act=togImp][data-i="0"]');
    await page.click('[data-act=closeNext]');
    // step 4: the conversations
    assert.strictEqual(await form.locator('textarea, input[type=text]').count(), 0);
    await page.click('[data-act=doClose]');
    assert.match(await form.locator('.callout.bad').innerText(), /private notes are destroyed/);
    await page.selectOption('#c-n', '3');
    assert.ok(await page.locator('#c-men').isVisible(), 'mentor field appears at conversation 3');
    await page.check('[data-model="close.destroy"]');
    const before = await page.evaluate(() => S.cases.length);
    await page.click('[data-act=doClose]');
    assert.strictEqual(await page.evaluate(() => S.cases.length) - before, 1);
    const row = await page.evaluate(n => S.cases.find(c => c.n === n), caseNo);
    assert.strictEqual(row.risk, 'high'); assert.strictEqual(row.reg, 'eu'); assert.strictEqual(row.visitors, 2); assert.strictEqual(row.vcat, 'Congregation');
    assert.deepStrictEqual(row.issues, ['0.1', '2.0']); assert.deepStrictEqual(row.services, ['Coaching', 'Listening (no option chosen)']); assert.strictEqual(row.impacts.length, 1);
    assert.ok(row.closed >= row.opened, 'dates are in order');
    assert.ok(!Object.keys(row).some(k => /name|contact|email|phone|user|token|ticket/i.test(k)), 'case row must identify nobody and point at nobody: ' + Object.keys(row));
    const c = await page.evaluate(id => S.contacts.find(x => x.id === id), firstContact);
    assert.strictEqual(c.state, 'done'); assert.strictEqual(c.caseNo, null, 'the contact keeps no pointer to the case row');
  });

  await test('risk level triggers nothing: no alert, flag or escalation field exists', async () => {
    const row = await page.evaluate(n => S.cases.find(c => c.n === n), caseNo);
    assert.ok(!Object.keys(row).some(k => /alert|flag|escalat|notify/i.test(k)));
    assert.ok(await page.evaluate(() => !document.body.innerText.match(/escalated to the director/i)));
  });

  await test('an ombuds can say a new contact is someone they have spoken with before: the two share one anonymous user', async () => {
    const r0 = await page.evaluate(id => { const p = S.contacts.find(c => c.id === id); const k = newContact({ ombuds: p.ombuds, slot: Date.now() - 3600e3, region: 'eu', lang: 'en', token: 'relinktest' }); return { prev: p.id, prevUser: p.user, k: k.id, kUser: k.user, users: S.users.length } }, firstContact);
    assert.notStrictEqual(r0.prevUser, r0.kUser, 'the system alone gives the new contact a new anonymous user');
    await page.evaluate(id => { S.staff.asOmbuds = S.contacts.find(c => c.id === id).ombuds; render(); }, r0.k);
    await page.locator('tr', { hasText: r0.k }).locator('[data-act=openClose]').click();
    await page.evaluate(() => { const c = S.close; c.reg = 'eu'; c.vcat = 'Employee'; c.issues = ['1.0']; c.services = ['Coaching']; c.step = 4; render(); });
    await page.selectOption('#c-rl', r0.prev);
    assert.strictEqual(await page.locator('#c-n').inputValue(), '2', 'the number of conversations is worked out');
    await page.check('[data-model="close.destroy"]'); await page.click('[data-act=doClose]');
    if (process.env.DBG) console.log('DBG', await page.evaluate(() => JSON.stringify({ err: S.close && S.close.err, closed: S.closed })));
    const r1 = await page.evaluate(([a, b]) => ({ same: S.contacts.find(c => c.id === a).user === S.contacts.find(c => c.id === b).user, users: S.users.length, row: S.cases[S.cases.length - 1].nconv }), [r0.prev, r0.k]);
    assert.strictEqual(r1.same, true); assert.strictEqual(r1.users, r0.users - 1, 'the orphaned anonymous user is removed'); assert.strictEqual(r1.row, 2);
  });

  await test('after 30 days a contact loses its exact time and ticket; the numbered rows and the case row survive', async () => {
    const q = await page.evaluate(id => { const c = S.contacts.find(x => x.id === id); return { slot: !!c.slot, tok: !!c.tokenHash, inTokens: !!S.byToken[c.tokenHash] } }, firstContact);
    assert.deepStrictEqual(q, { slot: true, tok: true, inTokens: true });
    await hash(page, 'staff-data');
    await page.click('button[data-act=clk][data-d="7"]');
    assert.ok(await page.evaluate(id => S.contacts.find(x => x.id === id).slot !== null, firstContact), 'must still exist at +7 days');
    await page.click('button[data-act=clk][data-d="35"]');
    const r = await page.evaluate(id => { const c = S.contacts.find(x => x.id === id); return { c: JSON.parse(JSON.stringify(c)), user: S.users.some(u => u.n === c.user), cases: S.cases.some(x => x.n === c.caseNo) } }, firstContact);
    assert.strictEqual(r.c.state, 'generalised'); assert.strictEqual(r.c.slot, null); assert.strictEqual(r.c.tokenHash, null);
    assert.ok(r.c.id === firstContact && r.user, 'contact-M and anonymous-user-N stay as numbers');
    assert.ok(await page.evaluate(n => S.cases.some(c => c.n === n), caseNo), 'case row must remain');
    assert.match(await page.locator('.callout.ok').innerText(), /generalised/);
    await page.goto(base + '#ticket/' + firstToken);
    assert.match(await page.locator('h1').innerText(), /cannot find this ticket/i);
  });

  await test('records sheet structure is protected', async () => {
    await hash(page, 'staff-data');
    await page.click('[data-act=dtab][data-t=cases]');
    await page.click('[data-act=addCol]');
    assert.match(await page.locator('.callout.bad').innerText(), /Protected range/);
  });

  await test('survey stores contain no key that could link to a booking', async () => {
    await hash(page, 'staff-data');
    await page.click('[data-act=dtab][data-t=survey]');
    await page.click('[data-act=keyScan]');
    assert.match(await page.locator('.callout').first().innerText(), /Matches found: 0/);
  });

  await test('annual report: no figure below five cases is ever returned', async () => {
    await hash(page, 'staff-annual');
    const r = await page.evaluate(() => {
      let small = 0, leaked = 0;
      for (let i = 0; i < CATS.length; i++) for (const reg of REP_REGIONS) for (const vc of ['', ...VISITOR_CATS]) {
        const n = closedWin().filter(c => hasCat(c, i) && REG[c.reg].rep === reg && (!vc || c.vcat === vc)).length;
        const q = queryReport({ cat: String(i), reg, vc });
        if (n < 5) { small++; if (!q.withheld || q.count !== undefined) leaked++; } else if (q.count !== n) leaked++;
      }
      return { small, leaked };
    });
    assert.ok(r.small > 0, 'data should contain small cells for this to mean something');
    assert.strictEqual(r.leaked, 0);
    await page.click('[data-act=smallQ]');
    assert.match(await page.locator('.callout.bad').last().innerText(), /fewer than five/);
  });

  await test('published breakdowns never contain a group below five', async () => {
    const ok = await page.evaluate(() => { const cs = closedWin(); const lists = [publish(CATS.map((c, i) => [c[0], cs.filter(x => hasCat(x, i)).length])), publish(REP_REGIONS.map(r => [r, cs.filter(x => REG[x.reg].rep === r).length])), publish(VISITOR_CATS.map(v => [v, cs.filter(x => x.vcat === v).length]))]; return lists.every(l => l.every(r => r[1] >= 5)); });
    assert.ok(ok);
  });

  await test('capacity dashboard, funnel and annual report render with data', async () => {
    for (const r of ['staff-capacity', 'staff-funnel', 'staff-annual']) {
      await hash(page, r);
      assert.ok(await page.locator('.bar2').count() > 5, r + ' should draw bars');
    }
  });

  await test('permissions: nobody, including the Director, can read a conversation or use an override', async () => {
    await hash(page, 'staff-access');
    for (const role of ['Director', 'Project Manager', 'Developer', 'Ombuds', 'Mentor', 'concerns@ holder'])
      for (const act of ['read_conv', 'case_content', 'override', 'recording'])
        assert.strictEqual(await page.evaluate(([r, a]) => tryAccess(r, a).ok, [role, act]), false, `${role} should not be able to ${act}`);
    await page.click('[data-act=tryA][data-r=Director][data-a=read_conv]');
    assert.match(await page.locator('.callout.bad').innerText(), /No such view exists/);
    assert.strictEqual(await page.evaluate(() => tryAccess('Ombuds', 'other_records').ok), false);
    assert.strictEqual(await page.evaluate(() => tryAccess('Mentor', 'case_content').ok), false);
    assert.strictEqual(await page.evaluate(() => tryAccess('Ombuds', 'own_bookings').ok), true);
  });

  await test('the anonymous concerns form refuses contact details, takes a fixed category, and the message is deleted once logged', async () => {
    await hash(page, 'contact');
    const form = page.locator('#concernform');
    assert.strictEqual(await form.locator('input[type=text], input[type=email], input[type=tel]').count(), 0, 'no name or contact field');
    assert.ok(!/schedule@|concerns@/.test(await page.locator('main').innerText()), 'no email inboxes are advertised');
    await form.locator('#cn-c').selectOption('Boundaries'); await form.locator('#cn-t').fill('Write to me at someone@example.org');
    await form.locator('[data-act=sendConcern]').click();
    assert.match(await form.locator('.callout.bad').innerText(), /email address or a phone number/);
    await form.locator('#cn-t').fill('The call ran well over time.'); await form.locator('[data-act=sendConcern]').click();
    assert.match(await form.innerText(), /thank you/i);
    await hash(page, 'staff-inbox');
    const n = await page.locator('[data-act=resConc]').count(); assert.ok(n >= 2, 'both the seeded and the new message are waiting');
    await page.click('[data-act=resConc] >> nth=0'); await page.click('[data-act=resConc] >> nth=0');
    const r = await page.evaluate(() => ({ gone: S.inboxes.conc.filter(m => m.gone && m.text === null).length, all: S.inboxes.conc.length }));
    assert.strictEqual(r.gone, r.all);
  });

  await test('reference data follows the documents: 12 locations, 9 issue groups, 7 resolution options, 13 impacts, the ten-question survey', async () => {
    const r = await page.evaluate(() => ({ reg: REGIONS.map(x => x.label), cats: CATS.map(c => [c[0], c[1].length]), svc: SERVICES, imp: IMPACTS.length, vc: VISITOR_CATS, sv: SURVEY.length, issues: ISSUES.length }));
    assert.strictEqual(r.reg.length, 13); ['India North / Nepal', 'India South / Sri Lanka', 'India East / Bangladesh', 'India West', 'US and Canada', 'Europe', 'Latin America', 'Africa', 'China', 'Russia', 'South-East Asia', 'Far East / Taiwan'].forEach(l => assert.ok(r.reg.includes(l), l));
    assert.deepStrictEqual(r.cats.map(c => c[0]), ['Leadership and governance', 'Communication and relationships', 'Harassment and misconduct', 'Service and volunteer issues', 'Financial and legal', 'Spiritual standards', 'Child protection and safeguarding', 'Facilities and environment', 'Organizational development']);
    assert.deepStrictEqual(r.cats.map(c => c[1]), [8, 6, 8, 8, 8, 8, 4, 5, 6]);
    assert.deepStrictEqual(r.svc, ['Information provided', 'Coaching', 'Shuttle diplomacy', 'Facilitated dialogue', 'Referral', 'Formal process', 'Listening (no option chosen)']);
    assert.strictEqual(r.imp, 13); assert.strictEqual(r.vc.length, 6); assert.strictEqual(r.sv, 9); assert.strictEqual(r.issues, 61);
  });

  await test('consent copy is version-locked: release is blocked until all five languages catch up', async () => {
    await hash(page, 'staff-build');
    assert.strictEqual(await page.locator('[data-act=release]').isDisabled(), false);
    await page.click('[data-act=editEn]');
    assert.strictEqual(await page.locator('[data-act=release]').isDisabled(), true);
    for (const l of ['hi', 'bn', 'es']) await page.click(`[data-act=retr][data-l=${l}]`);
    assert.strictEqual(await page.locator('[data-act=release]').isDisabled(), true, 'one stale translation must still block');
    await page.click('[data-act=retr][data-l=ru]');
    assert.strictEqual(await page.locator('[data-act=release]').isDisabled(), false);
  });

  await test('in-app acceptance tests: all runnable specification tests pass', async () => {
    await hash(page, 'staff-tests');
    await page.click('[data-act=runAll]');
    const res = await page.evaluate(() => Object.entries(S.staff.tests).map(([n, r]) => [n, r.pass]));
    assert.strictEqual(res.length, 7);
    res.forEach(([n, p]) => assert.ok(p, 'acceptance test ' + n + ' failed'));
  });

  await test('reset restores the seeded demo state', async () => {
    await page.click('[data-act=reset]');
    assert.strictEqual(await page.evaluate(() => S.contacts.some(c => c.name === 'Lotus')), false);
    assert.strictEqual(await page.evaluate(() => S.staff.dayShift), 0);
  });

  console.log('\nOmbuds onboarding');
  const httpGet = p => new Promise((res, rej) => require('http').get(base.replace(/\/$/, '') + p, r => { let b = ''; r.on('data', d => b += d); r.on('end', () => res(b)); }).on('error', rej));
  const settle = () => page.waitForTimeout(60);
  const openAs = async id => { if (!(await page.evaluate(() => document.querySelector('.protoctl').open))) await page.click('.protoctl summary'); await page.selectOption('#meas', id); await settle(); };
  let newId = null;

  await test('admin panel lists the whole panel with legal names that appear nowhere on the visitor site', async () => {
    await hash(page, 'staff-onboard');
    assert.strictEqual(await page.locator('tr[data-id]').count(), 12);
    assert.match(await page.locator('.pane').innerText(), /Mahesh Patel/);
    const legal = await page.evaluate(() => OMBUDS.map(o => o.legal));
    assert.strictEqual(legal.length, 12); assert.ok(legal.every(Boolean));
    await hash(page, 'book'); await page.click('[data-act=door][data-d=browse]');
    const visible = await page.evaluate(() => document.body.innerText);
    legal.forEach(n => assert.ok(!visible.includes(n), 'legal name leaked onto the visitor site: ' + n));
    const src = await httpGet('/js/visitor.js'); assert.ok(!/\.legal\b/.test(src), 'visitor.js must never read the legal name');
    const pub = await page.evaluate(() => OMBUDS.map(o => JSON.stringify(publicProfile(o))).join(''));
    legal.forEach(n => assert.ok(!pub.includes(n)));
    await page.click('[data-act=reset]');
  });

  await test('only the Director and Project Manager may see legal names; only the Project Manager approves', async () => {
    const r = await page.evaluate(() => ROLES.map(x => [x, tryAccess(x, 'legal_name').ok, tryAccess(x, 'approve_profile').ok, tryAccess(x, 'own_avail').ok]));
    const by = Object.fromEntries(r.map(x => [x[0], x.slice(1)]));
    assert.deepStrictEqual(by['Director'], [true, false, false]);
    assert.deepStrictEqual(by['Project Manager'], [true, true, false]);
    assert.deepStrictEqual(by['Ombuds'], [false, false, true]);
    assert.deepStrictEqual(by['Developer'], [false, false, false]);
    assert.deepStrictEqual(by['Mentor'].slice(0, 2), [false, false]);
  });

  await test('inviting: bad email is refused; a good invitation creates someone visitors cannot see', async () => {
    await hash(page, 'staff-onboard');
    await page.fill('#invn', 'Test Devotee'); await page.fill('#inve', 'not-an-email'); await page.click('[data-act=invite]');
    assert.match(await page.locator('.callout.bad').innerText(), /email address/);
    await page.fill('#inve', 'test.devotee@mail.example'); await page.click('[data-act=invite]');
    assert.match(await page.locator('.callout.ok').first().innerText(), /invitation sent/i);
    newId = await page.evaluate(() => S.onb.msg.id);
    assert.strictEqual(await page.evaluate(() => ONBOARD.length), 1);
    assert.strictEqual(await page.evaluate(() => OMBUDS.length), 12, 'an invitee must not join the live panel');
    assert.strictEqual(await page.evaluate(() => JSON.stringify(ONBOARD[0]).includes('mail.example')), false, 'the invitation address is not kept');
  });

  await test('self-service: an incomplete submission says exactly what is missing', async () => {
    await page.click('[data-act=openMe]'); await settle();
    assert.strictEqual(await page.evaluate(() => location.hash), '#me');
    await page.click('[data-act=meSubmit]');
    const t = await page.locator('.callout.bad').innerText();
    ['diksha name', 'legal name', 'language', 'skill', 'introduction'].forEach(w => assert.match(t, new RegExp(w, 'i')));
    assert.strictEqual(await page.evaluate(id => findOm(id).status, newId), 'invited');
  });

  await test('self-service: filling in details sends them for approval, and the person is still not live', async () => {
    await page.fill('#f-name', 'Tulasī Test Dāsa'); await page.fill('#f-legal', 'Tara Testing');
    await page.check('input[name=f-g][value=f]');
    await page.selectOption('#f-reg', 'lac'); await page.selectOption('#lv-pt', 'fluent'); await page.selectOption('#lv-es', 'working');
    await page.click('[data-act=mePick][data-k=skills][data-v="Mediation"]');
    await page.click('[data-act=mePick][data-k=domains][data-v="Education"]');
    await page.selectOption('#f-yrs', '5–10'); await page.selectOption('#f-oyrs', '<2'); await page.selectOption('#f-seva', 'Educator');
    await page.fill('#f-bio', 'I teach for a living and I listen for a calling. Take your time with me.');
    await page.click('[data-act=meSubmit]'); await settle();
    const s = await page.evaluate(id => { const o = findOm(id); return { st: o.status, pend: !!o.pending, live: OMBUDS.includes(o), langs: o.langs }; }, newId);
    assert.deepStrictEqual([s.st, s.pend, s.live, s.langs], ['review', true, false, []]);
    assert.match(await page.locator('.callout.warn').first().innerText(), /waiting for approval/i);
  });

  await test('availability: hours are cut into 60-minute slots with a 20-minute gap', async () => {
    await page.click('[data-act=meTab][data-t=avail]'); await page.click('[data-act=meView][data-v=typical]');
    await page.click('[data-act=meOpenDay][data-key=t1]');
    await page.selectOption('#wf-t', '1080'); await page.selectOption('#wt-t', '1260');
    assert.match(await page.locator('.wineditor').innerText(), /18:00, 19:20/);
    await page.click('[data-act=meAddWin][data-kind=t]'); await settle();
    assert.deepStrictEqual(await page.evaluate(id => startsOf(findOm(id).tpl[1]), newId), [1080, 1160]);
  });

  await test('availability: a window that is too short, or too close to another, is refused', async () => {
    await page.selectOption('#wf-t', '1260'); await page.selectOption('#wt-t', '1350'); await page.click('[data-act=meAddWin][data-kind=t]');
    assert.match(await page.locator('.callout.bad').innerText(), /too close/);
    await page.selectOption('#wf-t', '1320'); await page.selectOption('#wt-t', '1350'); await page.click('[data-act=meAddWin][data-kind=t]');
    assert.match(await page.locator('.callout.bad').innerText(), /at least 60 minutes/);
    assert.strictEqual(await page.evaluate(id => findOm(id).tpl[1].length, newId), 1);
    await page.selectOption('#wf-t', '1290'); await page.selectOption('#wt-t', '1350'); await page.click('[data-act=meAddWin][data-kind=t]');
    assert.strictEqual(await page.evaluate(id => findOm(id).tpl[1].length, newId), 2, 'a window starting 30 minutes after the previous one is allowed');
    await page.click('[data-act=meDelWin][data-kind=t][data-i="1"]');
    assert.strictEqual(await page.evaluate(id => findOm(id).tpl[1].length, newId), 1);
  });

  await test('the Project Manager approves; the person goes live and matching picks them up', async () => {
    const before = await page.evaluate(() => matchList({ lang: 'pt', region: 'inE', gender: 'np' }).length);
    await hash(page, 'staff-onboard');
    assert.match(await page.locator('[data-review]').innerText(), /Tara Testing/);
    await page.click('[data-act=approve]'); await settle();
    const s = await page.evaluate(id => ({ n: OMBUDS.length, st: findOm(id).status, langs: findOm(id).langs, exR: findOm(id).exR, after: matchList({ lang: 'pt', region: 'inE', gender: 'np' }).length }), newId);
    assert.deepStrictEqual([s.n, s.st, s.langs, s.exR, s.after - before], [13, 'live', ['pt'], ['lac'], 1], '“working knowledge” must not count for matching');
  });

  await test('a visitor can find the new ombuds and sees only bookable times that follow the rules', async () => {
    await hash(page, 'book'); await page.click('[data-act=door][data-d=narrow]');
    await page.selectOption('#q1', 'pt'); await page.selectOption('#q2', 'inE'); await page.check('input[name=q3][value=np]'); await page.click('[data-act=match]');
    assert.ok((await page.locator('.profile h3', { hasText: 'Tulasī Test Dāsa' }).count()) === 1);
    const card = await page.locator('.profile', { hasText: 'Tulasī Test Dāsa' }).innerText();
    assert.match(card, /Mediation/); assert.match(card, /Education/); assert.ok(!/Educator|Tara Testing/.test(card), 'role is hidden unless chosen, legal name never shown');
    const r = await page.evaluate(id => { const o = findOm(id), s = slotsFor(o); return { n: s.length, ok: s.every(x => { const d = new Date(x + o.off * 60000); return d.getUTCDay() === 1 && ['18:00', '19:20'].includes(String(d.getUTCHours()).padStart(2, '0') + ':' + String(d.getUTCMinutes()).padStart(2, '0')) && x >= Date.now() + 48 * 3600e3 - 1000 && x <= Date.now() + 35 * 86400e3; }) }; }, newId);
    assert.ok(r.n >= 6, 'about five Mondays x 2 times'); assert.ok(r.ok);
    await page.click(`[data-act=choose][data-id=${newId}]`); await page.click('[data-act=conn][data-a=none]');
    assert.ok(await page.locator('.slot').count() >= 2);
    await page.click('[data-act=reset]');
  });

  await test('the 48-hour notice and 5-week horizon hold for every ombuds, whatever they set', async () => {
    const r = await page.evaluate(() => OMBUDS.every(o => slotsFor(o).every(s => s >= Date.now() + 48 * 3600e3 - 1000 && s <= Date.now() + 35 * 86400e3)));
    assert.ok(r);
  });

  await test('closing one time, a whole day, or going away changes what visitors can book at once', async () => {
    await hash(page, 'me'); await openAs('o5');
    await page.click('[data-act=meWk][data-i="1"]');
    const n0 = await page.evaluate(() => slotsFor(OM.o5).length);
    const chip = page.locator('.slotchip[data-state=on]').first(); const key = await chip.getAttribute('data-date');
    await chip.click(); await settle();
    assert.strictEqual(await page.evaluate(() => slotsFor(OM.o5).length), n0 - 1);
    assert.ok(await page.locator('.slotchip[data-state=off]').count() >= 1);
    await page.click(`[data-act=meReset][data-key="${key}"]`); await settle();
    assert.strictEqual(await page.evaluate(() => slotsFor(OM.o5).length), n0);
    await page.click(`[data-act=meDayOff][data-key="${key}"]`); await settle();
    assert.ok(await page.evaluate(() => slotsFor(OM.o5).length) < n0);
    await page.click('[data-act=meAway]'); await settle();
    const wk1 = await page.evaluate(() => { const d = weekDays(OM.o5, 1).map(dkey); return slotsFor(OM.o5).filter(s => d.includes(new Date(s + OM.o5.off * 60000).toISOString().slice(0, 10))).length; });
    assert.strictEqual(wk1, 0);
  });

  await test('booked times are locked: they cannot be closed from the phone', async () => {
    await openAs('o1');
    const states = [];
    for (const w of ['0', '1']) { await page.click(`[data-act=meWk][data-i="${w}"]`); states.push(...await page.evaluate(() => [...document.querySelectorAll('.slotchip')].map(b => [b.dataset.state, b.disabled]))); }
    const booked = states.filter(s => s[0] === 'booked');
    assert.ok(booked.length >= 1, 'a booked time should show as booked'); assert.ok(booked.every(s => s[1]), 'booked times must be disabled');
  });

  await test('copying a week to the next weeks repeats its changes', async () => {
    await openAs('o3'); await page.click('[data-act=meWk][data-i="1"]');
    const key = await page.locator('.slotchip[data-state=on]').first().getAttribute('data-date');
    await page.click(`[data-act=meDayOff][data-key="${key}"]`); await settle();
    await page.selectOption('#copyn', '2'); await page.click('[data-act=meCopyWeek]'); await settle();
    const r = await page.evaluate(k => { const o = OM.o3, t = new Date(k + 'T00:00:00Z').getTime(); return [7, 14].map(d => JSON.stringify(o.ovr[new Date(t + d * 86400e3).toISOString().slice(0, 10)])); }, key);
    assert.deepStrictEqual(r, ['[]', '[]']);
  });

  await test('a change to a live profile waits for approval; visitors keep seeing the old one', async () => {
    await openAs('o2'); await page.click('[data-act=meTab][data-t=details]');
    const oldBio = await page.evaluate(() => OM.o2.bio);
    await page.fill('#f-bio', 'A new introduction that is certainly more than forty characters long.');
    await page.click('[data-act=meSubmit]'); await settle();
    assert.strictEqual(await page.evaluate(() => OM.o2.bio), oldBio);
    await hash(page, 'staff-onboard');
    const rv = await page.locator('[data-review=o2]').innerText();
    assert.match(rv, /Introduction/); assert.ok(!/Languages/.test(rv), 'only what changed is listed');
    await page.click('[data-review=o2] [data-act=approve]'); await settle();
    assert.match(await page.evaluate(() => OM.o2.bio), /A new introduction/);
  });

  await test('sending a profile back returns it, with the reason and the answers kept', async () => {
    await hash(page, 'me'); await openAs('o4'); await page.click('[data-act=meTab][data-t=details]');
    await page.fill('#f-bio', 'Another introduction that is longer than the forty characters needed.'); await page.click('[data-act=meSubmit]'); await settle();
    await hash(page, 'staff-onboard');
    await page.selectOption('#sb-o4', 'Please shorten your introduction'); await page.click('[data-act=sendBack][data-id=o4]'); await settle();
    await hash(page, 'me');
    assert.match(await page.locator('.callout.warn').first().innerText(), /shorten your introduction/);
    assert.strictEqual(await page.inputValue('#f-bio') .then(v => v.startsWith('Another')), true);
  });

  await test('pausing removes someone from every visitor list; resuming brings them back; bookings keep their ombuds', async () => {
    await hash(page, 'staff-onboard'); await page.click('[data-act=pauseOm][data-id=o9]'); await settle();
    assert.deepStrictEqual(await page.evaluate(() => [OMBUDS.length, matchList({ lang: 'en', region: 'inN', gender: 'm' }).some(o => o.id === 'o9'), !!OM.o9]), [11, false, true]);
    await page.click('[data-act=resumeOm][data-id=o9]'); await settle();
    assert.strictEqual(await page.evaluate(() => OMBUDS.length), 12);
  });

  await test('the monthly limit changes at once, without approval', async () => {
    await hash(page, 'me'); await openAs('o6'); await page.click('[data-act=meTab][data-t=details]');
    await page.selectOption('#f-limit', '5');
    assert.strictEqual(await page.evaluate(() => OM.o6.limit), 5);
    assert.strictEqual(await page.evaluate(() => typeof OM.o6.limit), 'number');
  });

  await test('phone: self-service screens fit 390px wide, with tap targets of at least 44px', async () => {
    const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const m = await mctx.newPage(); const errs = []; m.on('pageerror', e => errs.push(e.message));
    await m.goto(base + '#me'); await m.waitForTimeout(100);
    const probe = () => m.evaluate(() => ({ over: document.documentElement.scrollWidth - innerWidth,
      small: [...document.querySelectorAll('.me button, .me select, .me summary, .me textarea, .me input[type=text], .me .choice')].filter(e => e.offsetParent && e.getBoundingClientRect().height < 43.5).map(e => (e.className || e.tagName) + ':' + Math.round(e.getBoundingClientRect().height)) }));
    const seen = [];
    for (const [step, sel] of [['availability', null], ['week 2', '[data-act=meWk][data-i="1"]'], ['change hours', '[data-act=meOpenDay] >> nth=0'], ['usual week', '[data-act=meView][data-v=typical]'], ['details', '[data-act=meTab][data-t=details]'], ['preview', '[data-act=meTab][data-t=preview]']]) {
      if (sel === '[data-act=meView][data-v=typical]') await m.click('[data-act=meTab][data-t=avail]');
      if (sel) await m.click(sel); await m.waitForTimeout(40);
      const r = await probe(); seen.push([step, r.over, r.small.slice(0, 4)]);
    }
    assert.deepStrictEqual(seen.filter(s => s[1] > 0 || s[2].length), []);
    assert.deepStrictEqual(errs, []); await mctx.close();
  });

  await test('nothing was ever sent over the network after the page loaded', async () => {
    assert.strictEqual(requestsAfterLoad, 0, requestsAfterLoad + ' requests after load');
    assert.strictEqual(await page.evaluate(() => NET), 0);
  });

  await test('no console errors, page errors or CSP violations in the whole session', async () => {
    assert.deepStrictEqual(problems, []);
  });

  console.log('\nScale and phone');
  await test('at volume: 20,000 cases still draw every report and data page quickly, one page of rows at a time', async () => {
    const m = await ctx.newPage(); const errs = []; m.on('pageerror', e => errs.push(e.message));
    const t0 = Date.now(); await m.goto(base + '?scale=20000'); await m.waitForLoadState('networkidle'); const load = Date.now() - t0;
    assert.strictEqual(await m.evaluate(() => S.cases.length), 20000);
    assert.ok(await m.evaluate(() => S.contacts.length) > 30000, 'contacts follow the cases');
    assert.ok(load < 8000, 'seeding and first draw took ' + load + ' ms');
    const slow = [];
    for (const [r, tab] of [['staff-annual'], ['staff-capacity'], ['staff-funnel'], ['staff-data', 'cases'], ['staff-data', 'contacts'], ['staff-data', 'users'], ['staff-data', 'survey'], ['staff-data', 'convs']]) {
      const ms = await m.evaluate(([r, tab]) => { if (tab) S.staff.tab.data = tab; const t = performance.now(); location.hash = '#' + r; render(); return performance.now() - t }, [r, tab]);
      if (ms > 1500) slow.push(`${r}/${tab || ''} ${Math.round(ms)}ms`);
      if (tab) assert.ok(await m.locator('table.t tbody tr').count() <= 25, `${tab} shows at most one page of rows`);
    }
    assert.deepStrictEqual(slow, []);
    await m.click('[data-act=pgGo][data-to="1"]'); assert.match(await m.locator('.pager').first().innerText(), /26–50 of/);
    const annual = await m.evaluate(() => { location.hash = '#staff-annual'; render(); return document.querySelector('.kpi b').textContent });
    assert.ok(+annual.replace(/,/g, '') > 5000, 'the annual report counts the whole year: ' + annual);
    assert.deepStrictEqual(errs, []); await m.close();
  });

  await test('phone: booking, ticket, survey and the closing form fit 390px wide, with tap targets of at least 44px', async () => {
    const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, acceptDownloads: true });
    const m = await mctx.newPage(); const errs = []; m.on('pageerror', e => errs.push(e.message));
    await m.goto(base + '#book'); await m.waitForTimeout(100);
    const probe = () => m.evaluate(() => ({ over: document.documentElement.scrollWidth - innerWidth,
      small: [...document.querySelectorAll('main button, main select, main input:not([type=radio]):not([type=checkbox]), main textarea, main .choice, main a.btn')].filter(e => e.offsetParent && e.getBoundingClientRect().height < 43.5).map(e => (e.className || e.tagName) + ':' + Math.round(e.getBoundingClientRect().height)) }));
    const seen = [], snap = async step => { const r = await probe(); seen.push([step, r.over, r.small.slice(0, 4)]); };
    await snap('start'); await m.click('[data-act=door][data-d=narrow]'); await snap('questions');
    await m.selectOption('#q2', 'inE'); await m.check('input[name=q3][value=np]'); await m.click('[data-act=match]'); await snap('people');
    await m.click('[data-act=choose] >> nth=0'); await m.click('[data-act=conn][data-a=none]'); await snap('time');
    await m.click('.slot >> nth=0'); await snap('confirm');
    await m.check('input[name=tr][value=no]'); await m.click('[data-act=book]'); await snap('ticket');
    await m.click('[data-act=simCall]'); await m.click('[data-act=openSurvey]'); await snap('survey');
    await m.evaluate(() => { location.hash = '#staff-ombuds'; S.staff.asOmbuds = S.contacts.find(c => c.state === 'held').ombuds; });
    await m.evaluate(() => render()); await m.locator('[data-act=openClose]').first().click();
    for (let i = 0; i < 4; i++) { await snap('closing ' + (i + 1)); await m.evaluate(i => { const c = S.close; if (i === 0) { c.vcat = 'Public'; c.reg = 'eu' } if (i === 1) { c.issues = ['0.0']; c.acc = { 0: true } } if (i === 2) c.services = ['Coaching']; if (i < 3) { c.step = i + 2; render() } }, i); }
    assert.deepStrictEqual(seen.filter(s => s[1] > 0 || s[2].length).filter(s => !/^closing/.test(s[0])), []);
    assert.deepStrictEqual(seen.filter(s => s[1] > 0 && /^closing/.test(s[0])), [], 'the closing form must not scroll sideways');
    assert.deepStrictEqual(errs, []); await mctx.close();
  });

  console.log('\nServer and layout');
  await test('server sends a CSP that forbids outbound requests, and refuses path traversal', async () => {
    const http = require('http');
    const get = p => new Promise((res, rej) => http.get(base.replace(/\/$/, '') + p, r => { let b = ''; r.on('data', d => b += d); r.on('end', () => res({ status: r.statusCode, headers: r.headers, body: b })); }).on('error', rej));
    const idx = await get('/');
    assert.strictEqual(idx.status, 200);
    assert.match(idx.headers['content-security-policy'], /connect-src 'none'/);
    assert.strictEqual((await get('/..%2f..%2fserver.js')).status === 403 || (await get('/..%2f..%2fserver.js')).status === 404, true);
    assert.strictEqual((await get('/../server.js')).body.includes('createServer'), false);
    assert.strictEqual((await get('/nope')).status, 404);
  });

  await test('no horizontal scrolling at phone width on any page', async () => {
    const m = await (await browser.newContext({ viewport: { width: 400, height: 800 } })).newPage();
    await m.goto(base);
    const bad = [];
    for (const r of ['home', 'book', 'how', 'think', 'serve', 'contact', 'urgent', 'privacy', 'stories', 'staff', 'staff-ombuds', 'staff-onboard', 'staff-data', 'staff-capacity', 'staff-funnel', 'staff-annual', 'staff-inbox', 'staff-access', 'staff-tests', 'staff-build']) {
      await hash(m, r);
      const w = await m.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
      if (w[0] > w[1] + 1) bad.push(r + ' ' + w.join('>'));
    }
    assert.deepStrictEqual(bad, []);
  });

  await test('body text is at least 18px and pinch-zoom is not disabled', async () => {
    assert.strictEqual(await page.evaluate(() => getComputedStyle(document.body).fontSize), '18px');
    assert.ok(!/user-scalable\s*=\s*no|maximum-scale\s*=\s*1(\.0)?\b/.test(await page.evaluate(() => document.querySelector('meta[name=viewport]').content)));
  });

  await browser.close(); server.close();
  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed) { failures.forEach(([n, e]) => console.error('\nFAILED: ' + n + '\n' + (e.stack || e))); process.exit(1); }
})().catch(e => { console.error(e); process.exit(1); });
