const router = require('express').Router()

router.all('/', (req,res) => res.json({msg: 'Hello World from API V1'}))

router.use('/institutions', require('./institutions'))

module.exports = router