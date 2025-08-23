const express = require('express')
const auth = require('../middleware/auth')
const User = require('../models/User')

const router = express.Router()

router.get('/profile', auth(true), async (req, res) => {
  const user = await User.findById(req.user.id).select('name email role skills goal avatarUrl createdAt updatedAt')
  res.json({ user })
})

router.patch('/profile', auth(true), async (req, res) => {
  const { name, goal, skills, avatarUrl } = req.body || {}
  const update = {}
  if (typeof name === 'string') update.name = name.trim().slice(0, 80)
  if (typeof goal === 'string') update.goal = goal.trim().slice(0, 160)
  if (Array.isArray(skills)) update.skills = skills.map(s => String(s).trim().toLowerCase()).filter(Boolean).slice(0, 50)
  if (typeof avatarUrl === 'string') update.avatarUrl = avatarUrl.trim()
  const user = await User.findByIdAndUpdate(req.user.id, update, { new: true }).select('name email role skills goal avatarUrl')
  res.json({ user })
})

module.exports = router
