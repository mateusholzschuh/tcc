const User = require('../models/user.model');
const Event = require('../models/event.model');
const Lecture = require('../models/lecture.model');
const Enrollment = require('../models/enrollment.model');
const moment = require('moment');

/**
 * Mostra a pagina com a listagem dos itens
 */
const index = async (req, res, next) => {
    let event = await Event.findOne({ _id: req.params.id }).populate({
        path: 'enrolleds',
        populate: {
            path: 'user',
            select: 'name cpf email institution',
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

    res.render('events/event/enrolleds', {
        title: 'Inscritos',
        list: event.enrolleds,
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
 * Mostra a pagina de add novo item
 */
const create = (req, res, next) => {
    // res.send("Olá mundo @create vindo do controller <strong>'Lecture'</strong>");
    res.render('lectures/create', {
        title: 'Criar instituição'
    });
};

/**
 * Função responsável por salvar os dados vindos da rota "create"
 */
const store = async (req, res, next) => {
    //res.send("Olá mundo @store vindo do controller <strong>'Lecture'</strong>");
    const { user } = req.body;
    let event = req.params.id;


    let enrollment = {
        user,
        event
    }

    // res.json({lecture: lecture})
    let count = await Enrollment.find({ user: user }).count().exec()

    if(count != 0) {
        return res.redirect('./enrolleds')
    }

    Enrollment.create(enrollment).then(r => {
        // res.json(r)
        Event.findOneAndUpdate({ _id: req.params.id }, { '$push': { 'enrolleds': r._id } }).then(ok => {

            res.redirect('./enrolleds');
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

    Lecture.findById(req.params.lecture).then(doc => {
        res.render('events/event/lectures-edit', {
            title: 'Editar instituição',
            obj: doc,
            users: users,
            moment: moment, // biblioteca
        })
    });
    // Lecture.findOne({ _id : '5d6837b0caaeb62584a83843' }).then(doc => {
    //     Response.json(doc)
    //     res.render('events/event/lectures.edit', {
    //         title: 'Editar instituição',
    //         obj : doc
    //     })
    // }).catch(err => {
    //     console.log(err)
    //     res.status(500).json({error: [err]})
    // })
};

/**
 * Função responsável por salvar as alterações do item vindos da rota "edit" 
 */
const update = (req, res, next) => {
    // ! fazer validação !
    const { name, description, location, date, confirmed, speakers } = req.body;


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
        res.json(err)
    })

    // Lecture.create(inst).then(r => {
    //     res.redirect('./');
    // }).catch(e => {
    //     res.status(500).json(e);
    // })
};

/**
 * Função responsável por deletar o item do banco de dados
 */
const destroy = (req, res, next) => {
    Event.findByIdAndUpdate(req.params.id, { '$pull' : { 'lectures' : req.params.lecture} }).exec().then(doc => {
        Lecture.findByIdAndDelete(req.params.lecture).then(doc => {
            res.redirect('..')
        })
    })
};

// exporta as funções
module.exports = { index, create, store, view, edit, update, destroy };