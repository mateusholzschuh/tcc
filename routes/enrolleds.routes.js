const express = require('express');
const router = express.Router({mergeParams: true});
const {body} = require('express-validator')

const User = require('../models/user.model')
const Enrollment = require('../models/enrollment.model')

// pega o controller
const controller = require('../controllers/enrollement.controller');

// css menu
router.all('/*', (req, res, next) => {
    res.locals.eventMenu = 'enrolleds'
    next()
})

// rotas do resource
// lista as inscrições
router.get('/', controller.index);

// salva inscrição
router.post('/', [
    // validações
    body('email').isEmail().withMessage('Email inválido').normalizeEmail(),

    body('name').isString().isLength({ min: 5, max: 30 }).withMessage('Nome inválido'),

    body('cpf').isNumeric().isLength({ min: 11, max: 11 }).withMessage('CPF inválido')
        .custom((cpf, {req}) => {
            // verifica se já está inscrito no evento
            return User.findOne({ cpf }).then(user => {
                if (user) {
                    return Enrollment.findOne({ user, event: req.params.id }).countDocuments().then(count => {
                        if (count != 0) {
                            return Promise.reject('CPF já inscrito no evento')
                        }
                    })
                }
        })
    }),

    body('birthdate').not().isEmpty().withMessage('Data de nascimento em branco'),

    body('institution').not().isEmpty().withMessage('Instituição em branco!')
],
// manda para o controller
controller.store);

// remove inscrição //! Desabilitado em produção
// router.post('/:enroll/delete',  controller.destroy);

// exporta o router
module.exports = router;