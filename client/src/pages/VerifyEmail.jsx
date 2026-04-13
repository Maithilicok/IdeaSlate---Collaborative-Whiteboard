import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { AuthLayout } from '../components/AuthLayout'

export default function VerifyEmail() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const email = state?.email

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const inputs = useRef([])

  useEffect(() => {
    if (!email) navigate('/register')
  }, [email])

  useEffect(() => {
    if (countdown === 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[i] = val
    setOtp(next)
    if (val && i < 5) inputs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0)
      inputs.current[i - 1]?.focus()
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      inputs.current[5]?.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) return toast.error('Enter the full 6-digit code')
    setLoading(true)
    try {
      const res = await api.post('/api/auth/verify-otp', { email, otp: code }, { withCredentials: true })
      setUser(res.data)
      toast.success('Email verified! Welcome to IdeaSlate 🎉')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid code')
      setOtp(['', '', '', '', '', ''])
      inputs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      await api.post('/api/auth/resend-otp', { email })
      toast.success('New code sent!')
      setCountdown(60)
      setOtp(['', '', '', '', '', ''])
      inputs.current[0]?.focus()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend')
    } finally {
      setResending(false)
    }
  }

  return (
    <AuthLayout title="Check your email" subtitle={`We sent a 6-digit code to ${email}`}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }} onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => inputs.current[i] = el}
              type="text" inputMode="numeric" maxLength={1}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              autoFocus={i === 0}
              style={{
                width: '48px', height: '56px',
                textAlign: 'center', fontSize: '22px', fontWeight: '700',
                borderRadius: '10px',
                border: `1.5px solid ${digit ? 'var(--accent)' : 'var(--border)'}`,
                background: digit ? 'var(--accent-subtle)' : 'var(--bg-primary)',
                color: 'var(--text-primary)', outline: 'none',
                transition: 'border-color 0.15s, background 0.15s',
                fontFamily: "'DM Mono', monospace",
              }}
            />
          ))}
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary"
          style={{ padding: '12px', fontSize: '15px', width: '100%', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Verifying…' : 'Verify email →'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '1.4rem' }}>
        <div style={{ height: '1px', background: 'var(--border)', marginBottom: '1.2rem' }} />
        {countdown > 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Resend code in <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{countdown}s</span>
          </p>
        ) : (
          <button onClick={handleResend} disabled={resending}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontWeight: '600', fontSize: '13.5px' }}>
            {resending ? 'Sending…' : 'Resend code'}
          </button>
        )}
      </div>
    </AuthLayout>
  )
}