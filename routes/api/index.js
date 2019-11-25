const router = require('express').Router()

// API v1
const apiVersion1 = require('./v1')
router.use('/v1', apiVersion1)

module.exports = router