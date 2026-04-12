// Shared IdeaSlate logo — import this everywhere
export function Logo({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="32" height="32" rx="9" fill="#0b1f0b" stroke="#4ade80" strokeWidth="1.6"/>
      {/* Body */}
      <path
        d="M17 6C13.134 6 10 9.134 10 13c0 2.55 1.352 4.784 3.37 6.03V21.5a.75.75 0 00.75.75h5.76a.75.75 0 00.75-.75v-2.47C22.648 17.784 24 15.55 24 13c0-3.866-3.134-7-7-7z"
        fill="#4ade80"
      />
      {/* Inner shine */}
      <path d="M14.5 10.5 Q13.5 12.5 14 15" stroke="#0b1f0b" strokeWidth="1.5" strokeLinecap="round" opacity="0.3"/>
      {/* Base filaments */}
      <rect x="13.8" y="22.5" width="6.4" height="1.4" rx="0.7" fill="#4ade80" opacity="0.9"/>
      <rect x="14.6" y="24.4" width="4.8" height="1.2" rx="0.6" fill="#4ade80" opacity="0.6"/>
      {/* Sparkle cross */}
      <circle cx="25.5" cy="8.5" r="1.1" fill="#4ade80" opacity="0.75"/>
      <line x1="25.5" y1="6"   x2="25.5" y2="7.1" stroke="#4ade80" strokeWidth="1.1" strokeLinecap="round" opacity="0.6"/>
      <line x1="25.5" y1="9.9" x2="25.5" y2="11"  stroke="#4ade80" strokeWidth="1.1" strokeLinecap="round" opacity="0.6"/>
      <line x1="23"   y1="8.5" x2="24.1" y2="8.5" stroke="#4ade80" strokeWidth="1.1" strokeLinecap="round" opacity="0.6"/>
      <line x1="26.9" y1="8.5" x2="28"   y2="8.5" stroke="#4ade80" strokeWidth="1.1" strokeLinecap="round" opacity="0.6"/>
    </svg>
  )
}

export function LogoWordmark({ size = 30 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '9px', textDecoration: 'none' }}>
      <Logo size={size} />
      <span style={{
        fontSize: size * 0.58,
        fontWeight: '700',
        color: 'var(--text-primary)',
        letterSpacing: '-0.4px',
        fontFamily: "'DM Sans', sans-serif",
      }}>IdeaSlate</span>
    </div>
  )
}