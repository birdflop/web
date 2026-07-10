import {
  component$,
  isBrowser,
  useContextProvider,
  useSignal,
  useStore,
  useTask$,
} from '@builder.io/qwik';

import { inlineTranslate } from 'qwik-speak';

import {
  Download,
  File,
  GalleryHorizontalEnd,
  Link,
  Proportions,
  RefreshCw,
  Settings,
  X,
} from 'lucide-icons-qwik';
import { NumberInput, SelectMenu, Toggle } from '@luminescent/ui-qwik';
import { defaultDescription, generateHead } from '~/root';
import Input, { previewStyleContext } from '~/components/rgbirdflop/Input';
import { rgbStoreContext } from '~/components/rgbirdflop/RGBirdflop';
import { rgbDefaults } from '@birdflop/rgbirdflop';
import { deepTrack } from '~/util/track';
import { Tabs } from '~/components/Elements/Tabs';
import {
  createTexture,
  buildTextureOutputs,
  getTextureFrameHeight,
  getUniqueTextureName,
  downloadBlob,
  buildResourcePack,
  RenderedTexture,
  normalizeTextureName,
  readFileAsDataURL,
  base64ToFile,
  loadGifFrames,
  loadImageFromDataURL,
} from '~/util/animtexture';

export default component$(() => {
  const t = inlineTranslate();
  useContextProvider(rgbStoreContext, rgbDefaults);

  const previewStyle = useSignal('chat');
  useContextProvider(previewStyleContext, previewStyle);

  const animtextureStore = useStore(
    {
      textures: [createTexture()],
      activeTexture: 0,
      accumulate: false,
    },
    { deep: true },
  );

  const activeTextureOutputs = useSignal<RenderedTexture>({
    png: '',
    mcmeta: '',
  });

  const animCanvasRef = useSignal<HTMLCanvasElement>();
  const textureCanvasRef = useSignal<HTMLCanvasElement>();

  const texture =
    animtextureStore.textures[animtextureStore.activeTexture] ??
    animtextureStore.textures[0];

  useTask$(({ track }) => {
    deepTrack(track, animtextureStore);
    track(() => animtextureStore.activeTexture);
    track(() => animtextureStore.textures.length);
    track(() => animCanvasRef.value);
    track(() => textureCanvasRef.value);

    const texture =
      animtextureStore.textures[animtextureStore.activeTexture] ??
      animtextureStore.textures[0];
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
      if (time - lastTime > (texture.frames[i].delay / 20) * 1000) {
        lastTime = time;
        if (bounce) i--;
        else i++;
        if (i >= texture.frames.length) {
          if (texture.bounce) {
            bounce = !bounce;
            i--;
          } else {
            i = 0;
          }
        }
        if (i < 0) {
          bounce = !bounce;
          i++;
        }
      }
      animctx.clearRect(0, 0, anim.width, anim.height);
      animctx.drawImage(
        texture.frames[i].img,
        0,
        0,
        texture.width,
        getTextureFrameHeight(texture),
      );
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  });

  return (
    <section class="mx-auto flex min-h-svh max-w-6xl flex-col px-6 pt-20">
      <h1 class="my-2 flex items-center gap-3 text-2xl font-extrabold">
        <GalleryHorizontalEnd size={32} />
        {t('nav.resources.animatedTextures.title@@Animated Textures')}
      </h1>
      <p class="border-lum-border/10 text-lum-text-secondary mb-4 border-b pb-4">
        {t(
          'nav.resources.animatedTextures.description@@Easily create textures from GIFs and Discord emojis etc. for use in Minecraft chat with sprites or any resource pack animation.',
        )}
      </p>

      <div class="flex gap-4">
        <div class="flex-1">
          <div class="mb-4 flex flex-col gap-2">
            <div class="flex items-center gap-1 py-2 font-semibold">
              <h2 class="flex flex-1 items-center gap-2 text-2xl">
                <GalleryHorizontalEnd size={30} />
                {t('animtexture.textures@@Textures')}
              </h2>
              <button
                class="lum-btn"
                onClick$={async () => {
                  if (animtextureStore.textures.every((item) => item.frames.length === 0)) return;

                  const blob = await buildResourcePack(
                    animtextureStore.textures,
                  );
                  downloadBlob(
                    blob,
                    'animtexture-resource-pack.zip',
                  );
                }}
              >
                <Download size={20} />
                Download Resource Pack ZIP
              </button>
            </div>
            <Tabs values={animtextureStore.textures.map((t, i) => ({ name: t.name, value: i.toString() }))}
              value={{
                name: animtextureStore.textures[animtextureStore.activeTexture].name,
                value: animtextureStore.textures.indexOf(animtextureStore.textures[animtextureStore.activeTexture]).toString(),
              }}
              onClick$={(value) => {
                animtextureStore.activeTexture = parseInt(value.value);
              }}
              onPlus$={() => {
                const currentTexture =
                  animtextureStore.textures[animtextureStore.activeTexture] ?? animtextureStore.textures[0];
                const nextIndex = animtextureStore.textures.length + 1;
                const names = new Set(
                  animtextureStore.textures.map((item) =>
                    normalizeTextureName(item.name),
                  ),
                );
                const nextTexture = {
                  ...createTexture(nextIndex),
                  width: currentTexture.width,
                  height: currentTexture.height,
                  lockdimensions: currentTexture.lockdimensions,
                  bounce: currentTexture.bounce,
                  syncduration: currentTexture.syncduration,
                  showChatPreview: currentTexture.showChatPreview,
                };
                nextTexture.name = getUniqueTextureName(
                  names,
                  nextTexture.name,
                );
                animtextureStore.textures = [
                  ...animtextureStore.textures,
                  nextTexture,
                ];
                animtextureStore.activeTexture = animtextureStore.textures.length - 1;
              }}
              onDelete$={(value) => {
                if (animtextureStore.textures.length === 1) {
                  animtextureStore.textures = [createTexture()];
                  animtextureStore.activeTexture = 0;
                  return;
                }

                const nextTextures = animtextureStore.textures.filter(
                  (_, textureIndex) => textureIndex != parseInt(value.value),
                );
                animtextureStore.textures = nextTextures;
                animtextureStore.activeTexture = Math.min(
                  animtextureStore.activeTexture,
                  nextTextures.length - 1,
                );
              }}
            />
            <div
              class={{
                'flex items-center gap-1': true,
                'col-span-2': texture.lockdimensions,
              }}
            >
              <SelectMenu
                id="namespace"
                class={{ 'w-full': true }}
                customDropdown
                values={[
                  { name: 'minecraft', value: 'minecraft' },
                  { name: 'birdflop', value: 'birdflop' },
                ]}
                onChange$={(e, el) => {
                  texture.namespace = el.value;
                }}
              >
                <span q:slot="dropdown">
                  {texture.namespace}
                </span>
                {t('animtexture.namespace@@Namespace')}
                <input q:slot="extra-buttons"
                  id="namespace"
                  class={{ 'lum-input rounded-lum-1 lum-bg-transparent lum-btn-p-2': true }}
                  placeholder="Custom"
                  onInput$={(e, el) => {
                    texture.namespace = el.value;
                  }}
                />
              </SelectMenu>
              <p class="text-lum-text-secondary mt-7 mx-1">
                :
              </p>
              <SelectMenu
                id="path"
                class={{ 'w-full': true }}
                customDropdown
                values={[
                  { name: 'block', value: 'block' },
                  { name: 'item', value: 'item' },
                ]}
                onChange$={(e, el) => {
                  texture.path = el.value;
                }}
              >
                <span q:slot="dropdown">
                  {texture.path}
                </span>
                {t('animtexture.path@@Path')}
                <input q:slot="extra-buttons"
                  id="path"
                  class={{ 'lum-input rounded-lum-1 lum-bg-transparent lum-btn-p-2': true }}
                  placeholder={t('animtexture.custom@@Custom')}
                  onInput$={(e, el) => {
                    texture.namespace = el.value;
                  }}
                />
              </SelectMenu>
              <p class="text-lum-text-secondary mt-7 mx-1">
                /
              </p>
              <div class="flex flex-1 flex-col gap-1">
                <label for="name">
                  {t('animtexture.name@@Texture Name')}
                </label>
                <input
                  id="name"
                  class={{ 'lum-input': true }}
                  value={texture.name}
                  onInput$={(e, el) => {
                    texture.name = el.value;
                  }}
                />
              </div>
              <p class="text-lum-text-secondary mt-7 mx-1">
                .png
              </p>
            </div>
          </div>
          <div class="mb-5 flex gap-6">
            <div class="lum-card flex-1">
              <label for="fileInput" class="font-semibold flex items-center gap-2">
                <File size={20} />
                {t(
                  'animtexture.selectFrames@@Select GIF or image from your device',
                )}
              </label>
              <input
                id="fileInput"
                type="file"
                multiple
                accept="image/*"
                class="file:lum-btn hover:file:lum-grad-bg-gray-700 file:mb-1"
                onChange$={async (e, el) => {
                  const texture =
                    animtextureStore.textures[animtextureStore.activeTexture] ??
                    animtextureStore.textures[0];
                  const files = Array.from(el.files ?? []);
                  for (const f of files) {
                    const fileEvent = await readFileAsDataURL(f);
                    if (!fileEvent.target?.result) return;

                    const frames = animtextureStore.accumulate
                      ? texture.frames
                      : [];
                    const file = await base64ToFile(
                      fileEvent.target.result.toString(),
                    );
                    if (file.mime == 'image/gif') {
                      frames.push(...(await loadGifFrames(file.buffer)));
                    } else {
                      const img = await loadImageFromDataURL(
                        fileEvent.target.result as string,
                      );
                      frames.push({
                        img,
                        delay: 20,
                      });
                    }

                    texture.frames = frames;
                  }
                }}
              />
            </div>
            <p class="my-auto text-lum-text-secondary">
              OR
            </p>
            <div class="lum-card flex-1">
              <label for="urlInput" class="font-semibold flex items-center gap-2">
                <Link size={20} />
                {t('animtexture.pasteUrl@@Paste GIF or image URL')}
              </label>
              <input
                id="urlInput"
                type="text"
                class="lum-input mb-2"
                placeholder="https://cdn.discordapp.com/emojis/904177608537804870.webp?size=128&animated=true"
                onChange$={async (event, el) => {
                  let url = el.value;
                  if (!url) return;

                  // if the url is a discord emoji, you can replace .webp with .gif
                  if (
                    url.includes('cdn.discordapp.com/emojis/') &&
                    url.includes('.webp')
                  ) {
                    url = url.replace('.webp', '.gif').split('?')[0];
                    el.value = url;
                  }

                  const f = await (await fetch(url)).blob();

                  const fileEvent = await readFileAsDataURL(f);
                  if (!fileEvent.target?.result) return;

                  const texture =
                    animtextureStore.textures[animtextureStore.activeTexture] ??
                    animtextureStore.textures[0];
                  const frames = animtextureStore.accumulate
                    ? texture.frames
                    : [];
                  const file = await base64ToFile(
                    fileEvent.target.result.toString(),
                  );
                  if (file.mime == 'image/gif') {
                    frames.push(...(await loadGifFrames(file.buffer)));
                  } else {
                    const img = await loadImageFromDataURL(
                      fileEvent.target.result as string,
                    );
                    frames.push({
                      img,
                      delay: 20,
                    });
                  }

                  texture.frames = frames;
                }}
              />
            </div>
          </div>

          <hr />

          <div class="flex *:flex-1 gap-2">
            <div class="lum-card">
              <div class="font-semibold flex items-center gap-2">
                <Proportions size={20} />
                {t('animtexture.dimensions@@Dimensions')}
              </div>
              <NumberInput
                input
                min={1}
                step={16}
                value={texture.width}
                id="width"
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
                <span class="flex items-center gap-1">
                  {t('animtexture.width@@Width')}
                  <button
                    class="lum-btn lum-btn-p-1"
                    onClick$={() => {
                      const maxWidth =
                        texture.frames.length > 0
                          ? Math.max(
                            ...texture.frames.map(
                              (frame) => frame.img.naturalWidth,
                            ),
                          )
                          : texture.width;
                      texture.width = maxWidth;
                    }}
                  >
                    <RefreshCw size={16} />
                    {t('animtexture.getWidth@@Get width from frames')}
                  </button>
                </span>
              </NumberInput>
              <div class={{
                'opacity-50': texture.lockdimensions,
              }}>
                <NumberInput
                  input
                  min={1}
                  step={16}
                  value={texture.height}
                  id="height"
                  onIncrement$={() => {
                    texture.height += 16;
                    if (texture.lockdimensions) texture.width = texture.height;
                  }}
                  onDecrement$={() => {
                    texture.height -= 16;
                    if (texture.lockdimensions) texture.width = texture.height;
                  }}
                  onInput$={(e, el) => {
                    const value = Number(el.value);
                    if (isNaN(value)) return;
                    texture.height = value;
                    if (texture.lockdimensions) texture.width = texture.height;
                  }}
                >
                  <span class="flex items-center gap-1">
                    {t('animtexture.height@@Height')}
                    <button
                      class="lum-btn lum-btn-p-1"
                      onClick$={() => {
                        const maxHeight =
                          texture.frames.length > 0
                            ? Math.max(
                              ...texture.frames.map(
                                (frame) => frame.img.naturalHeight,
                              ),
                            )
                            : texture.height;
                        texture.height = maxHeight;
                      }}
                    >
                      <RefreshCw size={16} />
                      {t('animtexture.getHeight@@Get height from frames')}
                    </button>
                  </span>
                </NumberInput>
              </div>
              <Toggle
                id="lockdimensions"
                checked={texture.lockdimensions}
                onChange$={(e, el) => {
                  texture.lockdimensions = el.checked;
                }}
              >
                {t('animtexture.lockDimensions@@Lock Dimensions')}
              </Toggle>
            </div>
            <div class="lum-card">
              <div class="font-semibold flex items-center gap-2">
                <Settings size={20} />
                {t('animtexture.options@@Options')}
              </div>
              <Toggle
                id="accumulate"
                checked={animtextureStore.accumulate}
                onChange$={(e, el) => {
                  animtextureStore.accumulate = el.checked;
                }}
              >
                {t('animtexture.accumulate@@Accumulate frames')}
              </Toggle>
              <Toggle
                id="bounce"
                checked={texture.bounce}
                onChange$={(e, el) => {
                  texture.bounce = el.checked;
                }}
              >
                {t('animtexture.bounce@@Bounce Animation')}
              </Toggle>
              <Toggle
                id="syncduration"
                checked={texture.syncduration}
                onChange$={(e, el) => {
                  texture.syncduration = el.checked;
                }}
              >
                {t('animtexture.syncDuration@@Sync Duration')}
              </Toggle>
              <Toggle
                id="showchatpreview"
                checked={texture.showChatPreview}
                onChange$={(e, el) => {
                  texture.showChatPreview = el.checked;
                }}
              >
                {t('animtexture.showChatPreview@@Show Minecraft chat preview')}
              </Toggle>
              <div id="links" class="mt-4 flex flex-wrap gap-2">
                <a
                  class="lum-btn"
                  id="pngd"
                  target="_blank"
                  download={texture.name + '.png'}
                  href={activeTextureOutputs.value.png}
                >
                  <Download size={20} />
                  {t('animtexture.downloadPNG@@Download PNG')}
                </a>
                <a
                  class="lum-btn"
                  id="mcmeta"
                  target="_blank"
                  download={texture.name + '.png.mcmeta'}
                  href={
                    'data:text/plain;charset=utf-8,' +
                    encodeURIComponent(activeTextureOutputs.value.mcmeta)
                  }
                >
                  <Download size={20} />
                  {t('animtexture.downloadMCMETA@@Download MCMETA')}
                </a>
              </div>
            </div>
          </div>

          {activeTextureOutputs.value.png && <>
            <div class="mt-10 flex gap-2">
              {!texture.showChatPreview && (
                <div class="w-1/4">
                  <p class="mb-2">
                    {t('animtexture.animationPreview@@Animation Preview')}
                  </p>
                  <canvas
                    ref={animCanvasRef}
                    class="lum-card w-full p-0"
                    style={{
                      imageRendering: 'pixelated',
                    }}
                  />
                </div>
              )}
              <div class="flex-1">
                <p class="mb-2">{t('animtexture.frames@@Animation Frames')}</p>
                <div
                  id="imgs"
                  class="flex max-h-155 min-h-[calc(100%-32px)] flex-wrap gap-2 overflow-auto p-2"
                >
                  {texture.frames.map((frame, i) => (
                    <div
                      key={`frame${i}`}
                      class="lum-card relative w-24 gap-0 p-0"
                    >
                      <img
                        width={96}
                        height={96}
                        class={{
                          'rounded-t-md': true,
                          'rounded-b-md': texture.syncduration,
                        }}
                        src={frame.img.src}
                      />
                      {!texture.syncduration && (
                        <>
                          <label for={`frame-${i}-delay`} class="m-2 flex">
                            <span class="flex-1">
                              ticks
                            </span>
                            <button
                              class="lum-btn lum-bg-red-700/20 hover:lum-bg-red-700 p-1"
                              onClick$={() => {
                                const frames = [...texture.frames];
                                frames.splice(i, 1);
                                texture.frames = frames;
                              }}
                            >
                              <X size={16} />
                            </button>
                          </label>
                          <input
                            id={`frame-${i}-delay`}
                            type="number"
                            value={frame.delay}
                            onInput$={(e, el) => {
                              texture.frames[i].delay = Number(el.value);
                            }}
                            class="lum-input lum-grad-bg-lum-card-bg lum-btn-p-1 mx-1 mb-1"
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>}

          {texture.showChatPreview && (
            <Input
              readOnly
              noFormatRow
              chatInput={`this is so funny <sprite:"birdflop:gifs":"birdflop:gif"/${texture.name}>`}
              playerName="AnimatedTexture"
            >
              <span class="items-center gap-2 text-white!">
                this is so funny
              </span>
              <span class="ml-2 inline-block align-middle">
                <canvas
                  ref={animCanvasRef}
                  class="h-6 w-6 p-0"
                  style={{
                    imageRendering: 'pixelated',
                  }}
                />
              </span>
            </Input>
          )}

          {texture.syncduration && texture.frames.length > 0 && (
            <NumberInput
              input
              min={1}
              value={texture.frames[0].delay}
              id="height"
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
          )}
        </div>
        <div
          class={{
            'lum-card p-0 w-24 max-h-[70svh] overflow-y-scroll': true,
          }}
        >
          <canvas
            ref={textureCanvasRef}
            class="rounded-lum w-full"
            style={{
              imageRendering: 'pixelated',
            }}
          />
        </div>
      </div>
    </section >
  );
});

export const head = generateHead({
  title: 'Minecraft Animated Textures Creator - Birdflop',
  description:
    'Easily merge textures for resource pack animations or convert from GIF. ' +
    defaultDescription,
});
