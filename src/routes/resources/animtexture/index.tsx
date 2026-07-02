import { component$, isBrowser, useContextProvider, useSignal, useStore, useTask$ } from '@builder.io/qwik';

import { inlineTranslate } from 'qwik-speak';

import { parseGIF, decompressFrames } from 'gifuct-js';
import JSZip from 'jszip';
import { Download, GalleryHorizontalEnd, RefreshCw, X } from 'lucide-icons-qwik';
import { NumberInput, Toggle } from '@luminescent/ui-qwik';
import { defaultDescription, generateHead } from '~/root';
import Input, { previewStyleContext } from '~/components/Rgbirdflop/Input';
import { rgbStoreContext } from '~/components/Rgbirdflop/RGBirdflop';
import { rgbDefaults } from '@birdflop/rgbirdflop';
import { deepTrack } from '~/util/misc';

type AnimtextureFrame = {
  img: HTMLImageElement;
  delay: number;
};

type AnimtextureTexture = {
  textureName: string;
  width: number;
  height: number;
  lockdimensions: boolean;
  bounce: boolean;
  syncduration: boolean;
  showChatPreview: boolean;
  frames: AnimtextureFrame[];
};

type RenderedTexture = {
  png: string;
  mcmeta: string;
};

const RESOURCE_PACK_FORMAT = 88;

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

const createTexture = (index = 1): AnimtextureTexture => ({
  textureName: index === 1 ? 'animtexture' : `animtexture-${index}`,
  width: 16,
  height: 16,
  lockdimensions: true,
  bounce: false,
  syncduration: false,
  showChatPreview: false,
  frames: [],
});

const loadImageFromCanvas = (canvas: HTMLCanvasElement) => new Promise<HTMLImageElement>((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = reject;
  img.src = canvas.toDataURL();
});

const loadImageFromDataURL = (dataURL: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = reject;
  img.src = dataURL;
});

const drawGifFramePatch = (ctx: CanvasRenderingContext2D, frame: { dims: { width: number; height: number; top: number; left: number }; patch: Uint8ClampedArray }) => {
  const patchCanvas = document.createElement('canvas');
  patchCanvas.width = frame.dims.width;
  patchCanvas.height = frame.dims.height;

  const patchCtx = patchCanvas.getContext('2d')!;
  const frameImageData = patchCtx.createImageData(frame.dims.width, frame.dims.height);
  frameImageData.data.set(frame.patch);
  patchCtx.putImageData(frameImageData, 0, 0);

  ctx.drawImage(patchCanvas, frame.dims.left, frame.dims.top);
};

const getGifBackgroundColor = (parsedGif: { gct: [number, number, number][]; lsd: { backgroundColorIndex: number; width: number; height: number } }) => {
  const backgroundColor = parsedGif.gct[parsedGif.lsd.backgroundColorIndex];
  return backgroundColor ? `rgb(${backgroundColor[0]}, ${backgroundColor[1]}, ${backgroundColor[2]})` : null;
};

const loadGifFrames = async (arrayBuffer: ArrayBuffer) => {
  const parsedGif = parseGIF(arrayBuffer);
  const gifFrames = decompressFrames(parsedGif, true);
  const canvas = document.createElement('canvas');
  canvas.width = parsedGif.lsd.width;
  canvas.height = parsedGif.lsd.height;
  const ctx = canvas.getContext('2d')!;
  const backgroundColor = getGifBackgroundColor(parsedGif);

  const resetCanvas = (left: number, top: number, width: number, height: number) => {
    if (backgroundColor) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(left, top, width, height);
    }
    else {
      ctx.clearRect(left, top, width, height);
    }
  };

  resetCanvas(0, 0, canvas.width, canvas.height);

  const frames: { img: HTMLImageElement; delay: number }[] = [];
  let previousFrame: { dims: { width: number; height: number; top: number; left: number }; disposalType: number } | null = null;
  let restoreImageData: ImageData | null = null;

  for (const frame of gifFrames) {
    if (previousFrame) {
      if (previousFrame.disposalType === 2) {
        resetCanvas(previousFrame.dims.left, previousFrame.dims.top, previousFrame.dims.width, previousFrame.dims.height);
      }
      else if (previousFrame.disposalType === 3 && restoreImageData) {
        ctx.putImageData(restoreImageData, 0, 0);
      }
    }

    restoreImageData = frame.disposalType === 3 ? ctx.getImageData(0, 0, canvas.width, canvas.height) : null;
    drawGifFramePatch(ctx, frame);

    const img = await loadImageFromCanvas(canvas);
    frames.push({
      img,
      delay: Math.ceil(frame.delay / 100),
    });

    previousFrame = {
      dims: frame.dims,
      disposalType: frame.disposalType,
    };
  }

  return frames;
};

const normalizeTextureName = (textureName: string) => textureName.trim().replace(/^\/+/, '').replace(/\\/g, '/').replace(/\.png$/i, '') || 'texture';

const getTextureFrameHeight = (texture: AnimtextureTexture) => (texture.lockdimensions ? texture.width : texture.height);

const buildTextureOutputs = (texture: AnimtextureTexture): RenderedTexture => {
  if (texture.frames.length === 0) {
    return { png: '', mcmeta: '' };
  }

  const canvas = document.createElement('canvas');
  const frameHeight = getTextureFrameHeight(texture);
  canvas.width = texture.width;
  canvas.height = frameHeight * texture.frames.length;

  const ctx = canvas.getContext('2d')!;
  for (let i = 0; i != texture.frames.length; i++) {
    const img = texture.frames[i].img;
    ctx.drawImage(img, 0, i * frameHeight, texture.width, frameHeight);
  }

  const mcmeta = {
    animation: {
      frames: [
        ...texture.frames.map((frame, i) => ({
          index: i,
          time: frame.delay,
        })),
        ...(texture.bounce ? texture.frames.map((frame, i) => ({
          index: texture.frames.length - i,
          time: texture.frames[i].delay,
        })) : []),
      ],
    },
  };

  return {
    png: canvas.toDataURL(),
    mcmeta: JSON.stringify(mcmeta, null, 2),
  };
};

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
};

const getUniqueTextureName = (textureNames: Set<string>, textureName: string) => {
  const baseName = normalizeTextureName(textureName);
  let uniqueName = baseName;
  let counter = 1;

  while (textureNames.has(uniqueName)) {
    uniqueName = `${baseName}-${counter}`;
    counter++;
  }

  textureNames.add(uniqueName);
  return uniqueName;
};

const buildResourcePack = async (textures: AnimtextureTexture[]) => {
  const zip = new JSZip();
  zip.file('pack.mcmeta', JSON.stringify({
    pack: {
      pack_format: RESOURCE_PACK_FORMAT,
      description: 'Generated by Birdflop AnimTexture',
    },
  }, null, 2));

  const textureNames = new Set<string>();
  for (const texture of textures) {
    if (texture.frames.length === 0) continue;

    const { png, mcmeta } = buildTextureOutputs(texture);
    if (!png) continue;

    const texturePath = getUniqueTextureName(textureNames, texture.textureName);
    const pngBlob = await (await fetch(png)).blob();
    zip.file(`assets/minecraft/textures/${texturePath}.png`, pngBlob);
    zip.file(`assets/minecraft/textures/${texturePath}.png.mcmeta`, mcmeta);
  }

  return zip.generateAsync({ type: 'blob' });
};

export default component$(() => {
  const t = inlineTranslate();
  useContextProvider(rgbStoreContext, rgbDefaults);

  const previewStyle = useSignal('chat');
  useContextProvider(previewStyleContext, previewStyle);

  const animtextureStore = useStore({
    textures: [createTexture()],
    activeTexture: 0,
    accumulate: false,
  }, { deep: true });

  const activeTextureOutputs = useSignal<RenderedTexture>({
    png: '',
    mcmeta: '',
  });

  const animCanvasRef = useSignal<HTMLCanvasElement>();
  const textureCanvasRef = useSignal<HTMLCanvasElement>();

  const texture = animtextureStore.textures[animtextureStore.activeTexture] ?? animtextureStore.textures[0];

  useTask$(({ track }) => {
    deepTrack(track, animtextureStore);
    track(() => animtextureStore.activeTexture);
    track(() => animtextureStore.textures.length);
    track(() => animCanvasRef.value);
    track(() => textureCanvasRef.value);

    const texture = animtextureStore.textures[animtextureStore.activeTexture] ?? animtextureStore.textures[0];
    if (!texture) return;

    if (texture.lockdimensions) texture.height = texture.width;
    if (!isBrowser) return;

    const canvas = textureCanvasRef.value;
    if (!canvas) return console.error('Canvas for texture preview not found');
    const ctx = canvas.getContext('2d')!;

    const renderedTexture = buildTextureOutputs(texture);
    activeTextureOutputs.value = renderedTexture;

    canvas.width = texture.width;
    canvas.height = getTextureFrameHeight(texture) * texture.frames.length;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (renderedTexture.png) {
      const previewImg = new Image();
      previewImg.onload = () => {
        ctx.drawImage(previewImg, 0, 0);
      };
      previewImg.src = renderedTexture.png;
    }

    const anim = animCanvasRef.value;
    if (!anim) return console.error('Canvas for animation preview not found');
    const animctx = anim.getContext('2d')!;
    anim.width = texture.width;
    anim.height = getTextureFrameHeight(texture);
    let i = 0;
    let lastTime = 0;
    let bounce = false;
    const animate = (time: number) => {
      if (texture.frames.length == 0) return;
      if (time - lastTime > texture.frames[i].delay / 20 * 1000) {
        lastTime = time;
        if (bounce) i--;
        else i++;
        if (i >= texture.frames.length) {
          if (texture.bounce) {
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
      animctx.drawImage(texture.frames[i].img, 0, 0, texture.width, getTextureFrameHeight(texture));
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  });

  return (
    <section class="flex flex-col mx-auto max-w-6xl px-6 min-h-svh pt-20">
      <h1 class="flex gap-3 text-2xl font-extrabold items-center my-2">
        <GalleryHorizontalEnd size={32} />
        {t('nav.resources.animatedTextures.title@@Animated Textures')}
      </h1>
      <p class="mb-4 border-b border-lum-border/10 pb-4 text-lum-text-secondary">
        {t('nav.resources.animatedTextures.description@@Easily create textures from GIFs and Discord emojis etc. for use in Minecraft chat with sprites or any resource pack animation.')}
      </p>

      <div class="flex gap-4">
        <div class="flex-1">
          <div class="mb-4 flex flex-col gap-2">
            <div class="flex items-center justify-between gap-2">
              <h3 class="flex items-center gap-2 font-bold text-2xl">
                Textures
              </h3>
              <div class="flex gap-2">
                <button class="lum-btn p-2" onClick$={() => {
                  const currentTexture = animtextureStore.textures[animtextureStore.activeTexture] ?? animtextureStore.textures[0];
                  const nextIndex = animtextureStore.textures.length + 1;
                  const textureNames = new Set(animtextureStore.textures.map((item) => normalizeTextureName(item.textureName)));
                  const nextTexture = {
                    ...createTexture(nextIndex),
                    width: currentTexture.width,
                    height: currentTexture.height,
                    lockdimensions: currentTexture.lockdimensions,
                    bounce: currentTexture.bounce,
                    syncduration: currentTexture.syncduration,
                    showChatPreview: currentTexture.showChatPreview,
                  };
                  nextTexture.textureName = getUniqueTextureName(textureNames, nextTexture.textureName);
                  animtextureStore.textures = [...animtextureStore.textures, nextTexture];
                  animtextureStore.activeTexture = animtextureStore.textures.length - 1;
                }}>
                  New Texture
                </button>
                <button class="lum-btn p-2" onClick$={() => {
                  const currentTexture = animtextureStore.textures[animtextureStore.activeTexture] ?? animtextureStore.textures[0];
                  const nextIndex = animtextureStore.textures.length + 1;
                  const textureNames = new Set(animtextureStore.textures.map((item) => normalizeTextureName(item.textureName)));
                  const nextTexture: AnimtextureTexture = {
                    ...currentTexture,
                    textureName: getUniqueTextureName(textureNames, createTexture(nextIndex).textureName),
                    frames: currentTexture.frames.map((frame) => ({ ...frame })),
                  };
                  animtextureStore.textures = [...animtextureStore.textures, nextTexture];
                  animtextureStore.activeTexture = animtextureStore.textures.length - 1;
                }}>
                  Duplicate Current
                </button>
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              {animtextureStore.textures.map((item, index) => (
                <div key={`texture-${index}`} class="flex items-center gap-1">
                  <button class={{
                    'lum-btn px-3 py-2 text-left': true,
                    'lum-grad-bg-cyan-700/30': animtextureStore.activeTexture === index,
                  }} onClick$={() => { animtextureStore.activeTexture = index; }}>
                    <span class="block font-semibold">{item.textureName}</span>
                    <span class="block text-xs opacity-70">{item.frames.length} frames</span>
                  </button>
                  <button class="lum-btn p-2" onClick$={() => {
                    if (animtextureStore.textures.length === 1) {
                      animtextureStore.textures = [createTexture()];
                      animtextureStore.activeTexture = 0;
                      return;
                    }

                    const nextTextures = animtextureStore.textures.filter((_, textureIndex) => textureIndex !== index);
                    animtextureStore.textures = nextTextures;
                    animtextureStore.activeTexture = Math.min(animtextureStore.activeTexture, nextTextures.length - 1);
                  }}>
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <h3 class="mb-2 flex items-center gap-2 font-bold text-2xl">
            Input Image(s)
          </h3>
          <div class="flex flex-col gap-1 mb-5">
            <label for="fileInput">
              {t('animtexture.selectFrames@@Select GIF or image from your device')}
            </label>
            <input id="fileInput" type="file" multiple accept="image/*" class="file:lum-btn hover:file:lum-grad-bg-gray-700 file:mb-1" onChange$={async (e, el) => {
              const texture = animtextureStore.textures[animtextureStore.activeTexture] ?? animtextureStore.textures[0];
              const files = Array.from(el.files ?? []);
              for (const f of files) {
                const fileEvent = await readFileAsDataURL(f);
                if (!fileEvent.target?.result) return;

                const frames = animtextureStore.accumulate ? texture.frames : [];
                const file = await base64ToFile(fileEvent.target.result.toString());
                if (file.mime == 'image/gif') {
                  frames.push(...await loadGifFrames(file.buffer));
                }
                else {
                  const img = await loadImageFromDataURL(fileEvent.target.result as string);
                  frames.push({
                    img,
                    delay: 20,
                  });
                }

                texture.frames = frames;
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

                const fileEvent = await readFileAsDataURL(f);
                if (!fileEvent.target?.result) return;

                const texture = animtextureStore.textures[animtextureStore.activeTexture] ?? animtextureStore.textures[0];
                const frames = animtextureStore.accumulate ? texture.frames : [];
                const file = await base64ToFile(fileEvent.target.result.toString());
                if (file.mime == 'image/gif') {
                  frames.push(...await loadGifFrames(file.buffer));
                }
                else {
                  const img = await loadImageFromDataURL(fileEvent.target.result as string);
                  frames.push({
                    img,
                    delay: 20,
                  });
                }

                texture.frames = frames;
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
              'col-span-2': texture.lockdimensions,
            }}>
              <div class="flex-1 flex flex-col gap-1">
                <label for="textureName">{t('animtexture.textureName@@Texture Name')}</label>
                <input id="textureName" class={{ 'lum-input': true }} value={texture.textureName} onInput$={(e, el) => { texture.textureName = el.value; }}/>
              </div>
              <p class="lum-btn p-2">
                .png
              </p>
            </div>
            <NumberInput input min={1} step={16} value={texture.width} id="width" class={{ 'w-full': true }}
              onIncrement$={() => {
                texture.width += 16;
              }}
              onDecrement$={() => {
                texture.width -= 16;
              }}
              onInput$={(e, el) => {
                const value = Number(el.value);
                if (isNaN(value)) return;
                texture.width = value;
              }}
            >
              <span class="flex gap-1 items-center">
                {t('animtexture.width@@Width')}
                <button class="lum-btn p-1" onClick$={() => {
                  const maxWidth = texture.frames.length > 0 ? Math.max(...texture.frames.map((frame) => frame.img.naturalWidth)) : texture.width;
                  texture.width = maxWidth;
                }}>
                  <RefreshCw size={16} />
                </button>
              </span>
            </NumberInput>
            {!texture.lockdimensions &&
              <NumberInput input min={1} step={16} value={texture.height} id="height" class={{ 'w-full': true }}
                onIncrement$={() => {
                  texture.height += 16;
                }}
                onDecrement$={() => {
                  texture.height -= 16;
                }}
                onInput$={(e, el) => {
                  const value = Number(el.value);
                  if (isNaN(value)) return;
                  texture.height = value;
                }}
              >
                <span class="flex gap-1 items-center">
                  {t('animtexture.height@@Height')}
                  <button class="lum-btn p-1" onClick$={() => {
                    const maxHeight = texture.frames.length > 0 ? Math.max(...texture.frames.map((frame) => frame.img.naturalHeight)) : texture.height;
                    texture.height = maxHeight;
                  }}>
                    <RefreshCw size={16} />
                  </button>
                </span>
              </NumberInput>
            }
          </div>
          <div class="flex flex-col gap-2">
            <Toggle id="lockdimensions" checked={texture.lockdimensions}
              onChange$={(e, el) => { texture.lockdimensions = el.checked; }}>
              {t('animtexture.lockDimensions@@Lock Dimensions')}
            </Toggle>
            <Toggle id="bounce" checked={texture.bounce}
              onChange$={(e, el) => { texture.bounce = el.checked; }}>
              {t('animtexture.bounce@@Bounce Animation')}
            </Toggle>
            <Toggle id="syncduration" checked={texture.syncduration}
              onChange$={(e, el) => { texture.syncduration = el.checked; }}>
              {t('animtexture.syncDuration@@Sync Duration')}
            </Toggle>
            <Toggle id="showchatpreview" checked={texture.showChatPreview}
              onChange$={(e, el) => { texture.showChatPreview = el.checked; }}>
              {t('animtexture.showChatPreview@@Show Minecraft chat preview')}
            </Toggle>
          </div>

          { texture.showChatPreview &&
            <Input readOnly
              noFormatRow
              chatInput={`this is so funny <sprite:"birdflop:gifs":"birdflop:gif"/${texture.textureName}>`}
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
            {!texture.showChatPreview && <div class="w-1/4">
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
                {texture.frames.map((frame, i) => (
                  <div key={`frame${i}`} class="lum-card w-24 p-0 gap-0 relative">
                    <button class="lum-btn lum-bg-red-700/20 hover:lum-bg-red-700 p-1 absolute top-1 right-1" onClick$={() => {
                      const frames = [...texture.frames];
                      frames.splice(i, 1);
                      texture.frames = frames;
                    }}>
                      <X size={16}/>
                    </button>
                    <img width={96} height={96} class={{
                      'rounded-t-md': true,
                      'rounded-b-md': texture.syncduration,
                    }} src={frame.img.src} />
                    {!texture.syncduration && <>
                      <label for={`frame-${i}-delay`} class="m-1">
                        ticks
                      </label>
                      <input id={`frame-${i}-delay`} type="number" value={frame.delay}
                        onInput$={(e, el) => {
                          texture.frames[i].delay = Number(el.value);
                        }}
                        class="lum-input lum-grad-bg-lum-card-bg mb-1 mx-1 lum-btn-p-1" />
                    </>}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {texture.syncduration && texture.frames.length > 0 &&
            <NumberInput input min={1} value={texture.frames[0].delay} id="height"
              onIncrement$={() => {
                texture.frames[0].delay++;
                texture.frames.forEach((frame) => {
                  frame.delay = texture.frames[0].delay;
                });
              }}
              onDecrement$={() => {
                texture.frames[0].delay--;
                texture.frames.forEach((frame) => {
                  frame.delay = texture.frames[0].delay;
                });
              }}
              onInput$={(e, el) => {
                const value = Number(el.value);
                if (isNaN(value)) return;
                texture.frames.forEach((frame) => {
                  frame.delay = value;
                });
              }}
            >
              {t('animtexture.duration@@Duration')}
            </NumberInput>
          }

          {activeTextureOutputs.value.png &&
             <div id="links" class="flex gap-2 mt-4 flex-wrap">
               <a class="lum-btn" id="pngd" target="_blank" download={texture.textureName + '.png'}
                 href={activeTextureOutputs.value.png}>
                 <Download size={20} />
                 {t('animtexture.downloadPNG@@Download PNG')}
               </a>
               <a class="lum-btn" id="mcmeta" target="_blank" download={texture.textureName + '.png.mcmeta'}
                 href={'data:text/plain;charset=utf-8,' + encodeURIComponent(activeTextureOutputs.value.mcmeta)}>
                 <Download size={20} />
                 {t('animtexture.downloadMCMETA@@Download MCMETA')}
               </a>
               <button class="lum-btn" onClick$={async () => {
                 if (animtextureStore.textures.every((item) => item.frames.length === 0)) return;

                 const blob = await buildResourcePack(animtextureStore.textures);
                 downloadBlob(blob, `${normalizeTextureName(texture.textureName).replace(/\//g, '-') || 'animtexture'}-resource-pack.zip`);
               }}>
                 <Download size={20} />
                 Download Resource Pack ZIP
               </button>
             </div>
          }
        </div>
        <div class={{
          'flex flex-col max-w-24 transition-all': true,
        }}>
          {texture.frames.length != 1 && <>
            <p class="mb-2">
              {t('animtexture.texture@@Texture')}
            </p>
            <div class={{
              'lum-card w-full p-0': true,
              'min-h-[calc(100%-32px)]': texture.frames.length == 0,
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