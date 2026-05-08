import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useTheme } from '../context/ThemeContext'
import { Logo, LogoWordmark } from '../components/Logo'

const ThemeIcon = ({ theme }) => theme === 'dark'
  ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
  : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="2"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
      </svg>
    ),
    title: 'Real-time sync',
    desc: 'Every stroke appears instantly for every collaborator — zero lag, zero friction.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
      </svg>
    ),
    title: 'Auto-saved boards',
    desc: 'Your work is preserved automatically. Pick up exactly where you left off.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
    ),
    title: 'Instant sharing',
    desc: 'Share a link and anyone can join your board in one click — no account needed to view.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    title: 'Smart draw',
    desc: 'Sketch a shape — it snaps to a perfect circle, rectangle, triangle or line automatically.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    title: 'Infinite canvas',
    desc: 'No boundaries. Zoom, pan, and draw across an endless workspace.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: 'Team-ready',
    desc: 'Built for teams. Invite collaborators and work together in shared rooms.',
  },
]

export default function Landing() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="grid-bg" style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>

      {/* Navbar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2.5rem', height: '62px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-secondary)',
        position: 'sticky', top: 0, zIndex: 100,
        backdropFilter: 'blur(8px)',
      }}>
        <LogoWordmark size={30} />
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={toggleTheme} className="btn btn-ghost" style={{ padding: '7px 11px' }}>
            <ThemeIcon theme={theme} />
          </button>
          {user ? (
            <>
              <button onClick={() => navigate('/dashboard')} className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'var(--accent-subtle)', border: '1.5px solid var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--accent)', fontWeight: '700', fontSize: '12px', flexShrink: 0,
                }}>
                  {(user.name || '?').charAt(0).toUpperCase()}
                </div>
                {user.name}
              </button>
              <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
                Go to dashboard →
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="btn btn-ghost">Log in</button>
              <button onClick={() => navigate('/register')} className="btn btn-primary">Sign up free</button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', padding: '7rem 2rem 5rem', gap: '1.5rem',
      }}>
        {/* Badge */}
        <div className="animate-fade-up" style={{
          display: 'inline-flex', alignItems: 'center', gap: '7px',
          padding: '5px 14px 5px 10px', borderRadius: '100px',
          background: 'var(--accent-subtle)', border: '1px solid var(--border-bright)',
          fontSize: '13px', color: 'var(--accent)', fontWeight: '500',
          animation: 'fadeUp 0.5s ease both',
        }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', animation: 'pulse-glow 2s ease infinite' }} />
          Live collaboration — try it free
        </div>

        {/* Heading */}
        <h1 className="animate-fade-up" style={{
          fontSize: 'clamp(2.6rem, 6vw, 4.2rem)',
          fontWeight: '700', lineHeight: '1.15',
          color: 'var(--text-primary)',
          maxWidth: '780px',
          animationDelay: '0.1s',
          letterSpacing: '-1px',
        }}>
          Your team's ideas,<br/>
          on an <span style={{
            color: 'var(--accent)',
            position: 'relative',
          }}>infinite canvas</span>
        </h1>

        <p className="animate-fade-up" style={{
          fontSize: '1.15rem', color: 'var(--text-muted)',
          maxWidth: '520px', lineHeight: '1.75',
          animationDelay: '0.2s',
        }}>
          Draw, sketch, and brainstorm together in real time.
          Smart shapes, live sync, and zero setup required.
        </p>

        <div className="animate-fade-up" style={{ display: 'flex', gap: '12px', marginTop: '0.5rem', animationDelay: '0.3s' }}>
          <button onClick={() => navigate(user ? '/dashboard' : '/register')}
            className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '15px' }}>
            Start for free →
          </button>
          {!user && (
            <button onClick={() => navigate('/login')}
              className="btn btn-ghost" style={{ padding: '12px 24px', fontSize: '15px' }}>
              Log in
            </button>
          )}
        </div>

        {/* Canvas preview */}
        <div className="animate-fade-up" style={{
          marginTop: '3.5rem', width: '100%', maxWidth: '860px',
          borderRadius: '16px', border: '1px solid var(--border)',
          background: 'var(--bg-tertiary)', overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4), 0 0 0 1px var(--border)',
          animationDelay: '0.4s',
        }}>
          
          <div style={{
            height: '44px', background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', padding: '0 16px', gap: '8px',
          }}>
            {['#ff5f57','#febc2e','#28c840'].map(c => (
              <div key={c} style={{ width: '11px', height: '11px', borderRadius: '50%', background: c }} />
            ))}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <div style={{
                padding: '3px 14px', borderRadius: '6px', background: 'var(--bg-primary)',
                border: '1px solid var(--border)', fontSize: '11px', color: 'var(--text-muted)',
                fontFamily: "'DM Mono', monospace",
              }}>ideaslate.app/board/...</div>
            </div>
          </div>
          {/* Canvas illustration */}
          <div style={{ padding: '2rem 2.5rem 2.5rem', position: 'relative' }}>
            <svg viewBox="0 0 800 300" style={{ width: '100%' }} fill="none">
              {/* Grid dots */}
              {Array.from({ length: 12 }, (_, row) =>
                Array.from({ length: 28 }, (_, col) => (
                  <circle key={`${row}-${col}`} cx={col * 30 + 15} cy={row * 26 + 13} r="1.2" fill="var(--border)" opacity="0.5" />
                ))
              )}
              {/* Drawings */}
              <rect x="60" y="60" width="160" height="110" rx="4" stroke="var(--accent)" strokeWidth="2.2" fill="none" opacity="0.85"/>
              <circle cx="550" cy="130" r="72" stroke="var(--accent)" strokeWidth="2.2" fill="none" opacity="0.7"/>
              <polygon points="280,50 390,200 170,200" stroke="var(--accent)" strokeWidth="2.2" fill="none" opacity="0.75"/>
              <line x1="430" y1="55" x2="630" y2="55" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" opacity="0.65"/>
              <path d="M60 220 C120 180 200 260 280 210 C360 160 420 240 500 200" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5"/>
              {/* Text label */}
              <rect x="62" y="82" width="80" height="16" rx="3" fill="var(--accent)" opacity="0.15"/>
              <text x="70" y="94" fill="var(--accent)" fontSize="10" fontFamily="DM Mono" opacity="0.7">Board title</text>
              {/* Cursor */}
              <g transform="translate(395,170)" opacity="0.9">
                <path d="M0 0 L0 18 L5 14 L8 20 L11 19 L8 13 L14 13 Z" fill="var(--accent)" />
                <rect x="16" y="6" width="52" height="16" rx="4" fill="var(--accent)" opacity="0.9"/>
                <text x="20" y="18" fill="#000" fontSize="9" fontFamily="DM Sans" fontWeight="600">Maithili</text>
              </g>
            </svg>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section style={{ padding: '2rem 2.5rem 6rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Everything you need to collaborate
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '15px' }}>
            A complete visual workspace — no plugins, no config.
          </p>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1px', background: 'var(--border)', borderRadius: '14px', overflow: 'hidden',
          border: '1px solid var(--border)',
        }}>
          {features.map((f, i) => (
            <div key={i} style={{
              padding: '1.8rem', background: 'var(--bg-secondary)',
              transition: 'background 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
            >
              <div style={{ color: 'var(--accent)', marginBottom: '12px' }}>{f.icon}</div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>{f.title}</div>
              <div style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: '1.65' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{
        margin: '0 2.5rem 5rem', borderRadius: '16px',
        background: 'var(--accent-subtle)', border: '1px solid var(--border-bright)',
        padding: '3rem 2rem', textAlign: 'center',
        boxShadow: 'var(--shadow-glow)',
      }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '10px', letterSpacing: '-0.4px' }}>
          Ready to start sketching?
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.8rem', fontSize: '15px' }}>
          Free forever. No credit card required.
        </p>
        <button onClick={() => navigate(user ? '/dashboard' : '/register')}
          className="btn btn-primary" style={{ padding: '13px 32px', fontSize: '16px' }}>
          Create your first board →
        </button>
      </section>

      
      <footer style={{
        borderTop: '1px solid var(--border)', padding: '1.5rem 2.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '12px',
      }}>
        <LogoWordmark size={24} />
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          © 2026 IdeaSlate. Built for teams.
        </span>
      </footer>
    </div>
  )
}