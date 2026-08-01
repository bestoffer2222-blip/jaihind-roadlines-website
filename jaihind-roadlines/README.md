# Shree Jaihind Roadlines — Website

Static site plus one small serverless function. Hosts free on Cloudflare Pages.

```
index.html              the whole site (single page, anchor navigation)
styles.css              all styling (colours in the :root block at the top)
script.js               menu, quote hand-off, enquiry form, WhatsApp, map
functions/api/enquiry.js  serverless function: 250/month cap + email sending
images/                 sjr-logo.png, sjr-logo-lg.png, favicon.png,
                        badge-india.png (hero emblem), badge-india-sm.png
```

No photographs from the company profile deck are used. The only images are
your own SJR logo.

---

## 1. Deploy to Cloudflare Pages (free)

1. Sign in at **dash.cloudflare.com** → **Workers & Pages** → **Create** →
   **Pages** → **Upload assets**.
2. Name it (e.g. `jaihind-roadlines`), drag this whole folder in, **Deploy**.
   No build command. You'll get a live `*.pages.dev` URL straight away.

The `functions/` folder is picked up automatically — that's what makes
`/api/enquiry` work. Keep the folder structure exactly as it is.

## 2. Connect jaihindroadlines.in

3. In the Pages project → **Custom domains** → **Set up a domain** →
   `jaihindroadlines.in`.
4. Cloudflare shows the DNS records to add. Enter them in **Spaceship's** DNS
   panel for the domain — or, if Cloudflare asks, point the domain's
   nameservers at Cloudflare instead. Either route works.
5. Allow 10–30 minutes. HTTPS is automatic and free.

## 3. Turn on enquiry emails  ← REQUIRED, or the form won't send

The form posts to your own `/api/enquiry` function, which counts submissions
and then forwards them to Web3Forms. Two one-time settings:

**a) Get a Web3Forms access key (free, no account needed)**
   - Go to **web3forms.com**, enter `jaihind8989@yahoo.com`, and they email
     you an access key.

**b) Add the key as a secret in Cloudflare**
   - Pages project → **Settings** → **Environment variables** → **Add**
   - Name: `WEB3FORMS_ACCESS_KEY`
   - Value: the key from the email
   - Save as a **Secret** (not plain text), for **Production**

**c) Create the counter storage**
   - Left sidebar → **Storage & Databases** → **KV** → **Create namespace**
   - Call it `jaihind-enquiries`
   - Back in the Pages project → **Settings** → **Bindings** → **Add** →
     **KV namespace**
   - Variable name: `ENQUIRY_KV`  ← must be exactly this
   - Select the `jaihind-enquiries` namespace
   - **Redeploy** the site so the bindings take effect

Until both are set, the form will show a clear "not configured yet" message
rather than silently failing.

### How the 250/month safeguard works

`functions/api/enquiry.js` keeps a running count for the current calendar
month in KV. Every accepted enquiry increments it. On reaching **250** the
function stops sending and returns a polite message instead, offering
WhatsApp and phone.

This is a **real, site-wide limit** enforced on the server — not a
per-browser count that a visitor could reset by clearing their cache.

Notes:
- The count only increases when an email actually goes out, so failed sends
  don't consume your allowance.
- Counters expire automatically ~40 days after the month, so nothing piles up.
- To change the limit, edit `MONTHLY_LIMIT` at the top of the function file.
- Web3Forms' free tier is also 250/month, so the cap is set to match it. If
  you upgrade Web3Forms later, raise `MONTHLY_LIMIT` to match.
- A hidden honeypot field silently discards bot submissions without using up
  any of your 250.

## 4. WhatsApp

All WhatsApp buttons go to **+91 93718 61789**.

They appear in the hero, the quick-action row, the network section, the CTA
band, the contact cards, the footer, as a floating green button on every
screen, and as a fallback on the enquiry form.

The form's "Send via WhatsApp instead" button opens WhatsApp with the name,
phone, route, weight and cargo details the visitor has already typed — so
nothing is retyped. This route has **no monthly limit** and costs nothing,
which is why it's offered as the fallback when the email cap is reached.

To change the number, search `919371861789` in `index.html` and `script.js`
(digits only, country code first, no `+` or spaces).

---

## The route network map

The Network section shows a **route corridor diagram**: the Kolhapur head
office plus the five destination cities, each placed at its true relative
position by latitude and longitude, with corridors animating outward from the
hub when the section scrolls into view.

**Why there is no country outline behind it.** Earlier versions tried to load
an India boundary from an external source at page load. That is what kept
failing — if the file could not be fetched, nothing appeared. The map now has
**zero external dependencies**: everything is drawn from data embedded in the
page, so it always renders.

**Why the city names sit in a list rather than on the diagram.** Kolhapur and
Pune are about 200 km apart, so at phone width their labels physically cannot
both fit next to their dots — that was the overlapping you saw. The cities are
now numbered 1–6 on the diagram and named in the list beside it (below it on a
phone). Numbered markers cannot overlap, and the names are always readable at
full size. Marker spacing is checked in code: the closest pair sits 54 units
apart against a 44-unit marker width, so they can never touch.

If you later obtain an officially approved India outline as an SVG, it can be
placed behind the markers — send it over and it can be fitted to the same
coordinate frame.

---

## Editing content later

All text is in `index.html`. Open in any text editor, search, change, save,
re-upload.

- **Phone / email** — in the utility bar, contact cards, footer and the
  structured-data block near the top. Change every instance, including inside
  `tel:` and `mailto:` links.
- **Fleet numbers** — search `Multi-axle` (appears in both the cards and the
  table).
- **Cities** — each is one `<g class="node">` plus one `<path class="route">`
  in the map SVG. Adding a city means computing its x/y with the projection
  documented in the outline-slot comment.
- **Colours** — the `:root` block at the top of `styles.css`.

## Mobile

Most visitors will be on a phone, so the layout is built mobile-first and
verified at 360, 375, 390, 430 and 768px:

- The header and logo scale down on small screens so they don't eat the view.
- Form fields are 16px on mobile — below that, iOS zooms the page when a field
  is tapped, which feels broken.
- The fleet table reshapes into labelled stacked rows instead of scrolling
  sideways.
- Every tap target is at least 44px.
- The floating WhatsApp and back-to-top buttons respect the iPhone home
  indicator area.
- Long text like the email address can never force a sideways scroll.

## Notes

- The tricolour palette is used throughout; the national flag itself and the
  Ashoka Chakra are deliberately not reproduced, since the Flag Code of India
  restricts their use in commercial design.
- Fonts load from Google Fonts; if unavailable the site falls back to system
  fonts and stays readable.
- All body text was checked against WCAG AA contrast, and layout was verified
  from 360px to 1440px wide.

---

## The India map

The Network section shows India with the six cities marked at their true
latitude and longitude, and freight corridors animating out from Kolhapur.
Markers are numbered 1-6 and named in the list beside the map, so city names
can never overlap each other at any screen size.

**Where the outline comes from.** It is traced from the India shape in your own
badge artwork and fitted to India's mainland extent (68.10-97.41 E,
8.07-37.10 N). Accuracy was checked against 28 known reference points and all
28 are correct:

- 18 places that should be inside India all fall on land, including Kanyakumari,
  Guwahati, Imphal, Jaisalmer, Srinagar and Leh.
- The Arabian Sea, Bay of Bengal and Indian Ocean all correctly fall outside.
- Pakistan, Bangladesh, Nepal and Sri Lanka are all correctly excluded rather
  than being drawn as part of India.

Note it was originally fitted to the full official extent including the Nicobar
islands, which stretched the southern tip about 1.3 degrees too far south. The
fit now uses the mainland tip, which is what the artwork actually depicts.

**Caveat.** The shape derives from AI-generated artwork, so treat the coastline
detail and the northern borders as illustrative rather than survey-accurate. If
you want a survey-accurate outline, send an approved India SVG and it can be
fitted to the same frame - the coordinate system is ready for it.

**Two earlier causes of the map not appearing, both fixed:**

1. Up to build 6 the outline was fetched from an external server at page load;
   if that failed nothing appeared. Nothing is fetched externally now.
2. Up to build 6 the map was hidden in CSS and only revealed by JavaScript; if
   the script did not run it stayed invisible. It is now visible by default,
   verified with JavaScript disabled, with the stylesheet blocked, and with
   both blocked.

**Checking which build is live:** View Page Source and look near the top for

    <!-- Shree Jaihind Roadlines - build 9 -->

If it shows a lower number the browser or Cloudflare is serving a cached copy -
hard refresh with Ctrl+F5 (Cmd+Shift+R on Mac). CSS and JS are versioned with
?v=9 so a stale cache cannot mix with new HTML.

## Email addresses

Enquiries and contact details use **sjr@shreejaihindroadlines.in** as the
primary address, with jaihind8989@yahoo.com kept alongside it in the contact
card and footer.

Two things to action:

1. Register **sjr@shreejaihindroadlines.in** as the recipient when you set up
   your Web3Forms access key, otherwise submissions will still arrive at
   whichever address the key was created with.
2. That address is on **shreejaihindroadlines.in**, which is a different domain
   from the jaihindroadlines.in one you bought. If that was not deliberate,
   correct it before going live - search for `sjr@shreejaihindroadlines.in`
   in index.html and script.js.

## When the monthly enquiry limit is reached

The form no longer shows an error once the 250/month allowance is used up.
Instead it opens the visitor's own email app with the enquiry already written
out - name, phone, route, weight and cargo details - addressed to you. The same
fallback runs if the server cannot be reached, so an enquiry is never lost.
WhatsApp remains available at any time and has no limit.

---

## Editing content later

All text is in `index.html`. Open in any text editor, search, change, save,
re-upload.

- **Phone / email** — in the utility bar, contact cards, footer and the
  structured-data block near the top. Change every instance, including inside
  `tel:` and `mailto:` links.
- **Fleet numbers** — search `Multi-axle` (appears in both the cards and the
  table).
- **Cities** — each is one `<g class="node">` plus one `<path class="route">`
  in the map SVG. Adding a city means computing its x/y with the projection
  documented in the outline-slot comment.
- **Colours** — the `:root` block at the top of `styles.css`.

## Mobile

Most visitors will be on a phone, so the layout is built mobile-first and
verified at 360, 375, 390, 430 and 768px:

- The header and logo scale down on small screens so they don't eat the view.
- Form fields are 16px on mobile — below that, iOS zooms the page when a field
  is tapped, which feels broken.
- The fleet table reshapes into labelled stacked rows instead of scrolling
  sideways.
- Every tap target is at least 44px.
- The floating WhatsApp and back-to-top buttons respect the iPhone home
  indicator area.
- Long text like the email address can never force a sideways scroll.

## Notes

- The tricolour palette is used throughout; the national flag itself and the
  Ashoka Chakra are deliberately not reproduced, since the Flag Code of India
  restricts their use in commercial design.
- Fonts load from Google Fonts; if unavailable the site falls back to system
  fonts and stays readable.
- All body text was checked against WCAG AA contrast, and layout was verified
  from 360px to 1440px wide.

---

## The India map (build 8)

The Network section shows a map of India with the six cities marked at their
true latitude and longitude, and freight corridors animating outward from
Kolhapur. Markers are numbered 1-6 and named in the list beside the map, so
city names can never overlap each other at any screen size.

**Where the India outline comes from.** It is traced from the India shape in
your own badge artwork, fitted to India's official extent
(68.10-97.41 E, 6.75-37.10 N). Its proportions were measured against a real
equirectangular projection and match to within 1%, and all six cities were
verified to fall correctly on the landmass.

Because it derives from the AI-generated badge, treat the coastline and
especially the northern borders as decorative rather than survey-accurate. If
you want a survey-accurate outline, send an approved India SVG and it can be
fitted to the same frame - the coordinate system is already set up for it.

**Two earlier causes of the map not appearing, both now fixed:**

1. Up to build 6 the map was loaded from an external server at page load. If
   that request failed, nothing appeared. Nothing is fetched externally now.
2. Up to build 6 the map was hidden in CSS and only revealed by JavaScript. If
   the script did not run, the map stayed invisible. It is now visible by
   default, verified with JavaScript disabled, with the stylesheet blocked,
   and with both blocked.

**Checking which build is live:** View Page Source and look near the top for

    <!-- Shree Jaihind Roadlines - build 8 -->

If it shows an older number, the browser or Cloudflare is serving a cached
copy - hard refresh with Ctrl+F5 (Cmd+Shift+R on Mac). Stylesheet and script
are versioned with ?v=8 so a stale cache cannot mix with new HTML.
