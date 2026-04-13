import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { AuthLayout, FormField } from '../components/AuthLayout'

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) return toast.error('Passwords do not match')
    if (password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      await api.post(`/api/auth/reset-password/${token}`, { password })
      setDone(true)
      toast.success('Password reset successfully!')
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Link is invalid or expired')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Reset password" subtitle="Enter your new password below">
      {done ? (
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{ marginBottom: '16px', color: 'var(--accent)' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
          <p style={{ color: 'var(--text-primary)', fontWeight: '600', marginBottom: '8px' }}>Password updated!</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px' }}>Redirecting you to login…</p>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <FormField label="New password">
              <input className="input" type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                required placeholder="Min 6 characters" autoFocus />
            </FormField>
            <FormField label="Confirm password">
              <input className="input" type="password" value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required placeholder="Repeat password" />
            </FormField>
            <button type="submit" disabled={loading} className="btn btn-primary"
              style={{ marginTop: '6px', padding: '12px', fontSize: '15px', width: '100%', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Resetting…' : 'Reset password →'}
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