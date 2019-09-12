const User = require('../models/user.model');
const Event = require('../models/event.model');
const Hackathon = require('../models/hackathon.model');
const moment = require('moment');

const { validationResult } = require('express-validator');

/**
 * Mostra a pagina com a listagem dos times
 */
const index = async (req, res, next) => {
    let event = await Event.findOne({ _id: req.params.id })
        .select('enrolleds')
        .populate({
            path: 'enrolleds',
            populate: {
                path: 'user',
                select: 'name cpf'
            }
        })
        .exec().catch(err => {
            console.error(err)
            return;
        });

    let hackathon = await Hackathon.findOne({ event: req.params.id }).populate({
        path: 'teams.members',
        select: 'name cpf'
    }).exec()

    let users = event.enrolleds.map(e => e.user)

    res.render('events/event/hackathon/index', {
        title: 'Hackathon',
        list: hackathon.teams,
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
 * Função responsável por salvar novo time no hackathon
 */
const store = async (req, res, next) => {

    const form = { name, member1, member2, member3 } = req.body;

    // validação dos campos
    if (validationResult(req).errors.length != 0) {

        let event = await Event.findOne({ _id: req.params.id })
            .select('enrolleds')
            .populate({
                path: 'enrolleds',
                populate: {
                    path: 'user',
                    select: 'name cpf'
                }
            })
            .exec().catch(err => {
                console.error(err)
                return;
            });

        let hackathon = await Hackathon.findOne({ event: req.params.id }).populate({
            path: 'teams.members',
            select: 'name cpf'
        }).exec()

        let users = event.enrolleds.map(e => e.user)

        return res.render('events/event/hackathon/index', {
            title: 'Hackathon',
            list: hackathon.teams,
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

    const event = req.params.id;

    let team = {
        name,
        members: [member1, member2, member3]
    }

    // res.json({lecture: lecture})

    Hackathon.findOneAndUpdate({ event: event }, { '$push': { 'teams': team } }).then(doc => {
        res.redirect('./hackathon')
    }).catch(err => {
        // res.redirect('./', 400)
        next()
    })

};

/**
 * Função responsável por deletar time do hackathon
 */
const destroy = (req, res, next) => {
    Hackathon.findOneAndUpdate({ event: req.params.id }, { '$pull': { 'teams': { '_id': req.params.team } } }).then(doc => {
        res.redirect(`/events/${req.params.id}/hackathon`)
    }).catch(err => {
        res.redirect('../../hackathon')
    })
};

// exporta as funções
module.exports = { index, store, destroy };