const Event = require('../models/event.model')
const EventService = require('../services/event')

const moment = require('moment')

/**
 * Mostra a pagina com a listagem dos itens
 */
exports.index = async (req, res, next) => {
    let events = await Event.find().select('name location startDate finishDate updatedAt finished').exec().catch(err => {
        res.redirect('../', 500)
    })

    return res.render('events/index', {
        title: 'Eventos',
        list: events,
        menu: [
            {
                title: 'Adicionar novo',
                url: '/events/create',
                icon: 'plus-circle'
            }
        ],
        moment: moment
    })
}

/**
 * Mostra a pagina de add novo item
 */
exports.create = (req, res, next) => {
    return res.render('events/create', {
        title: 'Novo evento'
    })
}

/**
 * Função responsável por salvar os dados vindos da rota "create"
 */
exports.store = (req, res, next) => {
    let form = { name, description, location, days, startDate, finishDate } = req.body

    let event = {
        ...form,
        days: Number(days) || 1,
        startDate: moment(startDate, 'DD/MM/YYYY - HH:mm'),
        finishDate: moment(finishDate, 'DD/MM/YYYY - HH:mm'),
        periods: {}
    }

    let periods = {
        morning : form['periods[morning]'] == 'on' ? true : false,
        afternoon : form['periods[afternoon]'] == 'on' ? true : false,
        night : form['periods[night]'] == 'on' ? true : false,
    }

    event.periods = periods

    Event.create(event).then(doc => {
        return res.redirect('./')
    }).catch(err => {
        next()
    })
}

/**
 * Mostra a página de exibição de um item 
 */
exports.view = async (req, res, next) => {
    let event = await Event.findOne({ _id: req.params.id }).exec()

    return res.render('events/event/index', {
        title: event.name || 'Evento #BLABLA',
        event: event,
        moment: moment,
    })
}

/**
 * Mostra a página de edição de um item
 */
exports.edit = async (req, res, next) => {
    let event = await Event.findOne({ _id: req.params.id }).exec()

    return res.render('events/event/settings', {
        title: 'Configurações',
        event: event,
        moment: moment,
        eventMenu: 'settings'
    })
}

/**
 * Função responsável por salvar as alterações do item vindos da rota "edit" 
 */
exports.update = (req, res, next) => {
    let form = { name, description, location, days, hours, startDate, finishDate, finished } = req.body
    let { apiGlobal, apiEnroll, apiCheck, apiLectures, apiWorkshops, apiEnrolleds } = req.body
    let api = { 
        global: apiGlobal == 'on', 
        enroll: apiEnroll == 'on', 
        check: apiCheck == 'on', 
        getLectures: apiLectures == 'on', 
        getWorkshops: apiWorkshops == 'on',
        getEnrolleds: apiEnrolleds == 'on'
    }

    let event = {
        ...form,
        days: Number(days) || 1,
        hours: Number(hours) || 1,
        startDate: moment(startDate, 'DD/MM/YYYY - HH:mm'),
        finishDate: moment(finishDate, 'DD/MM/YYYY - HH:mm'),
        finished: finished == 'on' ? true : false,
        api
    }

    Event.findByIdAndUpdate(req.params.id, event).then(doc => {
        return res.redirect('./')
    })
}

/**
 * Função responsável por deletar o item do banco de dados
 */
exports.destroy = (req, res, next) => {
    Event.findByIdAndRemove(req.params.id).then(doc => {
        return res.redirect('/events')
    })
}

exports.subevents = (req, res) => {
    return res.render('events/event/subevents', {
        title: 'Subeventos'
    })
}

getEvents = async (params) => {
    return await Event.find(params).select('name description location days hours periods startDate finishDate')
}

exports.api = {

    getAll: async (req, res) => {
        let events = await getEvents({})
        return res.json(events)
    },

    getById: async (req, res) => {
        let id = req.params.id

        try {
            event = await getEvents({ _id: id })
            return res.json(event[0])
        } catch(e) {
            return res.status(400)
                        .json({errors: ['Evento não encontrado']})
        }
    },

    getByIdFull: async (req, res) => {
        let id = req.params.id

        try {
            event = await getEvents({ _id: id })
            event = event[0]

            lectures = await EventService.getLectures(id)
            event.lectures = lectures

            workshops = await EventService.getWorkshops(id)
            event.workshops = workshops


            return res.json(event)
        } catch(e) {
            return res.status(400)
                        .json({errors: ['Evento não encontrado']})
        }
    },

    getLectures: async (req, res) => {
        let id = req.params.id

        try {
            lectures = await EventService.getLectures(id)
            return res.json(lectures)
        } catch(e) {
            return res.status(400)
                        .json({errors: ['Palestra não encontrado']})
        }
    },

    getWorkshops: async (req, res) => {
        let id = req.params.id

        try {
            workshops = await EventService.getWorkshops(id)
            
            return res.json(workshops)
        } catch(e) {
            return res.status(400)
                        .json({errors: ['Oficina não encontrado']})
        }
    },

    getEnrolleds: async (req, res) => {
        let id = req.params.id

        try {
            enrolleds = await EventService.getEnrolleds(id)
            
            return res.json(enrolleds)
        } catch(e) {
            return res.status(400)
                        .json({errors: [e]})
        }
    },

    postEnroll: async (req, res) => {
        let id = req.params.id
        let data = { name, cpf, email, birthdate, institution } = req.body
        let user = {
            ...data,
            birthdate: new Date(Number(birthdate))
        }

        try {
            user = await EventService.enroll(user, id)            
            return res.json(user)
        } catch(e) {
            return res.status(400)
                        .json({errors: [e]})
        }
    },

    postCheck: async (req, res) => {
        let id = req.params.id
        let user = { cpf } = req.body

        try {
            ticket = await EventService.checkEnroll(user, id)           
            
            return res.json({
                message: 'Usuário está inscrito!',
                data: ticket
            })
        } catch(e) {
            return res.status(400)
                        .json({errors: [e]})
        }
    }
}
