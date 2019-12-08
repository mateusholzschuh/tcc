const Institution = require('../../../models/institution.model')

const { body, validationResult } = require('express-validator')

/**
 * Validador ao salvar uma nova instituição
 */
exports.onSave = [
[
    body('name').isString()
                .isLength({ min:5, max: 70 })
                .withMessage('Nome inválido, deve ter entre 5 e 70 caracteres')
],
async (req, res, next) => {
    // check if has errors in the validation
    let errors = validationResult(req).errors

    if (errors.length != 0) {
        let form = { name } = req.body

        return res.status(422)
                .render('institutions/create', {
                    title: 'Adicionar Instituição',
                    form,
                    errors: errors.map(e => e.msg),
                }) 
    }

    next()
}]

/**
 * Validador ao atualizar uma instituição
 */
exports.onUpdate = [
[
    body('name').isString()
                .isLength({ min:5, max: 70 })
                .withMessage('Nome inválido, deve ter entre 5 e 70 caracteres')
],
async (req, res, next) => {
    // check if has errors in the validation
    let errors = validationResult(req).errors

    if (errors.length != 0) {
        let obj = await Institution.findById(req.params.id).exec()

        return res.status(422)
                .render('institutions/edit', {
                    title: 'Editar Instituição',
                    obj,
                    errors: errors.map(e => e.msg),
                }) 
    }

    next()
}]