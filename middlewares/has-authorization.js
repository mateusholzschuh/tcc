const User = require('../models/user.model')
const { HasPermission } = require('../utils/roles')

/**
 * @param {'coordinator'|'accreditation'|'organization'|'speaker'} role
 */
module.exports = (role, user, event) => {
    return (req, res, next) => {
        user = req.session.user || user
        event = req.params.id || event
        HasPermission(role, user, event).then(result => {
            if(result)
                return next()
            else
                return res.redirect('./')
        })
    }
}