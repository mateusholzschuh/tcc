const User = require('../models/user.model');
const Event = require('../models/event.model');
const Hackathon = require('../models/hackathon.model');
const moment = require('moment');

/**
 * Mostra a pagina com a listagem dos times
 */
const index = async (req, res, next) => {
    let event = await Event.findOne({ _id: req.params.id })
    .select('enrolleds')
    .populate({
        path: 'enrolleds',
        populate: {
            path:'user',
            select: 'name cpf'
        }
    })
    .exec().catch(err => {
        console.error(err)
        return;
    });

    let hackathon = await Hackathon.findOne( {event: req.params.id }).populate({
        path: 'teams.members',
        select: 'name cpf'
    }).exec()
//     res.json(event)
// return
    let users = event.enrolleds.map(e => e.user)

    //let event = await Event.findOne({ _id: req.params.id }).exec()
    // let event = await Event.find({}).exec().catch(err => console.error(err))
    // let event = await Event.findById(req.params.id).exec().catch(err => console.error(err))
    // res.json(event)

    // let lectures = await Lecture.find().catch(err => {
    //     res.redirect('../', 500)
    // });

    // res.json(lectures)

    res.render('events/event/hackathon/index', {
        title: 'Hackathon',
        list: hackathon.teams,
        users: users,
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
 * Função responsável por salvar os dados vindos da rota "create"
 */
const store = async (req, res, next) => {
    //res.send("Olá mundo @store vindo do controller <strong>'Lecture'</strong>");
    const { name, member1, member2, member3 } = req.body;
    const event = req.params.id;

    let team = {
        name,
        members: [member1, member2, member3]
    }

    // res.json({lecture: lecture})

    Hackathon.findOneAndUpdate({ event: event }, { '$push' : { 'teams' : team } }).then(doc => {
        res.redirect('./hackathon')
    }).catch(err => {
        res.redirect('./', 400)
    })

};

/**
 * Mostra a página de exibição de um item 
 */
const view = (req, res, next) => {
    res.send("Olá mundo @view vindo do controller <strong>'Lecture'</strong>");
};

/**
 * Mostra a página de edição de um item
 */
const edit = async (req, res, next) => {

    let users = await User.find().select('name')

    Hackathon.findById(req.params.hackathon).then(doc => {
        res.render('events/event/hackathon/edit', {
            title: 'Editar Oficina',
            obj: doc,
            users: users,
            moment: moment, // biblioteca
        })
    });

};

/**
 * Função responsável por salvar as alterações do item vindos da rota "edit" 
 */
const update = (req, res, next) => {
    // ! fazer validação !
    const { name, description, location, date, limit, confirmed, speakers } = req.body;

    let hackathon= {
        name,
        description,
        location,
        limit: Number(limit) || 1,
        date: moment(date, 'DD/MM/YYYY - HH:mm'),
        confirmed: confirmed == 'on' ? true : false,
        speakers
    }

    Hackathon.findByIdAndUpdate(req.params.hackathon, hackathon).then(doc => {
        res.redirect('../../hackathon');
    })
    .catch(err => {
        console.error(err)
        res.json(err)
    })

};

/**
 * Função responsável por deletar o item do banco de dados
 */
const destroy = (req, res, next) => {
    Hackathon.findOneAndUpdate({ event: req.params.id }, { '$pull' : { 'teams' : {'_id' : req.params.team} } }).then(doc => {
        res.redirect(`/events/${req.params.id}/hackathon`)
    }).catch(err => {
        res.redirect('../../hackathon')
    })
};

// exporta as funções
module.exports = { index, store, view, edit, update, destroy };