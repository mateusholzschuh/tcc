const User = require('../models/user.model');
const Event = require('../models/event.model');
const Lecture = require('../models/lecture.model');
const Enrollment = require('../models/enrollment.model');
const moment = require('moment');
const { body, validationResult } = require('express-validator');

/**
 * Mostra a pagina com a listagem das inscrições
 */
const index = async (req, res, next) => {
    let event = await Event.findOne({ _id: req.params.id }).populate({
        path: 'enrolleds',
        populate: {
            path: 'user',
            select: 'name cpf email institution instituicao',
            populate: {
                path: 'institution',
                select: 'name'
            }
        }
    }).exec()
        .catch(err => {
            console.error(err)
            return;
        });

    let users = await User.find().select('name')

    res.render('events/event/enrolleds', {
        title: 'Inscritos',
        list: event.enrolleds,
        users: users,
        tab: 'list',
        moment: moment, // biblioteca formatar data
        // menu: [
        //     {
        //         title: 'Adicionar nova',
        //         url: `/events/${req.params.id}/lectures/create`,
        //         icon: 'add'
        //     }
        // ]
    });
};

/**
 * Função responsável por salvar a inscrição no evento
 */
const store = async (req, res, next) => {

    let event = await Event.findOne({ _id: req.params.id }).populate({
        path: 'enrolleds',
        populate: {
            path: 'user',
            select: 'name cpf email institution instituicao',
            populate: {
                path: 'institution',
                select: 'name'
            }
        }
    }).exec()
        .catch(err => {
            console.error(err)
            return next()
        });

    let users = await User.find().select('name')
    
    const form = { name, email, cpf, birthdate, institution } = req.body;
    
    // validação dos campos
    if (validationResult(req).errors.length != 0) {
        return res.render('events/event/enrolleds', {
            title: 'Inscritos',
            list: event.enrolleds,
            users: users,
            tab: 'add',
            form,
            errors: validationResult(req).errors.map(e=>e.msg),
            moment: moment, // biblioteca formatar data
            // menu: [
            //     {
            //         title: 'Adicionar nova',
            //         url: `/events/${req.params.id}/lectures/create`,
            //         icon: 'add'
            //     }
            // ]
        });
    }

    // busca usuário
    let user = await User.findOne({ cpf: form.cpf }).select('_id').exec();

    // se não existe, cria
    if (!user) {
        user = await User.create({
            name: form.name,
            email: form.email,
            cpf: form.cpf,
            birthdate: moment(form.birthdate, 'DD/MM/YYYY'),
            instituicao: form.institution
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
        Event.updateOne({ _id: event._id }, { '$push': { 'enrolleds': r._id } }).then(ok => {
            res.redirect('./enrolleds');
        })
    }).catch(e => {
        console.error(e)
        return next()
    })
};

/**
 * Função responsável por deletar inscrição //! Não deve ser usada em produção
 */
const destroy = (req, res, next) => {
    Event.findByIdAndUpdate(req.params.id, { '$pull': { 'enrolleds': req.params.enroll } }).exec().then(doc => {
        Enrollment.findByIdAndDelete(req.params.lecture).then(doc => {
            res.redirect('..')
        })
    })
};

// exporta as funções
module.exports = { index, store, destroy };