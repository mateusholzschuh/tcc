const express = require('express');
const router = express.Router();

// pega o controller
const controller = require('../controllers/institution.controller');


// rotas do resource
router.get('/',         controller.index);
router.get('/create',   controller.create);
router.post('/',        controller.store);
router.get('/:id',      controller.view);
router.get('/edit/:id', controller.edit);
router.post('/edit/:id',  controller.update);
router.post('/delete',  controller.destroy);

// exporta o router
module.exports = router;