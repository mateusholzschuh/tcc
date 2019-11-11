const User = require('../models/user.model')

/**
 * Mostra pagina de login
 */
exports.getLogin = (req, res, next) => {
    if (!req.session.user)
        return res.render('auth/login')

    return res.redirect('/')
}

/**
 * Executa login
 */
exports.postLogin = async (req, res, next) => {
    let { email } = req.body

    let user = { _id, name, email, role } = await User.findOne({ email: email }).select('name cpf email role').exec()

    req.session.user = {
        ...user._doc,
        isAdmin: role == 2
    }

    console.log(req.session.user)
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
exports.doLogout = (req, res) => {
    req.user = null
    req.session.destroy(() => {
        return res.redirect('/login')
    })
}

/**
 * Retorna página de alteração de senha
 */
exports.getChangepass = (req, res) => {
    return res.render('auth/changepass', {})
}

/**
 * Faz a alteração da senha
 */
exports.postChangepass = async (req, res) => {
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