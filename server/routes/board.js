import express from 'express'
import Board from '../models/Board.js'
import Room from '../models/Room.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Helper: verify the requesting user is a member of the room
const requireRoomMember = async (req, res) => {
  const room = await Room.findById(req.params.roomId)
  if (!room) {
    res.status(404).json({ message: 'Room not found' })
    return null
  }
  const isMember = room.members.some(id => id.equals(req.user._id))
  if (!isMember) {
    res.status(403).json({ message: 'Not authorized to access this board' })
    return null
  }
  return room
}

// Get board by room id
router.get('/:roomId', protect, async (req, res) => {
  try {
    const room = await requireRoomMember(req, res)
    if (!room) return

    const board = await Board.findOne({ room: req.params.roomId })
    if (!board) return res.status(404).json({ message: 'Board not found' })

    res.json(board)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Save board canvas
router.put('/:roomId', protect, async (req, res) => {
  try {
    const room = await requireRoomMember(req, res)
    if (!room) return

    const { canvasJSON } = req.body

    const board = await Board.findOneAndUpdate(
      { room: req.params.roomId },
      { canvasJSON, lastUpdated: Date.now() },
      { new: true }
    )

    res.json(board)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router