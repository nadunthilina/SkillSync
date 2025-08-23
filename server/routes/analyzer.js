const express = require('express')
const auth = require('../middleware/auth')

const router = express.Router()

// Simple in-memory skill map for demo
const ROLE_SKILLS = {
  'Frontend Developer': ['javascript','react','css','html','testing','typescript'],
  'Backend Developer': ['node','express','mongodb','sql','api design','testing'],
  'Data Scientist': ['python','statistics','pandas','numpy','ml','sql']
}

const RESOURCE_LIBRARY = {
  javascript: ['Eloquent JavaScript', 'You Don\'t Know JS'],
  react: ['React Docs', 'Epic React Course'],
  css: ['CSS Tricks', 'Tailwind Docs'],
  html: ['MDN HTML Guide'],
  testing: ['Testing Library Docs', 'Jest Handbook'],
  typescript: ['TypeScript Handbook'],
  node: ['Node.js Docs'],
  express: ['Express Guide'],
  mongodb: ['MongoDB University Course'],
  sql: ['SQLBolt'],
  'api design': ['RESTful API Design Guidelines'],
  python: ['Automate the Boring Stuff'],
  statistics: ['Khan Academy Statistics'],
  pandas: ['Pandas Documentation'],
  numpy: ['NumPy Quickstart'],
  ml: ['Hands-On Machine Learning Book']
}

router.post('/analyze', auth(true), async (req, res) => {
  const { role, skillsText } = req.body || {}
  if (!role) return res.status(400).json({ message: 'role required' })
  const target = ROLE_SKILLS[role] || []
  const userSkills = (skillsText || '')
    .split(/[,\n]/)
    .map(s => s.trim().toLowerCase())
    .filter(Boolean)
  const missing = target.filter(s => !userSkills.includes(s))
  const recommendedResources = missing.map(skill => ({
    skill,
    resources: RESOURCE_LIBRARY[skill] || []
  }))
  res.json({ role, providedSkills: userSkills, targetSkills: target, missingSkills: missing, recommendedResources })
})

module.exports = router
