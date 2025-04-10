import { component$, useContext, useSignal, useVisibleTask$, type Signal } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

import { inlineTranslate } from 'qwik-speak';

import { Eye, Settings } from 'lucide-icons-qwik';
import Accordion from '~/components/Accordion';

import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OpenSectionsContext } from '~/routes/layout';

export default component$(() => {
  const t = inlineTranslate();
  const preview = useSignal<HTMLCanvasElement>() as Signal<HTMLCanvasElement>;

  const openSections = useContext(OpenSectionsContext);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.TextureLoader().load('');

    // Camera
    const camera = new THREE.PerspectiveCamera(75, preview.value.width / preview.value.height, 0.1, 1000);
    camera.position.x = 4;
    camera.position.y = 1;
    camera.position.z = -7;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: preview.value,
      antialias: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(preview.value.width, preview.value.height);
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
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('/banner/white_banner.png');
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;

    // Add objects to scene
    Object.values(objects).forEach((object) => {
      object.traverse((child: any) => {
        if (child.isMesh) child.material.map = texture;
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
          <canvas ref={preview} id="preview" class={{
            'lum-card p-0 bg-transparent transition-all duration-200 sm:opacity-100 sm:pointer-events-auto sm:h-auto': true,
            'h-0 opacity-0 pointer-events-none': openSections.indexOf('preview') == -1,
            'opacity-100 pointer-events-auto': openSections.indexOf('preview') != -1,
          }} height={300} />
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