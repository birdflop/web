import dns from 'node:dns/promises';
import net from 'node:net';
import type { JavaStatusResult, PingOptions } from '../types.js';
import { readString, readVarInt, writeString, writeVarInt } from './varint.js';
import { parseMotd } from '../motd/parser.js';

const DEFAULT_JAVA_PORT = 25565;
const DEFAULT_PROTOCOL_VERSION = 767; // 1.20.6+ for 1.16+ RGB Hex MOTD
// A status response is a short JSON document plus an optional 64x64 PNG
// favicon (a few KB of base64). Anything near this size is hostile or broken.
export const DEFAULT_MAX_PACKET_BYTES = 2 * 1024 * 1024;
// A VarInt is at most 5 bytes.
const MAX_VARINT_BYTES = 5;

/**
 * Accumulates socket chunks until one complete length-prefixed packet has
 * arrived. The declared length is validated as soon as its VarInt is
 * readable, chunks are collected and concatenated exactly once, and the total
 * buffered size is capped — a server cannot make us buffer more than
 * `maxPacketBytes` (plus the length prefix).
 */
export class JavaPacketReader {
  private chunks: Buffer[] = [];
  private received = 0;
  private expectedTotal: number | null = null;

  constructor(private readonly maxPacketBytes = DEFAULT_MAX_PACKET_BYTES) {}

  /**
   * Feed a chunk. Returns the full packet (length prefix stripped) once
   * complete, null while more data is needed. Throws on an invalid or
   * oversized packet.
   */
  push(chunk: Buffer): Buffer | null {
    this.chunks.push(chunk);
    this.received += chunk.length;

    if (this.expectedTotal === null) {
      // The length prefix lives in the first few bytes; merging the (tiny)
      // pre-header chunks is bounded by MAX_VARINT_BYTES.
      const head =
        this.chunks.length === 1 ? this.chunks[0] : Buffer.concat(this.chunks);
      this.chunks = [head];
      let packetLength: number;
      let lenBytes: number;
      try {
        ({ value: packetLength, bytesRead: lenBytes } = readVarInt(head, 0));
      } catch (err) {
        if (head.length < MAX_VARINT_BYTES) return null; // need more bytes
        throw new Error('Malformed status packet length prefix', {
          cause: err,
        });
      }
      if (packetLength <= 0 || packetLength > this.maxPacketBytes) {
        throw new Error(`Invalid status packet length: ${packetLength}`);
      }
      this.expectedTotal = lenBytes + packetLength;
    }

    // Buffering stops at the declared size: the packet is returned as soon as
    // it is complete (trailing bytes are ignored), so at most one socket
    // chunk past `expectedTotal` is ever held.
    if (this.received < this.expectedTotal) return null;

    const all = Buffer.concat(this.chunks, this.received);
    const { bytesRead: lenBytes } = readVarInt(all, 0);
    return all.subarray(lenBytes, this.expectedTotal);
  }
}

/** Parse a complete status-response packet (length prefix stripped). */
export function parseStatusPacket(packet: Buffer): Record<string, unknown> {
  const { value: packetId, bytesRead: idBytes } = readVarInt(packet, 0);
  if (packetId !== 0x00) {
    throw new Error(`Unexpected packet ID: 0x${packetId.toString(16)}`);
  }
  const { value: jsonString } = readString(packet, idBytes);
  const parsed: unknown = JSON.parse(jsonString);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Status response is not a JSON object');
  }
  return parsed as Record<string, unknown>;
}

async function resolveSrv(
  host: string,
  port: number
): Promise<{ host: string; port: number }> {
  if (port !== DEFAULT_JAVA_PORT) return { host, port };
  try {
    const srvs = await dns.resolveSrv(`_minecraft._tcp.${host}`);
    if (srvs && srvs.length > 0 && srvs[0].name) {
      return { host: srvs[0].name, port: srvs[0].port };
    }
  } catch {
    // Ignore SRV lookup errors
  }
  return { host, port };
}

function buildRequest(host: string, port: number, protocolVersion: number) {
  // Handshake packet (ID 0x00)
  const pPort = Buffer.alloc(2);
  pPort.writeUInt16BE(port, 0);
  const handshakePayload = Buffer.concat([
    writeVarInt(0x00),
    writeVarInt(protocolVersion),
    writeString(host),
    pPort,
    writeVarInt(1), // 1 = Status
  ]);
  const handshakePacket = Buffer.concat([
    writeVarInt(handshakePayload.length),
    handshakePayload,
  ]);

  // Status Request packet (ID 0x00)
  const statusRequestPayload = writeVarInt(0x00);
  const statusRequestPacket = Buffer.concat([
    writeVarInt(statusRequestPayload.length),
    statusRequestPayload,
  ]);

  return Buffer.concat([handshakePacket, statusRequestPacket]);
}

export async function pingJava(
  host: string,
  port: number = DEFAULT_JAVA_PORT,
  options: PingOptions = {}
): Promise<JavaStatusResult> {
  const timeout = options.timeout ?? 5000;
  const protocolVersion = options.protocolVersion ?? DEFAULT_PROTOCOL_VERSION;
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    let socket: net.Socket | null = null;
    let isSettled = false;
    const reader = new JavaPacketReader(options.maxPacketBytes);

    // The timeout covers the whole exchange, SRV lookup included.
    const timer = setTimeout(() => {
      fail(
        new Error(`TCP ping timed out after ${timeout}ms for ${host}:${port}`)
      );
    }, timeout);

    const cleanup = () => {
      socket?.destroy();
      clearTimeout(timer);
    };

    function fail(err: Error) {
      if (isSettled) return;
      isSettled = true;
      cleanup();
      reject(err);
    }

    const onPacket = (packet: Buffer) => {
      const rawJson = parseStatusPacket(packet);
      const latency = Date.now() - startTime;
      const motd = parseMotd(rawJson.description);

      const playersObj = (rawJson.players ?? {}) as Record<string, unknown>;
      const versionObj = (rawJson.version ?? {}) as Record<string, unknown>;

      const result: JavaStatusResult = {
        edition: 'java',
        online: true,
        latency,
        version: {
          name:
            typeof versionObj.name === 'string' ? versionObj.name : 'Unknown',
          protocol: Number(versionObj.protocol ?? 0),
        },
        players: {
          online: Number(playersObj.online ?? 0),
          max: Number(playersObj.max ?? 0),
          sample: Array.isArray(playersObj.sample)
            ? (playersObj.sample as Array<{ name: string; id: string }>)
            : undefined,
        },
        motd,
        favicon: typeof rawJson.favicon === 'string' ? rawJson.favicon : null,
        rawResponse: rawJson,
      };

      isSettled = true;
      cleanup();
      resolve(result);
    };

    const connect = async () => {
      const target = await resolveSrv(host, port);
      if (isSettled) return; // timed out during the SRV lookup

      const sock = new net.Socket();
      socket = sock;

      sock.on('error', (err: Error) => {
        fail(err);
      });

      sock.on('data', (chunk: Buffer) => {
        if (isSettled) return;
        try {
          const packet = reader.push(chunk);
          if (packet) onPacket(packet);
        } catch (err) {
          fail(err instanceof Error ? err : new Error(String(err)));
        }
      });

      sock.connect(target.port, target.host, () => {
        try {
          sock.write(buildRequest(host, port, protocolVersion));
        } catch (err) {
          fail(err instanceof Error ? err : new Error(String(err)));
        }
      });
    };

    connect().catch((err: unknown) => {
      fail(err instanceof Error ? err : new Error(String(err)));
    });
  });
}
