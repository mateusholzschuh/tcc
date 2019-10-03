const express = require('express')
const router = express.Router({ mergeParams: true })

// controller
const controller = require('../controllers/workshop.controller')

// validador
const validator = require('../middlewares/validators/workshop')

// css menu
router.all('/*', (req, res, next) => {
    res.locals.eventMenu = 'workshops'
    next()
})

// ROTAS DO RESOURCE

// rota listagem de oficinas
router.get('/', controller.index)

// rota que mostra o form para adicionar nova oficina
router.get('/add', controller.create)

// rota para salvar nova oficina
router.post('/add', validator.onSave, controller.store)

// rota que mostra o form para editar oficina
router.get('/:workshop/edit', controller.edit)

// rota para atualizar oficina
router.post('/:workshop/edit/', validator.onUpdate, controller.update)

// rota para remover oficina
router.get('/:workshop/delete', controller.destroy)

// rota para ver inscritos na oficina
router.get('/:workshop/enrolleds', controller.enrolleds)

// rota para inscrever na oficina
router.post('/:workshop/enrolleds', controller.enroll)

// rota para remover inscrição da oficina
router.get('/:workshop/enrolleds/:enroll/delete', controller.unEnroll)

// exporta o router
module.exports = router