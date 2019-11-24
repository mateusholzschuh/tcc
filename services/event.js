const Event = require('../models/event.model')
const Enrollment = require('../models/enrollment.model')
const Certificate = require('../models/_certificate.model')
const User = require('../models/user.model')
const Lecture = require('../models/lecture.model')
const Workshop = require('../models/workshop.model')

const isEnrolled = async (user, event) => {
    let count = await Enrollment.findOne({ user, event }).countDocuments()
    return count === 1
}

const enroll = async (_user, _event) => {
    let event = await Event.findOne({_id:_event})
    if (!event) throw 'Evento não encontrado'
    
    let user = await User.findOne({ cpf: _user.cpf })
    if (user) {
        if (await isEnrolled(user, event))
            throw 'Usuário já está inscrito'

        await User.updateOne({ _id:user._id }, user)

    } else {
        user = await User.create(_user)
    }

    let enrollment = {
        user,
        event
    }

    let ticket = await Enrollment.create(enrollment)
    await Event.updateOne({ event }, {'$push': { 'enrolleds': ticket._id }})

    // send mail

    // gen certificate
    Certificate.create({
        user,
        event,
        name: user.name,
        cpf: user.cpf
    })

    return {
        message: 'Inscrito com sucesso',
        data: {
            name: user.name,
            email: user.email,
            cpf: user.cpf,
            code: ticket.code,
            qrcode: `http://api.qrserver.com/v1/create-qr-code/?color=000000&bgcolor=FFFFFF&data=${ticket._id}&qzone=1&margin=0&size=200x200&ecc=L`
        }
    }  
}

const checkEnroll = async (user, event) => {
    let u = await User.findOne({ cpf: user.cpf }).select('name cpf email')
    let ticket = await Enrollment.findOne({ user: u, event }).select('code user event')

    if (u && ticket) {
        ticket = {
            name: u.name,
            email: u.email,
            cpf: u.cpf,
            code: ticket.code,
            qrcode: `http://api.qrserver.com/v1/create-qr-code/?color=000000&bgcolor=FFFFFF&data=${ticket._id}&qzone=1&margin=0&size=200x200&ecc=L`
        }
        return ticket
    } else {
        throw 'Usuário não inscrito'
    }

}

const getLectures = async (event) => {
    return await Lecture.find({ event }).select('name date description confirmed location speakers')
        .populate('speakers', '-_id name institution instituicao')
}

const getWorkshops = async (event) => {
    return await Workshop.find({ event }).select('name description date confirmed speakers limit location')
        .populate('speakers', '-_id name institution instituicao')
}

const getWorkshop = async (workshop, event) => {
    return await Workshop.findOne({ _id: workshop, event }).select('name description date confirmed speakers limit location enrolleds')
        .populate([{
            path:'speakers',
            select: '-_id name institution instituicao'
        },{
            path: 'enrolleds.user',
            select: 'name email cpf institution instituicao'
        }])
}

const getEnrolleds = async (event) => {
    return await Enrollment.find({ event }).select('user code')
        .populate({
            path: 'user',
            select: '-_id name institution instituicao cpf email',
            populate: {
                path: 'institution',
                select: '-_id name'
            }
        })
}

const getApiConfig = async (event) => {
    let e = await Event.findOne({ _id: event }).select('api')
    
    if (e && e.api)
        return e.api
    else
        throw 'Evento não encontrado'
}

module.exports = Object.assign(Event, { enroll, checkEnroll, getLectures, getWorkshops, getWorkshop, getEnrolleds, getApiConfig })
