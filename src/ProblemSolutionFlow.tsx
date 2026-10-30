import React, { useState, useRef, useEffect } from 'react'
import { motion, useScroll, useSpring, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import {
  Shield,
  ShieldAlert,
  Users,
  Building2,
  ScanSearch,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Zap,
  ChevronRight,
  Layers,
  Lock,
} from 'lucide-react'

/* ─── Node Data Definition ───────────────────────────────────── */
export interface FlowNodeItem {
  id: number
  badgeNumber: string
  phase: string
  title: string
  subtitle: string
  text: string
  extendedText: string
  assetImg: string
  assetAlt: string
  tag: string
  threatLevel: string
  accentColor: string
  accentGlow: string
  side: 'left' | 'right' | 'center'
  stats: { label: string; value: string }
  features: string[]
}

const FLOW_NODES: FlowNodeItem[] = [
  {
    id: 1,
    badgeNumber: '01',
    phase: 'THE PROBLEM',
    title: 'The Vulnerable Campus',
    subtitle: 'INSTITUTION ENVIRONMENT',
    text: 'Educational institutions are increasingly reliant on digital platforms.',
    extendedText:
      'Modern university ecosystems span thousands of untrusted endpoints, public campus Wi-Fi grids, legacy academic portals, and decentralized department servers. This expansive surface creates prime blind spots for stealthy infiltration.',
    assetImg: '/isometric/institution.png',
    assetAlt: 'Isometric 3D Campus Institution Building Platform',
    tag: 'EXPANSIVE ATTACK SURFACE',
    threatLevel: 'PERIMETER VULNERABLE',
    accentColor: '#00e5ff',
    accentGlow: 'rgba(0, 229, 255, 0.45)',
    side: 'left',
    stats: { label: 'Campus Endpoints', value: '18,500+' },
    features: ['Decentralized servers', 'Open Wi-Fi infrastructure', 'Legacy student databases'],
  },
  {
    id: 2,
    badgeNumber: '02',
    phase: 'THE TARGETS',
    title: 'The Targets',
    subtitle: 'STUDENT & STAFF USERS',
    text: 'Students and faculty are vulnerable to phishing, fraudulent links, and digital threats.',
    extendedText:
      'Threat actors exploit academic calendar stress—tuition deadlines, grade notifications, scholarship alerts, and financial aid disbursements—deploying cloned institutional portals to harvest university SSO credentials.',
    assetImg: '/isometric/users.png',
    assetAlt: 'Isometric 3D Students and Staff Users with Digital ID Halos',
    tag: 'HUMAN FACTOR EXPLOITATION',
    threatLevel: 'CREDENTIAL EXPOSURE',
    accentColor: '#38bdf8',
    accentGlow: 'rgba(56, 189, 248, 0.45)',
    side: 'right',
    stats: { label: 'Phishing Open Rate', value: '31.4%' },
    features: ['Financial aid deepfakes', 'Urgent administrative lures', 'SSO credential harvesting'],
  },
  {
    id: 3,
    badgeNumber: '03',
    phase: 'THE INCIDENT',
    title: 'The Incident',
    subtitle: 'CYBER ATTACKS',
    text: 'Malicious actors exploit these vulnerabilities through QR scams and credential theft.',
    extendedText:
      'Attack chains strike fast: weaponized QR stickers overlaid on library desk signage, spoofed Wi-Fi portal captchas, and stealthy session token stealing trigger automated lateral movement across university subnets within minutes.',
    assetImg: '/isometric/cyber-attacks.png',
    assetAlt: 'Isometric 3D Cyber Attacks, Phishing Hook and Malicious QR Code Alert',
    tag: 'ACTIVE ATTACK IN PROGRESS',
    threatLevel: 'CRITICAL INTRUSION',
    accentColor: '#ff4d4d',
    accentGlow: 'rgba(255, 77, 77, 0.55)',
    side: 'left',
    stats: { label: 'Campus Quishing', value: '+340% YoY' },
    features: ['Library QR replacements', 'Session token hijack', 'VPN zero-day escalation'],
  },
  {
    id: 4,
    badgeNumber: '04',
    phase: 'THE INTERVENTION',
    title: 'The Intervention',
    subtitle: 'THREAT DETECTION',
    text: 'Continuous monitoring isolates suspicious messages and URLs before they cause harm.',
    extendedText:
      'SignalSafe’s heuristic neural engine parses incoming campus communications in milliseconds. Anomalous redirect hops, newly-registered domain certificates, and disguised payload scripts are quarantined before a click occurs.',
    assetImg: '/isometric/detection.png',
    assetAlt: 'Isometric 3D Threat Detection Screen and Heuristic Lens',
    tag: 'REAL-TIME HEURISTICS',
    threatLevel: 'THREAT CONTAINED',
    accentColor: '#00ff88',
    accentGlow: 'rgba(0, 255, 136, 0.45)',
    side: 'right',
    stats: { label: 'Interception Speed', value: '< 180ms' },
    features: ['Link sandbox analysis', 'Visual QR decoding & audit', 'Zero-trust payload isolation'],
  },
  {
    id: 5,
    badgeNumber: '05',
    phase: 'THE RESOLUTION',
    title: 'The Resolution',
    subtitle: 'SIGNALSAFE SOLUTION',
    text: 'A secure, user-friendly shield that assesses risk and enables rapid incident reporting.',
    extendedText:
      'Campus safety unified into one frictionless shield. Students verify any link or QR scan with single-tap ease, while SOC incident response teams receive cryptographically signed telemetry to neutralize threats institution-wide.',
    assetImg: '/isometric/solution.png',
    assetAlt: 'Isometric 3D SignalSafe Quantum Shield and Secured Server Stack',
    tag: 'QUANTUM SECURED',
    threatLevel: 'CAMPUS SHIELD ACTIVE',
    accentColor: '#00ff88',
    accentGlow: 'rgba(0, 255, 136, 0.55)',
    side: 'center',
    stats: { label: 'Incident Resolution', value: '99.98%' },
    features: ['1-Click campus dispatch', 'Evidence chain-of-custody', 'Collective campus immune network'],
  },
]

/* ─── Background Three.js Cyber Campus Constellation Canvas ─── */
function CampusEcosystemBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = containerRef.current
    if (!host) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, host.clientWidth / host.clientHeight, 0.1, 1000)
    camera.position.z = 70

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(host.clientWidth, host.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
    host.appendChild(renderer.domElement)

    // Generate node constellation
    const count = 80
    const nodeGeometry = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    const velocities: { x: number; y: number; z: number }[] = []

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 110
      const y = (Math.random() - 0.5) * 80
      const z = (Math.random() - 0.5) * 40
      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z
      velocities.push({
        x: (Math.random() - 0.5) * 0.035,
        y: (Math.random() - 0.5) * 0.035,
        z: (Math.random() - 0.5) * 0.02,
      })
    }
    nodeGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    // Canvas particle texture
    const pCanvas = document.createElement('canvas')
    pCanvas.width = 32
    pCanvas.height = 32
    const pCtx = pCanvas.getContext('2d')!
    const radG = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16)
    radG.addColorStop(0, 'rgba(0, 229, 255, 1)')
    radG.addColorStop(0.3, 'rgba(0, 255, 136, 0.6)')
    radG.addColorStop(1, 'rgba(0, 40, 60, 0)')
    pCtx.fillStyle = radG
    pCtx.fillRect(0, 0, 32, 32)
    const pTexture = new THREE.CanvasTexture(pCanvas)

    const pMaterial = new THREE.PointsMaterial({
      size: 2.2,
      map: pTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const pointsMesh = new THREE.Points(nodeGeometry, pMaterial)
    scene.add(pointsMesh)

    // Connecting lines buffer
    const maxLineConnections = count * 5
    const linePositions = new Float32Array(maxLineConnections * 6)
    const lineColors = new Float32Array(maxLineConnections * 6)
    const lineGeometry = new THREE.BufferGeometry()
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))
    lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3))

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const linesMesh = new THREE.LineSegments(lineGeometry, lineMaterial)
    scene.add(linesMesh)

    // Holographic digital globe wireframe in center background
    const globeGeo = new THREE.SphereGeometry(22, 20, 20)
    const globeWire = new THREE.WireframeGeometry(globeGeo)
    const globeMat = new THREE.LineBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
    })
    const globeLines = new THREE.LineSegments(globeWire, globeMat)
    globeLines.position.set(0, 0, -25)
    scene.add(globeLines)

    // Orbital ring
    const ringGeo = new THREE.RingGeometry(28, 28.5, 64)
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.1,
    })
    const ringMesh = new THREE.Mesh(ringGeo, ringMat)
    ringMesh.rotation.x = Math.PI / 2.3
    ringMesh.position.set(0, 0, -25)
    scene.add(ringMesh)

    let mouseX = 0
    let mouseY = 0
    const onMouseMove = (e: MouseEvent) => {
      const rect = host.getBoundingClientRect()
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 10
      mouseY = -((e.clientY - rect.top) / rect.height - 0.5) * 10
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true })

    const onResize = () => {
      if (!host) return
      camera.aspect = host.clientWidth / host.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(host.clientWidth, host.clientHeight)
    }
    window.addEventListener('resize', onResize)

    let reqId: number
    const animate = () => {
      reqId = requestAnimationFrame(animate)

      globeLines.rotation.y += 0.0015
      globeLines.rotation.x += 0.0006
      ringMesh.rotation.z += 0.001

      camera.position.x += (mouseX - camera.position.x) * 0.02
      camera.position.y += (mouseY - camera.position.y) * 0.02
      camera.lookAt(0, 0, -20)

      const posArr = nodeGeometry.attributes.position.array as Float32Array
      for (let i = 0; i < count; i++) {
        posArr[i * 3] += velocities[i].x
        posArr[i * 3 + 1] += velocities[i].y
        posArr[i * 3 + 2] += velocities[i].z

        if (posArr[i * 3] > 55 || posArr[i * 3] < -55) velocities[i].x *= -1
        if (posArr[i * 3 + 1] > 40 || posArr[i * 3 + 1] < -40) velocities[i].y *= -1
        if (posArr[i * 3 + 2] > 20 || posArr[i * 3 + 2] < -20) velocities[i].z *= -1
      }
      nodeGeometry.attributes.position.needsUpdate = true

      let lineIndex = 0
      const connectDist = 18
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          const dx = posArr[i * 3] - posArr[j * 3]
          const dy = posArr[i * 3 + 1] - posArr[j * 3 + 1]
          const dz = posArr[i * 3 + 2] - posArr[j * 3 + 2]
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

          if (dist < connectDist && lineIndex < maxLineConnections - 1) {
            const alpha = (1.0 - dist / connectDist) * 0.4
            const pIdx = lineIndex * 6
            linePositions[pIdx] = posArr[i * 3]
            linePositions[pIdx + 1] = posArr[i * 3 + 1]
            linePositions[pIdx + 2] = posArr[i * 3 + 2]
            linePositions[pIdx + 3] = posArr[j * 3]
            linePositions[pIdx + 4] = posArr[j * 3 + 1]
            linePositions[pIdx + 5] = posArr[j * 3 + 2]

            lineColors[pIdx] = 0.0
            lineColors[pIdx + 1] = 0.9 * alpha
            lineColors[pIdx + 2] = 1.0 * alpha
            lineColors[pIdx + 3] = 0.0
            lineColors[pIdx + 4] = 1.0 * alpha
            lineColors[pIdx + 5] = 0.5 * alpha

            lineIndex++
          }
        }
      }
      lineGeometry.setDrawRange(0, lineIndex * 2)
      lineGeometry.attributes.position.needsUpdate = true
      lineGeometry.attributes.color.needsUpdate = true

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      cancelAnimationFrame(reqId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      if (host.contains(renderer.domElement)) {
        host.removeChild(renderer.domElement)
      }
      renderer.dispose()
      nodeGeometry.dispose()
      pMaterial.dispose()
      lineGeometry.dispose()
      lineMaterial.dispose()
      globeGeo.dispose()
      globeMat.dispose()
      ringGeo.dispose()
      ringMat.dispose()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0,
        opacity: 0.85,
      }}
      aria-hidden="true"
    />
  )
}

/* ─── Photorealistic 3D Holographic Cyber Shield Logo Frame ─────────── */
function CyberShieldLogoFrame({
  accentColor,
  accentGlow,
  nodeNumber,
  threatLevel,
  isHovered,
  isExpanded,
  children,
}: {
  accentColor: string
  accentGlow: string
  nodeNumber: string
  threatLevel: string
  isHovered: boolean
  isExpanded: boolean
  children: React.ReactNode
}) {
  // Smooth aerodynamic curves matching the official SignalSafe Cyber Shield
  const outerPath =
    'M 200 25 C 255 35, 330 55, 365 85 L 365 260 C 365 348, 260 395, 200 412 C 140 395, 35 348, 35 260 L 35 85 C 70 55, 145 35, 200 25 Z'
  const innerPath =
    'M 200 45 C 248 54, 315 72, 345 98 L 345 250 C 345 328, 250 370, 200 386 C 150 370, 55 328, 55 250 L 55 98 C 85 72, 152 54, 200 45 Z'
  const specularPath =
    'M 200 28 C 245 37, 300 52, 335 78 L 220 280 C 180 280, 160 260, 150 240 L 200 28 Z'

  // Primary realistic neon blue / cyan palette
  const neonBlue = '#00e5ff'
  const deepCyan = '#00b4d8'

  return (
    <div className="ps-shield-stage">
      {/* Volumetric Rayleigh Ambient Energy Glow behind the Shield */}
      <div
        className="ps-shield-ambient-glow"
        style={{
          background: `radial-gradient(ellipse at center, ${accentGlow} 0%, rgba(0, 229, 255, 0.25) 45%, rgba(0,0,0,0) 70%)`,
          opacity: isHovered || isExpanded ? 0.95 : 0.55,
        }}
        aria-hidden="true"
      />

      {/* Photorealistic 3D Holographic Cyber Shield Vector */}
      <svg
        className="ps-shield-svg-frame"
        viewBox="0 0 400 435"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Razor-thin Rayleigh bloom filter */}
          <filter id={`shield-bloom-${nodeNumber}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={isHovered ? 4.5 : 2.5} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Deep cyber glass gradient fill */}
          <linearGradient id={`shield-glass-${nodeNumber}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={neonBlue} stopOpacity="0.07" />
            <stop offset="50%" stopColor={deepCyan} stopOpacity="0.02" />
            <stop offset="100%" stopColor="#020a12" stopOpacity="0.75" />
          </linearGradient>

          {/* Glass specular reflection gradient */}
          <linearGradient id={`specular-grad-${nodeNumber}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
            <stop offset="40%" stopColor={neonBlue} stopOpacity="0.05" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
          </linearGradient>

          {/* Rim light gradient for outer razor-sharp stroke */}
          <linearGradient id={`rim-grad-${nodeNumber}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.95" />
            <stop offset="45%" stopColor={accentColor} stopOpacity="0.9" />
            <stop offset="85%" stopColor="#00b4d8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#00ff88" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        {/* 1. Translucent Volumetric Cyber Glass Base Plate */}
        <path d={outerPath} fill={`url(#shield-glass-${nodeNumber})`} />

        {/* 2. Diagonal Specular Glass Reflection Shimmer */}
        <path d={specularPath} fill={`url(#specular-grad-${nodeNumber})`} />

        {/* 3. Micro-etched Cyber Grid Scanlines */}
        <g opacity="0.12">
          <line x1="70" y1="130" x2="330" y2="130" stroke={neonBlue} strokeWidth="0.7" strokeDasharray="4 3" />
          <line x1="60" y1="175" x2="340" y2="175" stroke={neonBlue} strokeWidth="0.7" strokeDasharray="4 3" />
          <line x1="60" y1="220" x2="340" y2="220" stroke={neonBlue} strokeWidth="0.7" strokeDasharray="4 3" />
          <line x1="75" y1="265" x2="325" y2="265" stroke={neonBlue} strokeWidth="0.7" strokeDasharray="4 3" />
          <line x1="105" y1="310" x2="295" y2="310" stroke={neonBlue} strokeWidth="0.7" strokeDasharray="4 3" />
        </g>

        {/* 4. Inner Secondary Hairline Refraction Edge (3D Glass Depth) */}
        <path
          d={innerPath}
          stroke={neonBlue}
          strokeWidth="0.75"
          strokeOpacity={isHovered ? '0.55' : '0.28'}
          strokeDasharray="8 5"
        />

        {/* 5. Primary Razor-Thin Outer Shield Contour with Neon Bloom */}
        <path
          d={outerPath}
          stroke={`url(#rim-grad-${nodeNumber})`}
          strokeWidth={isHovered ? '1.5' : '1.0'}
          filter={`url(#shield-bloom-${nodeNumber})`}
        />

        {/* 6. Realistic Corner Circuit Traces with Terminal Nodes */}
        <g stroke={neonBlue} strokeWidth="0.85" strokeOpacity={isHovered ? '0.85' : '0.5'}>
          {/* Shoulder telemetry branches */}
          <path d="M 35 85 L 75 85 L 95 105" fill="none" />
          <path d="M 365 85 L 325 85 L 305 105" fill="none" />
          {/* Waist telemetry branches */}
          <path d="M 35 260 L 65 260 L 80 245" fill="none" />
          <path d="M 365 260 L 335 260 L 320 245" fill="none" />
        </g>

        {/* 7. Micro Cyber Terminal Nodes (Fine Circular Points) */}
        <g fill={neonBlue}>
          <circle cx="200" cy="25" r="2.8" />
          <circle cx="35" cy="85" r="2.2" />
          <circle cx="365" cy="85" r="2.2" />
          <circle cx="35" cy="260" r="2.2" />
          <circle cx="365" cy="260" r="2.2" />
          <circle cx="200" cy="412" r="3.0" />
          <circle cx="95" cy="105" r="1.8" />
          <circle cx="305" cy="105" r="1.8" />
          <circle cx="80" cy="245" r="1.8" />
          <circle cx="320" cy="245" r="1.8" />
        </g>

        {/* 8. Signature SignalSafe Wi-Fi Arcs Radiating from Bottom Core */}
        <g stroke={neonBlue} strokeWidth="1.1" strokeOpacity={isHovered ? '0.85' : '0.45'} strokeLinecap="round">
          <path d="M 180 348 A 22 22 0 0 1 220 348" fill="none" />
          <path d="M 166 362 A 38 38 0 0 1 234 362" fill="none" />
          <path d="M 152 376 A 54 54 0 0 1 248 376" fill="none" />
          <circle cx="200" cy="334" r="2.5" fill={neonBlue} />
        </g>
      </svg>

      {/* Top Crest Badge: NODE 01 (Minimalist & Sleek) */}
      <div
        className="ps-shield-crest"
        style={{
          borderColor: 'rgba(0, 229, 255, 0.45)',
          color: '#00e5ff',
        }}
      >
        <span
          style={{
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            background: '#00e5ff',
            boxShadow: '0 0 8px #00e5ff',
          }}
        />
        <span>NODE {nodeNumber}</span>
      </div>

      {/* Floating 3D Isometric Model inside the shield */}
      <div className="ps-shield-asset-wrapper">{children}</div>

      {/* Bottom Crest Tag: Threat Level */}
      <div className="ps-shield-footer-tag">
        <span>{threatLevel}</span>
      </div>
    </div>
  )
}

/* ─── Interactive Isometric 3D Node with Tilt & Levitation ───── */
function FlowNode({
  node,
  index,
  isExpanded,
  onToggleExpand,
}: {
  node: FlowNodeItem
  index: number
  isExpanded: boolean
  onToggleExpand: () => void
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  // Motion physics values for 3D tilt
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { damping: 18, stiffness: 160 }
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [14, -14]), springConfig)
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-14, 14]), springConfig)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    mouseX.set(x)
    mouseY.set(y)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    mouseX.set(0)
    mouseY.set(0)
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const isReverse = node.side === 'right'
  const isCenter = node.side === 'center'

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{
        type: 'spring',
        stiffness: 240,
        damping: 22,
        delay: index * 0.1,
      }}
      className={`ps-node-row ${isCenter ? 'is-center' : isReverse ? 'is-reverse' : ''}`}
    >
      {/* 3D Floating Isometric Asset Container in Cyber Shield Frame */}
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onToggleExpand}
        className="ps-asset-col"
      >
        <motion.div
          style={{
            rotateX,
            rotateY,
          }}
        >
          <CyberShieldLogoFrame
            accentColor={node.accentColor}
            accentGlow={node.accentGlow}
            nodeNumber={node.badgeNumber}
            threatLevel={node.threatLevel}
            isHovered={isHovered}
            isExpanded={isExpanded}
          >
            {/* Floating Isometric Asset Image with continuous vertical float */}
            <motion.div
              animate={{
                y: isHovered ? -14 : [0, -10, 0],
              }}
              transition={{
                y: isHovered
                  ? { type: 'spring', stiffness: 300, damping: 20 }
                  : { duration: 4.5 + index * 0.3, repeat: Infinity, ease: 'easeInOut', delay: index * 0.4 },
              }}
              style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
            >
              <img
                src={node.assetImg}
                alt={node.assetAlt}
                className="ps-asset-img"
                style={{
                  filter: isHovered
                    ? `brightness(1.08) drop-shadow(0 20px 35px ${node.accentGlow})`
                    : 'drop-shadow(0 16px 26px rgba(0, 0, 0, 0.9))',
                }}
                loading="lazy"
              />
            </motion.div>
          </CyberShieldLogoFrame>
        </motion.div>

        {/* Click hint */}
        <div className="ps-click-hint">
          <span>{isExpanded ? 'Collapse info' : 'Click to inspect node'}</span>
          <ChevronRight
            size={13}
            style={{
              transform: isExpanded ? 'rotate(90deg)' : 'none',
              transition: 'transform 0.25s ease',
            }}
          />
        </div>
      </motion.div>

      {/* Sleek Glassmorphic Information Card */}
      <div className="ps-card-col">
        <div
          className={`ps-card ${isExpanded || isHovered ? 'is-expanded' : ''}`}
          style={{
            borderLeft: !isCenter && !isReverse ? `4px solid ${node.accentColor}` : undefined,
            borderRight: !isCenter && isReverse ? `4px solid ${node.accentColor}` : undefined,
          }}
        >
          {/* Header Row: Phase & Threat Meter */}
          <div className="ps-card-top">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span
                className="ps-card-phase"
                style={{
                  background: `${node.accentColor}22`,
                  color: node.accentColor,
                  border: `1px solid ${node.accentColor}55`,
                }}
              >
                {node.phase}
              </span>
              <span className="ps-card-sub">{node.subtitle}</span>
            </div>

            <div className="ps-card-stat">
              <Zap size={13} style={{ color: node.accentColor }} />
              <span style={{ color: node.accentColor }}>{node.stats.value}</span>
            </div>
          </div>

          {/* Node Title */}
          <h3 className="ps-card-h3">{node.title}</h3>

          {/* Primary Descriptive Text (always visible) */}
          <p className="ps-card-p">{node.text}</p>

          {/* Expanded Content Drawer */}
          <AnimatePresence>
            {(isExpanded || isHovered) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.32, ease: 'easeOut' }}
                style={{ overflow: 'hidden' }}
              >
                <div className="ps-card-drawer">
                  <p className="ps-card-extended">{node.extendedText}</p>

                  <span className="ps-features-title">Attack Vector & Telemetry</span>
                  <div className="ps-features-list">
                    {node.features.map((feat, fIdx) => (
                      <span key={fIdx} className="ps-feature-tag">
                        <span
                          style={{
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            background: node.accentColor,
                          }}
                        />
                        {feat}
                      </span>
                    ))}
                  </div>

                  {/* Micro SOC Telemetry Row */}
                  <div className="ps-soc-row">
                    <span>{node.stats.label}:</span>
                    <span className="ps-soc-val">{node.stats.value}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Card Footer with Action */}
          <div className="ps-card-footer">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleExpand()
              }}
              className="ps-toggle-btn"
              style={{ color: node.accentColor }}
            >
              <span>{isExpanded ? 'Show less' : 'Explore full analysis'}</span>
              <ArrowRight
                size={13}
                style={{
                  transform: isExpanded ? 'rotate(90deg)' : 'none',
                  transition: 'transform 0.25s ease',
                }}
              />
            </button>

            <span className="ps-card-secop">SIGNALSAFE SEC-OP</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Main Dedicated Interactive Problem-to-Solution Slide ──── */
export default function ProblemSolutionFlow() {
  const sectionRef = useRef<HTMLElement>(null)
  const [expandedNodeId, setExpandedNodeId] = useState<number | null>(null)

  // Track overall scroll through this dedicated slide
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end end'],
  })

  // SVG Line Drawing Animation progress
  const pathLength = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 28,
    restDelta: 0.001,
  })

  const toggleNodeExpand = (id: number) => {
    setExpandedNodeId((prev) => (prev === id ? null : id))
  }

  return (
    <section ref={sectionRef} id="problem-solution" className="ps-section">
      {/* Three.js Cinematic Campus Ecosystem Constellation Background */}
      <CampusEcosystemBackground />

      <div className="ps-container">
        {/* Section Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="ps-header"
        >
          <div className="ps-eyebrow">
            <span className="ps-eyebrow-dot" />
            END-TO-END CAMPUS THREAT JOURNEY
          </div>

          <h2 className="ps-title">
            From Vulnerability <br />
            <span className="ps-title-gradient">to Total Resolution.</span>
          </h2>

          <p className="ps-desc">
            Follow how weaponized cyber campaigns target universities, exploit everyday digital interactions, and how
            SignalSafe intervenes in real time to secure campus networks.
          </p>

          {/* Interactive Navigation Pills */}
          <div className="ps-pills">
            {FLOW_NODES.map((n) => (
              <button
                key={n.id}
                onClick={() => toggleNodeExpand(n.id)}
                className={`ps-pill-btn ${expandedNodeId === n.id ? 'is-active' : ''}`}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: n.accentColor,
                  }}
                />
                <span>
                  {n.badgeNumber}. {n.title}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Winding Vertical S-Curve Timeline Layout */}
        <div className="ps-timeline">
          {/* Animated Connecting SVG Glowing Path Line behind nodes (Desktop View) */}
          <div className="ps-svg-track hidden lg:block" aria-hidden="true">
            <svg
              style={{ width: '100%', height: '100%', overflow: 'visible' }}
              viewBox="0 0 1000 2400"
              fill="none"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="scurve-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.8" />
                  <stop offset="25%" stopColor="#38bdf8" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#ff4d4d" stopOpacity="1" />
                  <stop offset="75%" stopColor="#00ff88" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#00ff88" stopOpacity="1" />
                </linearGradient>

                <filter id="laser-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Faint Guide Track */}
              <path
                d="M 280 160 
                   C 280 360, 720 340, 720 620 
                   C 720 880, 280 860, 280 1140 
                   C 280 1420, 720 1380, 720 1660 
                   C 720 1940, 500 1920, 500 2150"
                stroke="rgba(0, 229, 255, 0.12)"
                strokeWidth="4"
                strokeDasharray="8 8"
                fill="none"
              />

              {/* Dynamic Animated Scroll-Drawn Glowing Laser Path */}
              <motion.path
                d="M 280 160 
                   C 280 360, 720 340, 720 620 
                   C 720 880, 280 860, 280 1140 
                   C 280 1420, 720 1380, 720 1660 
                   C 720 1940, 500 1920, 500 2150"
                stroke="url(#scurve-grad)"
                strokeWidth="4.5"
                fill="none"
                filter="url(#laser-glow)"
                style={{
                  pathLength,
                }}
              />
            </svg>
          </div>

          {/* 5 Distinct Floating Nodes */}
          <div>
            {FLOW_NODES.map((node, idx) => (
              <FlowNode
                key={node.id}
                node={node}
                index={idx}
                isExpanded={expandedNodeId === node.id}
                onToggleExpand={() => toggleNodeExpand(node.id)}
              />
            ))}
          </div>
        </div>

        {/* Bottom Call to Action Banner within the Slide */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="ps-cta-banner"
        >
          <div
            style={{
              position: 'absolute',
              top: '-30%',
              right: '25%',
              width: '320px',
              height: '320px',
              borderRadius: '50%',
              background: 'rgba(0, 255, 136, 0.12)',
              filter: 'blur(70px)',
              pointerEvents: 'none',
            }}
            aria-hidden="true"
          />

          <h3 className="ps-cta-h3">
            Ready to shield your campus from the next attack wave?
          </h3>
          <p className="ps-cta-p">
            Deploy SignalSafe in minutes across student dorms, administrative offices, and research lab networks.
          </p>

          <div className="ps-cta-actions">
            <a href="#scanner" className="button button-primary btn-glow">
              <span>Test Live Signal Scanner</span>
              <ArrowRight size={16} />
            </a>
            <a href="#demo" className="button button-secondary">
              <span>Request Campus Demo</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
