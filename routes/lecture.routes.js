const express = require('express');
const router = express.Router({mergeParams: true});

// pega o controller
const controller = require('../controllers/lecture.controller');


// rotas do resource
router.get('/',         controller.index);
router.get('/create',   controller.create);
router.post('/',        controller.store);
router.get('/:id',      controller.view);
router.get('/:lecture/edit', controller.edit);
router.post('/:lecture/edit/',controller.update);
router.get('/:lecture/delete',  controller.destroy);

// exporta o router
module.exports = router;