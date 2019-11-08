const express = require('express')
const router = express.Router({ mergeParams: true })

// controller
const controller = require('../controllers/organizers.controller')

// validador
const validator = require('../middlewares/validators/organizers')

// css menu
router.all('/*', (req, res, next) => {
    res.locals.eventMenu = 'organizers'
    next()
})

// ROTAS DO RESOURCE

// rota listagem de organizadores
router.get('/', controller.index)

// rota que mostra o form para adicionar nova organizador
router.get('/add', controller.create)

// rota para salvar novo organizador
router.post('/add', validator.onSave, controller.store)

// rota que mostra o form para editar organizador
router.get('/:ue/edit', controller.edit)

// rota para atualizar organizador
router.post('/:ue/edit', validator.onUpdate, controller.update)

// rota para remover organizador
router.get('/:ue/delete', controller.destroy)


// exporta o router
module.exports = router