import { component$, useStore, Slot } from '@builder.io/qwik';

import TextInput from '~/components/elements/TextInput';
import Button from '~/components/elements/Button';

export default component$(() => {
  const store = useStore({
    redirect: '',
    error: '',
  });

  return (
    <section class="flex mx-auto max-w-7xl px-6 items-center justify-center min-h-[calc(100lvh-80px)]">
      <div class="mt-10 min-h-[60px]">
        <h1 class="font-bold text-gray-50 text-4xl mb-2">
          Paper Timings Analysis
        </h1>
        <h2 class="text-gray-50 text-xl">
          These are not magic values. Many of these settings have real consequences on your server's mechanics.<br/>
          See <a href="https://eternity.community/index.php/paper-optimization/" class="text-blue-400">this guide</a> for detailed information on the functionality of each setting.
        </h2>

        <Slot />
        
        <TextInput id="link" onInput$={
          (event: any) => {
            const link = event.target!.value;
            store.redirect = '';
            if (link.startsWith('https://spark.lucko.me')) {
              store.error = '⚠️ This is a Spark Profile. Use the Spark Profile Analysis for this type of report.';
            }
            else if (link.startsWith('https://www.spigotmc.org/go/timings?url=') || link.startsWith('https://spigotmc.org/go/timings?url=')) {
              store.error = '❌ Spigot timings have limited information. Switch to Purpur (or Paper) for better timings analysis. All your plugins will be compatible, and if you don\'t like it, you can easily switch back.';
            }
            else if (!link.startsWith('https://timin') || !link.includes('?id=')) {
              store.error = '❌ This is an Invalid Timings Link.';
            }
            else {
              store.error = '';
              const code = link.replace('/d=', '/?id=').replace('timin.gs', 'timings.aikar.co').split('#')[0].split('\n')[0].split('/?id=')[1];
              store.redirect = `/PaperTimings/${code}`;
            }
          }
        }>
          Paste the timings report link here
        </TextInput>
        <p class={`text-red-400 ${!store.error && 'hidden'}`}>{store.error}</p>
        <Button.SPA href={store.redirect} className={`${!store.redirect && 'hidden'}`}>
          Submit
        </Button.SPA>

        <p class="text-white my-12">
          You can also copy the code into a link<br/>
          <span class="text-gray-300">https://simplymc.art/PaperTimings/[code]</span><br/>
          Powered by <a href="https://github.com/Pemigrade/botflop" class="text-blue-400">botflop</a>
        </p>
      </div>
    </section>
  );
});