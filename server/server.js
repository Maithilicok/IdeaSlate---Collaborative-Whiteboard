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
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true
  }
})

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
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

httpServer.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`)
})

export { io }