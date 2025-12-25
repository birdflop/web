import { component$, useContext, useContextProvider, useSignal, useStore, useTask$, useVisibleTask$, isBrowser } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { getCookies, setCookies } from '~/util/dataUtils';
import { inlineTranslate } from 'qwik-speak';
import yaml from 'yaml';
import Input, { previewStyleContext } from '~/components/Rgbirdflop/Input';
import { rgbStoreContext } from '../rgb';
import { Notification, NotificationContext } from '~/util/Notification';
import { Eye } from 'lucide-icons-qwik';
import { hexToRGB } from '~/util/rgb/Colors';
import { rgbDefaults } from '~/util/rgb/presets/defaults';
import { defaultDescription, generateHead } from '~/root';

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
      const notification = new Notification('Error fetching data')
        .setDescription(`${error}`)
        .setBgColor('lum-bg-red/50')
        .setPersist(true);
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

  const previewStyle = useSignal('default');
  useContextProvider(previewStyleContext, previewStyle);

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
      const notification = new Notification('Error parsing YAML')
        .setDescription(`Error: ${err}`)
        .setBgColor('lum-bg-red/50')
        .setPersist(true);
      notifications.push(notification);
    }
    if (!json) return;
    json = json[Object.keys(json)[0]];
    animprevStore.speed = json['change-interval'] ?? 50;
    animprevStore.frames = json['texts'] ?? [];
  });

  return (
    <section class="flex mx-auto max-w-6xl px-6 justify-center min-h-svh pt-20">
      <div class="min-h-15 w-full">
        <h1 class="flex gap-4 items-center my-3!">
          <Eye size={70} /> {t('nav.resources.tabAnimationPreview.title@@TAB Animation Preview')}
        </h1>
        <p>
          {t('nav.resources.tabAnimationPreview.description@@Preview TAB Animations without the need to put them in-game')}
        </p>
        <hr/>

        <Input readOnly playerName="AnimPreview">
          {(() => {
            if (!animprevStore.frames[animprevStore.frame]) return '';
            const pattern = /&?(#([0-9A-Fa-f]{6}))?((&[0-9a-fk-or]){0,5})([^&#]*)/g;
            const spans = animprevStore.frames[animprevStore.frame].match(pattern);
            let color = '#ffffff';
            return spans?.map((string: string, i: number) => {
              const result = string.match(pattern);
              if (!result) return '';
              color = result[2] ? `#${result[2]}` : color;

              const shadowLength = previewStyle.value == 'default' ? '4px 4px' : '2px 2px';
              const shadowRGB = hexToRGB(color).map(c => Math.round(c * 0.25));
              const shadowColor = `rgb(${shadowRGB[0]}, ${shadowRGB[1]}, ${shadowRGB[2]})`;
              Object.keys(minecraftColors).forEach(key => {
                if (result[3]?.includes(key)) color = minecraftColors[key as keyof typeof minecraftColors];
              });
              return (
                <span key={`char${i}`} style={{
                  color,
                  textShadow: `${shadowLength} 0 ${shadowColor}`,
                }} class={{
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

        <div class="flex flex-col gap-1 mb-2">
          <label for="animation">
            {t('animtab.yamlInput@@YAML Input')}
          </label>
          <textarea id="animation"
            class={{ 'lum-input h-96 font-mono': true }}
            value={animprevStore.yaml}
            onInput$={(e, el) => { animprevStore.yaml = el.value; }}
          />
        </div>

        <p class="lum-bg-lum-input-bg font-mono lum-btn-p-2 rounded-lum">
          {animprevStore.frames[animprevStore.frame]}
        </p>
      </div>
    </section>
  );
});

export const head = generateHead({
  title: 'TAB Animation Previewer - Birdflop',
  description: 'Preview TAB Animations without the need to put them in-game. ' + defaultDescription,
  ads: true,
});