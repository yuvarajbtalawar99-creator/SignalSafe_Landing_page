import { useState, useEffect, useRef } from 'react'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Fingerprint,
  LockKeyhole,
  Menu,
  MessageSquareWarning,
  QrCode,
  ScanSearch,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from 'lucide-react'
import BinaryRain from './BinaryRain'
import HeroParticles from './HeroParticles'
import CyberNews from './CyberNews'
import GlobeHero from './GlobeHero'
import ProblemSolutionFlow from './ProblemSolutionFlow'

const features = [
  {
    icon: ScanSearch,
    number: '01',
    title: 'Recognize threats',
    description: 'Analyze suspicious messages, URLs, QR codes, and screenshots with clear, evidence-based risk signals.',
    tag: 'THREAT ANALYSIS',
  },
  {
    icon: ShieldCheck,
    number: '02',
    title: 'Know how to resist',
    description: 'Get practical next steps that help you pause, verify the source, and avoid unsafe clicks or payments.',
    tag: 'SAFETY GUIDANCE',
  },
  {
    icon: MessageSquareWarning,
    number: '03',
    title: 'Report with confidence',
    description: 'Send an incident to authorized campus personnel and follow its status from submission to resolution.',
    tag: 'INCIDENT RESPONSE',
  },
]

const steps = [
  { n: '01', title: 'Check it', text: 'Paste a message, inspect a link, or upload a QR screenshot.' },
  { n: '02', title: 'Understand it', text: 'See the risk indicators, limitations, and recommended action.' },
  { n: '03', title: 'Take action', text: 'Stay safe or submit a report to your campus response team.' },
]

/* ── Magnetic card hook ─────────────────────────────────────── */
function useMagneticHover(strength = 12) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) / (rect.width / 2)
      const dy = (e.clientY - cy) / (rect.height / 2)
      el.style.transform = `perspective(600px) rotateX(${-dy * 6}deg) rotateY(${dx * 6}deg) translateY(-4px)`
    }
    const onLeave = () => {
      el.style.transform = ''
    }
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [strength])

  return ref
}

/* ── Scroll-reveal hook ─────────────────────────────────────── */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]')
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            obs.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.13, rootMargin: '0px 0px -40px 0px' }
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

/* ── Feature card with tilt ─────────────────────────────────── */
function FeatureCard({ feature }: { feature: typeof features[number] }) {
  const ref = useMagneticHover()
  const Icon = feature.icon
  return (
    <article
      className="feature-card"
      ref={ref as React.RefObject<HTMLElement>}
      data-reveal
    >
      <div className="feature-card-glow" />
      <div className="feature-top">
        <span className="feature-icon"><Icon size={21} /></span>
        <span className="feature-number">{feature.number}</span>
      </div>
      <span className="feature-tag">{feature.tag}</span>
      <h3>{feature.title}</h3>
      <p>{feature.description}</p>
      <a href="#how-it-works" className="text-link">
        See how it works <ArrowUpRight size={15} />
      </a>
    </article>
  )
}

/* ── Main App ───────────────────────────────────────────────── */
function App() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [demoInput, setDemoInput] = useState('')
  const [demoResult, setDemoResult] = useState(false)
  const [headerScrolled, setHeaderScrolled] = useState(false)

  useScrollReveal()

  useEffect(() => {
    const onScroll = () => setHeaderScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const runDemo = () => {
    if (demoInput.trim()) setDemoResult(true)
  }
  const closeMobile = () => setMobileOpen(false)

  return (
    <main>
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <div className="ambient ambient-three" aria-hidden="true" />

      {/* ── Header ─────────────────────────────────────────── */}
      <header className={`site-header ${headerScrolled ? 'header-scrolled' : ''}`}>
        <a className="brand" href="#home" aria-label="SignalSafe Campus home" onClick={closeMobile}>
          <span className="brand-mark"><Shield size={21} strokeWidth={1.8} /></span>
          <span className="brand-name">signal<span>safe</span><small>CAMPUS SECURITY</small></span>
        </a>

        <button
          className="mobile-toggle"
          aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav className={`nav-links ${mobileOpen ? 'nav-open' : ''}`} aria-label="Main navigation">
          <a href="#problem-solution" onClick={closeMobile}>Problem to Solution</a>
          <a href="#platform" onClick={closeMobile}>Platform</a>
          <a href="#how-it-works" onClick={closeMobile}>How it works</a>
          <a href="#news" onClick={closeMobile}>Threat News</a>
          <a href="#safety" onClick={closeMobile}>Safety principles</a>
          <a href="#faq" onClick={closeMobile}>FAQ</a>
          <a className="nav-cta" href="#scanner" onClick={closeMobile}>
            Try the demo <ArrowUpRight size={15} />
          </a>
        </nav>
      </header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="hero" id="home">
        <BinaryRain />
        <HeroParticles />
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-content">
          <div className="eyebrow">
            <span className="live-dot" /> CAMPUS DIGITAL SAFETY, REIMAGINED
          </div>
          <h1>
            Your digital world.<br />
            <span className="headline-accent">A safer campus.</span>
          </h1>
          <p className="hero-copy">
            Spot suspicious signals before they become serious threats. SignalSafe helps your campus recognize risks, make safer decisions, and report incidents with confidence.
          </p>
          <div className="hero-actions">
            <a href="#scanner" className="button button-primary btn-glow">
              Check a threat <ArrowRight size={17} />
            </a>
            <a href="#platform" className="button button-secondary">
              Explore the platform <ArrowDownRight size={17} />
            </a>
          </div>
          <div className="hero-proof">
            <div className="proof-icon"><LockKeyhole size={16} /></div>
            <span>
              <strong>Privacy-minded by design</strong>
              <small>Clear signals. Safer choices. Human review.</small>
            </span>
          </div>
        </div>

        {/* 3D Rotating Earth with Cyber Shield Hero */}
        <GlobeHero />

        <div className="hero-bottom">
          <span><span className="scroll-line" /> SCROLL TO EXPLORE</span>
          <span className="hero-bottom-right">RECOGNIZE <i /> RESIST <i /> REPORT</span>
        </div>
      </section>

      {/* ── Trust strip ─────────────────────────────────────── */}
      <section className="trust-strip" aria-label="Product principles">
        <div data-reveal><ShieldCheck size={18} /><span>Explainable risk signals</span></div>
        <div data-reveal><LockKeyhole size={18} /><span>Privacy-aware reporting</span></div>
        <div data-reveal><Fingerprint size={18} /><span>Human-led resolution</span></div>
        <div data-reveal><CircleHelp size={18} /><span>Honest about uncertainty</span></div>
      </section>

      {/* ── Dedicated Problem-to-Solution Flow Slide ────────── */}
      <ProblemSolutionFlow />

      {/* ── Platform / Features ─────────────────────────────── */}
      <section className="section platform-section" id="platform">
        <div className="section-heading" data-reveal>
          <div>
            <div className="eyebrow section-eyebrow">ONE PLATFORM. THREE MOVES.</div>
            <h2>Security that moves<br /><span className="muted-heading">with your campus.</span></h2>
          </div>
          <p>From the first suspicious message to a reviewed incident, SignalSafe connects awareness with action—without making security feel complicated.</p>
        </div>

        <div className="feature-grid">
          {features.map((feature) => <FeatureCard key={feature.number} feature={feature} />)}
        </div>
      </section>

      {/* ── Scanner demo ────────────────────────────────────── */}
      <section className="scanner-section" id="scanner">
        <div className="scanner-glow" aria-hidden="true" />
        <div className="scanner-copy" data-reveal>
          <div className="eyebrow section-eyebrow"><span className="live-dot" /> SIGNAL CHECK</div>
          <h2>That message feels<br /><span className="headline-accent">a little off?</span></h2>
          <p>Pause before you click. Use this interactive preview to see how a safety check can guide a better decision.</p>
          <div className="scanner-note"><ShieldAlert size={18} /><span>This landing-page preview is illustrative. It does not contact a live threat-detection service.</span></div>
        </div>
        <div className="scanner-panel" data-reveal>
          <div className="panel-header">
            <div className="panel-title"><span className="panel-dot" /> SIGNALSAFE / QUICK CHECK</div>
            <span className="panel-status">PREVIEW MODE</span>
          </div>
          <label htmlFor="signal-input">Paste a suspicious message or URL</label>
          <textarea
            id="signal-input"
            value={demoInput}
            onChange={(e) => { setDemoInput(e.target.value); setDemoResult(false) }}
            placeholder="Example: Your campus account will be suspended. Verify immediately..."
            rows={4}
          />
          <button
            className="button button-primary scanner-submit btn-glow"
            onClick={runDemo}
            disabled={!demoInput.trim()}
          >
            Review this signal <ArrowRight size={16} />
          </button>
          {demoResult && (
            <div className="preview-result" role="status" aria-live="polite">
              <div className="preview-result-heading"><CheckCircle2 size={18} /><strong>Preview received</strong></div>
              <p>This prototype has not analyzed the content. In the connected product, the backend would inspect indicators and return evidence-based guidance.</p>
              <span>Next step: verify the sender through a trusted campus channel.</span>
            </div>
          )}
          <div className="panel-footer"><LockKeyhole size={13} /> Keep passwords, OTPs, and private student data out of test inputs.</div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────── */}
      <section className="section process-section" id="how-it-works">
        <div className="center-heading" data-reveal>
          <div className="eyebrow section-eyebrow">CLEAR FROM START TO FINISH</div>
          <h2>From uncertainty<br /><span className="muted-heading">to a safer next step.</span></h2>
        </div>
        <div className="process-grid">
          {steps.map((step, index) => (
            <div className="process-step" key={step.n} data-reveal style={{ transitionDelay: `${index * 0.12}s` }}>
              <div className="process-step-top">
                <span>{step.n}</span>
                {index < steps.length - 1 && <div className="process-connector" />}
              </div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Cyber Threat News ───────────────────────────────── */}
      <CyberNews />

      {/* ── Safety principles ───────────────────────────────── */}
      <section className="safety-section" id="safety">
        <div className="safety-visual" data-reveal>
          <div className="safety-ring ring-one" />
          <div className="safety-ring ring-two" />
          <div className="safety-shield"><ShieldCheck size={60} strokeWidth={1.1} /></div>
          <span className="safety-chip chip-one"><CheckCircle2 size={14} /> Evidence-led</span>
          <span className="safety-chip chip-two"><LockKeyhole size={14} /> Access controlled</span>
          <span className="safety-chip chip-three"><Fingerprint size={14} /> Human reviewed</span>
        </div>
        <div className="safety-copy" data-reveal>
          <div className="eyebrow section-eyebrow">BUILT FOR TRUST</div>
          <h2>Security should protect<br /><span className="muted-heading">people, not expose them.</span></h2>
          <p>Campus incidents can involve sensitive messages, financial details, or personal experiences. SignalSafe is designed around careful access, understandable decisions, and responsible follow-up.</p>
          <ul className="safety-list">
            <li><CheckCircle2 size={18} /><span><strong>Access with purpose</strong><small>Reports are intended for authorized responders—not public dashboards.</small></span></li>
            <li><CheckCircle2 size={18} /><span><strong>Explain, don't overclaim</strong><small>Indicators are evidence, not automatic proof of wrongdoing.</small></span></li>
            <li><CheckCircle2 size={18} /><span><strong>Keep humans involved</strong><small>Sensitive cases require careful review and appropriate escalation.</small></span></li>
          </ul>
        </div>
      </section>

      {/* ── Closing CTA ─────────────────────────────────────── */}
      <section className="closing-cta">
        <div className="closing-glow" aria-hidden="true" />
        <div className="closing-icon"><Sparkles size={24} /></div>
        <div className="eyebrow section-eyebrow">A SAFER DIGITAL CAMPUS STARTS HERE</div>
        <h2>Pause. Verify. <span className="headline-accent">Move safely.</span></h2>
        <p>Make digital safety a shared campus habit—one clear signal at a time.</p>
        <a className="button button-primary btn-glow" href="#scanner">
          Explore the signal check <ArrowRight size={17} />
        </a>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <section className="faq-section section" id="faq">
        <div className="faq-intro" data-reveal>
          <div className="eyebrow section-eyebrow">GOOD TO KNOW</div>
          <h2>Questions,<br /><span className="muted-heading">answered clearly.</span></h2>
        </div>
        <div className="faq-list">
          {[
            { q: 'Does a high-risk result prove something is a scam?', a: 'No. A risk result is an assessment based on available indicators. Verify sensitive requests independently and seek human review when needed.' },
            { q: 'Can I report something that the scanner misses?', a: 'Yes. The intended platform supports direct incident reporting even when an automated assessment is inconclusive.' },
            { q: 'Does this landing-page demo scan real threats?', a: 'No. The interactive scanner is a UI preview until it is connected to your verified FastAPI analysis endpoints.' },
          ].map(({ q, a }) => (
            <details key={q} data-reveal>
              <summary>{q}<ChevronDown size={18} /></summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="site-footer">
        <a className="brand footer-brand" href="#home">
          <span className="brand-mark"><Shield size={19} /></span>
          <span className="brand-name">signal<span>safe</span><small>CAMPUS SECURITY</small></span>
        </a>
        <p>Designed for a more aware, resilient campus community.</p>
        <div className="footer-right">
          <span>RECOGNIZE.</span><span>RESIST.</span><span>REPORT.</span>
          <span className="footer-divider" />
          <span>© 2026 SIGNALSAFE</span>
        </div>
      </footer>
    </main>
  )
}

export default App
