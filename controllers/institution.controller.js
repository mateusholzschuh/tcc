const Institution = require('../models/institution.model');

/**
 * Mostra a pagina com a listagem dos itens
 */
const index = async (req, res, next) => {
    // res.send("Olá mundo @index vindo do controller <strong>'Institution'</strong>");
    let institutions = await Institution.find().catch(err => {
        res.redirect('../', 500)
    });

    // res.json(institutions)

    res.render('institutions/index', {
        title: 'Instituições',
        list: institutions,
        menu: [
            {
                title: 'Adicionar nova',
                url: '/institutions/create',
                // icon: 'account-add'
            }
        ]
    });
};

/**
 * Mostra a pagina de add novo item
 */
const create = (req, res, next) => {
    // res.send("Olá mundo @create vindo do controller <strong>'Institution'</strong>");
    res.render('institutions/create', {
        title: 'Criar instituição'
    });
};

/**
 * Função responsável por salvar os dados vindos da rota "create"
 */
const store = (req, res, next) => {
    //res.send("Olá mundo @store vindo do controller <strong>'Institution'</strong>");
    let inst = {
        name: req.body.name
    };

    Institution.create(inst).then(r => {
        res.redirect('./');
    }).catch(e => {
        res.status(500).json(e);
    })
};

/**
 * Mostra a página de exibição de um item 
 */
const view = (req, res, next) => {
    res.send("Olá mundo @view vindo do controller <strong>'Institution'</strong>");
};

/**
 * Mostra a página de edição de um item
 */
const edit = (req, res, next) => {
    // res.send("Olá mundo @edit vindo do controller <strong>'Institution'</strong>");
    Institution.findOne({ _id : req.params.id }).then(doc => {
        res.render('institutions/edit', {
            title: 'Editar instituição',
            obj : doc
        })
    }).catch(err => {
        console.log(err)
        res.status(500).json({error: [err]})
    })
};

/**
 * Função responsável por salvar as alterações do item vindos da rota "edit" 
 */
const update = (req, res, next) => {
    // ! fazer validação !
    let inst = {
        name: req.body.name
    };

    Institution.updateOne({ _id : req.body.id }, inst).then(v => {

        Institution.findById(req.params.id).then(doc => {
            
            res.render('institutions/edit', {
                title : 'Editar instituição',
                obj : doc,
                msg : 'Atualizado com sucesso'
            })
        }).catch(err => {
            res.sendStatus(500)
        })

    }).catch(err => {
        console.log(err)
        res.status(500).json({errors : [err]})
    })

    // Institution.create(inst).then(r => {
    //     res.redirect('./');
    // }).catch(e => {
    //     res.status(500).json(e);
    // })
};

/**
 * Função responsável por deletar o item do banco de dados
 */
const destroy = (req, res, next) => {
    res.send("Olá mundo @destroy vindo do controller <strong>'Institution'</strong>");
};

// exporta as funções
module.exports = { index, create, store, view, edit, update, destroy };