const express = require('express')
const router = express.Router({ mergeParams: true })

// controller
const controller = require('../controllers/certificate.controller')

// validador
// const validator = require('../middlewares/validators/enrollments')

// css menu
router.all('/*', (req, res, next) => {
    res.locals.eventMenu = 'certificate'
    next()
})


router.get('/', controller.index)

router.get('/test', controller.downloadExample)

// rota que faz upload do template
router.post('/upload', controller.uploadTemplate)


// exporta o router
module.exports = router