import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { Logo, LogoWordmark } from '../components/Logo'

export default function Join() {
  const { shareLink } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('Joining board…')
  const [error, setError] = useState(false)

  useEffect(() => {
    const join = async () => {
      try {
        const res = await api.post(`/rooms/join/${shareLink}`, {}, { withCredentials: true })
        navigate(`/board/${res.data._id}`, { replace: true })
      } catch {
        setStatus('This invite link is invalid or has expired.')
        setError(true)
        setTimeout(() => navigate('/dashboard', { replace: true }), 3000)
      }
    }
    join()
  }, [shareLink])

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-primary)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '20px',
    }}>
      <div style={{ animation: 'float 2.4s ease-in-out infinite' }}>
        <Logo size={48} />
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '15px', color: error ? 'var(--red)' : 'var(--text-muted)', marginBottom: '8px' }}>
          {status}
        </div>
        {!error && (
          <div style={{
            display: 'flex', gap: '5px', justifyContent: 'center', alignItems: 'center',
          }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)',
                animation: `pulse-glow 1.4s ease-in-out ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
        )}
        {error && (
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Redirecting you to dashboard…
          </div>
        )}
      </div>
    </div>
  )
}