import { component$, isBrowser, Slot, useContext, useTask$, useVisibleTask$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import { inlineTranslate } from 'qwik-speak';
import { ArrowLeft, Clipboard, Palette, Settings, Type, Wand2 } from 'lucide-icons-qwik';
import { deepTrack } from '~/util/misc';
import { setCookies } from '~/util/dataUtils';
import Output from '~/components/Rgbirdflop/Output';
import { donateLink } from '~/components/Elements/Nav';
import { advancedStoreContext } from './context';
import { generateAdvancedOutput } from './output';
import AdvancedInput from './AdvancedInput';
import StylePanel from './StylePanel';
import AdvancedOptions from './AdvancedOptions';

interface StepProps {
  n: number;
  title: string;
  hint?: string;
}

const Step = component$<StepProps>(({ n, title, hint }) => (
  <div class="flex items-center gap-2.5">
    <span class="flex items-center justify-center w-6 h-6 rounded-full lum-grad-bg-blue/40 text-xs font-bold shrink-0">
      {n}
    </span>
    <span class="text-lum-text-secondary shrink-0 flex">
      <Slot />
    </span>
    <h3 class="text-lg font-bold">{title}</h3>
    {hint && <span class="text-sm text-lum-text-secondary font-normal hidden sm:inline">{hint}</span>}
  </div>
));

export default component$(() => {
  const t = inlineTranslate();
  const store = useContext(advancedStoreContext);

  useTask$(({ track }) => {
    deepTrack(track, store);
    if (isBrowser) setCookies('rgbadvanced', store);
  });

  // Obfuscate animation. Spans are mutated imperatively (Qwik won't rewrite a text
  // node it believes is unchanged), so we reconcile against `data-text`: obfuscated
  // spans get scrambled each frame, every other span is restored to its real glyph.
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$((ctx) => {
    if (!isBrowser) return;
    ctx.track(() => store.segments);

    const spans = () => document.querySelectorAll<HTMLElement>('label[for="advanced-input"] span[data-text]');
    const restore = (el: HTMLElement) => {
      const dt = el.getAttribute('data-text') ?? '';
      if (el.textContent !== dt) el.textContent = dt;
    };

    if (!store.segments.some((s) => s.obfuscate)) {
      spans().forEach(restore);
      return;
    }

    let raf = 0;
    let active = true;
    const tick = () => {
      if (!active) return;
      spans().forEach((el) => {
        if (el.classList.contains('obfuscate')) {
          el.textContent = Math.random().toString(36).substring(1, 3).replace('.', '');
        } else {
          restore(el);
        }
      });
      raf = requestAnimationFrame(tick);
    };
    tick();

    ctx.cleanup(() => {
      active = false;
      if (raf) cancelAnimationFrame(raf);
    });
  });

  const output = generateAdvancedOutput(store);

  return (
    <section class="relative flex mx-auto w-full px-6 min-h-svh pt-20 justify-center">
      <div class="w-full max-w-3xl flex flex-col gap-6">
        {/* Header */}
        <div class="flex flex-col gap-2">
          <div class="flex flex-wrap items-center gap-3">
            <h1 class="flex gap-3 text-2xl font-extrabold items-center flex-1">
              <Palette size={30} />
              {t('rgb.beta.title@@RGBirdflop Advanced')}
              <span class="lum-grad-bg-blue/50 text-xs py-1 px-2 rounded-lum-1 self-center">
                {t('nav.experimental@@experimental')}
              </span>
            </h1>
            <Link href="/resources/rgb" class="lum-btn lum-bg-lum-card-bg/75 hover:lum-bg-lum-card-bg rounded-lum p-2 gap-2 text-sm">
              <ArrowLeft size={18} />
              {t('rgb.beta.backToClassic@@Classic editor')}
            </Link>
          </div>
          <p class="text-lum-text-secondary">
            {t('rgb.beta.howItWorks@@Type your text, highlight any part of it, then give that part its own color and formatting. Mix as many gradients, solid colors, and styles as you like.')}
          </p>
        </div>

        {/* 1. Text */}
        <div class="flex flex-col gap-3">
          <Step n={1} title={t('rgb.beta.step.text@@Your text')}
            hint={t('rgb.beta.step.textHint@@type below, and drag to highlight a part')}>
            <Type size={18} />
          </Step>
          <AdvancedInput />
        </div>

        {/* 2. Style */}
        <div class="flex flex-col gap-3">
          <Step n={2} title={t('rgb.beta.step.style@@Style it')}
            hint={t('rgb.beta.step.styleHint@@color & format whatever you highlighted')}>
            <Wand2 size={18} />
          </Step>
          <StylePanel />
        </div>

        {/* 3. Result */}
        <div class="flex flex-col gap-3">
          <Step n={3} title={t('rgb.beta.step.result@@Copy the result')}
            hint={t('rgb.beta.step.resultHint@@click the box to copy, then paste in Minecraft')}>
            <Clipboard size={18} />
          </Step>
          <Output hidden={false} value={output} />
        </div>

        {/* Advanced options */}
        <details class="lum-card rounded-lum overflow-hidden p-0">
          <summary class="flex items-center gap-2 p-4 cursor-pointer font-semibold select-none">
            <Settings size={18} />
            {t('rgb.beta.advancedOptions@@Output format & advanced options')}
          </summary>
          <div class="px-4 pb-4">
            <AdvancedOptions hidden={false} />
          </div>
        </details>

        <p class="text-sm text-lum-text-secondary">
          {t('rgb.beta.footer@@This is an experimental editor. Found a bug? Let us know.')}{' '}
          <a href={donateLink}>{t('rgb.beta.donate@@Support our nonprofit mission')}</a>.
        </p>
      </div>
    </section>
  );
});
