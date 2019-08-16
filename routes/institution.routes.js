const express = require('express');
const router = express.Router();

// pega o controller
const Institution_controller = require('../controllers/institution.controller');


// rotas do resource
router.get('/',         Institution_controller.index);
router.get('/create',   Institution_controller.create);
router.post('/',        Institution_controller.store);
router.get('/:id',      Institution_controller.view);
router.get('/edit/:id', Institution_controller.edit);
router.post('/edit/:id',  Institution_controller.update);
router.post('/delete',  Institution_controller.destroy);

// exporta o router
module.exports = router;