document.addEventListener('DOMContentLoaded', () => {

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const WA_NUMBER = '919371861789'; // +91 93718 61789, digits only
  const ENQUIRY_EMAIL = 'sjr@shreejaihindroadlines.in';
  const ENQUIRY_EMAIL_CC = 'jaihind8989@yahoo.com';

  /* ---------- Web3Forms access keys ----------
     Web3Forms' free plan delivers to ONE inbox per key, with no CC on free.
     To reach both addresses for free, two keys are used — one signed up
     with each email — and both are submitted in the background. If you
     only want one inbox, leave WEB3FORMS_KEY_2 as '' and only the first
     will be used.
     Get a free key at web3forms.com (no login, just an email address). */
  const WEB3FORMS_KEY_1 = 'PASTE_KEY_FOR_sjr@shreejaihindroadlines.in';
  const WEB3FORMS_KEY_2 = 'PASTE_KEY_FOR_jaihind8989@yahoo.com';

  /* ---------- Mobile menu ---------- */
  const menuBtn = document.getElementById('menuBtn');
  const panel = document.getElementById('mobilePanel');
  const closeMenu = () => {
    panel.classList.remove('open');
    menuBtn.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open menu');
  };
  menuBtn.addEventListener('click', () => {
    const open = panel.classList.toggle('open');
    menuBtn.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  panel.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  /* ---------- Header shadow + back to top ---------- */
  const header = document.getElementById('siteHeader');
  const topBtn = document.getElementById('topBtn');
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 8);
    topBtn.classList.toggle('show', window.scrollY > 700);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  topBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  });

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- WhatsApp message builder ----------
     Reused by the hero button, the quick-action link and the form's
     "Send via WhatsApp" button, so the message always reflects whatever
     the visitor has already typed into the enquiry form. */
  const val = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };

  function buildWaMessage() {
    const name = val('name'), phone = val('phone'), from = val('from'), to = val('to'),
          weight = val('weight'), message = val('message');
    const lines = ['Hi, I\'d like a freight quote from Shree Jaihind Roadlines.'];
    if (name) lines.push(`Name: ${name}`);
    if (phone) lines.push(`Phone: ${phone}`);
    if (from || to) lines.push(`Route: ${from || '—'} to ${to || '—'}`);
    if (weight) lines.push(`Approx. weight: ${weight}`);
    if (message) lines.push(`Details: ${message}`);
    return lines.join('\n');
  }

  function waLink() {
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(buildWaMessage())}`;
  }

  /* Same enquiry details, formatted for the visitor's own email app.
     Addressed to both inboxes via cc, which mailto supports natively.
     Used as the silent fallback whenever the background send does not
     succeed, so an enquiry is never simply lost — and never shown as an
     error either. */
  function buildMailto() {
    const name = val('name'), phone = val('phone');
    const route = [val('from'), val('to')].filter(Boolean).join(' to ') || '—';
    const subject = `Freight enquiry — ${name || 'website'}`;
    const body =
      `Name: ${name || '—'}\n` +
      `Phone: ${phone || '—'}\n` +
      `Route: ${route}\n` +
      `Approx. weight: ${val('weight') || '—'}\n\n` +
      `Cargo details:\n${val('message') || '—'}`;
    return `mailto:${ENQUIRY_EMAIL}?cc=${encodeURIComponent(ENQUIRY_EMAIL_CC)}` +
           `&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  /* Submits once per configured Web3Forms key, so each goes to its own
     inbox (free plan = one recipient per key). Returns true if at least
     one send is confirmed accepted by Web3Forms. */
  async function sendViaWeb3Forms(fields) {
    const keys = [WEB3FORMS_KEY_1, WEB3FORMS_KEY_2].filter(
      k => k && !k.startsWith('PASTE_KEY')
    );
    if (!keys.length) return false;

    const attempts = keys.map(async (key) => {
      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ access_key: key, ...fields }),
        });
        const data = await res.json().catch(() => null);
        return !!(data && data.success);
      } catch {
        return false;
      }
    });

    const results = await Promise.all(attempts);
    return results.some(Boolean);
  }

  const heroWaBtn = document.getElementById('heroWaBtn');
  if (heroWaBtn) heroWaBtn.setAttribute('href', waLink());

  const enquiryWaBtn = document.getElementById('enquiryWaBtn');
  if (enquiryWaBtn) {
    enquiryWaBtn.addEventListener('click', () => {
      window.open(waLink(), '_blank', 'noopener');
    });
  }

  /* ---------- Hero quote panel hands off to the full enquiry form ---------- */
  const quickQuote = document.getElementById('quickQuote');
  quickQuote.addEventListener('submit', (e) => {
    e.preventDefault();
    const from = document.getElementById('qFrom').value.trim();
    const to = document.getElementById('qTo').value.trim();
    const weight = document.getElementById('qWeight').value;
    if (from) document.getElementById('from').value = from;
    if (to) document.getElementById('to').value = to;
    if (weight) document.getElementById('weight').value = weight;
    document.getElementById('contact').scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
    setTimeout(() => document.getElementById('name').focus({ preventScroll: true }), 700);
  });

  /* ---------- Enquiry form ----------
     Sends via Web3Forms in the background — nothing to host, no server of
     our own. If that send is not confirmed successful for ANY reason (key
     not set up yet, no connection, Web3Forms down, monthly quota used),
     nothing is ever shown as an error. Instead the visitor's own email app
     opens with every field already filled in, addressed to both inboxes.
     Either way the enquiry reaches us — the visitor never sees a failure. */
  const form = document.getElementById('enquiryForm');
  const statusBox = document.getElementById('formStatus');
  const submitBtn = document.getElementById('enquirySubmit');

  function showStatus(kind, text) {
    statusBox.textContent = text;
    statusBox.className = `form-status show ${kind}`;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = val('name'), phone = val('phone');

    if (!name || !phone) {
      showStatus('err', 'Please add your name and a phone number so we can get back to you.');
      (!name ? document.getElementById('name') : document.getElementById('phone')).focus();
      return;
    }

    submitBtn.disabled = true;
    const originalLabel = submitBtn.textContent;
    submitBtn.textContent = 'Sending…';

    const route = [val('from'), val('to')].filter(Boolean).join(' to ') || '—';
    const sent = await sendViaWeb3Forms({
      subject: `Freight enquiry — ${name}`,
      name,
      phone,
      route,
      weight: val('weight') || '—',
      message: val('message') || '—',
      botcheck: val('botcheck'),
    });

    submitBtn.disabled = false;
    submitBtn.textContent = originalLabel;

    if (sent) {
      form.reset();
      showStatus('ok', "Thanks — your enquiry has been sent. We'll be in touch shortly.");
    } else {
      // Never surfaced as an error — open the visitor's email app instead,
      // pre-filled and addressed to both inboxes, so the enquiry still goes.
      showStatus('ok', 'Opening your email app with these details filled in — just press send.');
      window.location.href = buildMailto();
    }
  });

  /* ---------- Route map: measure path lengths, animate once in view ---------- */
  const mapPanel = document.getElementById('mapPanel');
  if (mapPanel) {

    mapPanel.querySelectorAll('.route').forEach(p => {
      const len = Math.ceil(p.getTotalLength());
      p.style.setProperty('--len', len);
    });
    const startMap = () => mapPanel.classList.add('map-live');
    if (prefersReduced) {
      startMap();
    } else if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(en => { if (en.isIntersecting) { startMap(); io.disconnect(); } });
      }, { threshold: 0.25 });
      io.observe(mapPanel);
      setTimeout(() => {
        const r = mapPanel.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) startMap();
      }, 300);
    } else {
      startMap();
    }
  }

  /* ---------- Gentle reveal on scroll ---------- */
  if (!prefersReduced) {
    const targets = [...document.querySelectorAll(
      '.card, .quick-item, .why-item, .truck, .stat-cell, .table-card, .faq details, .info-card, .form-card'
    )];
    targets.forEach(el => el.classList.add('js-reveal'));
    let pending = targets.slice();
    const sweep = () => {
      if (!pending.length) return;
      const limit = window.innerHeight;
      pending = pending.filter(el => {
        if (el.getBoundingClientRect().top < limit) { el.classList.add('in'); return false; }
        return true;
      });
    };
    let ticking = false;
    const tick = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { sweep(); ticking = false; });
    };
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick, { passive: true });
    window.addEventListener('hashchange', () => setTimeout(sweep, 60));
    window.addEventListener('load', () => setTimeout(sweep, 60));
    sweep();
  }
});
