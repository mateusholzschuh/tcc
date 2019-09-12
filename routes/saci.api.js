const express = require('express');
const router = express.Router();
const config = require('../config');

const ejs = require('ejs');
const nodemailer = require('nodemailer');

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

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.MAIL_ADDR,
        pass: config.MAIL_PASS
    }
});

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
        return res.json({
            errors: validationResult(req).errors.map(e => e.msg)
        }, 400)
    }

    let user = {
        name: req.body.name,
        email: req.body.email,
        cpf: req.body.cpf,
        birthdate: new Date(Number(req.body.birthdate)),
        instituicao: req.body.institution
    }


    // verifica se o usuário já existe no sistema
    let u = await User.findOne({ cpf: user.cpf }).exec();

    // existe no sistema
    if (u != null) {

        // verifica se já está inscrito
        let count = await Enrollment.find({ event: EVENT_ID, user: u._id }).count().exec()

        if (count != 0) {
            return res.json({
                errors: ['Usuário já inscrito']
            }, 500)
        }

        // atualiza os dados
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

    // faz a inscrição
    let enroll = {
        user: user,
        event: EVENT_ID
    }

    const enrolled = await User.findById(enroll.user).select('name cpf email').exec()

    Enrollment.create(enroll).then(doc => {
        Event.findByIdAndUpdate(EVENT_ID, { '$push': { 'enrolleds': doc._id } }).then(e => {
            // envia email de confirmação
            if (config.MAIL_ADDR) {
                // load template
                ejs.renderFile(__dirname + "/enroll.ejs", {
                    name: enrolled.name,
                    cpf: enrolled.cpf
                }, (err, data) => {
                    if (err) throw err;

                    const mailOptions = {
                        from: `SACI IFSUL <${process.env.SACI_MAIL_ADDR}>`, // sender address
                        to: enrolled.email, // list of receivers
                        subject: 'Inscrição SACI 2019', // Subject line
                        html: data, // plain text body
                    };

                    transporter.sendMail(mailOptions, function (err, info) {
                        if (err)
                            console.log(err)
                        else
                            console.log(info);
                    });
                })
            }

            // resposta
            return res.json({
                message: 'Inscrito com sucesso',
                data: {
                    name: enrolled.name,
                    email: enrolled.email,
                    cpf: enrolled.cpf,
                    code: doc.code,
                    qrcode: `http://api.qrserver.com/v1/create-qr-code/?color=000000&bgcolor=FFFFFF&data=${enrolled.cpf}&qzone=1&margin=0&size=200x200&ecc=L`
                }
            }, 201)
        })
    }).catch(err => {
        return res.json({
            errors: ["Ocorreu um problema na sua inscrição!"]
        }, 500)
    })
});

/**
 * Rota para verificar inscrição
 */
router.post('/check', [
    body('cpf').isLength({ min: 11, max: 11 }).withMessage('CPF inválido')
], async (req, res) => {

    // validação dos campos
    if (validationResult(req).errors.length != 0) {
        return res.json({
            errors: validationResult(req).errors.map(e => e.msg)
        }, 400)
    }

    user = await User.findOne({ cpf: req.body.cpf }).select('_id name email cpf').exec()

    if (!user) {
        return res.json({
            errors: [
                'CPF não inscrito no evento'
            ]
        }, 404)
    }

    result = await Enrollment.findOne({ event: EVENT_ID, user: user }).select('code').exec();

    // usuário existe, mas não esta inscrito
    if (!result) {
        return res.json({
            errors: [
                'CPF não inscrito no evento'
            ]
        }, 404)
    }

    // OK
    res.json({
        message: 'CPF está inscrito no evento',
        data: {
            name: user.name,
            email: user.email,
            cpf: user.cpf,
            code: result.code,
            qrcode: `http://api.qrserver.com/v1/create-qr-code/?color=000000&bgcolor=FFFFFF&data=${user.cpf}&qzone=1&margin=0&size=200x200&ecc=L`
        }
    }, 200)
});

/**
 * Rota para listar inscritos no evento
 */
router.get('/enrolleds', async (req, res) => {
    let enrolleds = await Enrollment.find({ event: EVENT_ID }).select('user code').populate({
        path: 'user',
        select: 'name cpf instituicao'
    }).exec()

    enrolleds = enrolleds.map(e => {
        return {
            // enroll_id : e._id,
            code: e.code,
            name: e.user.name,
            cpf: e.user.cpf,
            institution: e.user.instituicao || 'Outra'
        }
    })

    return res.json(enrolleds, 200)
});

/**
 * Rota para listar as palestras
 */
router.get('/lectures', async (req, res) => {
    let lectures = await Lecture.find({ event: EVENT_ID }).select('-__v -createdAt -updatedAt -_id -event').populate({
        path: 'speakers',
        select: 'name bio -_id'
    })

    res.json(lectures, 200)
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

    res.status(200).json({ success: true, data: hn[0] })
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
        return res.json({
            errors: validationResult(req).errors.map(e => e.msg)
        }, 400)
        
    }

    let dados = {
        name: req.body.name,
        members: req.body.members
    }

    if (dados.members.length !== 3) {
        return res.json({
            errors: ['Número inválido de participantes']
        }, 400)        
    }

    if (dados.members.length != new Set(dados.members).size) {
        return res.json({
            errors: ['Mais de um membro utilizando o mesmo CPF']
        }, 400)   
    }
    
    users = await User.find({ cpf: dados.members }).select('name email cpf').exec()

    // verifica se os cpfs já estão inscritos no evento
    enr = await Enrollment.find({ "user": users }).select('-_id user').populate('user', '-_id name cpf').exec()
    found = enr.map(e => e.user.cpf)

    diff = dados.members.filter(i => {
        return !found.includes(i)
    })

    if (diff.length !== 0) {
        return res.json({
            errors: ['Oops! CPF: ' + diff.map(e=>formataCPF(e)).join(', ') + ' não estão inscritos no evento'],
            extra: diff
        }, 400)
    }

    // - todos membros estão inscritos no evento

    // verifica se algum já faz parte de alguma equipe no hackathon
    hn = await Hackathon.findOne({ _id: HACKATHON, teams: { '$elemMatch': { 'members': { '$in': users } } } }).select('teams').exec()

    if (hn) {
        return res.json({
            errors: ['Há participantes que já estão inscritos em outra equipe neste hackathon'],
            // message: 'Há participantes que já estão inscritos na equipe "' + hn.teams[0].name + '" neste hackathon',
            // extra: users.filter(e => hn.teams[0].members.includes(e._id)).map(u => u.name)
        }, 400)
    }

    let team = {
        name: dados.name,
        members: users
    }

    let doc = await Hackathon.findByIdAndUpdate(HACKATHON, { '$push': { 'teams': team } }).exec()

    // busca integrante #1
    let member = await User.findOne({ cpf: dados.members[0] }).select('email').exec();

    // envia email de confirmação
    if (config.MAIL_ADDR) {
        // load template
        ejs.renderFile(__dirname + "/hackathon.ejs", {
            name: team.name,
            members: users
        }, (err, data) => {
            if (err) throw err;

            const mailOptions = {
                from: `SACI IFSUL <${process.env.SACI_MAIL_ADDR}>`, // sender address
                to: member.email, // list of receivers
                subject: 'Hackathon SACI 2019', // Subject line
                html: data, // plain text body
            };

            transporter.sendMail(mailOptions, function (err, info) {
                if (err)
                    console.log(err)
                else
                    console.log(info);
            });
        })
    }

    return res.json({
        message: 'Time inscrito no hackathon',
        data: { ...team, id: doc._id }
    }, 200)


    // //teste
    // res.json(dados)

});

/**
 * WORKSHOP ROUTES
 */

// lista oficinas
router.get('/workshops', async (req, res) => {
    let workshops = await Workshop.find({ event: EVENT_ID })
        .select('-event -__v -createdAt -updatedAt')
        .populate([{
            path: 'speakers',
            select: 'name bio -_id'
        }, {
            path: 'enrolleds.user',
            select: 'name -_id'
        }]).exec();

    res.json(workshops, 200)
})

router.get('/workshops/:id', [
    param('id', 'Identificador inválido!').isMongoId(),
], async (req, res) => {
    let errors = validationResult(req).errors

    if (errors.length != 0) {
        return res.json({
            errors: errors.map(e => e.msg)
        }, 400)
    }

    let workshop = await Workshop.findById(req.params.id)
        .select('-__v -createdAt')
        .populate([{
            path: 'speakers',
            select: 'name bio'
        }, {
            path: 'enrolleds.user',
            select: 'name'
        }]).exec();

    if (!workshop) {
        return res.json({
            errors: ['Oficina não encontrada!']
        }, 404)
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
        res.json(
            doc.map(e => {
                return {
                    id: e._id,
                    name: e.name
                }
            })
            , 200);
    }).catch(err => {
        res.json({
            errors: ["Ocorreu um problema!"]
        }, 500);
    })
});

// ! remove produção
// router.get('/limpaEnroll', (req, res) => {
//     if (req.query.token == 'aw0oerakw3')
//         Event.findByIdAndUpdate(EVENT_ID, { enrolleds: [] }).then(doc => {
//             Enrollment.remove({ event: EVENT_ID }).exec()
//             res.json(doc)
//         })
//     res.json({})
// })

// router.get('/reseta', async (req, res) => {
//     if (req.query.token == 'aw0oerakw3')
//         await Hackathon.findByIdAndUpdate(HACKATHON, { teams: [] }).exec()
//     res.json({})
// })

const formataCPF = (cpf) => {
    return cpf.length == 11 
            ? ''.concat(cpf.slice(0,3), '.', cpf.slice(3,6), '.', cpf.slice(6,9), '-', cpf.slice(9,11)) 
            : cpf
}

// exporta o router
module.exports = router;