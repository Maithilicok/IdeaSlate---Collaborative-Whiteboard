import express from 'express'
import Room from '../models/Room.js'
import Board from '../models/Board.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Create room
router.post('/create', protect, async (req, res) => {
  try {
    const { name } = req.body

    const room = await Room.create({
      name,
      owner: req.user._id,
      members: [req.user._id]
    })

    await Board.create({ room: room._id })

    res.status(201).json(room)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get all rooms for current user
router.get('/my-rooms', protect, async (req, res) => {
  try {
    const rooms = await Room.find({ members: req.user._id })
    res.json(rooms)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get a single room by id
router.get('/:roomId', protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId)
    if (!room) return res.status(404).json({ message: 'Room not found' })

    const isMember = room.members.some(id => id.equals(req.user._id))
    if (!isMember) return res.status(403).json({ message: 'Not authorized' })

    res.json(room)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Join room by share link
router.post('/join/:shareLink', protect, async (req, res) => {
  try {
    const room = await Room.findOne({ shareLink: req.params.shareLink })
    if (!room) return res.status(404).json({ message: 'Room not found' })

    const alreadyMember = room.members.some(id => id.equals(req.user._id))
    if (!alreadyMember) {
      room.members.push(req.user._id)
      await room.save()
    }

    res.json(room)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Join room by direct room ID (for /board/:id links)
router.post('/join-by-id/:roomId', protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId)
    if (!room) return res.status(404).json({ message: 'Room not found' })

    const alreadyMember = room.members.some(id => id.equals(req.user._id))
    if (!alreadyMember) {
      room.members.push(req.user._id)
      await room.save()
    }

    res.json(room)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})


// Rename room — only the owner can rename
router.patch('/:roomId', protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId)
    if (!room) return res.status(404).json({ message: 'Room not found' })

    if (!room.owner.equals(req.user._id)) {
      return res.status(403).json({ message: 'Only the board owner can rename it' })
    }

    const { name } = req.body
    if (!name || !name.trim()) return res.status(400).json({ message: 'Name is required' })

    room.name = name.trim()
    await room.save()

    res.json(room)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Delete room — only the owner can delete
router.delete('/:roomId', protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId)
    if (!room) return res.status(404).json({ message: 'Room not found' })

    if (!room.owner.equals(req.user._id)) {
      return res.status(403).json({ message: 'Only the board owner can delete it' })
    }

    await Board.deleteOne({ room: room._id })
    await Room.deleteOne({ _id: room._id })

    res.json({ message: 'Board deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router