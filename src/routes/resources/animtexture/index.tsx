import { component$, isBrowser, useContextProvider, useSignal, useStore, useTask$ } from '@builder.io/qwik';

import { inlineTranslate } from 'qwik-speak';

import { parseGIF, decompressFrames } from 'gifuct-js';
import { Download, GalleryHorizontalEnd, RefreshCw, X } from 'lucide-icons-qwik';
import { NumberInput, Toggle } from '@luminescent/ui-qwik';
import { defaultDescription, generateHead } from '~/root';
import Input, { previewStyleContext } from '~/components/Rgbirdflop/Input';
import { rgbStoreContext } from '~/components/Rgbirdflop/RGBirdflop';
import { rgbDefaults } from '@birdflop/rgbirdflop';

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
    textureName: 'animtexture',
    width: 16,
    height: 16,
    lockdimensions: true,
    bounce: false,
    syncduration: false,
    showChatPreview: false,
    accumulate: false,
    png: '',
    mcmeta: '',
  }, { deep: true });

  const animtextureFrames = useSignal<{
    img: HTMLImageElement,
    delay: number
  }[]>([]);

  const animCanvasRef = useSignal<HTMLCanvasElement>();
  const textureCanvasRef = useSignal<HTMLCanvasElement>();

  useTask$(({ track }) => {
    (Object.keys(animtextureStore) as Array<keyof typeof animtextureStore>).forEach((key) => {
      track(() => animtextureStore[key]);
    });
    track(() => animtextureFrames.value);
    track(() => animCanvasRef.value);
    track(() => textureCanvasRef.value);

    if (animtextureStore.lockdimensions) animtextureStore.height = animtextureStore.width;
    if (!isBrowser) return;

    const canvas = textureCanvasRef.value;
    if (!canvas) return console.error('Canvas for texture preview not found');
    const ctx = canvas.getContext('2d')!;

    canvas.width = animtextureStore.width;
    canvas.height = animtextureStore.height * animtextureFrames.value.length;

    for (let i = 0; i != animtextureFrames.value.length; i++) {
      const img = animtextureFrames.value[i].img;
      ctx.drawImage(img, 0, i * animtextureStore.height, animtextureStore.width, animtextureStore.height);
    }

    animtextureStore.png = canvas.toDataURL();

    const anim = animCanvasRef.value;
    if (!anim) return console.error('Canvas for animation preview not found');
    const animctx = anim.getContext('2d')!;
    anim.width = animtextureStore.width;
    anim.height = animtextureStore.height;
    let i = 0;
    let lastTime = 0;
    let bounce = false;
    const animate = (time: number) => {
      if (animtextureFrames.value.length == 0) return;
      if (time - lastTime > animtextureFrames.value[i].delay / 20 * 1000) {
        lastTime = time;
        if (bounce) i--;
        else i++;
        if (i >= animtextureFrames.value.length) {
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
      animctx.drawImage(animtextureFrames.value[i].img, 0, 0, animtextureStore.width, animtextureStore.height);
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  });

  return (
    <section class="flex flex-col mx-auto max-w-6xl px-6 min-h-svh pt-20">
      <h1 class="flex gap-3 text-2xl! items-center my-2!">
        <GalleryHorizontalEnd size={32} />
        {t('nav.resources.animatedTextures.title@@Animated Textures')}
      </h1>
      <p class="mb-4 border-b border-lum-border/10 pb-4">
        {t('nav.resources.animatedTextures.description@@Easily create textures from GIFs and Discord emojis etc. for use in Minecraft chat with sprites or any resource pack animation.')}
      </p>

      <div class="flex gap-4">
        <div class="flex-1">
          <h3 class="mt-0!">
            Input Image(s)
          </h3>
          <div class="flex flex-col gap-1 mb-5">
            <label for="fileInput">
              {t('animtexture.selectFrames@@Select GIF or image from your device')}
            </label>
            <input id="fileInput" type="file" multiple accept="image/*" class="file:lum-btn hover:file:lum-bg-gray-700 file:mb-1" onChange$={async (e, el) => {
              const files = Array.from(el.files ?? []);
              for (const f of files) {
                const e = await readFileAsDataURL(f);
                if (!e.target?.result) return;

                const frames = animtextureStore.accumulate ? animtextureFrames.value : [];
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

                animtextureFrames.value = frames;
              }
            }} />
            <label for="urlInput" class="mt-2">
              {t('animtexture.pasteUrl@@Paste GIF or image URL')}
            </label>
            <input id="urlInput" type="text" class="lum-input mb-2"
              placeholder="https://cdn.discordapp.com/emojis/904177608537804870.webp?size=128&animated=true"
              onChange$={async (event, el) => {
                let url = el.value;
                if (!url) return;

                // if the url is a discord emoji, you can replace .webp with .gif
                if (url.includes('cdn.discordapp.com/emojis/') && url.includes('.webp')) {
                  url = url.replace('.webp', '.gif').split('?')[0];
                  el.value = url;
                }

                const f = await (await fetch(url)).blob();

                const e = await readFileAsDataURL(f);
                if (!e.target?.result) return;

                const frames = animtextureStore.accumulate ? animtextureFrames.value : [];
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

                animtextureFrames.value = frames;
              }} />
            <Toggle id="accumulate" checked={animtextureStore.accumulate}
              onChange$={(e, el) => { animtextureStore.accumulate = el.checked; }}>
              {t('animtexture.accumulate@@Add to existing frames')}
            </Toggle>
          </div>

          <hr/>

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
                  const maxWidth = Math.max(...animtextureFrames.value.map(frame => frame.img.naturalWidth));
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
                    const maxHeight = Math.max(...animtextureFrames.value.map(frame => frame.img.naturalHeight));
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
            <Toggle id="showchatpreview" checked={animtextureStore.showChatPreview}
              onChange$={(e, el) => { animtextureStore.showChatPreview = el.checked; }}>
              {t('animtexture.showChatPreview@@Show Minecraft chat preview')}
            </Toggle>
          </div>

          { animtextureStore.showChatPreview &&
            <Input readOnly
              noFormatRow
              chatInput={`this is so funny <sprite:item/${animtextureStore.textureName}>`}
              playerName="AnimatedTexture">
              <span class="text-white! items-center gap-2">
                this is so funny
              </span>
              <span class="ml-2 inline-block align-middle">
                <canvas ref={animCanvasRef} class="p-0 w-6 h-6" style={{
                  imageRendering: 'pixelated',
                }} />
              </span>
            </Input>
          }

          <div class="mt-10 flex gap-2">
            {!animtextureStore.showChatPreview && <div class="w-1/4">
              <p class="mb-2">
                {t('animtexture.animationPreview@@Animation Preview')}
              </p>
              <canvas ref={animCanvasRef} class="lum-card w-full p-0" style={{
                imageRendering: 'pixelated',
              }} />
            </div>}
            <div class="flex-1">
              <p class="mb-2">
                {t('animtexture.frames@@Animation Frames')}
              </p>
              <div id="imgs" class="lum-card flex-row flex-wrap min-h-[calc(100%-32px)] max-h-155 overflow-auto gap-2 p-2">
                {animtextureFrames.value.map((frame, i) => (
                  <div key={`frame${i}`} class="lum-card w-24 p-0 gap-0 relative">
                    <button class="lum-btn lum-bg-red-700/20 hover:lum-bg-red-700 p-1 absolute top-1 right-1" onClick$={() => {
                      const frames = [...animtextureFrames.value];
                      frames.splice(i, 1);
                      animtextureFrames.value = frames;
                    }}>
                      <X size={16}/>
                    </button>
                    <img width={96} height={96} class={{
                      'rounded-t-md': true,
                      'rounded-b-md': animtextureStore.syncduration,
                    }} src={frame.img.src} />
                    {!animtextureStore.syncduration && <>
                      <label for={`frame-${i}-delay`} class="m-1">
                        ticks
                      </label>
                      <input id={`frame-${i}-delay`} type="number" value={frame.delay}
                        onInput$={(e, el) => {
                          animtextureFrames.value[i].delay = Number(el.value);
                        }}
                        class="lum-input lum-bg-lum-card-bg mb-1 mx-1 lum-btn-p-1" />
                    </>}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {animtextureStore.syncduration &&
            <NumberInput input min={1} value={animtextureFrames.value[0].delay} id="height"
              onIncrement$={() => {
                animtextureFrames.value[0].delay++;
                animtextureFrames.value.forEach((frame) => {
                  frame.delay = animtextureFrames.value[0].delay;
                });
              }}
              onDecrement$={() => {
                animtextureFrames.value[0].delay--;
                animtextureFrames.value.forEach((frame) => {
                  frame.delay = animtextureFrames.value[0].delay;
                });
              }}
              onInput$={(e, el) => {
                const value = Number(el.value);
                if (isNaN(value)) return;
                animtextureFrames.value.forEach((frame) => {
                  frame.delay = value;
                });
              }}
            >
              {t('animtexture.duration@@Duration')}
            </NumberInput>
          }

          {animtextureStore.png &&
             <div id="links" class="flex gap-2 mt-4">
               <a class="lum-btn" id="pngd" target="_blank" download={animtextureStore.textureName + '.png'}
                 href={animtextureStore.png}>
                 <Download size={20} />
                 {t('animtexture.downloadPNG@@Download PNG')}
               </a>
               <a class="lum-btn" id="mcmeta" target="_blank" download={animtextureStore.textureName + '.png.mcmeta'}
                 href={
                   'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(
                     {
                       animation: {
                         frames: [
                           ...animtextureFrames.value.map((frame, i) => ({
                             index: i,
                             time: frame.delay,
                           })),
                           ...(animtextureStore.bounce ?
                             animtextureFrames.value.map((frame, i) => ({
                               index: animtextureFrames.value.length - i,
                               time: animtextureFrames.value[i].delay,
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
          }
        </div>
        <div class={{
          'flex flex-col max-w-24 transition-all': true,
        }}>
          {animtextureFrames.value.length != 1 && <>
            <p class="mb-2">
              {t('animtexture.texture@@Texture')}
            </p>
            <div class={{
              'lum-card w-full p-0': true,
              'min-h-[calc(100%-32px)]': animtextureFrames.value.length == 0,
            }}>
              <canvas ref={textureCanvasRef} class="w-full rounded-lum" style={{
                imageRendering: 'pixelated',
              }} />
            </div>
          </>}
        </div>
      </div>
    </section>
  );
});

export const head = generateHead({
  title: 'Minecraft Animated Textures Creator - Birdflop',
  description: 'Easily merge textures for resource pack animations or convert from GIF. ' + defaultDescription,
});