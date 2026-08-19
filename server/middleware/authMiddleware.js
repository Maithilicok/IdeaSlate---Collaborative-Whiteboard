import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const JWT_SECRET = process.env.JWT_SECRET || 'ideaslate_super_secret_key_2024'

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' })
    }

    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = await User.findById(decoded.id).select('-password')
    next()

  } catch (err) {
    res.status(401).json({ message: 'Not authorized, token failed' })
  }
}