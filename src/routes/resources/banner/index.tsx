import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { type DocumentHead } from '@builder.io/qwik-city';

import { inlineTranslate } from 'qwik-speak';

import { Eye, Settings } from 'lucide-icons-qwik';
import Accordion from '~/components/Accordion';

import * as three from 'three';

export default component$(() => {
  const t = inlineTranslate();
  const preview = useSignal<HTMLCanvasElement>();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const scene = new three.Scene();
    const camera = new three.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new three.WebGLRenderer({
      canvas: preview.value,
    });

    renderer.setPixelRatio(window.devicePixelRatio * 5);
    camera.position.setZ(30);
    camera.position.setX(0);

    renderer.render(scene, camera);

    // Lights
    const pointLight = new three.PointLight(0xffffff);
    pointLight.position.set(5, 5, 5);

    const ambientLight = new three.AmbientLight(0xffffff);
    scene.add(pointLight, ambientLight);

    // Helpers
    const lightHelper = new three.PointLightHelper(pointLight);
    scene.add(lightHelper);

    // Background
    scene.background = new three.TextureLoader().load('');

    // Avatar
    const jeffTexture = new three.TextureLoader().load('/branding/pwa-icon-512x512.png');
    const jeff = new three.Mesh(new three.BoxGeometry(3, 3, 3), new three.MeshBasicMaterial({ map: jeffTexture }));
    scene.add(jeff);

    jeff.position.z = -5;
    jeff.position.x = 0;

    camera.position.z = 0;
    camera.position.x = 0;
    camera.rotation.y = 0;

    // Animation
    const moveCamera = () => {
      jeff.rotation.y += 0.01;
      jeff.rotation.z += 0.01;
    };

    // Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);
      moveCamera();
      renderer.render(scene, camera);
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
          <div>
            Input Here
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
          <canvas ref={preview} id="preview" />
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