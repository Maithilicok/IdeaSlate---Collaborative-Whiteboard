import { Link } from 'react-router-dom'
import { LogoWordmark } from '../components/Logo'
import { useTheme } from '../context/ThemeContext'

const ThemeIcon = ({ theme }) => theme === 'dark'
  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
  : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>

export function AuthLayout({ children, title, subtitle }) {
  const { theme, toggleTheme } = useTheme()
  return (
    <div className="grid-bg" style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2.5rem', height: '62px',
        borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)',
      }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <LogoWordmark size={28} />
        </Link>
        <button onClick={toggleTheme} className="btn btn-ghost" style={{ padding: '7px 11px', gap: '6px', fontSize: '13px' }}>
          <ThemeIcon theme={theme} />
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="animate-fade-up" style={{
          width: '100%', maxWidth: '440px',
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          borderRadius: '18px', padding: '2.4rem',
          boxShadow: 'var(--shadow-md)',
        }}>
          
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ marginBottom: '1.2rem' }}>
              <LogoWordmark size={26} />
            </div>
            <h2 style={{ fontSize: '1.7rem', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.4px', marginBottom: '5px' }}>
              {title}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

export function FormField({ label, children }) {
  return (
    <div>
      <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '7px', fontWeight: '500' }}>
        {label}
      </label>
      {children}
    </div>
  )
}