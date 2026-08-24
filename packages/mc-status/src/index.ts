import { pingJava } from './protocol/java.js';
import { pingBedrock } from './protocol/bedrock.js';
import type { PingOptions, StatusResult } from './types.js';

export { pingJava } from './protocol/java.js';
export { pingBedrock } from './protocol/bedrock.js';
export {
  parseMotd,
  parseMotdLine,
  normalizeMotdText,
  parseChatComponent,
  motdRunsToHtml,
  motdRunsToClean,
  motdRunsToRaw,
  defaultStyle,
} from './motd/parser.js';
export {
  MC_COLORS,
  COLOR_BY_CODE,
  NAMED_COLORS,
  normalizeHexColor,
  shadowColor,
} from './motd/colors.js';
export * from './types.js';

/**
 * Ping a Minecraft server (attempts Java SLP first, then Bedrock UDP if Java fails).
 */
export async function ping(
  host: string,
  port?: number,
  options: PingOptions = {}
): Promise<StatusResult> {
  try {
    return await pingJava(host, port ?? 25565, options);
  } catch (javaError) {
    try {
      return await pingBedrock(host, port ?? 19132, options);
    } catch {
      throw javaError;
    }
  }
}
