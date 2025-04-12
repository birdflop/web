/* eslint-disable qwik/jsx-img */
import { component$, noSerialize, useContext, useSignal, useStore, useVisibleTask$, type Signal } from '@builder.io/qwik';
import type { NoSerialize } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

import { inlineTranslate } from 'qwik-speak';

import { ChevronDown, ChevronUp, Eye, Settings, Trash } from 'lucide-icons-qwik';
import Accordion from '~/components/Accordion';

import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OpenSectionsContext } from '~/routes/layout';
import { colors, patterns } from '~/util/banner';
import { NumberInput } from '@luminescent/ui-qwik';
import { swapItems } from '~/util/RGBUtils';

export default component$(() => {
  const t = inlineTranslate();
  const preview = useSignal<HTMLCanvasElement>() as Signal<HTMLCanvasElement>;

  const openSections = useContext(OpenSectionsContext);

  const bannerStore: {
    color: keyof typeof colors;
    patterns: {
      color: keyof typeof colors;
      pattern: typeof patterns[number];
    }[];
  } = useStore({
    color: 'white',
    patterns: [
      {
        color: 'white',
        pattern: 'bricks',
      },
    ],
  });
  const banner = useSignal<NoSerialize<THREE.Group>>();

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
    banner.value = noSerialize(mainObj);
    const main = new THREE.Group();
    main.add(mainObj);
    mainObj.position.x = -0.1;
    mainObj.position.y = -3.9;
    main.position.x = 0.09;
    main.position.y = 1.9;
    main.position.z = -5;
    const objects = { stand, main };

    // Texture Loader for banner obj
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('/banner/white_banner.png');
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;

    // Add objects to scene
    Object.entries(objects).forEach(([name, object]) => {
      object.traverse((child: any) => {
        if (child.isMesh) {
          child.material.map = texture;
          if (name === 'main') child.material.color = new THREE.Color(bannerStore.color);
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

  return (
    <section class="flex min-h-svh pt-[72px] text-center my-5 lg:px-64">
      <div class="grid sm:grid-cols-2 gap-6 w-full">
        <div class="flex flex-col gap-2" id="inputcolumn">
          <h1 class="font-bold text-gray-50 text-2xl md:text-3xl xl:text-4xl">
            {t('nav.resources.banner.title@@Banner Generator')}
          </h1>
          <h2 class="text-gray-50 mt-1 mb-5">
            {t('nav.resources.banner.description@@Easily generate banner designs for Minecraft.')}
          </h2>
          <Accordion sectionName="options" alwaysOpen>
            <Settings size={26} />
            {t('banner.options@@Options')}
          </Accordion>
          <div class={{
            'flex flex-col transition-all duration-200 sm:opacity-100 sm:pointer-events-auto sm:h-auto text-left': true,
          }}>
            <p class="flex md:text-lg xl:text-xl font-semibold text-gray-50 gap-3 items-center mb-2">
              {t('banner.options.baseColor.title@@Base Color')}
              <span class="text-gray-400 text-sm font-normal">
                {t('banner.options.baseColor.title@@This is the base color of the banner to start with.')}
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
                    banner.value?.traverse((child: any) => {
                      if (child.isMesh) child.material.color = new THREE.Color(color);
                    });
                  }}>
                    <img class="w-10 rounded-md" src={`/banner/dyes/${colorName}_dye.png`} alt={colorName} style={{
                      imageRendering: 'pixelated',
                    }} />
                  </button>
                );
              })}
            </div>
            <p class="flex md:text-lg xl:text-xl font-semibold text-gray-50 gap-3 items-center mb-2 mt-4">
              {t('banner.options.patterns.title@@Patterns')}
            </p>
            <NumberInput input min={1} value={bannerStore.patterns.length} id="layeramount"
              onChange$={(e, el) => {
                let layerAmount = Number(el.value);
                if (layerAmount < 1) layerAmount = 1;
                const newPatterns = [];
                for (let i = 0; i < layerAmount; i++) {
                  if (bannerStore.patterns[i]) newPatterns.push(bannerStore.patterns[i]);
                  else newPatterns.push({ color: 'white', pattern: 'bricks' });
                }
                bannerStore.patterns = newPatterns;
              }}
              onIncrement$={() => {
                const newPatterns = [...bannerStore.patterns, {
                  color: 'white',
                  pattern: 'bricks',
                }];
                bannerStore.patterns = newPatterns;
              }}
              onDecrement$={() => {
                const newPatterns = bannerStore.patterns.slice(0);
                newPatterns.pop();
                bannerStore.patterns = newPatterns;
              }}
            >
              {t('banner.options.patterns.amount@@Pattern Amount')}
            </NumberInput>

            <div class="flex flex-col gap-2">
              {bannerStore.patterns.map((pattern, i) => <div key={`${i}/${bannerStore.patterns.length}`} class="flex relative gap-2">
                <div class="flex flex-col rounded-md">
                  <button class="lum-btn lum-pad-equal-xs border-b-transparent rounded-b-none" onClick$={() => bannerStore.patterns = swapItems(bannerStore.patterns, i, i - 1)}>
                    <ChevronUp size={20} />
                  </button>
                  <button class="lum-btn lum-pad-equal-xs border-t-transparent rounded-t-none" onClick$={() => bannerStore.patterns = swapItems(bannerStore.patterns, i, i + 1)}>
                    <ChevronDown size={20} />
                  </button>
                </div>
                <div class="flex flex-col justify-end gap-1">
                  <label for={`colorlist-color-${i + 1}`}>{t('banner.options.pattern@@Pattern')} {i + 1}</label>
                </div>
                <div class="flex flex-col justify-end">
                  <button class="lum-btn lum-pad-equal-sm lum-bg-red-700 hover:lum-bg-red-600" disabled={bannerStore.patterns.length <= 1} onClick$={() => {
                    const newPatterns = bannerStore.patterns.slice(0);
                    newPatterns.splice(i, 1);
                    bannerStore.patterns = newPatterns;
                  }}>
                    <Trash size={20} />
                  </button>
                </div>
                <div id={`colorlist-color-${i + 1}-popup`} stoppropagation:mousedown class={{
                  'flex flex-col gap-2 motion-safe:transition-all absolute top-full z-[1000] mt-2 left-0': true,
                  'opacity-0 scale-95 pointer-events-none': true,
                }}>
                  <div class="flex flex-wrap gap-1">
                    {Object.entries(colors).map(([colorName, color]) => {
                      return (
                        <button key={colorName} class={{
                          'lum-btn lum-pad-equal-md hover:brightness-150': true,
                        }} style={{
                          background: `#${color.toString(16).padStart(6, '0')}`,
                        }} onClick$={() => {
                          
                        }}>
                          <img class="w-10 rounded-md" src={`/banner/dyes/${colorName}_dye.png`} alt={colorName} style={{
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
                          'lum-btn p-0 lum-bg-gray-900 relative': true,
                        }} onClick$={() => {
                          
                        }}>
                          <img class="w-10 rounded-md" src={`/banner/patterns/previews/${pattern}.png`} alt={pattern} style={{
                            imageRendering: 'pixelated',
                          }} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>,
              )}
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-2 border-l border-l-gray-800 pl-6" id="outputcolumn">
          <h1 class="font-bold text-gray-50 text-2xl md:text-3xl xl:text-4xl">
            {t('banner.output.title@@Generated Banner')}
          </h1>
          <h2 class="text-gray-50 mt-1 mb-5">
            {t('banner.output.description@@Here you can see the preview of the banner and the crafting recipe / command.')}
          </h2>
          <Accordion sectionName="preview" alwaysOpen>
            <Eye size={26} />
            {t('banner.preview@@Preview')}
          </Accordion>
          <canvas ref={preview} id="preview" class={{
            'lum-card p-0 transition-all duration-200 sm:opacity-100 sm:pointer-events-auto w-full': true,
            'h-0 opacity-0 pointer-events-none': openSections.indexOf('preview') == -1,
            'opacity-100 pointer-events-auto': openSections.indexOf('preview') != -1,
          }} />
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