const router = require('express').Router()

router.all('/', (req,res) => res.json({msg: 'Hello World from API V1'}))

module.exports = router