import { Slot, component$, useSignal } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import { LogoPaper } from '@luminescent/ui-qwik';
import { inlineTranslate } from 'qwik-speak';

export default component$(() => {
  const t = inlineTranslate();
  const redirect = useSignal('');
  const error = useSignal('');

  return (
    <section class="flex mx-auto max-w-6xl px-6 justify-center min-h-svh pt-20">
      <div class="min-h-[60px] w-full">
        <h1 class="flex gap-4 items-center my-3!">
          <LogoPaper size={70} /> {t('nav.resources.paperTimings.title@@Paper Timings')}
        </h1>
        <p>
          {t('nav.resources.paperTimings.description@@Analyze Paper Timings and get possible optimizations')}
        </p>
        <p>
          These are not magic values. Many of these settings have real consequences on your server's mechanics.<br />
          See <a href="https://eternity.community/index.php/paper-optimization/" class="text-blue-400 hover:underline">this guide</a> for detailed information on the functionality of each setting.
        </p>
        <hr/>

        <Slot />

        <label for="link">Paste the timings report link here</label>
        <input class="lum-input mt-1 w-full" id="link" onInput$={(e, el) => {
          const link = el.value;
          redirect.value = '';
          if (link.startsWith('https://spark.lucko.me')) {
            error.value = '⚠️ This is a Spark Profile. Use the Spark Profile Analysis for this type of report.';
          }
          else if (link.startsWith('https://www.spigotmc.org/go/timings?url=') || link.startsWith('https://spigotmc.org/go/timings?url=')) {
            error.value = '❌ Spigot timings have limited information. Switch to Purpur (or Paper) for better timings analysis. All your plugins will be compatible, and if you don\'t like it, you can easily switch back.';
          }
          else if (!link.startsWith('https://timin') || !link.includes('?id=')) {
            error.value = '❌ This is an Invalid Timings Link.';
          }
          else {
            error.value = '';
            const code = link.replace('/d=', '/?id=').replace('timin.gs', 'timings.aikar.co').split('#')[0].split('\n')[0].split('/?id=')[1];
            redirect.value = `/resources/papertimings/${code}`;
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
          <span class="text-lum-text-secondary">https://birdflop.com/resources/papertimings/[code]</span><br />
          Powered by <a href="https://github.com/Pemigrade/botflop" class="text-blue-400 hover:underline">botflop</a>
        </p>
      </div>
    </section>
  );
});