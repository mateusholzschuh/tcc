const express = require('express')
const router = express.Router()

const hasPermission = require('../middlewares/has-authorization')

// controller
const controller = require('../controllers/event.controller')

// validator
const validator = require('../middlewares/validators/events')

// routes workshop
const workshop = require('../routes/workshop.routes')

// routes hackathon
const hackathon = require('../routes/hackathon.routes')

// routes lectures
const lectures = require('../routes/lecture.routes')

// routes enrolleds
const enrolleds = require('../routes/enrolleds.routes')
 
// routes checkin
const checkins = require('../routes/checkin.routes')

// routes organizers
const organizers = require('../routes/organizers.routes')

// css menu
router.all('/*', (req, res, next) => {
    res.locals.mainMenu = 'events'
    next()
})

router.all('/:id/*', (req, res, next) => {
    res.locals.baseUrl = `/events/${req.params.id}`    
    next()
})

// ROTAS DO RESOURCE

// rota que exibe lista de eventos
router.get('/', controller.index)

// rota que mostra form para criar evento
router.get('/create', controller.create)

// rota que salva um novo evento
router.post('/', validator.onSave, controller.store)

// rota que mostra um evento
router.get('/:id', controller.view)

// rota que mostra form edição de um evento
router.get('/:id/edit', hasPermission('coordinator'),controller.edit)

// rota que atualiza informações do evento
router.post('/:id/edit', validator.onUpdate, controller.update)

// rota para remover eventos
router.get('/:id/delete', hasPermission('admin'), controller.destroy)

// rotas das oficinas
router.use('/:id/workshops', workshop)

// rotas do hackathon
router.use('/:id/hackathon', hackathon)

// rotas das palestras
router.use('/:id/lectures', lectures)

// rotas dos inscritos
router.use('/:id/enrolleds', enrolleds)

// rotas dos subeventos
router.use('/:id/subevents', controller.subevents)

// rotas do checkin
router.use('/:id/checkin', hasPermission('accreditation'), checkins)

// rotas dos organizadores
router.use('/:id/organizers', hasPermission('coordinator'), organizers)

// exporta o router
module.exports = router