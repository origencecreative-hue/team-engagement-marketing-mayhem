// Vercel Routing Middleware — password-protects the whole site at the edge,
// BEFORE any HTML is served. The password lives in a Vercel environment
// variable (APP_PASSWORD), never in your client source.
//
// Setup (one time):
//   1. Put this file at the ROOT of the repo, next to index.html.
//   2. In Vercel → your project → Settings → Environment Variables, add:
//        Name:  APP_PASSWORD      Value: <the password you want>
//      Add it for Production (and Preview/Development if you use them).
//   3. Redeploy (any push triggers it). Visitors get a browser password
//      prompt. Username can be left blank / anything — only the password
//      is checked.
//
// To change the password later: edit the env var and redeploy. No code change.

export const config = {
  // Run on every request except Vercel internals and static asset files.
  matcher: ['/((?!_next/|_vercel/|.*\\.(?:ico|png|jpg|jpeg|svg|gif|webp|css|js|txt|woff2?)$).*)'],
};

export default function middleware(request) {
  const expected = process.env.APP_PASSWORD;

  // If no password is configured, fail open rather than lock everyone out.
  if (!expected) return;

  const header = request.headers.get('authorization') || '';
  const [scheme, encoded] = header.split(' ');

  if (scheme === 'Basic' && encoded) {
    let decoded = '';
    try { decoded = atob(encoded); } catch (_) { decoded = ''; }
    // decoded is "username:password" — we ignore the username.
    const password = decoded.slice(decoded.indexOf(':') + 1);
    if (password === expected) {
      return; // correct password → let the request continue.
    }
  }

  // No/invalid credentials → prompt for a password.
  return new Response('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Marketing Mayhem", charset="UTF-8"',
    },
  });
}
