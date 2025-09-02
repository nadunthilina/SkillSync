const express = require('express')
const auth = require('../middleware/auth')
const ChatMessage = require('../models/ChatMessage')
const User = require('../models/User')

const router = express.Router()

// list mentors with whom user has chatted OR all mentors if none yet
router.get('/conversations', auth(true), async (req, res) => {
  if (req.user.role === 'mentor') {
    // List distinct users who have chatted with this mentor
    const userIds = await ChatMessage.distinct('userId', { mentorId: req.user.id })
    let users = []
    if (userIds.length) users = await User.find({ _id: { $in: userIds } }).select('name role')
    return res.json({ mentors: users }) // keep key name for frontend reuse
  } else {
    const mentorIds = await ChatMessage.distinct('mentorId', { userId: req.user.id })
    let mentors
    if (mentorIds.length === 0) {
      mentors = await User.find({ role: 'mentor' }).limit(5).select('name role')
    } else {
      mentors = await User.find({ _id: { $in: mentorIds } }).select('name role')
    }
    return res.json({ mentors })
  }
})

router.get('/messages/:otherId', auth(true), async (req, res) => {
  const { otherId } = req.params
  let filter
  if (req.user.role === 'mentor') {
    // otherId is userId
    filter = { userId: otherId, mentorId: req.user.id }
  } else {
    // otherId is mentorId
    filter = { userId: req.user.id, mentorId: otherId }
  }
  const messages = await ChatMessage.find(filter).sort({ createdAt: 1 })
  res.json({ messages })
})

router.post('/messages/:otherId', auth(true), async (req, res) => {
  const { otherId } = req.params
  const { text } = req.body || {}
  if (!text) return res.status(400).json({ message: 'text required' })
  let doc
  if (req.user.role === 'mentor') {
    // sending to user
    doc = await ChatMessage.create({ userId: otherId, mentorId: req.user.id, sender: 'mentor', text: text.slice(0,1000) })
  } else {
    // sending to mentor
    doc = await ChatMessage.create({ userId: req.user.id, mentorId: otherId, sender: 'user', text: text.slice(0,1000) })
  }
  res.status(201).json({ messages: [doc] })
})

module.exports = router
