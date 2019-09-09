const express = require('express');
const router = express.Router({mergeParams: true});

// pega o controller
const controller = require('../controllers/hackathon.controller');


// rotas do resource
router.get('/',         controller.index);
router.post('/',        controller.store);
router.get('/:id',      controller.view);
router.get('/:workshop/edit', controller.edit);
router.post('/:workshop/edit/',controller.update);
router.get('/:workshop/delete',  controller.destroy);
router.get('/:workshop/enrolleds',  controller.enrolleds);
router.post('/:workshop/enrolleds',  controller.enroll)

// exporta o router
module.exports = router;