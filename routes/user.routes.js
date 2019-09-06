const express = require('express');
const router = express.Router();

const {body} = require('express-validator')

// pega o controller
const controller = require('../controllers/user.controller');


const valida = [
    // res.json(req.body)
    body('name').isLength({min:7, max:50}).withMessage('Nome inválido!'),
    body('cpf').isLength({min:11, max:11}).withMessage('CPF Inválido!'),
    body('birthdate').isString().not().isEmpty().withMessage('Data inválida!')

]

// rotas do resource
router.get('/',         controller.index);
router.get('/create',   controller.create);
router.post('/',        valida, controller.store);
router.get('/:id',      controller.view);
router.get('/edit/:id', controller.edit);
router.post('/edit/:id',  valida, controller.update);
router.post('/delete',  controller.destroy);

// exporta o router
module.exports = router;