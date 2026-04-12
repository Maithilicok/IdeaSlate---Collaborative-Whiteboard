import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { LogoWordmark } from '../components/Logo'
import axios from 'axios'
import toast from 'react-hot-toast'

const ThemeIcon = ({ theme }) => theme === 'dark'
  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
  : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>

// board name
function boardHue(name = '') {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360
  return h
}

function BoardPreview({ name }) {
  const hue = boardHue(name)
  return (
    <svg viewBox="0 0 240 120" style={{ width: '100%' }} fill="none">
      <rect width="240" height="120" fill="var(--bg-tertiary)" />
      {/* dot grid */}
      {Array.from({ length: 5 }, (_, r) =>
        Array.from({ length: 10 }, (_, c) => (
          <circle key={`${r}-${c}`} cx={c * 26 + 13} cy={r * 26 + 13} r="1.1" fill="var(--border)" />
        ))
      )}
      {/* unique doodle per board */}
      <rect x="30" y="30" width="60" height="40" rx="3" stroke={`hsl(${hue},60%,60%)`} strokeWidth="1.8" />
      <circle cx="170" cy="55" r="28" stroke={`hsl(${(hue+120)%360},60%,60%)`} strokeWidth="1.8" />
      <line x1="100" y1="90" x2="200" y2="35" stroke={`hsl(${(hue+240)%360},60%,60%)`} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function Modal({ show, onClose, children }) {
  if (!show) return null
  return (
    <div className="animate-fade-in" onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem',
    }}>
      <div style={{
        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
        borderRadius: '18px', padding: '2.2rem',
        width: '100%', maxWidth: '400px',
        boxShadow: 'var(--shadow-md)',
        animation: 'fadeUp 0.25s ease both',
      }}>
        {children}
      </div>
    </div>
  )
}

// ── Board card action menu (⋯ dropdown) ──────────────────
function BoardMenu({ room, isOwner, onRename, onDelete, onCopyLink }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
        style={{
          background: 'none', border: '1px solid var(--border)', borderRadius: '7px',
          color: 'var(--text-muted)', cursor: 'pointer',
          padding: '4px 8px', fontSize: '16px', lineHeight: 1,
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
        title="More options"
      >⋯</button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, bottom: 'calc(100% + 6px)',
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          borderRadius: '10px', padding: '5px', minWidth: '160px',
          boxShadow: 'var(--shadow-md)', zIndex: 50,
          animation: 'fadeUp 0.15s ease both',
        }}>
          <MenuItem icon="link" label="Copy link" onClick={() => { onCopyLink(); setOpen(false) }} />
          {isOwner && <MenuItem icon="edit" label="Rename" onClick={() => { onRename(); setOpen(false) }} />}
          {isOwner && <MenuItem icon="delete" label="Delete" onClick={() => { onDelete(); setOpen(false) }} danger />}
        </div>
      )}
    </div>
  )
}

const MENU_ICONS = {
  link: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  edit: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  delete: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
}

function MenuItem({ icon, label, onClick, danger }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      width: '100%', padding: '7px 10px', borderRadius: '7px',
      background: 'transparent', border: 'none', cursor: 'pointer',
      fontSize: '13px', color: danger ? 'var(--red)' : 'var(--text-primary)',
      textAlign: 'left', transition: 'background 0.15s',
    }}
      onMouseEnter={e => e.currentTarget.style.background = danger ? 'var(--red-subtle)' : 'var(--bg-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <span style={{ opacity: 0.7, display: 'flex', alignItems: 'center' }}>{MENU_ICONS[icon]}</span>
      {label}
    </button>
  )
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [roomName, setRoomName] = useState('')
  const [joinInput, setJoinInput] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [renameTarget, setRenameTarget] = useState(null) // { id, name }
  const [renameValue, setRenameValue] = useState('')
  const [search, setSearch] = useState('')
  const [showProfile, setShowProfile] = useState(false)

  useEffect(() => { fetchRooms() }, [])

  const fetchRooms = async () => {
    try {
      const res = await axios.get('/api/rooms/my-rooms', { withCredentials: true })
      setRooms(res.data)
    } catch { toast.error('Failed to load boards') }
    finally { setLoading(false) }
  }

  const createRoom = async () => {
    if (!roomName.trim()) return toast.error('Enter a board name')
    setCreating(true)
    try {
      const res = await axios.post('/api/rooms/create', { name: roomName }, { withCredentials: true })
      setRooms(r => [...r, res.data]); setRoomName(''); setShowCreate(false)
      toast.success('Board created!'); navigate(`/board/${res.data._id}`)
    } catch { toast.error('Failed to create board') }
    finally { setCreating(false) }
  }

  const deleteRoom = async (id) => {
    try {
      await axios.delete(`/api/rooms/${id}`, { withCredentials: true })
      setRooms(r => r.filter(b => b._id !== id)); setConfirmDeleteId(null)
      toast.success('Board deleted')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete') }
  }

  const renameRoom = async () => {
    if (!renameValue.trim()) return toast.error('Enter a board name')
    setRenaming(true)
    try {
      await axios.patch(`/api/rooms/${renameTarget.id}`, { name: renameValue }, { withCredentials: true })
      setRooms(r => r.map(b => b._id === renameTarget.id ? { ...b, name: renameValue, updatedAt: new Date().toISOString() } : b))
      toast.success('Board renamed!'); setRenameTarget(null)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to rename') }
    finally { setRenaming(false) }
  }

  const joinRoom = async () => {
    if (!joinInput.trim()) return toast.error('Paste an invite link or code')
    setJoining(true)
    try {
      const trimmed = joinInput.trim()
      let endpoint
      if (trimmed.includes('/board/')) {
        const roomId = trimmed.split('/board/').pop().split('/')[0]
        endpoint = `/api/rooms/join-by-id/${roomId}`
      } else {
        const shareLink = trimmed.includes('/join/') ? trimmed.split('/join/').pop() : trimmed
        endpoint = `/api/rooms/join/${shareLink}`
      }
      const res = await axios.post(endpoint, {}, { withCredentials: true })
      setJoinInput(''); setShowJoin(false)
      toast.success('Joined board!'); navigate(`/board/${res.data._id}`)
    } catch { toast.error('Invalid or expired invite link') }
    finally { setJoining(false) }
  }

  const copyBoardLink = (room) => {
    const link = `${window.location.origin}/board/${room._id}`
    navigator.clipboard.writeText(link)
    toast.success('Link copied!')
  }

  const isOwner = (room) => room.owner === user?._id || room.owner?._id === user?._id

  // Support both `name` and `fullName` fields from different API shapes
  const displayName = user?.name || 'there'
  const avatarInitial = displayName.charAt(0).toUpperCase()

  const filteredRooms = rooms.filter(r => r.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="grid-bg" style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>

      {/* ── Navbar ── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2.5rem', height: '62px',
        borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        {/* Left: back arrow + logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate('/')}
            className="btn btn-ghost"
            style={{ padding: '7px 10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
            title="Back to home"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Home
          </button>
          <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />
          <LogoWordmark size={28} />
        </div>

        {/* Right: theme + avatar + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={toggleTheme} className="btn btn-ghost" style={{ padding: '7px 11px' }}>
            <ThemeIcon theme={theme} />
          </button>
          {/* Avatar — clickable to open profile panel */}
          <button
            onClick={() => setShowProfile(true)}
            title="View profile"
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px',
              borderRadius: '8px', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: 'var(--accent-subtle)', border: '1.5px solid var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--accent)', fontWeight: '700', fontSize: '14px', flexShrink: 0,
            }}>
              {avatarInitial}
            </div>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName}
            </span>
          </button>
          <button onClick={async () => { await logout(); navigate('/') }} className="btn btn-ghost" style={{ fontSize: '13px' }}>
            Logout
          </button>
        </div>
      </nav>

      {/* ── Content ── */}
      <div style={{ padding: '2.5rem', maxWidth: '1120px', margin: '0 auto' }}>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              My boards
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '5px' }}>
              Welcome back, <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{displayName}</span>
              {rooms.length > 0 && <span> · {rooms.length} board{rooms.length !== 1 ? 's' : ''}</span>}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search */}
            {rooms.length > 3 && (
              <div style={{ position: 'relative' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  className="input"
                  type="text"
                  placeholder="Search boards…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ paddingLeft: '32px', paddingTop: '8px', paddingBottom: '8px', fontSize: '13px', width: '180px' }}
                />
              </div>
            )}
            <button onClick={() => setShowJoin(true)} className="btn btn-ghost">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
              Join a board
            </button>
            <button onClick={() => setShowCreate(true)} className="btn btn-primary">
              + New board
            </button>
          </div>
        </div>

        {/* ── Boards grid ── */}
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', padding: '3rem 0' }}>
            <div style={{ width: '18px', height: '18px', border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            Loading your boards…
          </div>
        ) : rooms.length === 0 ? (
          /* ── Empty state ── */
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '5rem 2rem', textAlign: 'center', gap: '16px',
            border: '2px dashed var(--border)', borderRadius: '18px',
            background: 'var(--bg-secondary)',
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '16px',
              background: 'var(--accent-subtle)', border: '1px solid var(--border-bright)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--accent)',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </div>
            <div>
              <p style={{ fontWeight: '700', fontSize: '16px', color: 'var(--text-primary)', marginBottom: '6px' }}>No boards yet</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '320px', lineHeight: '1.6' }}>
                Create your first board and start sketching, or join one from a shared link.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button onClick={() => setShowJoin(true)} className="btn btn-ghost">Join a board</button>
              <button onClick={() => setShowCreate(true)} className="btn btn-primary">+ Create board</button>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '1rem',
          }}>
            {filteredRooms.map(room => (
              <div key={room._id} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: '14px', overflow: 'hidden',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                display: 'flex', flexDirection: 'column',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = 'var(--shadow-glow)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                
                <div onClick={() => navigate(`/board/${room._id}`)} style={{ cursor: 'pointer', overflow: 'hidden', borderBottom: '1px solid var(--border)' }}>
                  <BoardPreview name={room.name} />
                </div>

                {/* Info */}
                <div style={{ padding: '14px 16px', flex: 1 }}>
                  <div onClick={() => navigate(`/board/${room._id}`)} style={{ cursor: 'pointer' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {room.name}
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}>
                      {room.updatedAt
                        ? `Updated ${new Date(room.updatedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`
                        : `Created ${new Date(room.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`
                      }
                    </div>
                    {/* Owner badge for shared/joined boards */}
                    {!isOwner(room) && (
                      <div style={{ marginTop: '5px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: '2px 7px', borderRadius: '20px', border: '1px solid var(--border)' }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                        Shared with you
                      </div>
                    )}
                  </div>
                </div>

               
                <div style={{ padding: '0 16px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button onClick={() => navigate(`/board/${room._id}`)} style={{
                    fontSize: '12px', padding: '5px 11px', borderRadius: '7px',
                    border: '1px solid var(--border)', background: 'transparent',
                    color: 'var(--text-muted)', cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
                  >Open →</button>
                  <BoardMenu
                    room={room}
                    isOwner={isOwner(room)}
                    onCopyLink={() => copyBoardLink(room)}
                    onRename={() => { setRenameTarget({ id: room._id, name: room.name }); setRenameValue(room.name) }}
                    onDelete={() => setConfirmDeleteId(room._id)}
                  />
                </div>
              </div>
            ))}

            {/* New board card */}
            <div onClick={() => setShowCreate(true)} style={{
              border: '2px dashed var(--border)', borderRadius: '14px',
              minHeight: '220px', display: 'flex',
              flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', gap: '10px', transition: 'all 0.2s',
              background: 'transparent',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-subtle)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent' }}
            >
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: 'var(--accent-subtle)', border: '1px solid var(--border-bright)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent)', fontSize: '22px', fontWeight: '300',
              }}>+</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>New board</div>
            </div>
          </div>
        )}
      </div>

      {/* ── Create modal ── */}
      <Modal show={showCreate} onClose={() => setShowCreate(false)}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '5px' }}>Create new board</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '1.3rem' }}>Give your board a name to get started.</p>
        <input className="input" type="text" value={roomName}
          onChange={e => setRoomName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && createRoom()}
          placeholder="Board name…" autoFocus
          style={{ marginBottom: '1.1rem' }}
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowCreate(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
          <button onClick={createRoom} disabled={creating} className="btn btn-primary" style={{ flex: 1 }}>
            {creating ? 'Creating…' : 'Create board'}
          </button>
        </div>
      </Modal>

      {/* ── Join modal ── */}
      <Modal show={showJoin} onClose={() => setShowJoin(false)}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '5px' }}>Join a board</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '1.3rem' }}>Paste the invite link someone shared with you.</p>
        <input className="input" type="text" value={joinInput}
          onChange={e => setJoinInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && joinRoom()}
          placeholder="Paste invite link…" autoFocus
          style={{ marginBottom: '1.1rem' }}
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => { setShowJoin(false); setJoinInput('') }} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
          <button onClick={joinRoom} disabled={joining} className="btn btn-primary" style={{ flex: 1 }}>
            {joining ? 'Joining…' : 'Join board'}
          </button>
        </div>
      </Modal>

      {/* ── Rename modal ── */}
      <Modal show={!!renameTarget} onClose={() => setRenameTarget(null)}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '5px' }}>Rename board</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '1.3rem' }}>Enter a new name for this board.</p>
        <input className="input" type="text" value={renameValue}
          onChange={e => setRenameValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && renameRoom()}
          placeholder="New board name…" autoFocus
          style={{ marginBottom: '1.1rem' }}
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setRenameTarget(null)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
          <button onClick={renameRoom} disabled={renaming} className="btn btn-primary" style={{ flex: 1 }}>
            {renaming ? 'Saving…' : 'Save name'}
          </button>
        </div>
      </Modal>

      {/* ── Delete confirm modal ── */}
      <Modal show={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)}>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '10px',
            background: 'var(--red-subtle)', border: '1px solid var(--red)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '1rem', color: 'var(--red)',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '5px' }}>Delete this board?</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            This will permanently delete the board and all its drawings. This cannot be undone.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setConfirmDeleteId(null)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
          <button onClick={() => deleteRoom(confirmDeleteId)} className="btn btn-danger" style={{ flex: 1 }}>Delete board</button>
        </div>
      </Modal>
      
      <Modal show={showProfile} onClose={() => setShowProfile(false)}>
        {/* Avatar banner */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '1.4rem 1rem 1.2rem', marginBottom: '1.2rem',
          background: 'var(--bg-primary)', borderRadius: '12px',
          border: '1px solid var(--border)',
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'var(--accent-subtle)', border: '2px solid var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent)', fontWeight: '800', fontSize: '26px',
            marginBottom: '12px', letterSpacing: '-1px',
          }}>
            {avatarInitial}
          </div>
          <div style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
            {displayName}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{user?.email}</span>
            <span style={{
              fontSize: '10px', fontWeight: '700', color: 'var(--accent)',
              background: 'var(--accent-subtle)', border: '1px solid var(--border-bright)',
              padding: '1px 7px', borderRadius: '20px', letterSpacing: '0.04em',
            }}>VERIFIED</span>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1.2rem' }}>
          <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>Boards</div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 }}>{rooms.length}</div>
          </div>
          <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>Joined</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                : <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: '400' }}>Not available</span>
              }
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowProfile(false)} className="btn btn-ghost" style={{ flex: 1 }}>Close</button>
          <button
            onClick={async () => { setShowProfile(false); await logout(); navigate('/') }}
            style={{
              flex: 1, padding: '10px', borderRadius: '9px', border: '1px solid var(--border)',
              background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer',
              fontSize: '13px', fontWeight: '600', transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#f87171'; e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.06)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign out
          </button>
        </div>
      </Modal>


    </div>
  )
}