/**
 * POST /api/enquiry
 *
 * Server-side proxy for the enquiry form. Does two things a client-side
 * script cannot do on its own:
 *
 *   1. Keeps a REAL, site-wide count of submissions this calendar month in
 *      Cloudflare KV, and refuses politely once it reaches 250 — a genuine
 *      cap, not a per-browser guess.
 *   2. Forwards accepted submissions to Web3Forms using an access key held
 *      as a server-side secret, so the key never sits in public HTML.
 *
 * One-time setup needed in the Cloudflare Pages dashboard (see README):
 *   - Bind a KV namespace to this project as  ENQUIRY_KV
 *   - Add an environment variable/secret     WEB3FORMS_ACCESS_KEY
 */

const MONTHLY_LIMIT = 250;

function monthKey() {
  const d = new Date();
  return `count:${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ success: false, message: 'Invalid request body.' }, 400);
  }

  // Honeypot: if this hidden field is filled, silently pretend success.
  if (body.botcheck) {
    return json({ success: true, limited: false });
  }

  if (!body.name || !body.phone) {
    return json({ success: false, message: 'Name and phone are required.' }, 400);
  }

  if (!env.ENQUIRY_KV) {
    // KV isn't bound yet — fail clearly rather than silently skipping the cap.
    return json({
      success: false,
      message: 'Enquiry system is not fully configured yet (missing KV binding). Please call us directly.',
    }, 500);
  }

  const key = monthKey();
  const current = parseInt((await env.ENQUIRY_KV.get(key)) || '0', 10);

  if (current >= MONTHLY_LIMIT) {
    return json({
      success: false,
      limited: true,
      message: "We've reached this month's enquiry limit. Please call or WhatsApp us directly — we still want to hear from you.",
    }, 200);
  }

  if (!env.WEB3FORMS_ACCESS_KEY) {
    return json({
      success: false,
      message: 'Enquiry system is not fully configured yet (missing access key). Please call us directly.',
    }, 500);
  }

  const payload = {
    access_key: env.WEB3FORMS_ACCESS_KEY,
    subject: `Freight enquiry — ${body.name}`,
    name: body.name,
    phone: body.phone,
    route: body.route || '—',
    weight: body.weight || '—',
    message: body.message || '—',
  };

  let forwarded;
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    forwarded = await res.json();
  } catch {
    return json({ success: false, message: 'Could not reach the mail service. Please call us directly.' }, 502);
  }

  if (!forwarded.success) {
    return json({ success: false, message: forwarded.message || 'Send failed. Please call us directly.' }, 200);
  }

  // Only increment the count once the email genuinely went out.
  await env.ENQUIRY_KV.put(key, String(current + 1), {
    // Auto-expire well after month end so old counters don't accumulate forever.
    expirationTtl: 60 * 60 * 24 * 40,
  });

  return json({ success: true, limited: false, remaining: MONTHLY_LIMIT - (current + 1) });
}

// Any method other than POST is not supported.
export async function onRequestGet() {
  return json({ success: false, message: 'This endpoint accepts POST requests only.' }, 405);
}
