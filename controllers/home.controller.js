const UserEvent = require('../models/user-event.model')

const { RoleName } = require('../utils/roles')
/**
 * Mostra pagina de login
 */
exports.getHome = async (req, res, next) => {
    let user = req.session.user

    let ues = await UserEvent.find({ user }).populate('event', 'name').exec()

    ues = ues.map(el => {
        el.role = RoleName(el.role)
        return el
    })

    // return res.end(JSON.stringify(ues, null, 2))

    return res.render('index/index', {
        title: 'Inicial',
        gs: true,
        ues
    })
}
