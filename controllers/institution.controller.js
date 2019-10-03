const Institution = require('../models/institution.model')

/**
 * Mostra a pagina com a listagem dos itens
 */
const index = async (req, res, next) => {
    let institutions = await Institution.find().exec()

    return res.render('institutions/index', {
        title: 'Instituições',
        list: institutions,
        menu: [
            {
                title: 'Adicionar nova',
                url: '/institutions/create',
                // icon: 'account-add'
            }
        ]
    })
}

/**
 * Mostra a pagina de add novo item
 */
const create = (req, res, next) => {
    return res.render('institutions/create', {
        title: 'Adicionar instituição'
    })
}

/**
 * Função responsável por salvar os dados vindos da rota "create"
 */
const store = (req, res, next) => {
    let form = { name } = req.body

    let institution = {
        name
    }

    Institution.create(institution).then(r => {
        return res.redirect('/institutions')
    }).catch(e => {
        next()
    })
}

/**
 * Mostra a página de exibição de um item 
 */
const view = (req, res, next) => {
    return res.send("Olá mundo @view vindo do controller <strong>'Institution'</strong>")
}

/**
 * Mostra a página de edição de um item
 */
const edit = (req, res, next) => {
    Institution.findOne({ _id : req.params.id }).then(doc => {
        return res.render('institutions/edit', {
            title: 'Editar instituição',
            obj : doc
        })
    }).catch(err => {
        console.log(err)
        next()
    })
}

/**
 * Função responsável por salvar as alterações do item vindos da rota "edit" 
 */
const update = (req, res, next) => {
    let form = { name } = req.body

    let institution = {
        name
    }

    Institution.updateOne({ _id : req.params.id }, institution).then(v => {
        return res.redirect('/institutions')
    }).catch(err => {
        console.log(err)
        next()
    })
}

/**
 * Função responsável por deletar o item do banco de dados
 */
const destroy = (req, res, next) => {
    return res.send("Olá mundo @destroy vindo do controller <strong>'Institution'</strong>")
}

// exporta as funções
module.exports = { index, create, store, view, edit, update, destroy }