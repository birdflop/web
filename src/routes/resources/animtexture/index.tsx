import { component$, isBrowser, useStore, useTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

import { inlineTranslate } from 'qwik-speak';

import { parseGIF, decompressFrames } from 'gifuct-js';
import { Download, RefreshCw, X } from 'lucide-icons-qwik';
import { NumberInput, Toggle } from '@luminescent/ui-qwik';

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
    width: 16,
    height: 16,
    lockdimensions: true,
    bounce: false,
    syncduration: false,
  }, { deep: true });

  useTask$(({ track }) => {
    (Object.keys(animtextureStore) as Array<keyof typeof animtextureStore>).forEach((key) => {
      if (key == 'loading') return;
      track(() => animtextureStore[key]);
    });
    if (animtextureStore.lockdimensions) animtextureStore.height = animtextureStore.width;
    if (!isBrowser) return;

    const canvas = document.getElementById('c') as HTMLCanvasElement;
    if (!canvas) return;
    console.log('rerendering');
    const ctx = canvas.getContext('2d')!;

    canvas.width = animtextureStore.width;
    canvas.height = animtextureStore.height * animtextureStore.frames.length;

    for (let i = 0; i != animtextureStore.frames.length; i++) {
      const img = animtextureStore.frames[i].img;
      ctx.drawImage(img, 0, i * animtextureStore.height, animtextureStore.width, animtextureStore.height);
    }

    const pngd = document.getElementById('pngd') as HTMLAnchorElement;
    pngd.href = canvas.toDataURL();

    const anim = document.getElementById('anim') as HTMLCanvasElement;
    if (!anim) return;
    const animctx = anim.getContext('2d')!;
    anim.width = animtextureStore.width;
    anim.height = animtextureStore.height;
    let i = 0;
    let lastTime = 0;
    let bounce = false;
    const animate = (time: number) => {
      if (animtextureStore.frames.length == 0) return;
      if (time - lastTime > animtextureStore.frames[i].delay / 20 * 1000) {
        lastTime = time;
        bounce ? i-- : i++;
        if (i >= animtextureStore.frames.length) {
          if (animtextureStore.bounce) {
            bounce = !bounce;
            i--;
          }
          else {
            i = 0;
          }
        }
        if (i < 0) {
          bounce = !bounce;
          i++;
        }
      }
      animctx.clearRect(0, 0, anim.width, anim.height);
      animctx.drawImage(animtextureStore.frames[i].img, 0, 0, animtextureStore.width, animtextureStore.height);
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
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

          <div class="grid grid-cols-3 gap-2 mb-2">
            <div class="flex flex-col gap-1 col-span-3">
              <label for="fileInput">Select Frame(s) or a GIF</label>
              <input id="fileInput" type="file" multiple accept="image/*" class="file:lum-btn hover:file:lum-bg-gray-700 file:mb-1" onChange$={async (e, el) => {
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
                          delay: Math.ceil(frame.delay / 100),
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
            <div class={{
              "flex items-end gap-1": true,
              "col-span-2": animtextureStore.lockdimensions,
            }}>
              <div class="flex-1 flex flex-col gap-1">
                <label for="textureName">{t('animtexture.textureName@@Texture Name')}</label>
                <input id="textureName" class={{ 'lum-input': true }} value={animtextureStore.textureName} onInput$={(e, el) => { animtextureStore.textureName = el.value; }}/>
              </div>
              <p class="lum-btn p-2">
                .png
              </p>
            </div>
            <NumberInput input min={1} step={16} value={animtextureStore.width} id="width" class={{ "w-full": true }}
              onIncrement$={() => {
                animtextureStore.width += 16;
              }}
              onDecrement$={() => {
                animtextureStore.width -= 16;
              }}
              onInput$={(e, el) => {
                const value = Number(el.value);
                if (isNaN(value)) return;
                animtextureStore.width = value;
              }}
            >
              <span class="flex gap-1 items-center">
                {t('animtexture.width@@Width')}
                <button class="lum-btn p-1" onClick$={() => {
                  const maxWidth = Math.max(...animtextureStore.frames.map(frame => frame.img.naturalWidth));
                  animtextureStore.width = maxWidth;
                }}>
                  <RefreshCw size={16} />
                </button>
              </span>
            </NumberInput>
            {!animtextureStore.lockdimensions &&
              <NumberInput input min={1} step={16} value={animtextureStore.height} id="height" class={{ "w-full": true }}
                onIncrement$={() => {
                  animtextureStore.height += 16;
                }}
                onDecrement$={() => {
                  animtextureStore.height -= 16;
                }}
                onInput$={(e, el) => {
                  const value = Number(el.value);
                  if (isNaN(value)) return;
                  animtextureStore.height = value;
                }}
              >
                <span class="flex gap-1 items-center">
                  {t('animtexture.height@@Height')}
                  <button class="lum-btn p-1" onClick$={() => {
                    const maxHeight = Math.max(...animtextureStore.frames.map(frame => frame.img.naturalHeight));
                    animtextureStore.height = maxHeight;
                  }}>
                    <RefreshCw size={16} />
                  </button>
                </span>
              </NumberInput>
            }
          </div>
          <div class="flex flex-col gap-2">
            <Toggle id="lockdimensions" checked={animtextureStore.lockdimensions}
              onChange$={(e, el) => { animtextureStore.lockdimensions = el.checked; }}
              label={t('animtexture.lockDimensions@@Lock Dimensions')} />
            <Toggle id="bounce" checked={animtextureStore.bounce}
              onChange$={(e, el) => { animtextureStore.bounce = el.checked; }}
              label={t('animtexture.bounce@@Bounce Animation')} />
            <Toggle id="syncduration" checked={animtextureStore.syncduration}
              onChange$={(e, el) => { animtextureStore.syncduration = el.checked; }}
              label={t('animtexture.syncDuration@@Sync Duration')} />
          </div>

          <div id="imgs" class="lum-card flex-row flex-wrap max-h-[620px] overflow-auto gap-2 p-2 mt-4">
            {animtextureStore.frames.map((frame, i) => (
              <div key={`frame${i}-${frame.delay}`} class="lum-card lum-bg-gray-800 w-24 p-0 relative">
                <button class="lum-btn lum-bg-red-700/20 hover:lum-bg-red-700 p-1 absolute top-1 right-1" onClick$={() => {
                  const frames = [...animtextureStore.frames];
                  frames.splice(i, 1);
                  animtextureStore.frames = frames;
                }}>
                  <X size={16}/>
                </button>
                <img width={96} height={96} class={{
                  "rounded-t-md": true,
                  "rounded-b-md": animtextureStore.syncduration,
                }} src={frame.img.src} />
                {!animtextureStore.syncduration &&
                  <input type="number" value={frame.delay}
                    onInput$={(e, el) => {
                      animtextureStore.frames[i].delay = Number(el.value);
                    }}
                    class="lum-input lum-bg-gray-900 mb-2 mx-2" />
                }
              </div>
            ))}
          </div>
          {animtextureStore.syncduration && animtextureStore.frames[0] &&
            <NumberInput input min={1} value={animtextureStore.frames[0].delay} id="height"
              onIncrement$={() => {
                animtextureStore.frames[0].delay++;
                animtextureStore.frames.forEach((frame) => {
                  frame.delay = animtextureStore.frames[0].delay;
                });
              }}
              onDecrement$={() => {
                animtextureStore.frames[0].delay--;
                animtextureStore.frames.forEach((frame) => {
                  frame.delay = animtextureStore.frames[0].delay;
                });
              }}
              onInput$={(e, el) => {
                const value = Number(el.value);
                if (isNaN(value)) return;
                animtextureStore.frames.forEach((frame) => {
                  frame.delay = value;
                });
              }}
            >
              {t('animtexture.duration@@Duration')}
            </NumberInput>
          }

          <div id="links" class="flex gap-2 mt-6">
            <a class="lum-btn" id="pngd" target="_blank" download={animtextureStore.textureName + '.png'}>
              <Download size={20} />
              {t('animtexture.downloadPNG@@Download PNG')}
            </a>
            <a class="lum-btn" id="mcmeta" target="_blank" download={animtextureStore.textureName + '.png.mcmeta'} href={
              'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(
                {
                  animation: {
                    frames: [
                      ...animtextureStore.frames.map((frame, i) => ({
                        index: i,
                        time: frame.delay,
                      })),
                      ...(animtextureStore.bounce ? 
                        animtextureStore.frames.map((frame, i) => ({
                          index: animtextureStore.frames.length - i,
                          time: animtextureStore.frames[i].delay,
                        }))
                        : [])
                    ],
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
          <canvas id="anim" class="lum-card w-full p-0" style={{
            imageRendering: 'pixelated',
          }} />
          <p class="my-2">
            PNG Preview
          </p>
          <canvas id="c" class="lum-card w-full p-0" style={{
            imageRendering: 'pixelated',
          }} />
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