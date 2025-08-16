const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const auth = require('../middleware/auth')

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

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Missing fields' })
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' })
    const token = signToken(user)
    setAuthCookie(res, token)
    return res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ message: 'Server error' })
  }
})

router.post('/logout', (req, res) => {
  res.clearCookie('token')
  res.json({ message: 'Logged out' })
})

router.get('/me', auth(false), async (req, res) => {
  if (!req.user) return res.json({ user: null })
  const user = await User.findById(req.user.id).select('name email role')
  res.json({ user })
})

module.exports = router
