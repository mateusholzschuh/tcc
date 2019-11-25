const Event = require('../../../models/event.model')

/**
 * Permite prosseguir se o evento não está finalizado
 */
exports.isNotFinished = async (req, res, next) => {
    let { id } = req.params
    let event = await Event.findById(id).select('finished')

    if (!event.finished || req.user.isAdmin) {
        return next()
    }
    
    return res.status(500).json({ errors: ['Ops! Evento já está finalizado!'] })
}