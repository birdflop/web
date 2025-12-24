import type { JSXOutput, NoSerialize, Signal } from '@builder.io/qwik';
import { component$, createContextId, Slot, useContextProvider, useSignal, useStore, useVisibleTask$ } from '@builder.io/qwik';

import Backgrounds, { lightBackgrounds } from '~/components/Elements/Background';
import Footer from '~/components/Elements/Footer';
import Nav from '~/components/Elements/Nav';
import { Link, routeLoader$, useLocation } from '@builder.io/qwik-city';
import { Bell, Cookie, X } from 'lucide-icons-qwik';
import { inlineTranslate } from 'qwik-speak';
import { loadOpenItems } from '~/components/Elements/Accordion';
import { getCSSString, getThemePreference, ThemeContext, ThemeContextType, themes } from '~/util/theme-store';

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

type rawNotification = NoSerialize<{
  id: string;
  element: JSXOutput;
}>
type Notification = {
  id: string;
  title: string;
  description?: string;
  bgColor?: string;
  buttons?: { text: string; href: string }[];
} | rawNotification;

export const useServerTheme = routeLoader$(({ cookie }) => {
  const serverTheme = getThemePreference(cookie);
  if (serverTheme == 'auto') return {
    currentTheme: serverTheme,
  };

  const css = themes[serverTheme];
  const cssString = getCSSString(serverTheme);
  return {
    currentTheme: serverTheme,
    isDark: serverTheme === 'dark',
    css,
    cssString,
  };
});

export const useAdmins = routeLoader$(({ env }) => {
  const adminIds = env.get('ADMINS')?.split(',').map(id => id.trim());
  return adminIds;
});

export const NotificationContext = createContextId<Notification[]>('notification-context');
export const openItemsContext = createContextId<{ items: string[] }>('openitems-context');
export default component$(() => {
  const t = (string: string) => inlineTranslate()(string);
  const loc = useLocation();

  // Select background images
  const Background = Backgrounds[Math.floor(Math.random() * Backgrounds.length)];
  const LightBackground = lightBackgrounds[Math.floor(Math.random() * lightBackgrounds.length)];

  const birdRef = useSignal<HTMLCanvasElement>() as Signal<HTMLCanvasElement>;

  // Notification store
  const notifications = useStore([] as Notification[]);
  useContextProvider(NotificationContext, notifications);

  // Show cookie consent notification if not already accepted/opted out
  const showCookieConsent = useSignal(false);

  // Open items store
  const openItemsStore = useStore({
    items: [] as string[],
  });
  useContextProvider(openItemsContext, openItemsStore);

  // Get server-side theme data
  const serverThemeData = useServerTheme();

  // Theme store
  const themeStore = useStore<ThemeContextType>(serverThemeData.value);
  useContextProvider(ThemeContext, themeStore);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    // If the theme is not set, check the user's preference
    if (themeStore.isDark === undefined) {
      themeStore.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    // Load open items from localStorage
    const savedOpenItems = await loadOpenItems();
    if (savedOpenItems && savedOpenItems.length > 0) {
      openItemsStore.items = savedOpenItems;
    }

    // convert cookies to json
    const cookieJSON: {
      [key: string]: string;
    } = document.cookie.split(';').reduce((res, c) => {
      const [key, val] = c.trim().split('=').map(decodeURIComponent);
      return Object.assign(res, { [key]: val });
    }, {});
    if (cookieJSON['cookies'] || cookieJSON['optout']) return;

    try {
      // Fetch user's location information
      const response = await fetch('https://ipapi.co/json/');
      const locationData = await response.json() as any;

      // Check if user is from California or EU
      const isCaliforniaUser = locationData.region_code === 'CA' && locationData.country_code === 'US';
      const isEUUser = [
        'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
        'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
        'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB',
      ].includes(locationData.country_code);

      // Only show consent popup for California or EU users
      showCookieConsent.value = isCaliforniaUser || isEUUser;
    } catch (error) {
      // Fallback to showing consent for everyone if geolocation fails
      console.error('Error determining user location:', error);
      showCookieConsent.value = true;
    }

    if (!showCookieConsent.value) return;
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.TextureLoader().load('');

    // get width of window
    let width = window.innerWidth;
    let height = window.innerHeight;

    let aspect = width / height;
    const viewSize = 3.5;

    // Camera
    const camera = new THREE.OrthographicCamera(
      -viewSize * aspect, viewSize * aspect, // left, right
      viewSize, -viewSize,                   // top, bottom
      0.1, 1000,               // near, far
    );

    camera.position.z = 6;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: birdRef.value,
      antialias: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.render(scene, camera);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4);
    scene.add(hemisphereLight);

    // GLTF Loader for parrot model
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync('/birdflop-bird.glb');

    const bird = gltf.scene;
    bird.scale.set(0.5, 0.5, 0.5);
    bird.rotation.y = 2.5; // Face forward
    bird.rotation.x = 0;
    const margin = 0.25; // units

    bird.position.set(
      camera.right - margin,  // near right edge
      camera.bottom + margin, // near bottom edge (negative number + positive margin = near bottom)
      0,
    );

    function onWindowResize() {
      width = window.innerWidth;
      height = window.innerHeight;
      aspect = width / height;

      camera.left = -viewSize * aspect;
      camera.right = viewSize * aspect;
      camera.top = viewSize;
      camera.bottom = -viewSize;

      camera.updateProjectionMatrix();

      bird.position.set(
        camera.right - margin,  // near right edge
        camera.bottom + margin, // near bottom edge (negative number + positive margin = near bottom)
        0,
      );

      renderer.setSize(width, height);
    }
    window.addEventListener('resize', onWindowResize);

    // Texture Loader for parrot obj
    const parrotTexture = new THREE.TextureLoader().load('/birdflop-bird.png');
    if (!parrotTexture) return;
    parrotTexture.colorSpace = THREE.SRGBColorSpace;
    parrotTexture.minFilter = THREE.NearestFilter;
    parrotTexture.magFilter = THREE.NearestFilter;

    // Add parrot to scene
    bird.traverse((child: any) => {
      if (child.isMesh) {
        child.material.map = parrotTexture;
        child.material.map.flipY = false; // glTF textures usually have flipY = false
      }
    });

    const body = bird.getObjectByName('body');
    const wingL = bird.getObjectByName('left_wing');
    const wingR = bird.getObjectByName('right_wing');
    const tail = bird.getObjectByName('tail');
    const legL = bird.getObjectByName('left_leg');
    const legR = bird.getObjectByName('right_leg');
    const head = bird.getObjectByName('head');

    if (!body || !wingL || !wingR || !tail || !legL || !legR || !head) {
      console.warn('One or more bones not found! Not rendering bird.');
      return;
    }

    head.rotation.x += 0.15;
    body.rotation.x = THREE.MathUtils.degToRad(-28);
    wingL.rotation.x = -0.25;
    wingR.rotation.x = -0.25;
    tail.rotation.x = -0.35;

    scene.add(bird);

    let animation: 'flying' | undefined;
    const mouse = { x: 0, y: 0 };

    window.addEventListener('mousemove', (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    const headWorldPos = new THREE.Vector3();
    const targetLocal = new THREE.Vector3();
    function updateHeadLook(time: number) {
      if (!head || !bird) return;

      // Head position in world space
      head.getWorldPosition(headWorldPos);

      const mouseWorld = new THREE.Vector3(
        mouse.x * camera.right,
        mouse.y * camera.top,
        0,
      );

      // Direction to mouse in world space
      targetLocal.copy(mouseWorld).sub(headWorldPos);

      // Convert direction into BODY local space
      bird.worldToLocal(targetLocal);

      // Compute angles relative to body forward
      const yaw = Math.atan2(targetLocal.x, targetLocal.z);
      const pitch = Math.atan2(
        targetLocal.y,
        Math.sqrt(targetLocal.x * targetLocal.x + targetLocal.z * targetLocal.z),
      );

      // Clamp like Minecraft
      const clampedYaw = -THREE.MathUtils.clamp(yaw, -0.6, 0.6);
      const clampedPitch = THREE.MathUtils.clamp(pitch, -0.4, 0.4);

      // Idle motion
      const idle = Math.sin(time * 0.002) * 0.03;

      // Smooth interpolation
      head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, clampedYaw, 0.12);
      head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, clampedPitch + idle, 0.12);

      // Kill roll
      head.rotation.z = 0;
    }

    // Animation Loop
    const animate = (time: number) => {
      updateHeadLook(time);
      if (animation == 'flying') {
        // legs up
        legL.rotation.x = 0;
        legR.rotation.x = 0;

        // flying animation
        // bird.position.y = (Math.sin(time / 25) * 0.0125) + position.y;
        wingL.rotation.z = Math.sin(time / 25) * 0.5 - 0.5;
        wingR.rotation.z = -Math.sin(time / 25) * 0.5 + 0.5;
      }
      else {
        // legs down
        legL.rotation.x = 0.45;
        legR.rotation.x = 0.45;

        // bird.position.y = position.y;
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  });

  return <>
    <style dangerouslySetInnerHTML={`:root { ${themeStore.cssString} }`}></style>
    <Nav />

    <canvas ref={birdRef} class={{
      'fixed bottom-0 blur-none overflow-hidden z-10 w-lvw h-lvh pointer-events-none': true,
    }}/>

    {(themeStore.isDark === undefined || themeStore.isDark) &&
      <Background id="bg" class={{
        'hidden dark:flex': themeStore.isDark === undefined,
        'fixed scale-120 bottom-0 blur-none overflow-hidden -z-10 w-lvw h-lvh object-cover brightness-50': true,
        'transition-all duration-1000': loc.isNavigating,
        'blur-xl! bottom-0! opacity-5 scale-150': loc.url.pathname != '/',
      }}/>
    }
    {(themeStore.isDark === undefined || !themeStore.isDark) &&
      <LightBackground id="bg" class={{
        'flex dark:hidden': themeStore.isDark === undefined,
        'fixed scale-120 bottom-0 blur-none overflow-hidden -z-10 w-lvw h-lvh object-cover brightness-50': true,
        'transition-all duration-1000': loc.isNavigating,
        'blur-xl! bottom-0! opacity-5 scale-150': loc.url.pathname != '/',
      }}/>
    }
    <Slot />
    <div class={{
      'fixed bottom-0 sm:bottom-4 sm:right-24 flex flex-col sm:gap-2 max-w-full md:max-w-1/2 lg:max-w-1/3 xl:max-w-1/4': true,
    }} id="notifications">
      {notifications.map((notification) => {
        if (!notification) return null;
        if ('element' in notification) return notification.element;
        return <div class={{
          [notification.bgColor ?? 'lum-bg-lum-input-bg/60']: true,
          'backdrop-blur-xl lum-card rounded-none sm:rounded-lum wrap-break-word': true,
          'animate-in fade-in slide-in-from-bottom-8 sm:slide-in-from-right-8 anim-duration-500': true,
        }} key={notification.id}>
          <h4 class="flex gap-2 items-center mt-0!">
            <span class="flex gap-2 items-center flex-1">
              <Bell size={30} /> {notification.title}
            </span>
            <button class="lum-btn p-1 lum-bg-transparent cursor-pointer" onClick$={() => {
              notifications.splice(notifications.findIndex((n) => n?.id === notification.id), 1);
            }}>
              <X size={20}/>
            </button>
          </h4>
          <p>
            {notification.description}
          </p>
          {notification.buttons && notification.buttons.length > 0 &&
            <div class="flex flex-wrap gap-2 mt-2">
              {notification.buttons.map((button, index) =>
                <Link key={index} href={button.href} class="lum-btn lum-bg-blue hover:lum-bg-blue">
                  {button.text}
                </Link>,
              )}
            </div>
          }
        </div>;
      })}
      {showCookieConsent.value &&
        <div class={{
          'lum-bg-lum-input-bg/60': true,
          'backdrop-blur-xl lum-card rounded-none sm:rounded-lum wrap-break-word': true,
          'animate-in fade-in slide-in-from-bottom-8 sm:slide-in-from-right-8 anim-duration-500': true,
        }}>
          <div>
            <h4 class="flex gap-2 items-center mt-0!">
              <Cookie size={30} /> {t('nav.cookies.title@@Cookies')}
            </h4>
            <p>
              {t('nav.cookies.description@@We use cookies to automatically save and load your preferences.')}
            </p>
            <Link href="/privacy">
              {t('nav.privacyPolicy@@Privacy Policy')}
            </Link>
          </div>
          <div class="flex flex-wrap items-center justify-end gap-2">
            <button class="lum-btn" onClick$={() => {
              document.cookie = 'optout=true; path=/';
              showCookieConsent.value = false;
            }}>
              {t('nav.cookies.optOut@@Turn off cookies')}
            </button>
            <button class="lum-btn lum-bg-blue hover:lum-bg-blue" onClick$={() => {
              document.cookie = 'cookies=true; path=/';
              showCookieConsent.value = false;
            }}>
              {t('nav.cookies.acknowledge@@Okay')}
            </button>
          </div>
        </div>
      }
    </div>
    <Footer />
  </>;
});