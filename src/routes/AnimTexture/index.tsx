import { component$, useStore, useVisibleTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

import Toggle from '~/components/elements/Toggle';
import TextInput from '~/components/elements/TextInput';
import { Button, ExternalButton } from '~/components/elements/Button';

import { useTranslate, Speak } from 'qwik-speak';

export default component$(() => {
  const store = useStore({
    frames: [] as any[],
    textureName: '',
    cumulative: false,
  }, { deep: true });

  useVisibleTask$(() => {
    if (document.getElementsByName('gifframes')[0]) return;
    const script = document.createElement('script');
    script.src = '/scripts/gif-frames.js';
    script.defer = true;
    script.setAttribute('name', 'gifframes');
    document.head.appendChild(script);
  }, { strategy: 'document-idle' });

  const t = useTranslate();

  return (
    <section class="flex mx-auto max-w-4xl px-6 items-center justify-center min-h-[calc(100lvh-80px)]">
      <Speak assets={['animtexture']}>
        <div class="my-10 min-h-[60px] w-full">
          <h1 class="font-bold text-gray-50 text-2xl sm:text-4xl mb-2">
            {t('animtexture.title@@Animated Textures')}
          </h1>
          <h2 class="text-gray-50 text-base sm:text-xl mb-12">
            {t('animtexture.subtitle@@Easily merge textures for resource pack animations')}
          </h2>

          <label for="fileInput">Select Frame(s) or a GIF</label><br/>
          <input id="fileInput" type="file" multiple accept="image/*" class="text-white text-xl file:bg-gray-600 file:hover:bg-gray-500 file:rounded-lg file:cursor-pointer file:px-4 file:py-2 file:mr-4 mt-2 text-transparent file:text-white file:text-lg file:border-none" onChange$={
            (event) => {
              if (!event.target.files) return;
              Array.from(event.target.files).forEach(file => {
                const f = new FileReader();
                f.readAsDataURL(file);
                f.onloadend = async (e) => {
                  const b64 = e!.target!.result;
                  const type = b64!.toString().split(',')[0].split(';')[0].split(':')[1];
                  if (type == 'image/gif') {
                  // @ts-ignore
                    const gifframes = await gifFrames({ url: b64, frames: 'all', cumulative: store.cumulative });
                    gifframes.forEach((frame: any) => {
                      const contentStream = frame.getImage();
                      const imageData = window.btoa(String.fromCharCode.apply(null, contentStream._obj));
                      const b64frame = `data:image/png;base64,${imageData}`;

                      store.frames.push({ img: b64frame, delay: Math.ceil(20 * frame.frameInfo.delay / 100) });
                    });
                    return;
                  }
                  store.frames.push({ img: b64, delay: 20 });
                };
              });
            }
          } />

          <div id="imgs" class="flex flex-wrap max-h-[620px] overflow-auto my-4 gap-2">
            {store.frames.map((frame, i) => (
              <div key={`frame${i}`} class="w-24 rounded-lg border-gray-700 border-2">
                <img width={96} height={96} class="rounded-t-md" src={frame.img} />
                <input type="number" value={frame.delay} onInput$={(event: any) => { store.frames[i].delay = event.target!.value; }} class="w-full text-lg bg-gray-700 text-white text-center focus:bg-gray-600 p-2 rounded-b-md"/>
              </div>
            ))}
          </div>

          <TextInput id="textureName" extraClass="mb-3" value={store.textureName} onInput$={(event: any) => { store.textureName = event.target!.value; }}>
            {t('animtexture.textureName@@Texture Name')}
          </TextInput>

          <Toggle id="Cumulative" checked={store.cumulative} onChange$={(event: any) => { store.cumulative = event.target.checked; }}>
            {t('animtexture.cumulative@@Cumulative (Turn this on if gif frames are broken)')}
          </Toggle>

          <Button extraClass="my-6" onClick$={
            () => {
              const canvas: any = document.getElementById('c')!;
              canvas.classList.add('sm:flex');
              const imglist: any = document.getElementById('imgs')!;
              const ctx = canvas.getContext('2d');
              const imgs = imglist.getElementsByTagName('IMG');
              let max = 0;
              for (let i = 0; i != imgs.length; i++) {
                if (imgs[i].naturalWidth > max)max = imgs[i].naturalWidth;
              }
              canvas.width = max;
              canvas.height = max * imgs.length;
              ctx.imageSmoothingEnabled = false;
              for (let i = 0; i != imgs.length; i++) {
                ctx.drawImage(imgs[i], 0, i * max);
                ctx.drawImage(imgs[i], 0, max * i, max, max);
              }
              const b64 = canvas.toDataURL();
              const pngd: any = document.getElementById('pngd')!;
              const mcmeta: any = document.getElementById('mcmeta')!;
              pngd.href = b64;
              pngd.download = store.textureName + '.png';
              mcmeta.download = store.textureName + '.png.mcmeta';

              const start = '{"animation":{"frames": [';
              const frameBase = '{"index": ';
              const frameMid = ', "time": ';
              const frameEnd = '},';
              let res = start;
              for (let i = 0; i != store.frames.length; i++) {
                let tmp = frameBase;
                tmp += i;
                tmp += frameMid;
                tmp += store.frames[i].delay;
                tmp += frameEnd;
                res += tmp;
              }
              res = res.substring(0, res.length - 1);
              res += ']}}';

              mcmeta.href = 'data:text/plain;charset=utf-8,' + res;

              const links = document.getElementById('links')!;
              links.className = 'inline';
            }
          }>
            {t('animtexture.generate@@Generate')}
          </Button>

          <div id="links" class="hidden">
            <p class="mb-4">Animated Texture Generated Successfully!</p>
            <ExternalButton id="pngd" extraClass="mr-2" href='/'>
              {t('animtexture.downloadPNG@@Download PNG')}
            </ExternalButton>
            <ExternalButton id="mcmeta" target="_blank" href='data:text/plain;charset=utf-8,{"animation":{}}'>
              {t('animtexture.downloadMCMETA@@Download MCMETA')}
            </ExternalButton>
          </div>

        </div>
        <canvas id="c" class="w-24 max-h-screen ml-48 hidden"></canvas>
      </Speak>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Animated Textures',
  meta: [
    {
      name: 'description',
      content: 'Easily merge textures for resource pack animations or convert from GIF',
    },
    {
      name: 'og:description',
      content: 'Easily merge textures for resource pack animations or convert from GIF',
    },
    {
      name: 'og:image',
      content: 'https://simplymc.art/images/icon.png',
    },
  ],
};