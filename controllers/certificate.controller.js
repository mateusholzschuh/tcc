const User = require('../models/user.model')
const Event = require('../models/event.model')
const Enrollment = require('../models/enrollment.model')
const { createModel } = require('mongoose-gridfs')
const multer = require('multer')

const moment = require('moment')

/**
 * Mostra a pagina com a listagem das inscrições
 */
exports.index = async (req, res, next) => {
    let event = await Event.findOne({ _id: req.params.id }).select('templates').exec()

    return res.render('events/event/certificates/index', {
        title: 'Certificados',
        template: event.templates || { templates: {} }
    })
}

/**
 * Mostra formulário para nova inscrição no evento
 */
exports.create = (req, res) => {
    return res.render('events/event/enrolleds/add', {
        title: 'Nova inscrição'
    })
}

/**
 * Função responsável por salvar a inscrição no evento
 */
exports.store = async (req, res, next) => {
    let event = req.params.id
    let form = { name, email, cpf, birthdate, institution } = req.body

    // busca usuário
    let user = await User.findOne({ cpf: form.cpf }).select('_id').exec()

    // se não existe, cria
    if (!user) {
        user = await User.create({
            name,
            email,
            cpf,
            birthdate: moment(birthdate, 'DD/MM/YYYY'),
            instituicao: institution,
        })
    }

    // instancia inscrição
    let enrollment = {
        user,
        event
    }

    // salva inscrição
    Enrollment.create(enrollment).then(r => {
        // insere inscrição no evento
        Event.updateOne({ _id: event }, { '$push': { 'enrolleds': r._id } }).then(ok => {
            return res.redirect('../enrolleds')
        })
    }).catch(e => {
        console.error(e)
        next()
    })
}

/**
 * Função responsável por deletar inscrição //! Não deve ser usada em produção
 */
exports.destroy = (req, res, next) => {
    Event.findByIdAndUpdate(req.params.id, { '$pull': { 'enrolleds': req.params.enroll } }).exec().then(doc => {
        Enrollment.findByIdAndDelete(req.params.enroll).then(doc => {
            return res.redirect('..')
        })
    })
}

const path = require('path')

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'tmp/')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})

var upload = multer({ //multer settings for single upload
    storage
}).single('file');

exports.uploadTemplate = (req, res, next) => {
    upload(req, res, async (err) => {
        if (err) return res.json({error:true, m: err})

        let event = req.params.id
        let update = {
            templates : {
                certificate: req.file.filename
            }
        }

        await Event.findOneAndUpdate({ _id: event }, update)

        res.redirect('../')
    })

}

const createReport = require('docx-templates')
const fs = require('fs')

exports.downloadExample = async (req, res, next) => {
    let event = await Event.findById(req.params.id).select('name hours location startDate finishDate templates')

    const template = fs.readFileSync('tmp/' + event.templates.certificate)

    let filename = 'tmp/'.concat(Date.now(),'.docx')

    const buffer = await createReport({
        output: filename,
        template,
        cmdDelimiter: ['{', '}'],
        additionalJsContext: {
            nome: 'DEAD HLZ',
            evento: {
                nome: event.name,
                horas: event.hours,
                local: event.location,
                dataInicio: event.startDate,
                dataFim: event.finishDate
            }
        },
        processLineBreaks: true,
        noSandbox: false,
    })

    console.log(filename)
    console.log()

    // docxpdf(filename, pdf, (err, result) => {
    //     if (err) {
    //         console.error(err)
    //         return next()
    //     }

    //     console.log(result)
    //     res.sendFile(result.filename)
    // })
    setTimeout(() => {
        fs.unlinkSync(path.join(__dirname, '..', filename))
    }, 15000)

    res.download(path.join(__dirname, '..', filename), 'exemplo-'.concat(filename.replace('tmp/', '')))

}
