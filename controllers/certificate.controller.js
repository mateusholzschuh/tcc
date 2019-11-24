const Event = require('../models/event.model')
const Enrollment = require('../models/enrollment.model')
const Certificate = require('../models/_certificate.model')

const CertificateService = require('../services/certificate')

const fs = require('fs')
const path = require('path')
const multer = require('multer')
const moment = require('moment')
const createReport = require('docx-templates')

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

/**
 * Mostra a página de configurações
 */
exports.index = async (req, res, next) => {
    let event = await Event.findOne({ _id: req.params.id }).select('templates').exec()

    return res.render('events/event/certificates/index', {
        title: 'Certificados',
        message: req.flash('message'),
        error: req.flash('error'),
        template: event.templates || { templates: {} }
    })
}


/**
 * Mostra a página com os inscritos [opção de ver o certificado]
 */
exports.list = async (req, res, next) => {
    let event = req.params.id
    let generatedYet = await Certificate.find({event}).countDocuments()

    if (!generatedYet) {
        req.flash('error', 'Primeiro você deve gerar os certificados!')
        return res.redirect('../certificates')
    }

    let list = await Enrollment.find({event}).select('code user').populate('user', 'name email cpf instituicao institution').exec()

    return res.render('events/event/certificates/list', {
        title: 'Lista de Certificados',
        list
    })
}

// !!! TODO: REVER!!!!!!!
/**
 * Gerar os certificados dos inscritos [no evento]
 */
exports.generate = async (req, res, next) => {
    let event = req.params.id
    let enrolleds = await Enrollment.find({event}).populate('user', 'name cpf')
    let generatedYet = await Certificate.find({event}).countDocuments()

    if (generatedYet) return res.redirect('../certificates/list')

    enrolleds.forEach(async e => {
        await Certificate.create({
            event,
            user: e.user,
            name: e.user.name,
            cpf: e.user.cpf
        })
    })

    return res.redirect('../certificates/list')
}

// TODO: REVER!
/**
 * Faz upload do template
 * [tmp/ --> mongodb]
 */
exports.uploadTemplate = (req, res, next) => {
    upload(req, res, async (err) => {
        if (err) return res.json({error:true, m: err})

        let event = req.params.id

        try {
            await CertificateService.uploadTemplate(req.file, event)
            req.flash('message', 'Modelo de certificado atualizado com sucesso')
            fs.unlinkSync(req.file.path)
        } catch(e) {
            console.error(e)
            req.flash('error', 'Ocorreu um erro ao atualizar! Tente novamente')
        }

        res.redirect('../certificates')
    })
}

/**
 * Retorna um exemplo do certificado, com dados fictícios, para poder testar
 * e ter uma prévia de como ficará.
 */
exports.downloadExample = async (req, res, next) => {
    let event = await Event.findById(req.params.id).select('templates')

    const template = await CertificateService.getTemplate(event.templates.certificate)

    let tempFilename = 'tmp/'.concat(Date.now(),'.docx')

    await createReport({
        output: tempFilename,
        template,
        cmdDelimiter: ['{', '}'],
        additionalJsContext: {
            nome: 'Alahor',
            cpf: '01010101010',
            key: 'açlsdkfjJk89asdnca3',
            evento: {
                nome: event.name,
                horas: event.hours,
                local: event.location,
                dataInicio: moment(event.startDate).format('DD/MM/YYYY - HH:mm'),
                dataFim: moment(event.finishDate).format('DD/MM/YYYY - HH:mm')
            }
        },
        processLineBreaks: true,
        noSandbox: false,
    })

    setTimeout(() => {
        fs.unlinkSync(path.join(__dirname, '..', tempFilename))
    }, 15000)

    return res.download(path.join(__dirname, '..', tempFilename), 'exemplo-'.concat(tempFilename.replace('tmp/', '')))
}

/**
 * Faz o download do template de certificado do evento
 */
exports.downloadModel = async (req, res, next) => {
    let event = await Event.findById(req.params.id).select('templates')

    let buffer = await CertificateService.getTemplate(event.templates.certificate)

    res.setHeader('Content-Disposition', 'attachment; filename=modelo.docx');
    return res.send(buffer)
}

/**
 * Faz o download do certificado com base no user_id e event_id [area administrativa]
 */
exports.see = async (req, res, next) => {
    let certificate = await Certificate.findOne({user:req.params.user, event: req.params.id})

    const filename = await CertificateService.downloadCertificate(certificate.key)

    // remove temporary file
    setTimeout(() => {
        fs.unlinkSync(path.join(__dirname, '..', filename))
    }, 15000)

    return res.download(path.join(__dirname, '..', filename), 'certificado-'.concat(certificate.key, '.docx'))
}

/**
 * Mostra formulário para validar um certificado
 */
exports.showValidate = (req, res) => {
    return res.render('events/event/certificates/public-validate', {
        title: 'Validar Certificado',
        message: req.flash('message'),
        error: req.flash('error'),
        download: req.flash('download')
    })
}

/**
 * Recebe a chave (key) do certificado e valida ele.
 * Se ele existe, ele será baixado, caso contrário uma mensagem de erro é enviada.
 */
exports.postValidate = async (req, res) => {
    let { key } = req.body

    try {
        let cert = await Certificate.findOne({ key })
        if (!cert) throw 'e'

        req.flash('message', 'Certificado Válido de <strong>' + cert.name + '</strong>')
        req.flash('download', cert.key)
        
    } catch (e) {
        req.flash('error', 'Certificado Inválido')
    }

    return res.redirect('/validar-certificado')
}

/**
 * Rota pública para baixar o certificado
 */
exports.download = async (req, res, next) => {
    let key = req.params.key

    try {
        if (await Certificate.findOne({ key }).countDocuments() == 0)
            throw 'Certificado não econtrado'
    } catch (e) {
        return res.end(e)
    }

    const filename = await CertificateService.downloadCertificate(key)

    setTimeout(() => {
        fs.unlinkSync(path.join(__dirname, '..', filename))
    }, 15000)

    return res.download(path.join(__dirname, '..', filename), 'certificado-'.concat(key, '.docx'))
}

/**
 * Mostra um formulário para exibir os certificados associados ao cpf enviado
 */
exports.showCertificates = (req, res) => {
    return res.render('events/event/certificates/public-show', {
        title: 'Ver Certificados',
        message: req.flash('message'),
        error: req.flash('error')
    })
}

/**
 * Recebe o CPF e retorna os certificados associados a ele
 */
exports.postCertificates = async (req, res) => {
    let { cpf } = req.body

    try {
        let certificates = await Certificate.find({ cpf }).populate('event', 'name')
        
        if (!certificates)
            throw 'Oops! Ocorreu um erro'

        if (certificates.length == 0)
            throw 'Oops! Você ainda não tem certificados! :/'

        certificates = certificates.map(c => {
            c._doc.createdAt = moment(c.createdAt).format('DD[/]MM[/]YYYY')
            return {
                ...c._doc
            }
        })

        certificates = certificates.reverse()

        return res.render('events/event/certificates/public-show', {
            title: 'Ver Certificados',
            message: req.flash('message'),
            error: req.flash('error'),
            certificates
        })
        
    } catch (e) {
        req.flash('error', e)
        return res.redirect('/ver-certificados')
    }
}
