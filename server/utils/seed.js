const User = require('../models/User')
const bcrypt = require('bcryptjs')

async function ensureAdminSeed() {
  try {
    const admins = await User.countDocuments({ role: 'admin' })
    if (admins === 0) {
      if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
        let user = await User.findOne({ email: process.env.ADMIN_EMAIL })
        if (!user) {
          const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10)
          user = await User.create({
            name: process.env.ADMIN_NAME || 'Administrator',
            email: process.env.ADMIN_EMAIL,
            passwordHash,
            role: 'admin'
          })
          console.log('[seed] Admin created:', user.email)
        } else if (user.role !== 'admin') {
          user.role = 'admin'
          await user.save()
          console.log('[seed] Existing user promoted to admin:', user.email)
        }
      } else {
        console.log('[seed] No admin present and ADMIN_EMAIL / ADMIN_PASSWORD not set. Use /api/auth/bootstrap-admin to create one.')
      }
    }
  } catch (e) {
    console.warn('[seed] ensureAdminSeed failed:', e.message)
  }
}

module.exports = { ensureAdminSeed }
