import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import authRoutes from './routes/auth.js'
import roomRoutes from './routes/room.js'
import boardRoutes from './routes/board.js'
import { initSocket } from './sockets/boardSocket.js'

dotenv.config()
connectDB()

const app = express()
const httpServer = createServer(app)
// Parse CLIENT_URL safely, removing trailing slashes and splitting by comma
const clientUrls = (process.env.CLIENT_URL || '')
  .split(',')
  .map(url => url.trim().replace(/\/$/, ''))

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true)
    
    // ALlow local dev, exact matches from .env, or any Vercel preview/production links
    if (
      origin.includes('localhost') || 
      origin.includes('127.0.0.1') || 
      clientUrls.includes(origin) || 
      origin.endsWith('.vercel.app')
    ) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}

const io = new Server(httpServer, {
  cors: corsOptions
})

app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/rooms', roomRoutes)
app.use('/api/boards', boardRoutes)

app.get('/', (req, res) => {
  res.send('IdeaSlate API is running!')
})

// FIX #3: Health endpoint — point UptimeRobot at /health every 5 min
// to prevent Render free tier from spinning down and causing 30s cold starts
app.get('/health', (req, res) => {
  res.json({ ok: true, ts: Date.now() })
})

initSocket(io)

httpServer.listen(process.env.PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${process.env.PORT}`)
})

export { io }