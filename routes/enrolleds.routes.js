const express = require('express');
const router = express.Router({mergeParams: true});

// pega o controller
const controller = require('../controllers/enrollement.controller');


// rotas do resource
router.get('/',         controller.index);
router.get('/create',   controller.create);
router.post('/',        controller.store);
router.get('/:id',      controller.view);
router.get('/:enroll/edit', controller.edit);
router.post('/:enroll/edit/',controller.update);
router.post('/delete',  controller.destroy);

// exporta o router
module.exports = router;