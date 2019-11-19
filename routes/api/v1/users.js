const router = require('express').Router()
const controller = require('../../../controllers/user.controller')

const validators = {
    // enroll: require('../../../middlewares/validators/enrollments/api')
}

router.get('/', controller.api.getAll)

router.get('/:id', controller.api.getById)

module.exports = router