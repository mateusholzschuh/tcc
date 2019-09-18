const User = require('../models/user.model');
const Event = require('../models/event.model');
const Workshop = require('../models/workshop.model');
const moment = require('moment');

const { validationResult } = require('express-validator');

/**
 * Mostra a pagina com a listagem das oficinas
 */
const index = async (req, res, next) => {
    let event = await Event.findOne({ _id: req.params.id }).populate({
        path: 'workshops',
        populate: {
            path: 'speakers',
            select: 'name'
        }
    }).exec()
        .catch(err => {
            console.error(err)
            return;
        });

    let users = await User.find().select('name')

    res.render('events/event/workshops/index', {
        title: 'Oficinas',
        list: event.workshops,
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
 * Função responsável por salvar nova oficina
 */
const store = async (req, res, next) => {

    let event = await Event.findOne({ _id: req.params.id }).populate({
        path: 'workshops',
        populate: {
            path: 'speakers',
            select: 'name'
        }
    }).exec()
        .catch(err => {
            console.error(err)
            return;
        });

    const form = { name, description, location, date, limit, confirmed, speakers } = req.body;

    // validação dos campos
    if (validationResult(req).errors.length != 0) {

        let users = await User.find().select('name')

        return res.render('events/event/workshops/index', {
            title: 'Oficinas',
            list: event.workshops,
            users: users,
            tab: 'add',
            form,
            errors: validationResult(req).errors.map(e => e.msg),
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

    let workshop = {
        name,
        description,
        location,
        date: moment(date, 'DD/MM/YYYY - HH:mm'),
        limit: Number(limit) || 1,
        confirmed: confirmed == 'on' ? true : false,
        speakers,
        event
    }

    Workshop.create(workshop).then(r => {
        Event.findOneAndUpdate({ _id: event }, { '$push': { 'workshops': r._id } }).then(ok => {
            res.redirect('./workshops');
        })
    }).catch(e => {
        // res.status(500).json(e);
        next();
    })
};

/**
 * Mostra a página de edição de um item
 */
const edit = async (req, res, next) => {

    let users = await User.find().select('name')

    Workshop.findById(req.params.workshop).then(doc => {
        res.render('events/event/workshops/edit', {
            title: 'Editar Oficina',
            obj: doc,
            users: users,
            moment: moment, // biblioteca
        })
    });

};

/**
 * Função responsável por enviar a lista de inscritos e o form de inscrever
 */
const enrolleds = async (req, res, next) => {
    let workshop = await Workshop.findById(req.params.workshop)
        .populate({
            path: 'enrolleds.user',
            select: 'name cpf'
        }).exec();

    let users = await Event.findOne({ _id: req.params.id }).select('enrolleds').populate({
        path: 'enrolleds',
        select: 'user code -_id',
        populate: {
            path: 'user',
            select: 'name cpf'
        }
    }).exec();

    // res.json(users)
    // return
    res.render('events/event/workshops/enrolleds', {
        title: workshop.name || 'Inscritos na oficina',
        turl: '/events/' + req.params.id + '/workshops',
        list: workshop.enrolleds,
        workshop: workshop._id,
        users: users.enrolleds,
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
 * Função responsável por inscrever cidadão na oficina 
 */
const enroll = async (req, res, next) => {
    const { user } = req.body;
    const workshop = req.params.workshop;

    let count = await Workshop.findOne({ _id: workshop, enrolleds: { '$elemMatch': { user: user } } }).count()

    // já está inscrito
    // TODO: mostrar mgss
    if (count != 0) {

        res.redirect('./enrolleds')
        return
    }

    Workshop.findByIdAndUpdate(workshop, { '$push': { 'enrolleds': { user: user } } }).then(doc => {
        res.redirect('./enrolleds')
    }).catch(err => {
        // res.json(err);
        next();
    })

};

/**
 * Função para remover inscrição de uma oficina
 */
const unEnroll = (req, res, next) => {
    const { enroll, workshop, id } = req.params;
    Workshop.updateOne({ _id: workshop }, { '$pull': { 'enrolleds': { '_id' : enroll } } }).then(doc => {
        res.redirect(`/events/${id}/workshops/${workshop}/enrolleds`)
    }).catch(err => {
        // return res.json({err})
        next()
    })
};


/**
 * Função responsável por salvar as alterações do item vindos da rota "edit" 
 */
const update = async (req, res, next) => {
    const form = { name, description, location, date, limit, confirmed, speakers } = req.body;

    // validação dos campos
    if (validationResult(req).errors.length != 0) {

        let users = await User.find().select('name')

        Workshop.findById(req.params.workshop).then(doc => {
            return res.render('events/event/workshops/edit', {
                title: 'Editar Oficina',
                obj: doc,
                users: users,
                tab: 'add',
                form,
                errors: validationResult(req).errors.map(e => e.msg),
                moment: moment, // biblioteca formatar data
                // menu: [
                //     {
                //         title: 'Adicionar nova',
                //         url: `/events/${req.params.id}/lectures/create`,
                //         icon: 'add'
                //     }
                // ]
            });
        });
    }

    let workshop = {
        name,
        description,
        location,
        limit: Number(limit) || 1,
        date: moment(date, 'DD/MM/YYYY - HH:mm'),
        confirmed: confirmed == 'on' ? true : false,
        speakers
    }

    Workshop.findByIdAndUpdate(req.params.workshop, workshop).then(doc => {
        res.redirect('../../workshops');
    })
        .catch(err => {
            console.error(err)
            // res.json(err)
            next()
        })

};

/**
 * Função responsável por deletar o item do banco de dados
 */
const destroy = (req, res, next) => {
    Event.findByIdAndUpdate(req.params.id, { '$pull': { 'workshops': req.params.workshop } }).exec().then(doc => {
        Workshop.findByIdAndDelete(req.params.workshop).then(doc => {
            return res.redirect(`/events/${req.params.id}/workshops`)
        })
    })
};

// exporta as funções
module.exports = { index, store, edit, update, destroy, enrolleds, enroll, unEnroll };