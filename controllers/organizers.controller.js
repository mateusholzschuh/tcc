const User = require('../models/user.model')
const Event = require('../models/event.model')
const Enrollment = require('../models/enrollment.model')
const Workshop = require('../models/workshop.model')
const UserEvent = require('../models/user-event.model')

const { RoleName } = require('../utils/roles')

const mail = require('../utils/mail-transporter')

const moment = require('moment')

/**
 * Mostra a pagina com a listagem dos organizadores
 */
exports.index = async (req, res, next) => {
    let ues = await UserEvent.find({ event: req.params.id/*, role: { $regex: /[^(speaker)]/, $options: 'i' }*/ }).populate('user').exec()
    // let users = await User.find().select('name')
    ues = ues.map(e => {
        e.role = RoleName(e.role)
        return e
    })

    return res.render('events/event/organizers/list', {
        title: 'Organizadores',
        list: ues,
        moment: moment, // biblioteca formatar data
    })
}

/**
 * Mostra a página de adicionar novo item
 */
exports.create = async (req, res) => {
    let users = await Enrollment.find({ event: req.params.id }).populate('user').exec()

    return res.render('events/event/organizers/add', {
        title: 'Adicionar Organizador',
        users: users
    })
}

/**
 * Função responsável por salvar novo organizador
 */
exports.store = async (req, res, next) => {
    // return res.json(req.body)
    let event = req.params.id    
    const form = { user, role } = req.body

    let ue = {
        user,
        event,
        role
    }

    let u = await User.findById(user)

    let password = Math.random().toString(36).slice(-8)

    if (u) {
        u.password = password
        u.save()
    }

    //send mail
    let template = 
`<h1> Olá ${u.name}!</h1>
<p>Sua senha de acesso ao sistema é:</p>
<p><strong>Email:</strong> ${u.email}</p>
<p><strong>Senha:</strong> ${password}</p>
`

    mail.sendMail({
        to: u.email,
        subject: 'Credenciais de acesso ao sistema',
        html: template
    })


    UserEvent.create(ue).then(r => {


        return res.redirect('../organizers')
    }).catch(e => {
        // res.status(500).json(e)
        next()
    })
}

/**
 * Mostra a página de edição de um item
 */
exports.edit = async (req, res, next) => {
    let ue = await UserEvent.findOne({ _id: req.params.ue }).populate('user').exec()
// return res.json(ue)
    // Workshop.findById(req.params.workshop).then(doc => {
        return res.render('events/event/organizers/edit', {
            title: 'Editar Organizador',
            obj: ue,
            moment: moment, // biblioteca
        })
    // })
}

/**
 * Função responsável por salvar as alterações do item vindos da rota "edit" 
 */
exports.update = async (req, res, next) => {
    const _id = req.params.ue
    const { role } = req.body

    let ue = {
        role
    }

    UserEvent.findByIdAndUpdate(_id, ue).then(doc => {
        return res.redirect('../../organizers')
    }).catch(err => {
        console.error(err)
        // res.json(err)
        next()
    })
}

/**
 * Função responsável por deletar o item do banco de dados
 */
exports.destroy = (req, res, next) => {
    UserEvent.deleteOne({ _id: req.params.ue }).then(doc => {
        return res.redirect('../../organizers')
    })
}