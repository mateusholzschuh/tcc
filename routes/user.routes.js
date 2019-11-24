const express = require('express')
const router = express.Router()

const hasPermission = require('../middlewares/has-authorization')

// controller
const controller = require('../controllers/user.controller')

// validador
const validator = require('../middlewares/validators/user')

// css menu
router.all('/*', (req, res, next) => {
    res.locals.mainMenu = 'users'
    next()
})

// ROTAS DO RESOURCE

// rota que exibe a lista de usuários
router.get('/', hasPermission('admin'), controller.index)

// rota que exibe form para adicionar um novo usuário
router.get('/create', hasPermission('admin'), controller.create)

// rota que salva um novo usuário
router.post('/', hasPermission('admin'), validator.onSave, controller.store)

// rota que exibe um usuário
// router.get('/:id', controller.view)

// rota que exibe um form para editar um usuário
router.get('/edit/:id', controller.edit)

// rota que atualiza um usuário
router.post('/edit/:id', validator.onUpdate, controller.update)

// rota que remove um usuário
router.post('/delete', hasPermission('admin'), controller.destroy)

// exporta o router
module.exports = router