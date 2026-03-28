import { Slot, component$, useSignal } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import { Zap } from 'lucide-icons-qwik';
import { inlineTranslate } from 'qwik-speak';

export default component$(() => {
  const t = inlineTranslate();
  const redirect = useSignal('');
  const error = useSignal('');

  return (
    <section class="flex flex-col mx-auto max-w-6xl px-6 min-h-svh pt-20">
      <h1 class="flex gap-3 text-2xl font-extrabold items-center my-2">
        <Zap size={32} />
        {t('nav.resources.sparkProfile.title@@Spark Profile')}
      </h1>
      <p class="mb-4 border-b border-lum-border/10 pb-4">
        {t('nav.resources.sparkProfile.description@@Analyze a Spark Profile and get possible optimizations')}
      </p>

      <p>
        These are not magic values. Many of these settings have real consequences on your server's mechanics.<br />
        See <a href="https://eternity.community/index.php/paper-optimization/" class="text-blue-400 hover:underline">this guide</a> for detailed information on the functionality of each setting.
      </p>

      <Slot />

      <label for="link">Paste the spark profile link here</label>
      <input class="lum-input mt-1 w-full" id="link" onInput$={(e, el) => {
        const link = el.value;
        redirect.value = '';
        if (link.startsWith('https://timin') || link.startsWith('https://www.spigotmc.org/go/timings?url=')) {
          error.value = '⚠️ This is a Timings Report. Use the Timings Report Analysis for this type of report.';
        }
        else if (link.startsWith('https://www.spigotmc.org/go/timings?url=') || link.startsWith('https://spigotmc.org/go/timings?url=')) {
          error.value = '❌ Spigot timings have limited information. Switch to Purpur (or Paper) for better timings analysis. All your plugins will be compatible, and if you don\'t like it, you can easily switch back.';
        }
        else if (!link.startsWith('https://spark.lucko.me/')) {
          error.value = '❌ This is an Invalid Spark Profile Link.';
        }
        else {
          error.value = '';
          const code = link.replace('https://spark.lucko.me/', '');
          redirect.value = `/resources/sparkprofile/${code}`;
        }
      }}/>

      <p class={{
        'text-red-400 mt-3': true,
        'hidden': !error.value,
      }}>{error.value}</p>
      <div class={{
        'flex mt-3': true,
        'hidden': !redirect.value,
      }}>
        <Link href={redirect.value} class="lum-btn lum-bg-blue hover:lum-bg-blue">
          Submit
        </Link>
      </div>

      <p class="my-12">
        You can also copy the code into a link<br />
        <span class="text-lum-text-secondary">https://birdflop.com/resources/sparkprofile/[code]</span><br />
        Powered by <a href="https://github.com/Pemigrade/botflop" class="text-blue-400 hover:underline">botflop</a>
      </p>
    </section>
  );
});