import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { AuthLayout, FormField } from '../components/AuthLayout'

export default function Register() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      const res = await axios.post('/api/auth/register', { fullName, email, password })
      toast.success('Check your email for the verification code!')
      navigate('/verify-email', { state: { email: res.data.email } })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Create account" subtitle="Start collaborating on IdeaSlate for free">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <FormField label="Full name">
          <input className="input" type="text" value={fullName}
            onChange={e => setFullName(e.target.value)}
            required placeholder="Your name" />
        </FormField>
        <FormField label="Email">
          <input className="input" type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            required placeholder="you@example.com" />
        </FormField>
        <FormField label="Password">
          <input className="input" type="password" value={password}
            onChange={e => setPassword(e.target.value)}
            required placeholder="Min 6 characters" />
        </FormField>
        <button type="submit" disabled={loading} className="btn btn-primary"
          style={{ marginTop: '6px', padding: '12px', fontSize: '15px', width: '100%', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Creating account…' : 'Create account →'}
        </button>
      </form>
      <div style={{ textAlign: 'center', marginTop: '1.6rem' }}>
        <div style={{ height: '1px', background: 'var(--border)', marginBottom: '1.4rem' }} />
        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: '600', textDecoration: 'none' }}>
            Log in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}