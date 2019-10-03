const User = require('../../../models/user.model')

const { body, validationResult } = require('express-validator')

/**
 * Validador do login
 */
exports.onLogin = [
[
    body('email').isEmail()
                .withMessage('Email inválido'),
    
    body('password').not().isEmpty()
                    .withMessage('Senha inválida'),
],
async (req, res, next) => {
    let { email, password } = req.body
    let errors = validationResult(req).errors

    let user = await User.findOne({ email }).exec()

    if (user && user.role > 0) {
        user.comparePassword(password, (err, match) => {
            if (err || !match) {
                errors.push({ msg: 'Email/Senha inválido!'})
            }
            
            if (errors.length != 0) {
                return res.status(422)
                .render('auth/login', {
                    message: errors[0].msg,
                    form: {
                        email
                    }
                })
            }

            if (match) {
                return next()
            }
        })
    } else {
        return res.status(422)
                .render('auth/login', {
                    message: 'Email/Senha inválido',
                    form: {
                        email
                    }
                })
    }
}]

/**
 * Validador na troca de seha
 */
exports.onChangePass = [
[
    body('pActual').not().isEmpty()
                   .withMessage('Senha atual em branco'),

    body('pNew').not().isEmpty()
                .withMessage('Nova senha em branco')
                .custom((val, { req }) => {
                    if (val != req.body.pCheck) {
                        return Promise.reject('Senha de confirmação incorreta')
                    }
                    return Promise.resolve()
                }).withMessage('Senha de confirmação inválida'),

    body('pCheck').not().isEmpty()
                  .withMessage('Senha de confirmação em branco'),

],
async (req, res, next) => {
    let { pActual } = req.body
    let errors = validationResult(req).errors

    User.findById(req.session.user).then(user => {
        if (user) {
            user.comparePassword(pActual, (err, match) => {
                if (err || !match) {
                    errors.push({ msg: 'Senha atual incorreta!'})
                }

                if (errors.length != 0) {
                    return res.render('auth/changepass', {
                        message: errors[0].msg
                    })
                }
            })
        }
    })

    if (errors.length == 0)
        next()
}]