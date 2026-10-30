import React, { useState, useRef, useEffect } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  Calendar,
  Newspaper,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

interface NewsEdition {
  id: number
  vol: string
  date: string
  badge: string
  severity: 'CRITICAL' | 'HIGH'
  headline: string
  subhead: string
  threatName: string
  impact: string
  vector: string
  image: string
  alt: string
  tagColor: string
}

const EDITIONS: NewsEdition[] = [
  {
    id: 1,
    vol: 'VOL. XLVII · NO. 211',
    date: 'OCT 28, 2026',
    badge: 'CRITICAL RANSOMWARE',
    severity: 'CRITICAL',
    headline: 'Ransomware Gang Targets 47 Universities Across North America',
    subhead: 'A coordinated LockBit 4.0 campaign encrypts student records and research databases, demanding $2.4M ransom.',
    threatName: 'LockBit 4.0 Campaign',
    impact: '47 Universities Nationwide',
    vector: 'Unpatched VPN Gateways',
    image: '/newspaper-3d-1.png',
    alt: 'The Campus Security Times - Ransomware Gang Targets 47 Universities Across North America',
    tagColor: '#ff4d4d',
  },
  {
    id: 2,
    vol: 'VOL. XLVII · NO. 209',
    date: 'OCT 22, 2026',
    badge: 'AI-GENERATED PHISHING',
    severity: 'HIGH',
    headline: 'AI-Powered Phishing Kits Impersonate Campus Financial Aid Portals',
    subhead: 'Students at 120+ colleges targeted by deepfake email campaigns cloning official financial aid systems.',
    threatName: 'Deepfake Financial Aid SSO',
    impact: '120+ Colleges Impacted',
    vector: 'GPT-Tailored Institutional Lures',
    image: '/newspaper-3d-2.png',
    alt: 'The Campus Security Times - AI-Powered Phishing Kits Impersonate Campus Financial Aid Portals',
    tagColor: '#ff9500',
  },
  {
    id: 3,
    vol: 'VOL. XLVII · NO. 205',
    date: 'OCT 15, 2026',
    badge: 'DATA BREACH ZERO-DAY',
    severity: 'CRITICAL',
    headline: 'Student Data of 3.8 Million Exposed in LMS Zero-Day Breach',
    subhead: 'Zero-day vulnerability in widely-used LMS platform leaks student grades, IDs, and confidential health records.',
    threatName: 'LMS Remote Code Execution',
    impact: '3.8M Student Records Exposed',
    vector: 'Unauthenticated API SQLi',
    image: '/newspaper-3d-3.png',
    alt: 'The Campus Security Times - Student Data of 3.8 Million Exposed in Learning Management System Zero-Day',
    tagColor: '#ff4d4d',
  },
  {
    id: 4,
    vol: 'VOL. XLVII · NO. 202',
    date: 'OCT 10, 2026',
    badge: 'QUISHING FRAUD SURGE',
    severity: 'HIGH',
    headline: 'Malicious QR Code Scams Surge 340% Across Campuses Nationwide',
    subhead: 'Counterfeit QR stickers pasted over cafeteria menus, dorm posters, and library desks hijack student sessions.',
    threatName: 'Campus Quishing Campaign',
    impact: 'Surge of +340% Nationwide',
    vector: 'Counterfeit Physical QR Stickers',
    image: '/newspaper-3d-4.png',
    alt: 'The Campus Security Times - Malicious QR Code Scams Surge 340% Across Campuses Nationwide',
    tagColor: '#ff9500',
  },
]

export default function CyberNews() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [tilt, setTilt] = useState({ x: 0, y: 0, scale: 1 })
  const [isHovered, setIsHovered] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const paperRef = useRef<HTMLDivElement>(null)

  const currentStory = EDITIONS[currentIndex]

  const goToNext = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex((prev) => (prev + 1) % EDITIONS.length)
    setTimeout(() => setIsTransitioning(false), 300)
  }

  const goToPrev = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex((prev) => (prev - 1 + EDITIONS.length) % EDITIONS.length)
    setTimeout(() => setIsTransitioning(false), 300)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToNext()
      if (e.key === 'ArrowLeft') goToPrev()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isTransitioning])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = paperRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    setTilt({
      x: -y * 0.022,
      y: x * 0.022,
      scale: 1.02,
    })
  }

  const handleMouseEnter = () => setIsHovered(true)

  const handleMouseLeave = () => {
    setIsHovered(false)
    setTilt({ x: 0, y: 0, scale: 1 })
  }

  return (
    <section className="news-section section" id="news">
      <div className="news-heading" data-reveal>
        <div className="eyebrow section-eyebrow">
          <span className="live-dot news-live-dot" />
          LIVE THREAT INTELLIGENCE — HIGHER EDUCATION EDITION
        </div>
        <h2>
          Latest Cyber Threats<br />
          <span className="muted-heading">targeting campuses.</span>
        </h2>
        <p>
          Verified incident dispatch from campus networks — actual threat bulletin on active ransomware campaigns, AI phishing, zero-day data leaks, and physical QR scams impacting universities worldwide.
        </p>

        {/* Edition Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          {EDITIONS.map((ed, idx) => (
            <button
              key={ed.id}
              onClick={() => {
                if (idx !== currentIndex) {
                  setIsTransitioning(true)
                  setCurrentIndex(idx)
                  setTimeout(() => setIsTransitioning(false), 300)
                }
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all border flex items-center gap-2 ${
                idx === currentIndex
                  ? 'bg-[#00ff88]/20 border-[#00ff88] text-[#00ff88] shadow-[0_0_15px_rgba(0,255,136,0.3)]'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
              }`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: ed.tagColor }}
              />
              <span>EDITION {idx + 1}</span>
              <span className="text-[10px] opacity-70">({ed.date})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="realistic-newspaper-stage" data-reveal>
        {/* Ambient cyber spotlight behind the paper */}
        <div className="newspaper-spotlight" aria-hidden="true" />

        {/* Carousel Navigation Arrow - Left */}
        <button
          onClick={goToPrev}
          aria-label="Previous newspaper edition"
          className="newspaper-arrow arrow-left"
        >
          <ChevronLeft size={22} />
        </button>

        {/* Carousel Navigation Arrow - Right */}
        <button
          onClick={goToNext}
          aria-label="Next newspaper edition"
          className="newspaper-arrow arrow-right"
        >
          <ChevronRight size={22} />
        </button>

        {/* 3D Physical Newspaper Display */}
        <div
          ref={paperRef}
          className={`newspaper-3d-wrap ${isHovered ? 'is-hovered' : ''} ${
            isTransitioning ? 'opacity-80 scale-95' : 'opacity-100 scale-100'
          }`}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: `perspective(1100px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${tilt.scale})`,
            transition: isTransitioning
              ? 'opacity 0.25s ease, transform 0.25s ease'
              : 'transform 0.15s ease-out',
          }}
        >
          {/* Natural contact drop-shadow under the physical paper folds */}
          <div className="newspaper-contact-shadow" aria-hidden="true" />

          {/* Authentic Photorealistic 3D Newspaper Image */}
          <img
            src={currentStory.image}
            alt={currentStory.alt}
            key={currentStory.id}
            className="newspaper-3d-img transition-opacity duration-300"
            loading="lazy"
          />

          {/* Interactive lighting glare reflection on hover */}
          <div className="newspaper-glare" aria-hidden="true" />
        </div>

        {/* Dispatch Telemetry & Meta Details */}
        <div className="newspaper-caption-hud">
          <div className="hud-pill">
            <span
              className="live-dot"
              style={{
                background: currentStory.tagColor,
                boxShadow: `0 0 10px ${currentStory.tagColor}`,
              }}
            />
            <span className="hud-tag" style={{ color: currentStory.tagColor }}>
              {currentStory.badge}
            </span>
            <span className="hud-divider">|</span>
            <span className="hud-source">
              THE CAMPUS SECURITY TIMES · {currentStory.vol}
            </span>
          </div>

          <div className="hud-meta">
            <span className="hud-meta-item">
              <strong>THREAT:</strong> {currentStory.threatName}
            </span>
            <span className="hud-sep">•</span>
            <span className="hud-meta-item">
              <strong>IMPACT:</strong> {currentStory.impact}
            </span>
            <span className="hud-sep">•</span>
            <span className="hud-meta-item">
              <strong>VECTOR:</strong> {currentStory.vector}
            </span>
            <span className="hud-sep">•</span>
            <span className="hud-meta-item">
              <strong>DATE:</strong> {currentStory.date}
            </span>
          </div>

          {/* Carousel Pagination Dots */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {EDITIONS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`transition-all rounded-full ${
                  i === currentIndex
                    ? 'w-7 h-2 bg-[#00ff88] shadow-[0_0_8px_#00ff88]'
                    : 'w-2 h-2 bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>

          <div className="hud-action-row">
            <a href="#scanner" className="text-link">
              Run this signal through our scanner <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
