const Hackathon = require('../../../models/hackathon.model')
const Enrollment = require('../../../models/enrollment.model')

const { body, validationResult } = require('express-validator')

/**
 * Validador ao adicionar novo time ao hackathon
 */
exports.onAddTeam = [
[
    body('name').isString()
                .isLength({ min: 3, max: 50 })
                .withMessage('Nome inválido, deve ter entre 3 e 50 caracteres'),

    body('member1').custom((val, { req }) => {
        let { member1, member2, member3 } = req.body

        if ([member1, member2, member3].length != new Set([member1, member2, member3]).size ) {
            return Promise.reject('Mais de um membro com o mesmo CPF')
        }

        return Hackathon.findOne({ event: req.params.id, teams: { '$elemMatch': { 'members': { '$in': val } } } }).then(doc => {
            if(doc)
                return Promise.reject('Membro 1 já está inscrito em outra equipe')
        })
    }),

    body('member2').custom((val, { req }) => {
        return Hackathon.findOne({ event: req.params.id, teams: { '$elemMatch': { 'members': { '$in': val } } } }).then(doc => {
            if(doc)
                return Promise.reject('Membro 2 já está inscrito em outra equipe')
        })
    }),

    body('member3').custom((val, { req }) => {
        return Hackathon.findOne({ event: req.params.id, teams: { '$elemMatch': { 'members': { '$in': val } } } }).then(doc => {
            if(doc)
                return Promise.reject('Membro 3 já está inscrito em outra equipe')
        })
    })
],
async (req, res, next) => {
    // check if has errors in the validation
    let errors = validationResult(req).errors

    if (errors.length != 0) {
        let form = { name, member1, member2, member3 } = req.body

        let users = await Enrollment.find({ event: req.params.id }).populate('user', 'name cpf').exec()
        users = users.map(e => e.user)

        return res.render('events/event/hackathon/add-team', {
            title: 'Hackathon - Adicionar novo time',
            users,
            form,
            errors: errors.map(e => e.msg),
        })
    }

    next()
}]