const router = require('express').Router()
const controller = require('../../../controllers/event.controller')

const validators = {
    isOpen: require('../../../middlewares/api-is-open'),
    hasToken: require('../../../middlewares/api-token'),
    enroll: require('../../../middlewares/validators/enrollments/api')
}

router.get('/', controller.api.getAll)

router.get('/:id', validators.hasToken, validators.isOpen('global'), controller.api.getById)

router.get('/:id/full', validators.hasToken, validators.isOpen('global'), controller.api.getByIdFull)

router.get('/:id/lectures', validators.hasToken, validators.isOpen('getLectures'), controller.api.getLectures)

router.get('/:id/workshops', validators.hasToken, validators.isOpen('getWorkshops'), controller.api.getWorkshops)

router.get('/:id/workshops/:workshop', validators.hasToken, validators.isOpen('getWorkshops'), controller.api.getWorkshop)

router.get('/:id/enrolleds', validators.hasToken, validators.isOpen('getEnrolleds'), controller.api.getEnrolleds)

router.post('/:id/enroll', validators.hasToken, validators.isOpen('enroll'), validators.enroll.onSave, controller.api.postEnroll)

router.post('/:id/check', validators.hasToken, validators.isOpen('check'), validators.enroll.onCheck, controller.api.postCheck)

module.exports = router