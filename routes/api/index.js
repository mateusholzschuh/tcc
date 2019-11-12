const router = require('express').Router()

router.all('/', (req,res) => res.json({empty:!0}))

// API v1
const apiVersion1 = require('./v1')
router.use('/v1', apiVersion1)

module.exports = router