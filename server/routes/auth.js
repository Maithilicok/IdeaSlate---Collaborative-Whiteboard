import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import User from '../models/User.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Helpers 

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })

const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  })
}

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })
  await transporter.sendMail({
    from: `"IdeaSlate" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  })
}

const otpEmailHtml = (otp) => `
  <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0d180d;border-radius:12px;border:1px solid #1a341a;">
    <h2 style="color:#4ade80;margin-bottom:8px;">Verify your email</h2>
    <p style="color:#deeede;margin-bottom:24px;">Use the code below to verify your IdeaSlate account. It expires in <b>10 minutes</b>.</p>
    <div style="letter-spacing:10px;font-size:36px;font-weight:700;color:#4ade80;background:#0b2010;border:1px solid #2a5a2a;border-radius:10px;padding:20px;text-align:center;">
      ${otp}
    </div>
    <p style="color:#527a52;margin-top:24px;font-size:13px;">If you didn't create an account, you can safely ignore this email.</p>
  </div>
`

//Register

router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body

    const userExists = await User.findOne({ email })
    if (userExists && userExists.isVerified) {
      return res.status(400).json({ message: 'User already exists' })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000)

    let user
    if (userExists && !userExists.isVerified) {
      userExists.name = fullName
      userExists.password = hashedPassword
      userExists.otp = otp
      userExists.otpExpires = otpExpires
      user = await userExists.save()
    } else {
      user = await User.create({
        name: fullName, email,
        password: hashedPassword,
        otp, otpExpires
      })
    }

    await sendEmail({
      to: email,
      subject: 'Your IdeaSlate verification code',
      html: otpEmailHtml(otp)
    })

    res.status(201).json({ message: 'OTP sent', email: user.email })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

//Verify OTP

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body

    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.isVerified) return res.status(400).json({ message: 'Email already verified' })
    if (!user.otp || user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' })
    if (user.otpExpires < Date.now()) return res.status(400).json({ message: 'OTP has expired. Please request a new one.' })

    user.isVerified = true
    user.otp = null
    user.otpExpires = null
    await user.save()

    const token = generateToken(user._id)
    setTokenCookie(res, token)

    res.json({ _id: user._id, name: user.name, email: user.email, createdAt: user.createdAt })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Resend OTP

router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.isVerified) return res.status(400).json({ message: 'Email already verified' })

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    user.otp = otp
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000)
    await user.save()

    await sendEmail({
      to: email,
      subject: 'Your new IdeaSlate verification code',
      html: otpEmailHtml(otp)
    })

    res.json({ message: 'New OTP sent' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

//Login

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: 'Invalid credentials' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' })

    if (!user.isVerified) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString()
      user.otp = otp
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000)
      await user.save()
      await sendEmail({
        to: email,
        subject: 'Your IdeaSlate verification code',
        html: otpEmailHtml(otp)
      })
      return res.status(403).json({
        message: 'Please verify your email first. A new code has been sent.',
        email,
        needsVerification: true
      })
    }

    const token = generateToken(user._id)
    setTokenCookie(res, token)
    res.json({ _id: user._id, name: user.name, email: user.email, createdAt: user.createdAt })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

//Logout 

router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
  })
  res.json({ message: 'Logged out successfully' })
})

//Get current user 

router.get('/me', protect, (req, res) => {
  res.json(req.user)
})

//Forgot password 

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email })

    if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' })
    if (!user.isVerified) return res.status(400).json({ message: 'Please verify your email before resetting your password.' })

    const token = crypto.randomBytes(32).toString('hex')
    user.resetPasswordToken = token
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 30
    await user.save()

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`

    await sendEmail({
      to: user.email,
      subject: 'Reset your IdeaSlate password',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0d180d;border-radius:12px;border:1px solid #1a341a;">
          <h2 style="color:#4ade80;margin-bottom:8px;">Reset your password</h2>
          <p style="color:#deeede;margin-bottom:24px;">Click the button below to reset your password. This link expires in <b>30 minutes</b>.</p>
          <a href="${resetUrl}" style="display:inline-block;padding:12px 28px;background:#4ade80;color:#000;font-weight:700;border-radius:8px;text-decoration:none;">
            Reset Password →
          </a>
          <p style="color:#527a52;margin-top:24px;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `
    })

    res.json({ message: 'If that email exists, a reset link has been sent.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

//Reset password 

router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    })

    if (!user) return res.status(400).json({ message: 'Reset link is invalid or has expired.' })
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' })

    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(password, salt)
    user.resetPasswordToken = null
    user.resetPasswordExpires = null
    await user.save()

    res.json({ message: 'Password reset successful. You can now log in.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router