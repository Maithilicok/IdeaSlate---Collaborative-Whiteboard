import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/useAuth'
import { Logo, LogoWordmark } from '../components/Logo'
import { io } from 'socket.io-client'
import api from '../api/axios'
import toast from 'react-hot-toast'


function extractPoints(path) {
  const pts = []
  for (const cmd of (path.path || [])) {
    if (['M', 'L', 'Q', 'C'].includes(cmd[0]))
      pts.push({ x: cmd[cmd.length - 2], y: cmd[cmd.length - 1] })
  }
  return pts
}

function getBBox(pts) {
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y)
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) }
}

function resample(pts, n = 64) {
  if (pts.length < 2) return pts
  const total = pts.reduce((a, p, i) => i === 0 ? 0 : a + Math.hypot(p.x - pts[i-1].x, p.y - pts[i-1].y), 0)
  const interval = total / (n - 1)
  const out = [pts[0]]; let dist = 0
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i].x - pts[i-1].x, pts[i].y - pts[i-1].y)
    dist += d
    while (out.length < n && dist >= out.length * interval) {
      const t = (out.length * interval - (dist - d)) / d
      out.push({ x: pts[i-1].x + t*(pts[i].x - pts[i-1].x), y: pts[i-1].y + t*(pts[i].y - pts[i-1].y) })
    }
  }
  while (out.length < n) out.push(pts[pts.length - 1])
  return out
}

function arcLen(pts) {
  return pts.reduce((a, p, i) => i === 0 ? 0 : a + Math.hypot(p.x-pts[i-1].x, p.y-pts[i-1].y), 0)
}

function ptSegDist(p, a, b) {
  const dx = b.x-a.x, dy = b.y-a.y, l2 = dx*dx+dy*dy
  if (l2 === 0) return Math.hypot(p.x-a.x, p.y-a.y)
  const t = Math.max(0, Math.min(1, ((p.x-a.x)*dx + (p.y-a.y)*dy) / l2))
  return Math.hypot(p.x-(a.x+t*dx), p.y-(a.y+t*dy))
}

function polyScore(pts, verts) {
  const bbox = getBBox(pts)
  const diag = Math.hypot(bbox.maxX-bbox.minX, bbox.maxY-bbox.minY)
  const n = verts.length
  const avg = pts.reduce((s, p) => {
    let min = Infinity
    for (let i = 0; i < n; i++) { const d = ptSegDist(p, verts[i], verts[(i+1)%n]); if (d < min) min = d }
    return s + min
  }, 0) / pts.length
  return 1 - Math.min(1, avg / (diag * 0.12))
}

function recogniseShape(path) {
  const raw = extractPoints(path)
  if (raw.length < 8) return null
  const bbox = getBBox(raw)
  const W = bbox.maxX - bbox.minX, H = bbox.maxY - bbox.minY
  if (W < 25 && H < 25) return null

  const pts = resample(raw, 64)
  const first = pts[0], last = pts[pts.length-1]
  const al = arcLen(pts), diag = Math.hypot(W, H)
  const closeDist = Math.hypot(last.x-first.x, last.y-first.y)
  const isClosed = closeDist < diag * 0.30

  if (!isClosed) {
    const sd = Math.hypot(last.x-first.x, last.y-first.y)
    if (sd > 35) {
      let maxD = 0
      for (const p of pts) { const d = ptSegDist(p, first, last); if (d > maxD) maxD = d }
      if (maxD < diag * 0.09 && al/(sd||1) < 1.18) return 'line'
    }
    return null
  }

  const cx = bbox.minX+W/2, cy = bbox.minY+H/2
  const avgR = pts.reduce((s,p) => s + Math.hypot(p.x-cx, p.y-cy), 0) / pts.length
  const radVar = Math.sqrt(pts.reduce((s,p) => { const d=Math.hypot(p.x-cx,p.y-cy)-avgR; return s+d*d }, 0) / pts.length) / avgR
  const asp = Math.min(W,H) / Math.max(W,H)
  if (radVar < 0.22 && asp > 0.55) return 'circle'

  const { minX, maxX, minY, maxY } = bbox
  const mx = minX+W/2, my = minY+H/2
  const triCfgs = [
    [{x:mx,y:minY},{x:maxX,y:maxY},{x:minX,y:maxY}],
    [{x:mx,y:maxY},{x:maxX,y:minY},{x:minX,y:minY}],
    [{x:minX,y:my},{x:maxX,y:minY},{x:maxX,y:maxY}],
    [{x:maxX,y:my},{x:minX,y:minY},{x:minX,y:maxY}],
  ]
  let bestTri = 0
  for (const v of triCfgs) { const s = polyScore(pts, v); if (s > bestTri) bestTri = s }

  const rectScore = polyScore(pts, [
    {x:minX,y:minY},{x:maxX,y:minY},{x:maxX,y:maxY},{x:minX,y:maxY}
  ])

  if (bestTri > 0.68 || rectScore > 0.68) {
    if (bestTri > rectScore + 0.04) return 'triangle'
    return 'rect'
  }
  return null
}

function createPerfectShape(fab, path, type, color, width) {
  const pts = extractPoints(path)
  const { minX, maxX, minY, maxY } = getBBox(pts)
  const W = maxX-minX, H = maxY-minY
  const common = { fill:'transparent', stroke:color, strokeWidth:width, selectable:true, id:crypto.randomUUID() }
  if (type === 'circle')   return new fab.Ellipse({ ...common, left:minX, top:minY, rx:W/2, ry:H/2 })
  if (type === 'rect')     return new fab.Rect({ ...common, left:minX, top:minY, width:W, height:H })
  if (type === 'triangle') return new fab.Triangle({ ...common, left:minX, top:minY, width:W, height:H })
  if (type === 'line') {
    const f = pts[0], l = pts[pts.length-1]
    return new fab.Line([f.x,f.y,l.x,l.y], { ...common })
  }
  return null
}

// FIX #4: Simple throttle helper — no lodash needed
function throttle(fn, ms) {
  let last = 0, timer = null
  return (...args) => {
    const now = Date.now()
    const remaining = ms - (now - last)
    clearTimeout(timer)
    if (remaining <= 0) {
      last = now
      fn(...args)
    } else {
      timer = setTimeout(() => { last = Date.now(); fn(...args) }, remaining)
    }
  }
}

const TOOLS = [
  { id:'draw',     label:'Draw',       icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> },
  { id:'smart',    label:'Smart draw', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
  { id:'eraser',   label:'Eraser',     icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 20H7L3 16l10-10 7 7-1.5 1.5"/><path d="M6.5 17.5l5-5"/></svg> },
  { id:'text',     label:'Text',       icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg> },
  { id:'circle',   label:'Circle',     icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/></svg> },
  { id:'rect',     label:'Rectangle',  icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2"/></svg> },
  { id:'triangle', label:'Triangle',   icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12 3 22 21 2 21"/></svg> },
  { id:'select',   label:'Select',     icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 3l14 9-7 2-4 7z"/></svg> },
]


export default function Board() {
  const { roomId }             = useParams()
  const { theme, toggleTheme } = useTheme()
  const { user }               = useAuth()
  const navigate               = useNavigate()

  const canvasRef       = useRef(null)
  const fabricRef       = useRef(null)
  const fabricModuleRef = useRef(null)
  const socketRef       = useRef(null)
  const isReceiving     = useRef(false)
  // FIX #2: track whether DB canvas has finished loading before accepting socket updates
  const dbLoadedRef     = useRef(false)
  const activeToolRef   = useRef('draw')
  const strokeColorRef  = useRef('#4ade80')
  const strokeWidthRef  = useRef(3)

  const [activeTool,  setActiveTool]  = useState('draw')
  const [strokeColor, setStrokeColor] = useState('#4ade80')
  const [strokeWidth, setStrokeWidth] = useState(3)
  const [showProfile, setShowProfile] = useState(false)

  const dark        = theme === 'dark'
  const bg          = dark ? '#080e08' : '#f4fbf4'
  const surface     = dark ? '#0d180d' : '#eaf6ea'
  const border      = dark ? '#1a341a' : '#c2ddc2'
  const borderBr    = dark ? '#2a5a2a' : '#8aba8a'
  const textPrimary = dark ? '#deeede' : '#0a180a'
  const textMuted   = dark ? '#527a52' : '#4a7a4a'
  const accent      = '#4ade80'

  useEffect(() => {
    if (!fabricRef.current) return
    fabricRef.current.backgroundColor = bg
    fabricRef.current.renderAll()
  }, [theme])

  useEffect(() => {
    let canvas, cleanKeys, cleanResize
    // FIX #6: isMounted guard — prevents setState / canvas ops after unmount
    let isMounted = true

    const init = async () => {
      const fab = await import('fabric')
      // FIX #6: bail out if unmounted before async import resolved
      if (!isMounted) return

      fabricModuleRef.current = fab
      const { Canvas, PencilBrush } = fab

      canvas = new Canvas(canvasRef.current, {
        backgroundColor: bg,
        width: window.innerWidth - 224,
        height: window.innerHeight - 62,
      })
      fabricRef.current = canvas

      const brush = new PencilBrush(canvas)
      brush.color = strokeColorRef.current; brush.width = strokeWidthRef.current
      canvas.freeDrawingBrush = brush; canvas.isDrawingMode = true

      // FIX #4: Throttle canvas emissions to max once per 100ms
      const emitCanvasRaw = () => {
        if (isReceiving.current) return
        socketRef.current?.emit('canvas:draw', { roomId, data: JSON.stringify(canvas.toJSON(['id'])) })
      }
      const emitCanvas = throttle(emitCanvasRaw, 100)

      const onKey = (e) => {
        if ((e.key === 'Delete' || e.key === 'Backspace') && !e.target.matches('input,textarea')) {
          const a = canvas.getActiveObject()
          if (a) { canvas.remove(a); canvas.renderAll(); emitCanvas() }
        }
      }
      window.addEventListener('keydown', onKey)
      cleanKeys = () => window.removeEventListener('keydown', onKey)

      // FIX #2 + #5: Load DB canvas first, mark done, THEN connect socket
      try {
        const res = await api.get(`/boards/${roomId}`, { withCredentials: true })
        if (!isMounted) return // FIX #6: check again after await
        if (res.data.canvasJSON) {
          // FIX #5: safe parse — handle both string and pre-parsed object
          const raw = res.data.canvasJSON
          const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
          await canvas.loadFromJSON(parsed)
          canvas.renderAll()
        }
      } catch {}

      if (!isMounted) return // FIX #6: check again after second await

      // FIX #2: Only NOW connect socket — DB state is already on canvas
      dbLoadedRef.current = true
      const backendUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'
      socketRef.current = io(backendUrl, { withCredentials: true, transports: ['websocket', 'polling'] })
      socketRef.current.on('connect', () => console.log('[SOCKET] connected:', socketRef.current.id))
      socketRef.current.on('connect_error', (e) => console.error('[SOCKET] error:', e.message))
      socketRef.current.emit('join-room', roomId)

      socketRef.current.on('canvas:draw', async (json) => {
        if (!dbLoadedRef.current) return
        if (isReceiving.current) return
        isReceiving.current = true
        try {
          const parsed = typeof json === 'string' ? JSON.parse(json) : json
          await canvas.loadFromJSON(parsed)
          canvas.renderAll()
        } catch (e) {
          console.error('canvas:draw error', e)
        } finally {
          // Add brief safety delay to let internal Fabric events (like object:added) flush
          setTimeout(() => { isReceiving.current = false }, 50)
        }
      })

      socketRef.current.on('canvas:clear', () => {
        isReceiving.current = true
        canvas.clear(); canvas.backgroundColor = bg; canvas.renderAll()
        setTimeout(() => { isReceiving.current = false }, 50)
      })

      socketRef.current.on('send-canvas-to', (targetSocketId) => {
        const data = JSON.stringify(canvas.toJSON(['id']))
        socketRef.current?.emit('canvas:full:sync:to', { targetSocketId, data })
      })

      const safeEmit = () => {
        if (!isReceiving.current) emitCanvas()
      }

      canvas.on('object:added', (e) => {
        if (isReceiving.current) return
        const obj = e.target
        if (!obj.id) obj.id = crypto.randomUUID()
        if (obj.type === 'path' && activeToolRef.current === 'smart') {
          const t = recogniseShape(obj)
          if (t) {
            const p = createPerfectShape(fabricModuleRef.current, obj, t, strokeColorRef.current, strokeWidthRef.current)
            if (p) { canvas.remove(obj); canvas.add(p); canvas.renderAll(); safeEmit(); return }
          }
        }
        safeEmit()
      })
      canvas.on('object:modified', safeEmit)
      canvas.on('object:removed',  safeEmit)

      const onResize = () => {
        canvas.setDimensions({ width: window.innerWidth-224, height: window.innerHeight-62 })
        canvas.renderAll()
      }
      window.addEventListener('resize', onResize)
      cleanResize = () => window.removeEventListener('resize', onResize)
    }

    init()

    return () => {
      // FIX #6: set flag first so any in-flight awaits bail out cleanly
      isMounted = false
      dbLoadedRef.current = false
      cleanKeys?.()
      cleanResize?.()
      canvas?.dispose()
      socketRef.current?.disconnect()
    }
  }, [roomId])

  const applyTool = (tool) => {
    if (!fabricRef.current || !fabricModuleRef.current) return
    const canvas = fabricRef.current
    const { PencilBrush, Rect, Ellipse, Triangle, IText } = fabricModuleRef.current
    activeToolRef.current = tool; setActiveTool(tool)
    const color = strokeColorRef.current, width = strokeWidthRef.current
    const common = { fill:'transparent', stroke:color, strokeWidth:width, selectable:true, id:crypto.randomUUID() }

    if (tool === 'draw' || tool === 'smart') {
      canvas.isDrawingMode = true
      const b = new PencilBrush(canvas); b.color = color; b.width = width; canvas.freeDrawingBrush = b
    } else if (tool === 'eraser') {
      canvas.isDrawingMode = true
      const b = new PencilBrush(canvas); b.color = canvas.backgroundColor||bg; b.width = 24; canvas.freeDrawingBrush = b
    } else if (tool === 'select') {
      canvas.isDrawingMode = false; canvas.selection = true
    } else if (tool === 'rect') {
      canvas.isDrawingMode = false; canvas.add(new Rect({ ...common, left:160, top:160, width:160, height:100 })); canvas.renderAll()
    } else if (tool === 'circle') {
      canvas.isDrawingMode = false; canvas.add(new Ellipse({ ...common, left:160, top:160, rx:70, ry:50 })); canvas.renderAll()
    } else if (tool === 'triangle') {
      canvas.isDrawingMode = false; canvas.add(new Triangle({ ...common, left:160, top:160, width:120, height:100 })); canvas.renderAll()
    } else if (tool === 'text') {
      canvas.isDrawingMode = false
      const t = new IText('Type here…', { left:160, top:160, fontSize:20, fill:color, fontFamily:'DM Sans', id:crypto.randomUUID() })
      canvas.add(t); canvas.setActiveObject(t); t.enterEditing(); canvas.renderAll()
    }
  }

  const updateBrush = (color, width) => {
    strokeColorRef.current = color; strokeWidthRef.current = width
    if (!fabricRef.current) return
    const c = fabricRef.current
    if (c.isDrawingMode && c.freeDrawingBrush) {
      if (activeToolRef.current === 'eraser') c.freeDrawingBrush.width = 24
      else { c.freeDrawingBrush.color = color; c.freeDrawingBrush.width = width }
    }
  }

  const deleteSelected = () => {
    if (!fabricRef.current) return
    const a = fabricRef.current.getActiveObject()
    if (!a) return toast.error('Select an element first')
    fabricRef.current.remove(a); fabricRef.current.renderAll()
    socketRef.current?.emit('canvas:draw', { roomId, data: JSON.stringify(fabricRef.current.toJSON(['id'])) })
    toast.success('Deleted!')
  }

  const clearCanvas = () => {
    if (!fabricRef.current) return
    fabricRef.current.clear(); fabricRef.current.backgroundColor = bg; fabricRef.current.renderAll()
    socketRef.current?.emit('canvas:clear', roomId)
  }

  const saveBoard = async () => {
    try {
      await api.put(`/boards/${roomId}`, { canvasJSON: JSON.stringify(fabricRef.current.toJSON(['id'])) }, { withCredentials: true })
      toast.success('Board saved!')
    } catch { toast.error('Failed to save') }
  }

  const copyLink = () => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!') }

  const SideBtn = ({ tool }) => {
    const active = activeTool === tool.id
    return (
      <button onClick={() => applyTool(tool.id)} title={tool.label} style={{
        display: 'flex', alignItems: 'center', gap: '9px',
        padding: '8px 11px', borderRadius: '9px', width: '100%',
        border: active ? `1px solid ${accent}` : `1px solid ${border}`,
        background: active ? (dark ? '#0d2a14' : '#dcfce7') : 'transparent',
        color: active ? accent : textMuted,
        cursor: 'pointer', fontSize: '13px', fontWeight: active ? '600' : '400',
        transition: 'all 0.15s',
      }}
        onMouseEnter={e => { if (!active) { e.currentTarget.style.background = dark ? '#111e11' : '#f0fdf0'; e.currentTarget.style.color = textPrimary } }}
        onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = textMuted } }}
      >
        <span style={{ opacity: active ? 1 : 0.75 }}>{tool.icon}</span>
        {tool.label}
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: bg, overflow: 'hidden' }}>

      {/* ── Top navbar ── */}
      <nav style={{
        height: '62px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1.2rem', borderBottom: `1px solid ${border}`,
        background: surface, zIndex: 50, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate('/dashboard')}
            title="Back to dashboard"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '4px 12px', borderRadius: '16px',
              border: `1px solid ${border}`, background: 'transparent',
              color: textPrimary, cursor: 'pointer', fontSize: '12px', fontWeight: '500',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = textPrimary }}
          >
            ← Back
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '4px' }}>
            <div style={{ width: 22, height: 22, background: accent, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold', fontSize: '14px' }}>I</div>
            <span style={{ fontSize: 16, fontWeight: '700', color: textPrimary, fontFamily: "'DM Sans', sans-serif" }}>IdeaSlate</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={toggleTheme} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '4px 12px', borderRadius: '16px',
            border: `1px solid ${border}`, background: 'transparent',
            color: textPrimary, cursor: 'pointer', fontSize: '12px', fontWeight: '500',
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = textPrimary }}
          >
            {dark
              ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> Light</>
              : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> Dark</>
            }
          </button>
          <button onClick={copyLink} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '4px 12px', borderRadius: '16px',
            border: `1px solid ${border}`, background: 'transparent',
            color: textPrimary, cursor: 'pointer', fontSize: '12px', fontWeight: '500',
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = textPrimary }}
          >
            Share
          </button>
          <button onClick={saveBoard} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '4px 16px', borderRadius: '16px',
            border: `1px solid ${accent}`, background: accent,
            color: '#000', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
            transition: 'all 0.15s',
          }}>
            Save
          </button>
          <div title={user?.fullName || user?.name} style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: 'transparent',
            border: `1px solid ${accent}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: accent, fontWeight: '700', fontSize: '12px', userSelect: 'none',
          }}>
            {(user?.fullName || user?.name || '?').charAt(0).toUpperCase()}
          </div>
        </div>
      </nav>

      {/* ── Body: sidebar + canvas ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── Sidebar ── */}
        <aside style={{
          width: '196px', flexShrink: 0,
          background: surface, borderRight: `1px solid ${border}`,
          display: 'flex', flexDirection: 'column',
          padding: '12px 10px', gap: '4px', overflowY: 'auto',
        }}>
          <div style={{ fontSize: '10px', fontWeight: '700', color: textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 6px 6px' }}>Tools</div>
          {TOOLS.map(t => <SideBtn key={t.id} tool={t} />)}

          {activeTool === 'smart' && (
            <div style={{
              margin: '4px 6px 0',
              padding: '10px',
              borderRadius: '8px',
              background: dark ? '#0d2a14' : '#dcfce7',
              border: `1px solid ${accent}`,
              fontSize: '11px',
              color: accent,
              lineHeight: '1.4'
            }}>
              ✨ Draw a circle, rect or straight line — snaps to perfect shape
            </div>
          )}

          <div style={{ height: '1px', background: border, margin: '14px 0 10px' }} />

          <div style={{ fontSize: '10px', fontWeight: '700', color: textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 6px 6px' }}>Color</div>
          <div style={{ padding: '0 4px' }}>
            <label style={{
              width: '100%', height: '36px', borderRadius: '6px',
              background: strokeColor, display: 'block', cursor: 'pointer',
              border: `1px solid ${border}`
            }}>
              <input type="color" value={strokeColor} onChange={e => { setStrokeColor(e.target.value); strokeColorRef.current = e.target.value; updateBrush(e.target.value, strokeWidthRef.current) }}
                style={{ opacity: 0, width: '1px', height: '1px' }} />
            </label>
          </div>

          <div style={{ height: '1px', background: border, margin: '14px 0 10px' }} />

          <div style={{ fontSize: '10px', fontWeight: '700', color: textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 6px 6px' }}>Stroke: {strokeWidth}px</div>
          <div style={{ padding: '0 4px', display: 'flex', alignItems: 'center', height: '24px' }}>
            <input type="range" min="1" max="20" value={strokeWidth}
              onChange={e => {
                const w = Number(e.target.value)
                setStrokeWidth(w)
                strokeWidthRef.current = w
                updateBrush(strokeColorRef.current, w)
              }}
              style={{ width: '100%', accentColor: accent, cursor: 'pointer' }} />
          </div>

          <div style={{ height: '1px', background: border, margin: '14px 0 10px' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button onClick={deleteSelected} style={{
              display: 'flex', alignItems: 'center', gap: '9px',
              padding: '8px 11px', borderRadius: '9px', width: '100%',
              border: `1px solid ${dark ? '#7f1d1d' : '#fca5a5'}`, background: 'transparent',
              color: '#ef4444', cursor: 'pointer', fontSize: '13px',
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = dark ? '#450a0a' : '#fee2e2' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Delete selected
            </button>
            <button onClick={() => { if (window.confirm('Clear the entire canvas? This cannot be undone.')) clearCanvas() }} style={{
              display: 'flex', alignItems: 'center', gap: '9px',
              padding: '8px 11px', borderRadius: '9px', width: '100%',
              border: `1px solid ${dark ? '#7f1d1d' : '#fca5a5'}`, background: 'transparent',
              color: '#ef4444', cursor: 'pointer', fontSize: '13px',
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = dark ? '#450a0a' : '#fee2e2' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
              </svg>
              Clear canvas
            </button>
          </div>
        </aside>

        {/* ── Canvas ── */}
        <main style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <canvas ref={canvasRef} />
        </main>
      </div>
    </div>
  )
}