import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { AuthLayout, FormField } from '../components/AuthLayout'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Forgot password" subtitle="We'll send a reset link to your email">
      {sent ? (
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{ marginBottom: '16px', color: 'var(--accent)' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>
          <p style={{ color: 'var(--text-primary)', fontWeight: '600', marginBottom: '8px' }}>Check your inbox</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', lineHeight: '1.6' }}>
            A reset link has been sent to <b style={{ color: 'var(--text-primary)' }}>{email}</b>. It expires in 30 minutes.
          </p>
          <Link to="/login" style={{ display: 'inline-block', marginTop: '1.5rem', color: 'var(--accent)', fontWeight: '600', textDecoration: 'none', fontSize: '14px' }}>
            ← Back to login
          </Link>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <FormField label="Email">
              <input className="input" type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                required placeholder="you@example.com" autoFocus />
            </FormField>
            <button type="submit" disabled={loading} className="btn btn-primary"
              style={{ marginTop: '6px', padding: '12px', fontSize: '15px', width: '100%', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Sending…' : 'Send reset link →'}
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: '1.6rem' }}>
            <div style={{ height: '1px', background: 'var(--border)', marginBottom: '1.4rem' }} />
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: '600', textDecoration: 'none', fontSize: '13.5px' }}>
              ← Back to login
            </Link>
          </div>
        </>
      )}
    </AuthLayout>
  )
}