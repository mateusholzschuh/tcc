const Event = require('../services/event')

module.exports = async (req, res, next) => {

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
