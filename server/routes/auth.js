const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const MentorProfile = require('../models/MentorProfile')
const auth = require('../middleware/auth')
const crypto = require('crypto')
const { sendResetEmail } = require('../utils/email')

const router = express.Router()

function signToken(user) {
  return jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production'
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: isProd ? 'none' : 'lax',
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' })
    const exists = await User.findOne({ email })
    if (exists) return res.status(409).json({ message: 'Email already in use' })
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, passwordHash })
    const token = signToken(user)
    setAuthCookie(res, token)
    return res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ message: 'Server error' })
  }
})

// Registration with role selection (secure constraints)
// Updated mentor logic: requesting mentor role creates normal user + pending application; admin must approve.
// Rules:
// - Standard user default
// - Mentor role request => user created as 'user' and MentorApplication stored (pending). Admin later approves.
// - Admin role ONLY allowed if no admin exists yet.
router.post('/register-with-role', async (req, res) => {
  try {
    const { name, email, password, role } = req.body
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' })
    const exists = await User.findOne({ email })
    if (exists) return res.status(409).json({ message: 'Email already in use' })
    const passwordHash = await bcrypt.hash(password, 10)
    let finalRole = 'user'
    if (role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' })
      if (adminCount === 0) finalRole = 'admin'
      else return res.status(403).json({ message: 'Admin already exists. Ask an existing admin to create more.' })
    }
    const user = await User.create({ name, email, passwordHash, role: finalRole })
    if (role === 'mentor') {
      // create pending mentor application instead of granting role immediately
      try {
        const MentorApplication = require('../models/MentorApplication')
        await MentorApplication.create({ name, email, bio: '', expertise: [], yearsExperience: 0, status: 'pending' })
      } catch (e) { console.warn('mentor application create failed', e.message) }
    }
    const token = signToken(user)
    setAuthCookie(res, token)
    return res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ message: 'Server error' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Missing fields' })
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' })
    // Auto-promote first ever user to admin (if no admin exists yet)
    try {
      const adminCount = await User.countDocuments({ role: 'admin' })
      if (adminCount === 0 && user.role !== 'admin') {
        user.role = 'admin'
        await user.save()
        console.log('[auth] First user auto-promoted to admin:', user.email)
      }
    } catch (e) {
      console.warn('[auth] auto-promote check failed:', e.message)
    }
    const token = signToken(user)
    setAuthCookie(res, token)
    return res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ message: 'Server error' })
  }
})

router.post('/logout', (req, res) => {
  const isProd = process.env.NODE_ENV === 'production'
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: isProd ? 'none' : 'lax',
    secure: isProd,
  })
  res.json({ message: 'Logged out' })
})

router.get('/me', auth(false), async (req, res) => {
  if (!req.user) return res.json({ user: null })
  const user = await User.findById(req.user.id).select('name email role')
  res.json({ user })
})

// Forgot password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ message: 'Email is required' })
  const user = await User.findOne({ email })
  if (!user) return res.json({ message: 'If that account exists, we sent a reset link.' })
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30) // 30 minutes
  user.resetToken = token
  user.resetTokenExpiresAt = expiresAt
  await user.save()
  const base = process.env.CLIENT_URL || 'http://localhost:5173'
  const link = `${base}/reset-password/${token}`
  await sendResetEmail(user.email, link)
  res.json({ message: 'Reset link sent' })
})

// Reset password
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params
  const { password } = req.body
  if (!password) return res.status(400).json({ message: 'Password is required' })
  const user = await User.findOne({ resetToken: token, resetTokenExpiresAt: { $gt: new Date() } })
  if (!user) return res.status(400).json({ message: 'Invalid or expired token' })
  const bcrypt = require('bcryptjs')
  user.passwordHash = await bcrypt.hash(password, 10)
  user.resetToken = undefined
  user.resetTokenExpiresAt = undefined
  await user.save()
  res.json({ message: 'Password updated' })
})

// Dev-only helper: fetch latest reset link for a given email
if (process.env.NODE_ENV !== 'production') {
  router.get('/_dev/reset-link', async (req, res) => {
    const { email } = req.query
    if (!email) return res.status(400).json({ message: 'email is required' })
    const user = await User.findOne({ email })
    if (!user || !user.resetToken || user.resetTokenExpiresAt < new Date()) {
      return res.status(404).json({ message: 'No active reset token for this user' })
    }
    const base = process.env.CLIENT_URL || 'http://localhost:5173'
    return res.json({ link: `${base}/reset-password/${user.resetToken}` })
  })

  // Create first admin if none exists (dev only)
  router.post('/bootstrap-admin', async (req, res) => {
    const { email, password, name } = req.body || {}
    if (!email || !password) return res.status(400).json({ message: 'email & password required' })
    const admins = await User.countDocuments({ role: 'admin' })
    if (admins > 0) return res.status(400).json({ message: 'Admin already exists' })
    const exists = await User.findOne({ email })
    if (exists) return res.status(409).json({ message: 'Email already in use' })
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ name: name || 'Administrator', email, passwordHash, role: 'admin' })
    const token = signToken(user)
    setAuthCookie(res, token)
    res.status(201).json({ user: { id: user._id, email: user.email, role: user.role } })
  })
}

module.exports = router
