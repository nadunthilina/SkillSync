const mongoose = require('mongoose')

const logSchema = new mongoose.Schema({
	type: { type: String, required: true }, // signup, login, job_created, resource_updated, etc.
	message: { type: String },
	actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	meta: { type: Object },
}, { timestamps: true })

module.exports = mongoose.model('Log', logSchema)
