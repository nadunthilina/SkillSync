const express = require('express')
const auth = require('../middleware/auth')

const router = express.Router()

router.post('/generate', auth(true), async (req, res) => {
  const { role, missingSkills = [] } = req.body || {}
  const tasks = missingSkills.map((skill, idx) => ({
    week: idx + 1,
    title: `Learn ${skill}`,
    description: `Complete tutorials and a mini project covering ${skill}.`,
    skill,
    estimatedHours: 5 + (skill.length % 5)
  }))
  res.json({ role, tasks })
})

module.exports = router
