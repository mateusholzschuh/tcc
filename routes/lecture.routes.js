const express = require('express')
const router = express.Router({ mergeParams: true })

// controller
const controller = require('../controllers/lecture.controller')

// validador
const validator = require('../middlewares/validators/lectures')

// css menu
router.all('/*', (req, res, next) => {
    res.locals.eventMenu = 'lectures'
    next()
})

// ROTAS DO RESOURCE

// rota para listar as palestras
router.get('/', controller.index)

// rota que exibe o form para adicionar uma palestra
router.get('/add', controller.create)

// rota para salvar nova palestra
router.post('/add', validator.onSave, controller.store)

// rota que exibe form para editar palestra
router.get('/:lecture/edit', controller.edit)

// rota para atualizar palestra
router.post('/:lecture/edit/', validator.onUpdate, controller.update)

// rota para remover palestra
router.get('/:lecture/delete', controller.destroy)

// exporta o router
module.exports = router