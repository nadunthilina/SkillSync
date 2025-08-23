const express = require('express')
const auth = require('../middleware/auth')
const { verifyAdmin } = require('../middleware/auth')
const User = require('../models/User')
const Job = require('../models/Job')
const Resource = require('../models/Resource')
const Log = require('../models/Log')

const router = express.Router()

// apply auth + admin check to all routes
router.use(auth(true), verifyAdmin)

// Stats
router.get('/stats', async (req, res) => {
	const [totalUsers, totalJobs, totalResources] = await Promise.all([
		User.countDocuments(),
		Job.countDocuments(),
		Resource.countDocuments(),
	])
	// simple placeholder for active sessions
	const activeSessions = 0
	res.json({ totalUsers, totalJobs, totalResources, activeSessions })
})

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
