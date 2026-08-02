// NuVotifier (Votifier v2, token protocol) client.
//
// Uses Node's `net` module (available in both Node.js dev and Cloudflare
// Workers via the `nodejs_compat` compatibility flag).

import { createConnection } from 'node:net';

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
  return new Promise((resolve) => {
    const sock = createConnection(
      { host: config.host, port: config.port },
      () => sock.setTimeout(SOCKET_TIMEOUT_MS)
    );

    let buf = Buffer.alloc(0);
    let phase: 'handshake' | 'response' = 'handshake';
    let settled = false;

    const done = (result: VotifierResult) => {
      if (settled) return;
      settled = true;
      sock.destroy();
      resolve(result);
    };

    sock.on('error', (err) => done({ delivered: false, error: err.message }));
    sock.on('timeout', () =>
      done({
        delivered: false,
        error: `Socket timed out after ${SOCKET_TIMEOUT_MS}ms`,
      })
    );

    sock.on('data', (chunk: Buffer) => {
      (async () => {
        buf = Buffer.concat([buf, chunk]);

        if (phase === 'handshake') {
          const nl = buf.indexOf('\n');
          if (nl === -1) return; // wait for more data

          const greeting = buf.slice(0, nl).toString('utf8').trim();
          buf = buf.slice(nl + 1);

          const parts = greeting.split(' ');
          if (parts[0] !== 'VOTIFIER' || parts[1] !== '2' || !parts[2]) {
            done({
              delivered: false,
              error: `Server does not speak Votifier v2 (got: "${greeting}")`,
            });
            return;
          }
          const challenge = parts[2];

          // Build the signed payload.
          const payload = JSON.stringify({
            username: vote.username,
            serviceName: vote.serviceName,
            timestamp: vote.timestamp,
            address: vote.address,
            challenge,
          });
          let signature: string;
          try {
            signature = await sign(payload, config.token);
          } catch (err) {
            done({
              delivered: false,
              error: err instanceof Error ? err.message : String(err),
            });
            return;
          }
          const message = JSON.stringify({ payload, signature });
          const messageBytes = new TextEncoder().encode(message);

          // Frame: 2-byte magic + 2-byte length (big endian) + message.
          const frame = Buffer.allocUnsafe(4 + messageBytes.length);
          frame.writeUInt16BE(MAGIC, 0);
          frame.writeUInt16BE(messageBytes.length, 2);
          frame.set(messageBytes, 4);

          phase = 'response';
          sock.write(frame, (err) => {
            if (err) done({ delivered: false, error: err.message });
          });
        } else {
          // Response: {"status":"ok"} or {"status":"error",...}
          const text = buf.toString('utf8').trim();
          if (!text) return;
          try {
            const parsed = JSON.parse(text) as {
              status?: string;
              cause?: string;
              error?: string;
            };
            if (parsed.status === 'ok') {
              done({ delivered: true });
            } else {
              done({
                delivered: false,
                error:
                  parsed.error ||
                  parsed.cause ||
                  `Server rejected vote: ${text}`,
              });
            }
          } catch {
            // Some implementations just close the socket on success without a response.
            done({
              delivered: false,
              error: `Unexpected Votifier response: "${text}"`,
            });
          }
        }
      })().catch((err: unknown) => {
        done({
          delivered: false,
          error: err instanceof Error ? err.message : String(err),
        });
      });
    });

    sock.on('close', () => {
      // If we sent the frame and the server just closed without a JSON response,
      // treat it as success (common with some NuVotifier builds).
      if (phase === 'response' && !settled) {
        done({ delivered: true });
      } else {
        done({ delivered: false, error: 'Connection closed unexpectedly' });
      }
    });
  });
}
