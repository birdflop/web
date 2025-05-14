import { component$, isBrowser, useStore, useTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

import { inlineTranslate } from 'qwik-speak';

import { parseGIF, decompressFrames } from 'gifuct-js';
import { Download } from 'lucide-icons-qwik';

export async function base64ToFile(dataURL: string) {
  const arr = dataURL.split(',');
  const match = arr[0].match(/:(.*?);/);
  const mime = match ? match[1] : '';
  const result = await fetch(dataURL);
  return {
    mime,
    buffer: await result.arrayBuffer(),
  };
};

const readFileAsDataURL = (file: Blob) => new Promise<ProgressEvent<FileReader>>((resolve, reject) => {
  const f = new FileReader();
  f.readAsDataURL(file);
  f.onloadend = (e) => resolve(e);
  f.onerror = reject;
});

export default component$(() => {
  const t = inlineTranslate();

  const animtextureStore = useStore({
    frames: [] as { img: HTMLImageElement, delay: number }[],
    textureName: 'animtexture',
    loading: false,
  }, { deep: true });

  useTask$(({ track }) => {
    track(() => animtextureStore.frames);
    if (!isBrowser) return;

    const canvas = document.getElementById('c') as HTMLCanvasElement;
    if (!canvas) return;
    console.log('rerendering');
    const ctx = canvas.getContext('2d')!;

    let maxWidth = 0;
    let maxHeight = 0;
    for (let i = 0; i != animtextureStore.frames.length; i++) {
      const img = animtextureStore.frames[i].img;
      if (img.naturalWidth > maxWidth) maxWidth = img.naturalWidth;
      if (img.naturalHeight > maxHeight) maxHeight = img.naturalHeight;
    }

    canvas.width = maxWidth;
    canvas.height = maxHeight * animtextureStore.frames.length;

    ctx.imageSmoothingEnabled = false;
    for (let i = 0; i != animtextureStore.frames.length; i++) {
      const img = animtextureStore.frames[i].img;
      ctx.drawImage(img, 0, i * maxHeight, maxWidth, maxHeight);
    }
    const pngd = document.getElementById('pngd') as HTMLAnchorElement;
    pngd.href = canvas.toDataURL();
  });

  return (
    <section class="flex mx-auto max-w-6xl px-6 justify-center min-h-svh pt-[72px]">
      <div class="flex my-5 min-h-[60px] w-full gap-4">
        <div class="flex-1">
          <h1 class="font-bold text-gray-50 text-2xl md:text-3xl xl:text-4xl flex items-center gap-3">
            {t('nav.resources.animatedTextures.title@@Animated Textures')}
            <div class={{
              "lum-loading w-6 h-6 border-3 transition-all": true,
              "opacity-0": !animtextureStore.loading,
            }} />
          </h1>
          <h2 class="text-gray-400 mt-1 mb-5">
            {t('nav.resources.animatedTextures.description@@Easily merge textures for resource pack animations')}
          </h2>

          <div class="grid grid-cols-2 gap-2 mb-4">
            <div class="flex flex-col">
              <label for="fileInput">Select Frame(s) or a GIF</label>
              <input id="fileInput" type="file" multiple accept="image/*" class="file:lum-btn hover:file:lum-bg-gray-700" onChange$={async (e, el) => {
                const files = Array.from(el.files ?? []);
                animtextureStore.loading = true;
                for (const f of files) {
                  const e = await readFileAsDataURL(f);
                  if (!e.target?.result) return;

                  const frames = [...animtextureStore.frames];
                  const file = await base64ToFile(e.target.result.toString());
                  if (file.mime == 'image/gif') {
                    const parsedGif = parseGIF(file.buffer);
                    const gifFrames = decompressFrames(parsedGif, true);
                    gifFrames.forEach((frame) => {
                      const canvas = document.createElement('canvas');
                      canvas.width = frame.dims.width;
                      canvas.height = frame.dims.height;
                      const ctx = canvas.getContext('2d')!;
                      const frameImageData = ctx.createImageData(frame.dims.width, frame.dims.height);
                      frameImageData.data.set(frame.patch);
                      ctx.putImageData(frameImageData, 0, 0);
                      const img = new Image();
                      img.src = canvas.toDataURL();
                      img.onload = () => {
                        frames.push({
                          img,
                          delay: Math.ceil(20 * frame.delay / 100),
                        });
                      };
                    });
                  }
                  else {
                    const img = new Image();
                    img.src = e.target.result as string;
                    frames.push({
                      img,
                      delay: 20,
                    });
                  }

                  animtextureStore.frames = frames;
                }
                animtextureStore.loading = false;
              }} />
            </div>
            <div class="flex flex-col">
              <label for="textureName">{t('animtexture.textureName@@Texture Name')}</label>
              <input id="textureName" class={{ 'lum-input': true }} value={animtextureStore.textureName} onInput$={(e, el) => { animtextureStore.textureName = el.value; }}/>
            </div>
          </div>

          <div id="imgs" class="lum-card flex-row flex-wrap max-h-[620px] overflow-auto gap-2 p-2">
            {animtextureStore.frames.map((frame, i) => (
              <div key={`frame${i}`} class="lum-card lum-bg-gray-800 w-24 p-0">
                <img width={96} height={96} class="rounded-t-md" src={frame.img.src} />
                <input type="number" value={frame.delay}
                  onInput$={(e, el) => {
                    animtextureStore.frames[i].delay = Number(el.value);
                  }}
                  class="lum-input lum-bg-gray-900 mb-2 mx-2" />
              </div>
            ))}
          </div>

          <div id="links" class="flex gap-2 mt-6">
            <a class="lum-btn" id="pngd" target="_blank" download={animtextureStore.textureName + '.png'}>
              <Download size={20} />
              {t('animtexture.downloadPNG@@Download PNG')}
            </a>
            <a class="lum-btn" id="mcmeta" target="_blank" download={animtextureStore.textureName + '.png.mcmeta'} href={
              'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(
                {
                  animation: {
                    frames: animtextureStore.frames.map((frame, i) => ({
                      index: i,
                      time: frame.delay,
                    })),
                  },
                }, null, 2
              ))}>
              <Download size={20} />
              {t('animtexture.downloadMCMETA@@Download MCMETA')}
            </a>
          </div>
        </div>
        <div class={{
          "flex flex-col items-center max-w-24 transition-all": true,
          "opacity-0": animtextureStore.frames.length == 0,
          }}>
          <p class="mb-2">
            Animation Preview
          </p>
          <canvas id="anim" class="lum-card w-full p-0" />
          <p class="my-2">
            PNG Preview
          </p>
          <canvas id="c" class="lum-card w-full p-0" />
        </div>
      </div>
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