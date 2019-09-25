const User = require('../models/user.model')
const bcrypt = require('bcrypt');

/**
 * Mostra pagina de login
 */
const login = (req, res, next) => {
    if (!req.session.user)
        return res.render('auth/login')

    res.redirect('/')
};

/**
 * Executa login
 */
const doLogin = async (req, res, next) => {
    const { email, password } = req.body;

    // res.json({email, password})s

    let user = await User.findOne({ email: email }).select('name cpf password role').exec();

    if (user && password && user.role > 0) {
        user.comparePassword(password, (err, match) => {
            if (err) {
                return res.json(err)
            }
            if (match) {
                user = user._id
                req.session.user = user;
                req.session.save(err => {
                    if (err) {
                        next(err);
                    }
                    return res.redirect('/');
                });
            } else {

                res.render('auth/login', {
                    message: 'Usuário/Senha inválido!',
                    form: {
                        email
                    }
                })
            }
        })

    } else {

        res.render('auth/login', {
            message: 'Usuário/Senha inválido!',
            form: {
                email
            }
        })
    }

    

};

/**
 * Executa o logout
 */
const doLogout = (req, res) => {
    req.user = null;
    req.session.destroy(() => {
        res.redirect('/login');
    });
};

/**
 * Retorna página de alteração de senha
 */
const getChangepass = (req, res) => {
    return res.render('auth/changepass', {});
};

/**
 * Faz a alteração da senha
 */
const postChangepass = async (req, res) => {
    const { pActual, pNew, pCheck } = req.body;

    if (!(pActual && pNew && pCheck)) {
        return res.render('auth/changepass', {
            message: 'Dados inválidos'
        })
    }

    if (pNew != pCheck) {
        return res.render('auth/changepass', {
            message: 'Senha de confirmação incorreta!'
        })
    }

    let user = await User.findById(req.session.user).select('password').exec();
console.log(user)
    if (user) {
        user.comparePassword(pActual, (err, match) => {
            if (err) {
                return res.render('auth/changepass', {
                    message: 'Ocorreu um erro!'
                })
            }
            if (match) {
                
                user.password = pNew;

                user.save().then(ok => {
                    return res.redirect('/events/');
                }).catch(err => {
                    return res.render('auth/changepass', {
                        message: 'Ocorreu um erro ao alterar sua senha'
                    })
                })

            } else {

                return res.render('auth/changepass', {
                    message: 'Senha atual errado!'
                })
            }
        })
    } else {

        return res.render('auth/changepass', {
            message: 'Ocorreu um erro ao alterar sua senha'
        })
    }

};

module.exports = { login, doLogin, doLogout, getChangepass, postChangepass }