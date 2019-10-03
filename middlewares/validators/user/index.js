const User = require('../../../models/user.model')
const Institution = require('../../../models/institution.model')

const { body, validationResult } = require('express-validator')
const moment = require('moment')

/**
 * Validador ao salvar usuário
 */
exports.onSave = [
[
    body('name').isLength({ min:5, max:50 })
                .withMessage('Nome inválido, deve ter entre 5 e 50 caracteres!'),

    body('cpf').isLength({ min:11, max:11 })
               .withMessage('CPF inválido, deve ter 11 digitos numéricos!')
               .custom(cpf => {
                    // verifica se já está cadastrado no sistema
                    return User.findOne({ cpf }).then(user => {
                        if (user) {
                            return Promise.reject('Este CPF já está cadastrado no sistema!')  
                        }
                    })
                }),

    body('email').isEmail()
                 .withMessage('Endereço de email deve ser válido')
                 .normalizeEmail(),

    body('birthdate').isString()
                     .not().isEmpty()
                     .withMessage('Data de nascimento não pode estar em branco!')
],
async (req, res, next) => {
    // check if has errors in the validation
    let errors = validationResult(req).errors

    if (errors.length != 0) {
        let form = { name, cpf, email, institution, instituicao, bio, birthdate } = req.body
        let institutions = await Institution.find().select('name').exec()

        return res.status(422)
                .render('users/create', {
                    title: "Criar Usuário",
                    institutions,
                    form,
                    errors: errors.map(e => e.msg),
                })
    }
}]

/**
 * Validador ao atualizar usuário
 */
exports.onUpdate = [
[
    body('name').isLength({ min:5, max:50 })
                .withMessage('Nome inválido, deve ter entre 5 e 50 caracteres!'),

    body('cpf').isLength({ min:11, max:11 })
                .withMessage('CPF inválido, deve ter 11 digitos numéricos!'),

    body('email').isEmail()
                    .withMessage('Endereço de email deve ser válido')
                    .normalizeEmail(),

    body('birthdate').isString()
                        .not().isEmpty()
                        .withMessage('Data de nascimento não pode estar em branco!')
],
async (req, res, next) => {
    // check if has errors in the validation
    let errors = validationResult(req).errors

    if (errors.length != 0) {
        let institutions = await Institution.find().select('name').exec()
        let obj = await User.findById(req.params.id).exec()

        return res.status(422)
                .render('users/edit', {
                    title: "Editar Usuário",
                    obj,
                    institutions,
                    errors: errors.map(e => e.msg),
                    moment
                })
    }
}]