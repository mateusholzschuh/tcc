const router = require('express').Router()
const controller = require('../../../controllers/institution.controller')

router.get('/', controller.api.getAll)

router.get('/:id', controller.api.getById)

module.exports = router