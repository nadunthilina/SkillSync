const mongoose = require('mongoose')

const mentorApplicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, index: true }, // not unique to allow re-apply before approval
  expertise: [{ type: String }],
  bio: { type: String },
  yearsExperience: { type: Number, min: 0 },
  phone: { type: String },
  refNo: { type: String },
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending', index: true },
  decidedAt: { type: Date },
  decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
}, { timestamps: true })

module.exports = mongoose.model('MentorApplication', mentorApplicationSchema)