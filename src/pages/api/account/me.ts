// ============================================================
//  GET /api/account/me — minimal logged-in customer info for the
//  header AccountDrawer island. Returns { loggedIn:false } for
//  guests and on any auth failure (never leaks tokens or errors).
// ============================================================
import type { APIRoute } from 'astro';
import { createCustomerClient, getPublicOrigin, NotAuthenticatedError } from '~/lib/shopify/customer';

export const prerender = false;

const ME_QUERY = /* GraphQL */ `
  query Me {
    customer {
      firstName
      lastName
      emailAddress { emailAddress }
    }
  }
`;

interface MeResult {
  customer: {
    firstName: string | null;
    lastName: string | null;
    emailAddress: { emailAddress: string } | null;
  } | null;
}

export const GET: APIRoute = async ({ cookies, request, url }) => {
  const client = createCustomerClient(cookies, getPublicOrigin(request, url));

  if (!client.isLoggedIn()) return json({ loggedIn: false });

  try {
    const data = await client.query<MeResult>(ME_QUERY);
    const c = data.customer;
    if (!c) return json({ loggedIn: false });
    const name = [c.firstName, c.lastName].filter(Boolean).join(' ');
    return json({
      loggedIn: true,
      firstName: c.firstName ?? null,
      name,
      email: c.emailAddress?.emailAddress ?? null,
    });
  } catch (err) {
    // NotAuthenticated → guest; any other failure also degrades to guest.
    if (!(err instanceof NotAuthenticatedError)) {
      console.error('[account/me] failed:', (err as Error).message);
    }
    return json({ loggedIn: false });
  }
};

function json(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}
