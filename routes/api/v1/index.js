const router = require('express').Router()

router.all('/', (req,res) => res.json({ message: 'Hello World from API V1'} ))

router.use('/institutions', require('./institutions'))

router.use('/events', require('./events'))

router.use('/users', require('./users'))

module.exports = router