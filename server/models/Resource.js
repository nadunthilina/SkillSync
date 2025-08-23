const mongoose = require('mongoose')

const resourceSchema = new mongoose.Schema({
	title: { type: String, required: true },
	url: { type: String, required: true },
	type: { type: String, enum: ['course','article','video','book','other'], default: 'course' },
	provider: { type: String },
	topics: [{ type: String }],
	featured: { type: Boolean, default: false },
	rating: { type: Number, min: 0, max: 5 },
}, { timestamps: true })

module.exports = mongoose.model('Resource', resourceSchema)
