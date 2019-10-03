const express = require('express')
const router = express.Router()

const controller = {
    Checkin: require('../controllers/checkin.controller'),
    Workshop: require('../controllers/workshop.controller'),
} 

router.post('/checkin', controller.Checkin.ajax.updatePresence)

router.post('/workshop/presence', controller.Workshop.ajax.updatePresence)

// exporta o router
module.exports = router