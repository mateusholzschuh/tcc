const roles = []
roles['coordinator'] = 'Coordenação Geral'
roles['accreditation'] = 'Credenciamento'
roles['organization'] = 'Apoio/Organização'
roles['speaker'] = 'Palestrante'

exports.RoleName = (id) => {
    return roles[id] ? roles[id] : null
}

/**
 * @param {'coordinator'|'accreditation'|'organization'|'speaker'} role
 */
exports.HasPermission = async (role, user, event) => {
    if (user.isAdmin) return true;
    if (role == null) return false;
    
    let x = await require('../models/user-event.model').findOne({ user, event, role }).countDocuments();

    return x == 1
}