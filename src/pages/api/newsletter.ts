// ============================================================
//  POST /api/newsletter — newsletter signup endpoint.
//  Stub: validates the email and acknowledges. Wire this to your
//  ESP (Shopify customer/marketing, Klaviyo, Mailchimp, …) later.
// ============================================================
import type { APIRoute } from 'astro';

export const prerender = false;

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const POST: APIRoute = async ({ request }) => {
  let email = '';
  try {
    const body = await request.json();
    email = typeof body?.email === 'string' ? body.email.trim() : '';
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  if (!EMAIL_RE.test(email)) {
    return json({ error: 'Please enter a valid email address.' }, 422);
  }

  // TODO: forward `email` to your email service provider (Klaviyo, Mailchimp,
  // Shopify customer create, etc.) here.

  return json({ message: "You're in — watch your inbox for the next drop." });
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
