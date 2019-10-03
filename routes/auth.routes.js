const express = require('express')
const router = express.Router()

const isAuth = require('../middlewares/is-auth')

// controller
const controller = require('../controllers/auth.controller')

// validador
const validator = require('../middlewares/validators/auth')


// ROTAS DE AUTENTICAÇÃO

// rota que exibe a tela de login
router.get('/login', controller.getLogin)

// rota que faz o login
router.post('/login', validator.onLogin, controller.postLogin)

// rota que faz logout
router.get('/logout', controller.doLogout)

// rota que exibe pagina para alterar a senha
router.get('/password/reset', isAuth, controller.getChangepass)

// rota que troca a senha do usuario da sessão
router.post('/password/reset', isAuth, validator.onChangePass, controller.postChangepass)

// exporta o router
module.exports = router