const Workshop = require('../models/workshop.model')
const EventService = require('./event')
const CertificateService = require('./certificate')
const User = require('../models/user.model')
const UserEvent = require('../models/user-event.model')

const mailer = require('../utils/mail-transporter')

const createOne = async (workshop, event) => {
    // create the workshop
    let doc = await Workshop.create(workshop)    
    await EventService.updateOne({ _id: event }, { '$push': { 'workshops': doc._id } })

    // generate certificates
    let certificates = []
    doc.speakers.forEach(e => {
        certificates.push({
            user: e,
            event,
            workshop: doc._id,
            type: 'workshop'
        })
    })

    // async insert into db
    CertificateService.create(certificates)

    // generate credentials and send by mail
    doc.speakers.forEach(async e => {
        let ue = {
            user: e,
            event,
            role: 'speaker'
        }
    
        let u = await User.findById(e)
    
        let password = Math.random().toString(36).slice(-8)
    
        if (u) {
            u.role = 1              // enable login
            u.password = password   // set a new password to login
            u.save()                // save changes
        }
    
        //send mail
        let template = 
    `<h1> Olá ${u.name}!</h1>
    <p>Sua senha de acesso ao sistema é:</p>
    <p><strong>Email:</strong> ${u.email}</p>
    <p><strong>Senha:</strong> ${password}</p>
    <br>
    `    
        mailer.sendMail({
            from: 'IF Eventos <>',
            to: u.email,
            subject: 'Credenciais de acesso ao sistema',
            html: template
        })
    
    
        await UserEvent.create(ue)

    })

    return doc
}

const enroll = async (workshop, user) => {
    let doc = await Workshop.findByIdAndUpdate(workshop, { '$push': { 'enrolleds': { user: user } } })

    return doc
}

module.exports = Object.assign(Workshop, { createOne, enroll })
