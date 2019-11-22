const Event = require('../services/event')

const permissions = ['global','enroll','check','getLectures','getWorkshops','getEnrolleds']

/**
 * @param {'global'|'enroll'|'check'|'getLectures'|'getWorkshops'|'getEnrolleds'} action
 */
module.exports = (action) => {

    return async (req, res, next) => {

        if (!permissions.includes(action)) return res.status(500).json({ errors: ['Wrong permission'] })

        let event = req.params.id
    
        try {
            let config = await Event.getApiConfig(event)
    
            if (config.global && config[action]) {
                return next()
            }

            switch (action) {
                case 'enroll':
                    throw 'Inscrições encerradas'
                    break
                default:
                    throw 'Rota não permitida'
            }
    
        } catch (e) {
            return res.status(400).json({ errors: [e] })
        }
    }
}
