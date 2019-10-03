const User = require('../models/user.model')
const Event = require('../models/event.model')
const Lecture = require('../models/lecture.model')

const moment = require('moment')

/**
 * Mostra a pagina com a listagem das palestras
 */
const index = async (req, res, next) => {
    let lectures = await Lecture.find({ event: req.params.id }).populate('speakers', 'name').exec()
    let users = await User.find().select('name')

    return res.render('events/event/lectures/list', {
        title: 'Palestras',
        list: lectures,
        users: users,
        moment: moment,
    })
}

/**
 * Mostra a página para adicionar novo item
 */
const create = async (req, res) => {
    let users = await User.find().select('name')

    return res.render('events/event/lectures/add', {
        title: 'Adicionar Palestra',
        users: users
    })
}

/**
 * Função responsável por salvar nova palestra
 */
const store = async (req, res, next) => {
    let event = req.params.id
    let form = { name, description, location, date, confirmed, speakers } = req.body

    let lecture = {
        name,
        description,
        location,
        date: moment(date, 'DD/MM/YYYY - HH:mm'),
        confirmed: confirmed == 'on' ? true : false,
        speakers,
        event
    }

    Lecture.create(lecture).then(r => {
        Event.findOneAndUpdate({ _id: event }, { '$push': { 'lectures': r._id } }).then(ok => {
            return res.redirect('../lectures')
        })
    }).catch(e => {
        next()
    })
}

/**
 * Mostra a página de edição da palestra
 */
const edit = async (req, res, next) => {
    let users = await User.find().select('name')

    Lecture.findById(req.params.lecture).then(doc => {
        return res.render('events/event/lectures/edit', {
            title: 'Editar Palestra',
            obj: doc,
            users: users,
            moment: moment, // biblioteca
        })
    })
}

/**
 * Função responsável por atualizar a palestra
 */
const update = async (req, res, next) => {   
    let form = { name, description, location, date, confirmed, speakers } = req.body

    let lecture = {
        name,
        description,
        location,
        date: moment(date, 'DD/MM/YYYY - HH:mm'),
        confirmed: confirmed == 'on' ? true : false,
        speakers
    }

    Lecture.findByIdAndUpdate(req.params.lecture, lecture).then(doc => {
        return res.redirect('../../lectures')
    }).catch(err => {
        console.error(err)
        next()
    })
}

/**
 * Função responsável por deletar a palestra
 */
const destroy = (req, res, next) => {
    Event.findByIdAndUpdate(req.params.id, { '$pull': { 'lectures': req.params.lecture } }).exec().then(doc => {
        Lecture.findByIdAndDelete(req.params.lecture).then(doc => {
            return res.redirect(`/events/${req.params.id}/lectures`)
        })
    })
}

// exporta as funções
module.exports = { index, create, store, edit, update, destroy }