const express = require('express');
const router = express.Router();

// pega o controller
const controller = require('../controllers/event.controller');

//routes workshop
const workshop = require('../routes/workshop.routes')

//routes hackathon
const hackathon = require('../routes/hackathon.routes')

//routes lectures
const lectures = require('../routes/lecture.routes')

//routes enrolleds
const enrolleds = require('../routes/enrolleds.routes')

router.get('/:id/*', (req, res, next) => {
    res.locals.baseUrl = `/events/${req.params.id}`
    next()
})

// rotas do resource
router.get('/',         controller.index);
router.get('/create',   controller.create);
router.post('/',        controller.store);
router.get('/:id',      controller.view);
router.get('/:id/edit', controller.edit);
router.post('/:id/edit',  controller.update);
router.get('/:id/delete',  controller.destroy);

router.use('/:id/workshops', workshop);

router.use('/:id/hackathon', hackathon);

router.use('/:id/lectures', lectures);

router.use('/:id/enrolleds', enrolleds);

router.use('/:id/subevents', controller.subevents);


// exporta o router
module.exports = router;