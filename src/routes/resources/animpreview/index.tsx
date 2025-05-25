import { component$, useContext, useContextProvider, useStore, useTask$, useVisibleTask$ } from '@builder.io/qwik';
import { routeLoader$, type DocumentHead } from '@builder.io/qwik-city';
import { isBrowser } from '@builder.io/qwik/build';
import { getCookies, setCookies } from '~/util/dataUtils';
import { inlineTranslate } from 'qwik-speak';
import yaml from 'yaml';
import Input from '~/components/rgb/Input';
import { rgbDefaults, rgbStoreContext } from '../rgb';
import { SelectMenu } from '@luminescent/ui-qwik';
import { NotificationContext } from '~/routes/layout';

export const useCookies = routeLoader$(({ cookie, url }) => {
  return getCookies(cookie, 'animpreview', url.searchParams);
});

const minecraftColors = {
  '&0': '#000000',
  '&1': '#0000AA',
  '&2': '#00AA00',
  '&3': '#00AAAA',
  '&4': '#AA0000',
  '&5': '#AA00AA',
  '&6': '#FFAA00',
  '&7': '#AAAAAA',
  '&8': '#555555',
  '&9': '#5555FF',
  '&a': '#55FF55',
  '&b': '#55FFFF',
  '&c': '#FF5555',
  '&d': '#FF55FF',
  '&e': '#FFFF55',
  '&f': '#FFFFFF',
};

export default component$(() => {
  const t = inlineTranslate();

  const { cookies, errors } = useCookies().value;
  const notifications = useContext(NotificationContext);
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    errors.forEach((error) => {
      const id = Math.random().toString(36).substring(2, 15);
      const notification = {
        id,
        title: 'Error fetching data',
        description: `${error}`,
        bgColor: 'lum-bg-red-900/50',
      };
      notifications.push(notification);
    });
  });

  const animprevStore = useStore({
    speed: 50,
    frames: [] as string[],
    frame: 1,
    yaml: `logo:
    change-interval: 50
    texts:
    - "&#22DBE4&lS&#00FFE0&li&#22DBE4&lm&#43B6E9&lp&#6592ED&ll&#866DF2&ly&#A849F6&lM&#C924FB&lC"
    - "&#43B6E9&lS&#22DBE4&li&#00FFE0&lm&#22DBE4&lp&#43B6E9&ll&#6592ED&ly&#866DF2&lM&#A849F6&lC"
    - "&#6592ED&lS&#43B6E9&li&#22DBE4&lm&#00FFE0&lp&#22DBE4&ll&#43B6E9&ly&#6592ED&lM&#866DF2&lC"
    - "&#866DF2&lS&#6592ED&li&#43B6E9&lm&#22DBE4&lp&#00FFE0&ll&#22DBE4&ly&#43B6E9&lM&#6592ED&lC"
    - "&#A849F6&lS&#866DF2&li&#6592ED&lm&#43B6E9&lp&#22DBE4&ll&#00FFE0&ly&#22DBE4&lM&#43B6E9&lC"
    - "&#C924FB&lS&#A849F6&li&#866DF2&lm&#6592ED&lp&#43B6E9&ll&#22DBE4&ly&#00FFE0&lM&#22DBE4&lC"
    - "&#EB00FF&lS&#C924FB&li&#A849F6&lm&#866DF2&lp&#6592ED&ll&#43B6E9&ly&#22DBE4&lM&#00FFE0&lC"
    - "&#C924FB&lS&#EB00FF&li&#C924FB&lm&#A849F6&lp&#866DF2&ll&#6592ED&ly&#43B6E9&lM&#22DBE4&lC"
    - "&#A849F6&lS&#C924FB&li&#EB00FF&lm&#C924FB&lp&#A849F6&ll&#866DF2&ly&#6592ED&lM&#43B6E9&lC"
    - "&#866DF2&lS&#A849F6&li&#C924FB&lm&#EB00FF&lp&#C924FB&ll&#A849F6&ly&#866DF2&lM&#6592ED&lC"
    - "&#6592ED&lS&#866DF2&li&#A849F6&lm&#C924FB&lp&#EB00FF&ll&#C924FB&ly&#A849F6&lM&#866DF2&lC"
    - "&#43B6E9&lS&#6592ED&li&#866DF2&lm&#A849F6&lp&#C924FB&ll&#EB00FF&ly&#C924FB&lM&#A849F6&lC"
    - "&#22DBE4&lS&#43B6E9&li&#6592ED&lm&#866DF2&lp&#A849F6&ll&#C924FB&ly&#EB00FF&lM&#C924FB&lC"
    - "&#00FFE0&lS&#22DBE4&li&#43B6E9&lm&#6592ED&lp&#866DF2&ll&#A849F6&ly&#C924FB&lM&#EB00FF&lC"`,
    ...cookies,
  }, { deep: true });

  const rgbStore = useStore({
    ...rgbDefaults,
    text: '',
  }, { deep: true });
  useContextProvider(rgbStoreContext, rgbStore);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    let lastTime = performance.now();
    function setFrame(currentTime: number) {
      const deltaTime = (currentTime - lastTime);
      if (animprevStore.frames[0] && deltaTime > animprevStore.speed) {
        animprevStore.frame = animprevStore.frame + 1 >= animprevStore.frames.length ? 0 : animprevStore.frame + 1;
        lastTime = currentTime;
      }
      requestAnimationFrame(setFrame);
    }
    setFrame(performance.now());
  });

  useTask$(({ track }) => {
    track(() => animprevStore.yaml);
    if (isBrowser) setCookies('animpreview', { yaml: animprevStore.yaml });
    let json;
    try {
      json = yaml.parse(animprevStore.yaml);
    }
    catch (err) {
      const id = Math.random().toString(36).substring(2, 15);
      const notification = {
        id,
        title: 'Error setting cookies',
        description: `Error: ${err}`,
        bgColor: 'lum-bg-red-900/50',
      };
      notifications.push(notification);
    }
    if (!json) return;
    json = json[Object.keys(json)[0]];
    animprevStore.speed = json['change-interval'] ?? 50;
    animprevStore.frames = json['texts'] ?? [];
  });

  return (
    <section class="flex mx-auto max-w-6xl px-6 justify-center min-h-svh pt-[72px]">
      <div class="my-5 min-h-[60px] w-full">
        <h1 class="font-bold text-gray-50 text-2xl md:text-3xl xl:text-4xl">
          {t('nav.resources.tabAnimationPreview.title@@TAB Animation Preview')}
        </h1>
        <h2 class="text-gray-400 mt-1 mb-5">
          {t('nav.resources.tabAnimationPreview.description@@Preview TAB Animations without the need to put them in-game')}
        </h2>

        <div class="flex flex-col gap-1">
          <label for="animation">
            {t('animtab.yamlInput@@YAML Input')}
          </label>
          <textarea id="animation"
            class={{ 'lum-input h-96 font-mono': true }}
            value={animprevStore.yaml}
            onInput$={(e, el) => { animprevStore.yaml = el.value; }}
          />
        </div>

        <SelectMenu id="previewstyle" value={rgbStore.previewStyle} class={{ 'w-full': true }} onChange$={
          (e, el) => {
            rgbStore.previewStyle = el.value;
          }
        } values={[
          {
            name: t('rgb.inputText.preview.default@@Default'),
            value: 'default',
          },
          {
            name: t('rgb.inputText.preview.chat@@Minecraft Chat'),
            value: 'chat',
          },
        ]}>
          {t('rgb.inputText.preview.title@@Preview Style')}
        </SelectMenu>
        <Input readOnly>
          {(() => {
            if (!animprevStore.frames[animprevStore.frame]) return '';
            const pattern = /&?(#([0-9A-Fa-f]{6}))?((&[0-9a-fk-or]){0,5})([^&#]*)/;
            const spans = animprevStore.frames[animprevStore.frame].match(new RegExp(pattern, 'g'));
            let color = '#ffffff';
            return spans?.map((string: string, i: number) => {
              const result = string.match(pattern);
              if (!result) return '';
              console.log(result);
              color = result[2] ? `#${result[2]}` : color;
              Object.keys(minecraftColors).forEach(key => {
                if (result[3]?.includes(key)) color = minecraftColors[key as keyof typeof minecraftColors];
              });
              return (
                <span key={`char${i}`} style={{ color: color }} class={{
                  'underline': result[3]?.includes('&n'),
                  'strikethrough': result[3]?.includes('&m'),
                  'underline-strikethrough': result[3]?.includes('&n') && result[3]?.includes('&m'),
                  'font-mc-bold': result[3]?.includes('&l'),
                  'font-mc-italic': result[3]?.includes('&o'),
                  'font-mc-bold-italic': result[3]?.includes('&l') && result[3]?.includes('&o'),
                }}>
                  {result[result.length - 1].replace(/ /g, '\u00A0')}
                </span>
              );
            });
          })()}
        </Input>

        <p class="lum-bg-gray-800 font-mono lum-btn-p-2 rounded-md">
          {animprevStore.frames[animprevStore.frame]}
        </p>
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'TAB Animation Previewer - Birdflop',
  meta: [
    {
      name: 'description',
      content: 'Preview TAB Animations without the need to put them in-game. Developed by Birdflop. Birdflop is a registered 501(c)(3) nonprofit Minecraft host aiming to provide affordable and accessible hosting and resources. Check out our plans starting at $2/GB for some of the industry\'s fastest and cheapest servers, or use our free public resources.',
    },
    {
      name: 'og:description',
      content: 'Preview TAB Animations without the need to put them in-game. Developed by Birdflop. Birdflop is a registered 501(c)(3) nonprofit Minecraft host aiming to provide affordable and accessible hosting and resources. Check out our plans starting at $2/GB for some of the industry\'s fastest and cheapest servers, or use our free public resources.',
    },
    {
      name: 'og:image',
      content: '/branding/icon.png',
    },
  ],
};