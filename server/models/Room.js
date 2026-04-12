import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  shareLink: {
    type: String,
    default: () => uuidv4()
  }
}, { timestamps: true })

export default mongoose.model('Room', roomSchema)