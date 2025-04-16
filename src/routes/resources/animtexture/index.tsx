import { component$, useStore, useVisibleTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

import { Toggle } from '@luminescent/ui-qwik';
import { inlineTranslate } from 'qwik-speak';

export default component$(() => {
  const t = inlineTranslate();

  const animtextureStore = useStore({
    frames: [] as any[],
    textureName: '',
    cumulative: false,
  }, { deep: true });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    if (document.getElementsByName('gifframes')[0]) return;
    const script = document.createElement('script');
    script.src = '/scripts/gif-frames.js';
    script.defer = true;
    script.setAttribute('name', 'gifframes');
    document.head.appendChild(script);
  });

  return (
    <section class="flex mx-auto max-w-6xl px-6 justify-center min-h-svh pt-[72px]">
      <div class="my-5 min-h-[60px] w-full">
        <h1 class="font-bold text-gray-50 text-2xl md:text-3xl xl:text-4xl">
          {t('nav.resources.animatedTextures.title@@Animated Textures')}
        </h1>
        <h2 class="text-gray-400 mt-1 mb-5">
          {t('nav.resources.animatedTextures.description@@Easily merge textures for resource pack animations')}
        </h2>

        <div class="flex flex-col gap-2">
          <label for="fileInput">Select Frame(s) or a GIF</label>
          <input id="fileInput" type="file" multiple accept="image/*" class="file:lum-btn hover:file:lum-bg-gray-700" onChange$={(e, el) => {
            const { files } = el;
            if (!files) return;
            Array.from(files).forEach(file => {
              const f = new FileReader();
              f.readAsDataURL(file);
              f.onloadend = async (e) => {
                const b64 = e!.target!.result;
                const type = b64!.toString().split(',')[0].split(';')[0].split(':')[1];
                if (type == 'image/gif') {
                  // @ts-ignore
                  const gifframes = await gifFrames({ url: b64, frames: 'all', cumulative: animtextureStore.cumulative });
                  gifframes.forEach((frame: any) => {
                    const contentStream = frame.getImage();
                    const imageData = window.btoa(String.fromCharCode.apply(null, contentStream._obj));
                    const b64frame = `data:image/png;base64,${imageData}`;

                    animtextureStore.frames.push({ img: b64frame, delay: Math.ceil(20 * frame.frameInfo.delay / 100) });
                  });
                  return;
                }
                animtextureStore.frames.push({ img: b64, delay: 20 });
              };
            });
          }} />
          <Toggle id="Cumulative" checked={animtextureStore.cumulative}
            onChange$={(e, el) => { animtextureStore.cumulative = el.checked; }}
            label={t('animtexture.cumulative@@Cumulative (Turn this on if gif frames are broken)')} />

          <label for="textureName">{t('animtexture.textureName@@Texture Name')}</label>
          <input id="textureName" class={{ 'lum-input': true }} value={animtextureStore.textureName} onInput$={(e, el) => { animtextureStore.textureName = el.value; }}/>

          <p class="text-gray-50">
            {t('animtexture.framePreview@@Frame Preview')}
          </p>
          <div id="imgs" class="lum-card flex-wrap max-h-[620px] overflow-auto gap-2">
            {animtextureStore.frames.map((frame, i) => (
              <div key={`frame${i}`} class="lum-card w-24 p-0">
                <img width={96} height={96} class="rounded-t-md" src={frame.img} />
                <input type="number" value={frame.delay}
                  onInput$={(e, el) => { animtextureStore.frames[i].delay = el.value; }}
                  class="lum-input mb-2 mx-2" />
              </div>
            ))}
          </div>

          <button class={{ 'lum-btn my-6': true }} onClick$={() => {
            const canvas = document.getElementById('c') as HTMLCanvasElement;
            canvas.classList.add('sm:flex');
            const imglist = document.getElementById('imgs') as HTMLDivElement;
            const ctx = canvas.getContext('2d')!;
            const imgs = imglist.getElementsByTagName('IMG') as HTMLCollectionOf<HTMLImageElement>;
            let max = 0;
            for (let i = 0; i != imgs.length; i++) {
              if (imgs[i].naturalWidth > max) max = imgs[i].naturalWidth;
            }
            canvas.width = max;
            canvas.height = max * imgs.length;
            ctx.imageSmoothingEnabled = false;
            for (let i = 0; i != imgs.length; i++) {
              ctx.drawImage(imgs[i], 0, i * max);
              ctx.drawImage(imgs[i], 0, max * i, max, max);
            }
            const b64 = canvas.toDataURL();
            const pngd = document.getElementById('pngd') as HTMLAnchorElement;
            const mcmeta = document.getElementById('mcmeta') as HTMLAnchorElement;
            pngd.href = b64;
            pngd.download = animtextureStore.textureName + '.png';
            mcmeta.download = animtextureStore.textureName + '.png.mcmeta';

            const start = '{"animation":{"frames": [';
            const frameBase = '{"index": ';
            const frameMid = ', "time": ';
            const frameEnd = '},';
            let res = start;
            for (let i = 0; i != animtextureStore.frames.length; i++) {
              let tmp = frameBase;
              tmp += i;
              tmp += frameMid;
              tmp += animtextureStore.frames[i].delay;
              tmp += frameEnd;
              res += tmp;
            }
            res = res.substring(0, res.length - 1);
            res += ']}}';

            mcmeta.href = 'data:text/plain;charset=utf-8,' + res;

            const links = document.getElementById('links')!;
            links.className = 'inline';
          }}>
            {t('animtexture.generate@@Generate')}
          </button>

        </div>

        <div id="links" class="hidden">
          <p class="mb-4">Animated Texture Generated Successfully!</p>
          <div class="flex gap-2">
            <a class="lum-btn" id="pngd" href='/'>
              {t('animtexture.downloadPNG@@Download PNG')}
            </a>
            <a class="lum-btn" id="mcmeta" target="_blank" href='data:text/plain;charset=utf-8,{"animation":{}}'>
              {t('animtexture.downloadMCMETA@@Download MCMETA')}
            </a>
          </div>
        </div>

      </div>
      <canvas id="c" class="w-24 max-h-svh ml-48 hidden"></canvas>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Minecraft Animated Textures Creator - Birdflop',
  meta: [
    {
      name: 'description',
      content: 'Easily merge textures for resource pack animations or convert from GIF, by Birdflop. Birdflop is a registered 501(c)(3) nonprofit Minecraft host aiming to provide affordable and accessible hosting and resources. Check out our plans starting at $2/GB for some of the industry\'s fastest and cheapest servers, or use our free public resources.',
    },
    {
      name: 'og:description',
      content: 'Easily merge textures for resource pack animations or convert from GIF, by Birdflop. Birdflop is a registered 501(c)(3) nonprofit Minecraft host aiming to provide affordable and accessible hosting and resources. Check out our plans starting at $2/GB for some of the industry\'s fastest and cheapest servers, or use our free public resources.',
    },
    {
      name: 'og:image',
      content: '/branding/icon.png',
    },
  ],
};