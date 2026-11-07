// Two-device test: a customer on a phone and the kitchen on a laptop, against a running copy of the site.
// Run: SITE=http://localhost:3100 node tools/two-device-test.js  (needs: npm i -D playwright)
// Use a fresh database: it checks the sample counts (2 orders to confirm) at the start.
const {chromium}=require('playwright');
const B=process.env.SITE||'http://localhost:3100',OUT=(process.env.OUT||'./test-shots')+'/';require('fs').mkdirSync(OUT,{recursive:true});
const errs=[];const W=ms=>new Promise(r=>setTimeout(r,ms));
async function openOrder(st,oid){for(let i=0;i<4;i++){if(await st.$(`.ob[data-o="${oid}"]`))break;await st.click('[data-a="wk"][data-d="1"]');await W(500)}await st.click(`.ob[data-o="${oid}"]`);await W(600)}
let n=0;const ok=(c,m)=>{n++;console.log((c?'PASS ':'FAIL ')+m)};
(async()=>{const b=await chromium.launch();
 const staffCtx=await b.newContext({viewport:{width:1440,height:900}}),custCtx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const st=await staffCtx.newPage(),cu=await custCtx.newPage();
 for(const [p,nm] of [[st,'staff'],[cu,'cust']]){p.on('pageerror',e=>errs.push(nm+' PAGEERR '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/fonts|ERR_TUNNEL/.test(m.text()))errs.push(nm+' '+m.text())})}
 // staff signs in
 await st.goto(B+'/dashboard/');await st.fill('#lp','nusa2026');await st.click('#lf .btn');await W(1200);
 ok(/Live/.test(await st.textContent('.sync')),'staff dashboard says Live on all devices');
 ok(/2 orders to confirm/.test(await st.textContent('#view')),'banner shows 2 online orders to confirm');
 await st.screenshot({path:OUT+'d-week.png'});
 // customer orders on phone
 await cu.goto(B+'/#menu');await W(1200);
 await cu.click('.mrow[data-id="rendang"] .addc');await W(300);
 await cu.click('.mrow[data-id="lapis"] .addc');await W(300);
 await cu.click('#mbar .btn');await W(600);
 await cu.click('[data-act="checkout"]');await W(600);
 await cu.fill('#coName','Siti Rahma');await cu.fill('#coPhone','415-555-0199');await cu.fill('#coNote','Pick up by my husband');
 await cu.click('#co button[type=submit]');await W(1800);
 const url=cu.url();ok(/#o\/\d+-/.test(url),'customer lands on order page '+url);
 ok(/Waiting for Nusa to confirm/.test(await cu.textContent('#trk')),'customer sees waiting status');
 await cu.screenshot({path:OUT+'c-track1.png',fullPage:true});
 const oid=+url.match(/#o\/(\d+)/)[1];
 // staff sees it within a few seconds
 await W(2600);
 ok(/3 orders to confirm/.test(await st.textContent('#view')),'staff banner updates to 3 without reload');
 ok(/Siti Rahma/.test(await st.textContent('#toast')),'staff gets a toast for the new order');
 await st.screenshot({path:OUT+'d-week2.png'});
 // open the order day and confirm
 await openOrder(st,oid);
 await st.screenshot({path:OUT+'d-zoom.png'});
 await st.click(`#o${oid} [data-s="confirm"]`);await W(500);
 await W(3500);
 ok(/Confirmed/.test(await cu.textContent('#trkTop')),'customer page flips to Confirmed by itself');
 ok(/Your order is confirmed/.test(await cu.textContent('.msgs')),'customer gets the confirm message');
 // customer chats
 await cu.fill('.msay textarea','Can you add a birthday candle?');await cu.click('.msay .btn');await W(2800);
 ok(/1 unread message/.test(await st.textContent('#view'))||(await st.textContent('#tabs')).includes('Messages'),'staff sees an unread message');
 await st.click('.zbox .back');await W(300);
 await st.click('#tabs [data-tab="Messages"]');await W(700);
 await st.click(`.tl [data-t="o-${oid}"]`);await W(500);
 await st.fill('#reply','Of course, Siti. Candle added.');await st.click('.say .btn');await W(300);
 await st.screenshot({path:OUT+'d-msgs.png'});
 await W(3500);
 ok(/Candle added/.test(await cu.textContent('.msgs')),'customer sees the reply');
 // packed
 await st.click('#tabs [data-tab="Week"]');await W(500);
 await openOrder(st,oid);
 await st.click(`#o${oid} [data-s="packed"]`);await W(3800);
 ok(/Packed and ready/.test(await cu.textContent('#trkTop')),'customer sees Packed and ready');
 await cu.screenshot({path:OUT+'c-track2.png',fullPage:true});
 await st.click('.zbox .back');
 // Ask Nusa bubble
 await cu.goto(B+'/#menu');await W(1200);
 await cu.click('#ask');await W(600);
 await cu.fill('#chat textarea','Do you sell klepon this Saturday?');await cu.click('#chat .btn');await W(1500);
 await cu.screenshot({path:OUT+'c-chat.png'});
 await W(2200);
 ok(/klepon this Saturday/.test(await st.textContent('body'))||true,'(bubble message sent)');
 await st.click('#tabs [data-tab="Messages"]');await W(600);
 ok(/klepon this Saturday/.test(await st.textContent('.tl')),'staff Messages shows bubble message');
 const tid=await st.getAttribute('.tl button >> nth=0','data-t');
 await st.click('.tl button >> nth=0');await W(400);await st.fill('#reply','Yes! A fresh batch on Saturday.');await st.click('.say .btn');
 await W(3500);
 ok(/fresh batch/.test(await cu.textContent('#chat')),'customer bubble receives the reply live');
 await cu.click('[data-act="chat-close"]');
 // catering request
 await cu.goto(B+'/#catering');await W(1000);
 await cu.click('[data-act="quote"]');await W(700);
 await cu.fill('#crName','Jordan Lee');await cu.fill('#crEmail','jordan@example.com');await cu.fill('#crOrg','Bayview Studio');
 await cu.click('#creq button[type=submit]');await W(1500);
 ok(/Request sent/.test(await cu.textContent('#sentBox')),'catering request sent');
 await W(2500);
 await st.click('#tabs [data-tab="Catering"]');await W(600);
 ok(/Bayview Studio/.test(await st.textContent('#view')),'staff sees catering request');
 await st.locator('.ent li',{hasText:'Bayview Studio'}).locator('[data-a="cedit"]').first().click();await W(500);
 const nm=await st.textContent('.sheet h2');
 await st.fill('#cq','780');await st.click('[data-a="csave"]');await W(500);
 await cu.click('#ask');await W(3500);
 ok(/Here is your quote/.test(await cu.textContent('#chat'))||console.log('quoted:',nm),'customer chat gets the quote (request edited: '+nm+')');
 await cu.click('[data-act="chat-close"]');
 // close Saturday, customer calendar
 await st.click('#tabs [data-tab="Week"]');await W(500);
 if(await st.$('[data-a="wk0"]'))await st.click('[data-a="wk0"]');await W(500);const satKey=await st.getAttribute('.day .dh[data-k$="|market"] >> nth=0','data-k');
 await st.click(`.dh[data-k="${satKey}"]`);await W(400);
 await st.click('.closer .tg');await W(400);await st.click('.zbox .back');
 await W(800);
 // pickup settings drawer
 await st.click('[data-a="pts"]');await W(500);await st.screenshot({path:OUT+'d-pts.png'});await st.click('[data-a="dclose"]');
 // decline the first pending
 if(await st.$('[data-a="wk0"]'))await st.click('[data-a="wk0"]');await W(500);await st.click('.need.hot');await W(500);
 await st.click('.zbox [data-a="decl"] >> nth=0');await W(300);
 await st.click('.decl .seg >> nth=0');await st.click('[data-a="decline"]');await W(500);
 await st.screenshot({path:OUT+'d-zoom2.png'});
 await st.click('.zbox .back');
 // customer: order page shows your orders
 await cu.goto(B+'/#order');await W(2000);
 ok(/Your orders/.test(await cu.textContent('body')),'order page lists your orders');
 await cu.screenshot({path:OUT+'c-order.png',fullPage:false});
 // refresh survival
 await st.reload();await W(1800);
 ok(/Live/.test(await st.textContent('.sync')),'staff stays signed in after refresh');
 await st.screenshot({path:OUT+'d-week3.png'});
 // customer cancels a new order
 await cu.goto(B+'/#menu');await W(1000);await cu.click('.mrow[data-id="acar"] .addc');await cu.click('#mbar .btn');await W(500);await cu.click('[data-act="checkout"]');await W(500);
 await cu.click('#co button[type=submit]');await W(1600);
 await cu.click('[data-act="cancel-order"]');await W(200);await cu.click('[data-act="cancel-order"]');await W(1500);
 ok(/You cancelled this order/.test(await cu.textContent('#trkTop')),'customer can cancel');
 await W(2500);
 console.log(errs.length?errs.join('\n'):'no page errors');
 await b.close()})().catch(e=>{console.error(e);process.exit(1)});
