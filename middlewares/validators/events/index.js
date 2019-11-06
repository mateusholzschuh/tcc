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
                      
    body('periods[]').custom((inp, { req }) => {
        let b = req.body
        if (!(b['periods[morning]']   == 'on' ||
              b['periods[afternoon]'] == 'on' ||
              b['periods[night]']     == 'on' )) {
                return Promise.reject('Ao menos um período deve ser selecionado')
        }
        return true
    })

],
async (req, res, next) => {
    let errors = validationResult(req).errors

    if (errors.length != 0) {
        let form = { name, location, startDate, finishDate } = req.body

        let periods = {
            morning : form['periods[morning]'] == 'on' ? true : false,
            afternoon : form['periods[afternoon]'] == 'on' ? true : false,
            night : form['periods[night]'] == 'on' ? true : false,
        }

        form.periods = periods

        // return res.json(form)
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
                .withMessage('Total de dias não pode estar em branco'),

    body('hours').not().isEmpty()
                 .withMessage('Total de horas não pode estar em branco')
                 .isNumeric()
                 .withMessage('Horas inválidas')

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