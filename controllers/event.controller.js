const Event = require('../models/event.model')
const User = require('../models/user.model')

const moment = require('moment')

/**
 * Mostra a pagina com a listagem dos itens
 */
const index = async (req, res, next) => {
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
const create = (req, res, next) => {
    return res.render('events/create', {
        title: 'Novo evento'
    })
}

/**
 * Função responsável por salvar os dados vindos da rota "create"
 */
const store = (req, res, next) => {
    let form = { name, description, location, days, startDate, finishDate, finished } = req.body

    let event = {
        ...form,
        days: Number(days) || 1,
        startDate: moment(startDate, 'DD/MM/YYYY - HH:mm'),
        finishDate: moment(finishDate, 'DD/MM/YYYY - HH:mm'),
        finished: finished == 'on' ? true : false,
    }

    Event.create(event).then(doc => {
        return res.redirect('./')
    }).catch(err => {
        next()
    })
}

/**
 * Mostra a página de exibição de um item 
 */
const view = async (req, res, next) => {
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
const edit = async (req, res, next) => {
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
const update = (req, res, next) => {
    let form = { name, description, location, days, startDate, finishDate, finished } = req.body

    let event = {
        ...form,
        days: Number(days),
        startDate: moment(startDate, 'DD/MM/YYYY - HH:mm'),
        finishDate: moment(finishDate, 'DD/MM/YYYY - HH:mm'),
        finished: finished == 'on' ? true : false,
    }

    Event.findByIdAndUpdate(req.params.id, event).then(doc => {
        return res.redirect('./')
    })
}

/**
 * Função responsável por deletar o item do banco de dados
 */
const destroy = (req, res, next) => {
    Event.findByIdAndRemove(req.params.id).then(doc => {
        return res.redirect('/events')
    })
}

const subevents = (req, res) => {
    return res.render('events/event/subevents', {
        title: 'Subeventos'
    })
}

// exporta as funções
module.exports = { index, create, store, view, edit, update, destroy, subevents }