const router = require('express').Router()
const controller = require('../../../controllers/event.controller')

const validators = {
    api: require('../../../middlewares/api-is-open'),
    enroll: require('../../../middlewares/validators/enrollments/api')
}

router.get('/', validators.api('global'), controller.api.getAll)

router.get('/:id', validators.api('global'), controller.api.getById)

router.get('/:id/full', validators.api('global'), controller.api.getByIdFull)

router.get('/:id/lectures', validators.api('getLectures'), controller.api.getLectures)

router.get('/:id/workshops', validators.api('getWorkshops'), controller.api.getWorkshops)

router.get('/:id/workshops/:workshop', validators.api('getWorkshops'), controller.api.getWorkshop)

router.get('/:id/enrolleds', validators.api('getEnrolleds'), controller.api.getEnrolleds)

router.post('/:id/enroll', validators.api('enroll'), validators.enroll.onSave, controller.api.postEnroll)

router.post('/:id/check', validators.api('check'), validators.enroll.onCheck, controller.api.postCheck)

module.exports = router