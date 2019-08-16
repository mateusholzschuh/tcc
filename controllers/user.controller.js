const User = require('../models/user.model');

/**
 * Mostra a pagina com a listagem dos itens
 */
const index = async (req, res, next) => {
    // res.send("Olá mundo @index vindo do controller <strong>'User'</strong>");
    let users = await User.find().catch(err => {
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
const create = (req, res, next) => {
    // res.send("Olá mundo @create vindo do controller <strong>'User'</strong>");
    res.render('users/create', {
        title: "Criar usuário"
    });
};

/**
 * Função responsável por salvar os dados vindos da rota "create"
 */
const store = (req, res, next) => {
    //res.send("Olá mundo @store vindo do controller <strong>'User'</strong>");
    // TODO: add validate here

    let user = {
        name: req.body.name,
        cpf: req.body.cpf,
        email: req.body.email,
        password: 'DEFAULT'
    };

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
const edit = (req, res, next) => {
    // res.send("Olá mundo @edit vindo do controller <strong>'User'</strong>");
    User.findOne({ _id : req.params.id }).then(doc => {
        
        res.render('users/edit', {
            title: 'Editar Usuário',
            obj: doc
        });
        
    }).catch(err => {
        res.sendStatus(500)
    })
};

/**
 * Função responsável por salvar as alterações do item vindos da rota "edit" 
 */
const update = (req, res, next) => {
    res.send("Olá mundo @update vindo do controller <strong>'User'</strong>");
};

/**
 * Função responsável por deletar o item do banco de dados
 */
const destroy = (req, res, next) => {
    res.send("Olá mundo @destroy vindo do controller <strong>'User'</strong>");
};

// exporta as funções
module.exports = { index, create, store, view, edit, update, destroy };