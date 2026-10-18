import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

function texture(width, height, draw) {
  const canvas = document.createElement('canvas')
  canvas.width = width; canvas.height = height
  draw(canvas.getContext('2d'), width, height)
  const map = new THREE.CanvasTexture(canvas)
  map.colorSpace = THREE.SRGBColorSpace
  return map
}

export function getScreenTex() {
  return texture(1280, 800, (ctx, w, h) => {
    ctx.fillStyle = '#0a0d13'; ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 42; i++) {
      ctx.beginPath(); ctx.moveTo(-120, 190 + i * 22)
      ctx.bezierCurveTo(380, 640 + i * 9, 420, -340 + i * 25, 1460, 180 + i * 17)
      ctx.lineWidth = i % 7 === 0 ? 3 : 1
      ctx.strokeStyle = i > 20 && i < 26 ? '#a13c43' : `rgba(137,155,180,${0.16 + (i % 4) * 0.05})`
      ctx.stroke()
    }
  })
}

export function buildLaptop() {
  const group = new THREE.Group()
  const metal = new THREE.MeshStandardMaterial({ color: 0x282c33, metalness: .88, roughness: .29 })
  const edge = new THREE.MeshStandardMaterial({ color: 0x333840, metalness: .92, roughness: .24 })
  const black = new THREE.MeshStandardMaterial({ color: 0x090b0f, metalness: .22, roughness: .58 })
  const keyMaterial = new THREE.MeshStandardMaterial({ color: 0x171b21, metalness: .12, roughness: .49 })
  function part(name, size, material, position, parent = group, radius = .025) {
    const mesh = new THREE.Mesh(new RoundedBoxGeometry(...size, 3, radius), material)
    mesh.name = name; mesh.position.set(...position); parent.add(mesh)
    return mesh
  }
  part('bottom-shell', [3.46, .095, 2.27], edge, [0, .12, .1])
  part('base', [3.5, .12, 2.3], metal, [0, .215, .1])
  part('keyboard-well', [3.05, .014, 1.04], black, [0, .281, -.16])
  part('trackpad-edge', [1.21, .008, .61], edge, [0, .28, .785], group, .014)
  part('trackpad', [1.185, .008, .585], metal, [0, .286, .785], group, .012)
  const keyGeometry = new RoundedBoxGeometry(.185, .024, .145, 2, .012)
  const keys = new THREE.InstancedMesh(keyGeometry, keyMaterial, 70)
  const transform = new THREE.Object3D()
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 14; col++) {
      transform.position.set(-1.3325 + col * .205, .309, -.54 + row * .185)
      transform.updateMatrix(); keys.setMatrixAt(row * 14 + col, transform.matrix)
    }
  }
  keys.name = 'keycaps'; group.add(keys)
  const legend = texture(1400, 500, (ctx) => {
    const labels = [
      ['esc','1','2','3','4','5','6','7','8','9','0','−','=','⌫'],
      ['tab','Q','W','E','R','T','Y','U','I','O','P','[',']','\\'],
      ['caps','A','S','D','F','G','H','J','K','L',';','\'','↵','↵'],
      ['shift','Z','X','C','V','B','N','M',',','.','/','↑','shift','fn'],
      ['ctrl','fn','alt','⌘','','','','','','alt','←','↓','→','ctrl'],
    ]
    ctx.font = '22px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#acb3bd'
    labels.forEach((row, y) => row.forEach((label, x) => ctx.fillText(label, x * 100 + 50, y * 100 + 50)))
  })
  const letters = new THREE.Mesh(new THREE.PlaneGeometry(2.87, .925),
    new THREE.MeshBasicMaterial({ map: legend, transparent: true, depthWrite: false, toneMapped: false }))
  letters.rotation.x = -Math.PI / 2; letters.position.set(0, .323, -.17); group.add(letters)
  for (const x of [-1.595, 1.595]) {
    for (let z = -.67; z < .32; z += .035) part('speaker', [.025, .005, .012], black, [x, .278, z], group, .002)
  }
  for (const x of [-1.22, 1.22]) {
    const hinge = new THREE.Mesh(new THREE.CylinderGeometry(.068, .068, .37, 24), edge)
    hinge.rotation.z = Math.PI / 2; hinge.position.set(x, .295, -.965); group.add(hinge)
  }
  const lid = new THREE.Group(); lid.name = 'lid'; lid.position.set(0, .29, -.985); lid.rotation.x = -.18; group.add(lid)
  part('lid-shell', [3.45, 2.2, .072], metal, [0, 1.09, 0], lid, .034)
  part('screen-bezel', [3.33, 2.08, .014], black, [0, 1.09, .038], lid, .006)
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(3.12, 1.9), new THREE.MeshBasicMaterial({ map: getScreenTex(), toneMapped: false }))
  screen.name = 'screen'; screen.position.set(0, 1.10, .047); lid.add(screen)
  const camera = new THREE.Mesh(new THREE.CircleGeometry(.012, 20), black)
  camera.position.set(0, 2.105, .049); lid.add(camera)
  for (const x of [-1.752, 1.752]) {
    for (const z of [-.64, -.30, .13]) part('port', [.007, .037, .15], black, [x, .214, z], group, .003)
    for (let i = 0; i < 12; i++) part('vent', [.006, .018, .024], black, [x, .14, .52 + i * .032], group, .002)
  }
  part('opening-notch', [.43, .015, .012], black, [0, .26, 1.252], group, .006)
  for (const x of [-1.3, 1.3]) for (const z of [-.65, .8]) part('foot', [.32, .035, .11], black, [x, .055, z])
  group.traverse(object => { if (object.isMesh) { object.castShadow = true; object.receiveShadow = true } })
  letters.castShadow = false; screen.castShadow = false
  return group
}
