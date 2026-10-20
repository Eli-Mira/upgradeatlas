/*
 * Product-sequence studio.
 *
 * A transparent-background variant of the studio used to pre-render the
 * hero product sequence: the lid opens on its hinge while the camera orbits,
 * and the scene is lit for the cinematic direction (a red sweep across the
 * body, a blue rim, a cool key).
 *
 * The output is a frame sequence, not a runtime scene: the hero scrubs it
 * with scroll progress, so the page carries no 3D cost and nothing animates
 * while the tab is hidden.
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { buildLaptop } from './laptop.js';

export const FRAME_COUNT = 16;
export const CLOSED_ANGLE = -Math.PI / 2 + 0.02;
export const OPEN_ANGLE = -0.16;

export function buildProductStudio({ canvas, width = 1400, height = 900, dpr = 1 } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(dpr, 1.5));
  renderer.setSize(width, height, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = null;

  const room = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(room, 0.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.6;
  room.dispose();
  pmrem.dispose();

  const laptop = buildLaptop();
  laptop.name = 'concept-laptop';
  laptop.rotation.y = -0.18;
  scene.add(laptop);

  const lid = laptop.getObjectByName('lid');

  // The keyboard deck is grouped so the exploded view can lift it as one
  // assembly instead of nudging individual parts.
  const deck = new THREE.Group();
  deck.name = 'deck';
  for (const name of ['keyboard-well', 'keycaps', 'key-letters', 'trackpad', 'trackpad-edge']) {
    const part = laptop.getObjectByName(name);
    if (part) deck.add(part);
  }
  laptop.add(deck);

  // Cool key from the upper left, so the chassis reads as graphite.
  const key = new THREE.DirectionalLight(0xdfe8ff, 2.1);
  key.position.set(-3.4, 5.2, 3.2);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { near: 0.1, far: 20, left: -5, right: 5, top: 5, bottom: -5 });
  key.shadow.bias = -0.0005;
  key.shadow.normalBias = 0.012;

  // Red sweep across the body, matching the product's light language.
  const sweep = new THREE.SpotLight(0xff3344, 26, 14, Math.PI / 7, 0.55, 1.6);
  sweep.position.set(4.2, 2.1, -1.4);
  sweep.target.position.set(0, 0.6, 0);

  // Electric blue rim from behind, separating the machine from the dark.
  const rim = new THREE.DirectionalLight(0x4d8bff, 2.6);
  rim.position.set(-2.6, 3.4, -5.2);

  const fill = new THREE.DirectionalLight(0xbcd2f2, 0.55);
  fill.position.set(5, 1.8, -0.6);

  scene.add(key, sweep, rim, fill, new THREE.AmbientLight(0xffffff, 0.2));

  // A soft reflective ground, kept out of the alpha channel by fading it out.
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.MeshBasicMaterial({ color: 0x05070a, transparent: true, opacity: 0 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.115;
  scene.add(ground);

  const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 100);

  /**
   * Frame t in [0,1]:
   *   the lid opens across the first third, the camera orbits through the
   *   sequence, and the framing tightens for the close-up at the end.
   */
  function applyFrame(t) {
    const clamped = Math.max(0, Math.min(1, t));

    const open = Math.min(1, clamped / 0.34);
    const eased = open * open * (3 - 2 * open);
    if (lid) lid.rotation.x = CLOSED_ANGLE + (OPEN_ANGLE - CLOSED_ANGLE) * eased;

    const orbit = -0.55 + clamped * 1.35;
    const radius = 6.4 - clamped * 1.15;
    const height = 2.35 + clamped * 0.5;
    camera.position.set(
      Math.sin(orbit) * radius,
      height,
      Math.cos(orbit) * radius,
    );
    camera.lookAt(0, 0.95 + clamped * 0.06, 0);
    camera.fov = 30 - clamped * 4;
    camera.updateProjectionMatrix();

    ground.material.opacity = 0;
    sweep.intensity = 18 + clamped * 16;
    renderer.render(scene, camera);
  }

  /**
   * The conceptual exploded view: the screen assembly lifts away from the
   * keyboard deck, which lifts from the bottom shell, along believable
   * vertical axes. This is a construction illustration, not a teardown
   * drawing of a real machine.
   */
  function applyExploded(t) {
    const clamped = Math.max(0, Math.min(1, t));

    if (lid) {
      lid.rotation.x = OPEN_ANGLE;
      lid.position.y = 0.29 + clamped * 1.15;
    }
    deck.position.y = clamped * 0.42;
    const shell = laptop.getObjectByName('bottom-shell');
    if (shell) shell.position.y = 0.12 - clamped * 0.3;

    camera.position.set(2.7, 3.1, 5.5 + clamped * 1.5);
    camera.lookAt(0, 1.0 + clamped * 0.4, 0);
    camera.fov = 30;
    camera.updateProjectionMatrix();
    ground.material.opacity = 0;
    renderer.render(scene, camera);
  }

  function dispose() {
    const resources = new Set();
    scene.traverse((object) => {
      if (object.geometry) resources.add(object.geometry);
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) {
        if (!material) continue;
        if (material.map) resources.add(material.map);
        resources.add(material);
      }
    });
    resources.forEach((resource) => resource.dispose());
    environment.dispose();
    key.shadow.dispose();
    renderer.dispose();
  }

  return { renderer, scene, laptop, camera, applyFrame, applyExploded, dispose, frameCount: FRAME_COUNT };
}
