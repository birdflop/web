// Cloudflare Turnstile (CAPTCHA) server-side verification for the vote form.
//
// Config:
//   TURNSTILE_SITEKEY  - public site key (env var, sent to the client widget)
//   TURNSTILE_SECRET   - secret key (Workers secret, never sent to the client)
//
// If TURNSTILE_SECRET is unset, verification is skipped (returns true) so the
// feature still works in local/dev environments without Turnstile configured.

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
}

export async function verifyTurnstile(
  token: string | undefined | null,
  secret: string | undefined,
  remoteIp?: string
): Promise<{ success: boolean; error?: string }> {
  // No secret configured -> Turnstile disabled, allow through.
  if (!secret) return { success: true };

  if (!token) return { success: false, error: 'Missing CAPTCHA token' };

  try {
    const body = new FormData();
    body.append('secret', secret);
    body.append('response', token);
    if (remoteIp) body.append('remoteip', remoteIp);

    const res = await fetch(VERIFY_URL, { method: 'POST', body });
    const data: TurnstileVerifyResponse = await res.json();

    if (data.success) return { success: true };
    return {
      success: false,
      error: `CAPTCHA verification failed${data['error-codes']?.length ? `: ${data['error-codes'].join(', ')}` : ''}`,
    };
  } catch (err) {
    console.error('Turnstile verification error:', err);
    return { success: false, error: 'CAPTCHA verification error' };
  }
}
