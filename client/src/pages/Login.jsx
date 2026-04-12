import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { AuthLayout, FormField } from '../components/AuthLayout'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      if (err.response?.data?.needsVerification) {
        toast.error('Please verify your email. A new code has been sent.')
        navigate('/verify-email', { state: { email: err.response.data.email } })
        return
      }
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to your IdeaSlate account">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <FormField label="Email">
          <input className="input" type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            required placeholder="you@example.com" />
        </FormField>
        <FormField label="Password">
          <input className="input" type="password" value={password}
            onChange={e => setPassword(e.target.value)}
            required placeholder="••••••••" />
        </FormField>
        <div style={{ textAlign: 'right', marginTop: '-4px' }}>
          <Link to="/forgot-password" style={{ fontSize: '12.5px', color: 'var(--accent)', textDecoration: 'none' }}>
            Forgot password?
          </Link>
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary"
          style={{ marginTop: '6px', padding: '12px', fontSize: '15px', width: '100%', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Logging in…' : 'Log in →'}
        </button>
      </form>
      <div style={{ textAlign: 'center', marginTop: '1.6rem' }}>
        <div style={{ height: '1px', background: 'var(--border)', marginBottom: '1.4rem' }} />
        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
          No account yet?{' '}
          <Link to="/register" style={{ color: 'var(--accent)', fontWeight: '600', textDecoration: 'none' }}>
            Sign up free
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}