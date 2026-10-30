import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function HeroParticles() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = mountRef.current
    if (!host) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 200)
    camera.position.z = 30

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
    renderer.setClearColor(0x000000, 0)
    host.appendChild(renderer.domElement)

    const isMobile = window.matchMedia('(max-width: 700px)').matches
    const COUNT = isMobile ? 60 : 120

    // Create particle texture
    const makeParticleTex = () => {
      const c = document.createElement('canvas')
      c.width = 32; c.height = 32
      const ctx = c.getContext('2d')!
      const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
      g.addColorStop(0, 'rgba(0,255,136,0.95)')
      g.addColorStop(0.4, 'rgba(0,200,100,0.4)')
      g.addColorStop(1, 'rgba(0,80,40,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, 32, 32)
      return new THREE.CanvasTexture(c)
    }
    const pTex = makeParticleTex()

    // Positions
    const positions: THREE.Vector3[] = []
    const velocities: THREE.Vector3[] = []
    const geo = new THREE.BufferGeometry()
    const pos = new Float32Array(COUNT * 3)

    for (let i = 0; i < COUNT; i++) {
      const v = new THREE.Vector3(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20,
      )
      positions.push(v)
      velocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.2,
        0,
      ))
      pos[i * 3] = v.x
      pos[i * 3 + 1] = v.y
      pos[i * 3 + 2] = v.z
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const mat = new THREE.PointsMaterial({
      map: pTex,
      size: 0.55,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    })
    const points = new THREE.Points(geo, mat)
    scene.add(points)

    // Connection lines
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x00cc66,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const lineGroup = new THREE.Group()
    scene.add(lineGroup)

    const CONNECT_DIST = isMobile ? 7 : 9
    let lineUpdateTimer = 0

    const rebuildLines = () => {
      while (lineGroup.children.length) {
        const child = lineGroup.children[0] as THREE.Line
        child.geometry.dispose()
        lineGroup.remove(child)
      }
      for (let i = 0; i < COUNT; i++) {
        for (let j = i + 1; j < COUNT; j++) {
          const d = positions[i].distanceTo(positions[j])
          if (d < CONNECT_DIST) {
            const g = new THREE.BufferGeometry().setFromPoints([positions[i], positions[j]])
            const lm = lineMat.clone()
            lm.opacity = 0.18 * (1 - d / CONNECT_DIST)
            lineGroup.add(new THREE.Line(g, lm))
          }
        }
      }
    }
    rebuildLines()

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

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const delta = Math.min(clock.getDelta(), 0.05)
      const elapsed = clock.elapsedTime

      if (!reduceMotion) {
        const posArr = geo.attributes.position.array as Float32Array
        for (let i = 0; i < COUNT; i++) {
          positions[i].addScaledVector(velocities[i], delta)
          // wrap
          if (Math.abs(positions[i].x) > 26) velocities[i].x *= -1
          if (Math.abs(positions[i].y) > 16) velocities[i].y *= -1
          posArr[i * 3] = positions[i].x
          posArr[i * 3 + 1] = positions[i].y
          posArr[i * 3 + 2] = positions[i].z
        }
        geo.attributes.position.needsUpdate = true

        lineUpdateTimer += delta
        if (lineUpdateTimer > 0.25) {
          rebuildLines()
          lineUpdateTimer = 0
        }

        // slow drift rotation
        points.rotation.z = elapsed * 0.008
        lineGroup.rotation.z = elapsed * 0.008
      }

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      geo.dispose()
      mat.dispose()
      pTex.dispose()
      lineGroup.children.forEach((c) => {
        ;(c as THREE.Line).geometry.dispose()
        ;(c as THREE.Line).material instanceof THREE.Material && (c as THREE.Line).material.dispose()
      })
      renderer.dispose()
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="hero-particles" aria-hidden="true" />
}

