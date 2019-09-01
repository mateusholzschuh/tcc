const moment = require('moment');
const Event = require('../models/event.model');
const User = require('../models/user.model');

/**
 * Mostra a pagina com a listagem dos itens
 */
const index = async (req, res, next) => {
    let events = await Event.find().select('name location startDate finishDate updatedAt finished').exec().catch(err => {
        res.redirect('../', 500);
    });

    // if (!users) users = []

    res.render('events/index', {
        title: 'Eventos',
        list: events,
        menu: [
            {
                title: 'Adicionar novo',
                url: '/events/create',
                icon: 'plus-circle'
            }
        ],
        moment: moment
    });
};

/**
 * Mostra a pagina de add novo item
 */
const create = (req, res, next) => {
    // res.send("Olá mundo @create vindo do controller <strong>'Event'</strong>");
    res.render('events/create', {
        title: 'Novo evento'
    });
};

/**
 * Função responsável por salvar os dados vindos da rota "create"
 */
const store = (req, res, next) => {
    // TODO: VALIDAÇÃO !!!
    let event = {
        name: req.body.name,
        description: req.body.description,
        location: req.body.location,
        days: Number(req.body.days),
        startDate: moment(req.body.startDate, 'DD/MM/YYYY - HH:mm'),
        finishDate: moment(req.body.finishDate, 'DD/MM/YYYY - HH:mm'),
        finished: req.body.finished == 'on' ? true : false,

    }

    Event.create(event).then(doc => {
        res.redirect('./');
    }).catch(err => {
        res.sendError(500);
    })
};

/**
 * Mostra a página de exibição de um item 
 */
const view = async (req, res, next) => {
    let event = await Event.findOne({ _id: req.params.id }).exec()

    res.render('events/event/index', {
        title: event.name || 'Evento #BLABLA',
        event: event,
        moment: moment,
    })
};

/**
 * Mostra a página de edição de um item
 */
const edit = async (req, res, next) => {
    let event = await Event.findOne({ _id: req.params.id }).exec()

    res.render('events/event/settings', {
        title: 'Configurações',
        event: event,
        moment: moment,
    });
};

/**
 * Função responsável por salvar as alterações do item vindos da rota "edit" 
 */
const update = (req, res, next) => {
    // TODO: validação URGENTE

    let event = {
        name: req.body.name,
        description: req.body.description,
        location: req.body.location,
        days: Number(req.body.days),
        startDate: moment(req.body.startDate, 'DD/MM/YYYY - HH:mm'),
        finishDate: moment(req.body.finishDate, 'DD/MM/YYYY - HH:mm'),
        finished: req.body.finished == 'on' ? true : false,

    }

    
    Event.findByIdAndUpdate(req.params.id, event).then(doc => {
        res.redirect('./');

    })

};

/**
 * Função responsável por deletar o item do banco de dados
 */
const destroy = (req, res, next) => {
    Event.findByIdAndRemove(req.params.id).then(doc => {
        res.redirect('/events')
    })
};

const lectures = (req, res) => {
    res.render('events/event/lectures', {
        title: 'Palestras'
    });
};

const enrolleds = async (req, res) => {
    
};

const subevents = (req, res) => {
    res.render('events/event/subevents', {
        title: 'Subeventos'
    });
};

const presences = (req, res) => {
    res.render('events/event/presences', {
        title: 'Presença'
    });
};


// exporta as funções
module.exports = { index, create, store, view, edit, update, destroy, lectures, enrolleds, subevents, presences };