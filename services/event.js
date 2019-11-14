const Event = require('../../models/event.model')

const enroll = async (user, event) => {
    let e = await Event.findOne(event).exec()

    if (!e) return { errors: ['Evento não encontrado']}

}

module.exports = Object.assign(Event, { enroll })
