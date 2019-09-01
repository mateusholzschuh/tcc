const express = require('express');
const router = express.Router();

// pega o controller
const Event_controller = require('../controllers/event.controller');


// rotas do resource
router.get('/',         Event_controller.index);
router.get('/create',   Event_controller.create);
router.post('/',        Event_controller.store);
router.get('/:id',      Event_controller.view);
router.get('/:id/edit', Event_controller.edit);
router.post('/:id/edit',  Event_controller.update);
router.get('/:id/delete',  Event_controller.destroy);

// router.get('/:id/lectures', Event_controller.lectures);

// router.get('/:id/enrolleds', Event_controller.enrolleds);

router.get('/:id/subevents', Event_controller.subevents);


// exporta o router
module.exports = router;