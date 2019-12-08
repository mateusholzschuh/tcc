const User = require('../../../models/user.model')
const Enrollment = require('../../../models/enrollment.model')

const { body, check, validationResult } = require('express-validator')

/**
 * Validador ao salvar inscrição
 */
exports.onSave = [
[
    body('email').isEmail()
                 .withMessage('Email inválido')
                 .custom((email, { req }) => {
                    // busca usuario pelo email
                    return User.findOne({ email }).then(user => {
                        if (user && user.cpf != req.body.cpf) {
                            return Promise.reject('Este email já está sendo usado por outro inscrito')
                        }
                        return true
                    })
                 })
                 .normalizeEmail(),

    body('name').isString()
                .isLength({ min: 5, max: 70 })
                .withMessage('Nome inválido, deve ter entre 5 e 70 caracteres'),

    body('cpf').isNumeric()
               .isLength({ min: 11, max: 11 })
               .withMessage('CPF inválido, deve ter 11 digitos numéricos')
               .custom((cpf, { req }) => {
                    // verifica se já está inscrito no evento
                    return User.findOne({ cpf }).then(user => {
                        if (user) {
                            return Enrollment.findOne({ user, event: req.params.id }).countDocuments().then(count => {
                                if (count != 0) {
                                    return Promise.reject('CPF já está inscrito no evento')
                                }
                            })
                        }
                    })
                    return true;
                }),

    body('birthdate').not().isEmpty()
                     .withMessage('Data de nascimento não pode estar em branco'),

    body('institution').not().isEmpty()
                       .withMessage('Instituição não pode estar em branco!')
],
async (req, res, next) => {
    // check if has errors in the validation
    let errors = validationResult(req).errors
    
    if (errors.length != 0) {
        return res.status(422)
                .json({ errors: errors.map(e=>e.msg).filter(e=> e!='Invalid value') })
    }

    //  TODO: ~refatorar!!!
    if (!(/[\w\d]+/.test(req.body.institution) &&  req.body.institution.length == 24) ) {
        req.body.instituicao = req.body.institution
        delete req.body.institution
    }

    next()
}]

exports.onCheck = [
[
    body('cpf').isLength({ min: 11, max: 11 })
               .withMessage('CPF inválido')
],
async (req, res, next) => {

    if (validationResult(req).errors.length != 0) {
        return res.status(400)
                    .json({ errors: validationResult(req).errors.map(e => e.msg) })
    }

    next()
}]