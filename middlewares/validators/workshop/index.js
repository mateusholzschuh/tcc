const Workshop = require('../../../models/workshop.model')
const User = require('../../../models/user.model')

const { body, validationResult } = require('express-validator')
const moment = require('moment')

/**
 * Validador na criação de uma oficina
 */
exports.onSave = [
[
    body('name').isString()
                .isLength({ min: 5, max: 150 })
                .withMessage('Nome inválido, deve ter entre 5 e 150 caracteres'),

    body('location').isString()
                    .isLength({ min: 5, max: 50 })
                    .withMessage('Local inválido, deve ter entre 5 e 50 caracteres'),

    body('date').not().isEmpty()
                .withMessage('Data não pode estar em branco'),

    body('speakers').not().isEmpty()
                    .withMessage('Nenhum palestrante foi selecionado')
],
async (req, res, next) => {
    // check if has errors in the validation
    let errors = validationResult(req).errors

    if (errors.length != 0) {
        let form = { name, description, location, date, limit, confirmed, speakers } = req.body
        let users = await User.find().select('name cpf').exec()

        return res.status(422)
                .render('events/event/workshops/add', {
                    title: 'Adicionar Oficina',
                    users: users,
                    form,
                    errors: errors.map(e => e.msg)
                })
    }

    next()
}]

/**
 * Validador na atualização de uma oficina
 */
exports.onUpdate = [
[
    body('name').isString()
                .isLength({ min: 5, max: 150 })
                .withMessage('Nome inválido, deve ter entre 5 e 150 caracteres'),
    
    body('location').isString()
                    .isLength({ min: 5, max: 50 })
                    .withMessage('Local inválido, deve ter entre 5 e 50 caracteres'),

    body('date').not().isEmpty()
                .withMessage('Data não pode estar em branco'),

    body('speakers').not().isEmpty()
                    .withMessage('Nenhum palestrante selecionado')

],
async (req, res, next) => {
    // check if has errors in the validation
    let errors = validationResult(req).errors

    if (errors.length != 0) {
        let form = { name, description, location, date, limit, confirmed, speakers } = req.body
        let users = await User.find().select('name cpf').exec()
        let obj = await Workshop.findById(req.params.workshop).exec()

        return res.status(422)
                .render('events/event/workshops/edit', {
                    title: 'Editar Oficina',
                    users: users,
                    obj: obj,
                    form,
                    errors: errors.map(e => e.msg),
                    moment: moment
                })
    }

    next()
}]