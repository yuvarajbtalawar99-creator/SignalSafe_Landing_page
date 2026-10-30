import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

/* ─────────────────────────────────────────────────────────────────
   CITY COORDINATES [lat, lon]
───────────────────────────────────────────────────────────────── */
const CITIES: [number, number, string][] = [
  [40.7, -74.0, 'NYC'],
  [51.5, -0.1, 'LON'],
  [48.9, 2.3, 'PAR'],
  [35.7, 139.7, 'TYO'],
  [19.1, 72.9, 'BOM'],
  [1.3, 103.8, 'SIN'],
  [-33.9, 151.2, 'SYD'],
  [-23.5, -46.6, 'SAO'],
  [37.6, -122.4, 'SFO'],
  [25.2, 55.3, 'DXB'],
  [52.5, 13.4, 'BER'],
  [39.9, 116.4, 'PEK'],
]

const ARC_PAIRS: [number, number][] = [
  [0, 1], [1, 2], [2, 10], [10, 9], [9, 4],
  [4, 5], [5, 3], [3, 11], [8, 0], [8, 3],
  [7, 0], [5, 6]
]

function latLonToVec3(lat: number, lon: number, radius = 1.006): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}

/* ─────────────────────────────────────────────────────────────────
   EARTH HIGH-QUALITY PROCEDURAL TEXTURE
───────────────────────────────────────────────────────────────── */
function createEarthCanvasTexture(): THREE.CanvasTexture {
  const W = 1024
  const H = 512
  const cv = document.createElement('canvas')
  cv.width = W
  cv.height = H
  const ctx = cv.getContext('2d')!
  const imgData = ctx.createImageData(W, H)
  const d = imgData.data

  for (let y = 0; y < H; y++) {
    const lat = 90 - (y / H) * 180
    const absLat = Math.abs(lat)

    for (let x = 0; x < W; x++) {
      const lon = (x / W) * 360 - 180

      // Multiscale harmonics for organic continental geography
      const n1 = Math.sin(lon * 0.075 + 0.6) * Math.cos(lat * 0.088 + 0.3)
      const n2 = Math.sin(lon * 0.135 + 2.2) * Math.cos(lat * 0.125 - 1.1)
      const n3 = Math.sin(lon * 0.042 - 1.4) * Math.cos(lat * 0.058 + 2.1)
      const n4 = Math.sin(lon * 0.185 + 3.5) * Math.cos(lat * 0.21 - 0.7)
      const n5 = Math.sin(lon * 0.025 - 0.3) * Math.cos(lat * 0.038 + 1.2)
      const noise = n1 * 0.38 + n2 * 0.26 + n3 * 0.18 + n4 * 0.11 + n5 * 0.07

      const isPolar = absLat > 72
      const isLand = noise > 0.13 && absLat <= 72
      const idx = (y * W + x) * 4

      if (isPolar) {
        // Polar ice caps - bright crisp snow
        d[idx] = 235
        d[idx + 1] = 248
        d[idx + 2] = 255
        d[idx + 3] = 255
      } else if (isLand) {
        // Rich vibrant continental terrain
        const elev = (noise - 0.13) / 0.45
        d[idx] = Math.floor(30 + elev * 60)
        d[idx + 1] = Math.floor(125 + elev * 110)
        d[idx + 2] = Math.floor(55 + elev * 65)
        d[idx + 3] = 255
      } else {
        // Vivid azure-blue cyber oceans
        const depth = Math.max(0, -noise * 0.5 + 0.06)
        d[idx] = Math.floor(12 + depth * 18)
        d[idx + 1] = Math.floor(75 + depth * 90)
        d[idx + 2] = Math.floor(140 + depth * 110)
        d[idx + 3] = 255
      }
    }
  }

  ctx.putImageData(imgData, 0, 0)

  // Cloud swirls
  ctx.globalAlpha = 0.09
  for (let i = 0; i < 18; i++) {
    const cx = (i * 59) % W
    const cy = ((i * 31) % (H - 100)) + 50
    const rad = 70 + (i % 5) * 20
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad)
    grad.addColorStop(0, 'rgba(230, 255, 245, 0.9)')
    grad.addColorStop(1, 'rgba(230, 255, 245, 0)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.ellipse(cx, cy, rad * 1.6, rad * 0.45, 0.3, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1.0

  const tex = new THREE.CanvasTexture(cv)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/* ─────────────────────────────────────────────────────────────────
   CYBER SHIELD WITH CIRCUITRY & WIFI LOGO TEXTURE
   Sleek, thin cyber line vectors with crisp neon glow
───────────────────────────────────────────────────────────────── */
function createCyberShieldTexture(): THREE.CanvasTexture {
  const S = 512
  const cv = document.createElement('canvas')
  cv.width = S
  cv.height = S
  const ctx = cv.getContext('2d')!
  const cx = S / 2
  const cy = S / 2 + 8

  ctx.clearRect(0, 0, S, S)

  const drawShieldOutline = (scale = 1.0) => {
    const w = 220 * scale
    const h = 275 * scale
    const top = cy - h / 2
    const bottom = cy + h / 2
    const left = cx - w / 2
    const right = cx + w / 2

    ctx.beginPath()
    ctx.moveTo(cx, top - 6)
    ctx.lineTo(right, top + h * 0.14)
    ctx.lineTo(right, top + h * 0.62)
    ctx.bezierCurveTo(right, top + h * 0.88, cx, bottom, cx, bottom)
    ctx.bezierCurveTo(cx, bottom, left, top + h * 0.88, left, top + h * 0.62)
    ctx.lineTo(left, top + h * 0.14)
    ctx.closePath()
  }

  // Very delicate soft ambient halo in Neon Blue
  drawShieldOutline(1.0)
  ctx.shadowColor = '#00e5ff'
  ctx.shadowBlur = 7
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)'
  ctx.lineWidth = 1.6
  ctx.stroke()

  // Crisp, thin primary shield outline (razor-sharp & slim neon blue)
  drawShieldOutline(1.0)
  ctx.shadowColor = '#00e5ff'
  ctx.shadowBlur = 3
  ctx.strokeStyle = '#00e5ff'
  ctx.lineWidth = 1.0
  ctx.stroke()

  // Inner secondary shield perimeter - delicate hairline in Neon Blue
  drawShieldOutline(0.85)
  ctx.shadowColor = '#00e5ff'
  ctx.shadowBlur = 2
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)'
  ctx.lineWidth = 0.7
  ctx.stroke()

  // Grid scanlines inside the shield
  ctx.shadowBlur = 0
  for (let y = cy - 95; y < cy + 100; y += 16) {
    ctx.beginPath()
    ctx.moveTo(cx - 80, y)
    ctx.lineTo(cx + 80, y)
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.035)'
    ctx.lineWidth = 0.7
    ctx.stroke()
  }

  // Cyber Circuit Traces - fine thin lines in Neon Blue
  ctx.shadowColor = '#00e5ff'
  ctx.shadowBlur = 4
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.6)'
  ctx.lineWidth = 0.85

  const circuits = [
    [[cx - 80, cy - 65], [cx - 45, cy - 65], [cx - 45, cy - 35]],
    [[cx + 80, cy - 65], [cx + 45, cy - 65], [cx + 45, cy - 35]],
    [[cx - 82, cy - 10], [cx - 55, cy - 10], [cx - 55, cy + 15]],
    [[cx + 82, cy - 10], [cx + 55, cy - 10], [cx + 55, cy + 15]],
    [[cx - 50, cy + 45], [cx - 25, cy + 45]],
    [[cx + 50, cy + 45], [cx + 25, cy + 45]],
  ]

  for (const branch of circuits) {
    ctx.beginPath()
    ctx.moveTo(branch[0][0], branch[0][1])
    for (let i = 1; i < branch.length; i++) {
      ctx.lineTo(branch[i][0], branch[i][1])
    }
    ctx.stroke()
  }

  // Circuit Terminal Nodes (compact fine dots in Neon Blue)
  ctx.fillStyle = '#00e5ff'
  ctx.shadowBlur = 6
  const nodes = [
    [cx - 80, cy - 65], [cx - 45, cy - 35],
    [cx + 80, cy - 65], [cx + 45, cy - 35],
    [cx - 82, cy - 10], [cx - 55, cy + 15],
    [cx + 82, cy - 10], [cx + 55, cy + 15],
    [cx - 50, cy + 45], [cx + 50, cy + 45],
  ]
  for (const [nx, ny] of nodes) {
    ctx.beginPath()
    ctx.arc(nx, ny, 1.8, 0, Math.PI * 2)
    ctx.fill()
  }

  // WiFi Broadcast Icon in Center - Crisp & Slim in Neon Blue
  const wifiCenterY = cy + 50
  ctx.lineCap = 'round'

  // Center emitter dot
  ctx.shadowColor = '#00e5ff'
  ctx.shadowBlur = 8
  ctx.fillStyle = '#00e5ff'
  ctx.beginPath()
  ctx.arc(cx, wifiCenterY, 4.0, 0, Math.PI * 2)
  ctx.fill()

  // 3 Concentric WiFi signal arcs - thin & sleek in Neon Blue
  const arcs = [
    { r: 28, width: 1.6, alpha: 0.95 },
    { r: 52, width: 1.3, alpha: 0.85 },
    { r: 76, width: 1.0, alpha: 0.7 },
  ]

  for (const arc of arcs) {
    ctx.shadowBlur = 5
    ctx.strokeStyle = `rgba(0, 229, 255, ${arc.alpha})`
    ctx.lineWidth = arc.width
    ctx.beginPath()
    // Radiates upward like official WiFi symbol
    ctx.arc(cx, wifiCenterY, arc.r, Math.PI + 0.45, -0.45, false)
    ctx.stroke()
  }

  const tex = new THREE.CanvasTexture(cv)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/* ─────────────────────────────────────────────────────────────────
   GLOWING POINT SPRITE TEXTURE
───────────────────────────────────────────────────────────────── */
function createNodeGlowTexture(): THREE.CanvasTexture {
  const cv = document.createElement('canvas')
  cv.width = 64
  cv.height = 64
  const ctx = cv.getContext('2d')!
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  grad.addColorStop(0, 'rgba(0, 229, 255, 1)')
  grad.addColorStop(0.35, 'rgba(0, 180, 255, 0.65)')
  grad.addColorStop(1, 'rgba(0, 60, 150, 0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 64, 64)
  const tex = new THREE.CanvasTexture(cv)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/* ═════════════════════════════════════════════════════════════════
   GLOBE HERO COMPONENT
═════════════════════════════════════════════════════════════════ */
export default function GlobeHero() {
  const mountRef = useRef<HTMLDivElement>(null)
  const [isInteracting, setIsInteracting] = useState(false)

  useEffect(() => {
    const host = mountRef.current
    if (!host) return

    // Scene & Camera
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, 1, 0.05, 100)
    camera.position.set(0, 0.1, 3.8)

    // Renderer with cinema-grade ACES tone mapping for rich, bright visuals
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setClearColor(0x000000, 0)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.3
    host.appendChild(renderer.domElement)

    // Vibrant, Photorealistic Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.15)
    scene.add(ambientLight)

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.4)
    sunLight.position.set(5, 3.5, 4.5)
    scene.add(sunLight)

    const frontFillLight = new THREE.DirectionalLight(0xe8fff6, 1.1)
    frontFillLight.position.set(0, 0.5, 4.5)
    scene.add(frontFillLight)

    const rimLight = new THREE.DirectionalLight(0x00d4ff, 1.8)
    rimLight.position.set(-5, 0.5, -3)
    scene.add(rimLight)

    // Master Globe Group (axial tilt ~23.5 degrees)
    const globePivot = new THREE.Group()
    globePivot.rotation.z = (23.4 * Math.PI) / 180
    scene.add(globePivot)

    // Earth Sphere
    const earthTex = createEarthCanvasTexture()
    const nodeTex = createNodeGlowTexture()
    const shieldTex = createCyberShieldTexture()

    const earthGeo = new THREE.SphereGeometry(1, 96, 96)
    const earthMat = new THREE.MeshPhongMaterial({
      map: earthTex,
      shininess: 32,
      specular: new THREE.Color(0x22aa66),
      emissive: new THREE.Color(0x062814),
      emissiveIntensity: 0.35,
    })

    // High-Resolution NASA Blue Marble Maps (local offline assets)
    const texLoader = new THREE.TextureLoader()

    texLoader.load('/textures/earth_atmos_2048.jpg', (t) => {
      t.colorSpace = THREE.SRGBColorSpace
      earthMat.map = t
      earthMat.needsUpdate = true
    })

    texLoader.load('/textures/earth_normal_2048.jpg', (t) => {
      earthMat.normalMap = t
      earthMat.normalScale = new THREE.Vector2(0.85, 0.85)
      earthMat.needsUpdate = true
    })

    texLoader.load('/textures/earth_specular_2048.jpg', (t) => {
      earthMat.specularMap = t
      earthMat.specular = new THREE.Color(0x33bb77)
      earthMat.shininess = 38
      earthMat.needsUpdate = true
    })

    texLoader.load('/textures/earth_lights_2048.png', (t) => {
      earthMat.emissiveMap = t
      earthMat.emissive = new THREE.Color(0xaaffcc)
      earthMat.emissiveIntensity = 0.55
      earthMat.needsUpdate = true
    })

    const earthMesh = new THREE.Mesh(earthGeo, earthMat)
    globePivot.add(earthMesh)

    // Floating 3D Cloud Layer
    const cloudGeo = new THREE.SphereGeometry(1.016, 64, 64)
    const cloudMat = new THREE.MeshPhongMaterial({
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat)
    earthMesh.add(cloudMesh)

    texLoader.load('/textures/earth_clouds_1024.png', (t) => {
      t.colorSpace = THREE.SRGBColorSpace
      cloudMat.map = t
      cloudMat.needsUpdate = true
    })

    // Lat/Lon Cyber Grid in Delicate Neon Blue
    const gridMat = new THREE.LineBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    // Parallel rings
    for (let lat = -75; lat <= 75; lat += 15) {
      const phi = (90 - lat) * (Math.PI / 180)
      const ry = Math.cos(phi) * 1.003
      const rr = Math.sin(phi) * 1.003
      const pts: THREE.Vector3[] = []
      for (let i = 0; i <= 64; i++) {
        const theta = (i / 64) * Math.PI * 2
        pts.push(new THREE.Vector3(rr * Math.cos(theta), ry, rr * Math.sin(theta)))
      }
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts)
      earthMesh.add(new THREE.Line(lineGeo, gridMat))
    }

    // Meridians
    for (let lon = 0; lon < 360; lon += 20) {
      const theta = lon * (Math.PI / 180)
      const pts: THREE.Vector3[] = []
      for (let i = 0; i <= 64; i++) {
        const phi = (i / 64) * Math.PI
        pts.push(
          new THREE.Vector3(
            1.003 * Math.sin(phi) * Math.cos(theta),
            1.003 * Math.cos(phi),
            1.003 * Math.sin(phi) * Math.sin(theta)
          )
        )
      }
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts)
      earthMesh.add(new THREE.Line(lineGeo, gridMat))
    }

    // Global Defense Hubs (City Sprites)
    const citySprites: THREE.Sprite[] = []
    for (const [lat, lon] of CITIES) {
      const spMat = new THREE.SpriteMaterial({
        map: nodeTex,
        transparent: true,
        opacity: 0.88,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      const sprite = new THREE.Sprite(spMat)
      sprite.position.copy(latLonToVec3(lat, lon, 1.012))
      sprite.scale.set(0.065, 0.065, 1)
      earthMesh.add(sprite)
      citySprites.push(sprite)
    }

    // Network Cyber Arcs in Electric Neon Blue
    const arcMat = new THREE.LineBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    for (const [a, b] of ARC_PAIRS) {
      if (a >= CITIES.length || b >= CITIES.length) continue
      const p1 = latLonToVec3(CITIES[a][0], CITIES[a][1], 1.0)
      const p2 = latLonToVec3(CITIES[b][0], CITIES[b][1], 1.0)
      const dist = p1.distanceTo(p2)
      const mid = p1.clone().add(p2).normalize().multiplyScalar(1.0 + dist * 0.28)
      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2)
      const arcGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(36))
      earthMesh.add(new THREE.Line(arcGeo, arcMat))
    }

    // Realistic Thin Neon-Blue Atmospheric Rim (Rayleigh limb scattering)
    const atmInner = new THREE.Mesh(
      new THREE.SphereGeometry(1.025, 64, 64),
      new THREE.MeshBasicMaterial({
        color: 0x00d4ff,
        side: THREE.BackSide,
        transparent: true,
        opacity: 0.38,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    )
    scene.add(atmInner)

    const atmOuter = new THREE.Mesh(
      new THREE.SphereGeometry(1.065, 64, 64),
      new THREE.MeshBasicMaterial({
        color: 0x0088ff,
        side: THREE.BackSide,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    )
    scene.add(atmOuter)

    // Ultra-Thin Neon Blue Orbital Ring around Earth
    const ringGeo = new THREE.TorusGeometry(1.34, 0.003, 16, 140)
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.36,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const ringMesh = new THREE.Mesh(ringGeo, ringMat)
    ringMesh.rotation.x = Math.PI / 2.3
    scene.add(ringMesh)

    // Holographic Cyber Shield Centered in Front of Earth
    const shieldMat = new THREE.SpriteMaterial({
      map: shieldTex,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const shieldSprite = new THREE.Sprite(shieldMat)
    shieldSprite.position.set(0, 0, 1.25)
    shieldSprite.scale.set(2.4, 2.4, 1)
    scene.add(shieldSprite)

    // Pulse Wave Rings Radiating from the Shield (delicate thin neon blue waves)
    type PulseRing = { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; offset: number }
    const pulseRings: PulseRing[] = []
    for (let i = 0; i < 3; i++) {
      const pMat = new THREE.MeshBasicMaterial({
        color: 0x00e5ff,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
      const pMesh = new THREE.Mesh(new THREE.RingGeometry(0.04, 0.048, 64), pMat)
      pMesh.position.set(0, 0, 1.25)
      scene.add(pMesh)
      pulseRings.push({ mesh: pMesh, mat: pMat, offset: (i / 3) * Math.PI * 2 })
    }

    // Deep Space Starfield
    const starCount = 200
    const starPos = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount; i++) {
      const th = Math.random() * Math.PI * 2
      const ph = Math.acos(2 * Math.random() - 1)
      const rad = 15 + Math.random() * 15
      starPos[i * 3] = rad * Math.sin(ph) * Math.cos(th)
      starPos[i * 3 + 1] = rad * Math.sin(ph) * Math.sin(th)
      starPos[i * 3 + 2] = rad * Math.cos(ph)
    }
    const starGeo = new THREE.BufferGeometry()
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
    const starMat = new THREE.PointsMaterial({
      size: 0.06,
      color: 0xb0ffda,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    scene.add(new THREE.Points(starGeo, starMat))

    // Interactive Drag / Tilt Controls
    let isDragging = false
    let prevMouseX = 0
    let prevMouseY = 0
    let velocityX = 0
    let velocityY = 0

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true
      setIsInteracting(true)
      prevMouseX = e.clientX
      prevMouseY = e.clientY
      velocityX = 0
      velocityY = 0
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return
      const dx = e.clientX - prevMouseX
      const dy = e.clientY - prevMouseY
      prevMouseX = e.clientX
      prevMouseY = e.clientY

      earthMesh.rotation.y += dx * 0.008
      globePivot.rotation.x = Math.max(-0.4, Math.min(0.4, globePivot.rotation.x + dy * 0.004))
      velocityX = dx * 0.008
      velocityY = dy * 0.004
    }

    const onPointerUp = () => {
      isDragging = false
      setIsInteracting(false)
    }

    host.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)

    // Resize Handler
    const handleResize = () => {
      const w = host.clientWidth || 460
      const h = host.clientHeight || 460
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h, false)
    }
    handleResize()
    window.addEventListener('resize', handleResize)

    // Main Render Loop with timestamp delta tracking for guaranteed auto-rotation
    let lastTimestamp = performance.now()
    let animId = 0

    const renderLoop = (currentTimestamp: number) => {
      animId = requestAnimationFrame(renderLoop)

      const dt = Math.min((currentTimestamp - lastTimestamp) / 1000, 0.05)
      lastTimestamp = currentTimestamp
      const elapsed = currentTimestamp / 1000

      // Continuous automatic rotation on Earth's tilted axis (~14s per full 360° turn)
      const AUTO_ROTATION_SPEED = 0.45 // radians per second
      if (!isDragging) {
        earthMesh.rotation.y += AUTO_ROTATION_SPEED * dt + velocityX
        cloudMesh.rotation.y += 0.05 * dt
        velocityX *= 0.92
        globePivot.rotation.x *= 0.96
      } else {
        earthMesh.rotation.y += velocityX
        cloudMesh.rotation.y += velocityX * 0.9
      }

      // Ring Orbit Slow Counter-rotation
      ringMesh.rotation.z = elapsed * 0.08

      // Atmosphere Breath (ultra-subtle to keep the rim realistic and thin)
      atmInner.scale.setScalar(1.0 + Math.sin(elapsed * 1.5) * 0.005)
      atmOuter.scale.setScalar(1.0 + Math.cos(elapsed * 1.2) * 0.004)

      // Holographic Shield Pulse
      shieldMat.opacity = 0.85 + Math.sin(elapsed * 2.2) * 0.12

      // Pulse Radiating Waves
      for (const ring of pulseRings) {
        const progress = (elapsed * 0.6 + ring.offset / (Math.PI * 2)) % 1
        const scale = 0.5 + progress * 2.8
        ring.mesh.scale.set(scale, scale, 1)
        ring.mat.opacity = (1 - progress) * 0.45 * (0.8 + Math.sin(elapsed * 3 + ring.offset) * 0.2)
      }

      // City Hubs Twinkle
      for (let i = 0; i < citySprites.length; i++) {
        const sp = citySprites[i]
        const mat = sp.material as THREE.SpriteMaterial
        mat.opacity = 0.65 + Math.sin(elapsed * 4 + i) * 0.35
      }

      // Camera Gentle Float
      camera.position.y = 0.1 + Math.sin(elapsed * 0.4) * 0.04

      renderer.render(scene, camera)
    }

    animId = requestAnimationFrame(renderLoop)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      host.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)

      earthTex.dispose()
      nodeTex.dispose()
      shieldTex.dispose()

      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).geometry) {
          ;(obj as THREE.Mesh).geometry.dispose()
        }
        const mat = (obj as THREE.Mesh).material
        if (mat) {
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
          else mat.dispose()
        }
      })

      renderer.dispose()
      if (renderer.domElement.parentNode === host) {
        host.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div className={`globe-hero-container ${isInteracting ? 'is-dragging' : ''}`}>
      {/* 3D Earth Three.js Canvas */}
      <div ref={mountRef} className="globe-canvas-host" aria-label="3D Rotating Earth with Cyber Shield" />
    </div>
  )
}
