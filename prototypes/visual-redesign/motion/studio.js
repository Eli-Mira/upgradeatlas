import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { buildLaptop } from './laptop.js'

export function buildStudio({canvas, width = 1920, height = 1080, dpr = 1} = {}) {
  const renderer = new THREE.WebGLRenderer({canvas, antialias: true, alpha: false})
  renderer.setPixelRatio(Math.min(dpr, 1.5))
  renderer.setSize(width, height, false)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = .9
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#090a0c')
  const room = new RoomEnvironment()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const environment = pmrem.fromScene(room, .04)
  scene.environment = environment.texture
  scene.environmentIntensity = .75
  room.dispose(); pmrem.dispose()
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(100, 100),
    new THREE.MeshBasicMaterial({color: 0x090a0c}))
  floor.rotation.x = -Math.PI / 2; floor.position.y = -.11; floor.receiveShadow = true
  const plate = new THREE.Mesh(new RoundedBoxGeometry(5.1, .1, 3.65, 3, .04),
    new THREE.MeshStandardMaterial({color: 0x08090c, roughness: .9, metalness: 0, envMapIntensity: .08}))
  plate.position.y = -.02; plate.receiveShadow = true
  const laptop = buildLaptop()
  laptop.name = 'concept-laptop'; laptop.rotation.y = -.18
  scene.add(floor, plate, laptop)
  const key = new THREE.DirectionalLight(0xf0f4ff, 1.7)
  key.position.set(-3, 5, 3); key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  Object.assign(key.shadow.camera, {near: .1, far: 20, left: -5, right: 5, top: 5, bottom: -5})
  key.shadow.bias = -.0005; key.shadow.normalBias = .012
  const fill = new THREE.DirectionalLight(0xc5d5ee, .6); fill.position.set(5, 2, -1)
  const rim = new THREE.DirectionalLight(0xffffff, 2.8); rim.position.set(-3, 4, -5)
  scene.add(key, fill, rim, new THREE.AmbientLight(0xffffff, .24))
  const presets = {
    'hero-desktop': {fov: 32, pos: [3.8, 2.6, 4.4], target: [0, 1.0, 0]},
    'hero-mobile': {fov: 40, pos: [5.2, 3.4, 7.7], target: [0, 1.05, 0]},
    'catalog-front': {fov: 32, pos: [2.4, 2.0, 5.2], target: [0, 1.0, 0]},
    'catalog-top': {fov: 35, pos: [-2.4, 5.4, 3.4], target: [0, .9, 0]},
    'catalog-detail': {fov: 28, pos: [3.6, 1.65, 3.8], target: [.2, .9, .05]},
  }
  function applyPreset(name) {
    const preset = presets[name]
    if (!preset) throw new Error('Unknown studio preset')
    const camera = new THREE.PerspectiveCamera(preset.fov, width / height, .1, 100)
    camera.position.set(...preset.pos); camera.lookAt(...preset.target)
    return camera
  }
  function dispose() {
    const resources = new Set()
    scene.traverse(object => {
      if (object.geometry) resources.add(object.geometry)
      const materials = Array.isArray(object.material) ? object.material : [object.material]
      for (const material of materials) if (material) {
        if (material.map) resources.add(material.map)
        resources.add(material)
      }
    })
    resources.forEach(resource => resource.dispose())
    environment.dispose(); key.shadow.dispose(); renderer.dispose()
  }
  return {renderer, scene, laptop, camera: applyPreset('hero-desktop'), presets, applyPreset, dispose}
}
