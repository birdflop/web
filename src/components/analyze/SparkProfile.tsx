import { component$, useStore, Slot } from '@builder.io/qwik';

export default component$(() => {
  const store = useStore({
      redirect: '',
      error: ''
  });

  return (
    <section class="flex mx-auto max-w-7xl px-6 items-center justify-center min-h-[calc(100lvh-80px)]">
      <div class="mt-10 min-h-[60px]">
        <h1 class="font-bold text-purple-100 text-4xl mb-2">
          Spark Profile Analysis
        </h1>
        <h2 class="font-bold text-purple-100 text-xl">
          These are not magic values. Many of these settings have real consequences on your server's mechanics.<br/>
          See <a href="https://eternity.community/index.php/paper-optimization/" class="text-blue-400">this guide</a> for detailed information on the functionality of each setting.
        </h2>

        <Slot />
        
        <label for="link">Paste the spark profile link here</label><br/>
        <input id="link" class="w-full text-lg bg-gray-700 text-white focus:bg-gray-600 rounded-lg p-2 mb-6 mt-2" onInput$={
          (event: any) => {
            const link = event.target!.value;
            store.redirect = '';
            if (link.startsWith('https://timin') || link.startsWith('https://www.spigotmc.org/go/timings?url=')) {
              store.error = '⚠️ This is a Timings Report. Use the Timings Report Analysis for this type of report.';
            }
            else if (link.startsWith('https://www.spigotmc.org/go/timings?url=') || link.startsWith('https://spigotmc.org/go/timings?url=')) {
              store.error = '❌ Spigot timings have limited information. Switch to Purpur (or Paper) for better timings analysis. All your plugins will be compatible, and if you don\'t like it, you can easily switch back.';
            }
            else if (!link.startsWith('https://spark.lucko.me/')) {
              store.error = '❌ This is an Invalid Spark Profile Link.';
            }
            else {
              store.error = '';
              const code = link.replace('https://spark.lucko.me/', '');
              store.redirect = `/SparkProfile/${code}`;
            }
          }
        } />
        <p class={`text-red-400 ${!store.error && 'hidden'}`}>{store.error}</p>

        <a href={store.redirect} class={`text-white text-md bg-gray-600 hover:bg-gray-500 rounded-lg cursor-pointer px-6 py-4 ${!store.redirect && 'hidden'}`}>
          Submit
        </a>
        <p class="text-white my-12">
          You can also copy the code into a link<br/>
          <span class="text-gray-300">https://simplymc.art/SparkProfile/[code]</span><br/>
          Powered by <a href="https://github.com/Pemigrade/botflop" class="text-blue-400">botflop</a>
        </p>
      </div>
    </section>
  );
});