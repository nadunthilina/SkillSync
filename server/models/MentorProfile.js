const mongoose = require('mongoose')

const mentorProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  bio: { type: String, default: '' },
  expertise: [{ type: String }],
  yearsExperience: { type: Number, min: 0, default: 0 },
  phone: { type: String },
  refNo: { type: String, index: true },
  hourlyRate: { type: Number, min: 0 },
  approved: { type: Boolean, default: false },
  availability: [{
    day: { type: String }, // e.g. 'Mon'
    from: { type: String }, // '09:00'
    to: { type: String },   // '11:00'
  }],
}, { timestamps: true })

module.exports = mongoose.model('MentorProfile', mentorProfileSchema)
