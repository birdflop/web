import { component$, isBrowser, useContextProvider, useSignal, useStore, useTask$ } from '@builder.io/qwik';

import { inlineTranslate } from 'qwik-speak';

import { parseGIF, decompressFrames } from 'gifuct-js';
import { Download, GalleryHorizontalEnd, RefreshCw, X } from 'lucide-icons-qwik';
import { NumberInput, Toggle } from '@luminescent/ui-qwik';
import { defaultDescription, generateHead } from '~/root';
import Input, { previewStyleContext } from '~/components/Rgbirdflop/Input';
import { rgbStoreContext } from '../rgb';
import { rgbDefaults } from '~/util/rgb/presets/defaults';

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
  useContextProvider(rgbStoreContext, rgbDefaults);

  const previewStyle = useSignal('chat');
  useContextProvider(previewStyleContext, previewStyle);

  const animtextureStore = useStore({
    frames: [] as { img: HTMLImageElement, delay: number }[],
    textureName: 'animtexture',
    loading: false,
    width: 16,
    height: 16,
    lockdimensions: true,
    bounce: false,
    syncduration: false,
    showChatPreview: false,
    accumulate: false,
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
        if (bounce) i--;
        else i++;
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
    };
    requestAnimationFrame(animate);
  });

  return (
    <section class="flex mx-auto max-w-6xl px-6 gap-10 justify-center min-h-svh pt-20">
      <div class="min-h-[60px] w-full">
        <h1 class="flex gap-4 items-center my-3!">
          <GalleryHorizontalEnd size={70} /> {t('nav.resources.animatedTextures.title@@Animated Textures')}
        </h1>
        <p>
          {t('nav.resources.animatedTextures.description@@Easily create textures from GIFs and Discord emojis etc. for use in Minecraft chat with sprites or any resource pack animation.')}
        </p>
        <hr/>
        <h3>
          Input Image(s)
        </h3>
        <div class="flex flex-col gap-1 mb-5">
          <label for="fileInput">
            {t('animtexture.selectFrames@@Select GIF or image from your device')}
          </label>
          <input id="fileInput" type="file" multiple accept="image/*" class="file:lum-btn hover:file:lum-bg-gray-700 file:mb-1" onChange$={async (e, el) => {
            const files = Array.from(el.files ?? []);
            animtextureStore.loading = true;
            for (const f of files) {
              const e = await readFileAsDataURL(f);
              if (!e.target?.result) return;

              const frames = animtextureStore.accumulate ? [...animtextureStore.frames] : [];
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
          <label for="urlInput" class="mt-6">
            {t('animtexture.pasteUrl@@Paste GIF or image URL')}
          </label>
          <input id="urlInput" type="text" class="lum-input mb-6"
            placeholder="https://cdn.discordapp.com/emojis/904177608537804870.webp?size=128&animated=true"
            onChange$={async (event, el) => {
              let url = el.value;
              if (!url) return;

              animtextureStore.loading = true;

              // if the url is a discord emoji, you can replace .webp with .gif
              if (url.includes('cdn.discordapp.com/emojis/') && url.includes('.webp')) {
                url = url.replace('.webp', '.gif').split('?')[0];
                el.value = url;
              }

              const f = await (await fetch(url)).blob();

              const e = await readFileAsDataURL(f);
              if (!e.target?.result) return;

              const frames = animtextureStore.accumulate ? [...animtextureStore.frames] : [];
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

              animtextureStore.loading = false;
            }} />
          <Toggle id="accumulate" checked={animtextureStore.accumulate}
            onChange$={(e, el) => { animtextureStore.accumulate = el.checked; }}>
            {t('animtexture.accumulate@@Accumulate images')}
          </Toggle>
        </div>

        <hr/>

        <Toggle id="showchatpreview" checked={animtextureStore.showChatPreview}
          onChange$={(e, el) => { animtextureStore.showChatPreview = el.checked; }}>
          {t('animtexture.showChatPreview@@Show Minecraft chat preview')}
        </Toggle>

        { animtextureStore.showChatPreview &&
          <Input readOnly
            noFormatRow
            chatInput={`this is so funny <sprite:${animtextureStore.textureName}>`}
            playerName="AnimatedTexture">
            <span class="text-white! items-center gap-2">
              this is so funny
            </span>
            <span class="ml-2 inline-block align-middle">
              <canvas id="anim" class="p-0 w-6 h-6" style={{
                imageRendering: 'pixelated',
              }} />
            </span>
          </Input>
        }

        <div class="grid grid-cols-3 gap-2 my-4">
          <div class={{
            'flex items-end gap-1': true,
            'col-span-2': animtextureStore.lockdimensions,
          }}>
            <div class="flex-1 flex flex-col gap-1">
              <label for="textureName">{t('animtexture.textureName@@Texture Name')}</label>
              <input id="textureName" class={{ 'lum-input': true }} value={animtextureStore.textureName} onInput$={(e, el) => { animtextureStore.textureName = el.value; }}/>
            </div>
            <p class="lum-btn p-2">
                .png
            </p>
          </div>
          <NumberInput input min={1} step={16} value={animtextureStore.width} id="width" class={{ 'w-full': true }}
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
            <NumberInput input min={1} step={16} value={animtextureStore.height} id="height" class={{ 'w-full': true }}
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
            onChange$={(e, el) => { animtextureStore.lockdimensions = el.checked; }}>
            {t('animtexture.lockDimensions@@Lock Dimensions')}
          </Toggle>
          <Toggle id="bounce" checked={animtextureStore.bounce}
            onChange$={(e, el) => { animtextureStore.bounce = el.checked; }}>
            {t('animtexture.bounce@@Bounce Animation')}
          </Toggle>
          <Toggle id="syncduration" checked={animtextureStore.syncduration}
            onChange$={(e, el) => { animtextureStore.syncduration = el.checked; }}>
            {t('animtexture.syncDuration@@Sync Duration')}
          </Toggle>
        </div>

        {animtextureStore.frames.length > 0 && <>
          <div id="imgs" class="lum-card flex-row flex-wrap max-h-[620px] overflow-auto gap-2 p-2 mt-4">
            {animtextureStore.frames.map((frame, i) => (
              <div key={`frame${i}-${frame.delay}`} class="lum-card lum-bg-lum-input-bg w-24 p-0 gap-0 relative">
                <button class="lum-btn lum-bg-red-700/20 hover:lum-bg-red-700 p-1 absolute top-1 right-1" onClick$={() => {
                  const frames = [...animtextureStore.frames];
                  frames.splice(i, 1);
                  animtextureStore.frames = frames;
                }}>
                  <X size={16}/>
                </button>
                <img width={96} height={96} class={{
                  'rounded-t-md': true,
                  'rounded-b-md': animtextureStore.syncduration,
                }} src={frame.img.src} />
                <label for={`frame-${i}-delay`} class="m-1">
                  ticks
                </label>
                {!animtextureStore.syncduration &&
                  <input id={`frame-${i}-delay`} type="number" value={frame.delay}
                    onInput$={(e, el) => {
                      animtextureStore.frames[i].delay = Number(el.value);
                    }}
                    class="lum-input lum-bg-lum-card-bg mb-1 mx-1 lum-btn-p-1" />
                }
              </div>
            ))}
          </div>
          {animtextureStore.syncduration &&
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
        </>}

        <div id="links" class="flex gap-2 mt-6">
          <a class="lum-btn" id="pngd" target="_blank" download={animtextureStore.textureName + '.png'} href=''>
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
                      : []),
                  ],
                },
              }, null, 2,
            ))}>
            <Download size={20} />
            {t('animtexture.downloadMCMETA@@Download MCMETA')}
          </a>
        </div>
      </div>
      <div class={{
        'flex flex-col items-center max-w-24 transition-all': true,
      }}>
        {!animtextureStore.showChatPreview && <>
          <p class="mb-2">
            {t('animtexture.animationPreview@@Animation Preview')}
          </p>
          <canvas id="anim" class="lum-card w-full p-0" style={{
            imageRendering: 'pixelated',
          }} />
        </>}
        {animtextureStore.frames.length != 1 && <>
          <p class="my-2">
            {t('animtexture.pngPreview@@PNG Preview')}
          </p>
          <div class={{
            'lum-card w-full p-0': true,
            'min-h-100': animtextureStore.frames.length == 0,
          }}>
            <canvas id="c" class="w-full rounded-lum" style={{
              imageRendering: 'pixelated',
            }} />
          </div>
        </>}
      </div>
    </section>
  );
});

export const head = generateHead({
  title: 'Minecraft Animated Textures Creator - Birdflop',
  description: 'Easily merge textures for resource pack animations or convert from GIF. ' + defaultDescription,
  ads: true,
});