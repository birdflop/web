import { describe, expect, it } from 'vite-plus/test';
import { generateMotdOutput, normalizeMotdText, parseMotdLine } from '../motd';

const text = (line: string) =>
  parseMotdLine(line)
    .map((r) => r.text)
    .join('');

describe('MOTD designer parsing (src/util/motd)', () => {
  it('applies legacy colors after a hex color', () => {
    const runs = parseMotdLine('&#FF54A1Pink &aGreen');
    expect(runs.map((r) => r.style.color)).toEqual(['#FF54A1', '#55FF55']);
  });

  it('applies legacy colors after a spread hex color', () => {
    const runs = parseMotdLine('&x&1&2&3&4&5&6Hex &cRed');
    expect(runs.map((r) => r.style.color)).toEqual(['#123456', '#FF5555']);
  });

  it('resets formatting on a color code (Minecraft rule)', () => {
    const runs = parseMotdLine('&6&lEpic &7| &eSurvival');
    expect(runs[0].style).toMatchObject({ color: '#FFAA00', bold: true });
    expect(runs[1].style).toMatchObject({ color: '#AAAAAA', bold: false });
    expect(runs[2].style).toMatchObject({ color: '#FFFF55', bold: false });
  });

  it('&r resets color and formatting, and later legacy codes still apply', () => {
    const runs = parseMotdLine('&#123456&lA&rB&cC');
    expect(runs[0].style).toMatchObject({ color: '#123456', bold: true });
    expect(runs[1].style).toMatchObject({ color: '#FFFFFF', bold: false });
    expect(runs[2].style.color).toBe('#FF5555');
  });

  it('keeps user text that looks like markup', () => {
    expect(text('&6<<< Welcome >>>')).toBe('<<< Welcome >>>');
    expect(text('<3 you & <name>')).toBe('<3 you & <name>');
  });

  it('keeps a lone & and incomplete codes as text', () => {
    expect(text('Tom & Jerry &')).toBe('Tom & Jerry &');
    // An incomplete spread hex keeps "&x"; the trailing &f codes still apply.
    expect(text('&x&f&f')).toBe('&x');
  });

  it('renders MOTD raw from a status ping with bold/italic intact', () => {
    // motdRunsToRaw shape: color first, then formats.
    const runs = parseMotdLine('§#FF54A1§lBold §#55FFFF§oItalic');
    expect(runs[0].style).toMatchObject({ color: '#FF54A1', bold: true });
    expect(runs[1].style).toMatchObject({
      color: '#55FFFF',
      italic: true,
      bold: false,
    });
  });

  it('decodes entities only for real HTML input', () => {
    expect(
      normalizeMotdText('<span style="color: #FF5555">a &amp; b</span>')
    ).toBe('§#FF5555a & b§r');
    expect(normalizeMotdText('a &amp; b')).toBe('a &amp; b');
  });

  it('round-trips designer output to section format', () => {
    expect(generateMotdOutput('&#FF54A1Hi', '', 'section')).toBe(
      '§x§F§F§5§4§A§1Hi'
    );
  });
});
