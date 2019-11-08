const UserEvent = require('../../../models/user-event.model')
const Enrollment = require('../../../models/enrollment.model')

const { body, validationResult } = require('express-validator')
const moment = require('moment')

/**
 * Validador na criação de um organizador
 */
exports.onSave = [
[
    body('role').matches(/(coordinator|accreditation|organization)/i)
                .withMessage('Cargo inválido!'),
],
async (req, res, next) => {
    // check if has errors in the validation
    let errors = validationResult(req).errors

    if (errors.length != 0) {
        let users = await Enrollment.find({ event: req.params.id }).populate('user').exec()
        let form = { user, role } = req.body

        return res.status(422)
                .render('events/event/organizers/add', {
                    title: 'Adicionar Organizador',
                    users,
                    form,
                    errors: errors.map(e => e.msg)
                })
    }

    next()
}]

/**
 * Validador na atualização de um organizador
 */
exports.onUpdate = [
[
    body('role').matches(/(coordinator|accreditation|organization)/i)
                .withMessage('Cargo inválido!'),
],
async (req, res, next) => {
    // check if has errors in the validation
    let errors = validationResult(req).errors

    if (errors.length != 0) {
        let obj = await UserEvent.findOne({ _id: req.params.ue }).populate('user').exec()

        return res.status(422)
                .render('events/event/organizers/edit', {
                    title: 'Editar Organizador',
                    obj,
                    errors: errors.map(e => e.msg)
                })
    }

    next()
}]