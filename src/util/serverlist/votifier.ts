// NuVotifier (Votifier v2, token protocol) client.
//
// Runs only on the server (inside server$ actions) and opens a raw TCP socket
// to the target server's Votifier port via Cloudflare's `cloudflare:sockets`
// API. Delivery is best-effort: a vote is always recorded for ranking even if
// the in-game reward packet can't be delivered.

import { connect } from 'cloudflare:sockets';

export interface VotifierConfig {
  host: string;
  port: number;
  token: string;
}

export interface VotifierResult {
  delivered: boolean;
  error?: string;
}

const MAGIC = 0x733a; // NuVotifier v2 message magic
const SOCKET_TIMEOUT_MS = 5000;

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`${label} timed out after ${ms}ms`)),
        ms
      )
    ),
  ]);
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++)
    binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function sign(payload: string, token: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(token),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(payload)
  );
  return toBase64(new Uint8Array(sig));
}

/**
 * Send a Votifier v2 vote to a server. Resolves with delivered:false (and an
 * error string) on any failure rather than throwing, so callers can record the
 * vote regardless.
 */
export async function sendVotifierV2(
  config: VotifierConfig,
  vote: {
    username: string;
    serviceName: string;
    address: string;
    timestamp: number;
  }
): Promise<VotifierResult> {
  let socket:
    | {
        readable: ReadableStream;
        writable: WritableStream;
        close: () => Promise<void>;
      }
    | undefined;

  try {
    socket = connect({ hostname: config.host, port: config.port });

    const reader = socket.readable.getReader();
    const writer = socket.writable.getWriter();
    const decoder = new TextDecoder();

    // 1. Read the handshake: "VOTIFIER 2 <challenge>\n"
    const handshake = await withTimeout(
      reader.read(),
      SOCKET_TIMEOUT_MS,
      'Votifier handshake'
    );
    if (handshake.done || !handshake.value) {
      throw new Error('Server closed connection during handshake');
    }
    const greeting = decoder.decode(handshake.value).trim();
    const parts = greeting.split(' ');
    if (parts[0] !== 'VOTIFIER' || parts[1] !== '2' || !parts[2]) {
      throw new Error(`Server does not speak Votifier v2 (got: "${greeting}")`);
    }
    const challenge = parts[2];

    // 2. Build the signed payload.
    const payload = JSON.stringify({
      username: vote.username,
      serviceName: vote.serviceName,
      timestamp: vote.timestamp,
      address: vote.address,
      challenge,
    });
    const signature = await sign(payload, config.token);
    const message = JSON.stringify({ payload, signature });
    const messageBytes = new TextEncoder().encode(message);

    // 3. Frame it: 2-byte magic + 2-byte length (big endian) + message.
    const frame = new Uint8Array(4 + messageBytes.length);
    const view = new DataView(frame.buffer);
    view.setUint16(0, MAGIC, false);
    view.setUint16(2, messageBytes.length, false);
    frame.set(messageBytes, 4);

    await withTimeout(writer.write(frame), SOCKET_TIMEOUT_MS, 'Votifier send');

    // 4. Read the response: {"status":"ok"} or {"status":"error",...}
    const response = await withTimeout(
      reader.read(),
      SOCKET_TIMEOUT_MS,
      'Votifier response'
    );
    const responseText = response.value
      ? decoder.decode(response.value).trim()
      : '';

    await writer.close().catch(() => {});

    try {
      const parsed = JSON.parse(responseText) as {
        status?: string;
        cause?: string;
        error?: string;
      };
      if (parsed.status === 'ok') return { delivered: true };
      return {
        delivered: false,
        error:
          parsed.error ||
          parsed.cause ||
          `Server rejected vote: ${responseText}`,
      };
    } catch {
      // Some implementations just close the socket on success.
      return {
        delivered: false,
        error: `Unexpected Votifier response: "${responseText}"`,
      };
    }
  } catch (err) {
    return {
      delivered: false,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    await socket?.close().catch(() => {});
  }
}
