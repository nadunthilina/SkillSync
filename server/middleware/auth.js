const jwt = require('jsonwebtoken')

function auth(required = true) {
  return function (req, res, next) {
    const token = req.cookies?.token
    if (!token) {
      if (required) return res.status(401).json({ message: 'Unauthorized' })
      req.user = null
      return next()
    }
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET)
      req.user = { id: payload.id, role: payload.role }
      next()
    } catch {
      if (required) return res.status(401).json({ message: 'Unauthorized' })
      req.user = null
      next()
    }
  }
}

function verifyAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' })
  }
  next()
}

module.exports = auth
module.exports.verifyAdmin = verifyAdmin
