const User = require('../models/user.model');
const Event = require('../models/event.model');
const Enrollment = require('../models/enrollment.model')

/**
 * Mostra a pagina com a listagem dos inscritos
 */
const index = async (req, res, next) => {

    let enrolleds = await Enrollment.find({ event: req.params.id }).populate('user', 'name cpf email instituicao').exec()

    res.render('events/event/checkin/list', {
        title: 'Checkin',
        list: enrolleds,
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
 * Função responsável por salvar os dados vindos do checkin
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

    if (count != 0) {
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
 * Mostra a página de edição das presenças
 */
const edit = async (req, res, next) => {

    let users = await User.find().select('name')

    Enrollment.findById(req.params.enroll)
        .populate('user', 'name cpf')
        .populate('event', 'days')
        .then(doc => {
            res.render('events/event/checkin/edit', {
                title: 'Check-in',
                turl: '/events/'.concat(req.params.id, '/checkin'),
                obj: doc
            })
        })
        .catch(err => {
            next()
        })
};

// exporta as funções
module.exports = { index, store, edit };