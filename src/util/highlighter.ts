import birdflopTheme from '~/theme.json';
import { createHighlighter, type HighlighterGeneric } from 'shiki';
// @ts-expect-error - JavaScript engine types not available in current Shiki version
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
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