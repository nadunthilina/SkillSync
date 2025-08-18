const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user','mentor','admin'], default: 'user' },
  skills: [{ type: String }],
  goal: { type: String },
  avatarUrl: { type: String },
  resetToken: { type: String },
  resetTokenExpiresAt: { type: Date },
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)
