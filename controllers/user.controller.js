const moment = require('moment');
const User = require('../models/user.model');
const Institution = require('../models/institution.model');

/**
 * Mostra a pagina com a listagem dos itens
 */
const index = async (req, res, next) => {
    // res.send("Olá mundo @index vindo do controller <strong>'User'</strong>");
    let users = await User.find().populate('institution', 'name').exec().catch(err => {
        res.redirect('../', 500);
    });

    // if (!users) users = []

    res.render('users/index', {
        title: 'Usuários',
        list: users,
        menu: [
            {
                title: 'Adicionar novo',
                url: '/users/create',
                icon: 'account-add'
            }
        ]
    });
};

/**
 * Mostra a pagina de add novo item
 */
const create = async (req, res, next) => {
    let institutions = await Institution.find().select('name').exec().catch(err => {
        console.error(err)
    });

    if(!institutions) institutions = [];

    res.render('users/create', {
        title: "Criar usuário",
        institutions: institutions
    });
};

/**
 * Função responsável por salvar os dados vindos da rota "create"
 */
const store = async (req, res, next) => {
    //res.send("Olá mundo @store vindo do controller <strong>'User'</strong>");
    // TODO: add validate here

    // let inst = await Institution.findOne({ _id: req.body.institution }).exec().catch(err => {
    //     console.error(err)
    // })

    let user = {
        name: req.body.name,
        cpf: req.body.cpf,
        email: req.body.email,
        password: 'DEFAULT',
        institution: req.body.institution || null,
        bio: req.body.bio,
        birthdate: moment(req.body.birthdate, 'DD/MM/YYYY')
    };

    // res.json(user)

    new User(user).save().then(r => {
        res.redirect('./')
    }).catch(e => {
        res.send(e)
    })
};

/**
 * Mostra a página de exibição de um item 
 */
const view = (req, res, next) => {
    res.send("Olá mundo @view vindo do controller <strong>'User'</strong>");
};

/**
 * Mostra a página de edição de um item
 */
const edit = async (req, res, next) => {

    let institutions = await Institution.find().select('_id name').exec().catch(err => {
        console.error(err)
    });

    if(!institutions) institutions = [];

    User.findOne({ _id : req.params.id }).populate('institution', '_id name').exec().then(doc => {
        
        res.render('users/edit', {
            title: 'Editar Usuário',
            institutions: institutions,
            obj: doc,
            moment: moment
        });
        
    }).catch(err => {
        res.sendStatus(500)
    })
};

/**
 * Função responsável por salvar as alterações do item vindos da rota "edit" 
 */
const update = (req, res, next) => {

    let user = {
        name: req.body.name,
        cpf: req.body.cpf,
        email: req.body.email,
        password: 'DEFAULT',
        institution: req.body.institution || null,        
        bio: req.body.bio,
        birthdate: moment(req.body.birthdate, 'DD/MM/YYYY') || null
    };

    User.findOneAndUpdate({ _id: req.params.id }, user).exec().then(d => {
        res.redirect('/users');
    }).catch(err => {
        res.sendStatus(404)
    })
};

/**
 * Função responsável por deletar o item do banco de dados
 */
const destroy = (req, res, next) => {
    res.send("Olá mundo @destroy vindo do controller <strong>'User'</strong>");
};

// exporta as funções
module.exports = { index, create, store, view, edit, update, destroy };