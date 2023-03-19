import { component$, useVisibleTask$, useStore } from '@builder.io/qwik';
import { DocumentHead } from '@builder.io/qwik-city';
import yaml from 'yaml';
import TextInput from '~/components/elements/TextInput';
import {
  $translate as t,
  Speak,
} from 'qwik-speak';

export default component$(() => {
  const store: any = useStore({
    text: 'SimplyMC',
    speed: 50,
    frames: [],
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
  }, { deep: true });

  useVisibleTask$(() => {
    let speed = store.speed;

    let frameInterval = setInterval(() => setFrame(), Math.ceil(speed / 50) * 50);

    function setFrame() {
      if (!store.frames[0]) return;
      if (speed != store.speed) {
        clearInterval(frameInterval);
        speed = store.speed;
        frameInterval = setInterval(() => setFrame(), Math.ceil(speed / 50) * 50);
      }
      store.frame = store.frame + 1 >= store.frames.length ? 0 : store.frame + 1;
    }
  });

  useVisibleTask$(({ track }) => {
    track(() => store.yaml);
    let json = yaml.parse(store.yaml);
    json = json[Object.keys(json)[0]];
    store.speed = json['change-interval'] ?? 50;
    store.frames = json['texts'] ?? [];
  });

  return (
    <section class="flex mx-auto max-w-7xl px-6 sm:items-center justify-center min-h-[calc(100lvh-80px)]">
      <Speak assets={['animpreview']}>
        <div class="mt-10 min-h-[60px] w-full">
          <h1 class="font-bold text-gray-50 text-2xl sm:text-4xl mb-2">
            {t('animpreview.title@@Animation Previewer')}
          </h1>
          <h2 class="text-gray-50 text-base sm:text-xl mb-12">
            {t('animpreview.subtitle@@Preview TAB Animations without the need to put them ingame')}
          </h2>

          <TextInput big id="Animaton" value={store.yaml} onInput$={(event: any) => { store.yaml = event.target!.value; }}>
            {t('animpreview.yamlInput@@YAML Input')}
          </TextInput>

          <h1 class={'text-6xl my-6 break-all max-w-7xl -space-x-[1px]'}>
            {(() => {
              if (!store.frames[store.frame]) return '';
              const pattern = /&(#[0-9A-Fa-f]{6})?(&[0-9A-Fa-fk-or])?(&[0-9A-Fa-fk-or])?(&[0-9A-Fa-fk-or])?(&[0-9A-Fa-fk-or])([^&]*)/;
              const spans = store.frames[store.frame].match(new RegExp(pattern, 'g'));
              return spans.map((string: string, i: number) => {
                let result: any = string.match(pattern);
                result = result.filter((obj: string) => { return obj; });
                return (
                  <span key={`char${i}`} style={{ color: result[1] }} class={`font${result.includes('&n') ? '-underline' : ''}${result.includes('&m') ? '-strikethrough' : ''} font${result.includes('&l') ? '-bold' : ''}${result.includes('&o') ? '-italic' : ''}`} >
                    {result[result.length - 1]}
                  </span>
                );
              });
            })()}
          </h1>

        </div>
      </Speak>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'TAB Animation Previewer',
  meta: [
    {
      name: 'description',
      content: 'Preview TAB Animations without the need to put them ingame',
    },
    {
      name: 'og:description',
      content: 'Preview TAB Animations without the need to put them ingame',
    },
    {
      name: 'og:image',
      content: 'https://simplymc.art/images/icon.png',
    },
  ],
};