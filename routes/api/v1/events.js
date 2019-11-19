const router = require('express').Router()
const controller = require('../../../controllers/event.controller')

const validators = {
    enroll: require('../../../middlewares/validators/enrollments/api')
}

router.get('/', controller.api.getAll)

router.get('/:id', controller.api.getById)

router.get('/:id/full', controller.api.getByIdFull)

router.get('/:id/lectures', controller.api.getLectures)

router.get('/:id/workshops', controller.api.getWorkshops)

router.post('/:id/enroll', validators.enroll.onSave, controller.api.postEnroll)

router.post('/:id/check', validators.enroll.onCheck, controller.api.postCheck)

module.exports = router