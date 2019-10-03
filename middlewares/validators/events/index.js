const Event = require('../../../models/event.model')

const { body, validationResult } = require('express-validator')
const moment = require('moment')

/**
 * Validador ao salvar novo evento
 */
exports.onSave = [
[
    body('name').isString()
                .isLength({ min: 5, max: 50 })
                .withMessage('Nome inválido, deve ter entre 5 e 50 caracteres'),

    body('location').isString()
                    .isLength({ min: 5, max: 50 })
                    .withMessage('Local inválido, deve ter entre 5 e 50 caracteres'),
    
    body('startDate').not().isEmpty()
                     .withMessage('Data inicial não pode estar em branco'),
                     
    body('finishDate').not().isEmpty()
                      .withMessage('Data final não pode estar em branco'),

],
async (req, res, next) => {
    let errors = validationResult(req).errors

    if (errors.length != 0) {
        let form = { name, location, startDate, finishDate } = req.body

        return res.render('events/create', {
            title: 'Novo evento',
            form,
            errors: errors.map(e => e.msg)
        })
    }

    next()
}]

/**
 * Validador ao atualizar evento
 */
exports.onUpdate = [
[
    body('name').isString()
                .isLength({ min: 5, max: 50 })
                .withMessage('Nome inválido, deve ter entre 5 e 50 caracteres'),

    body('location').isString()
                    .isLength({ min: 5, max: 50 })
                    .withMessage('Local inválido, deve ter entre 5 e 50 caracteres'),
    
    body('startDate').not().isEmpty()
                     .withMessage('Data inicial não pode estar em branco'),
                        
    body('finishDate').not().isEmpty()
                      .withMessage('Data final não pode estar em branco'),

    body('days').not().isEmpty()
                .withMessage('Total de dias não pode estar em branco')

],
async (req, res, next) => {
    let errors = validationResult(req).errors

    if (errors.length != 0) {
        let event = await Event.findOne({ _id: req.params.id }).exec()

        return res.render('events/event/settings', {
            title: 'Configurações',
            event,
            moment,
            errors: errors.map(e => e.msg),
            eventMenu: 'settings'
        })
    }

    next()
}]