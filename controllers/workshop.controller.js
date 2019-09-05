const User = require('../models/user.model');
const Event = require('../models/event.model');
const Workshop = require('../models/workshop.model');
const moment = require('moment');

/**
 * Mostra a pagina com a listagem dos itens
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

    // res.json(event)

    let users = await User.find().select('name')

    //let event = await Event.findOne({ _id: req.params.id }).exec()
    // let event = await Event.find({}).exec().catch(err => console.error(err))
    // let event = await Event.findById(req.params.id).exec().catch(err => console.error(err))
    // res.json(event)

    // let lectures = await Lecture.find().catch(err => {
    //     res.redirect('../', 500)
    // });

    // res.json(lectures)

    res.render('events/event/workshops/index', {
        title: 'Oficinas',
        list: event.workshops,
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
    const { name, description, location, date, limit, confirmed, speakers } = req.body;
    const event = req.params.id;

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

    // res.json({lecture: lecture})

    Workshop.create(workshop).then(r => {
        // res.json(r)
        Event.findOneAndUpdate({ _id: event }, { '$push': { 'workshops': r._id } }).then(ok => {

            res.redirect('./workshops');
        })
    }).catch(e => {
        res.status(500).json(e);
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
    let workshop = await Workshop.findById(req.params.workshop).populate([
        {
            path: 'speakers',
            select: 'name'
        },
        {
            path: 'enrolleds',
            populate: {
                path: 'user',
                select: 'name cpf'
            }
        }
    ]).exec();

    let users = await User.find().select('name cpf').exec();

//     res.json(workshop)
// return
    res.render('events/event/workshops/enrolleds', {
        title: 'Inscritos na oficina',
        list: workshop.enrolleds,
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
 * Função responsável por salvar as alterações do item vindos da rota "edit" 
 */
const update = (req, res, next) => {
    // ! fazer validação !
    const { name, description, location, date, limit, confirmed, speakers } = req.body;

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
        res.json(err)
    })

};

/**
 * Função responsável por deletar o item do banco de dados
 */
const destroy = (req, res, next) => {
    Event.findByIdAndUpdate(req.params.id, { '$pull' : { 'lectures' : req.params.lecture} }).exec().then(doc => {
        Lecture.findByIdAndDelete(req.params.lecture).then(doc => {
            res.redirect(`/events/${req.params.id}/lectures`)
        })
    })
};

// exporta as funções
module.exports = { index, store, view, edit, update, destroy, enrolleds };