import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

export const connectDB = async () => {
  const localUri = 'mongodb://127.0.0.1:27017/ideaslate'
  const uri = process.env.MONGO_URI || localUri
  try {
    console.log(`Connecting to MongoDB...`)
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
    console.log('✅ Connected to MongoDB Atlas cluster successfully!')
  } catch (err) {
    console.error('❌ Primary MongoDB Atlas connection failed:', err.message)
    if (uri !== localUri) {
      try {
        console.warn('⚠️ WARNING: Falling back to LOCAL MongoDB database at:', localUri)
        await mongoose.connect(localUri, { serverSelectionTimeoutMS: 5000 })
        console.log('Connected to LOCAL MongoDB fallback.')
      } catch (fallbackErr) {
        console.error('MongoDB connection failed completely:', fallbackErr.message)
      }
    }
  }
}
