const Lecture = require('../models/lecture.model')
const EventService = require('./event')
const CertificateService = require('./certificate')

const createOne = async (lecture, event) => {
    // create the lecture
    let doc = await Lecture.create(lecture)    
    await EventService.updateOne({ _id: event }, { '$push': { 'lectures': doc._id } })

    // generate certificates
    let certificates = []
    doc.speakers.forEach(e => {
        certificates.push({
            user: e,
            event,
            lecture: doc._id,
            type: 'lecture'
        })
    })

    // async insert into db
    CertificateService.create(certificates)

    return doc
}

module.exports = Object.assign(Lecture, { createOne })
