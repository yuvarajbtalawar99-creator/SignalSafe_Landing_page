import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/* ─── glyph texture ─────────────────────────────────────────── */
function makeGlyphTexture(glyph: '0' | '1', bright: boolean) {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, 64, 64)
  ctx.font = '700 46px ui-monospace, SFMono-Regular, Menlo, monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  if (bright) {
    ctx.shadowColor = '#00ff88'
    ctx.shadowBlur = 20
    ctx.fillStyle = '#a0ffcc'
  } else {
    ctx.shadowColor = '#00cc66'
    ctx.shadowBlur = 10
    ctx.fillStyle = glyph === '1' ? '#00e87a' : '#009944'
  }

  ctx.fillText(glyph, 32, 32)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/* ─── column-based falling rain ─────────────────────────────── */
export default function BinaryRain() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = mountRef.current
    if (!host) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 120)
    camera.position.z = 24

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setClearColor(0x050b16, 0)
    host.appendChild(renderer.domElement)

    // Textures
    const tex00 = makeGlyphTexture('0', false)
    const tex01 = makeGlyphTexture('0', true)
    const tex10 = makeGlyphTexture('1', false)
    const tex11 = makeGlyphTexture('1', true)

    const isMobile = window.matchMedia('(max-width: 700px)').matches
    const cols = isMobile ? 18 : 36
    const colsPerRow = isMobile ? 18 : 36
    const glyphsPerCol = isMobile ? 14 : 22
    const spread = isMobile ? 18 : 36
    const ySpan = 40
    const yTop = 22

    type Glyph = {
      sprite: THREE.Sprite
      col: number
      row: number
      speed: number
      baseOpacity: number
      phase: number
      isHead: boolean
      yOffset: number
    }

    const glyphs: Glyph[] = []
    const random = (a: number, b: number) => a + Math.random() * (b - a)

    for (let c = 0; c < cols; c++) {
      const xPos = -spread / 2 + (c / (colsPerRow - 1)) * spread
      const colSpeed = random(0.9, 2.8)
      const colPhase = random(0, Math.PI * 2)

      for (let r = 0; r < glyphsPerCol; r++) {
        const isHead = r === 0
        const isBright = r <= 1
        const isOne = Math.random() > 0.5

        const map = isBright
          ? isOne ? tex11 : tex01
          : isOne ? tex10 : tex00

        const material = new THREE.SpriteMaterial({
          map,
          transparent: true,
          opacity: isHead ? 0.98 : random(0.05 + (glyphsPerCol - r) * 0.022, 0.55),
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        })

        const sprite = new THREE.Sprite(material)
        const size = isHead ? random(0.52, 0.72) : random(0.28, 0.52)
        sprite.scale.set(size * 0.85, size, 1)

        const yOffset = random(0, ySpan)
        sprite.position.set(
          xPos + random(-0.35, 0.35),
          yTop - yOffset - r * 0.9,
          random(-2, -14),
        )

        scene.add(sprite)
        glyphs.push({
          sprite,
          col: c,
          row: r,
          speed: colSpeed,
          baseOpacity: material.opacity,
          phase: colPhase + r * 0.18,
          isHead,
          yOffset,
        })
      }
    }

    /* resize */
    const resize = () => {
      const w = host.clientWidth || window.innerWidth
      const h = host.clientHeight || window.innerHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h, false)
    }
    resize()
    window.addEventListener('resize', resize)

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const clock = new THREE.Clock()
    let animId = 0

    /* glyph flicker – randomly swap texture every ~1 s */
    let flickerTimer = 0

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const delta = Math.min(clock.getDelta(), 0.05)
      const elapsed = clock.elapsedTime

      if (!reduceMotion) {
        flickerTimer += delta
        const doFlicker = flickerTimer > 0.08
        if (doFlicker) flickerTimer = 0

        for (const g of glyphs) {
          g.sprite.position.y -= g.speed * delta

          // wrap: when bottom glyph passes floor, reset whole column stripe
          if (g.isHead && g.sprite.position.y < -20) {
            const colGlyphs = glyphs.filter((x) => x.col === g.col)
            const baseY = yTop + random(5, 18)
            colGlyphs.forEach((cg, idx) => {
              cg.sprite.position.y = baseY - idx * 0.9
              cg.speed = g.speed // keep same col speed
            })
          }

          const mat = g.sprite.material as THREE.SpriteMaterial

          // head pulse glow
          if (g.isHead) {
            mat.opacity = 0.85 + Math.sin(elapsed * 4 + g.phase) * 0.13
          } else {
            mat.opacity = g.baseOpacity * (0.72 + Math.sin(elapsed * 1.2 + g.phase) * 0.28)
          }

          // randomly flicker glyph (0↔1 swap)
          if (doFlicker && Math.random() < 0.012) {
            const isOne = Math.random() > 0.5
            const isBright = g.row <= 1
            mat.map = isBright
              ? isOne ? tex11 : tex01
              : isOne ? tex10 : tex00
            mat.needsUpdate = true
          }
        }
      }

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      for (const g of glyphs) g.sprite.material.dispose()
      tex00.dispose(); tex01.dispose(); tex10.dispose(); tex11.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="binary-rain" aria-hidden="true" />
}
