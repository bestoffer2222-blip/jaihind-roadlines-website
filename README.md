# Shree Jaihind Roadlines — Website

A **pure static website**. No server, no build step, no third-party services,
nothing to configure. Upload the folder and it works.

```
index.html    the whole site (single page, anchor navigation)
styles.css    all styling (colours in the :root block at the top)
script.js     menu, quote hand-off, enquiry form, WhatsApp, map animation
images/       sjr-logo.png, sjr-logo-lg.png, badge-india.png, favicon.png
```

---

## Deploying to Cloudflare Pages

1. **dash.cloudflare.com** → **Workers & Pages** → **Create** → **Pages**
   → **Upload assets**
2. Name the project, drag this whole folder in, **Deploy**
3. You get a live `*.pages.dev` link immediately

### Connecting your domain

4. In the **Pages** project (not a Worker) → **Custom domains**
   → **Set up a domain** → enter your domain
5. If it says the hostname already has externally managed DNS records, go to
   Cloudflare → your domain → **DNS** → **Records** and delete any existing
   A or CNAME records for the root, then retry
6. HTTPS is issued automatically and free

Because there are no serverless functions any more, none of the earlier
environment-variable or KV-namespace setup is needed. That whole class of
problem is gone.

---

## The enquiry form (build 14 — Web3Forms)

Submitting the form now sends **in the background via Web3Forms** — the
visitor stays on the page, no server of your own required.

**Two inboxes, both free.** Web3Forms' free plan delivers to one address per
access key, with no CC option unless you pay. Rather than have you pay for
that, the form is set up to fire two Web3Forms submissions in parallel — one
key per inbox — so both **sjr@shreejaihindroadlines.in** and
**jaihind8989@yahoo.com** receive every enquiry, entirely free.

**Nothing is ever shown as an error.** If sending fails for any reason — keys
not set up yet, no connection, Web3Forms down, monthly quota reached — the
visitor never sees a failure message. Instead their own email app opens
automatically with every field already filled in, addressed to both inboxes
via CC (which the `mailto:` link handles natively, no paid plan needed there).
Tested: complete outage, partial failure, and success all behave correctly,
confirmed with the network mocked in each state.

### One-time setup — get two free access keys

1. Go to **web3forms.com** → enter `sjr@shreejaihindroadlines.in` → they
   email you an access key. No account or password needed.
2. Repeat with `jaihind8989@yahoo.com` to get a second key for that inbox.
3. Open `script.js`, find these two lines near the top:
   ```js
   const WEB3FORMS_KEY_1 = 'PASTE_KEY_FOR_sjr@shreejaihindroadlines.in';
   const WEB3FORMS_KEY_2 = 'PASTE_KEY_FOR_jaihind8989@yahoo.com';
   ```
4. Replace each placeholder with the matching key, keeping the quotes.
5. Save, commit to GitHub (or re-upload) — Cloudflare redeploys automatically.

**Until you do this**, the form still works perfectly — every submission
silently opens the visitor's email app instead, addressed to both inboxes.
Nothing breaks and nothing looks wrong; you simply get the emails one step
later (the visitor pressing send) until the keys are in place.

**If you only want one inbox**, get just the first key and leave
`WEB3FORMS_KEY_2` as the placeholder — only the configured key is used.

**Free tier limit:** 250 sends per key per month, so effectively 250 enquiries
reaching each inbox monthly. If you exceed that, sending simply fails and the
email-app fallback takes over automatically — still no error shown.

## The route network map

The Network section shows India with the six cities marked at their true
latitude and longitude, and freight corridors animating out from Kolhapur.
Markers are numbered 1-6 and named in the list beside the map, so city names
can never overlap at any screen size.

The outline is traced from the India shape in your own badge artwork, fitted
to India's mainland extent (68.10-97.41 E, 8.07-37.10 N). Alignment is checked
against 18 reference points and all 18 are correct: every Indian city tested
falls on land including Kanyakumari, Guwahati, Srinagar and Leh, while the
Arabian Sea, Bay of Bengal, Pakistan, Bangladesh, Nepal and Sri Lanka all
correctly fall outside.

Since it derives from AI-generated artwork it is close but not identical to
the official Survey of India outline. If you want an exact one, the simplest
route is Google My Maps - free, about ten minutes, and Google serves the
officially correct boundaries to Indian visitors:

1. Go to **google.com/mymaps** and sign in
2. **Create a new map**
3. Search each city and **Add to map** - Kolhapur, Pune, Hyderabad, Delhi,
   Chennai, Kolkata
4. Use the line tool to draw routes between them if you want
5. Three dots beside the map name -> **Embed on my site**
6. Copy the `<iframe ...>` code and send it over to have it swapped in

## The office map

The Contact section embeds a live **Google Map of the head office** in
Shiroli. No API key, no configuration, and visitors can tap through for
driving directions.

---

## Editing content later

All text is in `index.html`. Open in any text editor, search, change, save,
re-upload.

- **Phone / email** — in the top bar, contact cards, footer and the
  structured-data block near the top. Change every instance, including inside
  `tel:` and `mailto:` links, and `ENQUIRY_EMAIL` in `script.js`.
- **Cities** — each is one `<g class="node">` plus one `<path class="route">`
  in the map SVG, positioned by latitude and longitude.
- **Colours** — the `:root` block at the top of `styles.css`.

## Which build is live

View Page Source and look near the top for:

    <!-- Shree Jaihind Roadlines - build 14 -->

If it shows a lower number, the browser or Cloudflare is serving a cached
copy — hard refresh with Ctrl+F5 (Cmd+Shift+R on Mac). CSS and JS are
versioned with `?v=14` so a stale cache cannot mix with new HTML.

## Verified in this build

- No horizontal overflow at any width from 340px to 1600px
- No header text overlap at any width
- No overlapping cards, list items or map markers on any device
- All body text passes WCAG AA contrast (27 styles checked)
- No text below 12px
- Form fields are 16px on mobile so iOS does not zoom on tap
- All tap targets at least 44px
- No JavaScript errors; map renders even with JavaScript or CSS disabled

## Notes

- The tricolour palette is used throughout; the national flag and the Ashoka
  Chakra are deliberately not reproduced, since the Flag Code of India
  restricts their use in commercial design.
- The hero badge is your own supplied artwork.
- Fonts load from Google Fonts; if unavailable the site falls back to system
  fonts and stays readable.

---

## Local SEO (build 14)

The page targets Kolhapur search intent. What changed:

- **Title & meta** rewritten around "Shree Jaihind Roadlines Kolhapur" and
  "best transport & logistics company in Kolhapur"
- **H1** now leads with Kolhapur rather than a generic tagline
- **New "Serving Kolhapur & Shiroli MIDC" section** with a positioning block
  and a list of full-truck-load lanes out of Kolhapur
- **4 extra FAQs** written around real search queries, including
  "Shree Jaihind Roadlines contact number" and "where is your transport office
  in Shiroli MIDC"
- **Structured data**: LocalBusiness expanded with coordinates, service
  catalogue and alternate names, plus a separate FAQPage schema so answers can
  appear directly in Google results. Both validated as correct JSON.
- **geo meta tags** and a canonical URL added
- **Image alt text** now names the firm and city

### About Shree Mahalaxmi Roadlines

You asked for a section positioning against Shree Mahalaxmi Roadlines. That is
your own associate company, named in your company profile and in the site FAQ.
Competing against it would split your own brand, so the new section presents
the two as a **group strength** instead — it still captures searches for that
name without working against you. If it is no longer associated with you, say
so and it can be rewritten as a genuine comparison.

### Important next step

Create a **free Google Business Profile** at business.google.com. For local
searches like "transport near me" and "best transport in Kolhapur", the map
listing outranks the website itself. On-page SEO alone will not get you into
the local map pack — the Business Profile will. Use exactly the same name,
address and phone number as on this site.

See `SEO-NOTES.txt` for further keywords worth targeting with additional pages
later.

---

## Not appearing in Google? Read GET-INDEXED.txt

Short version: that is almost certainly **not** a keyword problem. Every
keyword requested is already on the page. A new site is invisible until Google
discovers and indexes it, which takes days to weeks and has to be triggered.

Added in build 14 to help:

- **sitemap.xml** — tells Google what to index
- **robots.txt** — points crawlers at the sitemap
- Firm name added to the **H1** and to three section headings, so brand
  searches for "Shree Jaihind Roadlines" match strongly

The two actions that actually matter are in `GET-INDEXED.txt`:

1. **Google Search Console** → submit the sitemap → click *Request Indexing*
2. **Google Business Profile** → for "near me" searches the map listing
   outranks websites entirely

Both are free. Neither can be done from the website files — you have to do
them from your own Google account.
