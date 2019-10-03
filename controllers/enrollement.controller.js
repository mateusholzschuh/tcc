const User = require('../models/user.model')
const Event = require('../models/event.model')
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
    let form = { name, email, cpf, birthdate, institution } = req.body

    // busca usuário
    let user = await User.findOne({ cpf: form.cpf }).select('_id').exec()

    // se não existe, cria
    if (!user) {
        user = await User.create({
            name,
            email,
            cpf,
            birthdate: moment(birthdate, 'DD/MM/YYYY'),
            instituicao: institution,
        })
    }

    // instancia inscrição
    let enrollment = {
        user,
        event
    }

    // salva inscrição
    Enrollment.create(enrollment).then(r => {
        // insere inscrição no evento
        Event.updateOne({ _id: event }, { '$push': { 'enrolleds': r._id } }).then(ok => {
            return res.redirect('../enrolleds')
        })
    }).catch(e => {
        console.error(e)
        next()
    })
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