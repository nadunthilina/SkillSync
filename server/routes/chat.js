const express = require('express')
const auth = require('../middleware/auth')
const ChatMessage = require('../models/ChatMessage')
const User = require('../models/User')

const router = express.Router()

// list mentors with whom user has chatted OR all mentors if none yet
router.get('/conversations', auth(true), async (req, res) => {
  const mentorIds = await ChatMessage.distinct('mentorId', { userId: req.user.id })
  let mentors
  if (mentorIds.length === 0) {
    mentors = await User.find({ role: 'mentor' }).limit(5).select('name role')
  } else {
    mentors = await User.find({ _id: { $in: mentorIds } }).select('name role')
  }
  res.json({ mentors })
})

router.get('/messages/:mentorId', auth(true), async (req, res) => {
  const { mentorId } = req.params
  const messages = await ChatMessage.find({ userId: req.user.id, mentorId }).sort({ createdAt: 1 })
  res.json({ messages })
})

router.post('/messages/:mentorId', auth(true), async (req, res) => {
  const { mentorId } = req.params
  const { text } = req.body || {}
  if (!text) return res.status(400).json({ message: 'text required' })
  const userMsg = await ChatMessage.create({ userId: req.user.id, mentorId, sender: 'user', text: text.slice(0, 1000) })
  // simple auto-reply
  const reply = await ChatMessage.create({ userId: req.user.id, mentorId, sender: 'mentor', text: 'Thanks for your message. A mentor will give detailed feedback soon.' })
  res.status(201).json({ messages: [userMsg, reply] })
})

module.exports = router
