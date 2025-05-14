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

export default component$(() => {
  const t = inlineTranslate();

  const animtextureStore = useStore({
    frames: [] as { img: HTMLImageElement, delay: number }[],
    textureName: 'animtexture',
  }, { deep: true });

  useTask$(({ track }) => {
    track(() => animtextureStore.frames);
    console.log('rerendering');
    if (!isBrowser) return;

    const canvas = document.getElementById('c') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    let maxWidth = 0;
    let height = 0;
    for (let i = 0; i != animtextureStore.frames.length; i++) {
      const img = animtextureStore.frames[i].img;
      console.log(img.naturalWidth, img.naturalHeight);
      if (img.naturalWidth > maxWidth) maxWidth = img.naturalWidth;
      height += img.naturalHeight;
    }

    canvas.width = maxWidth;
    canvas.height = height;

    ctx.imageSmoothingEnabled = false;
    for (let i = 0; i != animtextureStore.frames.length; i++) {
      const img = animtextureStore.frames[i].img;
      ctx.drawImage(img, 0, i * img.naturalHeight);
    }
    const b64 = canvas.toDataURL();
    const pngd = document.getElementById('pngd') as HTMLAnchorElement;
    const mcmeta = document.getElementById('mcmeta') as HTMLAnchorElement;
    pngd.href = b64;
    pngd.download = animtextureStore.textureName + '.png';
    mcmeta.download = animtextureStore.textureName + '.png.mcmeta';

    const mcmetajson = {
      animation: {
        frames: animtextureStore.frames.map((frame, i) => ({
          index: i,
          time: frame.delay,
        })),
      },
    };
    mcmeta.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(mcmetajson, null, 2));
  });

  return (
    <section class="flex mx-auto max-w-6xl px-6 justify-center min-h-svh pt-[72px]">
      <div class="flex my-5 min-h-[60px] w-full gap-4">
        <div class="flex-1">
          <h1 class="font-bold text-gray-50 text-2xl md:text-3xl xl:text-4xl">
            {t('nav.resources.animatedTextures.title@@Animated Textures')}
          </h1>
          <h2 class="text-gray-400 mt-1 mb-5">
            {t('nav.resources.animatedTextures.description@@Easily merge textures for resource pack animations')}
          </h2>

          <div class="grid grid-cols-2 gap-2 mb-4">
            <div class="flex flex-col">
              <label for="fileInput">Select Frame(s) or a GIF</label>
              <input id="fileInput" type="file" multiple accept="image/*" class="file:lum-btn hover:file:lum-bg-gray-700" onChange$={(e, el) => {
                const { files } = el;
                if (!files) return;
                Array.from(files).forEach(file => {
                  const f = new FileReader();
                  f.readAsDataURL(file);
                  f.onloadend = async (e) => {
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
                  };
                });
              }} />
            </div>
            <div class="flex flex-col">
              <label for="textureName">{t('animtexture.textureName@@Texture Name')}</label>
              <input id="textureName" class={{ 'lum-input': true }} value={animtextureStore.textureName} onInput$={(e, el) => { animtextureStore.textureName = el.value; }}/>
            </div>
          </div>

          <div id="imgs" class="lum-card flex-row flex-wrap max-h-[620px] overflow-auto gap-2">
            {animtextureStore.frames.map((frame, i) => (
              <div key={`frame${i}`} class="lum-card w-24 p-0">
                <img width={96} height={96} class="rounded-t-md" src={frame.img.src} />
                <input type="number" value={frame.delay}
                  onInput$={(e, el) => {
                    animtextureStore.frames[i].delay = Number(el.value);
                  }}
                  class="lum-input mb-2 mx-2" />
              </div>
            ))}
          </div>

          <div id="links" class="flex gap-2 mt-6">
            <a class="lum-btn" id="pngd" href='/'>
              <Download size={20} />
              {t('animtexture.downloadPNG@@Download PNG')}
            </a>
            <a class="lum-btn" id="mcmeta" target="_blank" href='data:text/plain;charset=utf-8,{"animation":{}}'>
              <Download size={20} />
              {t('animtexture.downloadMCMETA@@Download MCMETA')}
            </a>
          </div>
        </div>
        <div class="flex flex-col items-center max-w-24">
          <p class="mb-2">
            PNG Preview
          </p>
          <canvas id="c" class="lum-card max-w-full p-0" />
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