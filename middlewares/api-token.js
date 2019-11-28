const Event = require('../services/event')

module.exports = async (req, res, next) => {

    let event = req.params.id

    try {
        let config = await Event.getApiConfig(event)

        if (req.headers.authorization == 'Bearer '.concat(config.token)) {
            return next()
        }
        
        throw 'Rota não permitida'

    } catch (e) {
        return res.status(400).json({ errors: [e] })
    }
}
