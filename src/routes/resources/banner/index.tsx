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
  useVisibleTask$(() => {
    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.TextureLoader().load('');

    // Camera
    const camera = new THREE.PerspectiveCamera(75, preview.value.width / preview.value.height, 0.1, 1000);
    camera.position.x = 0;
    camera.rotation.y = 0;
    camera.position.z = 0;

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

    // Manager for banner obj
    let object: THREE.Object3D;
    const manager = new THREE.LoadingManager(() => {
      object.traverse((child: any) => {
        if (child.isMesh) child.material.map = texture;
      } );
      object.position.x = 0;
      object.position.y = -2;
      object.position.z = -5;
      object.rotation.y = -2;
      scene.add(object);
    });

    // Texture Loader for banner obj
    const textureLoader = new THREE.TextureLoader(manager);
    const texture = textureLoader.load('/banner/banner_standing.png');
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;

    // OBJ Loader for banner obj
    const loader = new OBJLoader(manager);
    loader.load('/banner/banner_standing.obj', (obj) => object = obj,
      (xhr) => {
        if (!xhr.lengthComputable ) return;
        const percentComplete = xhr.loaded / xhr.total * 100;
        console.log('model ' + percentComplete.toFixed( 2 ) + '% downloaded');
      }, (error) => {
        console.error('An error happened', error);
      });

    // Animation Loop
    const animate = () => {
      renderer.render(scene, camera);
      controls.update();
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