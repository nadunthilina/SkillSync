const express = require('express')
const auth = require('../middleware/auth')
const { verifyAdmin } = require('../middleware/auth')
const User = require('../models/User')
const Job = require('../models/Job')
const Resource = require('../models/Resource')
const Log = require('../models/Log')
const MentorProfile = require('../models/MentorProfile')
const bcrypt = require('bcryptjs')
const MentorApplication = require('../models/MentorApplication')

const router = express.Router()

// apply auth + admin check to all routes
router.use(auth(true), verifyAdmin)

// Stats
router.get('/stats', async (req, res) => {
	const [totalUsers, totalJobs, totalResources, totalMentors, roleAgg] = await Promise.all([
		User.countDocuments(),
		Job.countDocuments(),
		Resource.countDocuments(),
		MentorProfile.countDocuments(),
		User.aggregate([
			{ $group: { _id: '$role', count: { $sum: 1 } } }
		])
	])
	const roleCounts = roleAgg.reduce((acc,r)=>{ acc[r._id||'unknown']=r.count; return acc }, { user:0, mentor:0, admin:0 })
	const activeSessions = 0
	res.json({ totalUsers, totalJobs, totalResources, totalMentors, activeSessions, roles: roleCounts })
})

// Admin self settings update (name, email, password)
router.patch('/settings', async (req, res) => {
	const { name, email, password } = req.body || {}
	const update = {}
	if (name) update.name = String(name).trim().slice(0,80)
	if (email) {
		const e = String(email).trim().toLowerCase()
		const exists = await User.findOne({ email: e, _id: { $ne: req.user.id } })
		if (exists) return res.status(409).json({ message: 'Email already in use' })
		update.email = e
	}
	if (password) {
		if (String(password).length < 8) return res.status(400).json({ message: 'Password too short' })
		update.passwordHash = await bcrypt.hash(password, 10)
	}
	if (Object.keys(update).length === 0) return res.status(400).json({ message: 'No changes' })
	const user = await User.findByIdAndUpdate(req.user.id, update, { new: true }).select('name email role')
	await Log.create({ type: 'admin_settings_updated', actorId: req.user.id, meta: Object.keys(update) })
	res.json({ user })
})

// Dev helper to promote a user to admin (remove or guard in production)
if (process.env.NODE_ENV !== 'production') {
	router.post('/_dev/promote', async (req, res) => {
		const { email } = req.body
		if (!email) return res.status(400).json({ message: 'email required' })
		const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true })
		if (!user) return res.status(404).json({ message: 'User not found' })
		res.json({ user: { id: user._id, email: user.email, role: user.role } })
	})
}

// Users: list with search/pagination
router.get('/users', async (req, res) => {
	const { page = 1, limit = 10, q = '' } = req.query
	const p = Math.max(parseInt(page), 1)
	const l = Math.min(Math.max(parseInt(limit), 1), 100)
	const match = q
		? { $or: [ { name: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } } ] }
		: {}
	const [items, total] = await Promise.all([
		User.find(match).sort({ createdAt: -1 }).skip((p-1)*l).limit(l).select('-passwordHash'),
		User.countDocuments(match),
	])
	res.json({ items, total, page: p, pages: Math.ceil(total / l) })
})

router.patch('/users/:id/role', async (req, res) => {
	const { role } = req.body
	if (!['user','mentor','admin'].includes(role)) return res.status(400).json({ message: 'Invalid role' })
	const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-passwordHash')
	if (!user) return res.status(404).json({ message: 'User not found' })
	await Log.create({ type: 'user_role_changed', actorId: req.user.id, meta: { userId: user.id, role } })
	res.json({ user })
})

router.patch('/users/:id/suspend', async (req, res) => {
	const { suspended = true } = req.body
	const user = await User.findByIdAndUpdate(req.params.id, { suspended }, { new: true }).select('-passwordHash')
	if (!user) return res.status(404).json({ message: 'User not found' })
	await Log.create({ type: 'user_suspended', actorId: req.user.id, meta: { userId: user.id, suspended } })
	res.json({ user })
})

router.delete('/users/:id', async (req, res) => {
	const u = await User.findByIdAndDelete(req.params.id)
	if (!u) return res.status(404).json({ message: 'User not found' })
	await Log.create({ type: 'user_deleted', actorId: req.user.id, meta: { userId: req.params.id } })
	res.json({ ok: true })
})

// Jobs CRUD
router.get('/jobs', async (req, res) => {
	const { page = 1, limit = 10, q = '' } = req.query
	const p = Math.max(parseInt(page), 1)
	const l = Math.min(Math.max(parseInt(limit), 1), 100)
	const match = q ? { title: { $regex: q, $options: 'i' } } : {}
	const [items, total] = await Promise.all([
		Job.find(match).sort({ createdAt: -1 }).skip((p-1)*l).limit(l),
		Job.countDocuments(match),
	])
	res.json({ items, total, page: p, pages: Math.ceil(total / l) })
})

router.post('/jobs', async (req, res) => {
	const job = await Job.create(req.body)
	await Log.create({ type: 'job_created', actorId: req.user.id, meta: { jobId: job.id } })
	res.status(201).json({ job })
})

router.put('/jobs/:id', async (req, res) => {
	const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true })
	if (!job) return res.status(404).json({ message: 'Job not found' })
	await Log.create({ type: 'job_updated', actorId: req.user.id, meta: { jobId: job.id } })
	res.json({ job })
})

router.delete('/jobs/:id', async (req, res) => {
	const j = await Job.findByIdAndDelete(req.params.id)
	if (!j) return res.status(404).json({ message: 'Job not found' })
	await Log.create({ type: 'job_deleted', actorId: req.user.id, meta: { jobId: req.params.id } })
	res.json({ ok: true })
})

// Resources CRUD
router.get('/resources', async (req, res) => {
	const { page = 1, limit = 10, q = '' } = req.query
	const p = Math.max(parseInt(page), 1)
	const l = Math.min(Math.max(parseInt(limit), 1), 100)
	const match = q ? { title: { $regex: q, $options: 'i' } } : {}
	const [items, total] = await Promise.all([
		Resource.find(match).sort({ createdAt: -1 }).skip((p-1)*l).limit(l),
		Resource.countDocuments(match),
	])
	res.json({ items, total, page: p, pages: Math.ceil(total / l) })
})

router.post('/resources', async (req, res) => {
	const resource = await Resource.create(req.body)
	await Log.create({ type: 'resource_created', actorId: req.user.id, meta: { resourceId: resource.id } })
	res.status(201).json({ resource })
})

router.put('/resources/:id', async (req, res) => {
	const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true })
	if (!resource) return res.status(404).json({ message: 'Resource not found' })
	await Log.create({ type: 'resource_updated', actorId: req.user.id, meta: { resourceId: resource.id } })
	res.json({ resource })
})

router.delete('/resources/:id', async (req, res) => {
	const r = await Resource.findByIdAndDelete(req.params.id)
	if (!r) return res.status(404).json({ message: 'Resource not found' })
	await Log.create({ type: 'resource_deleted', actorId: req.user.id, meta: { resourceId: req.params.id } })
	res.json({ ok: true })
})

// Mentors management
// List mentors (profiles) with optional search q (matches user name/email or bio/expertise)
router.get('/mentors', async (req, res) => {
	const { page = 1, limit = 10, q = '' } = req.query
	const p = Math.max(parseInt(page), 1)
	const l = Math.min(Math.max(parseInt(limit), 1), 100)
	const query = {}
	if (q) query.$or = [ { bio: { $regex: q, $options: 'i' } }, { expertise: { $regex: q, $options: 'i' } } ]

	// Find profiles first
	let profiles = await MentorProfile.find(query)
		.sort({ createdAt: -1 })
		.skip((p-1)*l)
		.limit(l)
		.populate('userId', 'name email role')

	// If q also matches user name/email we need to include those not matched by profile fields
	if (q) {
		const userRegex = { $or: [ { name: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } } ] }
		const mentorUserIds = profiles.map(pr => pr.userId._id.toString())
		const extraUsers = await User.find({ role: 'mentor', ...userRegex, _id: { $nin: mentorUserIds } }).select('name email role')
		if (extraUsers.length) {
			const extraProfiles = await MentorProfile.find({ userId: { $in: extraUsers.map(u => u._id) } }).populate('userId', 'name email role')
			profiles = profiles.concat(extraProfiles)
		}
	}
	const total = await MentorProfile.countDocuments(query)
	res.json({ items: profiles, total, page: p, pages: Math.ceil(total / l) })
})

// Create mentor (user + profile)
router.post('/mentors', async (req, res) => {
	const { name, email, password, phone, refNo, bio = '', expertise = [], yearsExperience = 0, hourlyRate, availability = [] } = req.body
	if (!name || !email || !password || !phone || !refNo) return res.status(400).json({ message: 'Missing required fields' })
	const exists = await User.findOne({ email })
	if (exists) return res.status(409).json({ message: 'Email already in use' })
	const passwordHash = await bcrypt.hash(password, 10)
	const user = await User.create({ name, email, passwordHash, role: 'mentor' })
	const profile = await MentorProfile.create({ userId: user._id, phone, refNo, bio, expertise, yearsExperience, hourlyRate, availability, approved: true })
	await Log.create({ type: 'mentor_created', actorId: req.user.id, meta: { mentorUserId: user._id } })
	res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, profile })
})

// Update mentor profile
router.put('/mentors/:userId', async (req, res) => {
	const { userId } = req.params
	const { bio, expertise, yearsExperience, hourlyRate, availability, phone, refNo } = req.body
	const update = { }
	if (bio !== undefined) update.bio = bio
	if (expertise !== undefined) update.expertise = expertise
	if (yearsExperience !== undefined) update.yearsExperience = yearsExperience
	if (hourlyRate !== undefined) update.hourlyRate = hourlyRate
	if (availability !== undefined) update.availability = availability
	if (phone !== undefined) update.phone = phone
	if (refNo !== undefined) update.refNo = refNo
	const profile = await MentorProfile.findOneAndUpdate({ userId }, { $set: update }, { new: true })
		.populate('userId', 'name email role')
	if (!profile) return res.status(404).json({ message: 'Profile not found' })
	await Log.create({ type: 'mentor_updated', actorId: req.user.id, meta: { mentorUserId: userId } })
	res.json({ profile })
})

// Approve / unapprove mentor
// Approve/unapprove retained for flexibility but optional since we auto-approve on create
router.patch('/mentors/:userId/approve', async (req, res) => {
	const { approved = true } = req.body
	const { userId } = req.params
	const profile = await MentorProfile.findOneAndUpdate({ userId }, { approved }, { new: true }).populate('userId', 'name email role')
	if (!profile) return res.status(404).json({ message: 'Profile not found' })
	await Log.create({ type: 'mentor_approved', actorId: req.user.id, meta: { mentorUserId: userId, approved } })
	res.json({ profile })
})

// Delete mentor (profile + optionally downgrade role)
router.delete('/mentors/:userId', async (req, res) => {
	const { userId } = req.params
	const profile = await MentorProfile.findOneAndDelete({ userId })
	if (!profile) return res.status(404).json({ message: 'Profile not found' })
	// Downgrade user back to standard user (do not delete account to preserve auth history)
	await User.findByIdAndUpdate(userId, { role: 'user' })
	await Log.create({ type: 'mentor_deleted', actorId: req.user.id, meta: { mentorUserId: userId } })
	res.json({ ok: true })
})

// Mentor applications: list pending/approved/rejected
router.get('/mentor-applications', async (req, res) => {
	const { status = 'pending', page = 1, limit = 20 } = req.query
	const p = Math.max(parseInt(page),1)
	const l = Math.min(Math.max(parseInt(limit),1),100)
	const match = status ? { status } : {}
	const [items,total] = await Promise.all([
		MentorApplication.find(match).sort({ createdAt: -1 }).skip((p-1)*l).limit(l),
		MentorApplication.countDocuments(match)
	])
	res.json({ items, total, page: p, pages: Math.ceil(total/l) })
})

// Approve a mentor application: creates mentor profile + upgrades user role + sets password (if user had no password reset scenario) or resets password explicitly
router.post('/mentor-applications/:id/approve', async (req, res) => {
	const { password } = req.body || {}
	if (!password || String(password).length < 8) return res.status(400).json({ message: 'Password (min 8 chars) required to set for mentor' })
	const app = await MentorApplication.findById(req.params.id)
	if (!app) return res.status(404).json({ message: 'Application not found' })
	if (app.status === 'approved') return res.status(400).json({ message: 'Already approved' })
	const user = await User.findOne({ email: app.email })
	if (!user) return res.status(400).json({ message: 'User for this application no longer exists' })
	user.role = 'mentor'
	user.passwordHash = await bcrypt.hash(password, 10)
	await user.save()
	const existingProfile = await MentorProfile.findOne({ userId: user._id })
	if (!existingProfile) {
		await MentorProfile.create({ userId: user._id, approved: true, bio: app.bio || '', expertise: app.expertise || [], yearsExperience: app.yearsExperience || 0 })
	} else {
		existingProfile.approved = true
		await existingProfile.save()
	}
	app.status = 'approved'
	app.decidedAt = new Date()
	app.decidedBy = req.user.id
	await app.save()
	await Log.create({ type: 'mentor_application_approved', actorId: req.user.id, meta: { applicationId: app._id, mentorUserId: user._id } })
	res.json({ ok: true })
})

router.post('/mentor-applications/:id/reject', async (req, res) => {
	const { notes } = req.body || {}
	const app = await MentorApplication.findById(req.params.id)
	if (!app) return res.status(404).json({ message: 'Application not found' })
	if (app.status !== 'pending') return res.status(400).json({ message: 'Already decided' })
	app.status = 'rejected'
	app.notes = notes || ''
	app.decidedAt = new Date()
	app.decidedBy = req.user.id
	await app.save()
	await Log.create({ type: 'mentor_application_rejected', actorId: req.user.id, meta: { applicationId: app._id } })
	res.json({ ok: true })
})

// Logs
router.get('/logs', async (req, res) => {
	const { page = 1, limit = 20, type } = req.query
	const p = Math.max(parseInt(page), 1)
	const l = Math.min(Math.max(parseInt(limit), 1), 200)
	const match = type ? { type } : {}
	const [items, total] = await Promise.all([
		Log.find(match).sort({ createdAt: -1 }).skip((p-1)*l).limit(l),
		Log.countDocuments(match),
	])
	res.json({ items, total, page: p, pages: Math.ceil(total / l) })
})

// Reports CSV export (example: users)
router.get('/reports/users.csv', async (req, res) => {
	const users = await User.find().select('name email role createdAt')
	res.setHeader('Content-Type', 'text/csv')
	res.setHeader('Content-Disposition', 'attachment; filename="users.csv"')
	res.write('name,email,role,createdAt\n')
	users.forEach(u => {
		const line = [u.name, u.email, u.role, u.createdAt.toISOString()].map(v => `"${String(v).replaceAll('"','""')}"`).join(',')
		res.write(line + '\n')
	})
	res.end()
})

module.exports = router
