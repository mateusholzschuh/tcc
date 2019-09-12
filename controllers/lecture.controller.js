const User = require('../models/user.model');
const Event = require('../models/event.model');
const Lecture = require('../models/lecture.model');
const moment = require('moment');

const { validationResult } = require('express-validator')

/**
 * Mostra a pagina com a listagem das palestras
 */
const index = async (req, res, next) => {
    let event = await Event.findOne({ _id: req.params.id }).populate({
        path: 'lectures',
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

    res.render('events/event/lectures', {
        title: 'Palestras',
        list: event.lectures,
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
 * Função responsável por salvar nova palestra
 */
const store = async (req, res, next) => {

    let event = await Event.findOne({ _id: req.params.id }).populate({
        path: 'lectures',
        populate: {
            path: 'speakers',
            select: 'name'
        }
    }).exec()
        .catch(err => {
            console.error(err)
            return next()
        });

    // res.json(event)

    let users = await User.find().select('name')

    const form = { name, description, location, date, confirmed, speakers } = req.body;

    // validação dos campos
    if (validationResult(req).errors.length != 0) {
        return res.render('events/event/lectures', {
            title: 'Palestras',
            list: event.lectures,
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

    let lecture = {
        name,
        description,
        location,
        date: moment(date, 'DD/MM/YYYY - HH:mm'),
        confirmed: confirmed == 'on' ? true : false,
        speakers,
        event
    }

    // res.json({lecture: lecture})

    Lecture.create(lecture).then(r => {
        // res.json(r)
        Event.findOneAndUpdate({ _id: event }, { '$push': { 'lectures': r._id } }).then(ok => {

            res.redirect('./lectures');
        })
    }).catch(e => {
        //res.status(500).json(e);
        next()
    })
};

/**
 * Mostra a página de edição da palestra
 */
const edit = async (req, res, next) => {

    let users = await User.find().select('name')

    Lecture.findById(req.params.lecture).then(doc => {
        return res.render('events/event/lectures-edit', {
            title: 'Editar palestra',
            obj: doc,
            users: users,
            moment: moment, // biblioteca
        })
    });

};

/**
 * Função responsável por atualizar a palestra
 */
const update = async (req, res, next) => {
    
    const form = { name, description, location, date, confirmed, speakers } = req.body;

    // validação dos campos
    if (validationResult(req).errors.length != 0) {

        let users = await User.find().select('name')

        Lecture.findById(req.params.lecture).then(doc => {
            return res.render('events/event/lectures-edit', {
                title: 'Editar palestra',
                users: users,
                obj: doc,
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
        })
    }

    let lecture = {
        name,
        description,
        location,
        date: moment(date, 'DD/MM/YYYY - HH:mm'),
        confirmed: confirmed == 'on' ? true : false,
        speakers
    }

    // res.json({lecture: lecture})

    Lecture.findByIdAndUpdate(req.params.lecture, lecture).then(doc => {
        res.redirect('../../lectures');
    })
        .catch(err => {
            console.error(err)
            //res.json(err)
            return next()
        })

};

/**
 * Função responsável por deletar a palestra
 */
const destroy = (req, res, next) => {
    Event.findByIdAndUpdate(req.params.id, { '$pull': { 'lectures': req.params.lecture } }).exec().then(doc => {
        Lecture.findByIdAndDelete(req.params.lecture).then(doc => {
            res.redirect(`/events/${req.params.id}/lectures`)
        })
    })
};

// exporta as funções
module.exports = { index, store, edit, update, destroy };