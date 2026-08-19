/**
 * The response security headers, shared by `next.config.ts` and its tests.
 *
 * Nonce-based `script-src` is deliberately absent: Next 16 can only emit a nonce from a
 * per-request middleware CSP, which would force every statically generated route to render
 * dynamically. That trade was assessed and deferred (maintenance ledger, 2026-08-17), so
 * `'unsafe-inline'` stays on `script-src`. `style-src` keeps it permanently — next/font emits
 * inline styles.
 */
export function contentSecurityPolicy({ isDev }: { isDev: boolean }): string {
  const scriptSrc = isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'";

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    "img-src 'self' data: blob: https://*.r2.cloudflarestorage.com",
    "connect-src 'self' https://*.r2.cloudflarestorage.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");
}
