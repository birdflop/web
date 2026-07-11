const WIDTH_POOLS: Record<number, string[]> = {
  2: ['!', ',', '.', ':', ';', 'i', '|'],
  3: ['\'', '`', 'l'],
  4: ['I', '[', ']', 't'],
  5: ['"', '(', ')', '*', '<', '>', 'f', 'k', '{', '}'],
  6: [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
    'a',
    'b',
    'c',
    'd',
    'e',
    'g',
    'h',
    'j',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
    '#',
    '$',
    '%',
    '&',
    '+',
    '-',
    '=',
    '?',
    '_',
    '~',
    '^',
    '\\',
    '/',
  ],
  7: ['@'],
};

export function getObfuscatedChar(char: string): string {
  if (char === ' ') return ' ';

  for (const [, pool] of Object.entries(WIDTH_POOLS)) {
    if (pool.includes(char)) {
      const randomIndex = Math.floor(Math.random() * pool.length);
      return pool[randomIndex];
    }
  }

  // Default to pool of width 6
  const pool6 = WIDTH_POOLS[6];
  const randomIndex = Math.floor(Math.random() * pool6.length);
  return pool6[randomIndex];
}

export function obfuscateText(text: string): string {
  return Array.from(text, getObfuscatedChar).join('');
}
