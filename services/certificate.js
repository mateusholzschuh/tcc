const Certificate = require('../models/_certificate.model')
const Event = require('../models/event.model')

const { createReadStream } = require('fs')
const { createModel, createBucket } = require('mongoose-gridfs')
const createReport = require('docx-templates')
const moment = require('moment')

const connection = require('mongoose').connection

let Template = {}
connection.on('connected', () => {
    Template = createBucket({ bucketName: 'CertTemplates', connection })
})

/**
 * Faz upload do template para o MongoDB
 * @param {Express.Multer.File} file Representação do arquivo de template
 * @param {ObjectId} event Id do evento
 */
const uploadTemplate = async (files, event) => {
    if (!files) throw 'Arquivos inválido'
    if (!event) throw 'Evento inválido'
    if (await Event.findById(event).countDocuments() == 0) throw 'Evento não encontrado'

    files.forEach(file => {
        console.log('----')
        console.log(file)
        let options = {
            filename: file.filename,
            contentType: file.mimetype
        }
    
        let stream = createReadStream(file.path)

        Template.writeFile(options, stream, async (error, fileA) => {
            if (error) throw error
    
            let type = file.type
            let path = 'templates.'.concat(type)

        console.log(file)

            let update = {
                $set : {
                    [path]: fileA.filename
                }
            }
    
            let e = await Event.findById(event)
    
            // unlink previous template
            if(e.templates[type]) {
                Template.findOne({ filename: e.templates[type] }, (err, fileB) => {
                    if (err) console.error(err)
                    // ensure that file exists
                    if (fileB) {
                        Template.deleteFile(fileB._id, (err, result) => {
                            if (err) console.log(err)
                        })
                    }
                })
            }
    
            await e.updateOne(update)
    
            return file
        })
    })
    return true;
    // return Template.writeFile(options, stream, async (error, file) => {
    //     if (error) throw error

    //     let update = {
    //         $set : {
    //             'templates.certificate': file.filename
    //         }
    //     }

    //     let e = await Event.findById(event)

    //     // unlink previous template
    //     if(e.templates.certificate) {
    //         Template.findOne({ filename: e.templates.certificate }, (err, file) => {
    //             if (err) console.error(err)
    //             Template.deleteFile(file._id, (err, result) => {
    //                 if (err) console.log(err)
    //             })
    //         })
    //     }

    //     await e.updateOne(update)

    //     return file
    // })
}

/**
 * Retorna o endereço para o arquivo do certificado gerado
 * @param {String} key Chave de autenticidade do certificado
 */
const downloadCertificate = async (key) => new Promise(async (resolve, reject) => {
    let certificate = await Certificate.findOne({ key })
                            .populate('user', 'name cpf')
                            .populate('event', 'name location hours startDate finishDate templates')
                            .populate('lecture', 'name hours date')
                            .populate('workshop', 'name hours date')

    if (!certificate) {
        return reject('Certificado não encontrado!')
    }

    // base data
    let dados = {
        nome: certificate.user.name || certificate.name,
        cpf: certificate.user.cpf || certificate.cpf,
        key: certificate.key,
        evento: {
            nome: certificate.event.name,
            horas: certificate.event.hours,
            local: certificate.event.location,
            dataInicio: moment(certificate.event.startDate).format('DD/MM/YYYY - HH:mm'),
            dataFim: moment(certificate.event.finishDate).format('DD/MM/YYYY - HH:mm')
        }
    }

    // additional for lecture
    if (certificate.type == 'lecture') {
        dados['palestra'] = {
            nome: certificate.lecture.name,
            data: moment(certificate.lecture.date).format('DD/MM/YYYY - HH:mm'),
            carga: certificate.lecture.hours,
        }
    }

    // additional for workshop or enrolled (workshop)
    if (certificate.type == 'workshop' || certificate.type == 'wenrolled') {
        dados['workshop'] = {
            nome: certificate.workshop.name,
            data: moment(certificate.workshop.date).format('DD/MM/YYYY - HH:mm'),
            carga: certificate.workshop.hours,
        }
    }

    let template = certificate.event.templates[certificate.type]
    let filename = 'tmp/'.concat(Date.now(), '.docx')

    getTemplate(template).then(async buffer => {
        // generate dynamic file
        await createReport({
            output: filename,
            template:buffer,
            cmdDelimiter: ['{', '}'],
            additionalJsContext: dados,
            processLineBreaks: true,
            noSandbox: false,
        })        
        resolve(filename)
    })
    .catch(error => reject(error))
})

/**
 * Retorna um Buffer do template
 * @param {String} filename Nome do arquivo gravado no MongoDB
 */
const getTemplate = (filename) => new Promise((resolve, reject) => {
    Template.readFile({ filename: filename }, (err, buffer) => {
        if (err) {
            return reject(err)
        }
        return resolve(buffer)
    })
})

module.exports = Object.assign(Certificate, { uploadTemplate, downloadCertificate, getTemplate })
