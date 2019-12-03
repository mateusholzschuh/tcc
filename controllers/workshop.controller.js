const User = require('../models/user.model')
const Event = require('../models/event.model')
const Enrollment = require('../models/enrollment.model')
const Workshop = require('../models/workshop.model')
const WorkshopService = require('../services/workshop')
const CertificateService = require('../services/certificate')

const moment = require('moment')

/**
 * Mostra a pagina com a listagem das oficinas
 */
exports.index = async (req, res, next) => {
    let workshops = await Workshop.find({ event: req.params.id }).populate('speakers', 'name').exec()
    let users = await User.find().select('name')

    return res.render('events/event/workshops/list', {
        title: 'Oficinas',
        list: workshops,
        users: users,
        moment: moment, // biblioteca formatar data
    })
}

/**
 * Mostra a página de adicionar novo item
 */
exports.create = async (req, res) => {
    let users = await User.find().select('name').exec()

    return res.render('events/event/workshops/add', {
        title: 'Adicionar Oficina',
        users: users
    })
}

/**
 * Função responsável por salvar nova oficina
 */
exports.store = async (req, res, next) => {
    let event = req.params.id    
    const form = { name, description, location, date, hours, limit, confirmed, speakers } = req.body

    let workshop = {
        name,
        description,
        location,
        date: moment(date, 'DD/MM/YYYY - HH:mm'),
        hours: Number(hours) || 1,
        limit: Number(limit) || 1,
        confirmed: confirmed == 'on' ? true : false,
        speakers,
        event
    }

    // Workshop.create(workshop).then(r => {
    //     Event.findOneAndUpdate({ _id: event }, { '$push': { 'workshops': r._id } }).then(ok => {
    //         return res.redirect('../workshops')
    //     })
    // }).catch(e => {
    //     // res.status(500).json(e)
    //     next()
    // })
    try {
        await WorkshopService.createOne(workshop, event)
        return res.redirect('../workshops')
    } catch (e) {
        return next(e)
    }
}

/**
 * Mostra a página de edição de um item
 */
exports.edit = async (req, res, next) => {
    let users = await User.find().select('name')

    Workshop.findById(req.params.workshop).then(doc => {
        return res.render('events/event/workshops/edit', {
            title: 'Editar Oficina',
            obj: doc,
            users: users,
            moment: moment, // biblioteca
        })
    })
}

/**
 * Função responsável por enviar a lista de inscritos e o form de inscrever
 */
exports.enrolleds = async (req, res, next) => {
    let workshop = await Workshop.findById(req.params.workshop).populate({
        path: 'enrolleds.user',
        select: 'name cpf'
    }).exec()

    let users = await Enrollment.find({ event: req.params.id }).select('user code -_id').populate('user', 'name cpf').exec()

    return res.render('events/event/workshops/enrolleds', {
        title: workshop.name || 'Inscritos na oficina',
        turl: '/events/' + req.params.id + '/workshops',
        list: workshop.enrolleds,
        workshop: workshop._id,
        users: users,
        moment: moment, // biblioteca formatar data
    })
}

/**
 * Função responsável por inscrever cidadão na oficina 
 */
exports.enroll = async (req, res, next) => {
    const { user } = req.body
    const workshop = req.params.workshop
    const event = req.params.id

    let count = await Workshop.findOne({ _id: workshop, enrolleds: { '$elemMatch': { user: user } } }).countDocuments()

    // já está inscrito
    // TODO: mostrar mgss
    if (count != 0) {
        return res.redirect('./enrolleds')
    }

    // Workshop.findByIdAndUpdate(workshop, { '$push': { 'enrolleds': { user: user } } }).then(doc => {
    //     return res.redirect('./enrolleds')
    // }).catch(err => {
    //     // res.json(err)
    //     next()
    // })
    try {
        WorkshopService.enroll(workshop, user)
        return res.redirect('./enrolleds')
    } catch (e) {
        return next(e)
    }
}

/**
 * Função para remover inscrição de uma oficina
 */
exports.unEnroll = (req, res, next) => {
    const { enroll, workshop, id } = req.params

    Workshop.updateOne({ _id: workshop }, { '$pull': { 'enrolleds': { '_id' : enroll } } }).then(doc => {
        return res.redirect(`/events/${id}/workshops/${workshop}/enrolleds`)
    }).catch(err => {
        // return res.json({err})
        next()
    })
}

/**
 * Função responsável por salvar as alterações do item vindos da rota "edit" 
 */
exports.update = async (req, res, next) => {
    const form = { name, description, location, date, hours, limit, confirmed, speakers } = req.body

    let workshop = {
        name,
        description,
        location,
        limit: Number(limit) || 1,
        date: moment(date, 'DD/MM/YYYY - HH:mm'),
        hours: Number(hours) || 1,
        confirmed: confirmed == 'on' ? true : false,
        speakers
    }

    Workshop.findByIdAndUpdate(req.params.workshop, workshop).then(doc => {
        return res.redirect('../../workshops')
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
    Event.findByIdAndUpdate(req.params.id, { '$pull': { 'workshops': req.params.workshop } }).exec().then(doc => {
        Workshop.findByIdAndDelete(req.params.workshop).then(doc => {
            return res.redirect(`/events/${req.params.id}/workshops`)
        })
    })
}

exports.ajax = {
    /**
     * Atualiza presença de um inscrito na oficina
     */
    updatePresence: async (req, res) => {
        const { enroll, workshop, checked } = req.body
        let _worshop = await Workshop.findById(workshop)
        let user = _worshop.enrolleds.filter(e => e._id == enroll)[0]

        if (checked == 'true') {
            console.log('criou')
            console.log(
                await CertificateService.create({
                    user: user.user,
                    event: _worshop.event,
                    workshop,
                    type: 'wenrolled'
                })
            )
        } else {
            console.log('eliminou?')
            console.log(
                await CertificateService.deleteOne({ type: 'wenrolled', workshop, user: user.user}).then(r => console.log(r))
            )
        }

        await Workshop.updateOne({_id : workshop, 'enrolleds._id' : enroll }, { '$set' : { 'enrolleds.$.presence' : checked }})
        .then(ok => {            
            return res.status(200).json({message:'Presença atualizada com sucesso'})
        }).catch(err => {
            console.error(err)
            return res.status(500).json({errors: ["Ocorreu um erro ao processar, tente novamente"]})
        })
    }
}