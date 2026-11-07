# Nusa SF: handover for Kevin

A new website for Nusa (Indonesian kitchen, San Francisco) with live ordering, an order page for every customer, chat, and an owner dashboard. Everything is connected through one shared database, the same idea as Lunar and Miss Chang An.

- Live now: https://nusa-test.vercel.app
- Dashboard: https://nusa-test.vercel.app/dashboard (password `nusa2026`)
- GitHub: https://github.com/renaldoliao/nusa-test (this zip is the same code)
- Their current real site, used as the brand reference: https://nusasf.square.site

---

## 1. Deploy it on Vercel (about 5 minutes)

1. Put this folder in a GitHub repo, or use the existing one above.
2. In Vercel: **Add New > Project**, pick the repo.
   - Framework Preset: **Other**
   - Root Directory: leave as is
   - Build Command: leave empty
   - Output Directory: leave empty
   - Install Command: default
   - Click **Deploy**.
3. Connect the database (this is what makes orders sync between phones and computers):
   - Project > **Storage** > **Create Database** > **Neon** (free Postgres). Pick a US West region.
   - Click **Connect**, tick all environments, confirm.
   - **Deployments** > latest > three dots > **Redeploy**.
4. Check: open `/dashboard`, sign in. The top bar should show a green dot and **Live**. If it says "This browser only", the database isn't connected, so redo step 3.

The database table is created by itself on the first visit and filled with sample orders for the demo.

**Optional:** change the dashboard password by adding `NUSA_STAFF_KEY` under Settings > Environment Variables, then redeploy.

**Sharing links:** send people the main link (no "git-main" in it). The git-main links are locked to our Vercel team. To unlock all links: Settings > Deployment Protection > turn off Vercel Authentication.

---

## 2. What's in the folder

| Path | What it is |
|---|---|
| `index.html` | The whole public website: home, menu, order, checkout, order pages, catering, story, terms, privacy. One file, no build step. |
| `dashboard/index.html` | The owner dashboard. One file. |
| `lib/logic.js` | The shared rules. The website, the dashboard and the server all load this same file, so a change behaves the same everywhere. Sample data lives here too. |
| `lib/db.js` | Saves everything as one row in Postgres. Each change locks the row, applies, saves, so two devices never overwrite each other. |
| `lib/http.js` | Two tiny helpers for the API files. |
| `api/shop.js` | The customer side. Anyone can read the menu and pickup days. Orders and chats are only returned to the device holding their private key. |
| `api/staff.js` | The kitchen side. Every call needs the staff password. Customer names and phones are never public. |
| `img/` | Photos, compressed to WebP. Loaded only when you scroll near them. |
| `fonts/` | Brygada 1918, served from the site itself (free font, licence in `OFL.txt`). |
| `tools/dev-server.js` | Run the site on your own computer, the same way Vercel does. |
| `tools/two-device-test.js` | Automatic test: a customer on a phone and the kitchen on a laptop, 20 checks. |
| `package.json` | Only one package: `pg`, to talk to Postgres. |
| `vercel.json` | Keeps the dashboard out of Google. |

---

## 3. How it works (plain version)

- **Customer orders** on the website: picks pickup or delivery, a day and time, adds dishes (with sizes), checks out with name and phone. They pay at pickup. There's no online payment yet.
- They land on **their own order page** (link like `/#o/1177-abc...`). It shows four steps (Sent > Confirmed > Packed > Picked up) and updates by itself. They can chat there, or cancel until it's packed.
- **"Ask Nusa"** chat bubble on every page, for general questions. Catering requests also open a chat, and the quote arrives there.
- **Dashboard**: a "Needs you" row (orders to confirm, new messages, catering requests). Week board by pickup day. Tap an order to Confirm / Can't take it (with a reason) / Mark packed / Picked up. Each step messages the customer automatically. Messages tab for all chats. Menu tab for prices, sizes, sold out. "Pickup days" for which days each option runs, time slots, max orders per day. A single day can also be closed from inside that day.
- **Live updates**: every open dashboard and order page asks the server "anything new?" every 1.5 seconds. If nothing changed, the answer is a few bytes, so it stays light. Measured locally: new order to dashboard 0.3 s, confirm to customer 0.15 s. On the live site expect 1 to 2 s.
- **No database?** It still runs, but only inside one browser (orders and chats stay on that one device). Handy for quick demos, not for real use.

---

## 4. Design decisions (so they don't get undone by accident)

- **Brand comes from Nusa's real site**: pandan green `#437700` (theirs is `#4C8600`), sage `#D6E2BF`, coconut cream `#F2EEE2`, deep leaf `#1A3310` for the dark bands and footer. White only for buttons and cards.
- **One font everywhere**: Brygada 1918. Headlines at regular weight, large, tightly spaced. Small labels in uppercase with wide spacing.
- **Indonesian touch**: an original kawung batik pattern (four petals) very faint in the dark bands and footer, and a tumpal triangle border on top of the footer. The dashboard uses the same pattern lightly.
- **Motion**: one easing curve throughout (`cubic-bezier(.16,1,.3,1)`). Page fades, soft scroll reveals, header tucks away on scroll down. Anyone with "reduce motion" on gets no animation.
- **No em dashes anywhere** in copy or code (studio rule).
- **Project rules we follow**: no drop shadows, terms and privacy pages included, skeleton loaders on the order page and chat.

---

## 5. Before showing it as "real" (to do)

**Needs Nusa's input**
1. **Placeholder content.** Replace before launch:
   - Home review quote, marked "Sample quote" ("Customer name, Google review")
   - Catering client quote, marked "Sample quote"
   - HubShop pickup spots: "Sample location / Sample window". The full list of 60+ spots comes from Nusa's HubShop account.
   - Delivery areas and times: "Sample window"
   - All of these are in `index.html`. Search for "Sample".
2. **More photos.** The site runs on about 17 photos and the plates photo repeats. 15 to 20 more real ones would lift it a lot.
3. Real email/phone/address check in the footer and the terms and privacy pages.

**We can do without them**
4. Inner pages (Menu, Order, Catering, Story) still have a few leftovers from the earlier dark look: the arched photo frame, the rotating badge, ring borders on photos.
5. A full phone check of every page and state (checkout errors, chat on small phones).
6. A sound and pop-up on the dashboard when a new order comes in. Right now staff only see it if the dashboard is open.
7. Smaller photo versions for phones.
8. A link preview image for WhatsApp/Instagram, and a better tab icon.
9. A readability check on small grey text over the sage bands.

**Bigger pieces, later**
- Online payment: Nusa already uses Square, so Square checkout is the natural fit.
- Email or text updates to customers (needs an outside service, small cost per message).

---

## 6. Run it on your computer (optional)

```
npm install
node tools/dev-server.js . 3000
```
Open http://localhost:3000 and http://localhost:3000/dashboard. Without a database it runs in "this browser only" mode. To test with a real database, start it with `DATABASE_URL=postgres://... node tools/dev-server.js . 3000`.

Run the automatic test against a fresh database (needs Playwright: `npm i -D playwright`):
```
SITE=http://localhost:3000 node tools/two-device-test.js
```
It should print 20 PASS lines and "no page errors".

---

## 7. Editing tips

- **Menu, prices, sizes, sold out**: do it in the dashboard (Menu tab). The website follows straight away.
- **Pickup days, times, daily limits**: dashboard > Week > Pickup days.
- **Dish descriptions, story text, section copy**: in `index.html` (search for the text).
- **Colours**: the `:root` blocks near the end of the `<style>` in `index.html` (the "v8" and "v10" blocks override the earlier ones).
- **Reset demo data**: dashboard footer > Reset sample data (tap twice). In live mode this resets it for everyone.
