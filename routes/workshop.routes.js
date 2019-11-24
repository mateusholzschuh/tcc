const express = require('express')
const router = express.Router({ mergeParams: true })

const hasPermission = require('../middlewares/has-authorization')

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
router.get('/', hasPermission('speaker'), controller.index)

// rota que mostra o form para adicionar nova oficina
router.get('/add', hasPermission('organization'), controller.create)

// rota para salvar nova oficina
router.post('/add', hasPermission('organization'), validator.onSave, controller.store)

// rota que mostra o form para editar oficina
router.get('/:workshop/edit', hasPermission('organization'), controller.edit)

// rota para atualizar oficina
router.post('/:workshop/edit/', hasPermission('organization'), validator.onUpdate, controller.update)

// rota para remover oficina
router.get('/:workshop/delete', hasPermission('organization'), controller.destroy)

// rota para ver inscritos na oficina
router.get('/:workshop/enrolleds', hasPermission('speaker'), controller.enrolleds)

// rota para inscrever na oficina
router.post('/:workshop/enrolleds', hasPermission('organization'), controller.enroll)

// rota para remover inscrição da oficina
router.get('/:workshop/enrolleds/:enroll/delete', hasPermission('organization'), controller.unEnroll)

// exporta o router
module.exports = router