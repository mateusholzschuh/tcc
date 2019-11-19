const User = require('../models/user.model')
const Institution = require('../models/institution.model')

const moment = require('moment')

/**
 * Mostra a pagina com a listagem dos itens
 */
exports.index = async (req, res, next) => {
    let users = await User.find().populate('institution', 'name').exec()

    return res.render('users/index', {
        title: 'Usuários',
        list: users,
        message: req.flash('message'),
        moment: moment,
        menu: [
            {
                title: 'Adicionar novo',
                url: '/users/create',
                icon: 'account-add'
            }
        ]
    })
}

/**
 * Mostra a pagina para add novo usuário
 */
exports.create = async (req, res, next) => {    
    let institutions = await Institution.find().select('name').exec()

    if(!institutions) institutions = []

    return res.render('users/create', {
        title: "Criar usuário",
        institutions: institutions
    })
}

/**
 * Função responsável por salvar os dados vindos da rota "create"
 */
exports.store = async (req, res, next) => {
    let form = { name, cpf, email, institution, instituicao, bio, birthdate } = req.body

    let user = {
        name,
        cpf, 
        email,
        institution: institution ? institution : null,
        instituicao,
        password: 'default',
        bio,
        birthdate: moment(birthdate, 'DD/MM/YYYY')
    }

    new User(user).save().then(r => {
        req.flash('message', 'Usuário cadastrado com sucesso')
        return res.redirect('./')
    }).catch(e => {
        next()
    })
}

/**
 * Mostra a página de exibição de um item 
 */
exports.view = (req, res, next) => {
    return res.send("Olá mundo @view vindo do controller <strong>'User'</strong>")
}

/**
 * Mostra a página de edição de um item
 */
exports.edit = async (req, res, next) => {
    let institutions = await Institution.find().select('_id name').exec()

    if(!institutions) institutions = []

    User.findOne({ _id : req.params.id }).populate('institution', '_id name').exec().then(doc => {        
        return res.render('users/edit', {
            title: 'Editar Usuário',
            institutions: institutions,
            obj: doc,
            moment: moment
        })        
    }).catch(err => {
        next()
    })
}

/**
 * Função responsável por salvar as alterações do item vindos da rota "edit" 
 */
exports.update = (req, res, next) => {
    let form = { name, cpf, email, institution, instituicao, bio, birthdate } = req.body

    let user = {
        ...form,
        birthdate: moment(birthdate, 'DD/MM/YYYY')
    }

    User.findOneAndUpdate({ _id: req.params.id }, user).exec().then(d => {
        req.flash('message', 'Usuário atualizado com sucesso!')
        return res.redirect('/users')
    }).catch(err => {
        next()
    })
}

/**
 * Função responsável por deletar o item do banco de dados
 */
exports.destroy = (req, res, next) => {
    return res.send("Olá mundo @destroy vindo do controller <strong>'User'</strong>")
}

exports.api = {
    
    getAll: async (req, res) => {
        let users = await User.find().select('name email cpf')
        return res.json(users)
    },

    getById: async (req, res) => {
        let id = req.params.id
        let user = await User.findOne({ _id: id }).select('-password -__v')
        return res.json(user)
    }
}
