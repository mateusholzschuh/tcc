const express = require('express')
const router = express.Router({ mergeParams: true })

// controller
const controller = require('../controllers/hackathon.controller')

// validador
const validator = require('../middlewares/validators/hackathons')

// css menu
router.all('/*', (req, res, next) => {
    res.locals.eventMenu = 'hackathon'
    next()
})

// ROTAS DO RESOURCE

// rota para listar times do hackathon
router.get('/', controller.index)

// rota que exibe form para adicionar novo time
router.get('/add', controller.create)

// rota que adicionar novo time no hackathon
router.post('/add', validator.onAddTeam, controller.store)

// rota para remover time do hackathon
router.get('/:team/delete', controller.destroy)

// exporta o router
module.exports = router