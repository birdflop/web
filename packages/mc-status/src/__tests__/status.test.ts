import { describe, expect, it } from 'vite-plus/test';
import { readVarInt, writeVarInt } from '../protocol/varint.js';
import { normalizeMotdText, parseMotd, parseMotdLine } from '../motd/parser.js';
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

describe('MOTD semantics (Minecraft rules)', () => {
  it('applies a legacy color after an inline hex color', () => {
    const runs = parseMotdLine('&#FF54A1Pink &cRed');
    expect(runs.map((r) => r.style.color)).toEqual(['#FF54A1', '#FF5555']);
  });

  it('resets formatting on a color code', () => {
    const runs = parseMotdLine('&l&aBoldless &lbold');
    expect(runs[0]).toMatchObject({ text: 'Boldless ' });
    expect(runs[0].style.bold).toBe(false);
    expect(runs[1].style).toMatchObject({ bold: true, color: '#55FF55' });
  });

  it('resets formatting on a hex color code', () => {
    const runs = parseMotdLine('&l&#123456plain');
    expect(runs[0].style).toMatchObject({ bold: false, color: '#123456' });
  });

  it('&r restores the default style after hex', () => {
    const runs = parseMotdLine('&#123456&lA&rB&cC');
    expect(runs[1].style).toMatchObject({ color: '#FFFFFF', bold: false });
    expect(runs[2].style.color).toBe('#FF5555');
  });

  it('keeps literal angle-bracket text', () => {
    expect(motdClean('&6<<< Welcome >>>')).toBe('<<< Welcome >>>');
    expect(motdClean('a < b > c <notatag>')).toBe('a < b > c <notatag>');
  });

  it('still converts MiniMessage tags it knows', () => {
    const runs = parseMotdLine('<#ff0000><bold>Hi<reset> there');
    expect(runs[0].style).toMatchObject({ color: '#FF0000', bold: true });
    expect(runs[1].style).toMatchObject({ color: '#FFFFFF', bold: false });
  });

  it('round-trips motdRunsToHtml output, decoding entities', () => {
    const original = parseMotd('&c&lA & B <3 "q"\n&9&osecond');
    const back = parseMotd(normalizeMotdText(original.html));
    expect(back.clean).toBe('A & B <3 "q"\nsecond');
    expect(back.runs[0][0].style).toMatchObject({
      color: '#FF5555',
      bold: true,
    });
    expect(back.runs[1][0].style).toMatchObject({
      color: '#5555FF',
      italic: true,
    });
  });

  it('round-trips motdRunsToRaw output (bold/italic preserved)', () => {
    const original = parseMotd({
      text: '',
      extra: [
        { text: 'Bold ', color: '#FF54A1', bold: true },
        { text: 'Italic', color: 'aqua', italic: true },
      ],
    });
    const lines = original.raw.split('\n').map((l) => parseMotdLine(l));
    expect(lines[0][0].style).toMatchObject({ color: '#FF54A1', bold: true });
    expect(lines[0][1].style).toMatchObject({
      color: '#55FFFF',
      italic: true,
      bold: false,
    });
  });

  it('parses a top-level component array', () => {
    const result = parseMotd([{ text: 'A', color: 'red' }, 'B']);
    expect(result.clean).toBe('AB');
    expect(result.runs[0][0].style.color).toBe('#FF5555');
  });
});

function motdClean(line: string): string {
  return parseMotdLine(line)
    .map((r) => r.text)
    .join('');
}
