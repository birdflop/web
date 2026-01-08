import { Signal } from '@builder.io/qwik';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Notification } from './Notification';

export default async function birdThreeJS(birdRef: Signal<HTMLCanvasElement | undefined>,
  anchorElementRef: Signal<HTMLDivElement | undefined>,
  notifications: Notification[],
  coordinatesToLandOn: Signal<{ x: number; y: number } | undefined>) {
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

  // Add bird to scene
  scene.add(bird);

  // Animation state
  let emote: 'waving' | undefined;
  let flying = false;

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

  // Convert world position to screen position
  function worldToScreen(pos: THREE.Vector3, camera: THREE.OrthographicCamera) {
    const vector = pos.clone().project(camera);

    return {
      x: (vector.x * 0.5 + 0.5) * window.innerWidth,
      y: (-vector.y * 0.5 + 0.5) * window.innerHeight,
    };
  }

  function screenToWorld(x: number, y: number, camera: THREE.OrthographicCamera) {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Normalized device coordinates (NDC) from -1 to 1
    const ndcX = (x / width) * 2 - 1;
    const ndcY = - (y / height) * 2 + 1;

    // Map NDC to world coordinates using camera frustum size
    const worldX = ndcX * camera.right;  // since right = positive max X
    const worldY = ndcY * camera.top;    // since top = positive max Y

    return new THREE.Vector3(worldX, worldY, 0);
  }

  // Anchor speech bubble to head
  function updateAnchorElement() {
    if (!head || !anchorElementRef.value) return;
    head.getWorldPosition(headWorldPos);

    const screen = worldToScreen(headWorldPos, camera);
    anchorElementRef.value.style.left = `${screen.x}px`;
    anchorElementRef.value.style.top = `${screen.y}px`;
  }

  let targetPos: THREE.Vector3 | undefined;

  function wrapAngle(angle: number) {
    if (angle > Math.PI) return angle - 2 * Math.PI;
    if (angle < -Math.PI) return angle + 2 * Math.PI;
    return angle;
  }

  function smoothRotate(current: number, target: number, factor: number) {
    let delta = target - current;
    delta = wrapAngle(delta);
    return current + delta * factor;
  }

  function updateRotationTowards(bird: any, targetAngle: number, smoothFactor = 0.1) {
    bird.rotation.y = smoothRotate(bird.rotation.y, targetAngle, smoothFactor);
  }

  function getCameraRotation(birdPos: THREE.Vector3, camera: THREE.Camera) {
    const cameraPos = new THREE.Vector3();
    camera.getWorldPosition(cameraPos);
    const vectorToCamera = new THREE.Vector3().subVectors(cameraPos, birdPos);
    return Math.atan2(vectorToCamera.x, vectorToCamera.z);
  }

  function updateWaving(time: number) {
    const wing = bird.rotation.y < Math.PI ? wingR : wingL;
    const otherWing = bird.rotation.y < Math.PI ? wingL : wingR;
    if (!wing || !otherWing || !body) return;
    wing.rotation.x = -Math.sin(time / 60) * 0.4;
    wing.rotation.z = bird.rotation.y < Math.PI ? 2.5 : -2.5;
    body.rotation.x = THREE.MathUtils.lerp(body.rotation.x, THREE.MathUtils.degToRad(-20), 0.05);
    otherWing.rotation.z = Math.sin(time / 500) * 0.05;
  }

  function updateIdle(time: number) {
    if (!legL || !legR || !body || !wingL || !wingR || !tail) return;
    legL.rotation.x = THREE.MathUtils.lerp(legL.rotation.x, 0.45, 0.05);
    legR.rotation.x = THREE.MathUtils.lerp(legR.rotation.x, 0.45, 0.05);
    body.rotation.x = THREE.MathUtils.lerp(body.rotation.x, THREE.MathUtils.degToRad(-28), 0.05);
    wingL.rotation.z = Math.sin(time / 500) * 0.05;
    wingR.rotation.z = -Math.sin(time / 500) * 0.05;
    tail.rotation.x = -Math.sin(time / 500) * 0.05;
  }

  function updateFlying(time: number) {
    if (!legL || !legR || !body || !wingL || !wingR || !tail) return;
    legL.rotation.x = THREE.MathUtils.lerp(legL.rotation.x, 0, 0.05);
    legR.rotation.x = THREE.MathUtils.lerp(legR.rotation.x, 0, 0.05);
    body.rotation.x = THREE.MathUtils.lerp(body.rotation.x, THREE.MathUtils.degToRad(-36), 0.05);
    bird.position.y += Math.sin(time / 25) * 0.003;
    wingL.rotation.z = Math.sin(time / 25) * 0.5 - 0.5;
    wingR.rotation.z = -Math.sin(time / 25) * 0.5 + 0.5;
  }

  // Animation Loop
  const animate = (time: number) => {
    updateHeadLook(time);
    updateAnchorElement();

    emote = notifications.length > 0 ? 'waving' : undefined;

    if (coordinatesToLandOn.value) {
      const { x, y } = coordinatesToLandOn.value;
      targetPos = screenToWorld(x, y, camera);
    }

    if (targetPos) {
      const direction = new THREE.Vector3().subVectors(targetPos, bird.position);
      const distance = direction.length();

      // Calculate blended rotation
      const targetRotation = Math.atan2(direction.x, direction.z) + Math.PI;
      const cameraRotation = getCameraRotation(bird.position, camera);
      const blendFactor = 0.25;
      const desiredRotation = THREE.MathUtils.lerp(targetRotation, cameraRotation, blendFactor);

      updateRotationTowards(bird, desiredRotation);

      if (distance > 0.1) {
        direction.normalize();
        bird.position.addScaledVector(direction, 0.0125);
        flying = true;
      } else {
        flying = false;
        // Idle rotation
        const idleRotation = 2.5;
        updateRotationTowards(bird, idleRotation);
      }
    }

    if (emote === 'waving') updateWaving(time);
    else updateIdle(time);

    if (flying) updateFlying(time);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
}