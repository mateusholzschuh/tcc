const express = require('express')
const router = express.Router({ mergeParams: true })

// controller
const controller = require('../controllers/enrollement.controller')

// validador
const validator = require('../middlewares/validators/enrollments')

// css menu
router.all('/*', (req, res, next) => {
    res.locals.eventMenu = 'enrolleds'
    next()
})

// ROTAS DO RESOURCE

// rota que lista as inscrições
router.get('/', controller.index)

// rota que exibe form para inscrição
router.get('/add', controller.create)

// rota que salva uma nova inscrição
router.post('/add', validator.onSave, controller.store)

// rota que mostra form editar usuario
router.get('/:user/edit', controller.edit)
router.post('/:user/edit', validator.onUpdate, controller.update)

// remove inscrição //! Desabilitado em produção
// router.post('/:enroll/delete',  controller.destroy)

// exporta o router
module.exports = router