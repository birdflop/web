import birdflopTheme from '~/theme.json';
import { createHighlighter } from 'shiki';
import { createJavaScriptRegexEngine } from '@shikijs/engine-javascript';
const jsEngine = createJavaScriptRegexEngine();
let highlighterGlobal:
  | Awaited<ReturnType<typeof createHighlighter>>
  | undefined;

export async function getGlobalHighlighter() {
  if (!highlighterGlobal) {
    highlighterGlobal = await createHighlighter({
      themes: [birdflopTheme as never],
      langs: ['ts'],
      engine: jsEngine,
    });
  }
  return highlighterGlobal;
}
