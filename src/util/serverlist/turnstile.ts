// Cloudflare Turnstile (CAPTCHA) server-side verification for the vote form.
//
// Config:
//   TURNSTILE_SITEKEY  - public site key (env var, sent to the client widget)
//   TURNSTILE_SECRET   - secret key (Workers secret, never sent to the client)
//
// If TURNSTILE_SECRET is unset, verification is skipped only in dev builds
// (so local environments work without Turnstile). Production fails closed:
// a missing secret must never silently disable the CAPTCHA.

import { isDev } from '@qwik.dev/core';

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
  if (!secret) {
    if (isDev) return { success: true };
    console.error(
      'TURNSTILE_SECRET is not set; rejecting CAPTCHA-gated request.'
    );
    return { success: false, error: 'CAPTCHA is not configured.' };
  }

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
