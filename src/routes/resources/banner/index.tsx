/* eslint-disable qwik/jsx-img */
import { $, component$, noSerialize, useContext, useSignal, useStore, useVisibleTask$, type Signal } from '@builder.io/qwik';
import type { NoSerialize } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

import { inlineTranslate } from 'qwik-speak';

import { ChevronLeft, ChevronRight, Copy, Eye, Plus, Settings, Terminal, Trash } from 'lucide-icons-qwik';
import Accordion from '~/components/Accordion';

import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { NotificationContext, OpenSectionsContext } from '~/routes/layout';
import { colors, patterns } from '~/util/banner';
import { swapItems } from '~/util/RGBUtils';

const createImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = reject;
  img.src = src;
});

export default component$(() => {
  const t = inlineTranslate();
  const t$ = $((string: string) => inlineTranslate()(string));
  const preview = useSignal<HTMLCanvasElement>() as Signal<HTMLCanvasElement>;
  const textureCanvas = useSignal<HTMLCanvasElement>() as Signal<HTMLCanvasElement>;

  const openPopup = useSignal(-1);
  const openSections = useContext(OpenSectionsContext);
  const notifications = useContext(NotificationContext);
  const bannerTexture = useSignal<NoSerialize<THREE.CanvasTexture>>();

  const bannerStore: {
    color: keyof typeof colors;
    patterns: {
      color: keyof typeof colors;
      pattern: typeof patterns[number];
    }[];
  } = useStore({
    color: 'blue',
    patterns: [],
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.TextureLoader().load('');

    // get width of element
    const width = preview.value.clientWidth;
    const height = width * 1.2;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.x = 4;
    camera.position.y = 1;
    camera.position.z = -7;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: preview.value,
      antialias: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.render(scene, camera);

    // Camera Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set( 0, 0, -5 );
    controls.update();

    // Lights
    const pointLight = new THREE.PointLight(0xffffff, 50);
    pointLight.position.set(2, 5, -2);
    pointLight.castShadow = true;
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(pointLight, ambientLight);

    // OBJ Loader for banner obj
    const loader = new OBJLoader();
    const stand = await loader.loadAsync('/banner/banner_stand.obj');
    stand.position.y = -2;
    stand.position.z = -5;
    const mainObj = await loader.loadAsync('/banner/banner_main.obj');
    const main = new THREE.Group();
    main.add(mainObj);
    mainObj.position.x = -0.1;
    mainObj.position.y = -3.9;
    main.position.x = 0.09;
    main.position.y = 1.9;
    main.position.z = -5;
    const objects = { stand, main };

    // Texture Loader for banner obj
    bannerTexture.value = noSerialize(new THREE.CanvasTexture(textureCanvas.value));
    if (!bannerTexture.value) return;
    bannerTexture.value.colorSpace = THREE.SRGBColorSpace;
    bannerTexture.value.minFilter = THREE.NearestFilter;
    bannerTexture.value.magFilter = THREE.NearestFilter;

    const baseTexture = new THREE.TextureLoader().load('/banner/banner_base.png');
    baseTexture.colorSpace = THREE.SRGBColorSpace;
    baseTexture.minFilter = THREE.NearestFilter;
    baseTexture.magFilter = THREE.NearestFilter;

    // Add objects to scene
    Object.entries(objects).forEach(([name, object]) => {
      object.traverse((child: any) => {
        if (child.isMesh) {
          if (name === 'stand') child.material.map = baseTexture;
          else child.material.map = bannerTexture.value;
        }
      });
      scene.add(object);
    });

    // Animation Loop
    const animate = () => {
      // sway forward and backward on z for main
      objects.main.rotation.z = Math.sin(Date.now() * 0.001) * 0.05;
      main.rotation.z = 0.05 + objects.main.rotation.z;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async ({ track }) => {
    track(() => bannerStore.color);
    track(() => bannerStore.patterns);

    for (let i = 0; i < bannerStore.patterns.length; i++) {
      const pattern = bannerStore.patterns[i];
      const canvas = document.getElementById(`canvas-preview-${i}`) as HTMLCanvasElement;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const baseImg = await createImage(`/banner/patterns/previews/${pattern.pattern}.png`);
      canvas.width = baseImg.width;
      canvas.height = baseImg.height;
      ctx.drawImage(baseImg, 0, 0);
      ctx.fillStyle = `#${colors[pattern.color].toString(16).padStart(6, '0')}`;
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(baseImg, 0, 0);

      const texture = document.getElementById(`canvas-texture-${i}`) as HTMLCanvasElement;
      const ctxTexture = texture.getContext('2d');
      if (!ctxTexture) return;

      const baseImgTexture = await createImage(`/banner/patterns/textures/${pattern.pattern}.png`);
      texture.width = baseImgTexture.width;
      texture.height = baseImgTexture.height;
      ctxTexture.drawImage(baseImgTexture, 0, 0);
      ctxTexture.fillStyle = `#${colors[pattern.color].toString(16).padStart(6, '0')}`;
      ctxTexture.globalCompositeOperation = 'multiply';
      ctxTexture.fillRect(0, 0, texture.width, texture.height);
      ctxTexture.globalCompositeOperation = 'destination-in';
      ctxTexture.drawImage(baseImgTexture, 0, 0);
    }

    const canvas = textureCanvas.value;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const baseImg = await createImage('/banner/patterns/textures/base.png');
    canvas.width = baseImg.width;
    canvas.height = baseImg.height;
    ctx.drawImage(baseImg, 0, 0);

    ctx.fillStyle = `#${colors[bannerStore.color].toString(16).padStart(6, '0')}`;
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(baseImg, 0, 0);
    ctx.globalCompositeOperation = 'source-over';

    for (let i = 0; i < bannerStore.patterns.length; i++) {
      const patternImg = document.getElementById(`canvas-texture-${i}`) as HTMLCanvasElement;
      ctx.drawImage(patternImg, 0, 0);
    }
    if (bannerTexture.value) bannerTexture.value.needsUpdate = true;
  });

  return (
    <section class="flex mx-auto max-w-6xl px-6 justify-center min-h-svh pt-[72px]">
      <div class="my-5 min-h-[60px] w-full">
        <h1 class="font-bold text-gray-50 text-2xl md:text-3xl xl:text-4xl">
          {t('nav.resources.banner.title@@Banner Generator')}
        </h1>
        <h2 class="text-gray-50 mt-1 mb-5">
          {t('nav.resources.banner.description@@Easily generate banner designs for Minecraft.')}
        </h2>

        <div class="grid sm:grid-cols-2 gap-2">
          <div class="flex flex-col gap-2" id="inputcolumn">
            <Accordion sectionName="options" alwaysOpen>
              <Settings size={26} />
              {t('banner.options.title@@Options')}
            </Accordion>
            <div class={{
              'flex flex-col gap-2 transition-all duration-200 sm:opacity-100 sm:pointer-events-auto sm:max-h-full': true,
              'max-h-0 opacity-0 pointer-events-none': openSections.indexOf('options') == -1,
              'max-h-auto opacity-100 pointer-events-auto': openSections.indexOf('options') != -1,
            }}>
              <p class="flex md:text-lg xl:text-xl font-semibold text-gray-50 gap-3 items-center mb-1">
                {t('banner.options.baseColor.title@@Base Color')}
                <span class="text-gray-400 text-sm font-normal">
                  {t('banner.options.baseColor.description@@This is the base color of the banner to start with.')}
                </span>
              </p>
              <div class="flex flex-wrap gap-1">
                {Object.entries(colors).map(([colorName, color]) => {
                  return (
                    <button key={colorName} class={{
                      'lum-btn lum-pad-equal-md hover:brightness-150': true,
                    }} style={{
                      background: `#${color.toString(16).padStart(6, '0')}`,
                    }} onClick$={() => {
                      bannerStore.color = colorName as keyof typeof colors;
                    }}>
                      <img class="w-10" src={`/banner/dyes/${colorName}_dye.png`} alt={colorName} style={{
                        imageRendering: 'pixelated',
                      }} />
                    </button>
                  );
                })}
              </div>
              <p class="flex md:text-lg xl:text-xl font-semibold text-gray-50 gap-3 items-center mt-4">
                {t('banner.options.patterns@@Patterns')}
                <button class="lum-btn lum-pad-equal-sm lum-bg-green-700 hover:lum-bg-green-600" onClick$={() => {
                  const color = Object.keys(colors)[Math.floor(Math.random() * Object.keys(colors).length)] as keyof typeof colors;
                  const pattern = patterns[Math.floor(Math.random() * patterns.length)];
                  bannerStore.patterns = [
                    ...bannerStore.patterns,
                    { color, pattern },
                  ];
                }}>
                  <Plus size={20} />
                </button>
              </p>

              <div class="flex flex-wrap gap-2 pt-2">
                {bannerStore.patterns.map((pattern, i) =>
                  <div key={`${i}/${bannerStore.patterns.length}`} class="flex gap-1 relative" id={`pattern-${i + 1}`}>
                    <div class="flex flex-col rounded-md">
                      <button class="lum-btn lum-pad-equal-xs border-b-transparent rounded-b-none" onClick$={() => bannerStore.patterns = swapItems(bannerStore.patterns, i, i - 1)}>
                        <ChevronLeft size={20} />
                      </button>
                      <button class="lum-btn lum-pad-equal-xs border-y-transparent rounded-none" onClick$={() => bannerStore.patterns = swapItems(bannerStore.patterns, i, i + 1)}>
                        <ChevronRight size={20} />
                      </button>
                      <button class="lum-btn lum-pad-equal-xs border-y-transparent rounded-none" onClick$={() => {
                        const newPatterns = bannerStore.patterns.slice(0);
                        newPatterns.push(pattern);
                        bannerStore.patterns = newPatterns;
                      }}>
                        <Copy size={20} />
                      </button>
                      <button class="lum-btn lum-pad-equal-xs lum-bg-red-700 hover:lum-bg-red-600 border-t-transparent rounded-t-none" disabled={bannerStore.patterns.length <= 0} onClick$={() => {
                        const newPatterns = bannerStore.patterns.slice(0);
                        newPatterns.splice(i, 1);
                        bannerStore.patterns = newPatterns;
                      }}>
                        <Trash size={20} />
                      </button>
                    </div>
                    <button class="lum-btn p-0 w-17.5 lum-bg-gray-900"
                      onMouseUp$={() => {
                        console.log(openPopup.value);
                        if (openPopup.value == i) return openPopup.value = -1;
                        else openPopup.value = i;
                        const abortController = new AbortController();
                        document.addEventListener('click', (e) => {
                          if (e.target instanceof HTMLElement && !e.target.closest(`#pattern-${i + 1}`) && !e.target.closest(`#pattern-${i + 1}-popup`)) {
                            openPopup.value = -1;
                            abortController.abort();
                          }
                        }, { signal: abortController.signal });
                      }}
                    >
                      <canvas id={`canvas-preview-${i}`} style={{
                        imageRendering: 'pixelated',
                      }} class={{
                        'w-full rounded-md': true,
                      }}/>
                      <canvas id={`canvas-texture-${i}`} style={{
                        imageRendering: 'pixelated',
                      }} class={{
                        'w-full rounded-md hidden': true,
                      }}/>
                    </button>
                    <div id={`pattern-${i + 1}-popup`} stoppropagation:mousedown class={{
                      'flex flex-col gap-2 motion-safe:transition-all absolute top-full z-[1000] mt-2 left-0': true,
                      'opacity-0 scale-95 pointer-events-none': openPopup.value != i,
                    }}>
                      <div class="lum-card w-[23rem] lum-pad-equal-lg">
                        <div class="flex flex-wrap gap-1">
                          {Object.entries(colors).map(([colorName, color]) => {
                            return (
                              <button key={colorName} class={{
                                'lum-btn p-1 hover:brightness-150': true,
                              }} style={{
                                background: `#${color.toString(16).padStart(6, '0')}`,
                              }} onClick$={() => {
                                const newPatterns = bannerStore.patterns.slice(0);
                                newPatterns[i].color = colorName as keyof typeof colors;
                                bannerStore.patterns = newPatterns;
                              }}>
                                <img class="w-7" src={`/banner/dyes/${colorName}_dye.png`} alt={colorName} style={{
                                  imageRendering: 'pixelated',
                                }} />
                              </button>
                            );
                          })}
                        </div>
                        <div class="flex flex-wrap gap-1">
                          {patterns.map((pattern) => {
                            return (
                              <button key={pattern} class={{
                                'lum-btn p-0 hover:brightness-150': true,
                              }} onClick$={() => {
                                const newPatterns = bannerStore.patterns.slice(0);
                                newPatterns[i].pattern = pattern;
                                bannerStore.patterns = newPatterns;
                              }}>
                                <img class="w-9 rounded-md" src={`/banner/patterns/previews/${pattern}.png`} alt={pattern} style={{
                                  imageRendering: 'pixelated',
                                }} />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>,
                )}
              </div>
            </div>
            <Accordion sectionName="command">
              <Terminal size={26} />
              {t('banner.command.title@@Command')}
            </Accordion>
            <div class={{
              'flex flex-col gap-2 transition-all duration-200': true,
              'max-h-0 opacity-0 pointer-events-none': openSections.indexOf('command') == -1,
              'max-h-[250px] opacity-100 pointer-events-auto': openSections.indexOf('command') != -1,
            }} id="command">
              <textarea id="commandOutput" readOnly
                class={{
                  'lum-input h-32 w-full font-mc whitespace-pre-wrap': true,
                }}
                value={`/give @p minecraft:${bannerStore.color}_banner[banner_patterns=[${bannerStore.patterns.map((pattern) => `{pattern:${pattern.pattern},color:${pattern.color}}`).join(',')}]]`}
                onClick$={async (e, el) => {
                  const id = Math.random().toString(36).substring(2, 15);
                  const notification = {
                    id,
                    title: await t$('banner.copied@@Copied to clipboard!'),
                    description: await t$('banner.command.copied@@The command has been copied to your clipboard successfully.'),
                    bgColor: 'lum-bg-green-900/50',
                  };
                  navigator.clipboard.writeText(el.value).catch(async (err) => {
                    notification.title = await t$('banner.copyFailed@@Failed to copy to clipboard!');
                    notification.description = err;
                    notification.bgColor = 'lum-bg-red-900/50';
                  });
                  notifications.push(notification);
                  setTimeout(() => {
                    notifications.splice(notifications.findIndex((n) => n?.id === id), 1);
                  }, 2000);
                }}
              />
            </div>
          </div>
          <div class="flex flex-col gap-2 sm:border-l sm:border-l-gray-800 sm:pl-2" id="outputcolumn">
            <Accordion sectionName="preview" alwaysOpen>
              <Eye size={26} />
              {t('banner.preview@@Preview')}
            </Accordion>
            <canvas ref={preview} id="preview" class={{
              'lum-card p-0 flex-col gap-2 transition-all duration-200 sm:opacity-100 sm:pointer-events-auto sm:max-h-full': true,
              'max-h-0 opacity-0 pointer-events-none': openSections.indexOf('preview') == -1,
              'max-h-auto opacity-100 pointer-events-auto': openSections.indexOf('preview') != -1,
            }} />
            <canvas ref={textureCanvas} id="texture" class="hidden" style={{
              imageRendering: 'pixelated',
            }}></canvas>
          </div>
        </div>
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Banner Generator',
  meta: [
    {
      name: 'description',
      content: 'Easily generate banner designs for Minecraft.',
    },
    {
      name: 'og:description',
      content: 'Easily generate banner designs for Minecraft.',
    },
    {
      name: 'og:image',
      content: '/branding/icon.png',
    },
  ],
  scripts: [
    {
      props: {
        async: true,
        type: 'text/javascript',
        src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8716785491986947',
        crossOrigin: 'anonymous',
      },
    },
  ],
};