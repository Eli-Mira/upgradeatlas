import { useEffect, useRef } from 'react'

/**
 * The hero object: a graphite laptop built from real geometry.
 *
 * Why geometry instead of a photo: this is a spec-verification product, and a
 * stock photograph of someone else's machine would be a false claim about the
 * catalog. A neutral chassis with no branding makes no claim at all.
 *
 * Three.js is imported dynamically so it never enters the initial bundle, and
 * every GPU resource is disposed on unmount.
 */
export default function Hero3D({ className = '' }) {
  const hostRef = useRef(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return undefined

    let disposed = false
    let frame = 0
    let cleanup = () => {}

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    import('three')
      .then((THREE) => {
        if (disposed) return

        let renderer
        try {
          renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
        } catch {
          return // No WebGL: the section still reads without the object.
        }

        const width = host.clientWidth || 1
        const height = host.clientHeight || 1

        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.setSize(width, height, false)
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1.05
        host.appendChild(renderer.domElement)
        renderer.domElement.style.display = 'block'
        renderer.domElement.style.width = '100%'
        renderer.domElement.style.height = '100%'

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100)
        camera.position.set(0, 1.75, 5.4)
        camera.lookAt(0, 0.72, 0)

        // --- materials -----------------------------------------------------
        const shell = new THREE.MeshStandardMaterial({
          color: 0x2a2f36,
          metalness: 0.62,
          roughness: 0.42,
        })
        const deck = new THREE.MeshStandardMaterial({
          color: 0x14171c,
          metalness: 0.35,
          roughness: 0.72,
        })
        const glass = new THREE.MeshStandardMaterial({
          color: 0x0a0b0d,
          metalness: 0.1,
          roughness: 0.18,
        })
        const bezel = new THREE.MeshStandardMaterial({
          color: 0x1a1e24,
          metalness: 0.5,
          roughness: 0.5,
        })

        // --- screen surface: an abstract panel, not a fake product UI ------
        const screenCanvas = document.createElement('canvas')
        screenCanvas.width = 512
        screenCanvas.height = 320
        const ctx = screenCanvas.getContext('2d')
        ctx.fillStyle = '#0c1114'
        ctx.fillRect(0, 0, 512, 320)
        ctx.strokeStyle = 'rgba(79,209,197,0.16)'
        ctx.lineWidth = 1
        for (let x = 0; x <= 512; x += 32) {
          ctx.beginPath()
          ctx.moveTo(x + 0.5, 0)
          ctx.lineTo(x + 0.5, 320)
          ctx.stroke()
        }
        for (let y = 0; y <= 320; y += 32) {
          ctx.beginPath()
          ctx.moveTo(0, y + 0.5)
          ctx.lineTo(512, y + 0.5)
          ctx.stroke()
        }
        // One measured bar row, read as an instrument trace rather than content.
        ctx.fillStyle = 'rgba(79,209,197,0.55)'
        ctx.fillRect(64, 232, 384, 3)
        ctx.fillStyle = 'rgba(242,244,247,0.22)'
        ctx.fillRect(64, 252, 208, 3)
        const screenTexture = new THREE.CanvasTexture(screenCanvas)
        screenTexture.colorSpace = THREE.SRGBColorSpace
        const screenMaterial = new THREE.MeshStandardMaterial({
          map: screenTexture,
          emissive: 0xffffff,
          emissiveMap: screenTexture,
          emissiveIntensity: 0.42,
          roughness: 0.25,
          metalness: 0,
        })

        // --- geometry ------------------------------------------------------
        const root = new THREE.Group()
        scene.add(root)

        const base = new THREE.Mesh(new THREE.BoxGeometry(2.72, 0.1, 1.86), shell)
        base.position.y = 0.05
        root.add(base)

        const deckPlate = new THREE.Mesh(new THREE.BoxGeometry(2.44, 0.012, 1.2), deck)
        deckPlate.position.set(0, 0.106, 0.18)
        root.add(deckPlate)

        const trackpad = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.008, 0.6), bezel)
        trackpad.position.set(0, 0.108, 0.56)
        root.add(trackpad)

        const hinge = new THREE.Group()
        hinge.position.set(0, 0.1, -0.93)
        hinge.rotation.x = -0.36
        root.add(hinge)

        const lid = new THREE.Mesh(new THREE.BoxGeometry(2.72, 1.74, 0.075), shell)
        lid.position.y = 0.87
        hinge.add(lid)

        const bezelFace = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 1.56), glass)
        bezelFace.position.set(0, 0.87, 0.039)
        hinge.add(bezelFace)

        const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.38, 1.44), screenMaterial)
        screen.position.set(0, 0.87, 0.041)
        hinge.add(screen)

        // Contact shadow: a soft gradient card under the machine, cheaper than
        // a real shadow map and stable on integrated GPUs.
        const shadowCanvas = document.createElement('canvas')
        shadowCanvas.width = 256
        shadowCanvas.height = 256
        const sctx = shadowCanvas.getContext('2d')
        const gradient = sctx.createRadialGradient(128, 128, 8, 128, 128, 126)
        gradient.addColorStop(0, 'rgba(0,0,0,0.72)')
        gradient.addColorStop(1, 'rgba(0,0,0,0)')
        sctx.fillStyle = gradient
        sctx.fillRect(0, 0, 256, 256)
        const shadowTexture = new THREE.CanvasTexture(shadowCanvas)
        const shadow = new THREE.Mesh(
          new THREE.PlaneGeometry(4.2, 3.1),
          new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false }),
        )
        shadow.rotation.x = -Math.PI / 2
        shadow.position.y = -0.005
        root.add(shadow)

        // --- lighting ------------------------------------------------------
        scene.add(new THREE.AmbientLight(0xffffff, 0.32))

        const key = new THREE.DirectionalLight(0xffffff, 2.1)
        key.position.set(3.4, 5.2, 3.2)
        scene.add(key)

        const rim = new THREE.PointLight(0x4fd1c5, 14, 12, 2)
        rim.position.set(-2.6, 1.5, -2.4)
        scene.add(rim)

        const fill = new THREE.DirectionalLight(0x8b95a3, 0.5)
        fill.position.set(-3.2, 1.4, 2.6)
        scene.add(fill)

        // --- interaction: OrbitControls-style drag + idle auto-rotate ---
        // Loaded from three/examples so it never enters the main bundle.
        const pointer = { x: 0, y: 0, down: false }
        const orbit = { yaw: 0, pitch: 0 }
        const target = { yaw: 0, pitch: 0 }

        const onPointerDown = (event) => {
          pointer.down = true
          pointer.x = event.clientX
          pointer.y = event.clientY
        }
        const onPointerMove = (event) => {
          if (!pointer.down) return
          target.yaw += (event.clientX - pointer.x) * 0.005
          target.pitch += (event.clientY - pointer.y) * 0.004
          target.pitch = Math.max(-1.1, Math.min(1.1, target.pitch))
          pointer.x = event.clientX
          pointer.y = event.clientY
        }
        const onPointerUp = () => {
          pointer.down = false
        }

        if (!reduced) {
          host.addEventListener('pointerdown', onPointerDown)
          host.addEventListener('pointermove', onPointerMove, { passive: true })
          host.addEventListener('pointerup', onPointerUp)
          host.addEventListener('pointerleave', onPointerUp)
          host.style.touchAction = 'none'
        }

        const onResize = () => {
          const w = host.clientWidth || 1
          const h = host.clientHeight || 1
          renderer.setSize(w, h, false)
          camera.aspect = w / h
          camera.updateProjectionMatrix()
        }
        const observer = new ResizeObserver(onResize)
        observer.observe(host)

        const start = performance.now()
        const renderFrame = (now) => {
          const elapsed = (now - start) / 1000
          // Damping: lerp toward the drag target so release feels weighty.
          orbit.yaw += (target.yaw - orbit.yaw) * 0.08
          orbit.pitch += (target.pitch - orbit.pitch) * 0.08
          // Idle auto-rotate: a slow turntable sweep that pauses while dragging.
          const sweep = pointer.down ? 0 : Math.sin(elapsed * 0.34) * 0.42
          root.rotation.y = sweep + orbit.yaw
          root.rotation.x = orbit.pitch
          root.position.y = Math.sin(elapsed * 0.6) * 0.022
          renderer.render(scene, camera)
          if (!reduced) frame = requestAnimationFrame(renderFrame)
        }
        frame = requestAnimationFrame(renderFrame)

        // --- teardown ------------------------------------------------------
        cleanup = () => {
          cancelAnimationFrame(frame)
          observer.disconnect()
          host.removeEventListener('pointermove', onPointerMove)

          scene.traverse((object) => {
            if (object.isMesh) {
              object.geometry?.dispose()
              const material = object.material
              const list = Array.isArray(material) ? material : [material]
              for (const item of list) {
                item?.map?.dispose()
                item?.emissiveMap?.dispose()
                item?.dispose()
              }
            }
          })
          screenTexture.dispose()
          shadowTexture.dispose()
          renderer.dispose()
          renderer.forceContextLoss?.()
          if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement)
        }
      })
      .catch(() => {
        // The hero reads fine without the object.
      })

    return () => {
      disposed = true
      cleanup()
    }
  }, [])

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className={`pointer-events-none relative h-full w-full ${className}`}
    />
  )
}
