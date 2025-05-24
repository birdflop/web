import birdflopTheme from '~/theme.json';
import { createHighlighter, type HighlighterGeneric } from 'shiki';

let highlighterGlobal: HighlighterGeneric<any, any> | undefined;

export async function getGlobalHighlighter() {
  if (!highlighterGlobal) {
    highlighterGlobal = await createHighlighter({
      themes: [JSON.parse(JSON.stringify(birdflopTheme))],
      langs: ['ts'],
    });
  }
  return highlighterGlobal;
}