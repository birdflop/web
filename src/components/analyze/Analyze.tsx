import { Label } from '@luminescent/ui-qwik';
import { Slot, component$, useSignal } from '@qwik.dev/core';
import { Link } from '@qwik.dev/router';
import Clipboard from 'lucide-icons-qwik/icons/Clipboard';
import Zap from 'lucide-icons-qwik/icons/Zap';
import { inlineTranslate } from 'qwik-speak';

export default component$(() => {
  const t = inlineTranslate();
  const redirect = useSignal('');
  const error = useSignal('');

  return (
    <section class="mx-auto flex min-h-svh max-w-6xl flex-col px-6 pt-20">
      <h1 class="my-2 flex items-center gap-3 text-2xl font-extrabold">
        <Zap size={32} />
        {t('nav.resources.analyze.title@@Analyze')}
      </h1>
      <p class="border-lum-border/10 text-lum-text-secondary mb-4 border-b pb-4">
        {t(
          'nav.resources.analyze.description@@Analyze a Spark Profile or Paper Timings and get possible optimizations'
        )}
      </p>

      <p>
        These are not magic values. Many of these settings have real
        consequences on your server's mechanics.
        <br />
        See{' '}
        <a
          href="https://eternity.community/index.php/paper-optimization/"
          class="text-lum-accent hover:underline"
        >
          this guide
        </a>{' '}
        for detailed information on the functionality of each setting.
      </p>

      <Slot />

      <Label
        for="link"
        label={t(
          'analyze.pasteLink@@Paste the Spark profile or Paper timings link here'
        )}
      >
        <Clipboard q:slot="before-label" size={16} />
        <input
          class="lum-input mt-1 w-full"
          id="link"
          placeholder="https://spark.lucko.me/..."
          onInput$={(e, el) => {
            const link = el.value;
            redirect.value = '';
            let code;
            if (
              link.startsWith('https://www.spigotmc.org/go/timings?url=') ||
              link.startsWith('https://spigotmc.org/go/timings?url=')
            ) {
              error.value =
                "❌ Spigot timings have limited information. Switch to Purpur (or Paper) for better timings analysis. All your plugins will be compatible, and if you don't like it, you can easily switch back.";
            } else if (link.startsWith('https://spark.lucko.me')) {
              code = link.replace('https://spark.lucko.me/', '');
            } else if (link.startsWith('https://timin')) {
              code = link
                .replace('/d=', '/?id=')
                .replace('timin.gs', 'timings.aikar.co')
                .split('#')[0]
                .split('\n')[0]
                .split('/?id=')[1];
            } else {
              error.value = '❌ This is an invalid link.';
            }
            if (code) redirect.value = `/resources/analyze/${code}`;
          }}
        />
      </Label>

      <p
        class={{
          'mt-3 text-red-400': true,
          hidden: !error.value,
        }}
      >
        {error.value}
      </p>
      <div
        class={{
          'mt-3 flex': true,
          hidden: !redirect.value,
        }}
      >
        <Link
          href={redirect.value}
          class="lum-btn lum-bg-blue hover:lum-bg-blue"
        >
          Submit
        </Link>
      </div>

      <p class="my-12">
        {t(
          'analyze.linkDescription@@You can also copy the timings or profile id into a link'
        )}
        <br />
        <span class="text-lum-text-secondary">
          https://birdflop.com/resources/analyze/[id]
        </span>
        <br />
        <span class="text-lum-text-secondary">
          https://birdflop.com/resources/analyze/[id]
        </span>
        <br />
        Powered by{' '}
        <a
          href="https://github.com/birdflop/botflop"
          class="text-lum-accent hover:underline"
        >
          botflop
        </a>
      </p>
    </section>
  );
});
