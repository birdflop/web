import dgram from 'node:dgram';
import type { BedrockStatusResult, PingOptions } from '../types.js';
import { parseMotd } from '../motd/parser.js';

const DEFAULT_BEDROCK_PORT = 19132;
const RAKNET_MAGIC = Buffer.from('0000ff00fe89a950b0b643388017a554', 'hex');

export async function pingBedrock(
  host: string,
  port: number = DEFAULT_BEDROCK_PORT,
  options: PingOptions = {}
): Promise<BedrockStatusResult> {
  const timeout = options.timeout ?? 5000;
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const socket = dgram.createSocket('udp4');
    let isSettled = false;

    const cleanup = () => {
      try {
        socket.close();
      } catch {
        // Ignore socket close errors
      }
      clearTimeout(timer);
    };

    const fail = (err: Error) => {
      if (isSettled) return;
      isSettled = true;
      cleanup();
      reject(err);
    };

    const timer = setTimeout(() => {
      fail(
        new Error(`UDP ping timed out after ${timeout}ms for ${host}:${port}`)
      );
    }, timeout);

    socket.on('error', (err: Error) => {
      fail(err);
    });

    socket.on('message', (msg: Buffer) => {
      try {
        if (msg.length < 35 || msg[0] !== 0x1c) return;

        const latency = Date.now() - startTime;
        const strLen = msg.readUInt16BE(33);
        const payloadStr = msg.toString('utf8', 35, 35 + strLen);

        const parts = payloadStr.split(';');

        const line1 = parts[1] ?? '';
        const line2 = parts[7] ?? '';
        const rawMotd = line2 ? `${line1}\n${line2}` : line1;

        const motd = parseMotd(rawMotd);

        const result: BedrockStatusResult = {
          edition: 'bedrock',
          online: true,
          latency,
          version: {
            name: parts[3] ?? 'Bedrock',
            protocol: Number(parts[2] ?? 0),
          },
          players: {
            online: Number(parts[4] ?? 0),
            max: Number(parts[5] ?? 0),
          },
          motd,
          serverId: parts[6],
          gameMode: parts[8],
        };

        isSettled = true;
        cleanup();
        resolve(result);
      } catch (err) {
        fail(err instanceof Error ? err : new Error(String(err)));
      }
    });

    // Send RakNet Unconnected Ping packet
    const pingBuf = Buffer.alloc(33);
    pingBuf.writeUInt8(0x01, 0); // ID_UNCONNECTED_PING
    pingBuf.writeBigInt64BE(BigInt(startTime), 1);
    RAKNET_MAGIC.copy(pingBuf, 9);
    pingBuf.writeBigInt64BE(BigInt(0), 25);

    socket.send(pingBuf, port, host, (err: Error | null) => {
      if (err) fail(err);
    });
  });
}
