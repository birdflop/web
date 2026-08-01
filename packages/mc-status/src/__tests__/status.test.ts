import { describe, expect, it } from 'vitest';
import { readVarInt, writeVarInt } from '../protocol/varint.js';
import { parseMotd } from '../motd/parser.js';
import { shadowColor } from '../motd/colors.js';

describe('@birdflop/mc-status', () => {
  describe('VarInt serialization', () => {
    it('should encode and decode 0', () => {
      const buf = writeVarInt(0);
      expect(readVarInt(buf)).toEqual({ value: 0, bytesRead: 1 });
    });

    it('should encode and decode 255', () => {
      const buf = writeVarInt(255);
      expect(readVarInt(buf)).toEqual({ value: 255, bytesRead: 2 });
    });

    it('should encode and decode protocol version 767', () => {
      const buf = writeVarInt(767);
      expect(readVarInt(buf)).toEqual({ value: 767, bytesRead: 2 });
    });
  });

  describe('MOTD parsing with Hex Colors', () => {
    it('should parse 1.16+ JSON Chat Component with hex color', () => {
      const component = {
        text: '',
        extra: [
          { text: 'Hello ', color: '#FF54A1', bold: true },
          { text: 'World', color: 'green' },
        ],
      };

      const result = parseMotd(component);
      expect(result.clean).toBe('Hello World');
      expect(result.runs[0][0].style.color).toBe('#FF54A1');
      expect(result.runs[0][0].style.bold).toBe(true);
      expect(result.runs[0][1].style.color).toBe('#55FF55');
      expect(result.html).toContain('color: #FF54A1');
    });

    it('should parse Bungeecord spread hex format (§x§f§f§5§4§a§1)', () => {
      const raw = '§x§f§f§5§4§a§1Gradient Text';
      const result = parseMotd(raw);
      expect(result.clean).toBe('Gradient Text');
      expect(result.runs[0][0].style.color).toBe('#FF54A1');
      expect(result.html).toContain('color: #FF54A1');
    });

    it('should parse ampersand hash hex (&#ff54a1)', () => {
      const raw = '&#ff54a1Hex Text';
      const result = parseMotd(raw);
      expect(result.clean).toBe('Hex Text');
      expect(result.runs[0][0].style.color).toBe('#FF54A1');
    });

    it('should parse MiniMessage format (<#ff54a1>)', () => {
      const raw = '<#ff54a1>MiniMessage Hex';
      const result = parseMotd(raw);
      expect(result.clean).toBe('MiniMessage Hex');
      expect(result.runs[0][0].style.color).toBe('#FF54A1');
    });

    it('should preserve component hex color when text contains 1.8 legacy fallback code', () => {
      const component = {
        color: '#FF54A1',
        text: '§aGradient Text',
      };
      const result = parseMotd(component);
      expect(result.clean).toBe('Gradient Text');
      expect(result.runs[0][0].style.color).toBe('#FF54A1');
    });
  });

  describe('Shadow calculation', () => {
    it('should calculate 25% brightness shadow color', () => {
      expect(shadowColor('#FF54A1')).toBe('#401528');
      expect(shadowColor('#55FF55')).toBe('#154015');
      expect(shadowColor('#FFFFFF')).toBe('#404040');
    });
  });
});
