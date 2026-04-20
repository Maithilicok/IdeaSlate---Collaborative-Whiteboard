import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { io } from 'socket.io-client'
import axios from 'axios'
import toast from 'react-hot-toast'

// ── Shape recognition (Smart draw only) ──
function getBoundingBox(points) {
  const xs = points.map(p => p.x)
  const ys = points.map(p => p.y)
  return {
    minX: Math.min(...xs), maxX: Math.max(...xs),
    minY: Math.min(...ys), maxY: Math.max(...ys),
  }
}

function recogniseShape(path) {
  const cmds = path.path
  if (!cmds || cmds.length < 10) return null

  const points = []
  for (const cmd of cmds) {
    if (['M', 'L', 'Q', 'C'].includes(cmd[0])) {
      points.push({ x: cmd[cmd.length - 2], y: cmd[cmd.length - 1] })
    }
  }
  if (points.length < 15) return null

  const { minX, maxX, minY, maxY } = getBoundingBox(points)
  const width = maxX - minX
  const height = maxY - minY

  // Must be a meaningful size
  if (width < 40 || height < 40) return null

  const first = points[0]
  const last = points[points.length - 1]
  const closureDistance = Math.hypot(last.x - first.x, last.y - first.y)
  const diagonal = Math.hypot(width, height)

  // Must clearly close back to start to be a shape
  const isClosed = closureDistance < diagonal * 0.15

  if (isClosed) {
    // Check how circular it is by measuring point distances from center
    const cx = minX + width / 2
    const cy = minY + height / 2
    const avgRadius = points.reduce((sum, p) =>
      sum + Math.hypot(p.x - cx, p.y - cy), 0) / points.length

    const radialVariance = points.reduce((sum, p) => {
      const diff = Math.hypot(p.x - cx, p.y - cy) - avgRadius
      return sum + diff * diff
    }, 0) / points.length

    const normalizedVariance = Math.sqrt(radialVariance) / avgRadius

    // Circle: points stay close to a constant radius AND bounding box is squarish
    const aspectRatio = Math.min(width, height) / Math.max(width, height)
    if (normalizedVariance < 0.18 && aspectRatio > 0.75) return 'circle'

    // Rectangle: check points hug the bounding box edges
    const margin = Math.min(width, height) * 0.15
    let onEdge = 0
    for (const p of points) {
      if (
        Math.abs(p.x - minX) < margin || Math.abs(p.x - maxX) < margin ||
        Math.abs(p.y - minY) < margin || Math.abs(p.y - maxY) < margin
      ) onEdge++
    }
    if (onEdge / points.length > 0.75) return 'rect'
  }

  // Straight line: open path, very low deviation
  if (!isClosed) {
    const dx = last.x - first.x
    const dy = last.y - first.y
    const straightDist = Math.hypot(dx, dy)
    if (straightDist < 60) return null

    let maxDeviation = 0
    for (const p of points) {
      const t = ((p.x - first.x) * dx + (p.y - first.y) * dy) / (straightDist ** 2 || 1)
      const proj = { x: first.x + t * dx, y: first.y + t * dy }
      maxDeviation = Math.max(maxDeviation, Math.hypot(p.x - proj.x, p.y - proj.y))
    }
    // Very strict — must be within 6% of length
    if (maxDeviation < straightDist * 0.06) return 'line'
  }

  return null
}

function createPerfectShape(fabricModule, path, shapeType, strokeColor, strokeWidth) {
  const points = path.path
    .filter(cmd => ['M', 'L', 'Q', 'C'].includes(cmd[0]))
    .map(cmd => ({ x: cmd[cmd.length - 2], y: cmd[cmd.length - 1] }))

  const { minX, maxX, minY, maxY } = getBoundingBox(points)
  const w = maxX - minX
  const h = maxY - minY

  const common = {
    fill: 'transparent',
    stroke: strokeColor,
    strokeWidth,
    selectable: true,
    id: crypto.randomUUID(),
  }

  if (shapeType === 'circle') {
    return new fabricModule.Ellipse({
      ...common,
      left: minX, top: minY,
      rx: w / 2, ry: h / 2,
    })
  }
  if (shapeType === 'rect') {
    return new fabricModule.Rect({
      ...common,
      left: minX, top: minY,
      width: w, height: h,
    })
  }
  if (shapeType === 'line') {
    const first = points[0]
    const last = points[points.length - 1]
    return new fabricModule.Line([first.x, first.y, last.x, last.y], { ...common })
  }
  return null
}

const TOOLS = [
  { id: 'draw',     label: 'Draw',       icon: '✏' },
  { id: 'smart',    label: 'Smart draw', icon: '✨' },
  { id: 'eraser',   label: 'Eraser',     icon: '◻' },
  { id: 'text',     label: 'Text',       icon: 'T' },
  { id: 'circle',   label: 'Circle',     icon: '○' },
  { id: 'rect',     label: 'Rectangle',  icon: '▭' },
  { id: 'triangle', label: 'Triangle',   icon: '△' },
  { id: 'select',   label: 'Select',     icon: '↖' },
]

export default function Board() {
  const { roomId } = useParams()
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()
  const navigate = useNavigate()

  const canvasRef = useRef(null)
  const fabricRef = useRef(null)
  const fabricModuleRef = useRef(null)
  const socketRef = useRef(null)
  const isReceiving = useRef(false)
  const activeToolRef = useRef('draw')
  const strokeColorRef = useRef('#4ade80')
  const strokeWidthRef = useRef(3)

  const [activeTool, setActiveTool] = useState('draw')
  const [strokeColor, setStrokeColor] = useState('#4ade80')
  const [strokeWidth, setStrokeWidth] = useState(3)
  const [showProfile, setShowProfile] = useState(false)

  useEffect(() => {
    if (!fabricRef.current) return
    fabricRef.current.backgroundColor = theme === 'dark' ? '#0a0f0a' : '#f0faf0'
    fabricRef.current.renderAll()
  }, [theme])

  useEffect(() => {
    let canvas

    const init = async () => {
      const fabricModule = await import('fabric')
      fabricModuleRef.current = fabricModule
      const { Canvas, PencilBrush } = fabricModule

      canvas = new Canvas(canvasRef.current, {
        backgroundColor: theme === 'dark' ? '#0a0f0a' : '#f0faf0',
        width: window.innerWidth - 220,
        height: window.innerHeight - 60,
      })
      fabricRef.current = canvas

      const brush = new PencilBrush(canvas)
      brush.color = '#4ade80'
      brush.width = 3
      canvas.freeDrawingBrush = brush
      canvas.isDrawingMode = true

      // Keyboard delete
      const handleKeyDown = (e) => {
        if ((e.key === 'Delete' || e.key === 'Backspace') && !e.target.matches('input, textarea')) {
          const active = canvas.getActiveObject()
          if (active) {
            canvas.remove(active)
            canvas.renderAll()
            const json = JSON.stringify(canvas.toJSON(['id']))
            socketRef.current?.emit('canvas:draw', { roomId, data: json })
          }
        }
      }
      window.addEventListener('keydown', handleKeyDown)

      // Load board
      try {
        const res = await axios.get(`/api/boards/${roomId}`, { withCredentials: true })
        if (res.data.canvasJSON) {
          await canvas.loadFromJSON(JSON.parse(res.data.canvasJSON))
          canvas.renderAll()
        }
      } catch { console.log('No saved board') }

      // Socket
      socketRef.current = io('http://localhost:5000', { withCredentials: true })
      socketRef.current.emit('join-room', roomId)

      socketRef.current.on('canvas:draw', async (json) => {
        isReceiving.current = true
        try {
          await canvas.loadFromJSON(JSON.parse(json))
          canvas.renderAll()
        } catch (e) { console.error(e) }
        isReceiving.current = false
      })

      socketRef.current.on('canvas:clear', () => {
        canvas.clear()
        canvas.backgroundColor = theme === 'dark' ? '#0a0f0a' : '#f0faf0'
        canvas.renderAll()
      })

      canvas.on('object:added', (e) => {
        if (isReceiving.current) return
        const obj = e.target
        if (!obj.id) obj.id = crypto.randomUUID()

        // Smart draw — only try to recognise if tool is 'smart' AND it's a path
        if (obj.type === 'path' && activeToolRef.current === 'smart') {
          const shapeType = recogniseShape(obj)
          if (shapeType) {
            const perfect = createPerfectShape(
              fabricModuleRef.current, obj, shapeType,
              strokeColorRef.current, strokeWidthRef.current
            )
            if (perfect) {
              canvas.remove(obj)
              canvas.add(perfect)
              canvas.renderAll()
              const json = JSON.stringify(canvas.toJSON(['id']))
              socketRef.current?.emit('canvas:draw', { roomId, data: json })
              return
            }
          }
        }

        const json = JSON.stringify(canvas.toJSON(['id']))
        socketRef.current?.emit('canvas:draw', { roomId, data: json })
      })

      canvas.on('object:modified', () => {
        if (isReceiving.current) return
        const json = JSON.stringify(canvas.toJSON(['id']))
        socketRef.current?.emit('canvas:draw', { roomId, data: json })
      })

      canvas.on('object:removed', () => {
        if (isReceiving.current) return
        const json = JSON.stringify(canvas.toJSON(['id']))
        socketRef.current?.emit('canvas:draw', { roomId, data: json })
      })

      const handleResize = () => {
        canvas.setDimensions({
          width: window.innerWidth - 220,
          height: window.innerHeight - 60,
        })
        canvas.renderAll()
      }
      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('keydown', handleKeyDown)
        window.removeEventListener('resize', handleResize)
      }
    }

    init()

    return () => {
      if (canvas) canvas.dispose()
      if (socketRef.current) socketRef.current.disconnect()
    }
  }, [roomId])

  const applyTool = async (tool) => {
    if (!fabricRef.current || !fabricModuleRef.current) return
    const canvas = fabricRef.current
    const fab = fabricModuleRef.current
    const { PencilBrush, Rect, Ellipse, Triangle, IText } = fab

    activeToolRef.current = tool
    setActiveTool(tool)

    const color = strokeColorRef.current
    const width = strokeWidthRef.current

    const common = {
      fill: 'transparent',
      stroke: color,
      strokeWidth: width,
      selectable: true,
      id: crypto.randomUUID(),
    }

    if (tool === 'draw' || tool === 'smart') {
      canvas.isDrawingMode = true
      const brush = new PencilBrush(canvas)
      brush.color = color
      brush.width = width
      canvas.freeDrawingBrush = brush

    } else if (tool === 'eraser') {
      canvas.isDrawingMode = true
      const brush = new PencilBrush(canvas)
      brush.color = canvas.backgroundColor || '#0a0f0a'
      brush.width = 24
      canvas.freeDrawingBrush = brush

    } else if (tool === 'select') {
      canvas.isDrawingMode = false
      canvas.selection = true

    } else if (tool === 'rect') {
      canvas.isDrawingMode = false
      canvas.add(new Rect({ ...common, left: 160, top: 160, width: 160, height: 100 }))
      canvas.renderAll()

    } else if (tool === 'circle') {
      canvas.isDrawingMode = false
      canvas.add(new Ellipse({ ...common, left: 160, top: 160, rx: 70, ry: 50 }))
      canvas.renderAll()

    } else if (tool === 'triangle') {
      canvas.isDrawingMode = false
      canvas.add(new Triangle({ ...common, left: 160, top: 160, width: 120, height: 100 }))
      canvas.renderAll()

    } else if (tool === 'text') {
      canvas.isDrawingMode = false
      const text = new IText('Type here...', {
        left: 160, top: 160,
        fontSize: 20, fill: color,
        fontFamily: 'Inter',
        id: crypto.randomUUID(),
      })
      canvas.add(text)
      canvas.setActiveObject(text)
      text.enterEditing()
      canvas.renderAll()
    }
  }

  const updateBrush = (color, width) => {
    strokeColorRef.current = color
    strokeWidthRef.current = width
    if (!fabricRef.current) return
    const canvas = fabricRef.current
    if (canvas.isDrawingMode && canvas.freeDrawingBrush) {
      if (activeTool === 'eraser') {
        canvas.freeDrawingBrush.width = 24
      } else {
        canvas.freeDrawingBrush.color = color
        canvas.freeDrawingBrush.width = width
      }
    }
  }

  const deleteSelected = () => {
    if (!fabricRef.current) return
    const active = fabricRef.current.getActiveObject()
    if (!active) return toast.error('Select an element first')
    fabricRef.current.remove(active)
    fabricRef.current.renderAll()
    const json = JSON.stringify(fabricRef.current.toJSON(['id']))
    socketRef.current?.emit('canvas:draw', { roomId, data: json })
    toast.success('Deleted!')
  }

  const clearCanvas = () => {
    if (!fabricRef.current) return
    fabricRef.current.clear()
    fabricRef.current.backgroundColor = theme === 'dark' ? '#0a0f0a' : '#f0faf0'
    fabricRef.current.renderAll()
    socketRef.current?.emit('canvas:clear', roomId)
  }

  const saveBoard = async () => {
    try {
      const json = JSON.stringify(fabricRef.current.toJSON(['id']))
      await axios.put(`/api/boards/${roomId}`, { canvasJSON: json }, { withCredentials: true })
      toast.success('Board saved!')
    } catch { toast.error('Failed to save') }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied!')
  }

  const dark = theme === 'dark'
  const bg = dark ? '#0a0f0a' : '#f0faf0'
  const surface = dark ? '#0f1a0f' : '#e8f5e8'
  const border = dark ? '#1e3a1e' : '#b8ddb8'
  const textPrimary = dark ? '#e0f0e0' : '#0a1a0a'
  const textMuted = dark ? '#5a8a5a' : '#4a7a4a'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: bg }}>

      {/* Topbar */}
      <div style={{
        height: '60px', background: surface,
        borderBottom: `1px solid ${border}`,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 1rem', flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate('/dashboard')} style={{
            padding: '6px 12px', borderRadius: '8px',
            border: `1px solid ${border}`, background: 'transparent',
            color: textMuted, cursor: 'pointer', fontSize: '13px'
          }}>← Back</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '6px',
              background: '#4ade80', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', color: '#000'
            }}>I</div>
            <span style={{ fontSize: '16px', fontWeight: '600', color: textPrimary }}>IdeaSlate</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={toggleTheme} style={{
            padding: '6px 12px', borderRadius: '8px',
            border: `1px solid ${border}`, background: 'transparent',
            color: textMuted, cursor: 'pointer', fontSize: '13px'
          }}>{dark ? '☀ Light' : '☾ Dark'}</button>
          <button onClick={copyLink} style={{
            padding: '6px 14px', borderRadius: '8px',
            border: `1px solid ${border}`, background: 'transparent',
            color: textPrimary, cursor: 'pointer', fontSize: '13px'
          }}>Share</button>
          <button onClick={saveBoard} style={{
            padding: '6px 14px', borderRadius: '8px',
            border: 'none', background: '#4ade80',
            color: '#000', cursor: 'pointer', fontSize: '13px', fontWeight: '600'
          }}>Save</button>
          <div onClick={() => setShowProfile(true)} style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: '#0f2a0f', border: '1.5px solid #4ade80',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#4ade80', fontWeight: '600', fontSize: '14px', cursor: 'pointer'
          }}>{user?.name?.charAt(0).toUpperCase()}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Sidebar */}
        <div style={{
          width: '220px', background: surface,
          borderRight: `1px solid ${border}`,
          padding: '1rem', display: 'flex',
          flexDirection: 'column', gap: '6px',
          flexShrink: 0, overflowY: 'auto'
        }}>
          <div style={{ fontSize: '11px', color: textMuted, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Tools
          </div>

          {TOOLS.map(tool => (
            <button key={tool.id} onClick={() => applyTool(tool.id)} style={{
              padding: '8px 12px', borderRadius: '8px',
              border: activeTool === tool.id ? '1px solid #4ade80' : `1px solid ${border}`,
              background: activeTool === tool.id ? '#0f2a0f' : 'transparent',
              color: activeTool === tool.id ? '#4ade80' : textMuted,
              cursor: 'pointer', fontSize: '13px', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <span>{tool.icon}</span> {tool.label}
            </button>
          ))}

          {activeTool === 'smart' && (
            <div style={{
              fontSize: '11px', color: '#4ade80', padding: '6px 8px',
              borderRadius: '6px', background: '#0f2a0f',
              border: `1px solid ${border}`, lineHeight: '1.5'
            }}>
              ✨ Draw a circle, rect or straight line — snaps to perfect shape
            </div>
          )}

          <div style={{ borderTop: `1px solid ${border}`, paddingTop: '12px', marginTop: '4px' }}>
            <div style={{ fontSize: '11px', color: textMuted, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Color
            </div>
            <input type="color" value={strokeColor}
              onChange={e => { setStrokeColor(e.target.value); updateBrush(e.target.value, strokeWidth) }}
              style={{ width: '100%', height: '36px', borderRadius: '8px', border: `1px solid ${border}`, cursor: 'pointer', background: 'transparent' }}
            />
          </div>

          <div>
            <div style={{ fontSize: '11px', color: textMuted, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Stroke: {strokeWidth}px
            </div>
            <input type="range" min="1" max="20" value={strokeWidth}
              onChange={e => { const v = Number(e.target.value); setStrokeWidth(v); updateBrush(strokeColor, v) }}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ borderTop: `1px solid ${border}`, paddingTop: '10px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button onClick={deleteSelected} style={{
              padding: '8px 12px', borderRadius: '8px',
              border: `1px solid ${border}`, background: 'transparent',
              color: '#e05555', cursor: 'pointer', fontSize: '13px', textAlign: 'left'
            }}>✕ Delete selected</button>
            <button onClick={clearCanvas} style={{
              padding: '8px 12px', borderRadius: '8px',
              border: '1px solid #3a1a1a', background: 'transparent',
              color: '#e05555', cursor: 'pointer', fontSize: '13px', textAlign: 'left'
            }}>⊘ Clear canvas</button>
          </div>
        </div>

        {/* Canvas */}
        <div style={{ flex: 1, overflow: 'hidden', background: bg }}>
          <canvas ref={canvasRef} />
        </div>
      </div>

      {/* Profile modal */}
      {showProfile && (
        <div onClick={() => setShowProfile(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: surface, border: `1px solid ${border}`,
            borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '380px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '1.5rem' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: '#0f2a0f', border: '2px solid #4ade80',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#4ade80', fontWeight: '700', fontSize: '22px'
              }}>{user?.name?.charAt(0).toUpperCase()}</div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: textPrimary }}>{user?.name}</div>
                <div style={{ fontSize: '13px', color: textMuted }}>Member</div>
              </div>
            </div>

            {[
              { label: 'Email', value: user?.email },
              { label: 'Password', value: '••••••••' },
              { label: 'Joined', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A' },
            ].map(row => (
              <div key={row.label} style={{
                padding: '12px 14px', background: bg,
                borderRadius: '10px', border: `1px solid ${border}`, marginBottom: '10px'
              }}>
                <div style={{ fontSize: '11px', color: textMuted, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{row.label}</div>
                <div style={{ fontSize: '14px', color: textPrimary }}>{row.value}</div>
              </div>
            ))}

            <button onClick={() => setShowProfile(false)} style={{
              marginTop: '0.5rem', width: '100%', padding: '10px',
              borderRadius: '8px', border: `1px solid ${border}`,
              background: 'transparent', color: textMuted, cursor: 'pointer', fontSize: '14px'
            }}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
