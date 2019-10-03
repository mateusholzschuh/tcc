const Enrollment = require('../models/enrollment.model')
const Hackathon = require('../models/hackathon.model')

/**
 * Mostra a pagina com a listagem dos times
 */
const index = async (req, res, next) => {
    let hackathon = await Hackathon.findOne({ event: req.params.id }).populate({
        path: 'teams.members',
        select: 'name cpf'
    }).exec()

    return res.render('events/event/hackathon/list', {
        title: 'Hackathon',
        list: hackathon.teams,
    })
}

/**
 * Mostra a página para adicionar novo time
 */
const create = async (req, res) => {
    let users = await Enrollment.find({ event: req.params.id }).populate('user', 'name cpf').exec()
    users = users.map(e => e.user)

    return res.render('events/event/hackathon/add-team', {
        title: 'Hackathon - Adicionar novo time',
        users: users
    })
}

/**
 * Função responsável por salvar novo time no hackathon
 */
const store = async (req, res, next) => {
    let form = { name, member1, member2, member3 } = req.body
    let event = req.params.id

    let team = {
        name,
        members: [member1, member2, member3]
    }

    Hackathon.findOneAndUpdate({ event: event }, { '$push': { 'teams': team } }).then(doc => {
        return res.redirect('../hackathon')
    }).catch(err => {
        console.error(err)
        next()
    })
}

/**
 * Função responsável por deletar time do hackathon
 */
const destroy = (req, res, next) => {
    Hackathon.findOneAndUpdate({ event: req.params.id }, { '$pull': { 'teams': { '_id': req.params.team } } }).then(doc => {
        return res.redirect(`/events/${req.params.id}/hackathon`)
    }).catch(err => {
        next()
    })
}

// exporta as funções
module.exports = { index, create, store, destroy }