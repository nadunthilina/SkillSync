const express = require('express')
const auth = require('../middleware/auth')
const User = require('../models/User')
const MentorApplication = require('../models/MentorApplication')

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

// Choose a mentor
router.post('/choose-mentor', auth(true), async (req, res) => {
  const { mentorId } = req.body
  if (!mentorId) return res.status(400).json({ message: 'mentorId required' })
  const mentor = await User.findById(mentorId)
  if (!mentor || mentor.role !== 'mentor') return res.status(400).json({ message: 'Invalid mentor' })
  await User.findByIdAndUpdate(req.user.id, { chosenMentor: mentorId })
  res.json({ ok: true })
})

// User progress (basic placeholder metrics for dashboard charts)
router.get('/progress', auth(true), async (req, res) => {
  const user = await User.findById(req.user.id).select('skills createdAt')
  const skillsCount = (user.skills || []).length
  const goalSkillsCount = 30 // arbitrary target
  const completionPercent = Math.min(100, Math.round((skillsCount / goalSkillsCount) * 100))
  // Build last 8 weeks hours (mock data using deterministic pattern)
  const weeks = []
  const now = new Date()
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i * 7)
    const hours = (skillsCount % 5) + ( (7 - i) % 3 ) + 1 // small variation
    weeks.push({ weekStart: d.toISOString().slice(0,10), hours })
  }
  // Category distribution (by first letter group as simple proxy)
  const catMap = {}
  for (const s of user.skills || []) {
    const key = s[0]?.toUpperCase() || '?'
    catMap[key] = (catMap[key] || 0) + 1
  }
  const categories = Object.entries(catMap).slice(0,8).map(([k,v])=>({ name:k, value:v }))
  if (!categories.length) categories.push({ name: 'No Skills', value: 1 })
  res.json({ progress: { skillsCount, goalSkillsCount, completionPercent, weeks, categories } })
})

// Submit mentor application (if user didn't apply during registration)
router.post('/mentor-application', auth(true), async (req, res) => {
  const user = await User.findById(req.user.id).select('name email')
  if (!user) return res.status(404).json({ message: 'User not found' })
  const existing = await MentorApplication.findOne({ email: user.email, status: { $in: ['pending','approved'] } })
  if (existing) return res.status(400).json({ message: 'Application already exists or approved' })
  const { expertise = [], bio = '', yearsExperience = 0, phone = '', refNo = '' } = req.body || {}
  const app = await MentorApplication.create({ name: user.name, email: user.email, expertise, bio, yearsExperience, phone, refNo })
  res.json({ message: 'Application submitted', applicationId: app._id })
})

// Check mentor application status
router.get('/mentor-application/status', auth(true), async (req, res) => {
  const user = await User.findById(req.user.id).select('email role')
  if (!user) return res.status(404).json({ message: 'User not found' })
  if (user.role === 'mentor') return res.json({ status: 'approved' })
  const app = await MentorApplication.findOne({ email: user.email }).sort({ createdAt: -1 })
  if (!app) return res.json({ status: 'none' })
  res.json({ status: app.status, application: { id: app._id, status: app.status, submittedAt: app.createdAt, decidedAt: app.decidedAt, notes: app.notes } })
})

module.exports = router
