const router = require('express').Router()
const controller = require('../../../controllers/event.controller')

router.get('/', controller.api.getAll)

router.get('/:id', controller.api.getById)

router.get('/:id/full', controller.api.getByIdFull)

router.get('/:id/lectures', controller.api.getLectures)

router.get('/:id/workshops', controller.api.getWorkshops)

router.post('/:id/enroll', controller.api.postEnroll)

module.exports = router