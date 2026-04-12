import mongoose from 'mongoose'

const boardSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  canvasJSON: {
    type: String,
    default: null
  }
}, { timestamps: true })

export default mongoose.model('Board', boardSchema)