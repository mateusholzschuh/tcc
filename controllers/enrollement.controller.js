const User = require('../models/user.model')
const Event = require('../models/event.model')
const EventService = require('../services/event')
const Enrollment = require('../models/enrollment.model')

const moment = require('moment')

/**
 * Mostra a pagina com a listagem das inscrições
 */
exports.index = async (req, res, next) => {
    let enrolleds = await Enrollment.find({ event: req.params.id }).populate('user', 'name cpf email institution instituicao').exec()

    return res.render('events/event/enrolleds/list', {
        title: 'Inscritos',
        list: enrolleds
    })
}

/**
 * Mostra formulário para nova inscrição no evento
 */
exports.create = (req, res) => {
    return res.render('events/event/enrolleds/add', {
        title: 'Nova inscrição'
    })
}

/**
 * Função responsável por salvar a inscrição no evento
 */
exports.store = async (req, res, next) => {
    let event = req.params.id
    let form = { name, email, cpf, birthdate, institution, instituicao } = req.body
    let user = {
        ...form,
        birthdate: moment(birthdate, 'DD/MM/YYYY')
    }

    try {
        await EventService.enroll(user, event)
        return res.redirect('../enrolleds')
    } catch(e) {
        console.error(e)
        return next()
    }

}

/**
 * Mostra formulário para editar inscrição no evento
 */
exports.edit = async (req, res) => {
    let user = await User.findById(req.params.user).select('name email cpf instituicao institution birthdate')

    user._doc.birthdate = moment(user.birthdate).format('DD/MM/YYYY')

    return res.render('events/event/enrolleds/edit', {
        title: 'Editar inscrição',
        obj: user
    })
}

/**
 * Função responsável por ataulizar a inscrição
 */
exports.update = async (req, res, next) => {
    let event = req.params.id
    let uid = req.params.user
    let form = { name, email, cpf, birthdate, institution, instituicao } = req.body
    let user = {
        ...form,
        birthdate: moment(birthdate, 'DD/MM/YYYY'),
    }

    try {
        await User.updateOne({ email }, user)
        return res.redirect('../../enrolleds')
    } catch(e) {
        console.error(e)
        return next()
    }

}

/**
 * Função responsável por deletar inscrição //! Não deve ser usada em produção
 */
exports.destroy = (req, res, next) => {
    Event.findByIdAndUpdate(req.params.id, { '$pull': { 'enrolleds': req.params.enroll } }).exec().then(doc => {
        Enrollment.findByIdAndDelete(req.params.enroll).then(doc => {
            return res.redirect('..')
        })
    })
}