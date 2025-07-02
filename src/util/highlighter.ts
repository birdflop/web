import birdflopTheme from '~/theme.json';
import { createHighlighter, type HighlighterGeneric } from 'shiki';
import { createJavaScriptRegexEngine } from '@shikijs/engine-javascript';
const jsEngine = createJavaScriptRegexEngine();
let highlighterGlobal: HighlighterGeneric<any, any> | undefined;

export async function getGlobalHighlighter() {
  if (!highlighterGlobal) {
    highlighterGlobal = await createHighlighter({
      themes: [JSON.parse(JSON.stringify(birdflopTheme))],
      langs: ['ts'],
      engine: jsEngine,
    });
  }
  return highlighterGlobal;
}