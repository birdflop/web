import net from 'node:net';
import { afterEach, describe, expect, it } from 'vite-plus/test';
import {
  JavaPacketReader,
  parseStatusPacket,
  pingJava,
} from '../protocol/java.js';
import { writeString, writeVarInt } from '../protocol/varint.js';

function statusPacket(json: unknown): Buffer {
  const payload = Buffer.concat([
    writeVarInt(0x00),
    writeString(JSON.stringify(json)),
  ]);
  return Buffer.concat([writeVarInt(payload.length), payload]);
}

describe('JavaPacketReader', () => {
  it('returns a packet delivered in a single chunk', () => {
    const reader = new JavaPacketReader();
    const packet = reader.push(statusPacket({ description: 'hi' }));
    expect(packet).not.toBeNull();
    expect(parseStatusPacket(packet!)).toEqual({ description: 'hi' });
  });

  it('reassembles a packet split across many chunks (incl. the length prefix)', () => {
    const full = statusPacket({ description: 'x'.repeat(5000) });
    const reader = new JavaPacketReader();
    let result: Buffer | null = null;
    for (let i = 0; i < full.length; i += 7) {
      result = reader.push(full.subarray(i, i + 7));
      if (i + 7 < full.length) expect(result).toBeNull();
    }
    expect(parseStatusPacket(result!)).toEqual({
      description: 'x'.repeat(5000),
    });
  });

  it('rejects a declared length above the cap before buffering it', () => {
    const reader = new JavaPacketReader(1024);
    // 2^31-ish declared length, as a hostile server would send.
    const header = writeVarInt(0x7fffffff);
    expect(() => reader.push(header)).toThrow(/Invalid status packet length/);
  });

  it('rejects zero / negative declared lengths', () => {
    expect(() => new JavaPacketReader().push(writeVarInt(0))).toThrow(
      /Invalid status packet length/
    );
    // 0xFFFFFFFF as a VarInt decodes to -1.
    expect(() =>
      new JavaPacketReader().push(Buffer.from([0xff, 0xff, 0xff, 0xff, 0x0f]))
    ).toThrow(/Invalid status packet length/);
  });

  it('rejects a malformed (over-long) VarInt length prefix', () => {
    expect(() =>
      new JavaPacketReader().push(Buffer.from([0xff, 0xff, 0xff, 0xff, 0xff]))
    ).toThrow(/Malformed status packet length/);
  });

  it('waits for more data on a partial VarInt', () => {
    const reader = new JavaPacketReader();
    expect(reader.push(Buffer.from([0x80]))).toBeNull();
  });
});

describe('parseStatusPacket', () => {
  it('rejects unexpected packet ids', () => {
    const payload = Buffer.concat([writeVarInt(0x01), writeString('{}')]);
    expect(() => parseStatusPacket(payload)).toThrow(/Unexpected packet ID/);
  });

  it('rejects non-object JSON', () => {
    const payload = Buffer.concat([writeVarInt(0x00), writeString('[1]')]);
    expect(() => parseStatusPacket(payload)).toThrow(/not a JSON object/);
  });
});

describe('pingJava (local TCP server)', () => {
  let server: net.Server | null = null;
  const sockets = new Set<net.Socket>();

  afterEach(async () => {
    for (const s of sockets) s.destroy();
    sockets.clear();
    await new Promise<void>((r) => (server ? server.close(() => r()) : r()));
    server = null;
  });

  async function listen(onConn: (s: net.Socket) => void): Promise<number> {
    server = net.createServer((sock) => {
      sockets.add(sock);
      sock.on('error', () => {});
      onConn(sock);
    });
    await new Promise<void>((r) => server!.listen(0, '127.0.0.1', () => r()));
    return (server.address() as net.AddressInfo).port;
  }

  it('parses a status response', async () => {
    const port = await listen((sock) => {
      sock.once('data', () => {
        sock.write(
          statusPacket({
            version: { name: 'Paper 1.21', protocol: 767 },
            players: { online: 3, max: 20 },
            description: { text: 'Hello', color: 'gold', bold: true },
          })
        );
      });
    });
    const result = await pingJava('127.0.0.1', port, { timeout: 2000 });
    expect(result.online).toBe(true);
    expect(result.players).toMatchObject({ online: 3, max: 20 });
    expect(result.version.name).toBe('Paper 1.21');
    expect(result.motd.clean).toBe('Hello');
  });

  it('fails fast on an oversized declared length instead of buffering', async () => {
    const port = await listen((sock) => {
      sock.once('data', () => {
        sock.write(writeVarInt(0x7fffffff));
        // Keep streaming garbage; the client must bail out immediately.
        sock.write(Buffer.alloc(64 * 1024));
      });
    });
    await expect(
      pingJava('127.0.0.1', port, { timeout: 2000 })
    ).rejects.toThrow(/Invalid status packet length/);
  });

  it('times out against a server that never answers', async () => {
    const port = await listen(() => {});
    await expect(pingJava('127.0.0.1', port, { timeout: 200 })).rejects.toThrow(
      /timed out/
    );
  });
});
