import { Signal } from '@builder.io/qwik';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export default async function birdThreeJS(birdRef: Signal<HTMLCanvasElement | undefined>) {
  // check if birdRef is defined
  if (!birdRef.value) return console.warn('birdRef is undefined in birdThreeJS');

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

  // Lights
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
  bird.rotation.y = 2.5; // temp until bird moves around
  bird.rotation.x = 0;

  // Texture Loader for parrot obj
  const parrotTexture = new THREE.TextureLoader().load('/birdflop-bird.png');
  if (!parrotTexture) return;
  parrotTexture.colorSpace = THREE.SRGBColorSpace;
  parrotTexture.minFilter = THREE.NearestFilter;
  parrotTexture.magFilter = THREE.NearestFilter;

  // Apply texture to bird model
  bird.traverse((child: any) => {
    if (child.isMesh) {
      child.material.map = parrotTexture;
      child.material.map.flipY = false; // glTF textures usually have flipY = false
    }
  });

  // Position bird near bottom-right corner
  const margin = 0.25;
  bird.position.set(
    camera.right - margin,  // near right edge
    camera.bottom + margin, // near bottom edge (negative number + positive margin = near bottom)
    0,
  );

  // Handle window resize
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

  // Bird bones
  const body = bird.getObjectByName('body');
  const wingL = bird.getObjectByName('left_wing');
  const wingR = bird.getObjectByName('right_wing');
  const tail = bird.getObjectByName('tail');
  const legL = bird.getObjectByName('left_leg');
  const legR = bird.getObjectByName('right_leg');
  const head = bird.getObjectByName('head');
  if (!body || !wingL || !wingR || !tail || !legL || !legR || !head)
    return console.warn('One or more bones not found! Not rendering bird.');

  // Initial bone rotations
  head.rotation.x += 0.15;
  body.rotation.x = THREE.MathUtils.degToRad(-28);
  wingL.rotation.x = -0.25;
  wingR.rotation.x = -0.25;
  tail.rotation.x = -0.35;

  // Add bird to scene
  scene.add(bird);

  // Animation state
  let animation: 'flying' | 'waving' | undefined;

  // Track mouse position
  const mouse = { x: 0, y: 0 };
  window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // Head look at mouse
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
    const idle = Math.sin(time * 0.002) * 0.05;

    // Smooth interpolation
    head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, clampedYaw, 0.12);
    head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, clampedPitch + idle, 0.12);

    // Kill roll
    head.rotation.z = 0;
  }

  // Animation Loop
  const animate = (time: number) => {
    updateHeadLook(time);
    if (animation === 'flying') {
      // legs up
      legL.rotation.x = 0;
      legR.rotation.x = 0;

      // flying animation
      bird.position.y += Math.sin(time / 25) * 0.0015;
      wingL.rotation.z = Math.sin(time / 25) * 0.5 - 0.5;
      wingR.rotation.z = -Math.sin(time / 25) * 0.5 + 0.5;
    }
    else if (animation === 'waving') {
      // waving animation
      wingL.rotation.z = Math.sin(time / 200) * 0.3;
      wingR.rotation.z = -Math.sin(time / 200) * 0.3;
    }
    else {
      // legs down
      legL.rotation.x = 0.45;
      legR.rotation.x = 0.45;

      // idle animation
      wingL.rotation.z = Math.sin(time / 500) * 0.05;
      wingR.rotation.z = -Math.sin(time / 500) * 0.05;
      tail.rotation.x = -Math.sin(time / 500) * 0.05;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
}