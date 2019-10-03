const express = require('express')
const router = express.Router({ mergeParams: true })

// controller
const controller = require('../controllers/checkin.controller')

// css menu
router.all('/*', (req, res, next) => {
    res.locals.eventMenu = 'checkin'
    next()
})

// ROTAS DO RESOURCE

// rota da listagem de inscritos
router.get('/', controller.index)

// rota para mostrar/editar as presenças de um inscrito
router.get('/:enroll', controller.edit)

// exporta o router
module.exports = router