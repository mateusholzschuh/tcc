const User = require('../models/user.model')
const Event = require('../models/event.model')
const UserEvent = require('../models/user-event.model')

const { RoleName } = require('../utils/roles')
/**
 * Mostra pagina de login
 */
exports.getHome = async (req, res, next) => {
    let user = req.session.user

    let _u = await User.findById(user).exec()
    let isAdmin = _u.role > 0

    let ues = []

    if (isAdmin) {
        ues = await Event.find({}).select('name').exec()
        ues = ues.map(el => {
            el.event = el
            return el
        })
    }
    else {
        ues = await UserEvent.find({ user }).populate('event', 'name').exec()
    }

    ues = ues.map(el => {
        el.role = RoleName(el.role) || '---'
        return el
    })

    // return res.end(JSON.stringify(ues, null, 2))

    return res.render('index/index', {
        title: 'Inicial',
        gridstack: true,
        ues
    })
}
