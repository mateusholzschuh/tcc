const express = require('express');
const router = express.Router({mergeParams: true});

const { body } = require('express-validator')

// pega o controller
const controller = require('../controllers/workshop.controller');

// css menu
router.get('/*', (req, res, next) => {
    res.locals.eventMenu = 'workshops'
    next()
})

// rotas do resource

// rota listagem de oficinas
router.get('/', controller.index);

// rota para salvar nova oficina
router.post('/', [
    // validação
    body('name').isString().isLength({ min: 5, max: 50 }).withMessage('Nome inválido'),
    
    body('location').isString().isLength({ min: 5, max: 50 }).withMessage('Local inválido'),

    body('date').not().isEmpty().withMessage('Data em branco'),

    body('speakers').not().isEmpty().withMessage('Nenhum palestrante selecionado')

], 
// manda para o controller
controller.store);

// rota para editar oficina
router.get('/:workshop/edit', controller.edit);

// rota para atualizar oficina
router.post('/:workshop/edit/', [
    // validação
    body('name').isString().isLength({ min: 5, max: 50 }).withMessage('Nome inválido'),
    
    body('location').isString().isLength({ min: 5, max: 50 }).withMessage('Local inválido'),

    body('date').not().isEmpty().withMessage('Data em branco'),

    body('speakers').not().isEmpty().withMessage('Nenhum palestrante selecionado')

], 
// manda para o controller
controller.update);

// rota para remover oficina
router.get('/:workshop/delete', controller.destroy);

// rota para ver inscritos na oficina
router.get('/:workshop/enrolleds', controller.enrolleds);

// rota para inscrever na oficina
router.post('/:workshop/enrolleds', controller.enroll)

// rota para remover inscrição da oficina
router.get('/:workshop/enrolleds/:enroll/delete', controller.unEnroll)

// exporta o router
module.exports = router;