const express = require('express')
const auth = require('../middleware/auth')
const User = require('../models/User')

const router = express.Router()

router.get('/', auth(true), async (req, res) => {
  const mentors = await User.find({ role: 'mentor' }).select('name email role createdAt')
  res.json({ mentors })
})

module.exports = router
