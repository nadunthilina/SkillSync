const mongoose = require('mongoose')

const jobSchema = new mongoose.Schema({
	title: { type: String, required: true },
	company: { type: String, required: true },
	location: { type: String },
	type: { type: String, enum: ['full-time','part-time','contract','internship','remote'], default: 'full-time' },
	description: { type: String },
	skills: [{ type: String }],
	featured: { type: Boolean, default: false },
	active: { type: Boolean, default: true },
	postedAt: { type: Date, default: Date.now },
}, { timestamps: true })

module.exports = mongoose.model('Job', jobSchema)
