const express = require('express')
const auth = require('../middleware/auth')
const User = require('../models/User')
const MentorProfile = require('../models/MentorProfile')

const router = express.Router()

// Public (or authenticated) list of approved mentors with profile data
router.get('/', auth(false), async (req, res) => {
  try {
    const profiles = await MentorProfile.find({ approved: true })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email role createdAt')
    const mentors = profiles.map(p => ({
      id: p.userId._id,
      name: p.userId.name,
      email: p.userId.email,
      role: p.userId.role,
      phone: p.phone,
      refNo: p.refNo,
    }))
    res.json({ mentors })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Failed to load mentors' })
  }
})

module.exports = router
