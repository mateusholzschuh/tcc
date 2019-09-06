const express = require('express');
const router = express.Router();

const { body, param, check, validationResult } = require('express-validator');

const User = require('../models/user.model');
const Institution = require('../models/institution.model');
const Event = require('../models/event.model');
const Lecture = require('../models/lecture.model');
const Workshop = require('../models/workshop.model');
const Enrollment = require('../models/enrollment.model');
const Hackathon = require('../models/hackathon.model');

const EVENT_ID = process.env.SACI || '5d657a73da903939d4cc7629';
// const EVENT_ID = process.env.SACI || '5d725ba3f385b226f28b6c13';
const HACKATHON = process.env.HACKATHON || '5d6af3b4e215f7149c10a15c';

/**
 * Rota para inscrição no evento
 * 
 * Espera-se um objeto no formato:
 * {
 *   name,
 *   email,
 *   cpf,
 *   birthdate
 * }
 * 
 */
router.post('/enroll', [
    body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
    body('name').isString().isLength({ min: 5, max: 30 }).withMessage('Nome inválido'),
    body('cpf').isNumeric().isLength({ min: 11, max: 11 }).withMessage('CPF inválido'),
    body('birthdate').not().isEmpty().withMessage('Data de nascimento em branco'),
    body('institution').not().isEmpty().withMessage('Instituição em branco!')
], async (req, res, next) => {

    // validação dos campos
    if (validationResult(req).errors.length != 0) {
        res.json({
            error: true,
            errors: validationResult(req).errors.map(e => e.msg)
        })
        return
    }

    let user = {
        name:  req.body.name,
        email: req.body.email,
        cpf:   req.body.cpf,
        birthdate: new Date(Number(req.body.birthdate)),
        instituicao: req.body.institution
    }

    // verifica se o usuário já existe no sistema
    let u = await User.findOne({ cpf: user.cpf }).exec();

    // existe, atualiza os dados
    if(u != null) {
        u.updateOne(user).then(doc => {
            req.user = u._id
            next()
        })
    }
    // não existe, então cria usuário
    else {
        User.create(user).then(doc => {
            //res.json({...doc, status: 201})
            req.user = doc._id
            next()
        })
    }

}, async (req, res, next) => {
    let user = req.user
    
    // verifica se já está inscrito
    let count = await Enrollment.find({ event: EVENT_ID, user: user }).count().exec()
    
    if (count != 0) {
        res.json({
            error: true,
            errors: ['Usuário já inscrito'],
            status: 302
        })
        return;
    }
    
    // faz a inscrição
    let enroll = {
        user : user._id,
        event: EVENT_ID
    }

    Enrollment.create(enroll).then(doc => {
        Event.findByIdAndUpdate(EVENT_ID, { '$push': { 'enrolleds' : doc._id } }).then(e => {
            res.json({
                success: true, 
                message:'Inscrito com sucesso' , 
                status: 201
            })
        })
    }).catch(err => {
        res.json({...err, status: 500})
    })
});

/**
 * Rota para verificar inscrição
 */
router.post('/check', [
    body('cpf').isLength({min:11, max:11}).withMessage('CPF inválido')
], async (req, res) => {

    // validação dos campos
    if (validationResult(req).errors.length != 0) {
        res.json({
            error: true,
            errors: validationResult(req).errors.map(e => e.msg)
        })
        return
    }

    user = await User.findOne({ cpf: req.body.cpf }).select('_id').exec()

    if (!user) {
        res.json({
            error: true,
            errors: [
                'CPF não inscrito no evento'
            ]
        })
        return
    }

    result = await Enrollment.findOne({ event: EVENT_ID, user: user }).countDocuments().exec();

    // usuário existe, mas não esta inscrito
    if (!result) {
        res.json({
            error: true,
            errors: [
                'CPF não inscrito no evento'
            ]
        })
        return
    }

    // OK
    res.json({
        success: true,
        message: 'CPF está inscrito no evento'
    })
});

/**
 * Rota para listar inscritos no evento
 */
router.get('/enrolleds', async (req, res) => {
    let enrolleds = await Event.findById(EVENT_ID).select('enrolleds').populate({
        path:'enrolleds', 
        select: 'user', 
        populate: { 
            path: 'user', 
            select:'name cpf instituicao'
        } 
    }).exec()

    enrolleds = enrolleds.enrolleds.map(e => {
        return {
            enroll_id : e._id,
            name : e.user.name,
            cpf : e.user.cpf,
            institution: e.user.instituicao || 'Outra'
        }
    })
    
    res.json(enrolleds)
});

/**
 * Rota para listar as palestras
 */
router.get('/lectures', async (req, res) => {
    let lectures = await Event.findById(EVENT_ID).select('lectures').populate({
        path: 'lectures',
        select: '-__v -createdAt -updatedAt -_id',
        populate: {
            path: 'speakers',
            select: 'name bio -_id'
        }
    })

    res.json(lectures)
});

/**********************
 *  HACKATHON ROUTES
 **********************/

 /**
  * Listar times
  */
router.get('/hackathon', async (req, res) => {
    // await Hackathon.findByIdAndUpdate(HACKATHON, { '$pull' : { 'teams' : {} } }).exec().then(e => console.log(e)).catch(err => console.error(err))
    hn = await Hackathon.find({ _id: HACKATHON }).select('-_id name teams').populate({
        path: 'teams.members',
        select: '-_id name cpf'
    }).exec()

    res.status(200).json({success:true, data: hn[0]})
});

/**
 * Rota para inscrever time no hackathon
 * 
 * objeto esperado:
 * {
 *   name,
 *   members: [cpf, cpf, cpf]
 * }
 */
router.post('/hackathon', [
    body('name').not().isEmpty().withMessage('Campo nome é obrigatório').isLength({ min: 3, max: 30 }).withMessage('Campo nome deve ter entre 3 e 30 caracteres'),
    body('members').isArray().withMessage('Campo participantes inválido')
], async (req, res) => {

    // validação dos campos
    if (validationResult(req).errors.length != 0) {
        res.json({
            error: true,
            errors: validationResult(req).errors.map(e => e.msg)
        })
        return
    }

    let dados = {
        name: req.body.name,
        members: req.body.members
    }

    users = await User.find({ cpf: dados.members }).select('name cpf').exec()

    if (dados.members.length !== 3 || users.length !== 3) {
        res.json({
            error: true,
            errors: ['Número inválido de participantes']
        })
        return
    }
    
    // verifica se os cpfs já estão inscritos no evento
    enr = await Enrollment.find({"user" : users }).select('-_id user').populate('user', '-_id name cpf').exec()
    found = enr.map(e => e.user.cpf)

    diff = dados.members.filter(i => {
        return !found.includes(i)
    })

    if (diff.length !== 0) {
        res.json({
            error: true,
            errors: ['Oops! CPF: ' + diff.join(', ') + ' não estão inscritos no evento'],
            extra: diff
        })
        return
    }

    // - todos membros estão inscritos no evento

    // verifica se algum já faz parte de alguma equipe no hackathon
    hn = await Hackathon.findOne({ _id: HACKATHON, teams : { '$elemMatch' : { 'members' : {'$in' : users } } } }).select('teams').exec()

    if (hn) {
        res.json({
            error: true,
            errors: ['Há participantes que já estão inscritos em outra equipe neste hackathon'],
            // message: 'Há participantes que já estão inscritos na equipe "' + hn.teams[0].name + '" neste hackathon',
            // extra: users.filter(e => hn.teams[0].members.includes(e._id)).map(u => u.name)
        })
        return
    }

    let team = {
        name: dados.name,
        members: users
    }

    let doc = await Hackathon.findByIdAndUpdate(HACKATHON, { '$push': { 'teams' : team } }).exec()

    res.json({
        success: true, 
        message: 'Time inscrito no hackathon', 
        data: {...team, id: doc._id}
    })


    //teste
    res.json(dados)

});

/**
 * WORKSHOP ROUTES
 */

// lista oficinas
router.get('/workshops', async (req, res) => {
    let workshops = await Workshop.find({ event: EVENT_ID }).exec();

    res.json({workshops})
})

router.get('/workshops/:id', [
    param('id', 'Identificador inválido!').isMongoId(),
], async (req, res) => {
    let errors = validationResult(req).errors

    if (errors.length != 0) {
        return res.json({
            error: true,
            errors: errors.map(e=>e.msg)
        })
    }
    
    let workshop = await Workshop.findById(req.params.id).exec();

    if (!workshop) {
        return res.json({
            error: true,
            errors: ['Oficina não encontrada!']
        })
    }

    res.json(workshop)
})
// router.get('/h', (req, res) => {
//     let hackathon = {
//         name: 'Hackathon',
//         event: EVENT_ID
//     }
    
//     Hackathon.create(hackathon).then(doc => {
//         res.json(doc)
//     })
// });

router.get('/institutions', (req, res) => {
    Institution.find().select('name').then(doc => {
        res.json({
            institution : doc.map(e => {
                return {
                    id: e._id,
                    name: e.name
                }
            })
        });
    }).catch(err => {
        res.status(500).json(err);
    })
});

router.get('/limpaEnroll', (req, res) => {
    if(req.query.token == 'aw0oerakw3')
        Event.findByIdAndUpdate(EVENT_ID, { enrolleds: [] }).then(doc => {
            Enrollment.remove({ event: EVENT_ID }).exec()
            res.json(doc)
        })
    res.json({})
})

router.get('/reseta', async (req, res) => {
    if(req.query.token == 'aw0oerakw3')
        await Hackathon.findByIdAndUpdate(HACKATHON, { teams: [] }).exec()
    res.json({})
})

// exporta o router
module.exports = router;