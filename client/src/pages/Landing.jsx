import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useTheme } from '../context/ThemeContext'
import { LogoWordmark } from '../components/Logo'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

const ThemeIcon = ({ theme }) => theme === 'dark'
  ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
  : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>

const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="2"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
      </svg>
    ),
    title: 'Real-time Sync',
    tag: 'Live Co-Creation',
    desc: 'Every stroke, sticky note, and shape update broadcasts instantly for all room members.',
    detail: 'Enables seamless live collaboration across distributed teams with zero friction.'
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
      </svg>
    ),
    title: 'Auto-Saved Workspace',
    tag: 'Persistent State',
    desc: 'Your board state and drawings are saved automatically so you can pick up anytime.',
    detail: 'Preserves every visual element automatically in your dedicated cloud workspace.'
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
    ),
    title: 'Instant Sharing',
    tag: '1-Click Room Join',
    desc: 'Share a room link or code to invite teammates into your whiteboard session in seconds.',
    detail: 'Generates secure shareable links to collaborate instantly with zero setup barriers.'
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    title: 'Smart Draw',
    tag: 'Shape Snapping',
    desc: 'Sketch rough freehand shapes and watch them snap into crisp circles, rects, & lines.',
    detail: 'Analyzes stroke geometry to automatically transform rough hand sketches into clean vector diagrams.'
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    title: 'Infinite Canvas',
    tag: 'Unbounded Space',
    desc: 'Pan, zoom, organize sticky notes, and build complex system maps without layout bounds.',
    detail: 'Provides an expansive visual canvas optimized for smooth multi-element interaction.'
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: 'Team Presence',
    tag: 'Live Collaboration',
    desc: 'Create room hubs, manage member access, and co-create in shared team rooms.',
    detail: 'Designed for engineering, product, and design teams working together remotely.'
  },
]

const heroCards = [
  {
    label: 'VISUAL WORKSPACE',
    title: 'Infinite Canvas Engine',
    desc: 'Draw freely with pen tools, sticky notes, and interactive shapes.',
    highlight: false,
    route: '/dashboard',
    badge: 'UNBOUNDED'
  },
  {
    label: 'LIVE CO-CREATION',
    title: 'Real-time Team Sync',
    desc: 'Every stroke broadcasts instantly across all room members.',
    highlight: false,
    route: '/dashboard',
    badge: 'REALTIME'
  },
  {
    label: 'INSTANT ACCESS',
    title: '1-Click Room Join',
    desc: 'Share a secure room link to collaborate together instantly.',
    highlight: true,
    route: '/dashboard',
    badge: 'LINK SHARE'
  },
  {
    label: 'INTELLIGENCE',
    title: 'Smart Shape Detection',
    desc: 'Rough sketches auto-snap into clean circles, rects, lines & triangles.',
    highlight: false,
    route: '/dashboard',
    badge: 'AUTO-SNAP'
  }
]

// Production Moving Marquee Cards (Unified Purple Palette)
const marqueeCardsList = [
  { icon: '⚡', title: 'Real-Time Co-Creation', subtitle: 'Sync strokes & edits across room members', accentColor: 'var(--accent)' },
  { icon: '📐', title: 'Smart Shape Snapping', subtitle: 'Auto-converts freehand sketches to clean vectors', accentColor: 'var(--accent)' },
  { icon: '🎨', title: 'Infinite Canvas Space', subtitle: 'Pan, zoom, sticky notes & custom pen tools', accentColor: 'var(--accent)' },
  { icon: '💾', title: 'Auto-Saved Workspaces', subtitle: 'Your boards persist automatically in real-time', accentColor: 'var(--accent)' },
  { icon: '🔒', title: 'Private & Secure Rooms', subtitle: 'Room link access & protected user workspaces', accentColor: 'var(--accent)' },
  { icon: '📤', title: 'High-Res Vector Export', subtitle: 'Export drawings into crisp PNG & SVG graphics', accentColor: 'var(--accent)' },
]

// Interactive Demo Scenarios for Canvas Stage
const demoCanvasPresets = {
  architecture: {
    name: 'System Architecture',
    nodes: [
      { type: 'rect', x: 80, y: 70, w: 160, h: 90, label: 'API Gateway', color: '#A100FF' },
      { type: 'circle', x: 380, y: 115, r: 50, label: 'WebSocket Hub', color: '#3b82f6' },
      { type: 'rect', x: 570, y: 70, w: 160, h: 90, label: 'Canvas Engine', color: '#10b981' },
      { type: 'polygon', x: 380, y: 240, label: 'Redis Pub/Sub', color: '#f59e0b' },
    ],
    cursorPos: { x: 390, y: 120, name: 'Maithili', color: '#A100FF' }
  },
  flowchart: {
    name: 'Product Flowchart',
    nodes: [
      { type: 'rect', x: 100, y: 60, w: 150, h: 80, label: 'User Connects', color: '#10b981' },
      { type: 'polygon', x: 380, y: 100, label: 'Authenticated?', color: '#f59e0b' },
      { type: 'rect', x: 600, y: 60, w: 140, h: 80, label: 'Join Room', color: '#A100FF' },
      { type: 'circle', x: 380, y: 230, r: 45, label: 'Broadcast Stroke', color: '#3b82f6' },
    ],
    cursorPos: { x: 620, y: 85, name: 'Alex (Lead)', color: '#3b82f6' }
  },
  mindmap: {
    name: 'Brainstorm & Mindmap',
    nodes: [
      { type: 'circle', x: 380, y: 140, r: 65, label: 'IdeaSlate v2', color: '#A100FF' },
      { type: 'rect', x: 90, y: 80, w: 140, h: 65, label: 'Realtime Sync', color: '#3b82f6' },
      { type: 'rect', x: 90, y: 200, w: 140, h: 65, label: 'Infinite Canvas', color: '#ec4899' },
      { type: 'rect', x: 570, y: 80, w: 140, h: 65, label: 'Smart Draw', color: '#10b981' },
      { type: 'rect', x: 570, y: 200, w: 140, h: 65, label: 'Live Share', color: '#f59e0b' },
    ],
    cursorPos: { x: 400, y: 150, name: 'Sara (UX)', color: '#ec4899' }
  }
}

export default function Landing() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  
  // Interactive spotlight coordinates
  const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 })
  const [isHoveredHero, setIsHoveredHero] = useState(false)

  // Interactive Zoom stage state
  const [zoomLevel, setZoomLevel] = useState(100)
  const [activePreset, setActivePreset] = useState('architecture')
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  // Feature modal drawer detail & FAQ accordion state
  const [activeFeatureModal, setActiveFeatureModal] = useState(null)
  const [openFaqIndex, setOpenFaqIndex] = useState(null)

  // Auto-tour loop for live canvas showcase
  useEffect(() => {
    if (!isAutoPlay) return
    const interval = setInterval(() => {
      setActivePreset(prev => {
        if (prev === 'architecture') return 'flowchart'
        if (prev === 'flowchart') return 'mindmap'
        return 'architecture'
      })
    }, 4500)
    return () => clearInterval(interval)
  }, [isAutoPlay])

  // Body scroll lock when modal is open
  useEffect(() => {
    if (activeFeatureModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [activeFeatureModal])

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMouseCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
  }

  // 3D Tilt calculation for hero cards
  const [tiltState, setTiltState] = useState({ index: null, rotateX: 0, rotateY: 0 })

  const handleCardMouseMove = (e, index) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -10
    const rotateY = ((x - centerX) / centerX) * 10
    setTiltState({ index, rotateX, rotateY })
  }

  const handleCardMouseLeave = () => {
    setTiltState({ index: null, rotateX: 0, rotateY: 0 })
  }

  return (
    <div className="grid-bg" style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>

      {/* Full-width top ambient glow */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, width: '100%', height: '750px',
        background: theme === 'dark'
          ? 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(161, 0, 255, 0.22), rgba(161, 0, 255, 0.05) 55%, transparent 85%)'
          : 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(161, 0, 255, 0.08), transparent 75%)',
        pointerEvents: 'none', zIndex: 0
      }} />

      {/* Production Navbar Header */}
      <nav className="glass-panel" style={{
        height: '72px', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center'
      }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto', width: '100%', padding: '0 2.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          {/* Brand Logo */}
          <div style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
            <LogoWordmark size={30} />
          </div>

          {/* Center navigation links */}
          <div className="responsive-nav-links" style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            {[
              { name: 'Product', route: '#product' },
              { name: 'Solutions', route: '#stage' },
              { name: 'Capabilities', route: '#marquee' },
              { name: 'FAQ', route: '#faq' }
            ].map(link => (
              <a key={link.name} href={link.route} onClick={e => {
                if (link.route.startsWith('/')) {
                  e.preventDefault()
                  navigate(user ? '/dashboard' : '/login')
                }
              }} style={{
                color: 'var(--text-muted)', fontSize: '14.5px', textDecoration: 'none', fontWeight: '500', transition: 'all 0.2s'
              }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                 onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                {link.name}
              </a>
            ))}
          </div>

          {/* Right Action Controls */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <button onClick={toggleTheme} className="btn btn-ghost" style={{ padding: 0, borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }} title="Toggle Theme">
              <ThemeIcon theme={theme} />
            </button>

            {user ? (
              <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ borderRadius: '100px', padding: '10px 24px', fontSize: '14.5px' }}>
                Launch Workspace →
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button onClick={() => navigate('/login')} className="btn btn-ghost" style={{ borderRadius: '100px', padding: '9px 18px', fontSize: '14.5px' }}>
                  Sign In
                </button>
                <button onClick={() => navigate('/register')} className="btn btn-primary" style={{ borderRadius: '100px', padding: '9px 24px', fontSize: '14.5px' }}>
                  Launch Canvas →
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section with Interactive Spotlight */}
      <section 
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHoveredHero(true)}
        onMouseLeave={() => setIsHoveredHero(false)}
        className="responsive-hero-grid"
        style={{
          maxWidth: '1280px', margin: '0 auto', width: '100%',
          padding: '6.5rem 2.5rem 4rem',
          position: 'relative', zIndex: 1
        }}
      >
        {/* Left column: Accenture style bold typography */}
        <div className="animate-fade-up">
          
          {/* Accenture style status tag */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            padding: '6px 16px', borderRadius: '100px',
            background: 'var(--accent-subtle)', border: '1px solid rgba(161, 0, 255, 0.3)',
            marginBottom: '1.8rem', fontSize: '13px', fontWeight: '700', letterSpacing: '0.06em',
            color: 'var(--accent)'
          }} className="badge-shimmer">
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)',
              display: 'inline-block', position: 'relative'
            }}>
              <span style={{
                position: 'absolute', inset: '-3px', borderRadius: '50%', border: '2px solid var(--accent)',
                animation: 'pulseBeacon 2s infinite'
              }} />
            </span>
            NEXT-GEN COLLABORATIVE CANVAS
          </div>

          <h1 className="hero-title" style={{
            fontFamily: "'DM Sans', sans-serif", fontWeight: '800',
            fontSize: 'clamp(3rem, 5.8vw, 5.8rem)', lineHeight: '1.0',
            letterSpacing: '-0.04em', color: 'var(--text-primary)',
            marginBottom: '1.5rem'
          }}>
            <div>IDEAS DRAWN</div>
            <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: '0.15em' }}>
              <span>TOGETHER</span>
              <span style={{
                color: 'var(--accent)', fontWeight: '900',
                textShadow: '0 0 24px var(--accent-glow)'
              }}>&gt;</span>
            </div>
          </h1>

          <p className="hero-subtitle" style={{ fontSize: '1.2rem', color: 'var(--text-muted)', lineHeight: '1.7', maxWidth: '580px', marginBottom: '2.2rem' }}>
            An infinite visual workspace where teams brainstorm, diagram, and collaborate in real-time. Sketch smart shapes, place sticky notes, and share room links effortlessly.
          </p>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate(user ? '/dashboard' : '/register')} className="btn btn-primary" style={{ padding: '14px 34px', borderRadius: '100px', fontSize: '16px' }}>
              Start Sketching Now →
            </button>

            <a href="#stage" style={{
              display: 'inline-flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'var(--text-primary)', fontWeight: '600', fontSize: '15px', transition: 'color 0.2s'
            }}>
              Explore Interactive Stage
              <span className="caret-icon" style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '34px', height: '34px', borderRadius: '50%',
                background: 'var(--bg-secondary)', border: '1px solid var(--border-bright)', color: 'var(--accent)',
                fontWeight: '900', fontSize: '16px'
              }}>
                &gt;
              </span>
            </a>
          </div>
        </div>

        {/* Right column: Live Canvas Capabilities Widget */}
        <div className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <div className="glass-panel" style={{
            padding: '2.5rem', borderRadius: '24px', border: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>LIVE CANVAS WORKSPACE</span>
              <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                ACTIVE SYNC
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <div className="gradient-text" style={{ fontSize: '1.8rem', fontWeight: '800', lineHeight: '1.1' }}>Real-Time</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '500' }}>Live Co-Creation</div>
              </div>
              <div>
                <div className="gradient-text" style={{ fontSize: '1.8rem', fontWeight: '800', lineHeight: '1.1' }}>Infinite</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '500' }}>Unbounded Canvas</div>
              </div>
              <div>
                <div className="gradient-text" style={{ fontSize: '1.8rem', fontWeight: '800', lineHeight: '1.1' }}>Auto-Save</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '500' }}>Cloud Persistence</div>
              </div>
              <div>
                <div className="gradient-text" style={{ fontSize: '1.8rem', fontWeight: '800', lineHeight: '1.1' }}>Smart Snap</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '500' }}>Vector Geometry</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid of 4 Accenture-style Laser Cards with 3D Tilt */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', padding: '1rem 2.5rem 4rem' }}>
        <div className="responsive-cards-grid">
          {heroCards.map((card, idx) => {
            const isTilting = tiltState.index === idx
            return (
              <div
                key={idx}
                onClick={() => navigate(user ? card.route : '/register')}
                onMouseMove={(e) => handleCardMouseMove(e, idx)}
                onMouseLeave={handleCardMouseLeave}
                className="laser-card tilt-card"
                style={{
                  padding: '2.2rem 2rem 2rem',
                  borderRadius: '18px',
                  cursor: 'pointer',
                  minHeight: '220px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transform: isTilting 
                    ? `perspective(1000px) rotateX(${tiltState.rotateX}deg) rotateY(${tiltState.rotateY}deg) scale(1.03)`
                    : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
                  background: card.highlight ? 'var(--accent)' : 'var(--bg-card)',
                  border: card.highlight ? 'none' : '1px solid var(--border)',
                }}
              >
                <div>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem'
                  }}>
                    <span style={{
                      fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em',
                      color: card.highlight ? '#ffffff' : 'var(--text-muted)', opacity: card.highlight ? 0.85 : 1
                    }}>
                      {card.label}
                    </span>
                    <span style={{
                      padding: '2px 8px', borderRadius: '100px', fontSize: '10px', fontWeight: '800',
                      background: card.highlight ? 'rgba(255,255,255,0.25)' : 'var(--accent-subtle)',
                      color: card.highlight ? '#ffffff' : 'var(--accent)'
                    }}>
                      {card.badge}
                    </span>
                  </div>

                  <h3 style={{
                    fontSize: '19px', fontWeight: '700', lineHeight: '1.35',
                    color: card.highlight ? '#ffffff' : 'var(--text-primary)',
                    letterSpacing: '-0.3px', marginBottom: '0.6rem'
                  }}>
                    {card.title}
                  </h3>

                  <p style={{
                    fontSize: '13.5px', color: card.highlight ? 'rgba(255,255,255,0.9)' : 'var(--text-muted)',
                    lineHeight: '1.5'
                  }}>
                    {card.desc}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <div className="caret-icon" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '38px', height: '38px', borderRadius: '50%',
                    border: card.highlight ? '1.5px solid #ffffff' : '1.5px solid var(--border-bright)',
                    color: card.highlight ? '#ffffff' : 'var(--text-primary)',
                    background: 'transparent',
                  }}>
                    <span style={{ fontSize: '18px', fontWeight: '900' }}>&gt;</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* SECTION: Production Moving Cards Ticker */}
      <section id="marquee" style={{ padding: '4rem 0 5rem', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', position: 'relative' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2.5rem', marginBottom: '2.8rem', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '0.14em', color: 'var(--accent)', marginBottom: '8px' }}>
            BUILT FOR SEAMLESS FLOW
          </div>
          <h2 style={{ fontSize: '2.4rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.6px' }}>
            Designed For Visual Thinkers
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '6px' }}>
            Explore core capabilities integrated into your collaborative canvas
          </p>
        </div>

        {/* Marquee Track 1 (Leftward) */}
        <div className="marquee-container" style={{ marginBottom: '1.4rem' }}>
          <div className="marquee-track left">
            {[...marqueeCardsList, ...marqueeCardsList].map((card, i) => (
              <div key={i} className="glass-panel laser-card" style={{
                width: '300px', padding: '1.4rem 1.6rem', borderRadius: '16px', flexShrink: 0,
                border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px',
                background: 'var(--bg-card)'
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)'; e.currentTarget.style.borderColor = card.accentColor }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.borderColor = 'var(--border)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '18px' }}>{card.icon}</span>
                    <div style={{ fontSize: '15.5px', fontWeight: '700', color: 'var(--text-primary)' }}>{card.title}</div>
                  </div>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: card.accentColor, boxShadow: `0 0 10px ${card.accentColor}` }} />
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.45' }}>{card.subtitle}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Marquee Track 2 (Rightward) */}
        <div className="marquee-container">
          <div className="marquee-track right">
            {[...marqueeCardsList, ...marqueeCardsList].reverse().map((card, i) => (
              <div key={i} className="glass-panel laser-card" style={{
                width: '300px', padding: '1.4rem 1.6rem', borderRadius: '16px', flexShrink: 0,
                border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px',
                background: 'var(--bg-card)'
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)'; e.currentTarget.style.borderColor = card.accentColor }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.borderColor = 'var(--border)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '18px' }}>{card.icon}</span>
                    <div style={{ fontSize: '15.5px', fontWeight: '700', color: 'var(--text-primary)' }}>{card.title}</div>
                  </div>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: card.accentColor, boxShadow: `0 0 10px ${card.accentColor}` }} />
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.45' }}>{card.subtitle}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: Interactive Zooming & Pan Sandbox Stage */}
      <section id="stage" style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', padding: '6rem 2.5rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '0.12em', color: 'var(--accent)', marginBottom: '8px' }}>
              LIVE CANVAS SANDBOX
            </div>
            <h2 style={{ fontSize: '2.4rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.8px' }}>
              Zoom In & Out Interactive Stage
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '15.5px', marginTop: '6px' }}>
              Experience the smooth infinite zoom rendering engine in action
            </p>
          </div>

          {/* Preset Selector Tabs & Zoom Controls */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', background: 'var(--bg-card)', padding: '4px', borderRadius: '100px', border: '1px solid var(--border)' }}>
              {Object.keys(demoCanvasPresets).map(presetKey => (
                <button
                  key={presetKey}
                  onClick={() => { setActivePreset(presetKey); setIsAutoPlay(false); }}
                  style={{
                    padding: '8px 16px', borderRadius: '100px', border: 'none',
                    fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                    background: activePreset === presetKey ? 'var(--accent)' : 'transparent',
                    color: activePreset === presetKey ? '#ffffff' : 'var(--text-muted)',
                    transition: 'all 0.25s'
                  }}
                >
                  {demoCanvasPresets[presetKey].name}
                </button>
              ))}
            </div>

            {/* Zoom Controls */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', background: 'var(--bg-card)', padding: '4px 10px', borderRadius: '100px', border: '1px solid var(--border)' }}>
              <button
                onClick={() => setZoomLevel(prev => Math.max(prev - 25, 50))}
                className="btn btn-ghost" style={{ width: '32px', height: '32px', padding: 0, borderRadius: '50%', fontSize: '16px' }}
                title="Zoom Out"
              >-</button>
              <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)', minWidth: '46px', textAlign: 'center' }}>
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(prev + 25, 200))}
                className="btn btn-ghost" style={{ width: '32px', height: '32px', padding: 0, borderRadius: '50%', fontSize: '16px' }}
                title="Zoom In"
              >+</button>
              <button
                onClick={() => setZoomLevel(100)}
                style={{ fontSize: '11px', background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: '700', marginLeft: '4px' }}
              >Reset</button>
            </div>
          </div>
        </div>

        {/* Interactive Canvas Render Box */}
        <div style={{
          borderRadius: '24px', border: '1px solid var(--border)',
          background: 'var(--bg-card)', overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), var(--shadow-glow)',
          position: 'relative'
        }}>
          {/* Top Bar controls */}
          <div style={{
            height: '52px', background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', padding: '0 24px', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['#ff5f57','#febc2e','#28c840'].map(c => (
                <div key={c} style={{ width: '12px', height: '12px', borderRadius: '50%', background: c }} />
              ))}
            </div>

            <div style={{
              padding: '5px 18px', borderRadius: '100px', background: 'var(--bg-primary)',
              border: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-muted)',
              fontFamily: "'DM Mono', monospace", display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
              ideaslate.app/board/{activePreset} (Zoom: {zoomLevel}%)
            </div>

            <button
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              style={{
                fontSize: '12px', fontWeight: '700', border: 'none', background: 'transparent',
                color: isAutoPlay ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              {isAutoPlay ? '⏸ Pause Auto-Tour' : '▶ Play Auto-Tour'}
            </button>
          </div>

          {/* Interactive Zoomable Viewport */}
          <div style={{ padding: '3.5rem 2rem', position: 'relative', minHeight: '380px', overflow: 'hidden', background: '#020204', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            
            <div className="zoom-stage" style={{
              transform: `scale(${zoomLevel / 100})`,
              width: '800px', height: '320px', position: 'relative',
            }}>
              <svg viewBox="0 0 800 320" style={{ width: '100%', height: '100%' }} fill="none">
                {/* Dot grid */}
                {Array.from({ length: 11 }, (_, r) =>
                  Array.from({ length: 25 }, (_, c) => (
                    <circle key={`${r}-${c}`} cx={c * 32 + 16} cy={r * 28 + 14} r="1.2" fill="var(--border)" opacity="0.35" />
                  ))
                )}

                {/* Draw Preset Shapes with Zoom scale effects */}
                {demoCanvasPresets[activePreset].nodes.map((node, i) => {
                  if (node.type === 'rect') {
                    return (
                      <g key={i} className="animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                        <rect x={node.x} y={node.y} width={node.w} height={node.h} rx="12" stroke={node.color} strokeWidth="2.5" fill="rgba(161, 0, 255, 0.04)" opacity="0.9" />
                        <text x={node.x + node.w/2} y={node.y + node.h/2 + 4} textAnchor="middle" fill="#ffffff" fontSize="13" fontFamily="DM Sans" fontWeight="700">{node.label}</text>
                      </g>
                    )
                  }
                  if (node.type === 'circle') {
                    return (
                      <g key={i} className="animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                        <circle cx={node.x} cy={node.y} r={node.r} stroke={node.color} strokeWidth="2.5" fill="rgba(59, 130, 246, 0.04)" opacity="0.9" />
                        <text x={node.x} y={node.y + 4} textAnchor="middle" fill="#ffffff" fontSize="13" fontFamily="DM Sans" fontWeight="700">{node.label}</text>
                      </g>
                    )
                  }
                  if (node.type === 'polygon') {
                    return (
                      <g key={i} className="animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                        <polygon points={`${node.x},${node.y - 40} ${node.x + 60},${node.y + 35} ${node.x - 60},${node.y + 35}`} stroke={node.color} strokeWidth="2.5" fill="rgba(245, 158, 11, 0.04)" opacity="0.9" />
                        <text x={node.x} y={node.y + 12} textAnchor="middle" fill="#ffffff" fontSize="12" fontFamily="DM Sans" fontWeight="700">{node.label}</text>
                      </g>
                    )
                  }
                  return null
                })}

                {/* Animated Connecting Vector Arrows */}
                <path d="M240 115 L330 115" stroke="var(--accent)" strokeWidth="2" strokeDasharray="6 4" opacity="0.7" />
                <path d="M430 115 L570 115" stroke="var(--accent)" strokeWidth="2" strokeDasharray="6 4" opacity="0.7" />
                <path d="M380 165 L380 200" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 4" opacity="0.7" />

                {/* Live Floating Cursor Badge */}
                {(() => {
                  const cur = demoCanvasPresets[activePreset].cursorPos
                  return (
                    <g className="animate-float" transform={`translate(${cur.x}, ${cur.y})`}>
                      <path d="M0 0 L0 18 L5 14 L8 20 L11 19 L8 13 L14 13 Z" fill={cur.color} />
                      <rect x="16" y="6" width="90" height="22" rx="6" fill={cur.color} />
                      <text x="24" y="21" fill="#ffffff" fontSize="11" fontFamily="DM Sans" fontWeight="700">{cur.name}</text>
                    </g>
                  )
                })()}
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: Features Grid with Detail Modal */}
      <section id="product" style={{ padding: '4rem 2.5rem 6rem', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '0.12em', color: 'var(--accent)', marginBottom: '8px' }}>
            ENGINEERED FOR SCALE
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.8px' }}>
            Everything you need to collaborate
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '10px', fontSize: '16px' }}>
            Click any card to inspect technical implementation details
          </p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1.5rem'
        }}>
          {features.map((f, i) => (
            <div key={i}
              onClick={() => setActiveFeatureModal(f)}
              style={{
                padding: '2.2rem 2rem', background: 'var(--bg-card)',
                borderRadius: '20px', border: '1px solid var(--border)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)'
                e.currentTarget.style.borderColor = 'var(--accent)'
                e.currentTarget.style.boxShadow = 'var(--shadow-glow)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                  <div style={{
                    color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '48px', height: '48px', borderRadius: '14px', background: 'var(--accent-subtle)'
                  }}>{f.icon}</div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '4px 10px', borderRadius: '100px', border: '1px solid var(--border)' }}>
                    {f.tag}
                  </span>
                </div>

                <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  {f.title}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.65' }}>
                  {f.desc}
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: 'var(--accent)' }}>
                Inspect Specs →
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Specification Modal Drawer */}
      {activeFeatureModal && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          width: '100vw', height: '100vh', margin: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
        }} className="animate-fade-in" onClick={() => setActiveFeatureModal(null)}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-bright)',
            borderRadius: '24px', padding: '2.5rem', maxWidth: '520px', width: '100%',
            boxShadow: '0 32px 80px rgba(0,0,0,0.9), var(--shadow-glow)', position: 'relative',
            maxHeight: '90vh', overflowY: 'auto'
          }} onClick={e => e.stopPropagation()}>
            
            <button onClick={() => setActiveFeatureModal(null)} style={{
              position: 'absolute', top: '20px', right: '20px', background: 'transparent',
              border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer'
            }}>✕</button>

            <div style={{ color: 'var(--accent)', marginBottom: '16px' }}>
              {activeFeatureModal.icon}
            </div>

            <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent)', letterSpacing: '0.08em' }}>
              {activeFeatureModal.tag}
            </span>

            <h3 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)', margin: '8px 0 14px' }}>
              {activeFeatureModal.title}
            </h3>

            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              {activeFeatureModal.desc}
            </p>

            <div style={{ padding: '1rem 1.2rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: '1.6' }}>
              <strong>Architecture Spec:</strong> {activeFeatureModal.detail}
            </div>

            <button onClick={() => { setActiveFeatureModal(null); navigate(user ? '/dashboard' : '/register') }} className="btn btn-primary" style={{ width: '100%', marginTop: '1.8rem', padding: '12px', borderRadius: '100px' }}>
              Try {activeFeatureModal.title} in Workspace →
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* SECTION: FAQ Accordion Section (Production Ready) */}
      <section id="faq" style={{ maxWidth: '980px', margin: '0 auto', width: '100%', padding: '2rem 2.5rem 6rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '0.12em', color: 'var(--accent)', marginBottom: '8px' }}>
            FREQUENTLY ASKED QUESTIONS
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.8px' }}>
            Everything You Need To Know
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            {
              q: 'Is IdeaSlate free to use for teams?',
              a: 'Yes, IdeaSlate is free to use with unlimited public boards, smart shape snapping, and instant room link sharing.'
            },
            {
              q: 'How do external collaborators join a board session?',
              a: 'Simply share your room link or join code. Teammates can jump straight into the live canvas without mandatory sign-up walls.'
            },
            {
              q: 'How does smart shape recognition work?',
              a: 'Sketch a rough shape with the pen tool. IdeaSlate automatically recognizes stroke geometry and converts it into a clean vector circle, rectangle, line, or triangle.'
            },
            {
              q: 'Can I export my whiteboard diagrams?',
              a: 'Yes! You can export any board session into high-resolution PNG images or SVG vector graphics anytime.'
            }
          ].map((faq, i) => (
            <div key={i} className="glass-panel" style={{
              borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden', transition: 'all 0.25s'
            }}>
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                style={{
                  width: '100%', padding: '1.4rem 1.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '17px', fontWeight: '700',
                  cursor: 'pointer', textAlign: 'left'
                }}
              >
                <span>{faq.q}</span>
                <span style={{
                  fontSize: '20px', fontWeight: '700', color: 'var(--accent)',
                  transform: openFaqIndex === i ? 'rotate(45deg)' : 'rotate(0deg)',
                  transition: 'transform 0.25s'
                }}>+</span>
              </button>
              {openFaqIndex === i && (
                <div className="animate-fade-in" style={{ padding: '0 1.8rem 1.4rem', color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.65', borderTop: '1px dashed var(--border)' }}>
                  <div style={{ paddingTop: '1rem' }}>{faq.a}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Section */}
      <section style={{
        maxWidth: '1280px', margin: '0 auto 6rem', width: 'calc(100% - 5rem)', borderRadius: '28px',
        background: 'linear-gradient(135deg, rgba(161, 0, 255, 0.16) 0%, rgba(161, 0, 255, 0.03) 100%)',
        border: '1px solid rgba(161, 0, 255, 0.3)',
        padding: '5.5rem 2rem', textAlign: 'center',
        position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-glow)'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '2.8rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '14px', letterSpacing: '-1px' }}>
            Ready to start sketching together?
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '17px', maxWidth: '520px', margin: '0 auto 2.5rem' }}>
            IdeaSlate is free and open for collaborative teams. Launch your board workspace instantly.
          </p>
          <button onClick={() => navigate(user ? '/dashboard' : '/register')}
            className="btn btn-primary" style={{ padding: '16px 42px', fontSize: '17px', borderRadius: '100px' }}>
            Create Your Board Now →
          </button>
        </div>
      </section>

      {/* Enterprise Multi-Column Production Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)', background: '#020204',
        padding: '5rem 2.5rem 2rem', position: 'relative', overflow: 'hidden'
      }}>
        <div className="responsive-footer-grid" style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          
          {/* Brand Intro & Pitch */}
          <div>
            <LogoWordmark size={32} />
            <p style={{ color: 'var(--text-muted)', fontSize: '14.5px', lineHeight: '1.7', marginTop: '1.2rem', maxWidth: '340px' }}>
              IdeaSlate is a real-time collaborative whiteboard platform where teams draw, sketch, and brainstorm together on an infinite canvas.
            </p>

            {/* Social Icons (GitHub, LinkedIn, Twitter/X) */}
            <div style={{ display: 'flex', gap: '14px', marginTop: '1.8rem', alignItems: 'center' }}>
              <a href="https://github.com/Maithilicok" target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '42px', height: '42px', borderRadius: '50%', background: 'var(--bg-secondary)',
                border: '1px solid var(--border-bright)', color: 'var(--text-primary)', transition: 'all 0.25s'
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-bright)'; e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.transform = 'translateY(0)' }}
                title="GitHub Profile (Maithilicok)"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>

              <a href="https://www.linkedin.com/in/maithili-mahesh23/" target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '42px', height: '42px', borderRadius: '50%', background: 'var(--bg-secondary)',
                border: '1px solid var(--border-bright)', color: 'var(--text-primary)', transition: 'all 0.25s'
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-bright)'; e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.transform = 'translateY(0)' }}
                title="LinkedIn Profile (Maithili Mahesh)"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.7a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z"/>
                </svg>
              </a>

              <a href="https://github.com/Maithilicok/IdeaSlate---Collaborative-Whiteboard" target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '42px', height: '42px', borderRadius: '50%', background: 'var(--bg-secondary)',
                border: '1px solid var(--border-bright)', color: 'var(--text-primary)', transition: 'all 0.25s'
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-bright)'; e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.transform = 'translateY(0)' }}
                title="Project Source Code"
              >
                <span style={{ fontSize: '15px', fontWeight: '900', color: 'var(--accent)' }}>&lt;&gt;</span>
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 style={{ color: 'var(--accent)', fontSize: '15px', fontWeight: '700', marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Product
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {['Infinite Canvas', 'Smart Shape Snapping', 'Real-Time Sync', '1-Click Room Join', 'PNG & SVG Export'].map(item => (
                <li key={item}>
                  <a href="#product" style={{ color: 'var(--text-muted)', fontSize: '14.5px', textDecoration: 'none', transition: 'color 0.2s' }}
                     onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                     onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions Column */}
          <div>
            <h4 style={{ color: 'var(--accent)', fontSize: '15px', fontWeight: '700', marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Solutions
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {['System Architecture Mapping', 'Team Brainstorming', 'UI & UX Wireframing', 'Remote Retrospectives'].map(item => (
                <li key={item}>
                  <a href="#stage" style={{ color: 'var(--text-muted)', fontSize: '14.5px', textDecoration: 'none', transition: 'color 0.2s' }}
                     onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                     onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Creator & Links Column */}
          <div>
            <h4 style={{ color: 'var(--accent)', fontSize: '15px', fontWeight: '700', marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Creator & Links
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {[
                { name: 'Maithili Mahesh (LinkedIn)', url: 'https://www.linkedin.com/in/maithili-mahesh23/' },
                { name: 'Maithilicok (GitHub)', url: 'https://github.com/Maithilicok' },
                { name: 'IdeaSlate Repository', url: 'https://github.com/Maithilicok/IdeaSlate---Collaborative-Whiteboard' }
              ].map(item => (
                <li key={item.name}>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', fontSize: '14.5px', textDecoration: 'none', transition: 'color 0.2s' }}
                     onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                     onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div style={{ maxWidth: '1280px', margin: '4rem auto 0', paddingTop: '2rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 2 }}>
          <span style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
            Designed & Created with ❤️ by{' '}
            <a href="https://www.linkedin.com/in/maithili-mahesh23/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)', textDecoration: 'underline', fontWeight: '600' }}>
              Maithili Mahesh
            </a>{' '}
            (
            <a href="https://github.com/Maithilicok" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '700' }}>
              @Maithilicok
            </a>
            )
          </span>
          <span style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
            © 2026 IdeaSlate Inc. All rights reserved.
          </span>
        </div>

        {/* Giant Watermark Text at the bottom */}
        <div style={{
          position: 'absolute', bottom: '-40px', left: '50%', transform: 'translateX(-50%)',
          fontSize: 'clamp(5rem, 16vw, 15rem)', fontWeight: '900', color: 'rgba(255, 255, 255, 0.02)',
          letterSpacing: '-0.05em', whiteSpace: 'nowrap', pointerEvents: 'none', userSelect: 'none', zIndex: 1
        }}>
          IDEASLATE
        </div>
      </footer>
    </div>
  )
}