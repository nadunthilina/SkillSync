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

module.exports = auth
