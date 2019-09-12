const express = require('express');
const router = express.Router({ mergeParams: true });

const { body } = require('express-validator')

// pega o controller
const controller = require('../controllers/lecture.controller');

// css menu
router.get('/*', (req, res, next) => {
    res.locals.eventMenu = 'lectures'
    next()
})

// rotas do resource
// rota para listar as palestras
router.get('/', controller.index);

// rota para salvar nova palestra
router.post('/', [
    // validação
    body('name').isString().isLength({ min: 5, max: 50 }).withMessage('Nome inválido'),
    
    body('location').isString().isLength({ min: 5, max: 50 }).withMessage('Local inválido'),

    body('date').not().isEmpty().withMessage('Data em branco'),

    body('speakers').not().isEmpty().withMessage('Nenhum palestrante selecionado')

], 
// manda para o controller
controller.store);

// rota para editar palestra
router.get('/:lecture/edit', controller.edit);

// rota para atualizar palestra
router.post('/:lecture/edit/', [
    // validação
    body('name').isString().isLength({ min: 5, max: 50 }).withMessage('Nome inválido'),
    
    body('location').isString().isLength({ min: 5, max: 50 }).withMessage('Local inválido'),

    body('date').not().isEmpty().withMessage('Data em branco'),

    body('speakers').not().isEmpty().withMessage('Nenhum palestrante selecionado')

], 
// manda para o controller
controller.update);

// rota para remover palestra
router.get('/:lecture/delete', controller.destroy);

// exporta o router
module.exports = router;