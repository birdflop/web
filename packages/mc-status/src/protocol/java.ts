import dns from 'node:dns/promises';
import net from 'node:net';
import type { JavaStatusResult, PingOptions } from '../types.js';
import { readString, readVarInt, writeString, writeVarInt } from './varint.js';
import { parseMotd } from '../motd/parser.js';

const DEFAULT_JAVA_PORT = 25565;
const DEFAULT_PROTOCOL_VERSION = 767; // 1.20.6+ for 1.16+ RGB Hex MOTD

export async function pingJava(
  host: string,
  port: number = DEFAULT_JAVA_PORT,
  options: PingOptions = {}
): Promise<JavaStatusResult> {
  const timeout = options.timeout ?? 5000;
  const protocolVersion = options.protocolVersion ?? DEFAULT_PROTOCOL_VERSION;
  const startTime = Date.now();

  let targetHost = host;
  let targetPort = port;

  if (port === DEFAULT_JAVA_PORT) {
    try {
      const srvs = await dns.resolveSrv(`_minecraft._tcp.${host}`);
      if (srvs && srvs.length > 0 && srvs[0].name) {
        targetHost = srvs[0].name;
        targetPort = srvs[0].port;
      }
    } catch {
      // Ignore SRV lookup errors
    }
  }

  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    let isSettled = false;
    let receivedBuffer = Buffer.alloc(0);

    const cleanup = () => {
      socket.destroy();
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
        new Error(`TCP ping timed out after ${timeout}ms for ${host}:${port}`)
      );
    }, timeout);

    socket.on('error', (err: Error) => {
      fail(err);
    });

    socket.connect(targetPort, targetHost, () => {
      try {
        // Handshake packet (ID 0x00)
        const packetId = writeVarInt(0x00);
        const pVersion = writeVarInt(protocolVersion);
        const pHost = writeString(host);
        const pPort = Buffer.alloc(2);
        pPort.writeUInt16BE(port, 0);
        const pNextState = writeVarInt(1); // 1 = Status

        const handshakePayload = Buffer.concat([
          packetId,
          pVersion,
          pHost,
          pPort,
          pNextState,
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

        socket.write(Buffer.concat([handshakePacket, statusRequestPacket]));
      } catch (err) {
        fail(err instanceof Error ? err : new Error(String(err)));
      }
    });

    socket.on('data', (chunk: Buffer) => {
      receivedBuffer = Buffer.concat([receivedBuffer, chunk]);

      try {
        if (receivedBuffer.length < 2) return;

        let offset = 0;
        const { value: packetLength, bytesRead: lenBytes } = readVarInt(
          receivedBuffer,
          offset
        );
        offset += lenBytes;

        if (receivedBuffer.length < lenBytes + packetLength) {
          return; // Wait for full packet
        }

        const { value: packetId, bytesRead: idBytes } = readVarInt(
          receivedBuffer,
          offset
        );
        offset += idBytes;

        if (packetId !== 0x00) {
          fail(new Error(`Unexpected packet ID: 0x${packetId.toString(16)}`));
          return;
        }

        const { value: jsonString } = readString(receivedBuffer, offset);
        const latency = Date.now() - startTime;

        const rawJson = JSON.parse(jsonString) as Record<string, unknown>;

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
      } catch (err) {
        fail(err instanceof Error ? err : new Error(String(err)));
      }
    });
  });
}
