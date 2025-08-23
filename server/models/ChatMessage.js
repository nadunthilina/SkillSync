const mongoose = require('mongoose')

const chatMessageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: String, enum: ['user','mentor'], required: true },
  text: { type: String, required: true },
  read: { type: Boolean, default: false },
}, { timestamps: true })

module.exports = mongoose.model('ChatMessage', chatMessageSchema)
