const User = require('../models/user.model');
const Event = require('../models/event.model');
const Hackathon = require('../models/hackathon.model');
const moment = require('moment');

/**
 * Mostra a pagina com a listagem dos times
 */
const index = async (req, res, next) => {
    let event = await Event.findOne({ _id: req.params.id })
    .select('hackathon enrolleds')
    .populate([{
        path: 'hackathon',
        populate: {
            path: 'members',
            select: 'name cpf'
        }
    },{
        path: 'enrolleds',
        select: 'user -_id',
        populate: {
            path: 'user',
            select: 'name cpf'
        }
    }])
    .exec().catch(err => {
        console.error(err)
        return;
    });

//     res.json(event)
// return
    let users = event.enrolleds

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
        list: event.hackathon,
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

    let hackathon = {
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

    Hackathon.create(hackathon).then(r => {
        // res.json(r)
        Event.findOneAndUpdate({ _id: event }, { '$push': { 'hackathon': r._id } }).then(ok => {

            res.redirect('./hackathon');
        })
    }).catch(e => {
        res.status(500).json(e);
    });

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
 * Função responsável por enviar a lista de inscritos e o form de inscrever
 */
const enrolleds = async (req, res, next) => {
    let hackathon= await Hackathon.findById(req.params.hackathon)
        .populate({
            path: 'enrolleds.user',
            select: 'name cpf'
        }).exec();

    let users = await User.find({ _id : {'$nin' : hackathonenrolleds } }).select('name cpf').exec();

    // res.json(hackathon
// return
    res.render('events/event/hackathon/enrolleds', {
        title: hackathonname || 'Inscritos na oficina',
        turl: '/events/'+req.params.id+'/hackathon',    
        list: hackathonenrolleds,
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
 * Função responsável por inscrever cidadão na oficina 
 */
const enroll = (req, res, next) => {
    const { user } = req.body;
    const hackathon= req.params.hackathon

    Hackathon.findByIdAndUpdate(hackathon, { '$push' : { 'enrolleds' : { user: user } } }).then(doc => {
        res.json(doc)
    }).catch(err => {
        res.json(err);
        // next();
    })

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
    Event.findByIdAndUpdate(req.params.id, { '$pull' : { 'lectures' : req.params.lecture} }).exec().then(doc => {
        Lecture.findByIdAndDelete(req.params.lecture).then(doc => {
            res.redirect(`/events/${req.params.id}/lectures`)
        })
    })
};

// exporta as funções
module.exports = { index, store, view, edit, update, destroy, enrolleds, enroll };