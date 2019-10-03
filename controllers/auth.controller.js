const User = require('../models/user.model')

/**
 * Mostra pagina de login
 */
const getLogin = (req, res, next) => {
    if (!req.session.user)
        return res.render('auth/login')

    return res.redirect('/')
}

/**
 * Executa login
 */
const postLogin = async (req, res, next) => {
    let { email } = req.body

    let user = await User.findOne({ email: email }).select('name cpf role').exec()

    req.session.user = user._id
    req.session.save(err => {
        if (err) {
            next(err)
        }
        return res.redirect('/')
    })
}

/**
 * Executa o logout
 */
const doLogout = (req, res) => {
    req.user = null
    req.session.destroy(() => {
        return res.redirect('/login')
    })
}

/**
 * Retorna página de alteração de senha
 */
const getChangepass = (req, res) => {
    return res.render('auth/changepass', {})
}

/**
 * Faz a alteração da senha
 */
const postChangepass = async (req, res) => {
    const { pNew } = req.body

    let user = await User.findById(req.session.user).select('password').exec()

    if (user) {        
        user.password = pNew

        user.save().then(ok => {
            return res.redirect('/events/')
        }).catch(err => {
            return res.render('auth/changepass', {
                message: 'Ocorreu um erro ao alterar sua senha'
            })
        })   

    } else {
        return res.render('auth/changepass', {
            message: 'Ocorreu um erro ao alterar sua senha'
        })
    }
}

module.exports = { getLogin, postLogin, doLogout, getChangepass, postChangepass }