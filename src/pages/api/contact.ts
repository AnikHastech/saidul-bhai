// ============================================================
//  POST /api/contact — contact form handler.
//  Stub: validates and acknowledges. Wire to email / helpdesk /
//  Shopify later (e.g. send via your transactional email provider).
// ============================================================
import type { APIRoute } from 'astro';

export const prerender = false;

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim();
  const subject = String(body.subject ?? '').trim();
  const messageText = String(body.message ?? '').trim();

  if (!name || !EMAIL_RE.test(email) || messageText.length < 10) {
    return json({ error: 'Please provide your name, a valid email and a message (10+ characters).' }, 422);
  }

  // TODO: forward to your email / helpdesk provider here.
  console.log('[contact]', { name, email, subject: subject || '(none)', length: messageText.length });

  return json({ message: "Thanks — we'll get back to you within one business day." });
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
