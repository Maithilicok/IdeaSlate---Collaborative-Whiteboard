import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { Logo } from './components/Logo'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import Board from './pages/Board'
import Join from './pages/Join'
import { Toaster } from 'react-hot-toast'

function LoadingScreen() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: 'var(--bg-primary)', gap: '18px',
    }}>
      <div style={{ animation: 'float 2s ease-in-out infinite' }}>
        <Logo size={44} />
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: 'var(--accent)', opacity: 0.7,
            animation: `pulse-glow 1.4s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        @keyframes pulse-glow { 0%, 100% { opacity: 0.3; transform: scale(0.85); } 50% { opacity: 1; transform: scale(1.1); } }
      `}</style>
    </div>
  )
}

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  return user ? children : <Navigate to="/login" replace />
}

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  return user ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px',
          },
          success: { iconTheme: { primary: 'var(--accent)', secondary: 'var(--bg-secondary)' } },
        }}
      />
      <Routes>
        <Route path="/"                      element={<Landing />} />
        <Route path="/login"                 element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register"              element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/verify-email"          element={<VerifyEmail />} />
        <Route path="/forgot-password"       element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />
        <Route path="/dashboard"             element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/board/:roomId"         element={<PrivateRoute><Board /></PrivateRoute>} />
        <Route path="/join/:shareLink"       element={<PrivateRoute><Join /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  )
}