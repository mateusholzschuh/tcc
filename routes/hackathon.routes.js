const express = require('express');
const router = express.Router({ mergeParams: true });

const { body } = require('express-validator');

// pega o controller
const controller = require('../controllers/hackathon.controller');
const Hackathon = require('../models/hackathon.model');

// css menu
router.all('/*', (req, res, next) => {
    res.locals.eventMenu = 'hackathon'
    next()
})

// rotas do resource

// rota para listar times do hackathon
router.get('/', controller.index);

// rota para inserir novo time no hackathon
router.post('/', [
    // validação
    body('name').isString().isLength({ min: 3, max: 50 }).withMessage('Nome inválido'),

    body('member1').custom((val, { req }) => {
        if ([req.body.member1,req.body.member2,req.body.member3].length != new Set([req.body.member1,req.body.member2,req.body.member3]).size ) {
            return Promise.reject('Mais de um membro com o mesmo CPF');
        }

        return Hackathon.findOne({ event: req.params.id, teams: { '$elemMatch': { 'members': { '$in': val } } } }).then(doc => {
            if(doc)
                return Promise.reject('Membro 1 já inscrito em outra equipe');
        })
    }),

    body('member2').custom((val, { req }) => {
        return Hackathon.findOne({ event: req.params.id, teams: { '$elemMatch': { 'members': { '$in': val } } } }).then(doc => {
            if(doc)
                return Promise.reject('Membro 2 já inscrito em outra equipe');
        })
    }),

    body('member3').custom((val, { req }) => {
        return Hackathon.findOne({ event: req.params.id, teams: { '$elemMatch': { 'members': { '$in': val } } } }).then(doc => {
            if(doc)
                return Promise.reject('Membro 3 já inscrito em outra equipe');
        })
    })
],
    // manda para o controller
    controller.store);

// rota para remover time do hackathon
router.get('/:team/delete', controller.destroy);

// exporta o router
module.exports = router;