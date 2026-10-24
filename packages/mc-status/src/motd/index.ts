// Browser-safe entry point: MOTD parsing and color helpers only. Importing the
// package root also pulls in the socket-based pingers (node:net / node:dgram),
// which must never end up in a client bundle.
export {
  parseMotd,
  parseMotdLine,
  normalizeMotdText,
  parseChatComponent,
  motdRunsToHtml,
  motdRunsToClean,
  motdRunsToRaw,
  defaultStyle,
  isCustomHexColor,
} from './parser.js';
export {
  MC_COLORS,
  COLOR_BY_CODE,
  NAMED_COLORS,
  normalizeHexColor,
  shadowColor,
  type MCColor,
} from './colors.js';
export type {
  ChatComponent,
  MotdResult,
  MotdRun,
  MotdStyle,
} from '../types.js';
