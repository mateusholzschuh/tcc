const User = require('../../../models/user.model')
const Lecture = require('../../../models/lecture.model')

const { body, validationResult } = require('express-validator')
const moment = require('moment')

/**
 * Validador ao salvar nova palestra
 */
exports.onSave = [
[
    body('name').isString()
                .isLength({ min: 5, max: 50 })
                .withMessage('Nome inválido, deve ter entre 5 e 50 caracteres'),
    
    body('location').isString()
                    .isLength({ min: 5, max: 50 })
                    .withMessage('Local inválido, deve ter entre 5 e 50 caracteres'),

    body('date').not().isEmpty()
                .withMessage('Data não deve estar em branco'),

    body('speakers').not().isEmpty()
                    .withMessage('Nenhum palestrante foi selecionado')
],
async (req, res, next) => {
    // check if has errors in the validation
    let errors = validationResult(req).errors

    if (errors.length != 0) {
        let form = { name, description, location, date, confirmed, speakers } = req.body
        let users = await User.find().select('name cpf').exec()

        return res.status(422)
                .render('events/event/lectures/add', {
                    title: 'Adicionar Palestra',
                    users: users,
                    form,
                    errors: errors.map(e => e.msg),
                })
    }

    next()
}]

/**
 * Validador ao atualizar uma palestra
 */
exports.onUpdate = [
[
    body('name').isString()
                .isLength({ min: 5, max: 50 })
                .withMessage('Nome inválido, deve ter entre 5 e 50 caracteres'),
    
    body('location').isString()
                    .isLength({ min: 5, max: 50 })
                    .withMessage('Local inválido, deve ter entre 5 e 50 caracteres'),

    body('date').not().isEmpty()
                .withMessage('Data não deve estar em branco'),

    body('speakers').not().isEmpty()
                    .withMessage('Nenhum palestrante foi selecionado')
],
async (req, res, next) => {
    // check if has errors in the validation
    let errors = validationResult(req).errors

    if (errors.length != 0) {
        let users = await User.find().select('name cpf').exec()
        let obj = await Lecture.findById(req.params.lecture).exec()
        
        return res.status(422)
                .render('events/event/lectures/edit', {
                    title: 'Editar Palestra',
                    users: users,
                    obj: obj,
                    errors: errors.map(e => e.msg),
                    moment: moment
                })        
    }

    next()
}]