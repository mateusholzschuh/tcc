const Institution = require('../models/institution.model')

/**
 * Mostra a pagina com a listagem dos itens
 */
exports.index = async (req, res, next) => {
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
exports.create = (req, res, next) => {
    return res.render('institutions/create', {
        title: 'Adicionar instituição'
    })
}

/**
 * Função responsável por salvar os dados vindos da rota "create"
 */
exports.store = (req, res, next) => {
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
exports.view = (req, res, next) => {
    return res.send("Olá mundo @view vindo do controller <strong>'Institution'</strong>")
}

/**
 * Mostra a página de edição de um item
 */
exports.edit = (req, res, next) => {
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
exports.update = (req, res, next) => {
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
exports.destroy = (req, res, next) => {
    return res.send("Olá mundo @destroy vindo do controller <strong>'Institution'</strong>")
}

exports.api = {
    getAll: async (req, res, next) => {
        res.json(await Institution.find({}).select('name').exec())
    },
    
    getById: async (req, res, next) => {
        const { id } = req.params

        if (id)
            return res.json(await Institution.findOne({ _id: id }).select('name').exec())

        res.status(400).json({ errors:['Instituição não encontrada'] })
    }
}